# Analytics de Alto Impacto - Plan de Implementacion

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar 7 modulos de analytics avanzados en el dashboard de convocatoria.html que explotan datos infrautilizados para generar insights estrategicos de formacion.

**Architecture:** Cada modulo de analytics se implementa como: (1) una funcion helper `calcXxx()` que computa los datos, (2) una seccion HTML en el dashboard con su contenedor, (3) una llamada desde `renderDashboard()` (linea 8466). Se reutilizan las funciones de grafico existentes `renderSvgBarChart()` (linea 8228) y `renderSvgDonut()` (linea 8315). Todo en `convocatoria.html`.

**Tech Stack:** HTML/CSS/JS vanilla, SVG para graficos, canvas para heatmaps, localStorage.

**Referencia clave del codigo:**
- `renderDashboard()`: lineas 8466-8962
- Dashboard HTML: lineas 2358-2434
- `renderSvgBarChart()`: lineas 8228-8307
- `renderSvgDonut()`: lineas 8315-8448
- `EMPRESAS_GRUPO`: lineas 7028-7280
- `getCatalog(key)`: lineas 2621-2624
- `getHistory()`: lineas 4311-4313
- Acciones tienen: `participantes[]`, `presupuesto`, `empresaPagadora`, `bonificable`, `fechaInicio/Fin`, `modalidad`, `horasPresenciales/horasTeleformacion`, `estado`, `departamento`, `asistencia`, `confirmaciones`, `notas[]`, `comunicacionInicioEnviada/FinEnviada`
- Empleados tienen: campos `_f_` FUNDAE (`Coste Salarial Hora`, `Sexo`, `DiscapacidadContrib`, `Categoria profesional`, `CIF`, `Grupo Cotizacion`, `NSS`)
- `state.employees[]`: array de empleados cargados del Excel
- `state.history[]`: max 50 entradas con `emails[]`, `timestamp`, `surveyScheduled`

---

## Chunk 1: Riesgo FUNDAE y Credito (Impacto Muy Alto)

### Task 1: Scoring de Riesgo FUNDAE (#11)

**Files:**
- Modify: `convocatoria.html` (HTML linea ~2432, JS linea ~8960)

**Descripcion:** Calcular un score de riesgo 0-100 para cada accion bonificable. Factores: campos obligatorios vacios, datos de participantes incompletos (NSS, CIF, grupo cotizacion), ausencia de proveedor/centro/tutor, asistencia <75%, plazos FUNDAE proximos sin documentacion. Mostrar lista ordenada por riesgo.

- [ ] **Step 1: Anadir contenedor HTML en el dashboard**

Despues de la seccion de completitud (`dashCompletenessChart`, linea ~2432), insertar:

```html
<div class="dash-card" style="grid-column: 1 / -1;">
  <h3 class="dash-card-title">Riesgo de Bonificacion FUNDAE</h3>
  <div id="dashRiskScoring"></div>
</div>
```

- [ ] **Step 2: Implementar calcFundaeRiskScore(accion, employees)**

Insertar antes de `renderDashboard()` (linea ~8466):

```javascript
function calcFundaeRiskScore(accion, employees) {
  var score = 0;
  var factors = [];
  // 1. Campos obligatorios de la accion (peso: 5 cada uno, max 35)
  var required = ['codigo','nombre','modalidad','fechaInicio','fechaFin','empresaPagadora','objetivos'];
  required.forEach(function(f) {
    if (!accion[f] || accion[f] === '') {
      score += 5;
      factors.push('Falta ' + f);
    }
  });
  // 2. Horas no definidas (peso: 10)
  var horas = parseFloat(accion.horasPresenciales || 0) + parseFloat(accion.horasTeleformacion || 0);
  if (horas <= 0) {
    score += 10;
    factors.push('Sin horas definidas');
  }
  // 3. Sin proveedor/centro/tutor vinculado (peso: 5 cada uno, max 15)
  if (!accion.proveedorVinculado) { score += 5; factors.push('Sin proveedor'); }
  if (!accion.centroVinculado) { score += 5; factors.push('Sin centro'); }
  if (!accion.tutorVinculado) { score += 5; factors.push('Sin tutor'); }
  // 4. Sin participantes (peso: 15)
  var parts = accion.participantes || [];
  if (parts.length === 0) {
    score += 15;
    factors.push('Sin participantes');
  } else {
    // 5. Participantes con datos FUNDAE incompletos (peso: hasta 10)
    var incomplete = 0;
    parts.forEach(function(nif) {
      var emp = employees.find(function(e) { return (e.NIF || e._f_NIF) === nif; });
      if (!emp) { incomplete++; return; }
      var missing = ['Numero Seguridad Social','CIF','Grupo Cotizacion'].filter(function(f) {
        return !emp['_f_' + f] && !emp[f];
      });
      if (missing.length > 0) incomplete++;
    });
    if (incomplete > 0) {
      var pct = incomplete / parts.length;
      score += Math.round(pct * 10);
      factors.push(incomplete + ' participante(s) con datos incompletos');
    }
  }
  // 6. Asistencia < 75% (peso: 15)
  if (accion.asistencia && accion.asistencia.registro) {
    var reg = accion.asistencia.registro;
    var sesiones = accion.asistencia.sesiones || [];
    if (sesiones.length > 0 && parts.length > 0) {
      var totalChecks = 0, totalPresent = 0;
      parts.forEach(function(nif) {
        var r = reg[nif];
        if (!r) return;
        sesiones.forEach(function(s) {
          var fecha = typeof s === 'string' ? s : s.fecha;
          if (fecha && r[fecha] !== undefined) {
            totalChecks++;
            if (r[fecha] === true || r[fecha] === 'Presente') totalPresent++;
          }
        });
      });
      if (totalChecks > 0 && (totalPresent / totalChecks) < 0.75) {
        score += 15;
        factors.push('Asistencia media < 75%');
      }
    }
  }
  // 7. Plazos sin documentacion (peso: 10)
  var hoy = new Date();
  if (accion.fechaInicio) {
    var fi = new Date(accion.fechaInicio);
    if (fi <= hoy && !accion.comunicacionInicioEnviada) {
      score += 10;
      factors.push('Comunicacion de inicio no enviada');
    }
  }
  if (accion.fechaFin) {
    var ff = new Date(accion.fechaFin);
    if (ff <= hoy && !accion.comunicacionFinEnviada) {
      score += 10;
      factors.push('Comunicacion de fin no enviada');
    }
  }
  return { score: Math.min(score, 100), factors: factors };
}
```

- [ ] **Step 3: Renderizar la seccion de riesgo en renderDashboard()**

Antes de la llamada a `renderTrainingLoadChart()` (linea ~8960), insertar:

```javascript
// --- Risk Scoring ---
(function() {
  var container = document.getElementById('dashRiskScoring');
  if (!container) return;
  var bonificables = acciones.filter(function(a) {
    return a.bonificable === 'Si' && a.estado !== 'Anulada';
  });
  if (!bonificables.length) {
    container.textContent = '';
    var p = document.createElement('p');
    p.style.cssText = 'color:var(--text-muted);text-align:center;padding:20px;font-size:13px;';
    p.textContent = 'No hay acciones bonificables';
    container.appendChild(p);
    return;
  }
  var emps = state.employees || [];
  var scored = bonificables.map(function(a) {
    var r = calcFundaeRiskScore(a, emps);
    return { accion: a, score: r.score, factors: r.factors };
  }).sort(function(a, b) { return b.score - a.score; });

  // KPI resumen
  var altoRiesgo = scored.filter(function(s) { return s.score >= 50; }).length;
  var medioRiesgo = scored.filter(function(s) { return s.score >= 25 && s.score < 50; }).length;

  container.textContent = '';
  var summary = document.createElement('div');
  summary.style.cssText = 'display:flex;gap:16px;margin-bottom:12px;';
  var badges = [
    { label: 'Riesgo alto', count: altoRiesgo, color: 'var(--danger)' },
    { label: 'Riesgo medio', count: medioRiesgo, color: 'var(--warning)' },
    { label: 'Riesgo bajo', count: scored.length - altoRiesgo - medioRiesgo, color: 'var(--success)' }
  ];
  badges.forEach(function(b) {
    var d = document.createElement('div');
    d.style.cssText = 'flex:1;text-align:center;padding:8px;border-radius:var(--radius);background:var(--bg-input);';
    var n = document.createElement('div');
    n.style.cssText = 'font-size:24px;font-weight:700;color:' + b.color + ';';
    n.textContent = b.count;
    var l = document.createElement('div');
    l.style.cssText = 'font-size:11px;color:var(--text-muted);margin-top:2px;';
    l.textContent = b.label;
    d.appendChild(n);
    d.appendChild(l);
    summary.appendChild(d);
  });
  container.appendChild(summary);

  // Lista de acciones con riesgo
  scored.forEach(function(s) {
    if (s.score === 0) return;
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px;';
    // Progress bar
    var barWrap = document.createElement('div');
    barWrap.style.cssText = 'width:60px;height:6px;background:var(--bg-input);border-radius:3px;flex-shrink:0;';
    var bar = document.createElement('div');
    var barColor = s.score >= 50 ? 'var(--danger)' : s.score >= 25 ? 'var(--warning)' : 'var(--success)';
    bar.style.cssText = 'height:100%;border-radius:3px;background:' + barColor + ';width:' + s.score + '%;';
    barWrap.appendChild(bar);
    // Score
    var scoreSpan = document.createElement('span');
    scoreSpan.style.cssText = 'font-weight:600;width:30px;text-align:right;color:' + barColor + ';flex-shrink:0;';
    scoreSpan.textContent = s.score;
    // Nombre
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;color:var(--text-primary);';
    nameSpan.textContent = (s.accion.codigo || '') + ' ' + (s.accion.nombre || 'Sin nombre');
    // Factores
    var factorsSpan = document.createElement('span');
    factorsSpan.style.cssText = 'color:var(--text-muted);font-size:11px;max-width:300px;text-align:right;';
    factorsSpan.textContent = s.factors.slice(0, 3).join(', ');
    row.appendChild(scoreSpan);
    row.appendChild(barWrap);
    row.appendChild(nameSpan);
    row.appendChild(factorsSpan);
    container.appendChild(row);
  });
})();
```

- [ ] **Step 4: Verificar**

Cargar acciones bonificables con datos incompletos. Verificar que el scoring asigna puntos correctamente y ordena por riesgo.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: scoring de riesgo de bonificacion FUNDAE en dashboard"
```

---

### Task 2: Proyeccion de Credito FUNDAE (#7)

**Files:**
- Modify: `convocatoria.html` (HTML linea ~2396, JS linea ~8824)

**Descripcion:** Ampliar la seccion de credito existente con una proyeccion a fin de ano. Calcula el ritmo de consumo actual y proyecta la fecha de agotamiento y el % estimado de uso a 31/12. Senala empresas en riesgo de infrauso (<50%) o sobreuso (>100%).

- [ ] **Step 1: Implementar projectCreditUsage(acciones)**

Insertar antes de `renderDashboard()`:

```javascript
function projectCreditUsage(acciones) {
  var empresas = EMPRESAS_GRUPO.filter(function(e) { return e.credito > 1000; });
  var hoy = new Date();
  var inicioAnio = new Date(hoy.getFullYear(), 0, 1);
  var finAnio = new Date(hoy.getFullYear(), 11, 31);
  var diasTranscurridos = Math.max(1, Math.floor((hoy - inicioAnio) / 86400000));
  var diasTotales = Math.floor((finAnio - inicioAnio) / 86400000);

  return empresas.map(function(emp) {
    // Consumido: acciones completadas o en curso
    var consumido = 0;
    var planificado = 0;
    acciones.forEach(function(a) {
      if (a.empresaPagadora !== emp.cif || a.bonificable !== 'Si') return;
      var p = parseFloat(a.presupuesto) || 0;
      if (a.estado === 'Terminada' || a.estado === 'En marcha') consumido += p;
      else if (a.estado === 'Pendiente' || a.estado === 'En preparacion') planificado += p;
    });
    // Proyeccion lineal
    var ritmoMensual = consumido / (diasTranscurridos / 30);
    var mesesRestantes = (diasTotales - diasTranscurridos) / 30;
    var proyectado = consumido + (ritmoMensual * mesesRestantes);
    var pctProyectado = emp.credito > 0 ? Math.round((proyectado / emp.credito) * 100) : 0;
    // Fecha agotamiento
    var fechaAgotamiento = null;
    if (ritmoMensual > 0) {
      var mesesHastaAgotar = (emp.credito - consumido) / ritmoMensual;
      if (mesesHastaAgotar > 0) {
        fechaAgotamiento = new Date(hoy);
        fechaAgotamiento.setDate(fechaAgotamiento.getDate() + Math.round(mesesHastaAgotar * 30));
      }
    }
    return {
      empresa: emp.razonSocial,
      cif: emp.cif,
      credito: emp.credito,
      consumido: consumido,
      planificado: planificado,
      proyectado: proyectado,
      pctProyectado: pctProyectado,
      fechaAgotamiento: fechaAgotamiento,
      riesgo: pctProyectado < 50 ? 'infrauso' : pctProyectado > 100 ? 'sobreuso' : 'ok'
    };
  });
}
```

- [ ] **Step 2: Anadir contenedor HTML para proyeccion**

Despues del chart de credito existente (`dashCreditChart`, linea ~2396), insertar:

```html
<div id="dashCreditProjection" style="margin-top: 12px;"></div>
```

- [ ] **Step 3: Renderizar proyeccion en renderDashboard()**

Despues del bloque de credito existente (linea ~8824), insertar:

```javascript
// --- Credit Projection ---
(function() {
  var projContainer = document.getElementById('dashCreditProjection');
  if (!projContainer) return;
  var proj = projectCreditUsage(acciones);
  var conRiesgo = proj.filter(function(p) { return p.riesgo !== 'ok'; });
  projContainer.textContent = '';

  if (conRiesgo.length > 0) {
    var alertDiv = document.createElement('div');
    alertDiv.style.cssText = 'padding:8px 12px;border-radius:var(--radius-sm);margin-bottom:8px;font-size:12px;';
    var infrauso = conRiesgo.filter(function(p) { return p.riesgo === 'infrauso'; });
    var sobreuso = conRiesgo.filter(function(p) { return p.riesgo === 'sobreuso'; });
    if (infrauso.length > 0) {
      var d = document.createElement('div');
      d.style.cssText = 'color:var(--warning);margin-bottom:4px;';
      d.textContent = infrauso.length + ' empresa(s) en riesgo de infrauso (<50% proyectado)';
      alertDiv.appendChild(d);
    }
    if (sobreuso.length > 0) {
      var d2 = document.createElement('div');
      d2.style.cssText = 'color:var(--danger);';
      d2.textContent = sobreuso.length + ' empresa(s) en riesgo de sobreuso (>100% proyectado)';
      alertDiv.appendChild(d2);
    }
    projContainer.appendChild(alertDiv);
  }

  // Tabla de proyeccion
  var table = document.createElement('table');
  table.style.cssText = 'width:100%;font-size:11px;border-collapse:collapse;';
  var thead = document.createElement('thead');
  var headerRow = document.createElement('tr');
  ['Empresa','Credito','Consumido','Planif.','Proy. Dic','%','Agotam.'].forEach(function(h) {
    var th = document.createElement('th');
    th.style.cssText = 'text-align:left;padding:4px 6px;border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:500;';
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  proj.forEach(function(p) {
    var tr = document.createElement('tr');
    var rColor = p.riesgo === 'infrauso' ? 'var(--warning)' : p.riesgo === 'sobreuso' ? 'var(--danger)' : 'var(--text-primary)';
    var cells = [
      p.empresa.replace(/,.*/,''),
      p.credito.toLocaleString('es-ES', {maximumFractionDigits:0}) + ' EUR',
      p.consumido.toLocaleString('es-ES', {maximumFractionDigits:0}),
      p.planificado.toLocaleString('es-ES', {maximumFractionDigits:0}),
      p.proyectado.toLocaleString('es-ES', {maximumFractionDigits:0}),
      p.pctProyectado + '%',
      p.fechaAgotamiento ? p.fechaAgotamiento.toLocaleDateString('es-ES', {month:'short', year:'2-digit'}) : '-'
    ];
    cells.forEach(function(c, i) {
      var td = document.createElement('td');
      td.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);color:' + (i >= 4 ? rColor : 'var(--text-primary)') + ';';
      td.textContent = c;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  projContainer.appendChild(table);
})();
```

- [ ] **Step 4: Verificar**

Crear acciones bonificables con diferentes estados y presupuestos. Verificar que la proyeccion calcula correctamente el ritmo y senala infrauso/sobreuso.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: proyeccion de consumo de credito FUNDAE a fin de ano"
```

---

### Task 3: ROI de Formacion por Empresa (#3)

**Files:**
- Modify: `convocatoria.html` (HTML linea ~2434, JS linea ~8960)

**Descripcion:** Calcula el coste real de formacion por empresa: coste directo (presupuesto) + coste de oportunidad (horas x coste salarial por participante) - bonificacion FUNDAE. Tabla resumen y grafico de barras apiladas.

- [ ] **Step 1: Implementar calcROI(acciones, employees)**

```javascript
function calcROI(acciones, employees) {
  var empMap = {};
  employees.forEach(function(e) {
    var nif = e.NIF || '';
    if (nif) empMap[nif] = e;
  });

  var result = {};
  EMPRESAS_GRUPO.forEach(function(eg) {
    result[eg.cif] = {
      empresa: eg.razonSocial.replace(/,.*/,''),
      cif: eg.cif,
      credito: eg.credito,
      costeDirecto: 0,
      costeOportunidad: 0,
      bonificacion: 0,
      participantesUnicos: new Set(),
      acciones: 0
    };
  });

  acciones.forEach(function(a) {
    var cif = a.empresaPagadora;
    if (!cif || !result[cif]) return;
    var r = result[cif];
    r.acciones++;
    var presupuesto = parseFloat(a.presupuesto) || 0;
    r.costeDirecto += presupuesto;
    if (a.bonificable === 'Si') r.bonificacion += presupuesto;

    var horas = parseFloat(a.horasPresenciales || 0) + parseFloat(a.horasTeleformacion || 0);
    (a.participantes || []).forEach(function(nif) {
      r.participantesUnicos.add(nif);
      var emp = empMap[nif];
      if (emp) {
        var costeSalarial = parseFloat(emp['_f_Coste Salarial Hora'] || emp['Coste Salarial Hora'] || 0);
        r.costeOportunidad += costeSalarial * horas;
      }
    });
  });

  return Object.values(result).filter(function(r) {
    return r.acciones > 0;
  }).map(function(r) {
    r.participantesUnicos = r.participantesUnicos.size;
    r.costeNeto = r.costeDirecto + r.costeOportunidad - r.bonificacion;
    r.costePerCapita = r.participantesUnicos > 0 ? r.costeNeto / r.participantesUnicos : 0;
    return r;
  }).sort(function(a, b) { return b.costeNeto - a.costeNeto; });
}
```

- [ ] **Step 2: Anadir contenedor HTML**

Despues de la seccion de completitud:

```html
<div class="dash-card" style="grid-column: 1 / -1;">
  <h3 class="dash-card-title">ROI de Formacion por Empresa</h3>
  <div id="dashROI"></div>
</div>
```

- [ ] **Step 3: Renderizar en renderDashboard()**

```javascript
// --- ROI por Empresa ---
(function() {
  var container = document.getElementById('dashROI');
  if (!container) return;
  var emps = state.employees || [];
  var roi = calcROI(acciones, emps);
  container.textContent = '';
  if (!roi.length) {
    var p = document.createElement('p');
    p.style.cssText = 'color:var(--text-muted);text-align:center;padding:20px;font-size:13px;';
    p.textContent = 'Sin datos suficientes';
    container.appendChild(p);
    return;
  }

  // KPIs globales
  var totalDirecto = roi.reduce(function(s, r) { return s + r.costeDirecto; }, 0);
  var totalOport = roi.reduce(function(s, r) { return s + r.costeOportunidad; }, 0);
  var totalBonif = roi.reduce(function(s, r) { return s + r.bonificacion; }, 0);
  var totalNeto = roi.reduce(function(s, r) { return s + r.costeNeto; }, 0);

  var kpiRow = document.createElement('div');
  kpiRow.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;';
  var fmt = function(n) { return n.toLocaleString('es-ES', {maximumFractionDigits:0}) + ' EUR'; };
  [
    { label: 'Coste directo', val: fmt(totalDirecto), color: 'var(--accent)' },
    { label: 'Coste oportunidad', val: fmt(totalOport), color: 'var(--warning)' },
    { label: 'Bonificacion FUNDAE', val: '-' + fmt(totalBonif), color: 'var(--success)' },
    { label: 'Coste neto', val: fmt(totalNeto), color: 'var(--text-primary)' }
  ].forEach(function(k) {
    var d = document.createElement('div');
    d.style.cssText = 'text-align:center;padding:10px;background:var(--bg-input);border-radius:var(--radius);';
    var v = document.createElement('div');
    v.style.cssText = 'font-size:16px;font-weight:700;color:' + k.color + ';';
    v.textContent = k.val;
    var l = document.createElement('div');
    l.style.cssText = 'font-size:11px;color:var(--text-muted);margin-top:2px;';
    l.textContent = k.label;
    d.appendChild(v);
    d.appendChild(l);
    kpiRow.appendChild(d);
  });
  container.appendChild(kpiRow);

  // SVG barras apiladas
  var maxVal = Math.max.apply(null, roi.map(function(r) { return r.costeDirecto + r.costeOportunidad; }));
  var svgH = roi.length * 32 + 20;
  var svgW = 500;
  var svg = '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" style="width:100%;height:auto;">';
  roi.forEach(function(r, i) {
    var y = i * 32 + 10;
    var barMax = svgW - 160;
    var wDirect = maxVal > 0 ? (r.costeDirecto / maxVal) * barMax : 0;
    var wOport = maxVal > 0 ? (r.costeOportunidad / maxVal) * barMax : 0;
    // Label
    svg += '<text x="0" y="' + (y + 14) + '" font-size="11" fill="var(--text-secondary)">' + esc(r.empresa.substring(0, 18)) + '</text>';
    // Barra directa
    svg += '<rect x="130" y="' + (y + 2) + '" width="' + wDirect + '" height="16" rx="2" fill="var(--accent)" opacity="0.8"/>';
    // Barra oportunidad
    svg += '<rect x="' + (130 + wDirect) + '" y="' + (y + 2) + '" width="' + wOport + '" height="16" rx="2" fill="var(--warning)" opacity="0.6"/>';
    // Valor
    svg += '<text x="' + (130 + wDirect + wOport + 4) + '" y="' + (y + 14) + '" font-size="10" fill="var(--text-muted)">' + fmt(r.costeNeto) + '</text>';
  });
  svg += '</svg>';
  var svgDiv = document.createElement('div');
  svgDiv.insertAdjacentHTML('beforeend', svg);
  container.appendChild(svgDiv);

  // Leyenda
  var legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;justify-content:center;margin-top:8px;font-size:11px;color:var(--text-muted);';
  legend.insertAdjacentHTML('beforeend',
    '<span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;margin-right:4px;opacity:0.8;"></span>Directo</span>' +
    '<span><span style="display:inline-block;width:10px;height:10px;background:var(--warning);border-radius:2px;margin-right:4px;opacity:0.6;"></span>Oportunidad</span>'
  );
  container.appendChild(legend);
})();
```

- [ ] **Step 4: Verificar**

Cargar empleados con Coste Salarial Hora y acciones con participantes. Verificar que el ROI calcula coste directo + oportunidad - bonificacion correctamente.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: analisis ROI de formacion por empresa en dashboard"
```

---

## Chunk 2: Cobertura y Equidad (Impacto Alto)

### Task 4: Cobertura Formativa por Empleado (#1)

**Files:**
- Modify: `convocatoria.html` (HTML + JS)

**Descripcion:** Heatmap departamento x empresa mostrando % de plantilla formada. Lista de empleados sin formacion. KPI de cobertura global.

- [ ] **Step 1: Implementar calcCoverageIndex(acciones, employees)**

```javascript
function calcCoverageIndex(acciones, employees) {
  // Set de NIFs que han participado en alguna accion
  var formados = new Set();
  acciones.forEach(function(a) {
    (a.participantes || []).forEach(function(nif) { formados.add(nif); });
  });

  // Tambien contar desde historial (convocatorias enviadas)
  var history = getHistory();
  var emailToNif = {};
  employees.forEach(function(e) {
    var email = (e['Email trabajo'] || '').toLowerCase();
    if (email && e.NIF) emailToNif[email] = e.NIF;
  });
  history.forEach(function(h) {
    (h.emails || []).forEach(function(email) {
      var nif = emailToNif[email.toLowerCase()];
      if (nif) formados.add(nif);
    });
  });

  // Agrupar por departamento x empresa
  var grid = {}; // { dept: { empresa: { total: N, formados: N } } }
  var depts = new Set();
  var empresas = new Set();
  employees.forEach(function(e) {
    if (e['Alta/Baja'] === 0 || e['Alta/Baja'] === '0') return; // inactivo
    var dept = e['Departamento'] || 'Sin dept.';
    var emp = e['Empresa'] || 'Sin empresa';
    depts.add(dept);
    empresas.add(emp);
    if (!grid[dept]) grid[dept] = {};
    if (!grid[dept][emp]) grid[dept][emp] = { total: 0, formados: 0 };
    grid[dept][emp].total++;
    if (formados.has(e.NIF)) grid[dept][emp].formados++;
  });

  // Empleados sin formacion
  var sinFormacion = employees.filter(function(e) {
    return (e['Alta/Baja'] !== 0 && e['Alta/Baja'] !== '0') && !formados.has(e.NIF);
  });

  var totalActivos = employees.filter(function(e) {
    return e['Alta/Baja'] !== 0 && e['Alta/Baja'] !== '0';
  }).length;

  return {
    grid: grid,
    depts: Array.from(depts).sort(),
    empresas: Array.from(empresas).sort(),
    formados: formados.size,
    totalActivos: totalActivos,
    pctCobertura: totalActivos > 0 ? Math.round((formados.size / totalActivos) * 100) : 0,
    sinFormacion: sinFormacion
  };
}
```

- [ ] **Step 2: Anadir contenedor HTML**

```html
<div class="dash-card" style="grid-column: 1 / -1;">
  <h3 class="dash-card-title">Cobertura Formativa</h3>
  <div id="dashCoverage"></div>
</div>
```

- [ ] **Step 3: Renderizar heatmap con canvas**

```javascript
// --- Cobertura Formativa ---
(function() {
  var container = document.getElementById('dashCoverage');
  if (!container || !state.employees || !state.employees.length) return;
  var cov = calcCoverageIndex(acciones, state.employees);
  container.textContent = '';

  // KPI
  var kpi = document.createElement('div');
  kpi.style.cssText = 'text-align:center;padding:12px;margin-bottom:12px;background:var(--bg-input);border-radius:var(--radius);';
  var pctColor = cov.pctCobertura >= 80 ? 'var(--success)' : cov.pctCobertura >= 50 ? 'var(--warning)' : 'var(--danger)';
  kpi.insertAdjacentHTML('beforeend',
    '<span style="font-size:28px;font-weight:700;color:' + pctColor + ';">' + cov.pctCobertura + '%</span>' +
    '<span style="font-size:13px;color:var(--text-muted);margin-left:8px;">de la plantilla ha recibido formacion (' + cov.formados + '/' + cov.totalActivos + ')</span>'
  );
  container.appendChild(kpi);

  // Heatmap como tabla HTML (mas compatible que canvas)
  if (cov.depts.length > 0 && cov.empresas.length > 0 && cov.empresas.length <= 20) {
    var table = document.createElement('table');
    table.style.cssText = 'width:100%;font-size:10px;border-collapse:collapse;margin-bottom:12px;';
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    var th0 = document.createElement('th');
    th0.style.cssText = 'padding:4px;text-align:left;';
    tr.appendChild(th0);
    cov.empresas.forEach(function(emp) {
      var th = document.createElement('th');
      th.style.cssText = 'padding:4px;text-align:center;writing-mode:vertical-lr;transform:rotate(180deg);max-width:30px;';
      th.textContent = emp.substring(0, 15);
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    cov.depts.forEach(function(dept) {
      var row = document.createElement('tr');
      var tdDept = document.createElement('td');
      tdDept.style.cssText = 'padding:4px;font-weight:500;white-space:nowrap;';
      tdDept.textContent = dept.substring(0, 20);
      row.appendChild(tdDept);
      cov.empresas.forEach(function(emp) {
        var cell = (cov.grid[dept] || {})[emp];
        var td = document.createElement('td');
        td.style.cssText = 'padding:4px;text-align:center;';
        if (cell && cell.total > 0) {
          var pct = Math.round((cell.formados / cell.total) * 100);
          var bg = pct >= 80 ? 'rgba(22,163,74,0.2)' : pct >= 50 ? 'rgba(217,119,6,0.2)' : pct > 0 ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.1)';
          td.style.background = bg;
          td.style.borderRadius = '2px';
          td.textContent = pct + '%';
        }
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Lista colapsable de empleados sin formacion
  if (cov.sinFormacion.length > 0) {
    var details = document.createElement('details');
    var summary = document.createElement('summary');
    summary.style.cssText = 'cursor:pointer;font-size:12px;color:var(--text-secondary);padding:4px 0;';
    summary.textContent = cov.sinFormacion.length + ' empleados sin formacion';
    details.appendChild(summary);
    var list = document.createElement('div');
    list.style.cssText = 'max-height:200px;overflow-y:auto;font-size:11px;margin-top:4px;';
    cov.sinFormacion.slice(0, 50).forEach(function(e) {
      var d = document.createElement('div');
      d.style.cssText = 'padding:2px 0;color:var(--text-muted);';
      d.textContent = (e['Nombre y apellidos'] || e.Empleado || e.NIF || '?') + ' - ' + (e.Departamento || '') + ' (' + (e.Empresa || '') + ')';
      list.appendChild(d);
    });
    if (cov.sinFormacion.length > 50) {
      var more = document.createElement('div');
      more.style.cssText = 'padding:4px 0;color:var(--accent);font-weight:500;';
      more.textContent = '... y ' + (cov.sinFormacion.length - 50) + ' mas';
      list.appendChild(more);
    }
    details.appendChild(list);
    container.appendChild(details);
  }
})();
```

- [ ] **Step 4: Verificar**

Cargar Excel con empleados y acciones con participantes. Verificar heatmap, KPI de cobertura, lista de empleados sin formacion.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: indice de cobertura formativa con heatmap en dashboard"
```

---

### Task 5: Equidad Formativa (#5)

**Files:**
- Modify: `convocatoria.html` (HTML + JS)

**Descripcion:** Compara distribucion de formacion vs composicion de plantilla por genero, discapacidad y categoria profesional. Detecta gaps de equidad.

- [ ] **Step 1: Implementar calcEquityMetrics(acciones, employees)**

```javascript
function calcEquityMetrics(acciones, employees) {
  var formadosNifs = new Set();
  acciones.forEach(function(a) {
    (a.participantes || []).forEach(function(nif) { formadosNifs.add(nif); });
  });

  var dimensions = [
    { key: 'genero', field: '_f_Sexo', label: 'Genero' },
    { key: 'discapacidad', field: '_f_DiscapacidadContrib', label: 'Discapacidad' },
    { key: 'categoria', field: '_f_Categoria profesional', label: 'Categoria Prof.' }
  ];

  var results = [];
  dimensions.forEach(function(dim) {
    var plantilla = {};
    var formacion = {};
    employees.forEach(function(e) {
      if (e['Alta/Baja'] === 0 || e['Alta/Baja'] === '0') return;
      var val = e[dim.field] || e[dim.field.replace('_f_','')] || 'Sin dato';
      if (val === '' || val === null || val === undefined) val = 'Sin dato';
      plantilla[val] = (plantilla[val] || 0) + 1;
      if (formadosNifs.has(e.NIF)) {
        formacion[val] = (formacion[val] || 0) + 1;
      }
    });

    var totalPlantilla = Object.values(plantilla).reduce(function(s, v) { return s + v; }, 0);
    var totalFormacion = Object.values(formacion).reduce(function(s, v) { return s + v; }, 0);
    var categories = Object.keys(plantilla).filter(function(k) { return k !== 'Sin dato'; }).sort();

    var items = categories.map(function(cat) {
      var pctPlantilla = totalPlantilla > 0 ? Math.round((plantilla[cat] / totalPlantilla) * 100) : 0;
      var pctFormacion = totalFormacion > 0 ? Math.round(((formacion[cat] || 0) / totalFormacion) * 100) : 0;
      var gap = pctFormacion - pctPlantilla;
      return { category: cat, pctPlantilla: pctPlantilla, pctFormacion: pctFormacion, gap: gap };
    });

    results.push({ dimension: dim.label, items: items });
  });

  return results;
}
```

- [ ] **Step 2: Anadir contenedor y renderizar**

```html
<div class="dash-card" style="grid-column: 1 / -1;">
  <h3 class="dash-card-title">Equidad en Acceso a Formacion</h3>
  <div id="dashEquity"></div>
</div>
```

- [ ] **Step 3: Renderizar barras pareadas**

```javascript
// --- Equidad Formativa ---
(function() {
  var container = document.getElementById('dashEquity');
  if (!container || !state.employees || !state.employees.length) return;
  var equity = calcEquityMetrics(acciones, state.employees);
  container.textContent = '';

  equity.forEach(function(dim) {
    if (!dim.items.length) return;
    var section = document.createElement('div');
    section.style.cssText = 'margin-bottom:16px;';
    var title = document.createElement('div');
    title.style.cssText = 'font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;';
    title.textContent = dim.dimension;
    section.appendChild(title);

    dim.items.forEach(function(item) {
      var row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:100px 1fr 1fr 50px;gap:8px;align-items:center;padding:3px 0;font-size:11px;';
      var label = document.createElement('span');
      label.style.cssText = 'color:var(--text-primary);';
      label.textContent = item.category.substring(0, 14);
      // Barra plantilla
      var bar1Wrap = document.createElement('div');
      bar1Wrap.style.cssText = 'height:12px;background:var(--bg-input);border-radius:2px;position:relative;';
      var bar1 = document.createElement('div');
      bar1.style.cssText = 'height:100%;border-radius:2px;background:var(--accent);opacity:0.4;width:' + item.pctPlantilla + '%;';
      var bar1Label = document.createElement('span');
      bar1Label.style.cssText = 'position:absolute;right:4px;top:0;font-size:9px;color:var(--text-muted);line-height:12px;';
      bar1Label.textContent = item.pctPlantilla + '%';
      bar1Wrap.appendChild(bar1);
      bar1Wrap.appendChild(bar1Label);
      // Barra formacion
      var bar2Wrap = document.createElement('div');
      bar2Wrap.style.cssText = 'height:12px;background:var(--bg-input);border-radius:2px;position:relative;';
      var bar2 = document.createElement('div');
      bar2.style.cssText = 'height:100%;border-radius:2px;background:var(--accent);width:' + item.pctFormacion + '%;';
      var bar2Label = document.createElement('span');
      bar2Label.style.cssText = 'position:absolute;right:4px;top:0;font-size:9px;color:var(--text-muted);line-height:12px;';
      bar2Label.textContent = item.pctFormacion + '%';
      bar2Wrap.appendChild(bar2);
      bar2Wrap.appendChild(bar2Label);
      // Gap
      var gapSpan = document.createElement('span');
      var gapColor = Math.abs(item.gap) > 20 ? 'var(--danger)' : Math.abs(item.gap) > 10 ? 'var(--warning)' : 'var(--success)';
      gapSpan.style.cssText = 'text-align:right;font-weight:600;color:' + gapColor + ';';
      gapSpan.textContent = (item.gap > 0 ? '+' : '') + item.gap + '%';

      row.appendChild(label);
      row.appendChild(bar1Wrap);
      row.appendChild(bar2Wrap);
      row.appendChild(gapSpan);
      section.appendChild(row);
    });

    // Leyenda
    var leg = document.createElement('div');
    leg.style.cssText = 'display:flex;gap:16px;font-size:10px;color:var(--text-muted);margin-top:4px;';
    leg.insertAdjacentHTML('beforeend',
      '<span><span style="display:inline-block;width:8px;height:8px;background:var(--accent);opacity:0.4;border-radius:1px;margin-right:3px;"></span>Plantilla</span>' +
      '<span><span style="display:inline-block;width:8px;height:8px;background:var(--accent);border-radius:1px;margin-right:3px;"></span>Formacion</span>' +
      '<span>Gap = diferencia</span>'
    );
    section.appendChild(leg);
    container.appendChild(section);
  });
})();
```

- [ ] **Step 4: Verificar**

Cargar Excel con campos Sexo y Categoria profesional. Verificar barras pareadas y calculo de gap.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: monitor de equidad formativa por genero, discapacidad y categoria"
```

---

### Task 6: Inversion por Manager (#10)

**Files:**
- Modify: `convocatoria.html` (HTML + JS)

**Descripcion:** Ranking de managers por inversion formativa en sus equipos: horas per capita, presupuesto, acciones.

- [ ] **Step 1: Implementar analyzeByManager(acciones, employees)**

```javascript
function analyzeByManager(acciones, employees) {
  // Construir mapa manager -> empleados
  var managerMap = {};
  employees.forEach(function(e) {
    if (e['Alta/Baja'] === 0 || e['Alta/Baja'] === '0') return;
    var mgr = e['Depende de'] || 'Sin responsable';
    if (!managerMap[mgr]) managerMap[mgr] = { empleados: [], nifsSet: new Set() };
    managerMap[mgr].empleados.push(e);
    if (e.NIF) managerMap[mgr].nifsSet.add(e.NIF);
  });

  var results = Object.keys(managerMap).map(function(mgr) {
    var data = managerMap[mgr];
    var horasTotal = 0;
    var presupuestoTotal = 0;
    var accionesCount = 0;
    var participantesFormados = new Set();

    acciones.forEach(function(a) {
      var parts = a.participantes || [];
      var partsDelManager = parts.filter(function(nif) { return data.nifsSet.has(nif); });
      if (partsDelManager.length === 0) return;
      accionesCount++;
      var horas = parseFloat(a.horasPresenciales || 0) + parseFloat(a.horasTeleformacion || 0);
      horasTotal += horas * partsDelManager.length;
      var costePorParticipante = parts.length > 0 ? (parseFloat(a.presupuesto) || 0) / parts.length : 0;
      presupuestoTotal += costePorParticipante * partsDelManager.length;
      partsDelManager.forEach(function(nif) { participantesFormados.add(nif); });
    });

    return {
      manager: mgr,
      equipo: data.empleados.length,
      formados: participantesFormados.size,
      pctFormados: data.empleados.length > 0 ? Math.round((participantesFormados.size / data.empleados.length) * 100) : 0,
      horasTotal: horasTotal,
      horasPerCapita: data.empleados.length > 0 ? Math.round(horasTotal / data.empleados.length * 10) / 10 : 0,
      presupuesto: presupuestoTotal,
      acciones: accionesCount
    };
  }).filter(function(r) { return r.equipo >= 2; }) // Solo managers con 2+ reportes
    .sort(function(a, b) { return b.horasPerCapita - a.horasPerCapita; });

  return results;
}
```

- [ ] **Step 2: Anadir contenedor y renderizar**

```html
<div class="dash-card" style="grid-column: 1 / -1;">
  <h3 class="dash-card-title">Inversion Formativa por Responsable</h3>
  <div id="dashByManager"></div>
</div>
```

- [ ] **Step 3: Renderizar tabla ranking**

```javascript
// --- Inversion por Manager ---
(function() {
  var container = document.getElementById('dashByManager');
  if (!container || !state.employees || !state.employees.length) return;
  var mgrs = analyzeByManager(acciones, state.employees);
  container.textContent = '';
  if (!mgrs.length) {
    var p = document.createElement('p');
    p.style.cssText = 'color:var(--text-muted);text-align:center;padding:20px;font-size:13px;';
    p.textContent = 'Sin datos del campo "Depende de"';
    container.appendChild(p);
    return;
  }

  // Top 15 managers
  var top = mgrs.slice(0, 15);
  var table = document.createElement('table');
  table.style.cssText = 'width:100%;font-size:11px;border-collapse:collapse;';
  var thead = document.createElement('thead');
  var headerRow = document.createElement('tr');
  ['Responsable','Equipo','Formados','%','h/persona','Presup.','Acciones'].forEach(function(h) {
    var th = document.createElement('th');
    th.style.cssText = 'text-align:left;padding:4px 6px;border-bottom:2px solid var(--border);color:var(--text-muted);font-weight:500;';
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  top.forEach(function(m) {
    var tr = document.createElement('tr');
    var pctColor = m.pctFormados >= 80 ? 'var(--success)' : m.pctFormados >= 50 ? 'var(--warning)' : 'var(--danger)';
    var cells = [
      { text: m.manager.substring(0, 25), style: 'font-weight:500;' },
      { text: m.equipo, style: '' },
      { text: m.formados + '/' + m.equipo, style: '' },
      { text: m.pctFormados + '%', style: 'color:' + pctColor + ';font-weight:600;' },
      { text: m.horasPerCapita + ' h', style: 'font-weight:600;' },
      { text: m.presupuesto.toLocaleString('es-ES', {maximumFractionDigits:0}) + ' EUR', style: '' },
      { text: m.acciones, style: '' }
    ];
    cells.forEach(function(c) {
      var td = document.createElement('td');
      td.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);color:var(--text-primary);' + c.style;
      td.textContent = c.text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  if (mgrs.length > 15) {
    var more = document.createElement('div');
    more.style.cssText = 'text-align:center;padding:8px;font-size:11px;color:var(--text-muted);';
    more.textContent = '... y ' + (mgrs.length - 15) + ' responsables mas';
    container.appendChild(more);
  }
})();
```

- [ ] **Step 4: Verificar**

Cargar Excel con campo "Depende de" relleno. Verificar ranking de managers con metricas correctas.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: ranking de inversion formativa por manager en dashboard"
```

---

### Task 7: Cross-Company Training Map (#14)

**Files:**
- Modify: `convocatoria.html` (HTML + JS)

**Descripcion:** Detecta formaciones donde la empresa pagadora difiere de la empresa del participante. Matriz de flujo interempresarial. Alertas de discrepancia CIF para FUNDAE.

- [ ] **Step 1: Implementar analyzeCrossCompanyTraining(acciones, employees)**

```javascript
function analyzeCrossCompanyTraining(acciones, employees) {
  var nifToEmpresa = {};
  employees.forEach(function(e) {
    if (e.NIF) {
      nifToEmpresa[e.NIF] = {
        empresa: e.Empresa || 'Sin empresa',
        cif: e['_f_CIF'] || e.CIF || ''
      };
    }
  });

  // Matriz: pagadora -> empresa_empleado -> count
  var flujos = {};
  var alertas = [];

  acciones.forEach(function(a) {
    if (!a.empresaPagadora) return;
    var pagadora = a.empresaPagadora;
    var pagadoraNombre = '';
    EMPRESAS_GRUPO.forEach(function(eg) {
      if (eg.cif === pagadora) pagadoraNombre = eg.razonSocial.replace(/,.*/,'');
    });
    if (!pagadoraNombre) pagadoraNombre = pagadora;

    (a.participantes || []).forEach(function(nif) {
      var emp = nifToEmpresa[nif];
      if (!emp) return;
      var cifEmpleado = emp.cif;
      var empresaEmpleado = emp.empresa;

      if (!flujos[pagadoraNombre]) flujos[pagadoraNombre] = {};
      if (!flujos[pagadoraNombre][empresaEmpleado]) flujos[pagadoraNombre][empresaEmpleado] = 0;
      flujos[pagadoraNombre][empresaEmpleado]++;

      // Alerta si CIF no coincide
      if (cifEmpleado && cifEmpleado !== pagadora) {
        alertas.push({
          accion: a.codigo || a.nombre || 'Sin codigo',
          pagadora: pagadoraNombre,
          empleado: nif,
          empresaEmpleado: empresaEmpleado,
          cifPagadora: pagadora,
          cifEmpleado: cifEmpleado
        });
      }
    });
  });

  return { flujos: flujos, alertas: alertas };
}
```

- [ ] **Step 2: Anadir contenedor HTML**

```html
<div class="dash-card" style="grid-column: 1 / -1;">
  <h3 class="dash-card-title">Formacion Interempresarial</h3>
  <div id="dashCrossCompany"></div>
</div>
```

- [ ] **Step 3: Renderizar matriz y alertas**

```javascript
// --- Cross-Company Training ---
(function() {
  var container = document.getElementById('dashCrossCompany');
  if (!container || !state.employees || !state.employees.length) return;
  var cross = analyzeCrossCompanyTraining(acciones, state.employees);
  container.textContent = '';

  var pagadoras = Object.keys(cross.flujos).sort();
  if (!pagadoras.length) {
    var p = document.createElement('p');
    p.style.cssText = 'color:var(--text-muted);text-align:center;padding:20px;font-size:13px;';
    p.textContent = 'Sin datos de formacion interempresarial';
    container.appendChild(p);
    return;
  }

  // Alertas de discrepancia CIF
  if (cross.alertas.length > 0) {
    var alertDiv = document.createElement('div');
    alertDiv.style.cssText = 'padding:8px 12px;background:var(--danger-light);border-radius:var(--radius-sm);margin-bottom:12px;font-size:12px;color:var(--danger);';
    alertDiv.textContent = cross.alertas.length + ' participante(s) con CIF diferente al de la empresa pagadora (riesgo FUNDAE)';
    container.appendChild(alertDiv);

    var details = document.createElement('details');
    var summary = document.createElement('summary');
    summary.style.cssText = 'cursor:pointer;font-size:11px;color:var(--danger);margin-bottom:8px;';
    summary.textContent = 'Ver detalle de discrepancias';
    details.appendChild(summary);
    var alertList = document.createElement('div');
    alertList.style.cssText = 'font-size:11px;max-height:150px;overflow-y:auto;';
    cross.alertas.slice(0, 20).forEach(function(a) {
      var d = document.createElement('div');
      d.style.cssText = 'padding:2px 0;color:var(--text-muted);';
      d.textContent = a.accion + ': ' + a.empleado + ' (empresa: ' + a.empresaEmpleado + ', CIF: ' + a.cifEmpleado + ') != pagadora ' + a.pagadora + ' (CIF: ' + a.cifPagadora + ')';
      alertList.appendChild(d);
    });
    details.appendChild(alertList);
    container.appendChild(details);
  }

  // Matriz de flujos
  var empresasReceptoras = new Set();
  pagadoras.forEach(function(p) {
    Object.keys(cross.flujos[p]).forEach(function(e) { empresasReceptoras.add(e); });
  });
  var receptoras = Array.from(empresasReceptoras).sort();

  var table = document.createElement('table');
  table.style.cssText = 'width:100%;font-size:10px;border-collapse:collapse;';
  var thead = document.createElement('thead');
  var hRow = document.createElement('tr');
  var thCorner = document.createElement('th');
  thCorner.style.cssText = 'padding:4px;text-align:left;font-size:9px;color:var(--text-muted);';
  thCorner.textContent = 'Pagadora \\ Empleados';
  hRow.appendChild(thCorner);
  receptoras.forEach(function(r) {
    var th = document.createElement('th');
    th.style.cssText = 'padding:4px;text-align:center;writing-mode:vertical-lr;transform:rotate(180deg);max-width:25px;font-size:9px;';
    th.textContent = r.substring(0, 12);
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  pagadoras.forEach(function(p) {
    var tr = document.createElement('tr');
    var tdName = document.createElement('td');
    tdName.style.cssText = 'padding:4px;font-weight:500;white-space:nowrap;';
    tdName.textContent = p.substring(0, 18);
    tr.appendChild(tdName);
    receptoras.forEach(function(r) {
      var td = document.createElement('td');
      td.style.cssText = 'padding:4px;text-align:center;';
      var count = (cross.flujos[p] || {})[r] || 0;
      if (count > 0) {
        var isDiagonal = p.toLowerCase().indexOf(r.toLowerCase().substring(0, 5)) >= 0;
        td.style.background = isDiagonal ? 'rgba(79,70,229,0.1)' : 'rgba(220,38,38,0.15)';
        td.style.borderRadius = '2px';
        td.style.fontWeight = isDiagonal ? '400' : '600';
        td.textContent = count;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
})();
```

- [ ] **Step 4: Verificar**

Crear acciones donde la empresa pagadora tiene participantes de otra empresa. Verificar que la matriz muestra los flujos y las alertas de CIF.

- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: mapa de formacion interempresarial y alertas CIF en dashboard"
```

---

## Notas de implementacion

- Todas las secciones nuevas se anaden DESPUES de las existentes en `renderDashboard()`
- Los contenedores HTML se insertan despues de `dashCompletenessChart` (linea ~2432) en el orden: Riesgo FUNDAE, ROI, Cobertura, Equidad, Manager, Cross-Company
- Excepto la proyeccion de credito (#7) que se inserta dentro de la seccion de credito existente
- Cada helper es una funcion pura que recibe datos y devuelve un objeto -- sin efectos secundarios
- Usar `esc()` para cualquier dato del Excel insertado en el DOM
- Usar CSS variables del design system
- Los graficos SVG se generan como strings y se insertan via `insertAdjacentHTML` (patron existente del codebase)
- Cada tarea es independiente y puede committearse por separado
