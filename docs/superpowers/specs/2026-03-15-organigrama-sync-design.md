# Organigrama Sync — Design Spec

> Automatic synchronization between the employee organigrama (Excel source of truth) and dependent subsystems: acciones formativas and compliance.

**Goal:** When the organigrama changes, the app reacts automatically. The user sees everything "just works."

**Scope:** Logic only. No UI changes. TNA requests reference areas/topics, not individual employees — no cascade needed.

---

## Problem

The organigrama is the source of truth for who works at the company, but the app treats it as ephemeral. Persistent subsystems (acciones, compliance) accumulate stale references to people who may no longer exist.

Four failures today:

1. **Page refresh loses the organigrama.** User must click a restore button every time.
2. **Bajas remain as ghost participants.** Departed employees occupy slots in future training actions. Only a toast warns; nothing cascades.
3. **Altas get no compliance enrollment.** New employees appear in the organigrama but nobody flags them for mandatory training (PRL, GDPR, acoso).
4. **Editing without organigrama is unvalidated.** Participant lists accept any NIF without checking against the current workforce.

---

## Existing code bugs to fix during implementation

1. **`compareOrganigrams` uses wrong field name.** Line 12220 compares `DEPARTAMENTO` (all caps) but employee objects use title case. Department change detection is silently broken — always returns empty `changed` array. Fix: use the correct field name from `RELEVANT_COLUMNS`.
2. **Orphan check uses non-existent estado `Cerrada`.** Line 12247 filters by `estado !== 'Cerrada'`, but valid values are: Planificada, Pendiente, Buscando, En preparación, Convocada, En marcha, Terminada, Anulada, Retrasada. Fix: use `Terminada` and `Anulada` as terminal states.

---

## Data model reference

**Compliance records** (actual structure in `convocatoria_compliance_records`):
```javascript
// Object keyed by "NIF|typeId", NOT an array
{
  "12345678A|ct_prl": { date: "2025-06-15" },
  "12345678A|ct_gdpr": { date: "" }  // empty date = pending
}
```

**Compliance types** (actual structure in `convocatoria_compliance_types`):
```javascript
// Array of { id, name, periodMonths }
// No `obligatorio` flag — ALL types are mandatory by definition
// (the entire subsystem is "Formación obligatoria")
[
  { id: "ct_prl", name: "PRL Básico", periodMonths: 12 },
  { id: "ct_gdpr", name: "Protección de datos", periodMonths: 24 }
]
```

**Acciones participantes** (relevant fields):
```javascript
{
  participantes: ["NIF1", "NIF2"],
  confirmaciones: { "NIF1": "confirmado", "NIF2": "pendiente" },
  asistencia: { registro: { "NIF1": true, "NIF2": false } },
  notas: [{ id, date, tag, text }]
}
```

---

## Design

### A. Auto-restore on init

On page load, if `convocatoria_employees` exists in localStorage, restore employees into `state.employees` automatically. Execute the same logic as the current restore button handler, minus the button click.

**Behavior:**
- Parse `convocatoria_employees` from localStorage
- Restore `convocatoria_state` snapshot (filters, excludedNIFs, event config)
- Call `renderFilters()`, `renderTable()`, `checkOrphanParticipants()`
- Show toast: "Organigrama restaurado ({count} personas)"

**The restore button stays in the DOM** as a secondary action in case the user wants to explicitly re-trigger. The change is that auto-restore fires first, on init.

### B. Cascade on new organigrama load

Inside `processParseResult()`, after `compareOrganigrams()` produces the diff and before `state.employees` is replaced, call `cascadeOrganigramaChanges(diff)`.

#### B.1 Bajas — remove from future acciones

For each removed NIF:
1. Get acciones via `getCatalog('acciones')`
2. Filter acciones where `participantes` includes the NIF AND estado is NOT `Terminada` or `Anulada`
3. Remove the NIF from `participantes` array
4. Clean up related data: `delete accion.confirmaciones[nif]`, `delete accion.asistencia.registro[nif]` (if they exist)
5. Add audit note to `accion.notas`:
   ```
   { id: Date.now(), date: ISO, tag: 'sistema',
     text: 'Baja automática: [Nombre] — no presente en organigrama' }
   ```
6. After processing all removed NIFs, save all modified acciones in a single `saveCatalog('acciones', data)` call
7. Summary toast: "Organigrama: {n} personas dadas de baja en {m} acciones activas"

#### B.2 Bajas — deactivate compliance records

For each removed NIF:
1. Scan keys of `state.complianceRecords` for entries matching the pattern `"NIF|*"`
2. Mark each matching record as inactive: `record.inactivo = true; record.motivoBaja = 'No presente en organigrama (YYYY-MM-DD)'`
3. Do NOT delete the key (audit trail — date of completion preserved)
4. Save updated records to `convocatoria_compliance_records`

The compliance matrix renderer (`renderComplianceView`) must check `record.inactivo` and skip those records when computing pending/expired counts. Inactive records appear dimmed (CSS opacity) in the matrix if the NIF row is still visible, or hidden entirely if no active records remain for that NIF.

#### B.3 Altas — auto-enroll in mandatory compliance

For each added NIF:
1. Read all compliance types from `state.complianceTypes` (all are mandatory by definition)
2. For each type, check if key `"NIF|type.id"` already exists in `state.complianceRecords`
3. If not, create: `state.complianceRecords["NIF|type.id"] = { date: '' }` (empty date = pending)
4. Save to `convocatoria_compliance_records`
5. Summary toast: "{n} personas nuevas inscritas en formación obligatoria"

#### B.4 Terminal states (no cascade)

Acciones with estado `Terminada` or `Anulada` are never modified. Compliance records marked `inactivo` are never deleted. Historical data stays intact for FUNDAE audits.

### C. Passive validation warning

When the user edits `participantes` in an acción (via the vincular personas dialog or inline edit) and `state.employees` is empty (no organigrama loaded):
- Show toast warning: "Organigrama no cargado — participantes sin validar contra plantilla"
- Do NOT block the edit. Advisory only.

### D. Orphan check enhancement

The existing `checkOrphanParticipants()` runs after Excel load. Enhance it to also run after auto-restore (section A), so the user always sees the current state of orphan references on app open.

### E. Queue items with stale emails

Queue items (`convocatoria_queue`) store email arrays for pending sends. When processing cascade, scan queue items and log a warning toast if any queued emails belong to removed NIFs. Do not auto-modify queue items — the user should review pending sends manually.

---

## Data flow

```
[Page load]
  → auto-restore employees from localStorage (A)
  → checkOrphanParticipants()
  → render UI

[New Excel uploaded]
  → parseOrgSheet()
  → processParseResult():
    → compareOrganigrams(old, new) → diff = { added, removed, changed }
    → cascadeOrganigramaChanges(diff) (B)  ← NEW, inserted here
      → B.1: remove bajas from future acciones + audit notes + cleanup
      → B.2: deactivate compliance records for bajas
      → B.3: auto-enroll altas in mandatory compliance
      → B.E: warn about stale queue emails
    → state.employees = result.employees  ← existing
    → save to localStorage                ← existing
  → checkOrphanParticipants()
  → render UI + summary toasts

[Edit participantes without organigrama]
  → passive warning toast (C)
```

---

## Edge cases

| Case | Handling |
|---|---|
| Employee leaves and returns (re-hire) | New Excel adds them back. Old compliance records stay with `inactivo: true`; new pending records created via B.3. No conflict. |
| Same NIF in both added and removed | Impossible — diff is computed against NIF sets. |
| First organigrama load (no previous) | `compareOrganigrams` returns empty removed/changed. All employees count as altas. B.3 creates compliance records for all. |
| No compliance types defined | B.3 is a no-op. No records created. |
| Employee in multiple future acciones | Each acción processed independently. Multiple audit notes, one per acción. |
| `_id` regeneration on new Excel | `excludedNIFs` (stores `_id` not NIF) reset to empty Set in `processParseResult`. Existing behavior, no change. |
| Queue has emails for removed person | Warning toast only. User reviews queue manually. |
| Compliance record already `inactivo` | B.2 skips (idempotent — don't overwrite `motivoBaja`). |

---

## What we do NOT change

- UI layout, styles, or components
- Historical/completed acción data
- The Excel upload flow itself
- The restore button (stays as secondary option)
- How `excludedNIFs` works
- TNA requests (they reference topics, not employees)

---

## What we fix opportunistically

- `compareOrganigrams` field name bug (DEPARTAMENTO → correct casing)
- Orphan check `Cerrada` → `Terminada`/`Anulada` terminal states

---

## Testing

Use `test-data.js` to populate all localStorage keys, then:

1. Reload → verify auto-restore fires, orphan check runs
2. Upload modified Excel (remove 2 NIFs that appear in acciones participantes) → verify cascade:
   - Participants removed from non-terminal acciones
   - Audit notes added
   - `confirmaciones` and `asistencia.registro` cleaned for removed NIFs
   - Compliance records marked `inactivo`
3. Upload Excel with new employees + compliance types defined → verify auto-enrollment (pending records created)
4. Clear `convocatoria_employees` from localStorage → edit acción participantes → verify warning toast
5. Verify terminal acciones (Terminada/Anulada) untouched after cascade
6. Verify `compareOrganigrams` detects department changes after field name fix
