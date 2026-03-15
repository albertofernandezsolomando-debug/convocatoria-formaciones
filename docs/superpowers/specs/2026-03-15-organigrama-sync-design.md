# Organigrama Sync — Design Spec

> Automatic synchronization between the employee organigrama (Excel source of truth) and all dependent subsystems: acciones formativas, compliance, and TNA.

**Goal:** When the organigrama changes, the app reacts automatically. The user sees everything "just works."

**Scope:** Logic only. No UI changes.

---

## Problem

The organigrama is the source of truth for who works at the company, but the app treats it as ephemeral. Persistent subsystems (acciones, compliance) accumulate stale references to people who may no longer exist.

Four failures today:

1. **Page refresh loses the organigrama.** User must click a restore button every time.
2. **Bajas remain as ghost participants.** Departed employees occupy slots in future training actions. Only a toast warns; nothing cascades.
3. **Altas get no compliance enrollment.** New employees appear in the organigrama but nobody flags them for mandatory training (PRL, GDPR, acoso).
4. **Editing without organigrama is unvalidated.** Participant lists accept any NIF without checking against the current workforce.

---

## Design

### A. Auto-restore on init

On page load, if `convocatoria_employees` exists in localStorage, restore employees into `state.employees` automatically. Execute the same logic as the current restore button handler, minus the button click.

**Behavior:**
- Parse `convocatoria_employees` from localStorage
- Restore `convocatoria_state` snapshot (filters, excludedNIFs, event config)
- Call `renderFilters()`, `renderTable()`, `checkOrphanParticipants()`
- Show toast: "Organigrama restaurado ({count} personas)"
- Remove the restore button from the upload zone (no longer needed as primary flow)

**The restore button stays in the DOM** as a secondary action in case the user wants to explicitly re-trigger. The change is that auto-restore fires first, on init.

### B. Cascade on new organigrama load

After `compareOrganigrams()` produces the diff (added, removed, changed), a new function `cascadeOrganigramaChanges(diff)` processes each category.

#### B.1 Bajas — remove from future acciones

For each removed NIF:
1. Scan `fundae_acciones` for acciones where `participantes` includes the NIF
2. Skip acciones with estado `Terminada` or `Anulada` (historical — do not touch)
3. Remove the NIF from `participantes` array
4. Add audit note to `accion.notas`:
   ```
   { id: Date.now(), date: ISO, tag: 'sistema',
     text: 'Baja automática: [Nombre] — no presente en organigrama' }
   ```
5. Save updated acciones via `saveCatalog('acciones', data)`
6. Summary toast: "Organigrama: {n} personas dadas de baja en {m} acciones activas"

#### B.2 Bajas — deactivate compliance

For each removed NIF:
1. Scan `convocatoria_compliance_records` for records matching the NIF
2. Set `record.estado = 'inactivo'` and `record.motivoBaja = 'No presente en organigrama (fecha)'`
3. Do NOT delete the record (audit trail)
4. Save updated compliance records

#### B.3 Altas — auto-enroll in mandatory compliance

For each added NIF:
1. Read `convocatoria_compliance_types` — filter types where `obligatorio === true` (or equivalent flag)
2. For each mandatory type, create a compliance record:
   ```
   { nif: NIF, nombre: employee.Empleado, tipoId: type.id,
     estado: 'pendiente', fechaAlta: ISO,
     origen: 'Alta automática — nueva incorporación' }
   ```
3. Save to `convocatoria_compliance_records`
4. Summary toast: "{n} personas nuevas inscritas en formación obligatoria"

#### B.4 Terminal states (no cascade)

Acciones with estado `Terminada` or `Anulada` are never modified. Compliance records marked `inactivo` are never deleted. Historical data stays intact for FUNDAE audits.

### C. Passive validation warning

When the user edits `participantes` in an acción (via the vincular personas dialog or inline edit) and `state.employees` is empty (no organigrama loaded):
- Show toast warning: "Organigrama no cargado — participantes sin validar contra plantilla"
- Do NOT block the edit. Advisory only.

### D. Orphan check enhancement

The existing `checkOrphanParticipants()` runs after Excel load. Enhance it to also run after auto-restore (section A), so the user always sees the current state of orphan references on app open.

---

## Data flow

```
[Page load]
  → auto-restore employees from localStorage (A)
  → checkOrphanParticipants()
  → render UI

[New Excel uploaded]
  → parseOrgSheet()
  → compareOrganigrams(old, new) → diff = { added, removed, changed }
  → cascadeOrganigramaChanges(diff) (B)
    → B.1: remove bajas from future acciones + audit notes
    → B.2: deactivate compliance records for bajas
    → B.3: auto-enroll altas in mandatory compliance
  → processParseResult() (existing: update state, save to localStorage)
  → checkOrphanParticipants()
  → render UI + summary toasts

[Edit participantes without organigrama]
  → passive warning toast (C)
```

---

## Edge cases

| Case | Handling |
|---|---|
| Employee leaves and returns (re-hire) | New Excel load adds them back. Compliance records from previous tenure stay as `inactivo`; new records created. No conflict. |
| Same NIF in both added and removed | Impossible — diff is computed against NIF sets. |
| Organigrama loaded for first time (no previous) | `compareOrganigrams` returns empty removed/changed. Altas = all employees. Compliance auto-enroll runs for all if mandatory types exist. |
| No mandatory compliance types defined | B.3 is a no-op. No records created. |
| Employee in multiple future acciones | Each acción processed independently. Multiple audit notes, one per acción. |
| `_id` regeneration on new Excel | `excludedNIFs` (which stores `_id` not NIF) is reset to empty Set in `processParseResult`. Existing behavior, no change needed. |

---

## What we do NOT change

- UI layout, styles, or components
- Historical/completed acción data
- The Excel upload flow itself
- The restore button (stays as secondary option)
- How `excludedNIFs` works
- The organigram diff detection logic (only add cascade after it)

---

## Testing

Use `test-data.js` to populate all localStorage keys, then:

1. Modify employee list (remove 2 NIFs that appear in acciones participantes)
2. Reload → verify auto-restore fires
3. Upload modified Excel → verify cascade: participantes cleaned, compliance deactivated, notes added
4. Add new employees with mandatory compliance types defined → verify auto-enrollment
5. Clear employees from localStorage → edit acción participantes → verify warning toast
