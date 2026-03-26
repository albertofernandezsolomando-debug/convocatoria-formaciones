# Calendario Accionable + Asistencia Rápida — Design Spec

> Two focused improvements: turn the calendar detail panel into an action hub, and add quick-entry tools for attendance recording.

**Goal:** Reduce the manual steps between "seeing what's coming" and "acting on it" (calendar), and between "having attendance data" and "recording it" (attendance).

**Scope:** Logic + UI. All changes in `convocatoria.html`.

---

## Feature 1: Calendario Accionable

### Problem

The calendar detail panel (`showCalDetail`, line 22898) is read-only. To change estado, edit participants, or launch a convocatoria, the user must click "Ver en catálogo", navigate to the action, make changes, then return to the calendar. Three context switches for one decision.

### Current State

- `showCalDetail(item)` renders info-only HTML in `#calDetail` panel (line 22898-22953)
- Panel shows: nombre, período, estado (text), modalidad, horas, participantes (count only), departamento, centro, tutor, bonificable
- One action: "Ver en catálogo →" link → `navigateToAction(code)`
- The `item` object contains: `codigo`, `nombre`, `estado`, `departamento`, `modalidad`, `fechaInicio`, `fechaFin`, `participantes` (NIF array), `horas`, `centroVinculado`, `tutorVinculado`, `bonificable`, `rawInicio`, `rawFin`

### Design

Replace the read-only panel content with an actionable version. The panel keeps its current position and styling. Changes are purely to `showCalDetail()` internals.

#### A. Estado dropdown

Replace the static estado text with a `<select>` dropdown.

- Options: Planificada, Pendiente, Buscando, En preparación, Convocada, En marcha, Terminada, Anulada, Retrasada, Finalizada, Cancelada (all values from `CAL_ESTADO_COLORS` — some records may have legacy estados)
- Pre-selected: current estado (if the value doesn't match any option, show it as-is)
- `change` handler:
  1. Read new value
  2. Load full record via `getCatalog('acciones').find(a => a.codigo === item.codigo)`
  3. If estado actually changed:
     - Push audit note to `record.notas` (init if absent): `if (!record.notas) record.notas = []; record.notas.push({ id: Date.now(), date: new Date().toISOString(), tag: 'sistema', text: 'Estado: [old] → [new] (desde calendario)' })`
     - Update `record.estado`
     - Save via `upsertCatalogRecord('acciones', 'codigo', record)`
     - Update `item.estado` locally
     - Update bar color in Gantt: find `.cal-bar[data-codigo="X"]`, change background
     - Update estado dot color in panel
     - Show toast: "Estado actualizado: [new]"
  4. No full calendar re-render needed — just update the bar and panel visuals

#### B. Participantes section

Replace the static count with a list + edit button.

- Show participant names (resolved from `state.employees` by NIF, fallback to NIF if organigrama not loaded)
- Max 5 visible, then "+N más" collapse
- "Editar" button (class `link-btn link-add u-text-11`) opens `showParticipantPicker(currentNIFs, onSave)` (already exists at line 9697)
- `onSave` callback:
  1. Load full record via catalog
  2. Compute diff: `addedNIFs` = in new but not old, `removedNIFs` = in old but not new
  3. Update `record.participantes = newNIFs`
  4. Sync attendance `registro`:
     - For each added NIF: `record.asistencia.registro[nif] = new Array(record.asistencia.sesiones.length).fill(false)`
     - For each removed NIF: `delete record.asistencia.registro[nif]`
     - Also clean up `record.confirmaciones[nif]` and `record.asistencia.registro[nif]` for removed NIFs
  5. Save via `upsertCatalogRecord`
  5. Update `item.participantes` locally
  6. Re-render the participantes section in the panel (not the full panel)
  7. Update participantes count in Gantt table row
  8. Show toast

#### C. "Convocar" button

A primary button at the bottom of the panel.

- **Precondition**: `state.employees.length > 0` (organigrama loaded). If not, show toast: "Carga el organigrama para poder convocar" and return.
- On click:
  1. Extract the precarga logic from lines 13538-13581 into a reusable function: `preloadConvocatoriaFromAccion(codigo)`
  2. This function:
     - Loads the acción from catalog
     - Clears filters
     - Sets `excludedNIFs` to exclude everyone NOT in `participantes`
     - Fills event form (title, modalidad → Teams/presencial, formador from tutor)
     - Saves state
  3. Switch to Convocatoria tab via `applyTabChange('tabConvocatoria')`
  4. Call `renderFilters()` + `renderTable()`
  5. Show toast: "Datos de [nombre] cargados (N participantes). Completa fecha y sala."

- The existing `btnLoadFromAccion` handler (line 13495) should be refactored to also call `preloadConvocatoriaFromAccion(codigo)` instead of duplicating the logic.

#### D. "Ver en catálogo" link

Stays as-is. Moved below the action buttons.

### Panel layout

```
┌─────────────────────────────────────────┐
│ ● Nombre de la acción              [✕] │
│                                         │
│ Período    15 mar 2026 → 20 mar 2026    │
│ Estado     [▼ En preparación]           │
│ Modalidad  Presencial                   │
│ Horas      16h                          │
│ Depto.     Comercial                    │
│ Centro     Madrid Sede                  │
│ Tutor      Juan García                  │
│                                         │
│ Participantes (12)          [Editar]    │
│  Ana López                              │
│  Carlos Ruiz                            │
│  María Santos                           │
│  Pedro Fernández                        │
│  Laura Martín                           │
│  +7 más                                 │
│                                         │
│ [Convocar]              Ver en catálogo │
└─────────────────────────────────────────┘
```

### Edge cases

| Case | Handling |
|---|---|
| No organigrama loaded | Participantes show as NIFs. "Convocar" shows warning toast and does nothing. "Editar" still works (showParticipantPicker handles this). |
| Action has 0 participants | "Convocar" shows toast: "La acción no tiene participantes vinculados". Participantes section shows empty state. |
| Terminal estado (Terminada/Anulada) | Dropdown still works (user may need to revert). No special treatment. |
| Multiple calendar selections | Panel replaces content on each new selection. No concurrency issue. |
| User changes estado then clicks Convocar | Both save independently. Estado change saved on dropdown change, convocatoria precarga reads fresh catalog data. |

---

## Feature 2: Asistencia Rápida

### Problem

Recording attendance is checkbox-by-checkbox. With 30 participants and 5 sessions, that's 150 manual clicks. The primary data source is a physical sign-in sheet — no file to import.

### Current State

- Attendance UI in `renderAsistenciaHtml()` (line 8375-8458)
- Data model: `{ sesiones: ['YYYY-MM-DD', ...], registro: { nif: [true, false, ...] } }`
- Event handlers in `bindAsistenciaEvents(record)` (line 9053)
- Per-session toggle-all checkbox exists (line 8411, handler at 9142)
- Attendance saves via `upsertCatalogRecord('acciones', 'codigo', record)` on each change

### Design

Add a "Registro rápido" panel above the attendance table, inside the existing attendance section.

#### A. "Todos presentes" per session (enhancement)

The existing toggle-all checkbox is tiny and labeled just "todos". Enhance it:

- Add a visible button next to each session header: `Icons.check(14)` icon button with `title="Marcar todos presentes"` (class `link-btn u-text-accent`)
- Clicking it marks ALL participants present for that session (same logic as toggle-all checked)
- If all are already present, clicking it clears all (toggle behavior, same as current)
- The existing toggle-all checkbox stays for consistency

#### B. "Registro rápido" inline panel

A collapsible panel triggered by a button "Registro rápido" above the attendance table. Generated inside `renderAsistenciaHtml()` as part of the returned HTML string, placed between the "Añadir sesión" row and the sessions table.

**UI:**
```
[Registro rápido ▾]
┌─────────────────────────────────────────────────┐
│ Sesión: [▼ 15/03/2026]                          │
│                                                   │
│ Modo: (●) Marcar ausencias  ( ) Marcar presentes │
│                                                   │
│ Escribir o pegar nombres/NIFs (uno por línea     │
│ o separados por coma):                           │
│ ┌───────────────────────────────────────────┐    │
│ │                                           │    │
│ │                                           │    │
│ └───────────────────────────────────────────┘    │
│                                                   │
│ [Aplicar]                                        │
└─────────────────────────────────────────────────┘
```

**Default mode: "Marcar ausencias"** — because the common case with sign-in sheets is "almost everyone attended, a few were absent." In this mode:
1. All participants are marked present for the selected session
2. Only the listed names/NIFs are marked absent

**"Marcar presentes" mode** — for when the user has a partial list (Teams/Zoom report, or a short sign-in sheet):
1. All participants are marked absent for the selected session
2. Only the listed names/NIFs are marked present

**Matching logic:**
1. Split input by commas, semicolons, or newlines
2. Trim whitespace from each token
3. Skip empty tokens
4. For each token, try in order:
   a. Exact NIF match against `record.participantes`
   b. Exact full name match (case-insensitive) against resolved employee names
   c. Partial name match (contains, case-insensitive) — only if exactly one participant matches
5. If partial match is ambiguous (2+ matches), skip and report as "ambiguo"

**After apply:**
1. Update `record.asistencia.registro[nif][sessionIdx]` for each matched participant
2. Save via `upsertCatalogRecord`
3. Re-render the attendance table (reflects new checkbox states)
4. Show feedback toast: "Sesión 15/03: 28 presentes, 2 ausentes. 0 no reconocidos."
5. If unmatched tokens exist, show them in a warning: "No reconocidos: [token1, token2]"
6. Clear the text area

**Session selector:**
- Dropdown listing all existing sessions (from `record.asistencia.sesiones`), formatted as `dd/mm/yyyy`
- Pre-selects the most recent session (last in sorted array)
- If no sessions exist, the panel shows: "Añade una sesión primero"

### Edge cases

| Case | Handling |
|---|---|
| No sessions exist | Panel shows "Añade una sesión primero" with disabled Apply button |
| Empty text area + Apply | In "ausencias" mode: marks everyone present, shows explicit toast "Todos marcados presentes (sin ausencias indicadas)". In "presentes" mode: shows toast "Escribe al menos un nombre o NIF" and does nothing. |
| Duplicate names in input | Deduplicate before processing |
| NIF not in participantes | Reported as "no reconocido" — only participantes of the action can be matched |
| Ambiguous partial match | Reported as "ambiguo: [token] (2 coincidencias)" — user must use full name or NIF |
| Organigrama not loaded | Name matching disabled; only NIF matching works. Toast warns: "Sin organigrama — solo se aceptan NIFs" |

---

## Bug Fix: Dashboard Attendance Monitor

### Problem

`renderAttendanceMonitor()` (line 18035+) indexes `registro[nif]` by date string (`asistNif[fecha]`), but the actual data model uses array indices. Also accesses `s.fecha` on session strings that have no `.fecha` property. The attendance dashboard charts and abandonment alerts are silently broken.

### Fix

Three changes across the function:

**1. Session mapping (line 18042-18055):**

`sesiones` is an array of date strings (`['2025-03-15', ...]`), not objects. `s.fecha` is `undefined`.

Before: `var fecha = s.fecha;` and `return { fecha: fecha, ... }`
After: use `s` directly as the date string, and pass `idx` (the map index) for array lookups.

```javascript
// Before:
var sessionData = sesiones.map(function(s) {
  var fecha = s.fecha;
  // ...
  if (asistNif && asistNif[fecha]) {
  // ...
  return { fecha: fecha, present: present, ... };

// After:
var sessionData = sesiones.map(function(s, idx) {
  // s IS the date string, no .fecha property
  // ...
  if (asistNif && asistNif[idx] === true) {
  // ...
  return { fecha: s, present: present, ... };
```

**2. Abandonment detection (lines 18059-18067):**

Same issue — `s.fecha` → use index.

```javascript
// Before:
sesiones.forEach(function(s) {
  if (asistNif && asistNif[s.fecha]) {

// After:
sesiones.forEach(function(s, idx) {
  if (asistNif && asistNif[idx] === true) {
```

**3. Remove string value checks:**

The data model only stores booleans in `registro[nif][]`. Remove checks for `'presente'` / `'Presente'` string values — they were never written and add dead code.

Apply these fixes at all occurrences within `renderAttendanceMonitor()`. Downstream code that reads `sessionData[i].fecha` will work correctly once `fecha` is set to `s` (the actual date string).

---

## What We Don't Change

- Calendar Gantt chart rendering, grouping, filtering, zoom, navigation
- Calendar table columns or sorting
- Attendance data model (`sesiones` array + `registro` object with boolean arrays)
- Attendance export functions (hoja de firmas, certificados, dossier)
- The existing "Cargar desde Acción Formativa" dialog (refactored to call shared function, behavior unchanged)
- The rest of the action detail form

## What We Fix Opportunistically

- Dashboard attendance monitor indexing bug (broken since the feature was built)
- Extract `preloadConvocatoriaFromAccion(codigo)` from inline handler to reusable function (DRY)

---

## Data Flow

```
[Calendar: click action]
  → showCalDetail(item) — enriched panel
  → Estado dropdown change:
    → load full record from catalog
    → add audit note, update estado
    → upsertCatalogRecord + update bar color + toast
  → Editar participantes:
    → showParticipantPicker(nifs, onSave)
    → onSave: update record, sync registro, save, re-render section
  → Convocar:
    → preloadConvocatoriaFromAccion(codigo)
    → applyTabChange('tabConvocatoria')
    → renderFilters + renderTable + toast

[Attendance: Registro rápido]
  → Select session + mode (ausencias/presentes)
  → Paste/type names/NIFs
  → Apply:
    → Parse input → match against participantes
    → Update registro[nif][sessionIdx] per mode
    → upsertCatalogRecord + re-render table + feedback toast
```

---

## Testing

Use `test-data.js` to populate data, then:

1. **Calendar estado**: Click action in calendar → change estado dropdown → verify bar color updates, toast shows, audit note added (check in Catálogos)
2. **Calendar participantes**: Click action → Editar → add/remove participant → verify count updates in panel and table
3. **Calendar convocar**: Click action with participants → Convocar → verify switches to Convocatoria tab with participants preselected and event form prefilled
4. **Calendar convocar without organigrama**: Clear `convocatoria_employees` → try Convocar → verify warning toast
5. **Attendance "todos presentes"**: Add session → click checkmark icon → verify all checkboxes marked
6. **Attendance "ausencias" mode**: Open Registro rápido → select session → type 2 names → Apply → verify all present except those 2
7. **Attendance "presentes" mode**: Switch mode → type 3 NIFs → Apply → verify only those 3 marked present
8. **Attendance fuzzy match**: Type partial name that matches exactly 1 participant → verify match. Type ambiguous partial → verify "ambiguo" report
9. **Dashboard attendance**: Open dashboard → verify attendance charts render with correct percentages (verifies bug fix)
