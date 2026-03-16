# Propuestas Unicas - Plan de Implementacion

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar 9 features unicas propuestas por los agentes de analisis que no se solapan con las ya implementadas.

**Architecture:** Todas las features se implementan dentro de `convocatoria.html` (single-file app). Se usa localStorage para persistencia, CSS variables del design system, y patrones JS existentes (`esc()`, `showToast()`, `saveState()`).

**Tech Stack:** HTML/CSS/JS vanilla, SheetJS (ya incluido), localStorage.

---

## Chunk 1: Features de datos y visualizacion

### Task 1: Certificados de asistencia/aprovechamiento

**Files:**
- Modify: `convocatoria.html` (CSS + JS)

**Descripcion:** Generar certificados PDF-ready de asistencia y aprovechamiento para los participantes seleccionados. Se abre una ventana de impresion con el certificado formateado.

- [ ] **Step 1: Anadir CSS para certificado de impresion**

En la seccion `<style>`, anadir estilos para `@media print` y la clase `.cert-page`:

```css
.cert-page {
  width: 210mm;
  min-height: 297mm;
  padding: 40mm 30mm;
  font-family: var(--font-body);
  color: var(--text-primary);
  page-break-after: always;
}
.cert-page .cert-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: var(--accent);
}
.cert-page .cert-body {
  font-size: 14px;
  line-height: 1.8;
}
.cert-page .cert-signature {
  margin-top: 80px;
  display: flex;
  justify-content: space-between;
}
```

- [ ] **Step 2: Implementar funcion generateCertificates()**

Anadir la funcion al bloque JS. Usa `window.open()` y escribe el HTML del certificado en la nueva ventana con `doc.write()`:

```javascript
function generateCertificates(type) {
  // type: 'asistencia' | 'aprovechamiento'
  const selected = getSelectedEmployees();
  if (!selected.length) {
    showToast('Selecciona al menos un participante', 'warning');
    return;
  }
  const ev = getCurrentEvent();
  if (!ev.eventName) {
    showToast('Completa los datos del evento primero', 'warning');
    return;
  }
  const win = window.open('', '_blank');
  const doc = win.document;
  doc.open();
  const pages = selected.map(emp => {
    const nombre = esc(emp['Nombre y apellidos'] || emp['Nombre'] || '');
    const nif = esc(emp['NIF'] || '');
    const titulo = type === 'asistencia'
      ? 'CERTIFICADO DE ASISTENCIA'
      : 'CERTIFICADO DE APROVECHAMIENTO';
    const texto = type === 'asistencia'
      ? `Que D./Da. ${nombre}, con NIF ${nif}, ha asistido a la accion formativa "${esc(ev.eventName)}" celebrada el dia ${esc(ev.eventDate)}, con una duracion de ${esc(ev.eventDuration || 'N/A')} horas.`
      : `Que D./Da. ${nombre}, con NIF ${nif}, ha participado y superado con aprovechamiento la accion formativa "${esc(ev.eventName)}" celebrada el dia ${esc(ev.eventDate)}, con una duracion de ${esc(ev.eventDuration || 'N/A')} horas.`;
    return `<div class="cert-page">
      <div class="cert-title">${titulo}</div>
      <div class="cert-body"><p>${texto}</p></div>
      <div class="cert-signature">
        <div>Firma del responsable</div>
        <div>Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
      </div>
    </div>`;
  }).join('');
  doc.write(`<!DOCTYPE html><html><head>
    <style>
      body { margin: 0; font-family: 'Inter', sans-serif; }
      .cert-page { width: 210mm; min-height: 297mm; padding: 40mm 30mm; page-break-after: always; }
      .cert-title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 40px; color: #4F46E5; }
      .cert-body { font-size: 14px; line-height: 1.8; }
      .cert-signature { margin-top: 80px; display: flex; justify-content: space-between; }
      @media print { body { margin: 0; } }
    </style>
  </head><body>${pages}</body></html>`);
  doc.close();
  showToast(`${selected.length} certificado(s) generado(s)`, 'success');
}
```

- [ ] **Step 3: Anadir botones en la action bar**

En la action bar (panel derecho inferior), anadir dos botones:

```html
<button class="btn btn-secondary" onclick="generateCertificates('asistencia')" title="Certificado de asistencia">
  Cert. Asistencia
</button>
<button class="btn btn-secondary" onclick="generateCertificates('aprovechamiento')" title="Certificado de aprovechamiento">
  Cert. Aprovechamiento
</button>
```

- [ ] **Step 4: Verificar que funciona**

Abrir la app, cargar un Excel, seleccionar participantes, rellenar datos de evento, pulsar los botones de certificado. Debe abrirse una ventana nueva con los certificados listos para imprimir/guardar como PDF.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: generacion de certificados de asistencia y aprovechamiento"
```

---

### Task 2: Training load chart (grafico de carga formativa)

**Files:**
- Modify: `convocatoria.html` (CSS + JS)

**Descripcion:** En el tab de Dashboard/Calendario, anadir un grafico de barras que muestre la carga formativa por mes (numero de acciones y horas). Usa canvas para dibujar el grafico.

- [ ] **Step 1: Anadir contenedor del grafico en el HTML del dashboard**

En la seccion del dashboard, anadir un contenedor:

```html
<div class="training-load-chart" style="margin: 16px 0;">
  <h4 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Carga formativa por mes</h4>
  <canvas id="trainingLoadCanvas" height="200" style="width: 100%; background: var(--bg-panel); border-radius: var(--radius); border: 1px solid var(--border);"></canvas>
</div>
```

- [ ] **Step 2: Implementar funcion renderTrainingLoadChart()**

```javascript
function renderTrainingLoadChart() {
  const canvas = document.getElementById('trainingLoadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  // Agrupar acciones por mes
  const actions = state.catalogActions || [];
  const monthData = {};
  actions.forEach(a => {
    const fecha = a.fechaInicio || a.fecha_inicio;
    if (!fecha) return;
    const d = new Date(fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!monthData[key]) monthData[key] = { count: 0, hours: 0 };
    monthData[key].count++;
    monthData[key].hours += parseFloat(a.horas || a.duracion || 0);
  });

  const months = Object.keys(monthData).sort();
  if (!months.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos de acciones formativas', rect.width/2, rect.height/2);
    return;
  }

  const maxCount = Math.max(...months.map(m => monthData[m].count));
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = rect.width - padding.left - padding.right;
  const chartH = rect.height - padding.top - padding.bottom;
  const barW = Math.min(40, chartW / months.length * 0.6);
  const gap = chartW / months.length;

  // Ejes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  // Barras
  months.forEach((m, i) => {
    const d = monthData[m];
    const h = maxCount > 0 ? (d.count / maxCount) * chartH : 0;
    const x = padding.left + i * gap + gap/2 - barW/2;
    const y = padding.top + chartH - h;

    ctx.fillStyle = '#4F46E5';
    ctx.beginPath();
    ctx.roundRect(x, y, barW, h, [4, 4, 0, 0]);
    ctx.fill();

    // Label mes
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    const [year, mon] = m.split('-');
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    ctx.fillText(monthNames[parseInt(mon)-1], x + barW/2, padding.top + chartH + 16);

    // Valor encima
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter';
    ctx.fillText(d.count, x + barW/2, y - 6);
  });

  // Label eje Y
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  ctx.translate(14, padding.top + chartH/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText('Acciones', 0, 0);
  ctx.restore();
}
```

- [ ] **Step 3: Integrar llamada en renderDashboard()**

Anadir `renderTrainingLoadChart()` al final de la funcion que renderiza el dashboard/calendario.

- [ ] **Step 4: Verificar grafico**

Cargar datos con acciones que tengan fechas. Verificar que el grafico muestra barras por mes con conteo correcto.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: grafico de carga formativa por mes en dashboard"
```

---

### Task 3: Plantillas con filtros pre-aplicados

**Files:**
- Modify: `convocatoria.html` (JS)

**Descripcion:** Permitir guardar el estado actual de filtros + evento como una "plantilla" reutilizable. Se diferencia de los presets existentes en que incluye tambien los datos del evento (formador, tipo, lugar). Se guarda en localStorage key `convocatoria_templates`.

- [ ] **Step 1: Anadir estructura de datos para templates**

```javascript
function loadTemplates() {
  try {
    return JSON.parse(localStorage.getItem('convocatoria_templates') || '[]');
  } catch { return []; }
}
function saveTemplates(templates) {
  localStorage.setItem('convocatoria_templates', JSON.stringify(templates));
}
```

- [ ] **Step 2: Implementar guardar plantilla**

```javascript
function saveAsTemplate() {
  const name = prompt('Nombre de la plantilla:');
  if (!name || !name.trim()) return;
  const templates = loadTemplates();
  const template = {
    id: Date.now(),
    name: name.trim(),
    filters: JSON.parse(JSON.stringify(state.filters)),
    event: {
      eventName: document.getElementById('eventName')?.value || '',
      eventType: document.getElementById('eventType')?.value || '',
      eventDate: document.getElementById('eventDate')?.value || '',
      eventTime: document.getElementById('eventTime')?.value || '',
      eventEndTime: document.getElementById('eventEndTime')?.value || '',
      eventLocation: document.getElementById('eventLocation')?.value || '',
      eventTrainer: document.getElementById('eventTrainer')?.value || '',
      eventDuration: document.getElementById('eventDuration')?.value || ''
    },
    createdAt: new Date().toISOString()
  };
  templates.push(template);
  saveTemplates(templates);
  renderTemplateChips();
  showToast(`Plantilla "${name.trim()}" guardada`, 'success');
}
```

- [ ] **Step 3: Implementar aplicar y eliminar plantilla**

```javascript
function applyTemplate(id) {
  const templates = loadTemplates();
  const t = templates.find(x => x.id === id);
  if (!t) return;
  // Aplicar filtros
  if (t.filters) {
    state.filters = JSON.parse(JSON.stringify(t.filters));
    syncFiltersToUI();
  }
  // Aplicar evento
  if (t.event) {
    Object.entries(t.event).forEach(([k, v]) => {
      const el = document.getElementById(k);
      if (el) el.value = v;
    });
  }
  applyFilters();
  showToast(`Plantilla "${t.name}" aplicada`, 'success');
}

function deleteTemplate(id) {
  let templates = loadTemplates();
  const t = templates.find(x => x.id === id);
  templates = templates.filter(x => x.id !== id);
  saveTemplates(templates);
  renderTemplateChips();
  showToast(`Plantilla "${t?.name || ''}" eliminada`, 'info');
}
```

- [ ] **Step 4: Anadir UI de chips de plantillas**

Renderizar chips debajo de los presets existentes:

```javascript
function renderTemplateChips() {
  let container = document.getElementById('templateChips');
  if (!container) {
    const presetsSection = document.querySelector('.presets-section');
    if (!presetsSection) return;
    container = document.createElement('div');
    container.id = 'templateChips';
    container.style.cssText = 'margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;';
    presetsSection.appendChild(container);
  }
  const templates = loadTemplates();
  container.replaceChildren();
  templates.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.style.cursor = 'pointer';
    chip.textContent = t.name;
    chip.onclick = () => applyTemplate(t.id);
    const del = document.createElement('span');
    del.textContent = ' x';
    del.style.cssText = 'margin-left: 4px; opacity: 0.6; cursor: pointer;';
    del.onclick = (e) => { e.stopPropagation(); deleteTemplate(t.id); };
    chip.appendChild(del);
    container.appendChild(chip);
  });
}
```

- [ ] **Step 5: Anadir boton "Guardar como plantilla"**

En la seccion de presets del panel izquierdo, anadir:

```html
<button class="link-btn link-add" onclick="saveAsTemplate()">Guardar como plantilla</button>
```

- [ ] **Step 6: Inicializar al cargar**

Llamar a `renderTemplateChips()` desde `initApp()` o equivalente.

- [ ] **Step 7: Verificar funcionalidad**

Configurar filtros y datos de evento, guardar plantilla, recargar pagina, aplicar plantilla. Los filtros y datos de evento deben restaurarse.

- [ ] **Step 8: Commit**

```bash
git add convocatoria.html
git commit -m "feat: plantillas reutilizables con filtros y datos de evento"
```

---

### Task 4: EMPRESAS_GRUPO configurable desde UI

**Files:**
- Modify: `convocatoria.html` (CSS + JS)

**Descripcion:** Actualmente `EMPRESAS_GRUPO` es un array hardcodeado. Moverlo a un setting editable desde la pestana de Ajustes, persistido en localStorage.

- [ ] **Step 1: Migrar datos iniciales**

```javascript
function getEmpresasGrupo() {
  const saved = state.settings?.empresasGrupo;
  if (saved && saved.length) return saved;
  return EMPRESAS_GRUPO; // fallback al array hardcodeado
}
```

- [ ] **Step 2: Anadir seccion en Ajustes**

En el tab de Ajustes, anadir una seccion "Empresas del grupo" con una tabla editable:

```javascript
function renderEmpresasGrupoSettings() {
  const container = document.getElementById('empresasGrupoSettings');
  if (!container) return;
  const empresas = getEmpresasGrupo();
  let rows = empresas.map((e, i) => {
    return `<tr>
      <td><input class="input-field" value="${esc(e.nombre)}" data-idx="${i}" data-field="nombre" style="width:100%"></td>
      <td><input class="input-field" value="${esc(e.cif)}" data-idx="${i}" data-field="cif" style="width:120px"></td>
      <td><input class="input-field" type="number" value="${e.credito || 0}" data-idx="${i}" data-field="credito" style="width:100px"></td>
      <td><button class="link-btn link-clear" onclick="removeEmpresaGrupo(${i})">Eliminar</button></td>
    </tr>`;
  }).join('');
  container.querySelector('tbody').replaceChildren();
  container.querySelector('tbody').insertAdjacentHTML('beforeend', rows);
}
```

- [ ] **Step 3: Implementar CRUD**

```javascript
function addEmpresaGrupo() {
  const empresas = getEmpresasGrupo().slice();
  empresas.push({ nombre: '', cif: '', credito: 0 });
  state.settings.empresasGrupo = empresas;
  saveSettings();
  renderEmpresasGrupoSettings();
}

function removeEmpresaGrupo(idx) {
  const empresas = getEmpresasGrupo().slice();
  empresas.splice(idx, 1);
  state.settings.empresasGrupo = empresas;
  saveSettings();
  renderEmpresasGrupoSettings();
  showToast('Empresa eliminada', 'info');
}

function updateEmpresaGrupo(idx, field, value) {
  const empresas = getEmpresasGrupo().slice();
  if (field === 'credito') value = parseFloat(value) || 0;
  empresas[idx][field] = value;
  state.settings.empresasGrupo = empresas;
  saveSettings();
}
```

- [ ] **Step 4: Reemplazar referencias a EMPRESAS_GRUPO**

Buscar todas las referencias a `EMPRESAS_GRUPO` en el codigo y reemplazar por `getEmpresasGrupo()`.

- [ ] **Step 5: Verificar**

Ir a Ajustes, modificar empresas, anadir/eliminar. Verificar que los cambios persisten al recargar y se usan en toda la app.

- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat: EMPRESAS_GRUPO configurable desde ajustes"
```

---

### Task 5: Formaciones recurrentes (plantillas de formacion)

**Files:**
- Modify: `convocatoria.html` (JS)

**Descripcion:** Para formaciones que se repiten periodicamente (ej: onboarding mensual), permitir crear una plantilla de formacion que pre-rellena todos los campos excepto la fecha. Se guarda en localStorage key `convocatoria_trainingTemplates`.

- [ ] **Step 1: Estructura de datos**

```javascript
function loadTrainingTemplates() {
  try {
    return JSON.parse(localStorage.getItem('convocatoria_trainingTemplates') || '[]');
  } catch { return []; }
}
function saveTrainingTemplates(templates) {
  localStorage.setItem('convocatoria_trainingTemplates', JSON.stringify(templates));
}
```

- [ ] **Step 2: Guardar formacion como plantilla recurrente**

```javascript
function saveAsTrainingTemplate() {
  const name = prompt('Nombre de la plantilla de formacion:');
  if (!name || !name.trim()) return;
  const templates = loadTrainingTemplates();
  const template = {
    id: Date.now(),
    name: name.trim(),
    eventName: document.getElementById('eventName')?.value || '',
    eventType: document.getElementById('eventType')?.value || '',
    eventLocation: document.getElementById('eventLocation')?.value || '',
    eventTrainer: document.getElementById('eventTrainer')?.value || '',
    eventDuration: document.getElementById('eventDuration')?.value || '',
    filters: JSON.parse(JSON.stringify(state.filters)),
    emailTemplate: document.getElementById('emailTemplate')?.value || '',
    createdAt: new Date().toISOString()
  };
  templates.push(template);
  saveTrainingTemplates(templates);
  showToast(`Plantilla recurrente "${name.trim()}" guardada`, 'success');
  renderTrainingTemplateSelector();
}
```

- [ ] **Step 3: Selector de plantillas recurrentes**

Anadir un dropdown en la seccion "3. Datos del evento":

```javascript
function renderTrainingTemplateSelector() {
  let sel = document.getElementById('trainingTemplateSelect');
  if (!sel) return;
  const templates = loadTrainingTemplates();
  sel.replaceChildren();
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = 'Cargar plantilla recurrente...';
  sel.appendChild(opt0);
  templates.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
}
```

- [ ] **Step 4: Aplicar plantilla recurrente**

```javascript
function applyTrainingTemplate(id) {
  const templates = loadTrainingTemplates();
  const t = templates.find(x => x.id == id);
  if (!t) return;
  // Rellenar campos excepto fecha
  if (t.eventName) document.getElementById('eventName').value = t.eventName;
  if (t.eventType) document.getElementById('eventType').value = t.eventType;
  if (t.eventLocation) document.getElementById('eventLocation').value = t.eventLocation;
  if (t.eventTrainer) document.getElementById('eventTrainer').value = t.eventTrainer;
  if (t.eventDuration) document.getElementById('eventDuration').value = t.eventDuration;
  if (t.filters) {
    state.filters = JSON.parse(JSON.stringify(t.filters));
    syncFiltersToUI();
    applyFilters();
  }
  if (t.emailTemplate) {
    const el = document.getElementById('emailTemplate');
    if (el) el.value = t.emailTemplate;
  }
  showToast(`Plantilla "${t.name}" aplicada. Ajusta la fecha.`, 'success');
}
```

- [ ] **Step 5: Verificar**

Crear una formacion, guardar como plantilla recurrente. Limpiar campos, seleccionar la plantilla del dropdown. Todos los campos excepto fecha deben rellenarse.

- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat: plantillas de formaciones recurrentes"
```

---

## Chunk 2: Features de UX y navegacion

### Task 6: Cola rediseñada (panel lateral con info)

**Files:**
- Modify: `convocatoria.html` (CSS + JS)

**Descripcion:** Redisenar la queue bar actual de una barra simple a un panel lateral desplegable que muestra los items de la cola con mas detalle (nombre formacion, fecha, numero de asistentes, estado). Incluye drag & drop para reordenar.

- [ ] **Step 1: CSS del panel lateral de cola**

```css
.queue-panel {
  position: fixed;
  top: 0;
  right: -380px;
  width: 380px;
  height: 100vh;
  background: var(--bg-panel);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  transition: right var(--transition);
  display: flex;
  flex-direction: column;
}
.queue-panel.open {
  right: 0;
}
.queue-panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.queue-panel-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.queue-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
.queue-item {
  padding: 12px;
  background: var(--bg-input);
  border-radius: var(--radius);
  margin-bottom: 8px;
  cursor: grab;
  transition: background var(--transition);
}
.queue-item:hover {
  background: var(--accent-subtle);
}
.queue-item.dragging {
  opacity: 0.5;
}
.queue-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.queue-item-meta {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
.queue-panel-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}
.queue-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.3);
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition);
}
.queue-panel-overlay.open {
  opacity: 1;
  pointer-events: auto;
}
```

- [ ] **Step 2: HTML del panel**

Anadir al final del body:

```html
<div class="queue-panel-overlay" id="queueOverlay" onclick="toggleQueuePanel()"></div>
<div class="queue-panel" id="queuePanel">
  <div class="queue-panel-header">
    <h3>Cola de envios (<span id="queueCount">0</span>)</h3>
    <button class="link-btn link-clear" onclick="toggleQueuePanel()">Cerrar</button>
  </div>
  <div class="queue-panel-body" id="queuePanelBody"></div>
  <div class="queue-panel-footer">
    <button class="btn btn-primary" style="width:100%" onclick="btnLaunchQueue()">Enviar cola</button>
  </div>
</div>
```

- [ ] **Step 3: Implementar toggle y render**

```javascript
function toggleQueuePanel() {
  const panel = document.getElementById('queuePanel');
  const overlay = document.getElementById('queueOverlay');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
  if (!isOpen) renderQueuePanel();
}

function renderQueuePanel() {
  const body = document.getElementById('queuePanelBody');
  const queue = state.queue || [];
  document.getElementById('queueCount').textContent = queue.length;
  if (!queue.length) {
    body.textContent = '';
    const empty = document.createElement('p');
    empty.style.cssText = 'text-align:center; color: var(--text-muted); padding: 40px 0; font-size: 13px;';
    empty.textContent = 'La cola esta vacia';
    body.appendChild(empty);
    return;
  }
  body.replaceChildren();
  queue.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'queue-item';
    div.draggable = true;
    div.dataset.idx = i;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'queue-item-name';
    nameDiv.textContent = item.eventName || 'Sin nombre';
    const metaDiv = document.createElement('div');
    metaDiv.className = 'queue-item-meta';
    metaDiv.textContent = `${item.eventDate || 'Sin fecha'} | ${(item.recipients || []).length} destinatarios`;
    const delBtn = document.createElement('button');
    delBtn.className = 'link-btn link-clear';
    delBtn.textContent = 'Quitar';
    delBtn.style.cssText = 'float: right; margin-top: -20px;';
    delBtn.onclick = (e) => { e.stopPropagation(); removeFromQueue(i); renderQueuePanel(); };
    div.appendChild(nameDiv);
    div.appendChild(metaDiv);
    div.appendChild(delBtn);
    // Drag events
    div.addEventListener('dragstart', (e) => {
      div.classList.add('dragging');
      e.dataTransfer.setData('text/plain', i);
    });
    div.addEventListener('dragend', () => div.classList.remove('dragging'));
    div.addEventListener('dragover', (e) => e.preventDefault());
    div.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = parseInt(e.dataTransfer.getData('text/plain'));
      const to = i;
      if (from !== to) {
        const moved = state.queue.splice(from, 1)[0];
        state.queue.splice(to, 0, moved);
        saveState();
        renderQueuePanel();
      }
    });
    body.appendChild(div);
  });
}
```

- [ ] **Step 4: Actualizar queue bar para abrir panel**

Modificar la queue bar existente para que al hacer clic abra el panel lateral en vez de mostrar info inline:

```javascript
// En la queue bar, cambiar el onclick del boton de "Ver cola"
// a toggleQueuePanel()
```

- [ ] **Step 5: Verificar**

Anadir items a la cola, abrir panel, verificar drag & drop para reordenar, eliminar items, enviar cola.

- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat: cola rediseñada como panel lateral con drag and drop"
```

---

### Task 7: Filtros con badge de conteo activo

**Files:**
- Modify: `convocatoria.html` (CSS + JS)

**Descripcion:** Mostrar un badge numerico en cada filtro que indique cuantos valores estan seleccionados. Si no hay filtros activos, no mostrar badge. Si hay filtros activos, mostrar la cantidad.

- [ ] **Step 1: CSS del badge**

```css
.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-lg);
  background: var(--accent);
  color: white;
  font-size: 10px;
  font-weight: 600;
  margin-left: 6px;
}
```

- [ ] **Step 2: Implementar updateFilterBadges()**

```javascript
function updateFilterBadges() {
  FILTER_KEYS.forEach(key => {
    const label = document.querySelector(`[data-filter-key="${key}"] .filter-badge`);
    if (!label) return;
    const active = (state.filters[key] || []).length;
    if (active > 0) {
      label.textContent = active;
      label.style.display = 'inline-flex';
    } else {
      label.style.display = 'none';
    }
  });
}
```

- [ ] **Step 3: Anadir badges al HTML de filtros**

En la funcion que renderiza los labels de filtros, anadir un `<span class="filter-badge" style="display:none"></span>` despues de cada label.

- [ ] **Step 4: Llamar updateFilterBadges() al aplicar filtros**

Anadir llamada a `updateFilterBadges()` al final de `applyFilters()`.

- [ ] **Step 5: Verificar**

Seleccionar valores en varios filtros. Verificar que aparecen badges con el numero correcto. Limpiar filtros, verificar que desaparecen.

- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat: badges de conteo en filtros activos"
```

---

### Task 8: Historial vinculado a accion formativa

**Files:**
- Modify: `convocatoria.html` (JS)

**Descripcion:** En el historial de convocatorias enviadas, vincular cada entrada con su accion formativa del catalogo FUNDAE. Cuando se envia una convocatoria, guardar el codigo de accion. En el historial, permitir clic para abrir la accion en el catalogo.

- [ ] **Step 1: Guardar codigo de accion al enviar**

Modificar la funcion que guarda en el historial para incluir `actionCode`:

```javascript
// En la funcion que anade al historial (addToHistory o similar):
historyEntry.actionCode = state.currentActionCode || '';
```

- [ ] **Step 2: Mostrar enlace en historial**

En la funcion que renderiza el historial, si `entry.actionCode` existe, mostrar un link:

```javascript
if (entry.actionCode) {
  const link = document.createElement('a');
  link.href = '#';
  link.className = 'link-btn';
  link.textContent = entry.actionCode;
  link.onclick = (e) => {
    e.preventDefault();
    navigateToAction(entry.actionCode);
  };
  row.appendChild(link);
}
```

- [ ] **Step 3: Implementar navigateToAction()**

```javascript
function navigateToAction(code) {
  // Cambiar al tab de catalogo
  switchTab('catalog');
  // Buscar y resaltar la accion
  const actions = state.catalogActions || [];
  const action = actions.find(a => a.codigo === code);
  if (action) {
    // Abrir detalle de la accion
    openActionDetail(action);
    showToast(`Accion ${code} encontrada`, 'success');
  } else {
    showToast(`Accion ${code} no encontrada en el catalogo`, 'warning');
  }
}
```

- [ ] **Step 4: Verificar**

Enviar una convocatoria con accion formativa asociada. Ir al historial, verificar que aparece el codigo de accion como link. Clic en el link, verificar que navega al catalogo y abre la accion.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: historial vinculado a acciones formativas del catalogo"
```

---

### Task 9: Navegacion calendario a catalogo (clic en barra Gantt)

**Files:**
- Modify: `convocatoria.html` (JS)

**Descripcion:** Al hacer clic en una barra del diagrama de Gantt en el calendario, navegar al catalogo y abrir el detalle de esa accion formativa.

- [ ] **Step 1: Anadir evento click a las barras**

En `renderCalendarTab()`, al crear cada barra del Gantt, anadir onclick:

```javascript
// Dentro del bucle que crea las barras del Gantt
bar.style.cursor = 'pointer';
bar.addEventListener('click', (e) => {
  e.stopPropagation();
  const code = bar.dataset.code; // ya deberia tener el codigo
  if (code) navigateToAction(code);
});
```

- [ ] **Step 2: Asegurar que las barras tienen data-code**

Verificar que al crear las barras se les asigna `bar.dataset.code = action.codigo`. Si no, anadirlo.

- [ ] **Step 3: Anadir tooltip visual**

```javascript
bar.title = `${action.nombre || action.codigo} - Clic para ver detalle`;
```

- [ ] **Step 4: Verificar**

Ir al calendario, hacer clic en una barra. Debe navegar al catalogo y abrir el detalle de la accion.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: navegacion desde barras del Gantt al catalogo de acciones"
```

---

## Notas de implementacion

- Todas las funciones deben seguir los patrones existentes del codebase
- Usar `esc()` para sanitizar cualquier dato del usuario/Excel antes de insertar en el DOM
- Usar `showToast()` en vez de `alert()`
- Usar CSS variables del design system, nunca colores hardcodeados
- Usar `saveState()` para persistir cambios de estado
- IDs sinteticos (`_id`) para seleccion, nunca NIFs
- Todo en `convocatoria.html`, sin ficheros adicionales
