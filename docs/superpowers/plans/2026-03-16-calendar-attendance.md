# Calendario Accionable + Asistencia Rápida Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the calendar detail panel into an action hub (estado change, participant editing, convocatoria precarga) and add quick-entry tools for attendance recording.

**Architecture:** All changes in `convocatoria.html` (single-file app). Feature 1 modifies `showCalDetail()` and extracts `preloadConvocatoriaFromAccion()`. Feature 2 extends `renderAsistenciaHtml()` and `bindAsistenciaEvents()`. Bug fix patches `renderAttendanceMonitor()`.

**Tech Stack:** Vanilla JS, localStorage, no dependencies.

**Spec:** `docs/superpowers/specs/2026-03-16-calendar-attendance-design.md`

**IMPORTANT context for implementers:**
- Read `CLAUDE.md` before starting — it has all conventions (CSS variables, utility classes, icon system, accessibility patterns, etc.)
- This is a ~23,800-line single HTML file. All CSS/HTML/JS is inline.
- Use `esc(s)` for ANY user-facing string that is set via innerHTML. All innerHTML usage in this codebase is intentional and uses the project's `esc()` sanitizer for XSS prevention.
- Use CSS variables for ALL colors, fonts, shadows, radii, z-index — NEVER hardcode.
- Use `showToast()` for notifications — NEVER `alert()`.
- Icons: `Icons.name(size)` — NEVER emojis or Unicode.
- Always commit + push after each task.

---

## Chunk 1: Bug fix + extract preloadConvocatoriaFromAccion

### Task 1: Fix dashboard attendance monitor indexing bug

**Files:**
- Modify: `convocatoria.html` — `renderAttendanceMonitor()` function (search for `function renderAttendanceMonitor`)

The attendance dashboard monitor is silently broken. `sesiones` is an array of date strings (`['2025-03-15', ...]`), but the code treats them as objects with a `.fecha` property and indexes `registro[nif]` by date string instead of array index.

- [ ] **Step 1: Fix session mapping loop**

Find this code inside `renderAttendanceMonitor` (the `sesiones.map` call):

```javascript
        var sessionData = sesiones.map(function(s) {
          var fecha = s.fecha;
          var present = 0;
          var total = nifs.length;
          nifs.forEach(function(nif) {
            var asistNif = registro[nif];
            if (asistNif && asistNif[fecha]) {
              var val = asistNif[fecha];
              if (val === true || val === 'presente' || val === 'Presente') {
                present++;
              }
            }
          });
          return { fecha: fecha, present: present, total: total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
        });
```

Replace with:

```javascript
        var sessionData = sesiones.map(function(s, idx) {
          var present = 0;
          var total = nifs.length;
          nifs.forEach(function(nif) {
            var asistNif = registro[nif];
            if (asistNif && asistNif[idx] === true) {
              present++;
            }
          });
          return { fecha: s, present: present, total: total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
        });
```

- [ ] **Step 2: Fix abandonment detection loop**

Find this code inside `renderAttendanceMonitor` (the `nifs.forEach` / `sesiones.forEach` nested loop):

```javascript
          sesiones.forEach(function(s) {
            var asistNif = registro[nif];
            if (asistNif && asistNif[s.fecha]) {
              var val = asistNif[s.fecha];
              if (val === true || val === 'presente' || val === 'Presente') attended++;
            }
          });
```

Replace with:

```javascript
          sesiones.forEach(function(s, idx) {
            var asistNif = registro[nif];
            if (asistNif && asistNif[idx] === true) attended++;
          });
```

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "fix: dashboard attendance monitor — use array index instead of date key

sesiones is string[], not object[]. s.fecha was always undefined.
registro[nif] is boolean[], not keyed by date. Both caused silent no-ops.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

### Task 2: Extract preloadConvocatoriaFromAccion() reusable function

**Files:**
- Modify: `convocatoria.html` — extract inline logic from `btnLoadFromAccion` handler into named function

The precarga logic (clear filters, set excludedNIFs, fill event form) is currently inline inside a click handler. Extract it so the calendar can reuse it.

- [ ] **Step 1: Add the reusable function**

Search for the comment `// VIRTUAL SCROLL FOR LARGE DATASETS`. Insert the new function BEFORE that section comment:

```javascript
    function preloadConvocatoriaFromAccion(codigo) {
      var acciones = getCatalog('acciones');
      var accion = acciones.find(function(a) { return a.codigo === codigo; });
      if (!accion) { showToast('Acción formativa no encontrada', 'error'); return 0; }

      var nifs = accion.participantes || [];
      if (nifs.length === 0) {
        showToast('La acción no tiene participantes vinculados', 'warning');
        return 0;
      }

      // Clear all filters
      state.activeFilters = {};

      // Set excludedNIFs to exclude everyone NOT in the nif list
      var nifSet = new Set(nifs);
      state.excludedNIFs = new Set(
        state.employees.filter(function(emp) { return !nifSet.has(emp.NIF); }).map(function(emp) { return emp._id; })
      );

      // Auto-fill event fields from accion formativa
      if (accion.nombre) {
        document.getElementById('eventTitle').value = accion.nombre;
        document.getElementById('eventTitle').classList.remove('error');
      }

      // Set Teams / Presencial based on modalidad
      var modalidad = (accion.modalidad || '').toLowerCase();
      if (modalidad === 'teleformación' || modalidad === 'teleformacion') {
        document.querySelector('input[name="eventType"][value="teams"]').checked = true;
      } else if (modalidad === 'presencial') {
        document.querySelector('input[name="eventType"][value="presencial"]').checked = true;
      }
      var checkedRadio = document.querySelector('input[name="eventType"]:checked');
      if (checkedRadio) checkedRadio.dispatchEvent(new Event('change', { bubbles: true }));

      // Set formador from linked tutor
      if (accion.tutorVinculado) {
        var tutores = getCatalog('tutores');
        var tutor = tutores.find(function(t) { return t.documento === accion.tutorVinculado; });
        if (tutor) {
          var tutorName = [tutor.nombre, tutor.apellido1, tutor.apellido2].filter(Boolean).join(' ');
          document.getElementById('eventFormador').value = tutorName;
        }
      }

      saveState();

      var matched = state.employees.filter(function(emp) { return nifSet.has(emp.NIF); }).length;
      return matched;
    }
```

- [ ] **Step 2: Refactor existing btnLoadFromAccion handler to use the new function**

Find the `btnLoadFromAccion` click handler. Inside the `loadAccionConfirm` click handler, locate the block that starts with `// Clear all filters` and ends with the toast message. Replace that entire block (from `// Clear all filters` through the toast and `releaseFocus(overlay); overlay.remove();`) with:

```javascript
        var matched = preloadConvocatoriaFromAccion(codigo);
        if (matched > 0) {
          renderFilters();
          renderTable();
        }
        releaseFocus(overlay); overlay.remove();

        var accionLabel = accion.nombre || accion.codigo;
        showToast('Datos de "' + accionLabel + '" cargados (' + matched + ' participantes). Completa fecha y sala.', 'success');
```

Note: keep the variable declarations for `codigo` and `accion` above. Only replace the filter/excludedNIFs/form-fill/toast block.

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "refactor: extract preloadConvocatoriaFromAccion() for reuse by calendar

Moved filter clearing, excludedNIFs setup, and event form autofill
from inline btnLoadFromAccion handler into named function.
Existing behavior unchanged.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

## Chunk 2: Calendar actionable panel

### Task 3: Replace showCalDetail with actionable version

**Files:**
- Modify: `convocatoria.html` — `showCalDetail(item)` function (search for `function showCalDetail`)

Replace the entire function body with an enriched version that adds: estado dropdown, participant list with edit, and convocar button.

- [ ] **Step 1: Replace showCalDetail function**

Find and replace the entire `showCalDetail` function (from `function showCalDetail(item) {` to its closing `}` — the function ends just before `// RLT ANNUAL TRAINING BALANCE`). The complete replacement code is in the spec's "Panel layout" section and the detailed design for sections A-D.

The implementer should:
a) Read the spec at `docs/superpowers/specs/2026-03-16-calendar-attendance-design.md` sections A-D
b) Read the current `showCalDetail` function to understand existing patterns
c) Build the replacement following the spec's panel layout, using these key patterns:
   - Estado: `<select id="calDetailEstado">` with all estados from `CAL_ESTADO_COLORS`, `change` handler saves via `upsertCatalogRecord` + updates bar color + audit note to `record.notas`
   - Participants: resolve names via `state.employees`, max 5 + "+N más", "Editar" link calls `showParticipantPicker(nifs, onSave)`, onSave syncs `record.asistencia.registro` (add empty arrays for new NIFs, delete for removed)
   - Convocar: checks `state.employees.length > 0`, calls `preloadConvocatoriaFromAccion(item.codigo)`, switches tab via `applyTabChange('tabConvocatoria')`, calls `renderFilters()` + `renderTable()`
   - Close + "Ver en catálogo": same pattern as current code
   - All user-facing strings sanitized with `esc()`. All innerHTML usage follows existing app patterns with esc() sanitization.

- [ ] **Step 2: Verify the function compiles**

```bash
node -e "require('fs').readFileSync('convocatoria.html','utf8')" && echo "File reads OK"
```

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: actionable calendar detail panel — estado dropdown, participants, convocar

- Estado: inline dropdown with audit note + Gantt bar color update
- Participants: name list (max 5 + N mas) with edit via showParticipantPicker
- Convocar: precarga to Convocatoria tab via preloadConvocatoriaFromAccion()
- All changes save via upsertCatalogRecord, no full re-render needed

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

## Chunk 3: Attendance quick-entry

### Task 4: Add "Todos presentes" icon button per session

**Files:**
- Modify: `convocatoria.html` — `renderAsistenciaHtml()` and `bindAsistenciaEvents()`

- [ ] **Step 1: Add check icon button next to each session header**

In `renderAsistenciaHtml()`, find the session header column rendering. Search for `cfToggleAllSesion` in the function. After the toggle-all `</label>` closing, add a "mark all present" icon button:

Find this pattern (inside the session header loop):
```javascript
            ' todos</label>' +
```

After it, add:
```javascript
            '<button class="cfMarkAllPresent link-btn u-text-accent" data-sesion-idx="' + i + '" title="Marcar todos presentes" style="margin-left:4px; padding:0; border:none; background:none; cursor:pointer; vertical-align:middle;">' + Icons.check(12) + '</button>' +
```

- [ ] **Step 2: Bind the "mark all present" button events**

In `bindAsistenciaEvents(record)`, after the toggle-all checkbox binding block (search for the `cfToggleAllSesion` block's closing `}`), add a new binding for `.cfMarkAllPresent` buttons that:
- Reads `data-sesion-idx`
- Checks if all participants already present (toggle behavior)
- Sets all `registro[nif][sIdx]` to `!allPresent`
- Saves via `upsertCatalogRecord`, re-renders form, shows toast

- [ ] **Step 3: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: attendance 'mark all present' icon button per session

Toggle button next to each session column header.
Complements existing toggle-all checkbox with more visible action.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

### Task 5: Add "Registro rápido" inline panel

**Files:**
- Modify: `convocatoria.html` — `renderAsistenciaHtml()` and `bindAsistenciaEvents()`

This adds a collapsible panel between the "add session" row and the attendance table, with session selector, mode radio buttons, text area for names/NIFs, and apply button.

- [ ] **Step 1: Add the registro rápido HTML in renderAsistenciaHtml()**

In `renderAsistenciaHtml()`, find where the "add session" row ends and the attendance table begins. After the add-session row's closing `</div>` and before the `if (sesiones.length > 0)` check that starts the table, insert the panel HTML.

The panel structure (only shown when `sesiones.length > 0 && participantes.length > 0`):
- Toggle button: `id="cfToggleRegistroRapido"` — "Registro rápido ▾" with `Icons.edit(14)` (check if `Icons.zap` exists first; if not, use `Icons.edit`)
- Collapsible container: `id="cfRegistroRapido"` with class `u-hidden`
- Session dropdown: `id="cfRrSesion"` — options from `sesiones` array, pre-selects last
- Mode radios: `name="cfRrMode"`, values `ausencias` (default checked) and `presentes`
- Textarea: `id="cfRrInput"` — placeholder about names/NIFs
- Apply button: `id="cfRrApply"` — class `btn btn-primary`

All with CSS variables, `esc()` sanitization for values inserted into HTML strings.

- [ ] **Step 2: Add matching logic and event binding in bindAsistenciaEvents()**

At the end of `bindAsistenciaEvents(record)`, before the function's closing `}`, add handlers for:

**Toggle button** (`cfToggleRegistroRapido`): toggles `u-hidden` on `cfRegistroRapido`.

**Apply button** (`cfRrApply`):
1. Read session index from `cfRrSesion`, mode from `cfRrMode` radios, input from `cfRrInput`
2. Parse tokens: split by `,`, `;`, `\n`; trim; deduplicate
3. Handle empty input: in `ausencias` mode marks all present with explicit toast; in `presentes` mode shows warning and returns
4. Match each token against `record.participantes`:
   a. Exact NIF match
   b. Exact full name match (case-insensitive via `state.employees`)
   c. Partial name match (contains, case-insensitive) — only if exactly 1 participant matches; if 2+ report as "ambiguo"
   d. If no organigrama loaded, only NIF matching; warn once
5. Apply based on mode:
   - `ausencias`: set all `registro[nif][sesionIdx] = true`, then set matched NIFs to `false`
   - `presentes`: set all `registro[nif][sesionIdx] = false`, then set matched NIFs to `true`
6. Ensure `registro[nif]` arrays exist (init with `new Array(sesLen).fill(false)` if missing)
7. Save via `upsertCatalogRecord`, call `renderCatalogForm()` to re-render
8. Toast with counts: "Sesión dd/mm: N presentes, M ausentes" + unmatched warnings

- [ ] **Step 3: Verify Icons availability**

```bash
grep -c 'zap:' convocatoria.html
```

If 0, replace `Icons.zap(14)` with `Icons.edit(14)` in Step 1.

- [ ] **Step 4: Commit + push**

```bash
git add convocatoria.html && git commit -m "feat: attendance 'Registro rapido' — bulk mark by ausencias/presentes mode

Collapsible panel with session selector, mode toggle, and text area.
Fuzzy matching: exact NIF, exact name, partial name (unambiguous only).
Ausencias mode: marks all present, listed names absent.
Presentes mode: marks all absent, listed names present.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" && git push
```

---

## Chunk 4: Verification

### Task 6: Final verification

- [ ] **Step 1: Verify no syntax errors**

```bash
node -e "require('fs').readFileSync('convocatoria.html','utf8')" && echo "File reads OK"
```

- [ ] **Step 2: Verify preloadConvocatoriaFromAccion exists**

```bash
grep -c 'function preloadConvocatoriaFromAccion' convocatoria.html
```

Expected: `1`

- [ ] **Step 3: Verify calDetailEstado exists in showCalDetail**

```bash
grep -c 'calDetailEstado' convocatoria.html
```

Expected: at least `2` (one in HTML, one in addEventListener)

- [ ] **Step 4: Verify cfRegistroRapido exists**

```bash
grep -c 'cfRegistroRapido' convocatoria.html
```

Expected: at least `2`

- [ ] **Step 5: Verify attendance monitor fix**

```bash
grep -n 'asistNif\[fecha\]\|s\.fecha' convocatoria.html
```

Expected: `0` matches (all replaced with array index)

- [ ] **Step 6: Push all commits**

```bash
git push
```
