# Encuesta de Satisfacción Automática — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automatic satisfaction survey sending via Power Automate + Microsoft Forms, triggered when processing the convocation queue.

**Architecture:** Settings dialog stores webhook + Forms URLs in `localStorage`. Checkbox in Tab 1 enables survey sending. When the queue is processed, a `fetch()` POST fires to the Power Automate webhook with the survey email payload and a scheduled time matching the session end time.

**Tech Stack:** Vanilla JS, HTML, CSS — all inline in `convocatoria.html`. `fetch()` for HTTP POST. `localStorage` for persistence.

**Spec:** `docs/superpowers/specs/2026-03-12-encuesta-satisfaccion-design.md`

---

## File Structure

Single file: `convocatoria.html` (all changes inline)

| Section | What changes |
|---------|-------------|
| CSS (`<style>`) | Settings icon style, instructions dialog scrollable style |
| HTML (`<body>`) | Settings icon in header, checkbox in event section, settings dialog, instructions dialog |
| JS (`<script>`) | Settings persistence (load/save), survey payload builder, fetch POST logic in queue processing |

---

## Chunk 1: Settings Infrastructure

### Task 1: Settings dialog HTML + CSS

**Files:**
- Modify: `convocatoria.html:~87-88` (CSS — add settings icon + dialog styles)
- Modify: `convocatoria.html:~907-908` (HTML — add ⚙ icon in header)
- Modify: `convocatoria.html:~1290` (HTML — add settings dialog + instructions dialog after seriesDialog)

- [ ] **Step 1: Add CSS for the settings icon**

In the `<style>` block, after the existing `.app-header` styles (~line 88), add:

```css
.settings-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 16px;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
  display: flex;
  align-items: center;
}
.settings-btn:hover {
  color: var(--accent);
  background: var(--accent-subtle);
}
.dialog-box-wide {
  max-width: 540px;
}
.dialog-box-wide .input-field {
  width: 100%;
  margin-top: 4px;
}
.dialog-box-wide label {
  display: block;
  margin-top: 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.instructions-content {
  text-align: left;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  max-height: 400px;
  overflow-y: auto;
}
.instructions-content ol {
  padding-left: 20px;
  margin: 12px 0;
}
.instructions-content li {
  margin-bottom: 10px;
}
.instructions-content pre {
  background: var(--bg-input);
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  overflow-x: auto;
  position: relative;
}
.instructions-content .copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 11px;
  padding: 2px 8px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
```

- [ ] **Step 2: Add ⚙ icon in header bar**

In the header bar (~line 907-908), insert a settings button between the title and the history button. Change the header from:

```html
<div class="app-header">
  <span class="app-header-title">Convocatoria de Formaciones</span>
  <button class="link-btn link-add" id="btnHistory" ...>Historial</button>
</div>
```

To:

```html
<div class="app-header">
  <span class="app-header-title">Convocatoria de Formaciones</span>
  <div style="display:flex; align-items:center; gap:8px;">
    <button class="settings-btn" id="btnSettings" title="Ajustes">&#9881;</button>
    <button class="link-btn link-add" id="btnHistory" style="font-size:13px; padding:4px 12px; background:var(--accent-light); border-radius:var(--radius-lg);">Historial</button>
  </div>
</div>
```

- [ ] **Step 3: Add settings dialog HTML**

After the `seriesDialog` closing `</div>` (~line 1290), add:

```html
<!-- Settings dialog -->
<div class="dialog-overlay" id="settingsDialog">
  <div class="dialog-box dialog-box-wide">
    <h3>Ajustes</h3>
    <label for="settingsWebhookUrl">URL webhook Power Automate</label>
    <input type="url" class="input-field" id="settingsWebhookUrl" placeholder="https://prod-xx.westeurope.logic.azure.com/workflows/...">
    <label for="settingsFormsUrl">URL formulario Microsoft Forms</label>
    <input type="url" class="input-field" id="settingsFormsUrl" placeholder="https://forms.office.com/Pages/ResponsePage.aspx?id=...">
    <div style="margin-top:14px;">
      <button class="link-btn link-add" id="btnShowInstructions">Ver instrucciones de configuración</button>
    </div>
    <div class="dialog-buttons" style="margin-top:20px;">
      <button class="btn btn-secondary" id="settingsCancel">Cancelar</button>
      <button class="btn btn-primary" id="settingsSave">Guardar</button>
    </div>
  </div>
</div>

<!-- Instructions dialog -->
<div class="dialog-overlay" id="instructionsDialog">
  <div class="dialog-box dialog-box-wide">
    <h3>Configurar flujo de Power Automate</h3>
    <div class="instructions-content">
      <ol>
        <li>Abre <strong>Power Automate</strong> (make.powerautomate.com) e inicia sesión con tu cuenta corporativa.</li>
        <li>Crea un nuevo flujo: <strong>Flujo de nube automatizado → En blanco</strong>.</li>
        <li>Añade el trigger <strong>«Cuando se recibe una solicitud HTTP»</strong>. En el campo «Esquema JSON del cuerpo de la solicitud», pega el siguiente esquema:
          <pre id="jsonSchemaBlock"><button class="copy-btn" id="btnCopySchema">Copiar</button>{
  "type": "object",
  "properties": {
    "to": { "type": "array", "items": { "type": "string" } },
    "subject": { "type": "string" },
    "body": { "type": "string" },
    "scheduledTime": { "type": "string" }
  }
}</pre>
        </li>
        <li>Añade la acción <strong>«Retrasar hasta»</strong>. En el campo «Marca de tiempo», selecciona el campo dinámico <code>scheduledTime</code>.</li>
        <li>Añade la acción <strong>«Enviar un correo electrónico (V2)»</strong>. En «Para», selecciona <code>to</code>. En «Asunto», selecciona <code>subject</code>. En «Cuerpo», selecciona <code>body</code> y activa la vista HTML.</li>
        <li>Guarda el flujo. Copia la <strong>URL del trigger HTTP</strong> que aparece en el paso 1 del flujo y pégala en el campo «URL webhook» de la pantalla de Ajustes.</li>
      </ol>
    </div>
    <div class="dialog-buttons">
      <button class="btn btn-primary" id="instructionsClose">Cerrar</button>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Verify in browser**

Open `convocatoria.html` in Chrome. Verify:
- ⚙ icon appears in header between title and Historial button
- Clicking ⚙ does nothing yet (JS not wired up yet)
- No console errors

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(survey): add settings dialog HTML + CSS for satisfaction survey config"
```

---

### Task 2: Settings persistence (JS)

**Files:**
- Modify: `convocatoria.html:~2514` (JS — add settings load/save functions after queue persistence)
- Modify: `convocatoria.html:~3447` (JS — wire up settings dialog event listeners)

- [ ] **Step 1: Add settings load/save functions**

After the `loadQueue()` function (~line 2514), add:

```javascript
// ═══════════════════════════════════
// SETTINGS PERSISTENCE
// ═══════════════════════════════════

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('convocatoria_settings') || '{}');
  } catch(e) { return {}; }
}

function saveSettings(settings) {
  try {
    localStorage.setItem('convocatoria_settings', JSON.stringify(settings));
  } catch(e) {
    showToast('Error al guardar ajustes', 'error');
  }
}
```

- [ ] **Step 2: Wire up settings dialog event listeners**

In the event listeners section (after the existing queue and export listeners), add:

```javascript
// ═══════════════════════════════════
// SETTINGS DIALOG
// ═══════════════════════════════════

document.getElementById('btnSettings').addEventListener('click', () => {
  const settings = loadSettings();
  document.getElementById('settingsWebhookUrl').value = settings.webhookUrl || '';
  document.getElementById('settingsFormsUrl').value = settings.formsUrl || '';
  document.getElementById('settingsDialog').classList.add('visible');
});

document.getElementById('settingsCancel').addEventListener('click', () => {
  document.getElementById('settingsDialog').classList.remove('visible');
});

document.getElementById('settingsSave').addEventListener('click', () => {
  const webhookUrl = document.getElementById('settingsWebhookUrl').value.trim();
  const formsUrl = document.getElementById('settingsFormsUrl').value.trim();

  // Both URLs are optional (allow clearing), but if provided must be https
  if (webhookUrl && !webhookUrl.startsWith('https://')) {
    showToast('La URL del webhook debe empezar por https://', 'warning');
    return;
  }
  if (formsUrl && !formsUrl.startsWith('https://')) {
    showToast('La URL del formulario debe empezar por https://', 'warning');
    return;
  }
  // Warn if only one is set (both needed for survey to work)
  if ((webhookUrl && !formsUrl) || (!webhookUrl && formsUrl)) {
    showToast('Ambas URLs son necesarias para enviar encuestas', 'warning');
  }

  saveSettings({ webhookUrl, formsUrl });
  document.getElementById('settingsDialog').classList.remove('visible');
  showToast('Ajustes guardados', 'success');
});

document.getElementById('btnShowInstructions').addEventListener('click', () => {
  document.getElementById('instructionsDialog').classList.add('visible');
});

document.getElementById('instructionsClose').addEventListener('click', () => {
  document.getElementById('instructionsDialog').classList.remove('visible');
});

document.getElementById('btnCopySchema').addEventListener('click', () => {
  const schema = '{\n  "type": "object",\n  "properties": {\n    "to": { "type": "array", "items": { "type": "string" } },\n    "subject": { "type": "string" },\n    "body": { "type": "string" },\n    "scheduledTime": { "type": "string" }\n  }\n}';
  navigator.clipboard.writeText(schema).then(() => {
    showToast('Esquema copiado al portapapeles', 'success');
  });
});
```

- [ ] **Step 3: Verify in browser**

Open `convocatoria.html` in Chrome. Test:
1. Click ⚙ → settings dialog opens with empty fields
2. Enter URLs → click "Guardar" → toast "Ajustes guardados"
3. Click ⚙ again → URLs are restored from localStorage
4. Click "Ver instrucciones de configuración" → instructions dialog opens
5. Click "Copiar" in the JSON block → schema copied to clipboard
6. Enter invalid URL (no https://) → warning toast, dialog stays open
7. Click "Cancelar" → dialog closes without saving

- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(survey): add settings persistence and dialog event listeners"
```

---

## Chunk 2: Survey Checkbox + Sending Logic

### Task 3: Survey checkbox in Tab 1

**Files:**
- Modify: `convocatoria.html:~994` (HTML — add checkbox in event section)
- Modify: `convocatoria.html:~2649-2671` (JS — add `sendSurvey` to saveState/restoreState)

- [ ] **Step 1: Add checkbox HTML**

After the series config div closing tag (~line 994, after `</div>` of `seriesManualConfig`'s parent), before the section's closing `</div>` (~line 995-996), add:

```html
<div style="margin-top:10px;">
  <label class="filter-label" style="font-size:11px; color:var(--text-muted);">Formador/a</label>
  <input type="text" class="input-field" id="eventFormador" placeholder="Nombre del formador/a">
</div>
<div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border);">
  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; color:var(--text-secondary);">
    <input type="checkbox" id="surveyCheck" checked style="accent-color:var(--accent);">
    Enviar encuesta de satisfacción al finalizar
  </label>
</div>
```

- [ ] **Step 2: Add `sendSurvey` to saveState()**

In `saveState()` (~line 2656-2665), add `sendSurvey` to the `eventConfig` object:

Change:

```javascript
eventConfig: {
  title: document.getElementById('eventTitle').value,
  date: document.getElementById('eventDate').value,
  startTime: document.getElementById('eventStart').value,
  endTime: document.getElementById('eventEnd').value,
  location: document.getElementById('eventLocation').value,
  body: document.getElementById('eventBody').value,
  isTeams: document.querySelector('input[name="eventType"]:checked')?.value === 'teams',
  isSeries: document.getElementById('seriesCheck').checked,
},
```

To:

```javascript
eventConfig: {
  title: document.getElementById('eventTitle').value,
  date: document.getElementById('eventDate').value,
  startTime: document.getElementById('eventStart').value,
  endTime: document.getElementById('eventEnd').value,
  location: document.getElementById('eventLocation').value,
  body: document.getElementById('eventBody').value,
  isTeams: document.querySelector('input[name="eventType"]:checked')?.value === 'teams',
  isSeries: document.getElementById('seriesCheck').checked,
  sendSurvey: document.getElementById('surveyCheck').checked,
  formador: document.getElementById('eventFormador').value,
},
```

- [ ] **Step 3: Add `sendSurvey` to restoreState()**

In the restore state block (~line 3670-3685), after the `isSeries` restore block, add:

```javascript
// Restore formador
document.getElementById('eventFormador').value = ec.formador || '';
// Restore survey checkbox (default true if field missing — migration)
const surveyCheck = document.getElementById('surveyCheck');
if (surveyCheck) {
  surveyCheck.checked = ec.sendSurvey !== undefined ? ec.sendSurvey : true;
}
```

- [ ] **Step 4: Wire checkbox to saveState()**

In the event listeners section where other inputs call `saveState()`, add:

```javascript
document.getElementById('eventFormador').addEventListener('input', saveState);
document.getElementById('surveyCheck').addEventListener('change', saveState);
```

- [ ] **Step 5: Verify in browser**

1. Open `convocatoria.html` — checkbox "Enviar encuesta de satisfacción al finalizar" visible, checked by default
2. Uncheck it → reload page → checkbox remains unchecked (persisted)
3. Check it again → reload → checkbox is checked (persisted)
4. Clear localStorage `convocatoria_state` → reload → checkbox defaults to checked

- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(survey): add survey checkbox to event section with state persistence"
```

---

### Task 4: Survey sending logic in queue processing

**Files:**
- Modify: `convocatoria.html:~2514` (JS — add `buildSurveyPayload()` and `sendSurveyEmail()` functions)
- Modify: `convocatoria.html:~3444-3447` (JS — call survey sending after queue item processing)

- [ ] **Step 1: Add survey helper functions**

After the `saveSettings()` function (added in Task 2), add:

```javascript
// ═══════════════════════════════════
// SURVEY EMAIL
// ═══════════════════════════════════

function buildSurveyEmailBody(event, formsUrl) {
  const eventName = esc(event.title || 'la formación');
  const formador = esc(event.formador || '');
  const dateObj = event.date ? new Date(event.date) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const surveyLink = formsUrl +
    (formsUrl.includes('?') ? '&' : '?') +
    'accion=' + encodeURIComponent(event.title || '') +
    '&fecha=' + encodeURIComponent(dateStr) +
    '&formador=' + encodeURIComponent(event.formador || '');

  return '<div style="font-family:Calibri,Arial,sans-serif; font-size:14px; color:#0f172a; line-height:1.6;">' +
    '<p>Hola,</p>' +
    '<p>Has participado en la formación <strong>' + eventName + '</strong>' +
    (formador ? ', impartida por <strong>' + formador + '</strong>' : '') +
    (dateStr ? ' el <strong>' + esc(dateStr) + '</strong>' : '') + '.</p>' +
    '<p>Nos gustaría conocer tu valoración. Son solo 6 preguntas (menos de 2 minutos):</p>' +
    '<p style="text-align:center; margin:24px 0;">' +
    '<a href="' + esc(surveyLink) + '" style="background:#4F46E5; color:white; padding:12px 28px; ' +
    'border-radius:8px; text-decoration:none; font-weight:600;">Completar encuesta</a></p>' +
    '<p>Gracias por tu tiempo.</p>' +
    '</div>';
}

function buildSurveyPayload(event, emails, formsUrl) {
  const subject = 'Tu opinión sobre la formación \u00AB' + (event.title || 'reciente') + '\u00BB';
  const body = buildSurveyEmailBody(event, formsUrl);
  const scheduledTime = new Date(event.date + 'T' + event.endTime + ':00').toISOString();

  return {
    to: emails,
    subject: subject,
    body: body,
    scheduledTime: scheduledTime
  };
}

function sendSurveyEmail(event, emails) {
  if (!event.date || !event.endTime) {
    showToast('Completa la fecha y hora de fin del evento para programar la encuesta', 'warning', 6000);
    return;
  }

  const settings = loadSettings();
  if (!settings.webhookUrl || !settings.formsUrl) {
    showToast('Configura el webhook y el formulario en Ajustes (⚙) para enviar encuestas', 'warning', 6000);
    return;
  }

  const payload = buildSurveyPayload(event, emails, settings.formsUrl);
  const endTime = event.endTime || '??:??';

  fetch(settings.webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(() => {
    showToast('Encuesta programada para las ' + endTime, 'success');
  }).catch(() => {
    showToast('No se pudo conectar con Power Automate. Verifica tu conexión y la URL del webhook', 'error', 6000);
  });
}
```

- [ ] **Step 2: Integrate survey sending into queue processing**

In the `launchNext()` function (~line 3422), the local variables are `item` (queue item), `event` (= `item.event`), and `emails` (= `item.emails`). After the `logToHistory()` call (~line 3447), add the survey sending call:

```javascript
// Send survey if enabled
if (document.getElementById('surveyCheck').checked) {
  sendSurveyEmail(event, emails);
}
```

Also, the `event` object in the queue must include `formador`. Find where queue items are created (the "Añadir a cola" / "Abrir en Outlook" flow that builds the `event` object from form fields) and add:

```javascript
formador: document.getElementById('eventFormador').value,
```

to the event object alongside `title`, `date`, `startTime`, `endTime`, etc.

- [ ] **Step 3: Verify in browser**

1. Configure settings: enter any `https://` URLs in webhook and forms fields
2. Check the survey checkbox is enabled
3. Add items to queue and process:
   - If webhook URL is valid Power Automate endpoint → toast "Encuesta programada para las HH:MM"
   - If webhook URL is unreachable → toast "No se pudo conectar con Power Automate..."
   - If settings not configured → toast "Configura el webhook y el formulario..."
4. Uncheck survey checkbox → process queue → no survey toast appears
5. Verify convocation still opens normally regardless of survey success/failure

- [ ] **Step 4: Verify JS syntax**

Open browser console and verify no syntax errors on page load.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(survey): add survey payload builder and webhook sending in queue processing"
```

---

### Task 5: Final verification and edge cases

**Files:**
- Modify: `convocatoria.html` (minor fixes if needed)

- [ ] **Step 1: Test edge cases**

1. **No endTime set**: Process queue without filling end time → `sendSurveyEmail` already has a guard (added in Task 4) that shows a warning toast and returns early. Verify this works: clear the end time field, add to queue, process → toast "Completa la fecha y hora de fin..." should appear, no fetch sent.

2. **Empty emails array**: Verify `sendSurveyEmail` is not called with empty emails (queue items always have emails from the convocation flow, so this should never happen — but verify).

3. **Settings dialog with pre-existing values**: Open settings → verify URLs load correctly → modify one → save → reopen → both show correctly.

4. **Multiple queue items**: Each queue item should trigger its own survey POST. Verify multiple toasts appear.

- [ ] **Step 2: Test complete flow end-to-end**

1. Configure settings (⚙) with real or test URLs
2. Load organigrama data
3. Select attendees
4. Fill event data (title, date, start/end time)
5. Ensure survey checkbox is checked
6. Add to queue
7. Process queue
8. Verify: Outlook opens AND survey toast appears

- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat(survey): add edge case handling for survey sending"
```
