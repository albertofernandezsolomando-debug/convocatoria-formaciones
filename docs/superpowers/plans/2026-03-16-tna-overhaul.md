# TNA Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the free-text TNA system with structured training needs linked to real organizational positions (puestos), with competency context and an explorer view.

**Architecture:** All changes in `convocatoria.html` (single-file app). Replace existing TNA code (lines 11044-11271) with new data layer + two-view UI (explorador de puestos + lista de necesidades). Extend catalog import/backup to include puestos.

**Tech Stack:** Vanilla JS, localStorage, no dependencies.

**Spec:** `docs/superpowers/specs/2026-03-15-tna-overhaul-design.md`

**IMPORTANT context for implementers:**
- Read `CLAUDE.md` before starting — it has all conventions (CSS variables, utility classes, icon system, accessibility patterns, etc.)
- This is a ~22,900-line single HTML file. All CSS/HTML/JS is inline.
- Use `esc(s)` for ANY user-facing string in innerHTML (XSS prevention).
- Use CSS variables for ALL colors, fonts, shadows, radii, z-index — NEVER hardcode.
- Use `u-hidden` class for visibility toggling (NOT `style.display`).
- Use `showToast()` for notifications — NEVER `alert()`.
- Dialogs: `dialog-overlay` + `dialog-box` pattern with `role="dialog"`, `aria-modal="true"`, `trapFocus`/`releaseFocus`.
- Icons: `Icons.name(size)` — NEVER emojis or Unicode.
- Always commit + push after each task.

---

## Chunk 1: Data layer + BACKUP_KEYS + import logic

### Task 1: Add BACKUP_KEYS entries + puestos access functions

**Files:**
- Modify: `convocatoria.html:6702-6718` (BACKUP_KEYS array)
- Modify: `convocatoria.html:11044` (insert puestos section before TNA section)

- [ ] **Step 1: Add puestos and TNA to BACKUP_KEYS**

At line 6717, after `'convocatoria_unifiedTemplates'`, add:

```javascript
      'convocatoria_unifiedTemplates',
      'convocatoria_puestos_catalog',
      'convocatoria_tnaRequests'
    ];
```

- [ ] **Step 2: Add puestos catalog access functions**

Insert BEFORE line 11044 (the TNA section header `// MINI-TNA`), a new section:

```javascript
    // ═══════════════════════════════════
    // PUESTOS CATALOG
    // ═══════════════════════════════════

    function getPuestosCatalog() {
      try { return JSON.parse(localStorage.getItem('convocatoria_puestos_catalog')) || []; }
      catch(e) { return []; }
    }

    function savePuestosCatalog(data) {
      localStorage.setItem('convocatoria_puestos_catalog', JSON.stringify(data));
    }

    function getEmployeeCountByPuesto(puestoNombreOrg) {
      if (!state.employees || !state.employees.length) return -1;
      var normalizedTarget = puestoNombreOrg.toLowerCase().replace(/\s+/g, ' ').trim();
      return state.employees.filter(function(e) {
        return e.Puesto && e.Puesto.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedTarget;
      }).length;
    }

    function getPuestoByNombre(nombre) {
      var catalog = getPuestosCatalog();
      for (var i = 0; i < catalog.length; i++) {
        if (catalog[i].nombre === nombre) return catalog[i];
      }
      return null;
    }
```

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: puestos catalog access functions + BACKUP_KEYS for TNA/puestos

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

### Task 2: Extend catalog import to handle puestos

**Files:**
- Modify: `convocatoria.html:6663-6696` (exportCatalogsJSON + importCatalogsJSON)

- [ ] **Step 1: Add puestos to exportCatalogsJSON**

In `exportCatalogsJSON` (line 6663), add `puestos` to the export data object. After the line `acciones: getCatalog('acciones')`, add a comma and `puestos: getPuestosCatalog()`.

- [ ] **Step 2: Add puestos to importCatalogsJSON**

In `importCatalogsJSON` (line 6679), after the line `if (data.acciones) saveCatalog('acciones', data.acciones);`, add:

```javascript
          if (data.puestos && Array.isArray(data.puestos)) savePuestosCatalog(data.puestos);
```

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: catalog import/export includes puestos catalog

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

### Task 3: TNA data migration + enhanced getTNARequests

**Files:**
- Modify: `convocatoria.html` — the `getTNARequests` function (now after the puestos section)

- [ ] **Step 1: Replace getTNARequests with migration-aware version**

Replace the existing `getTNARequests` function body with:

```javascript
    function getTNARequests() {
      try {
        var requests = JSON.parse(localStorage.getItem('convocatoria_tnaRequests') || '[]');
        var migrated = false;
        for (var i = 0; i < requests.length; i++) {
          var r = requests[i];
          if (!r.hasOwnProperty('puestos')) {
            r.puestos = [];
            r.skill = r.skill || '';
            r.origen = r.area || '';
            r.numEmpleados = 0;
            r.areas = r.area ? [r.area] : [];
            r.nivelCarrera = '';
            migrated = true;
          }
        }
        if (migrated) saveTNARequests(requests);
        return requests;
      } catch(e) { return []; }
    }
```

The `saveTNARequests` function stays unchanged.

- [ ] **Step 2: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: TNA data migration — old requests get puestos/skill/origen fields

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

## Chunk 2: TNA UI — complete replacement

### Task 4: Replace entire TNA UI (renderTNAView + explorador + necesidades + forms)

**Files:**
- Modify: `convocatoria.html` — replace everything from `renderTNAView` through `deleteTNARequest` (lines 11058-11271) with the complete new TNA UI system

This is the largest task. Replace the entire block (lines 11058-11271) with the following functions in order:

1. `tnaState`, `tnaExploradorState`, `tnaNecesidadesState` — state objects
2. `renderTNAView()` — shell with sub-navigation
3. `renderTNAExplorador()` + `bindTNAExploradorEvents()` — puestos explorer
4. `renderTNANecesidades()` + `bindTNANecesidadesEvents()` — needs list
5. `changeTNAEstado()` — approve/reject
6. `showTNAForm()` — creation/edit dialog with puesto multi-select
7. `convertTNAToAction()` — enhanced conversion with codigo
8. `deleteTNARequest()` — stays similar to current

- [ ] **Step 1: Delete lines 11058-11271 and replace with new TNA UI system**

The complete replacement code follows. Key design decisions:
- `renderTNAView` builds the shell with header, sub-tabs, and delegates to sub-renderers
- Explorador: filterable table of puestos, click to expand (shows skills, purpose, responsibilities), button to create need
- Necesidades: table with filters (estado, urgencia, search), click to expand (justificación, linked puestos detail, action buttons)
- `showTNAForm(preSelectedPuestos, editId)`: dialog with puesto typeahead multi-select, skill chips from selected puestos, standard form fields
- `convertTNAToAction`: generates unique `codigo` from max existing + 1, includes full context in nota
- All user text sanitized with `esc()`, all colors via CSS variables, all icons via `Icons.*`

**The code for this step is extensive (~500 lines). The implementer should:**

a) Read the spec at `docs/superpowers/specs/2026-03-15-tna-overhaul-design.md` for full context
b) Read the current TNA code (lines 11058-11271) to understand the patterns being replaced
c) Read `CLAUDE.md` for conventions
d) Implement the replacement following these function signatures and behaviors:

**`renderTNAView()`** — Main render function:
- Gets requests via `getTNARequests()` and puestos via `getPuestosCatalog()`
- Builds header with "Necesidades formativas" title + "Nueva solicitud" button
- Builds two sub-tab buttons: "Explorar puestos (N)" and "Necesidades (N)"
- Renders active sub-view via `renderTNAExplorador()` or `renderTNANecesidades()`
- Binds all event listeners

**`renderTNAExplorador(puestos)`** — Returns HTML string:
- Empty state if no puestos catalog
- Search input filtering by nombre, area, skills
- Table: Puesto (nombreOrganigrama), Área, Nivel (nivelCarrera), Empleados (from organigrama, -1="—")
- Click row: toggle expanded detail showing purpose, skills (chips), responsibilities (with %), PC range
- "Crear necesidad para este puesto" button in expanded detail

**`renderTNANecesidades(requests)`** — Returns HTML string:
- Empty state if no requests
- Filter bar: search + estado dropdown + urgencia dropdown
- Table: Tema, Puesto(s), Competencia, Urgencia (badge), Estado (badge), Origen, Personas, Fecha
- Click row: toggle expanded detail showing justificación, linked puestos detail, action buttons
- Action buttons: Editar, Crear acción (if not convertida), Aprobar/Rechazar (if pendiente), Eliminar

**`showTNAForm(preSelectedPuestos, editId)`** — Dialog:
- Field 1: Puesto(s) multi-select with typeahead dropdown, chips for selected
- Field 2: Competencia/Skill with clickable chips from selected puestos' skills
- Field 3: Tema (required)
- Field 4: Justificación (textarea)
- Field 5: Urgencia (select)
- Field 6: Origen (text input)
- On save: compute numEmpleados, areas, nivelCarrera from selected puestos
- Edit mode: pre-fills all fields, updates existing request

**`convertTNAToAction(requestId)`** — Enhanced:
- Auto-generates `codigo` (max existing + 1)
- Sets `departamento` from request.areas
- Sets `plazas` from request.numEmpleados
- Rich nota with skill, puestos, justificación

**`changeTNAEstado(requestId, nuevoEstado)`** — Simple state change with toast

**`deleteTNARequest(requestId)`** — Confirm dialog, same pattern as current

- [ ] **Step 2: Verify the tab handler at line 8216 still calls renderTNAView()**

The catalog tab switching code at line 8216 calls `renderTNAView()` — this should continue to work since we're replacing the function body, not renaming it.

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: TNA overhaul — explorador de puestos + structured needs with puesto linkage

Complete replacement of TNA UI:
- Explorador: filterable puestos table with skills/purpose detail
- Necesidades: table with filters, expandable detail, state management
- Creation/edit dialog with puesto multi-select and skill chips
- Enhanced acción conversion with auto-generated codigo
- Data migration from old free-text format

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

## Chunk 3: Test data + verification

### Task 5: Update test-data.js

**Files:**
- Modify: `test-data.js` — add puestos catalog sample, update TNA requests to new format

- [ ] **Step 1: Add puestos catalog sample**

Add a `convocatoria_puestos_catalog` localStorage entry with 10 sample positions covering different areas (Comercial, Finanzas, RRHH, Operaciones, Marketing, Logística) and levels (M3-M6, P2-P3, S1-S2). Each should have: id, nombre, nombreOrganigrama, area, nivelCarrera, pcRange, purpose, skills (3-5), responsibilities (2-3 with percentages), puntosTotales, enUso.

- [ ] **Step 2: Update TNA requests to new format**

Replace existing TNA requests with entries using the new model: puestos (array referencing catalog nombres), skill, tema, justificacion, urgencia, estado, origen, createdAt, numEmpleados, areas, nivelCarrera.

- [ ] **Step 3: Commit + push**

```bash
git add test-data.js && git commit -m "feat: test-data.js — puestos catalog sample + TNA in new format

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

### Task 6: Final verification

- [ ] **Step 1: Verify no syntax errors**

```bash
node -e "require('fs').readFileSync('convocatoria.html','utf8')" && echo "File reads OK"
```

- [ ] **Step 2: Verify BACKUP_KEYS includes new entries**

```bash
grep -A 22 'BACKUP_KEYS' convocatoria.html | head -25
```

Expected: `convocatoria_puestos_catalog` and `convocatoria_tnaRequests` present.

- [ ] **Step 3: Verify no references to old TNA area field in TNA section**

```bash
grep -n 'r\.area\b' convocatoria.html
```

Should not appear in the TNA section (old field replaced by puestos/origen).

- [ ] **Step 4: Push all commits**

```bash
git push
```
