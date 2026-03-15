# TNA Overhaul — Design Spec

> Necesidades formativas vinculadas a puestos reales del organigrama, con contexto Mercer automático y exploración de competencias.

**Goal:** Transform TNA from a free-text suggestion box into a structured training needs system anchored to the organization's job architecture (636 positions with Mercer data from matching-puestos).

**Scope:** Data model, import, UI (explorador + lista + creación), conversion to acciones. All in `convocatoria.html`.

---

## Problem

The current TNA is a minimal request system (~230 lines) with 5 free-text fields (`area`, `tema`, `justificacion`, `urgencia`, `estado`). It has no connection to the organization's job structure, competencies, or employee data. Limitations:

1. **No structure**: `area` is free text — no link to actual departments or positions.
2. **No competency context**: The user must know from memory what skills each role needs. No reference data.
3. **No employee impact**: No way to know how many people a training need affects.
4. **Weak conversion**: Converting to acción loses context (only `tema` → `nombre`, `area` → `departamento`).

Meanwhile, the matching-puestos project has rich, validated data for 636+ organizational positions: skills, purpose, responsibilities, career levels, PC ranges — all mapped to the organigrama's `Puesto` field.

---

## Data sources

### Position data chain

```
Organigrama Excel (emp.Puesto)
  → Mapping Excel (Puesto en Organigrama → Puesto Evaluado)
    → Mercer description JSONs (skills, purpose, responsibilities, nivel, PC)
```

**Source files:**
- Mapping: `/Users/afs/Proyecto omega/matching-puestos/docs/mapeo-puestos-actualizado.xlsx` — 691 rows linking organigrama position names to evaluated position names, with `Puntos Totales` and `Estado Mapeo`
- Mercer descriptions: 4 JSON files (`mercer-descriptions-comercial.json`, `-marketing.json`, `-operaciones.json`, `-evaluados.json`) with ~212 positions containing skills, purpose, responsibilities, career level, PC range. Some positions appear in multiple files (e.g., a position in both `comercial.json` and `evaluados.json`). **Deduplication rule:** `evaluados.json` takes precedence (it has the richest data from the IPE evaluation process); for positions only in domain-specific files, use that file.
- Hierarchy: `puestos-hierarchy.json` — 212 positions with `reporta_a`, `area`, `carrera_mercer`, `categoria_mercer`, `excel_name`

### Coverage

- 691 positions in mapping (678 unique `Puesto en Organigrama` values)
- 544 positions marked "en uso" (`Está en uso` column = literal string `"SI"`)
- 593 evaluated (with Puntos Totales), 98 not evaluated
- ~212 positions with full Mercer descriptions (skills, purpose, responsibilities)
- Positions without Mercer descriptions still have: name, area, level from hierarchy
- ~480 positions are in the mapping but NOT in the Mercer JSONs/hierarchy — they get minimal entries

---

## Design

### A. Puestos catalog (new data layer)

A new localStorage catalog `convocatoria_puestos_catalog` holding enriched position data.

**Import mechanism:** Add a `puestos` key to the existing catalog import JSON (`fundae_import_cmi_completed.json`). The import logic already handles `proveedores`, `tutores`, `acciones`, `centros` — extend it to also load `puestos` into `convocatoria_puestos_catalog`. One file, one import.

**Also add** `convocatoria_puestos_catalog` to `BACKUP_KEYS` so it participates in export/import backup cycles.

**Data generation:** A Python script (`generate-puestos-catalog.py`) reads the mapping Excel + Mercer JSONs + hierarchy JSON and produces the catalog array. Run once offline, output goes into the import JSON.

**`nombreOrganigrama` resolution:** The mapping Excel's `Puesto en Organigrama` column is the authoritative source for all 691 rows. For the ~212 positions also in `puestos-hierarchy.json`, the hierarchy's `excel_name` field should match — but the mapping Excel takes precedence if they differ. For the ~480 positions only in the mapping (no hierarchy entry), `nombreOrganigrama` comes directly from the mapping Excel.

**Structure per position:**
```javascript
{
  "id": "director_hde_levante",              // slug (normalized, unique)
  "nombre": "Director HDE Levante-Aragon Sur", // canonical evaluated name
  "nombreOrganigrama": "Director Regional Aragón Sur", // matches emp.Puesto
  "area": "Hostelería Dirección",
  "nivelCarrera": "M4",                       // Mercer career level
  "pcRange": [53, 57],                        // Position Class range
  "purpose": "Dirigir la estrategia y operativa comercial del canal Horeca...",
  "skills": [
    "Dirección de equipos comerciales",
    "Negociación con clientes Horeca",
    "Planificación comercial territorial"
  ],
  "responsibilities": [                        // all available (1-5 typically), with percentages
    { "description": "Definir y ejecutar el plan comercial anual...", "percentage": 30 },
    { "description": "Liderar y desarrollar al equipo de delegados...", "percentage": 25 },
    { "description": "Gestionar la relación con clientes clave...", "percentage": 20 }
  ],
  "puntosTotales": 577,                       // IPE total points (if evaluated)
  "enUso": true                               // from mapping "Está en uso"
}
```

Positions without full Mercer descriptions (those in the mapping but not in the 4 JSONs) get a minimal entry: `nombre`, `nombreOrganigrama`, `area`, `nivelCarrera` (from hierarchy if available), `puntosTotales`, `enUso`. Fields `purpose`, `skills`, `responsibilities` are empty arrays/strings.

**Linking to organigrama:** When the organigrama is loaded, each `emp.Puesto` is matched against `nombreOrganigrama` in the puestos catalog. This enables counting employees per position. The matching is **case-insensitive** and uses normalization (trim + collapse spaces) consistent with `FILTER_KEYS` processing. No fuzzy matching needed — the mapping Excel already provides the exact organigrama name.

**Estimated localStorage footprint:** ~212 positions with full data (~300 bytes each) + ~480 minimal entries (~100 bytes each) ≈ ~110 KB. Well within localStorage's 5 MB limit.

**Access functions:**
```javascript
function getPuestosCatalog() {
  try { return JSON.parse(localStorage.getItem('convocatoria_puestos_catalog')) || []; }
  catch(e) { return []; }
}

function savePuestosCatalog(data) {
  localStorage.setItem('convocatoria_puestos_catalog', JSON.stringify(data));
}

function getEmployeeCountByPuesto(puestoNombreOrg) {
  // Count employees in state.employees where emp.Puesto matches
  if (!state.employees || !state.employees.length) return 0;
  return state.employees.filter(function(e) {
    return e.Puesto === puestoNombreOrg;
  }).length;
}
```

---

### B. New TNA request model

Replace current model `{ id, area, tema, justificacion, urgencia, estado, createdAt }` with:

```javascript
{
  id: Date.now(),
  // Position linkage
  puestos: ["Director HDE Levante-Aragon Sur"],  // catalog nombres (array, multi-select)
  // Need detail
  skill: "Negociación con clientes Horeca",        // from position skills or free text
  tema: "Negociación avanzada para canal Horeca",  // proposed training topic
  justificacion: "Perdimos 3 renovaciones en Q4 por falta de técnicas de cierre.",
  // Metadata
  urgencia: "alta",           // baja | media | alta
  estado: "pendiente",        // pendiente | aprobada | rechazada | convertida
  origen: "Dirección Comercial",  // who requested (free text)
  createdAt: "2026-03-15T10:30:00.000Z",
  // Auto-computed context (snapshot at creation time)
  numEmpleados: 12,           // sum of employees across selected puestos
  areas: ["Hostelería Dirección"],  // unique areas from selected puestos
  nivelCarrera: "M4"          // predominant career level (most common among selected)
}
```

**Changes from current model:**
- `area` (free text) → `puestos[]` (linked to catalog) + `areas[]` (auto-derived)
- New: `skill` (competency affected)
- New: `origen` (who requested the training)
- New: `numEmpleados`, `areas`, `nivelCarrera` (auto-computed context)
- Retained: `tema`, `justificacion`, `urgencia`, `estado`, `createdAt`

**Migration of existing data:** Old TNA requests (without `puestos` field) are auto-migrated on first load:
- `area` → `origen` (since that's what it functionally was — the requesting department)
- `puestos` → `[]` (empty — unlinked)
- `skill` → `""` (empty)
- `numEmpleados` → `0`
- `areas` → `[request.area]` if area existed
- Existing requests appear as "sin puesto vinculado" — editable to add linkage

**Storage:** Same key `convocatoria_tnaRequests`, same `getTNARequests()` / `saveTNARequests()` functions (extended with migration logic).

---

### C. TNA view — two sub-views

The TNA container (`#tnaViewContainer`) gets internal sub-navigation:

```
[ Explorar puestos ]  [ Necesidades (12) ]
```

Two toggle buttons at the top. Default view: **Necesidades** (the list).

**Visibility note:** `#tnaViewContainer` uses `u-hidden` class (not `style.display`), per CLAUDE.md convention. Internal sub-view switching within the container should also use `u-hidden` on child panels.

#### C.1 Explorador de puestos

A read-only reference panel for browsing positions and their competencies. Optional — the user comes here when they want context before creating a need.

**Layout:**
- Filter bar: search (typeahead on position name), filter by área/departamento
- Table: nombre, área, nivel, nº empleados (computed from organigrama)
- Click row → expandable detail panel showing:
  - Purpose (one paragraph)
  - Skills (as chips)
  - Top responsibilities (with percentages)
  - PC range
- Action button in expanded detail: "Crear necesidad para este puesto" → opens creation dialog with puesto pre-selected

**Behavior:**
- If no puestos catalog loaded: show empty state "Catálogo de puestos no cargado. Impórtalo desde Ajustes."
- If no organigrama loaded: employee counts show "—" instead of numbers
- Table is sortable by any column
- Does NOT modify any data — purely a consultation tool

#### C.2 Lista de necesidades

Replaces the current card-based list with a richer table view.

**Table columns:** tema, puesto(s), skill, urgencia, estado, origen, nº empleados, fecha

**Filters:** estado, urgencia, área/departamento, puesto, origen

**Sorting:** any column, default by estado (pendiente first) then date descending

**Row interactions:**
- Click → expandable detail (justificación, puestos detallados, context)
- Action buttons: "Editar", "Crear acción", "Eliminar"
- "Crear acción" only visible when `estado !== 'convertida'`

**Empty state:** "No hay solicitudes de formación registradas. Pulsa 'Nueva solicitud' para crear la primera."

**Header:** "Necesidades formativas" title + "Nueva solicitud" button (always accessible)

---

### D. Creation dialog

Single dialog (no wizard/stepper). Fields in order:

1. **Puesto(s)** — Multi-select with typeahead, searching puestos catalog by `nombreOrganigrama` (the name the user recognizes). Internally stores `nombre` (canonical evaluated name). Shows chips for selected puestos with: nombreOrganigrama + nivel + nº empleados. Optional "Seleccionar por área" shortcut to add all positions from an area.
2. **Competencia / Skill** — If puestos selected: shows aggregated skills from all selected puestos as clickable chips. User can click a chip (fills the field) or type free text. If no puestos selected: plain text input.
3. **Tema de formación** — Text input (required). If skill was selected from chips, pre-fills with the skill name as suggestion (editable).
4. **Justificación** — Textarea (optional).
5. **Urgencia** — Select: baja / media / alta (default: media).
6. **Origen** — Text input (optional). Placeholder: "Ej: Dirección Comercial, Auditoría, Detección propia".

**On save:**
- Validate: `tema` required (as today)
- Compute context: `numEmpleados` (sum from organigrama), `areas` (unique from puestos), `nivelCarrera` (mode of selected puestos)
- Save to `convocatoria_tnaRequests`
- Toast: "Solicitud de formación registrada"
- Re-render list

**Edit:** Same dialog, pre-filled with existing data. Updates in place. On save, recomputes auto-context fields (`numEmpleados`, `areas`, `nivelCarrera`) from the current organigrama/puestos data — the snapshot refreshes on each edit.

---

### E. Conversion to acción (enhanced)

When converting TNA → acción formativa, the new acción inherits richer context:

```javascript
{
  codigo: 'TNA-' + Date.now(),             // auto-generated codigo (pkField for acciones)
  nombre: request.tema,
  departamento: request.areas.join(', '),  // derived from puestos
  plazas: request.numEmpleados || '',       // suggested capacity
  estado: 'Planificada',
  notas: [{
    id: Date.now(),
    date: new Date().toISOString(),
    tag: 'sistema',
    text: 'Origen: solicitud TNA' +
      (request.skill ? ' — Competencia: ' + request.skill : '') +
      (request.puestos.length ? ' — Puestos: ' + request.puestos.join(', ') : '') +
      (request.justificacion ? ' — ' + request.justificacion : '')
  }]
}
```

Note: The current TNA conversion (line 11220) also lacks a `codigo` — this fix applies to both old and new paths. The `codigo` field is the `pkField` for acciones and is required for catalog upsert/lookup functions to work correctly.

After conversion: `request.estado = 'convertida'`, saved, re-rendered.

---

### F. Import logic changes

Extend the catalog import function to handle `puestos`:

Currently the import JSON has keys `proveedores`, `tutores`, `acciones`, `centros`. Each maps to a `fundae_*` localStorage key. Add:

```javascript
// In the import handler, after existing catalog imports:
if (data.puestos && Array.isArray(data.puestos)) {
  localStorage.setItem('convocatoria_puestos_catalog', JSON.stringify(data.puestos));
}
```

Also add `'convocatoria_puestos_catalog'` to `BACKUP_KEYS` array for backup/restore cycles.

Also add `'convocatoria_tnaRequests'` to `BACKUP_KEYS` if not already present — TNA data should survive backup/restore.

---

## Data flow

```
[One-time setup]
  → Run generate-puestos-catalog.py (offline)
  → Add "puestos" array to catalog import JSON
  → User imports JSON → puestos loaded into convocatoria_puestos_catalog

[TNA workflow]
  → User opens Necesidades tab
  → (Optional) Explores puestos → sees skills, purpose
  → Clicks "Crear necesidad para este puesto" OR "Nueva solicitud"
  → Selects puesto(s) → sees skills → fills form
  → Saves → TNA request stored with context
  → Later: approves/rejects/converts to acción

[Organigrama interaction]
  → Employee counts per puesto computed dynamically from state.employees
  → If organigrama not loaded: counts show "—"
  → No cascade needed: TNA references puesto names, not NIFs
```

---

## Edge cases

| Case | Handling |
|---|---|
| No puestos catalog loaded | Explorador shows empty state. Creation dialog works without puesto selection (tema + justificación still possible — graceful degradation). |
| No organigrama loaded | Employee counts show "—". Everything else works. |
| Puesto in catalog not in organigrama | Shows 0 employees. Not an error — position may exist but be vacant. |
| Employee's Puesto not in catalog | Not an error. TNA operates on catalog puestos, not on organigrama puestos. No matching attempted for unknown positions. |
| Old TNA requests (pre-migration) | Auto-migrated: area → origen, puestos = []. Shown as "sin puesto vinculado". |
| Puesto name changes in future catalog import | TNA requests store puesto names as strings. If name changes, old requests keep old name. No auto-update. Acceptable — historical record. |
| Very large puestos catalog (600+) | Typeahead search handles this efficiently. ~700 rows render fine with plain DOM (no virtual scroll needed — the employee table handles 500+ without it). |
| Multiple puestos from different areas | `areas` field aggregates all unique areas. `nivelCarrera` uses mode (most common level). |

---

## What we do NOT change

- The Catálogos tab structure (TNA remains a sub-tab of Catálogos)
- Other catalog sub-tabs (acciones, proveedores, centros, tutores, compliance, plan anual)
- The organigrama import flow
- The existing acciones data model
- Any UI outside the TNA sub-tab + import logic

## What we fix opportunistically

- Add `convocatoria_tnaRequests` and `convocatoria_puestos_catalog` to `BACKUP_KEYS` (currently missing — TNA data and puestos don't survive backup/restore). Other missing keys (`convocatoria_compliance_types`, `convocatoria_compliance_records`, etc.) are out of scope for this change.

---

## Testing

Use `test-data.js` to populate puestos catalog and updated TNA requests, then:

1. Import catalog JSON with `puestos` key → verify puestos loaded in localStorage
2. Open Necesidades tab → verify two sub-views (Explorar puestos / Necesidades)
3. Explorar puestos → verify table shows positions with skills, filterable by area
4. Click puesto → verify expandable detail with skills, purpose, responsibilities
5. "Crear necesidad para este puesto" → verify dialog opens with puesto pre-selected
6. Create need with multiple puestos → verify skills merge, employee count aggregates
7. Create need without puesto (graceful degradation) → verify works as free-text
8. Old TNA requests appear with "sin puesto vinculado" → verify migration
9. Convert need to acción → verify acción has rich context (puestos, skill, plazas, nota)
10. Export/import backup → verify puestos catalog and TNA requests survive
11. Reload page without organigrama → verify employee counts show "—"
