# Organigrama Sync Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-restore organigrama on page load; cascade employee changes (bajas/altas) to acciones and compliance automatically.

**Architecture:** All changes in `convocatoria.html`. New function `cascadeOrganigramaChanges(diff)` inserted into `processParseResult()` after diff, before state replacement. Auto-restore replaces manual restore button click. Two existing bugs fixed opportunistically.

**Tech Stack:** Vanilla JS, localStorage, no dependencies.

**Spec:** `docs/superpowers/specs/2026-03-15-organigrama-sync-design.md`

---

## Chunk 1: Bug fixes + cascadeOrganigramaChanges

### Task 1: Fix `compareOrganigrams` field name bug

**Files:**
- Modify: `convocatoria.html:12220-12221`

- [ ] **Step 1: Fix field name from DEPARTAMENTO to Departamento**

At line 12220, replace `DEPARTAMENTO` with `Departamento` (the actual column name from `RELEVANT_COLUMNS` at line 10216).

```javascript
// BEFORE (line 12220):
else if ((oldByNif[nif].DEPARTAMENTO || '') !== (newByNif[nif].DEPARTAMENTO || '')) {
  changed.push({ nif: nif, oldDept: oldByNif[nif].DEPARTAMENTO, newDept: newByNif[nif].DEPARTAMENTO });

// AFTER:
else if ((oldByNif[nif].Departamento || '') !== (newByNif[nif].Departamento || '')) {
  changed.push({ nif: nif, oldDept: oldByNif[nif].Departamento, newDept: newByNif[nif].Departamento });
```

- [ ] **Step 2: Fix orphan check terminal state bug**

At line 12247, replace `'Cerrada'` with proper terminal states.

```javascript
// BEFORE (line 12247):
var activeActions = getCatalog('acciones').filter(function(a) { return a.estado !== 'Cerrada'; });

// AFTER:
var activeActions = getCatalog('acciones').filter(function(a) { return a.estado !== 'Terminada' && a.estado !== 'Anulada'; });
```

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "fix: compareOrganigrams field name + orphan check terminal states

- Departamento was DEPARTAMENTO (all caps) — never matched, dept changes undetected
- Orphan check filtered by non-existent estado 'Cerrada' instead of Terminada/Anulada

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Implement `cascadeOrganigramaChanges(diff)`

**Files:**
- Modify: `convocatoria.html` — insert new function after `compareOrganigrams` (after line 12226), call it from `processParseResult` (line 12257)

- [ ] **Step 1: Write `cascadeOrganigramaChanges` function**

Insert after line 12226 (after `compareOrganigrams` function ends):

```javascript
function cascadeOrganigramaChanges(diff) {
  var cascadeLog = { removedFromAcciones: 0, accionesAffected: 0, complianceDeactivated: 0, complianceEnrolled: 0 };

  // B.1: Remove bajas from future/active acciones
  if (diff.removed.length > 0) {
    var removedNifs = new Set(diff.removed.map(function(e) { return e.NIF; }));
    var acciones = getCatalog('acciones');
    var modified = false;

    acciones.forEach(function(a) {
      if (a.estado === 'Terminada' || a.estado === 'Anulada') return;
      var participantes = a.participantes || [];
      var toRemove = participantes.filter(function(nif) { return removedNifs.has(nif); });
      if (toRemove.length === 0) return;

      // Remove NIFs from participantes
      a.participantes = participantes.filter(function(nif) { return !removedNifs.has(nif); });

      // Clean up confirmaciones and asistencia
      toRemove.forEach(function(nif) {
        if (a.confirmaciones) delete a.confirmaciones[nif];
        if (a.asistencia && a.asistencia.registro) delete a.asistencia.registro[nif];

        // Audit note
        var empName = (diff.removed.find(function(e) { return e.NIF === nif; }) || {}).Empleado || nif;
        if (!a.notas) a.notas = [];
        a.notas.push({
          id: Date.now() + Math.random(),
          date: new Date().toISOString(),
          tag: 'sistema',
          text: 'Baja automática: ' + empName + ' — no presente en organigrama'
        });
      });

      cascadeLog.removedFromAcciones += toRemove.length;
      cascadeLog.accionesAffected++;
      modified = true;
    });

    if (modified) saveCatalog('acciones', acciones);
  }

  // B.2: Deactivate compliance records for bajas
  if (diff.removed.length > 0) {
    var removedNifs2 = diff.removed.map(function(e) { return e.NIF; });
    var records = state.complianceRecords;
    var today = new Date().toISOString().slice(0, 10);

    removedNifs2.forEach(function(nif) {
      Object.keys(records).forEach(function(key) {
        if (key.startsWith(nif + '|') && !records[key].inactivo) {
          records[key].inactivo = true;
          records[key].motivoBaja = 'No presente en organigrama (' + today + ')';
          cascadeLog.complianceDeactivated++;
        }
      });
    });

    if (cascadeLog.complianceDeactivated > 0) saveCompliance();
  }

  // B.3: Auto-enroll altas in mandatory compliance
  if (diff.added.length > 0 && state.complianceTypes.length > 0) {
    var records3 = state.complianceRecords;
    diff.added.forEach(function(emp) {
      var nif = emp.NIF;
      if (!nif) return;
      state.complianceTypes.forEach(function(ct) {
        var key = nif + '|' + ct.id;
        if (!records3[key]) {
          records3[key] = { date: '' }; // empty date = pending
          cascadeLog.complianceEnrolled++;
        }
      });
    });

    if (cascadeLog.complianceEnrolled > 0) saveCompliance();
  }

  // Summary toasts
  if (cascadeLog.removedFromAcciones > 0) {
    showToast(cascadeLog.removedFromAcciones + ' persona' + (cascadeLog.removedFromAcciones !== 1 ? 's' : '') + ' dada' + (cascadeLog.removedFromAcciones !== 1 ? 's' : '') + ' de baja en ' + cascadeLog.accionesAffected + ' acci' + (cascadeLog.accionesAffected !== 1 ? 'ones' : 'ón') + ' activa' + (cascadeLog.accionesAffected !== 1 ? 's' : ''), 'info', 6000);
  }
  if (cascadeLog.complianceDeactivated > 0) {
    showToast(cascadeLog.complianceDeactivated + ' registro' + (cascadeLog.complianceDeactivated !== 1 ? 's' : '') + ' de compliance desactivado' + (cascadeLog.complianceDeactivated !== 1 ? 's' : ''), 'info', 5000);
  }
  if (cascadeLog.complianceEnrolled > 0) {
    showToast(cascadeLog.complianceEnrolled + ' inscripci' + (cascadeLog.complianceEnrolled !== 1 ? 'ones' : 'ón') + ' de formación obligatoria creada' + (cascadeLog.complianceEnrolled !== 1 ? 's' : ''), 'success', 5000);
  }

  // E: Warn about stale queue emails
  if (diff.removed.length > 0 && state.queue && state.queue.length > 0) {
    var removedEmails = new Set();
    diff.removed.forEach(function(e) { if (e['Email trabajo']) removedEmails.add(e['Email trabajo'].toLowerCase()); });
    var staleCount = 0;
    state.queue.forEach(function(qi) {
      (qi.emails || []).forEach(function(email) {
        if (removedEmails.has(email.toLowerCase())) staleCount++;
      });
    });
    if (staleCount > 0) {
      showToast(staleCount + ' email' + (staleCount !== 1 ? 's' : '') + ' en cola pertenece' + (staleCount !== 1 ? 'n' : '') + ' a personas no presentes en organigrama', 'warning', 8000);
    }
  }
}
```

- [ ] **Step 2: Call cascadeOrganigramaChanges from processParseResult**

At line 12257 (after the orphan check warning toast, before `state.employees = result.employees`), insert the cascade call inside the existing `if (hasDiff)` block:

```javascript
// After line 12256 (closing brace of atRisk check), add:
        // Cascade changes to acciones and compliance
        cascadeOrganigramaChanges(diff);
```

The insertion point is right before line 12257 (the closing brace of `if (hasDiff)`). The cascade must run BEFORE `state.employees = result.employees` (line 12259) because it needs the old employee names for audit notes.

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: cascadeOrganigramaChanges — auto-sync bajas/altas to acciones + compliance

- B.1: Remove departed employees from future acciones (+ audit notes, cleanup confirmaciones/asistencia)
- B.2: Deactivate compliance records for departed employees (inactivo flag, not deleted)
- B.3: Auto-enroll new employees in all mandatory compliance types (pending records)
- B.E: Warn about stale emails in queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Auto-restore + compliance renderer + validation warning

### Task 3: Auto-restore organigrama on page load

**Files:**
- Modify: `convocatoria.html:14809-14893` (RESTORE PREVIOUS SESSION section)

- [ ] **Step 1: Convert restore button click handler to auto-execute**

Replace the restore section (lines 14809-14893). The new code auto-restores if saved employees exist, and keeps the restore button as a secondary re-trigger option:

```javascript
// ═══════════════════════════════════
// RESTORE PREVIOUS SESSION
// ═══════════════════════════════════

try {
  const savedEmployees = localStorage.getItem('convocatoria_employees');
  const savedFileName = localStorage.getItem('convocatoria_fileName');
  const savedState = localStorage.getItem('convocatoria_state');

  if (savedEmployees) {
    const employees = JSON.parse(savedEmployees);
    if (employees.length > 0) {
      // Auto-restore employees
      state.employees = employees;

      // Restore state if available
      if (savedState) {
        try {
          const snapshot = JSON.parse(savedState);
          state.activeFilters = snapshot.activeFilters || {};
          state.excludedNIFs = new Set(snapshot.excludedNIFs || []);

          if (snapshot.eventConfig) {
            const ec = snapshot.eventConfig;
            document.getElementById('eventTitle').value = ec.title || '';
            document.getElementById('eventDate').value = ec.date || '';
            document.getElementById('eventStart').value = ec.startTime || '10:00';
            document.getElementById('eventEnd').value = ec.endTime || '12:00';
            document.getElementById('eventLocation').value = ec.location || '';
            document.getElementById('eventBody').value = ec.body || '';
            if (ec.isTeams) {
              document.querySelector('input[name="eventType"][value="teams"]').checked = true;
            }
            if (ec.isSeries) {
              document.getElementById('seriesCheck').checked = true;
              document.getElementById('seriesConfig').classList.add('visible');
            }
            document.getElementById('eventFormador').value = ec.formador || '';
            if (ec.capacity) {
              document.getElementById('inputCapacity').value = ec.capacity;
            }
            const surveyCheck = document.getElementById('surveyCheck');
            if (surveyCheck) {
              surveyCheck.checked = ec.sendSurvey !== undefined ? ec.sendSurvey : true;
            }
          }
        } catch(e) {}
      }

      // Update UI
      uploadZone.classList.add('loaded');
      uploadPrompt.style.display = 'none';
      uploadInfo.style.display = 'block';
      fileNameEl.textContent = savedFileName || 'Organigrama (sesión anterior)';
      fileStats.textContent = employees.length + ' personas trabajadoras activas · restaurado automáticamente';

      document.getElementById('filtrosSection').style.display = '';
      document.getElementById('eventoSection').style.display = '';
      document.getElementById('summaryBar').style.display = '';
      document.getElementById('actionBar').style.display = '';
      document.getElementById('tableSearch').style.display = '';

      renderFilters();
      checkWaitlist(true);
      renderTable();
      checkOrphanParticipants();
    }
  }
} catch(e) {}
```

Key differences from the old code:
- Employees load immediately on init (no button click needed)
- Toast removed (no "restaurada" toast on auto-restore — the data just appears)
- Error on state restore is swallowed silently (no toast — user didn't trigger anything)
- The `restoreDiv` button element is no longer created

- [ ] **Step 2: Commit**

```bash
git add convocatoria.html
git commit -m "feat: auto-restore organigrama on page load — no manual click needed

Employees from previous session load automatically on init.
Same restore logic, executed immediately instead of on button click.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Update compliance renderer to handle `inactivo` records

**Files:**
- Modify: `convocatoria.html:7671-7700` (renderComplianceView)

- [ ] **Step 1: Filter out inactive records in compliance matrix**

In `renderComplianceView()`, after getting `records` (line 7677), the expired items loop (lines 7683-7699) iterates `limitedEmployees` and checks `records[key]`. Add a check to skip inactive records:

At line 7688, after `var rec = records[key];`, add:

```javascript
          if (rec && rec.inactivo) return; // Skip deactivated records (employee left)
```

This goes inside the `types.forEach` callback, right after the `var rec = records[key];` line. It prevents inactive records from counting as expired/pending in the compliance matrix.

- [ ] **Step 2: Commit**

```bash
git add convocatoria.html
git commit -m "fix: compliance matrix skips inactive records from departed employees

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Passive validation warning when editing without organigrama

**Files:**
- Modify: `convocatoria.html` — find the participant editing entry points

- [ ] **Step 1: Find participant editing functions**

Search for where participants are added to acciones. The key entry points are:
- The "vincular personas" dialog/button in acción detail view
- Inline edit of participantes in list view
- The `assignParticipantsToAccion` or similar function

Search for: `participantes.push`, `participantes =`, functions that modify `a.participantes`.

- [ ] **Step 2: Add validation warning**

At the top of the function(s) that add participants to acciones, add:

```javascript
if (!state.employees || state.employees.length === 0) {
  showToast('Organigrama no cargado — participantes sin validar contra plantilla', 'warning', 5000);
}
```

This is advisory only — does not block the edit.

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: warn when editing participants without organigrama loaded

Advisory toast only, does not block edits.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Final verification + push

- [ ] **Step 1: Verify no syntax errors**

Open the file in browser or run a quick JS parse check:

```bash
node -e "require('fs').readFileSync('convocatoria.html','utf8')" && echo "File reads OK"
```

- [ ] **Step 2: Grep for any remaining DEPARTAMENTO references**

```bash
grep -n 'DEPARTAMENTO' convocatoria.html
```

Expected: 0 matches (all replaced with `Departamento`).

- [ ] **Step 3: Grep for remaining Cerrada references**

```bash
grep -n "'Cerrada'" convocatoria.html
```

Expected: 0 matches.

- [ ] **Step 4: Push all commits**

```bash
git push
```
