# Catálogos FUNDAE + Generación XML — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add FUNDAE catalogs (proveedores, centros, tutores, acciones formativas) with Excel ingestion, and a dedicated XML generation tab that combines catalog data with organigrama participant data.

**Architecture:** Single-file HTML app (`convocatoria.html`). Existing Tab 1 (Convocatoria) gains extended organigrama columns and a "Cargar desde Acción Formativa" button. New Tab 2 (Catálogos FUNDAE) manages 4 catalogs with CRUD, Excel import/export, and participant linking. New Tab 3 (Generar XML FUNDAE) combines catalog + organigrama data to produce 3 XSD-conformant XMLs.

**Tech Stack:** Vanilla JS, SheetJS (XLSX) via CDN, localStorage, CSS variables (Indigo-600 + Slate design system)

**Spec:** `docs/superpowers/specs/2026-03-12-fundae-catalogos-design.md`

**Design system reference:** `CLAUDE.md` — all CSS must use `:root` variables, Inter font only, 2 shadow levels, 3 radius values.

**XSS note:** The existing codebase uses an `esc()` function for sanitizing all user/Excel values before inserting into HTML. All dynamically generated HTML in this plan MUST use `esc()` for every value from user input, localStorage, or Excel data. This pattern is already established throughout the codebase.

---

## File Structure

Single file: `convocatoria.html` (~3012 lines currently). All changes are within this file.

**Sections to modify:**
- **CSS** (~lines 11-763): Add tab navigation styles, catalog layout styles, XML tab styles
- **HTML** (~lines 765-1107): Add tab bar before `.app` (line 766), wrap `.app` in tab container, add Tab 2 and Tab 3 HTML; global overlays (lines 1070-1107) remain outside tabs
- **JS** (~lines 1109-3012): Add FUNDAE_COLUMNS, catalog CRUD, Excel templates, mapeo logic, XML tab logic; remove old FUNDAE section; update parseOrgSheet and saveState

**Sections to remove:**
- HTML lines 861-1001: "4. Datos FUNDAE (opcional)" section
- JS lines 2571-2990: Old FUNDAE constants, getFundaeData, restoreFundaeData, FUNDAE_FIELDS auto-save, old XML generators, old button listeners

---

## Chunk 1: Tab Infrastructure + Migration

### Task 1: Add tab navigation CSS and HTML structure

**Files:**
- Modify: `convocatoria.html:11-780` (CSS section)
- Modify: `convocatoria.html:780-1068` (HTML section)

This task wraps the entire existing UI in a tab system and adds empty containers for Tabs 2 and 3.

- [ ] **Step 1: Add tab navigation CSS**

After the `.fundae-sub-fields` rule (~line 147), add:

```css
/* --- Tab navigation --- */
/* Add to existing body rule (line 44): display: flex; flex-direction: column; */

.tab-bar {
  display: flex;
  border-bottom: 2px solid var(--border);
  background: var(--bg-panel);
  padding: 0 24px;
  gap: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tab-btn {
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--accent-subtle);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

.tab-content {
  display: none;
  flex: 1;
  overflow: hidden;
}

.tab-content.active {
  display: block;
}

/* Tab 2 and 3 panels need scroll */
.catalog-left, .catalog-right,
.xml-left, .xml-right {
  overflow-y: auto;
}
```

- [ ] **Step 2: Add tab bar HTML and wrap existing layout**

**Structure overview:** The `.app` div starts at line 766 and closes at line 1068. After it, lines 1070-1107 contain global overlays (toastContainer, seriesDialog, confirmDialog, historyPanel) that must remain **outside** all tab containers — they are global to the page.

Insert the tab bar **before** `<div class="app">` (line 766):
```html
<div class="tab-bar">
  <button class="tab-btn active" data-tab="tabConvocatoria">Convocatoria</button>
  <button class="tab-btn" data-tab="tabCatalogos">Catálogos FUNDAE</button>
  <button class="tab-btn" data-tab="tabXml">Generar XML FUNDAE</button>
</div>
```

Wrap the existing `<div class="app">` ... `</div>` (lines 766-1068) in a `<div class="tab-content active" id="tabConvocatoria">` ... `</div>`.

After the closing `</div>` of `#tabConvocatoria` (and **before** the `#toastContainer` div at line 1070), add placeholder divs for Tab 2 (`#tabCatalogos`) and Tab 3 (`#tabXml`), each containing a split-panel `.app` layout with left-panel and right-panel similar to Tab 1.

**Important:** The global overlays (lines 1070-1107: `#toastContainer`, `#seriesDialog`, `#confirmDialog`, `#historyPanel`) must remain **after all tab containers**, not inside any tab.

Tab 2 left panel: header "Catálogos FUNDAE", placeholder `#catalogListPanel`.
Tab 2 right panel: placeholder `#catalogFormPanel` with empty state `#catalogEmpty`.
Tab 3 left panel: header "Generar XML FUNDAE", placeholder `#xmlConfigPanel`.
Tab 3 right panel: placeholder `#xmlParticipantPanel` with empty state `#xmlEmpty`.

- [ ] **Step 3: Add tab switching JS**

At the top of the `<script>` section (after line 1109), add tab switching: click handlers on `.tab-btn` elements that toggle `.active` class on both the button and the corresponding `#tab{Name}` content div.

- [ ] **Step 4: Verify tab switching works**

Open `convocatoria.html` in a browser. Click each tab — only the corresponding content should be visible. The existing Convocatoria tab should work exactly as before.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add 3-tab navigation infrastructure (Convocatoria, Catálogos, XML)"
```

---

### Task 2: Remove old FUNDAE section and migrate saveState

**Files:**
- Modify: `convocatoria.html:861-1001` (remove HTML)
- Modify: `convocatoria.html:2571-2990` (remove/refactor JS)
- Modify: `convocatoria.html:1493-1516` (saveState)
- Modify: `convocatoria.html:2444-2447` (restore)

This task removes the old "4. Datos FUNDAE" section from Tab 1 and cleans up related JS.

- [ ] **Step 1: Remove the FUNDAE HTML section**

Delete lines 861-1001 (the entire `<!-- 4. FUNDAE -->` section including the closing `</div>`). This removes `#fundaeSection` container and all `fCIF`, `fCodAccion`, etc. form fields and the old XML generation buttons.

- [ ] **Step 2: Remove old FUNDAE JS code**

Delete these sections from the JS:
1. `FUNDAE_FIELDS` array and the auto-save listener loop (~lines 2639-2729)
2. `getFundaeData()` function (~lines 2650-2672)
3. `restoreFundaeData()` function (~lines 2674-2722)
4. Old XML generator functions: `generateAccionFormativaXML`, `generateInicioGrupoXML`, `generateFinalizacionXML` (~lines 2754-2986). **Note:** New XML generators are added in Task 12. Before deleting, document the following edge cases from the existing code that Task 12 must preserve:
   - **aulaVirtual** for Teams meetings (lines 2908-2913): `<aulaVirtual><medio>Microsoft Teams</medio></aulaVirtual>` when `ev.isTeams`
   - **tipoTutoria** structure (lines 2898-2901): `<tutoria><tipoTutoria><tutorias>1</tutorias></tipoTutoria><descripcion>Correo electrónico</descripcion></tutoria>`
   - **Tutor** with separate `<apellido1>` and `<apellido2>` elements (lines 2893-2895)
   - **Modalidad variants**: presencial/teleformacion/mixta each have different XML structures (lines 2773-2782, 2853-2906)
   - **empParticipantes** with `<infRLT>` sub-element (lines 2784-2789)
   - **Costes** block with `<directos>`, `<indirectos>`, `<salariales>` (lines 2966-2970)
   - **Per-participant**: `<N_TIPO_DOCUMENTO>`, `<DiplomaAcreditativo>` S/N (lines 2952-2963)
5. Old button listeners: `btnXmlAccion`, `btnXmlInicio`, `btnXmlFin` (~lines 2988-2990)
6. The `toggleFundaeSub()` function (~line 2631-2637) — will be re-added later for catalog forms
7. The old area profesional `<select>` population code (~lines 2612-2619)
8. The `fundaeToggle` click listener (~lines 2622-2628)

**Keep** these (they'll be reused in Tab 3):
- `FUNDAE_AREAS` constant (~lines 2575-2610)
- `downloadXML()` helper (~lines 2731-2738)
- `toFundaeDate()` and `getDiasFundae()` helpers (~lines 2742-2752)

- [ ] **Step 3: Update saveState to remove FUNDAE data**

In `saveState()`, remove the `fundae: getFundaeData()` line (~line 1510) from the snapshot object.

- [ ] **Step 4: Update restore code to skip FUNDAE**

In the restore section (~line 2444-2447), remove the FUNDAE restore block (`if (snapshot.fundae) { restoreFundaeData(snapshot.fundae); }`). Also remove the line at ~2459 that shows the now-deleted section: `document.getElementById('fundaeSection').style.display = '';`.

- [ ] **Step 5: Verify nothing is broken**

Open `convocatoria.html` in a browser:
- Tab 1 should work: upload organigrama, filter, select attendees, generate Outlook invites
- No JS errors in console
- The "4. Datos FUNDAE" section should be gone
- localStorage restore should still work (minus FUNDAE fields)

- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "refactor: remove old FUNDAE section from Tab 1, clean up saveState"
```

---

### Task 3: Extend organigrama parsing with FUNDAE_COLUMNS

**Files:**
- Modify: `convocatoria.html` (JS section, near `RELEVANT_COLUMNS`)

This task adds optional FUNDAE columns to the organigrama parsing without breaking existing functionality.

- [ ] **Step 1: Add FUNDAE_COLUMNS constant and mapping functions**

After the `FILTER_KEYS` array (~line 1153), add:

```javascript
const FUNDAE_COLUMNS = [
  'Móvil trabajo (largo)', 'Teléfono personal',
  'Nombre', 'Apellidos',
  'Numero Seguridad Social', 'Sexo',
  'DiscapacidadContrib',
  'Categoría profesional',
  'Titulación',
  'Grupo Cotización',
  'Coste Salarial Hora', 'Coste aproximado SS',
  'CIF'
];

const COL_NIVEL_ESTUDIOS = 'Categoría profesional';
const COL_CATEGORIA_PROF = 'Titulación';

const MAP_CATEGORIA_PROF = {
  'Directivo': 1, 'Mando Intermedio': 2, 'Técnico': 3,
  'Trabajador Cualificado': 4, 'Trabajador NO cualificado': 5,
};

const MAP_NIVEL_ESTUDIOS = {
  'Menos que primaria': 1,
  'Educación primaria': 2,
  'Primera etapa de educación secundaria (ESO, EGB)': 3,
  'Segunda etapa de Educación Secundaria (Bachillerato, FP de grado medio, BUP, FPI y FPII)': 4,
  'Educación postsecundaria no superior (Certificados de Profesionalidad nivel 3)': 5,
  'Técnico Superior / FP grado superior y equivalentes': 6,
  'E. Universitarios 1º Ciclo (Diplomatura y grados)': 7,
  'E. Universitarios 2º Ciclo (Licenciatura, Máster)': 8,
  'E. Universitarios 3º Ciclo (Doctorado)': 9,
  'Otras titulaciones': 10,
};

function mapCategoriaProfesional(val) {
  return val ? (MAP_CATEGORIA_PROF[val.trim()] || '') : '';
}

function mapNivelEstudios(val) {
  return val ? (MAP_NIVEL_ESTUDIOS[val.trim()] || '') : '';
}

function detectTipoDocumento(nif) {
  if (!nif) return 10;
  const first = nif.trim().charAt(0).toUpperCase();
  return (first === 'X' || first === 'Y' || first === 'Z') ? 60 : 10;
}
```

- [ ] **Step 2: Update parseOrgSheet to collect optional FUNDAE columns**

In `parseOrgSheet()`, after the existing `RELEVANT_COLUMNS.forEach` mapping (~line 1184), add:
```javascript
FUNDAE_COLUMNS.forEach(col => {
  if (row[col] != null) emp['_f_' + col] = String(row[col]).trim();
});
```

The `_f_` prefix avoids collisions with existing columns and makes FUNDAE data identifiable.

**Name field usage:** The existing `Empleado` column (from `RELEVANT_COLUMNS`) is used for display purposes (table, picker). The `_f_Nombre` and `_f_Apellidos` columns are used for XML generation where separate first/last name fields are required (e.g., participant `<nombre>`, tutor `<apellido1>`/`<apellido2>`). `_f_Apellidos` contains the full "Apellidos" value; splitting into apellido1/apellido2 for XML: split on first space (first word = apellido1, rest = apellido2).

- [ ] **Step 3: Also update the external employees parsing**

In the external employees parsing section (~line 2374), add the same `FUNDAE_COLUMNS.forEach` block after the `RELEVANT_COLUMNS.forEach`.

- [ ] **Step 4: Verify organigrama still loads**

Open `convocatoria.html`, load an organigrama Excel. Verify no console errors, filters and table work, and `state.employees[0]` has `_f_` prefixed fields.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: parse optional FUNDAE columns from organigrama with mapping tables"
```

---

## Chunk 2: Catalogs CRUD + Persistence

### Task 4: Catalog data layer (localStorage CRUD)

**Files:**
- Modify: `convocatoria.html` (JS section)

Pure data functions with no UI. These manage the 4 catalogs in localStorage.

- [ ] **Step 1: Add catalog storage functions**

Add after the tab navigation JS:
- `getCatalog(key)` — reads `fundae_{key}` from localStorage, returns array
- `saveCatalog(key, data)` — writes to localStorage with try/catch (showToast on quota error)
- `upsertCatalogRecord(key, pkField, record)` — find by pk, update or push
- `deleteCatalogRecord(key, pkField, pkValue)` — filter out by pk
- `getLinkedRecords(proveedorCIF)` — returns centros and tutores linked to that CIF
- `exportCatalogsJSON()` — exports all 4 catalogs as a single JSON file download
- `importCatalogsJSON(file)` — reads JSON file and saves all 4 catalogs, calls renderCatalogList on success

- [ ] **Step 2: Verify in browser console**

Test CRUD operations via console: upsert, get, delete.

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add FUNDAE catalog data layer with localStorage CRUD"
```

---

### Task 5: Catalog UI — sub-tab selector + list panel

**Files:**
- Modify: `convocatoria.html` (CSS + HTML + JS)

Adds the 4 sub-tabs (Proveedores, Centros, Tutores, Acciones) and the list panel with search.

- [ ] **Step 1: Add catalog sub-tab CSS**

Add CSS for `.catalog-tabs`, `.catalog-tab` (pill-style buttons), `.catalog-list-item` with active state, `.item-title`, `.item-subtitle`.

- [ ] **Step 2: Add catalog list HTML in Tab 2**

Replace the `#catalogListPanel` placeholder with:
- `.catalog-tabs` div with 4 buttons (data-catalog attribute)
- Search input `#catalogSearch`
- List container `#catalogList`
- Bottom bar with: "Nuevo" button, "Importar Excel" button, "Descargar plantilla" button, file input
- JSON export/import links

- [ ] **Step 3: Add catalog list rendering JS**

Add `catalogState` object (`activeCatalog`, `selectedPK`), `CATALOG_CONFIG` map (pk field, title/subtitle functions for each catalog type), sub-tab switching handlers, `renderCatalogList()` function that reads catalog data and renders list items, search filter handler.

Wire up JSON export/import buttons.

- [ ] **Step 4: Verify catalog list renders**

Switch to Tab 2. Sub-tabs visible. List shows "Catálogo vacío". Add a record via console and call `renderCatalogList()` — item appears.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add catalog sub-tabs, list panel with search, JSON export/import"
```

---

### Task 6: Catalog forms (right panel CRUD)

**Files:**
- Modify: `convocatoria.html` (JS section)

Renders the appropriate form for each catalog type. Handles create, edit, save, delete.

- [ ] **Step 1: Add form rendering functions**

Add `renderCatalogForm()` which reads the selected record and calls `getCatalogFormHtml()`.

`getCatalogFormHtml(key, record, isNew)` generates form HTML using helper functions for input fields and selects. Each catalog type has its own field set matching the spec:
- Proveedores: CIF, razón social, dirección, CP, localidad, provincia, teléfono, email, responsable
- Centros: tipo doc, documento, nombre, dirección, CP, localidad, provincia, proveedor vinculado (select from proveedores catalog)
- Tutores: tipo doc, documento, nombre, apellido1, apellido2, teléfono, email, horas, proveedor vinculado (note: apellido1 and apellido2 are **separate fields** per spec, required separately for XML `<apellido1>`/`<apellido2>` elements)
- Acciones: código, nombre, grupo, área profesional (FUNDAE_AREAS select), modalidad (select: Presencial/Teleformación/Mixta), horas presenciales, horas teleformación (conditional on modalidad), nivel formación (select: Básico=0 / Superior=1), objetivos (textarea), contenidos (textarea), plataforma fields (collapsible, shown when teleformación/mixta: CIF, razón social, URI, usuario, password), centro vinculado (select from centros catalog), tutor vinculado (select from tutores catalog)

All dynamic values passed to `esc()` before insertion into HTML.

Add `saveCatalogForm()` which reads form values, validates:
- PK field is non-empty
- CIF format (letter + 8 digits) where applicable
- Código acción: 1-5 digits
- Código grupo acción: NNN-NN format (e.g., "087-06")
- Nombre acción: max 255 chars
- Horas: numeric, > 0
If validation fails, show red border on invalid fields and a toast with the first error. If valid, calls `upsertCatalogRecord`, re-renders list and form.

Add `toggleFundaeSub()` function (re-added from removed code, needed for collapsible plataforma section).

Wire up "Nuevo" button, save, delete with referential integrity check for proveedores.

**Constraint:** All user confirmations (delete, referential integrity warnings) MUST use `dialog-overlay` + `dialog-box` modals. NEVER use `prompt()`, `confirm()`, or `alert()` — use `showToast()` for notifications and custom dialogs for confirmations.

- [ ] **Step 2: Verify full CRUD**

Test create, edit, save, delete for all 4 catalog types. Test referential integrity warning when deleting a proveedor with linked centros.

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add catalog form rendering with CRUD for all 4 catalog types"
```

---

### Task 7: Excel template download + import

**Files:**
- Modify: `convocatoria.html` (JS section)

Generates Excel templates per catalog and imports filled templates with validation.

- [ ] **Step 1: Add Excel template generation and import functions**

Add `CATALOG_TEMPLATE_HEADERS` object mapping each catalog type to its column headers.

`downloadCatalogTemplate()` creates a worksheet from headers using `XLSX.utils.aoa_to_sheet`, creates workbook, writes file.

`importCatalogExcel(file)` reads file as ArrayBuffer, parses with XLSX, iterates rows. Each row is validated as a whole: PK must be present, and all required fields must have valid values. **Atomicity per row:** a row with ANY invalid field is rejected entirely — no partial data is imported from that row. Valid rows are upserted. Invalid rows are collected with row number and field name. Shows summary toast with import/error counts. If errors exist, shows an error dialog listing them (row number + field with error).

Wire up buttons and file input.

- [ ] **Step 2: Verify template + import cycle**

Download a proveedores template. Fill in 2 rows. Import. Verify records appear in list.

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add Excel template download and import with validation for catalogs"
```

---

## Chunk 3: Participant Linking + XML Generation Tab

### Task 8: Participant linking in Acciones Formativas

**Files:**
- Modify: `convocatoria.html` (JS — catalog form for acciones)

Adds participant assignment to acciones formativas.

- [ ] **Step 1: Add participant section to acciones form**

In `getCatalogFormHtml`, inside the `key === 'acciones'` block, after tutor vinculado, add a "Participantes vinculados" section. Shows warning if organigrama not loaded. Lists current participants with name and remove button. Shows warning icon for NIFs not found in organigrama. "Asignar" button opens picker.

- [ ] **Step 2: Add participant picker dialog**

`showParticipantPicker(currentNIFs, onSave)` creates a modal using `dialog-overlay` + `dialog-box` pattern (NEVER `prompt()`/`confirm()`) with:
- Text search input (filters by name/NIF)
- Quick filter selects: Empresa, Departamento, Área (matching spec section 7.1)
- Checkbox list of employees from `state.employees`
- Select all / deselect all buttons
- On save, calls the `onSave` callback with the selected NIF array

This function is reusable by Tab 3 as well.

- [ ] **Step 3: Wire up assign button and remove buttons in renderCatalogForm**

After rendering, bind `#btnAssignParticipants` click to open picker. Bind `[data-remove-nif]` buttons to remove NIF from action's participantes array and re-render.

- [ ] **Step 4: Verify participant linking**

Create an acción formativa. Load organigrama. Click "Asignar", select employees, save. Participants appear. Remove one. Reload — persists.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add participant linking to acciones formativas with picker dialog"
```

---

### Task 9: "Cargar desde Acción Formativa" in Tab 1

**Files:**
- Modify: `convocatoria.html` (HTML + JS in Tab 1)

Adds a button to Tab 1 that pre-selects participants from an acción formativa.

- [ ] **Step 1: Add button to filtros section**

After "Limpiar filtros" button, add "Cargar desde Acción Formativa" link button.

- [ ] **Step 2: Add load-from-accion JS**

On click: if no acciones exist, show warning toast. Otherwise show a `dialog-overlay` + `dialog-box` modal (NEVER `prompt()`/`confirm()`) with a select of acciones (showing participant count). On confirm: clear filters, set `excludedNIFs` to exclude everyone NOT in the action's NIF list, re-render. Show toast with count of matched participants.

- [ ] **Step 3: Verify**

Create action with participants. Tab 1, click button, select action. Table shows only those participants.

- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add 'Cargar desde Acción Formativa' to Tab 1 for participant pre-selection"
```

---

### Task 10: XML Generation Tab — layout and participant table

**Files:**
- Modify: `convocatoria.html` (HTML + JS)

Tab 3 left panel has action selection and group config. Right panel has editable participant table.

- [ ] **Step 1: Add Tab 3 left panel HTML**

Replace `#xmlConfigPanel` placeholder with sections:
1. Acción formativa select (`#xmlAccionSelect`) + info text
2. Grupo datos: ID grupo, descripción, responsable, teléfono, RLPT select
3. Centro select (`#xmlCentroSelect`) populated from centros catalog
4. Tutor select (`#xmlTutorSelect`) populated from tutores catalog
5. Calendario: fecha inicio/fin, hora inicio/fin
6. Costes (group-level for XML `<costes>` element): directos, indirectos, salariales. Note: the per-participant `Coste Salarial Hora` from the organigrama is shown in the participant table as reference information for the user to calculate the group salariales total — it is NOT included in the XML per-participant output
7. Three XML generation buttons (Acción, Inicio Grupo, Finalización)

- [ ] **Step 2: Add Tab 3 right panel (editable participant table)**

Replace `#xmlParticipantPanel` content with:
- Summary bar with participant count, "Añadir" button, mass diploma selector
- Scrollable table container (`overflow-x: auto`) with columns: remove, empleado, NIF, tipo doc (select), email, teléfono, categoría, nivel estudios, grupo cotización, diploma (select), coste/hora, discapacidad (checkbox)
- Table body `#xmlParticipantBody`
- Use `min-width` on the table to ensure columns don't compress below readable widths

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add Tab 3 XML generation layout with config panel and participant table"
```

---

### Task 11: Tab 3 logic — populate, map, render participants

**Files:**
- Modify: `convocatoria.html` (JS section)

- [ ] **Step 1: Add Tab 3 state and select population**

Add `xmlState` object with `participantes` array.

`refreshXmlSelects()` populates the acción, centro, and tutor selects from their catalogs. Called when Tab 3 is activated.

On `#xmlAccionSelect` change: load action data, pre-select linked centro/tutor, build participant rows using `buildParticipantRow(nif)` which maps organigrama data using the mapping functions from Task 3.

- [ ] **Step 2: Add participant table rendering**

`renderXmlParticipants()` generates table rows with inline editable fields. Fields with missing required values (categoría, nivelEstudios) get a red background. Binds change/input handlers to update `xmlState.participantes` inline. Remove buttons splice from array and re-render. Mass diploma select updates all participants.

- [ ] **Step 3: Add "Añadir" participant button**

Reuses `showParticipantPicker` with a callback that adds new participants (preserving existing edits) and removes unchecked ones.

- [ ] **Step 4: Verify Tab 3 participant flow**

Load organigrama. Create action with participants. Tab 3, select action. Participants appear with mapped fields. Edit values. Add/remove participants.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add Tab 3 participant loading with FUNDAE mapping and editable table"
```

---

### Task 12: XML generation functions (Tab 3)

**Files:**
- Modify: `convocatoria.html` (JS section)

Rewrite the 3 XML generation functions to pull data from Tab 3.

- [ ] **Step 1: Add new XML generation functions**

`getXmlAccion()`, `getXmlCentro()`, `getXmlTutor()` — helper functions to get selected catalog records.

`genXmlAccionFormativa()` — builds AccionesFormativas XML from the selected acción catalog record. Uses the catalog's `nombre` field as `<nombreAccion>` (NOT `ev.title` from Tab 1 like the old code). Modalidad choice element, optional plataforma fields, empParticipantes from unique CIFs of participants. Uses `esc()` for all values.

`genXmlInicioGrupo()` — builds InicioGrupos XML. jornadaPresencial with centro, lugarImparticion, horario, calendario, Tutor from catalog records. distanciaTeleformacion if applicable. Uses dates/times from Tab 3 form fields.

`genXmlFinalizacion()` — builds FinalizacionGrupo XML. Per-participant data from `xmlState.participantes`: uses `detectTipoDocumento(nif)` for N_TIPO_DOCUMENTO (NOT hardcoded '10'), individual categoría, nivelEstudios, DiplomaAcreditativo (S/N). Validates all participants have required fields. Costes from group-level form fields using nested `<costes><coste><directos>...<indirectos>...<salariales>...</coste></costes>` structure.

All three validate required fields before generating:
- AccionFormativa: action code, name, area, modalidad, hours > 0
- InicioGrupo: centro, tutor, dates, at least 1 participant
- Finalización: all participants must have categoría and nivelEstudios filled (fields with red background indicate missing values — refuse generation with toast listing the first missing field). Note: `grupoCotización` is display-only in the participant table (useful for the user) but is NOT included in the XML output — it is not in the XSD `t_participante` schema

All three use `downloadXML()` helper and show toast on success.

Wire up the three buttons.

- [ ] **Step 2: Verify XML generation end-to-end**

1. Load organigrama in Tab 1
2. Create proveedor, centro, tutor in Tab 2
3. Create acción formativa with participants
4. Go to Tab 3, select action, fill grupo data
5. Generate all 3 XMLs — verify they download and have correct XSD-conformant structure

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: add XML generation functions for Tab 3 using catalog + organigrama data"
```

---

## Chunk 4: Cleanup

### Task 13: Final cleanup and end-to-end verification

**Files:**
- Modify: `convocatoria.html`

- [ ] **Step 1: Remove temporary node_modules**

```bash
rm -rf node_modules package.json package-lock.json
```

(xlsx was only installed temporarily to read the organigrama for analysis)

- [ ] **Step 2: Full end-to-end test**

1. Open `convocatoria.html` fresh (clear localStorage)
2. Tab 1: Load organigrama, filter, select attendees, generate Outlook invite — works
3. Tab 2: Create proveedor, centro, tutor, acción formativa — works
4. Tab 2: Assign participants to acción — works
5. Tab 2: Download template, import Excel — works
6. Tab 2: Export/import JSON — works
7. Tab 1: "Cargar desde Acción Formativa" — works
8. Tab 3: Select acción, verify participants auto-populated with mapped fields — works
9. Tab 3: Edit participant values, set diploma masivo — works
10. Tab 3: Generate 3 XMLs — download and verify structure
11. Reload page — catalog data persists

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "chore: final cleanup and verification"
```
