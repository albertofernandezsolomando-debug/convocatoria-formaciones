# Efficiency & Use-Cases Feature Pack — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 16 features to `convocatoria.html` covering workflow automation, FUNDAE validation, reporting, and daily use-cases for training technicians.

**Architecture:** Single self-contained HTML file. All CSS inline in `<style>`, HTML in `<body>`, JS in `<script>`. localStorage for persistence. No backend. Design system: Indigo-600 + Slate palette, Inter font only, CSS variables mandatory (see CLAUDE.md).

**Tech Stack:** HTML/CSS/JS vanilla, SheetJS (already loaded via CDN), localStorage, existing ZIP builder (already in codebase for PA flow download).

**Design system constraints (CLAUDE.md — MUST follow):**
- Colors: ONLY `var(--accent)`, `var(--bg-panel)`, `var(--border)`, etc. NEVER hardcode hex/rgba
- Font: ONLY `var(--font-body)` — never write `font-family` directly
- Shadows: ONLY `var(--shadow-sm)` and `var(--shadow-lg)` — no intermediates
- Radius: ONLY `var(--radius-sm)` (4px), `var(--radius)` (8px), `var(--radius-lg)` (9999px)
- Transition: ONLY `var(--transition)`
- Components: reuse `.btn`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.chip`, `.dialog-overlay`, `.dialog-box`, `.toast`, `.link-btn`
- XSS: sanitize with `esc()` before any dynamic HTML insertion. Use `textContent` for plain text.
- Toasts: `showToast()` — NEVER `alert()` or `confirm()` or `prompt()`
- IDs: use `_id` — NEVER NIF as selection key
- Naming: Spanish for UI text, English for code/variables
- Font sizes: 11px (small labels), 12px (filters/chips), 13px (table/inputs), 15px (header)

**File:** `convocatoria.html` (single file, currently 6109 lines)

---

## Chunk 1: Data Layer and Simple Catalog Features

### Task 1: Duplicate Action (Duplicar accion formativa)

**Modify:** `convocatoria.html` — CATALOG UI section (~line 2219 `renderCatalogForm`)

Adds a "Duplicar" button to the action formativa form that creates a copy with new code, no participants, no dates, status "Pendiente".

- [ ] **Step 1:** In `renderCatalogForm()`, when rendering an `acciones` record, add a "Duplicar" button next to the existing "Eliminar" button. The button should have class `btn btn-secondary` and text "Duplicar".

- [ ] **Step 2:** The click handler:
  - Reads all acciones from catalog
  - Finds max existing codigo
  - Deep-clones the record
  - Sets new codigo = max + 1, clears participantes, sets estado = 'Pendiente', clears fechaInicio/fechaFin/grupoAccion
  - Saves and re-renders the catalog list
  - Shows toast: "Accion duplicada como codigo N"

- [ ] **Step 3:** Test: open Catalogos tab, select an existing accion, click Duplicar, verify a new entry appears with incremented code and no participants.

- [ ] **Step 4:** Commit.

---

### Task 2: Copy participants between actions (Copia masiva de participantes)

**Modify:** `convocatoria.html` — CATALOG UI section, acciones form participant area

Adds a "Copiar de otra accion" button next to "Asignar participantes" that imports NIFs from another action.

- [ ] **Step 1:** In `renderCatalogForm()`, when rendering the participant section for acciones, add a button "Copiar de otra accion" with class `link-btn link-add`.

- [ ] **Step 2:** The click handler opens a dialog (using `.dialog-overlay` + `.dialog-box`, NOT prompt/confirm) listing all other acciones that have participants. Each item shows `codigo - nombre (N participantes)`. Clicking one merges its `participantes` array into the current record using a Set for deduplication. Toast: "N participantes importados desde [codigo]".

- [ ] **Step 3:** Test: create two acciones with different participants, use "Copiar de otra accion" on one, verify participants are merged without duplicates.

- [ ] **Step 4:** Commit.

---

### Task 3: Notes/timeline per action (Notas de seguimiento)

**Modify:** `convocatoria.html` — CATALOG DATA LAYER + CATALOG UI

Adds a `notas` array field to each accion formativa with timestamped entries and optional tags.

- [ ] **Step 1:** In `renderCatalogForm()`, when rendering an acciones record, add a "Notas de seguimiento" section after existing fields. Contains:
  - A list of existing notes rendered chronologically (newest first)
  - Each note shows: date (formatted es-ES), tag chip, text, delete X button
  - An input row: tag selector (proveedor/FUNDAE/interno/empleado) + text input + "Anadir" button

- [ ] **Step 2:** Each note stored as `{ id: Date.now(), date: new Date().toISOString(), tag: 'interno', text: '...' }` in `record.notas` array.

- [ ] **Step 3:** CSS: use `.chip` for tags with appropriate colors (proveedor=chart-2, FUNDAE=accent, interno=chart-3, empleado=chart-4). Dates in `font-size: 11px; color: var(--text-muted)`. Notes separated by `border-bottom: 1px solid var(--border)`.

- [ ] **Step 4:** Delete button removes note, saves via `upsertCatalogRecord`, re-renders.

- [ ] **Step 5:** Test: add notes with different tags, verify chronological order, delete works, persistence after navigation.

- [ ] **Step 6:** Commit.

---

### Task 4: Attendance tracking per session (Control de asistencia)

**Modify:** `convocatoria.html` — CATALOG UI, acciones form

Adds attendance section with sessions x participants checkbox grid and automatic percentage.

- [ ] **Step 1:** Add `asistencia` field to acciones data: `{ sesiones: ['2026-03-10'], registro: { 'NIF1': [true], 'NIF2': [false] } }`.

- [ ] **Step 2:** In `renderCatalogForm()` for acciones, add collapsible "Control de asistencia" section. Contains:
  - "Anadir sesion" button + date input
  - Grid table: rows = participants, columns = sessions. Cells are checkboxes.
  - Final column: "% Asistencia" = (checked / total) * 100. Rows below 75% in `color: var(--danger)`.

- [ ] **Step 3:** Checkbox changes update `record.asistencia.registro` and save via `upsertCatalogRecord`.

- [ ] **Step 4:** "Marcar todos" toggle per session column header.

- [ ] **Step 5:** Participants resolved from `state.employees` by NIF for display names. If organigrama not loaded, show NIF only.

- [ ] **Step 6:** Test: add sessions, mark attendance, verify percentage, verify below-75% highlighting, verify persistence.

- [ ] **Step 7:** Commit.

---

### Task 5: Cost field per action + provider linking (Costes por proveedor)

**Modify:** `convocatoria.html` — CATALOG UI (acciones form) + DASHBOARD

- [ ] **Step 1:** In `renderCatalogForm()` for acciones, add "Proveedor vinculado" dropdown (populated from proveedores catalog). Field: `proveedorVinculado` (stores CIF). Similar to centroVinculado/tutorVinculado pattern. The `presupuesto` field already exists.

- [ ] **Step 2:** Extend `getLinkedAcciones()` to support `type === 'proveedores'` (checks `a.proveedorVinculado === documento`). Use `renderLinkedAccionesHtml('proveedores', record.cif)` in the proveedor form.

- [ ] **Step 3:** In `renderDashboard()`, add a new chart card "Gasto por proveedor" using `renderSvgBarChart()`. Items = providers with linked acciones, values = sum of presupuestos.

- [ ] **Step 4:** Test: link provider to action with budget, verify dashboard chart.

- [ ] **Step 5:** Commit.

---

## Chunk 2: Validation and Alerts

### Task 6: XML pre-validation (Validador pre-envio de XMLs)

**Modify:** `convocatoria.html` — FUNDAE XML EXPORT section (~line 4865)

Comprehensive validation before XML generation.

- [ ] **Step 1:** Create `function validateXmlData(type, accion, grupo, participantes)` returning `{ errors: [], warnings: [] }`. Each entry: `{ field, message, participantNif }`.

Validation rules:
  - codigo/nombre not empty
  - NIF format: `/^[0-9]{8}[A-Z]$/` for NIF, `/^[XYZ][0-9]{7}[A-Z]$/` for NIE
  - Tipo documento coherence with NIF format
  - fechaInicio < fechaFin
  - Required participant fields for finalizacion: categoriaProfesional, nivelEstudios, grupoCotizacion
  - Hours > 0 matching modalidad
  - Area profesional exists in FUNDAE_AREAS
  - CIF empresa exists in EMPRESAS_GRUPO
  - Attendance below 75% as warning (if tracking from Task 4)

- [ ] **Step 2:** Call at start of genXmlAccionFormativa/genXmlInicioGrupo/genXmlFinalizacion. If errors, show dialog listing them and block download. Warnings shown but non-blocking.

- [ ] **Step 3:** Dialog: `.dialog-overlay + .dialog-box`, errors in `color: var(--danger)` with left border, warnings in `color: var(--warning)`.

- [ ] **Step 4:** Test: invalid NIF, missing fields, verify validation blocks and shows errors.

- [ ] **Step 5:** Commit.

---

### Task 7: Pre-send FUNDAE checklist (Validacion pre-envio convocatoria)

**Modify:** `convocatoria.html` — DEEP LINK AND ACTIONS (~line 4050)

Cross-check FUNDAE readiness when sending convocatoria.

- [ ] **Step 1:** Create `function checkFundaeReadiness(eventTitle)`:
  - Search acciones for matching title (case-insensitive trim)
  - Check: centroVinculado, tutorVinculado, participants have required fields
  - Return `{ found, accion, warnings }`

- [ ] **Step 2:** In confirmation dialog for Outlook/Queue, append non-blocking warnings if found. Style: `background: var(--warning-light); border-left: 3px solid var(--warning); border-radius: var(--radius-sm);`.

- [ ] **Step 3:** Test: action without centro, convocatoria with same title, verify warning.

- [ ] **Step 4:** Commit.

---

### Task 8: Proactive alerts on organigrama load

**Modify:** `convocatoria.html` — FILE LOADING section (~line 3317)

Cross-check action participants against loaded employees.

- [ ] **Step 1:** After organigrama parse, call `checkOrphanParticipants()`.

- [ ] **Step 2:** Function checks each accion's participantes against state.employees NIFs. Collects orphans by accion. If found, shows toast with count + "Ver detalles" action.

- [ ] **Step 3:** Details dialog: list orphans by accion, with "Eliminar de la accion" per NIF and bulk "Eliminar todos". Uses `.dialog-overlay + .dialog-box`.

- [ ] **Step 4:** Test: add action with NIF not in organigrama, reload, verify alert.

- [ ] **Step 5:** Commit.

---

### Task 9: FUNDAE deadline alerts with countdown

**Modify:** `convocatoria.html` — DASHBOARD (`renderDashboard`)

Enhance alerts with countdown timers.

- [ ] **Step 1:** In renderDashboard alerts section, add deadline alerts:
  - Acciones in "En preparacion" with fechaInicio within N days: "Accion [codigo] empieza en N dias"
  - Acciones "En marcha" with fechaFin passed: "Accion [codigo] finalizo hace N dias"
  - Acciones "En marcha" with fechaFin within 5 days: warning

- [ ] **Step 2:** Priority levels: danger (<=3 days or overdue), warning (<=10 days), info. Sort danger first.

- [ ] **Step 3:** Settings: add "diasAvisoInicio" (default 10) and "diasAvisoFin" (default 5) to convocatoria_settings.

- [ ] **Step 4:** Test: actions with near/past dates, verify alerts.

- [ ] **Step 5:** Commit.

---

### Task 10: Schedule conflict detection

**Modify:** `convocatoria.html` — DEEP LINK AND ACTIONS

Check history for same-day time conflicts.

- [ ] **Step 1:** Create `detectConflicts(emails, eventDate, startTime, endTime)`:
  - Read history, filter same eventDate
  - Check time overlap: `!(end1 <= start2 || end2 <= start1)`
  - Return conflicts with titles and overlapping emails

- [ ] **Step 2:** Show in confirmation dialog as non-blocking warnings (same pattern as Task 7).

- [ ] **Step 3:** Test: two convocatorias same date/time, overlapping attendees, verify warning.

- [ ] **Step 4:** Commit.

---

## Chunk 3: Automation and Templates

### Task 11: Auto-fill event from Accion Formativa

**Modify:** `convocatoria.html` — EVENT CONFIGURATION + existing load-from-action handler

- [ ] **Step 1:** Find existing "Cargar desde Accion Formativa" handler. Extend to also set:
  - eventTitle = accion.nombre
  - event type = Teams if modalidad is Teleformacion
  - formador = tutor name if tutorVinculado exists
  - Toast: "Datos de [nombre] cargados. Completa fecha y sala."

- [ ] **Step 2:** Test: action with name/modalidad/tutor, load, verify fields.

- [ ] **Step 3:** Commit.

---

### Task 12: Convocatoria templates (Plantillas de convocatoria + email)

**Modify:** `convocatoria.html` — EVENT CONFIGURATION + SETTINGS

- [ ] **Step 1:** localStorage key `convocatoria_templates`. Structure: `[{ id, name, event: {title, isTeams, location, body, formador}, emailBody }]`

- [ ] **Step 2:** Persistence: `getTemplates()`, `saveTemplates()`.

- [ ] **Step 3:** UI: dropdown in "Datos del evento" + "Guardar como plantilla" link. Loading fills event fields. Variable substitution: `{titulo}`, `{fecha}`, `{hora_inicio}`, `{hora_fin}`, `{formador}`, `{ubicacion}`.

- [ ] **Step 4:** Save dialog with name input (dialog-overlay, NOT prompt).

- [ ] **Step 5:** Template management in Settings: list + delete.

- [ ] **Step 6:** Test: save template, clear, load, verify. Test variable substitution.

- [ ] **Step 7:** Commit.

---

### Task 13: History status tracking

**Modify:** `convocatoria.html` — HISTORY STORAGE + HISTORY PANEL

- [ ] **Step 1:** Extend `logToHistory()` with `status` ('completed'|'cancelled'|'partial') and `surveyScheduled` (boolean).

- [ ] **Step 2:** Update `sendSurveyEmail()` success to mark `surveyScheduled = true` on matching history entry.

- [ ] **Step 3:** Queue cancel → mark remaining as 'cancelled'.

- [ ] **Step 4:** In `renderHistory()`, add status badges:
  - Completed: chip with `background: var(--success-light); color: var(--success)`
  - Cancelled: chip with `background: var(--danger-light); color: var(--danger)`
  - Survey: chip "Encuesta" with accent color if scheduled, muted if not

- [ ] **Step 5:** Test: send convocatoria, verify badges. Cancel queue, verify.

- [ ] **Step 6:** Commit.

---

### Task 14: Batch XML generation (3 XMLs en lote)

**Modify:** `convocatoria.html` — Tab 3 XML section + ZIP BUILDER refactor

- [ ] **Step 1:** Extract `buildZip()` and `crc32()` from inside `btnDownloadFlow` handler into module-level functions in a new "// ZIP BUILDER" section. Both functions keep identical logic, just moved to top level.

- [ ] **Step 2:** Update `btnDownloadFlow` handler to call the now-global `buildZip()`.

- [ ] **Step 3:** Add "Generar los 3 XMLs (ZIP)" button with class `btn btn-primary` in Tab 3 alongside existing XML buttons.

- [ ] **Step 4:** Handler: validate all three via Task 6's `validateXmlData`. If errors, show dialog. If pass, call all three gen functions (modified to return XML string instead of downloading), package into ZIP, download as `FUNDAE_[codigo]_G[grupo].zip`.

- [ ] **Step 5:** Test: fill XML data, click button, verify ZIP with 3 files.

- [ ] **Step 6:** Commit.

---

## Chunk 4: Reports and Exports

### Task 15: Employee training report (Informe formativo por empleado)

**Modify:** `convocatoria.html` — DASHBOARD section

- [ ] **Step 1:** Add search input in dashboard: text field with placeholder "Buscar empleado (nombre o NIF)" + search button. Searches `state.employees`.

- [ ] **Step 2:** On match, open modal dialog (`.dialog-overlay + .dialog-box`, max-width 700px):
  - Header: name, NIF, empresa, departamento, puesto
  - Table: acciones where NIF in participantes (codigo, nombre, estado, modalidad, horas, fechas)
  - Summary: total hours, attendance % if available
  - "Exportar ficha" button generates single-sheet Excel via SheetJS

- [ ] **Step 3:** Test: load organigrama, create actions with participant, search, verify report.

- [ ] **Step 4:** Commit.

---

### Task 16: Annual training report Excel

**Modify:** `convocatoria.html` — DASHBOARD section

- [ ] **Step 1:** Add "Exportar informe" button (class `btn btn-secondary`) in dashboard header.

- [ ] **Step 2:** Generates 4-sheet Excel:
  - "Resumen": KPI table (acciones, horas, participantes, presupuesto, credito)
  - "Acciones Formativas": all actions with all fields
  - "Credito FUNDAE": per empresa (asignado, consumido, disponible, %)
  - "Participantes": unique NIFs with name, empresa, n acciones, total hours

- [ ] **Step 3:** Filename: `Informe_Formacion_YYYY.xlsx`

- [ ] **Step 4:** Test: populate data, export, verify 4 sheets.

- [ ] **Step 5:** Commit.

---

### Task 17: FUNDAE consolidated export

**Modify:** `convocatoria.html` — Tab 3 XML section

- [ ] **Step 1:** Add "Exportar Excel FUNDAE" button in Tab 3.

- [ ] **Step 2:** Generates Excel from participant table: NIF, Tipo Doc, Nombre, Apellidos, Email, Telefono, Cat. Profesional, Nivel Estudios, Grupo Cotizacion, Diploma, Coste Hora, Coste SS, Discapacidad, CIF Empresa.

- [ ] **Step 3:** Second sheet "Accion Formativa" with action metadata.

- [ ] **Step 4:** Filename: `FUNDAE_[codigo]_participantes.xlsx`

- [ ] **Step 5:** Test: load participants, export, verify columns.

- [ ] **Step 6:** Commit.

---

## Chunk 5: Calendar

### Task 18: Training calendar in dashboard

**Modify:** `convocatoria.html` — DASHBOARD CSS + JS

Adds monthly timeline/Gantt view.

- [ ] **Step 1:** Add CSS:
```css
.dash-timeline { position: relative; min-height: 120px; }
.dash-timeline-bar {
  position: absolute;
  height: 22px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: white;
  font-weight: 500;
  padding: 0 6px;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
  transition: opacity var(--transition);
}
.dash-timeline-bar:hover { opacity: 0.85; }
.dash-timeline-month {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

- [ ] **Step 2:** In `renderDashboard()`, add full-width card "Calendario de formaciones". Only render if acciones have dates.

- [ ] **Step 3:** Logic:
  - Calculate date range (min fechaInicio to max fechaFin), expand to full months
  - Month headers with proportional grid columns
  - Each accion = bar at `left: X%; width: W%` colored by estado
  - Swim-lane stacking for overlaps (find first row without collision)
  - Hover title with name + dates + participant count
  - Max 20 bars, then "y N mas"

- [ ] **Step 4:** Test: 3-4 actions with overlapping dates, verify rendering and stacking.

- [ ] **Step 5:** Commit.

---

### Task 19: Final integration and push

- [ ] **Step 1:** Verify all CSS uses design system variables (no hardcoded colors/fonts/radii).

- [ ] **Step 2:** Final commit if fixes needed.

- [ ] **Step 3:** Push.
```bash
git push
```
