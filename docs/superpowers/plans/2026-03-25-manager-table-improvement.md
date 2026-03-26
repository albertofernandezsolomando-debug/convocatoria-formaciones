# Manager Table Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Inversión Formativa por Responsable" dashboard table fully interactive — expandable, sortable, clickable, with full names.

**Architecture:** Refactor the IIFE at line ~23732 that renders `dashByManager`. Replace static table with a stateful component that tracks sort state and expanded/collapsed state. Add click handler that navigates to Personas tab with the manager's name as search query.

**Tech Stack:** Vanilla JS, CSS variables from design system, `esc()` for XSS prevention.

---

### Task 1: Replace manager table with interactive version

**Files:**
- Modify: `convocatoria.html:23730-23790` (the dashByManager IIFE)

- [ ] **Step 1: Replace the IIFE**

Replace lines 23732-23790 with the new interactive table that includes:

**Sort state**: `mgrSortCol` (default: 'horasPerCapita'), `mgrSortDir` (default: -1 descending)
**Expand state**: `mgrExpanded` (default: false), `LIMIT = 15`

**Table header**: Each `<th>` has:
- `cursor:pointer; user-select:none`
- Click handler: toggles sort direction if same column, sets new column otherwise
- Arrow indicator (Unicode up/down) on active sort column
- Active column highlighted with `var(--accent)`
- Hover: temporarily accent color

**Table body**: Each `<tr>` has:
- `cursor:pointer` with hover `background: var(--accent-subtle)`
- Click handler: sets `personasSearchInput.value = m.manager` then calls `applyTabChange('tabPersonas')`
- Full manager name: `white-space:normal` (no truncation, no substring)
- Cells use `esc()` for any dynamic text content (via textContent, already safe)
- Presupuesto formatted with `toLocaleString('es-ES')` + EUR symbol
- Percentage color: green >=80%, orange >=50%, red <50%

**Toggle button**: Below the table when mgrs.length > 15:
- `link-btn u-text-xs` class, centered
- Text: "Ver todos (N responsables)" / "Ver menos"
- Click toggles `mgrExpanded` and re-renders

**Re-render function**: `renderMgrTable()` called on sort change, expand toggle, and initial render.

- [ ] **Step 2: Verify JS syntax**

Run the JS syntax check to ensure no errors.

- [ ] **Step 3: Test in browser**

Verify all 5 features:
1. Full names — no truncation
2. Sort — click headers, arrow indicator, ascending/descending toggle
3. Expand — "Ver todos" shows all, "Ver menos" goes back to 15
4. Click row — navigates to Personas tab with manager name in search
5. Dark mode — hover states and colors work

- [ ] **Step 4: Commit, push, copy to OneDrive**

Commit message: "feat: interactive manager table — sortable, expandable, clickable"
Push to remote, copy to OneDrive shared folder.
