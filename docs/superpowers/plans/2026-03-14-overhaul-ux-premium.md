# Formación_AGORA — Overhaul UX Premium (Parte 1: Fases 0-1)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `convocatoria.html` de "Convocatoria de Formaciones" a "Formación_AGORA", implementando Fase 0 (infraestructura de coherencia) y Fase 1 (quick wins funcionales) del spec consolidado validado.

**Architecture:** Fichero unico `convocatoria.html` (~15.517 lineas). Tres zonas: CSS (`<style>` lineas 11-2947), HTML (`<body>` lineas 2948-3898), JS (`<script>` lineas 3899-15515). Se respeta el design system: variables CSS en `:root` (lineas 13-55), paleta Indigo-600 + Slate, Inter como fuente unica, 2 sombras + variante accent, 3 radii, transicion estandar. Ejecucion multi-agente con worktrees paralelos donde sea posible.

**Tech Stack:** HTML/CSS/JS vanilla, SheetJS (Excel), localStorage. Sin dependencias adicionales. Sin Web Audio API, sin confetti.

**Nota de seguridad:** Todo contenido dinamico procedente del Excel DEBE sanitizarse con `esc()` (linea 6662) antes de insertarlo en innerHTML. Contenido estatico de la app usa DOM methods (`createElement`, `textContent`, `appendChild`). Los snippets de este plan siguen esta convencion.

**Spec de referencia:** `/Users/afs/convocatoria-formaciones/docs/superpowers/specs/2026-03-14-spec-consolidado-final.md`

---

## Mapa del fichero

| Zona | Lineas | Contenido |
|------|--------|-----------|
| `:root` variables | 13-55 | Design system tokens |
| CSS general | 56-1480 | Layout, componentes, tabla, toasts |
| CSS dashboard | 1481-2947 | Cuadro de mando, alertas, sparklines |
| HTML tab-bar | 2949-2955 | 5 pestanas: Dashboard, Calendario, Convocatoria, Catalogos, XML |
| HTML Convocatoria | 2956-3110 | Panel izquierdo (upload, filtros, evento) |
| HTML tabla + queue | 3111-3210 | Panel derecho (queue bar, tabla, action bar) |
| HTML XML | 3213-3500 | Generador XML FUNDAE |
| HTML Dashboard | 3501-3700 | Cuadro de mando |
| HTML Dialogs | 3700-3898 | Settings, historial, confirm, onboarding |
| JS Helpers | 6441-6676 | COLUMNS, FILTER_KEYS, esc(), showToast() |
| JS State | 6678-6730 | state, queue, settings |
| JS Excel parsing | 6499-6600 | parseOrgSheet() |
| JS File handling | 7401-7540 | handleFile() |
| JS Autosave | 7550-7580 | saveState() |
| JS Filter/render | 7580-8030 | renderFilters(), renderTable() |
| JS Queue | 8200-8300 | renderQueue(), cola |
| JS Send flow | 8639-8920 | validateEvent(), btnOpenOutlook, cola |
| JS Catalog | 4852-6440 | renderCatalogList(), renderCatalogForm() |
| JS XML generation | 9599-10571 | XML export XSD 2025 |
| JS Dashboard | 13047-15000 | renderDashboard(), alertas, KPIs |

---

## Mapa de dependencias y paralelismo

### Modelo de ejecucion

La Fase 0 es **secuencial** y prerequisito de todo. Una vez completada, las tareas de Fase 1 se ejecutan en **carriles paralelos** usando worktrees independientes. Cada carril toca secciones distintas del HTML para minimizar conflictos de merge.

### Grafo de dependencias

```
F0.1 ─┐
F0.2 ─┤ (secuencial, rama main)
F0.3 ─┤
F0.4 ─┘
  │
  ▼ merge a main
  │
  ├── Lane A (worktree-a): F1.1 → F1.8
  │     Excel parsing + XML autocompletion
  │
  ├── Lane B (worktree-b): F1.4 → F1.5 → F1.6 → F1.7
  │     Toasts + upload + validacion + indicador guardado
  │
  ├── Lane C (worktree-c): F1.3 → F1.9
  │     Motor de alertas + credito FUNDAE
  │
  └── Lane D (worktree-d): F1.2
        Duplicar accion (catalogo, aislada)
```

### Carriles de ejecucion paralela

#### Lane A: Excel + XML (worktree-a)
- **F1.1** — Busqueda flexible de hoja Excel
- **F1.8** — Auto-relleno datos grupo XML
- **Secciones tocadas:**
  - JS: `parseOrgSheet()` (lineas 6499-6600), `handleFile()` (lineas 7401-7540)
  - JS: XML generation (lineas 9599-10571), nueva key localStorage
  - HTML: Dialog selector de hoja (nuevo, se anade junto a los dialogs existentes ~linea 3700)
  - CSS: Estilos del dialog selector (nuevo, en bloque de dialogs ~linea 1400)
- **Dependencias internas:** F1.8 no depende de F1.1; son independientes pero tocan zona similar.

#### Lane B: Feedback visual (worktree-b)
- **F1.4** — Toasts premium
- **F1.5** — Check SVG en upload
- **F1.6** — Validacion on-blur
- **F1.7** — Indicador guardado + sesion
- **Secciones tocadas:**
  - CSS: `.toast` (lineas 1457-1480), nuevas clases `.toast-*` ampliadas
  - CSS: `.upload-zone` (lineas 883-940), nueva animacion SVG
  - CSS: Nuevas clases `.input-field.incomplete`, `.field-hint`
  - JS: `showToast()` (lineas 6666-6676) — reescritura completa
  - JS: `handleFile()` (lineas 7461-7466) — solo el bloque post-carga para SVG
  - JS: Nuevos listeners blur en campos del evento (~linea 8639)
  - JS: `saveState()` (lineas 7555-7579) — anadir timestamp visible
  - HTML: `#toastContainer` (linea 3696) — anadir `aria-live`
  - HTML: `#uploadZone` (linea 2980) — anadir SVG check oculto
  - HTML: Pie del panel izquierdo — nuevo `<div>` para "Guardado hace X min"
  - HTML: Banner de sesion pendiente (nuevo, tras `#queueBar` ~linea 3112)
- **Dependencias internas:** F1.5 depende de F1.4 (usa los toasts nuevos), F1.6 y F1.7 son independientes entre si.

#### Lane C: Alertas + Credito (worktree-c)
- **F1.3** — Motor de alertas proactivas
- **F1.9** — Credito FUNDAE con simulacion
- **Secciones tocadas:**
  - JS: Nueva funcion `evaluateAlerts()` (se anade cerca de `renderDashboard()`, linea 13047)
  - JS: Dashboard credit section (lineas 9640-9710, 12571+)
  - HTML: Dashboard `dash-alerts-widget` (linea 3514-3518) — ampliar
  - HTML: Nuevo banner en tab Convocatoria (nuevo, tras tab-bar ~linea 2956)
  - CSS: Estilos para banner de alertas y simulador de credito (nuevos, en bloque dashboard ~linea 2061)
- **Dependencias internas:** F1.9 depende de F1.3 (las alertas de credito se integran en el motor de alertas).

#### Lane D: Catalogo (worktree-d)
- **F1.2** — Duplicar accion formativa
- **Secciones tocadas:**
  - JS: `renderCatalogForm()` (linea 4933) — anadir boton "Duplicar"
  - JS: Nueva funcion `duplicateAction()` (se anade junto a renderCatalogForm)
  - CSS: Ningun cambio (usa `.btn .btn-secondary` existente)
  - HTML: Ningun cambio (renderizado dinamico)
- **Dependencias internas:** Ninguna.

---

## Estrategia de merge

### Orden de merge recomendado

```
1. Lane D (F1.2) — mas aislada, menor riesgo
2. Lane A (F1.1, F1.8) — toca parseo y XML, no conflicta con B/C
3. Lane B (F1.4-F1.7) — toca toasts y upload, puede tener conflicto menor con A en handleFile()
4. Lane C (F1.3, F1.9) — toca dashboard y alertas, puede tener conflicto menor con B en toasts
```

### Conflictos previsibles

| Conflicto | Lanes | Zona | Resolucion |
|-----------|-------|------|------------|
| `handleFile()` lineas 7401-7540 | A + B | JS | Lane A modifica el parseo (lineas 7410-7420). Lane B modifica el post-carga (lineas 7461-7466). Son secciones distintas dentro de la misma funcion. Merge manual trivial: aceptar ambos cambios. |
| `showToast()` lineas 6666-6676 | B + C | JS | Lane B reescribe `showToast()` completamente (F1.4). Lane C la invoca pero no la modifica. Mergear B antes que C. |
| CSS del dashboard | B + C | CSS | Lane B anade estilos de toasts (lineas 1457-1480). Lane C anade estilos de alertas (lineas 2061+). Zonas distintas, sin conflicto. |
| `#toastContainer` | B + C | HTML | Lane B modifica atributos del contenedor. Lane C usa el contenedor pero no lo modifica. Mergear B primero. |

### Reglas para los agentes

1. **NUNCA modificar `:root`** (lineas 13-55) excepto F0.3 que esta en Fase 0 secuencial.
2. **NUNCA modificar funciones compartidas** fuera de tu lane: `esc()`, `saveState()`, `renderTable()`, `renderFilters()`.
3. **NUNCA anadir nuevas variables CSS** a `:root`. Usar las existentes.
4. **NUNCA modificar `RELEVANT_COLUMNS`, `FILTER_KEYS`, `FUNDAE_COLUMNS`** (lineas 6441-6460).
5. **NUNCA usar `alert()`** — siempre `showToast()`.
6. **NUNCA hardcodear colores** — siempre `var(--variable)`.
7. **Sanitizar con `esc()`** todo valor del Excel antes de innerHTML.
8. **Usar nombres en ingles** para variables, funciones, clases CSS. Texto visible en espanol.
9. **Cada tarea termina con commit** con mensaje descriptivo.
10. **No tocar lineas ajenas** — si necesitas una funcion de otra lane, crea un wrapper temporal y documenta la dependencia en el commit.

### Procedimiento de merge paso a paso

```bash
# 1. Desde main (con Fase 0 completa), mergear Lane D
cd /ruta/al/repo
git merge worktree-d/branch-f1.2 --no-ff -m "merge: F1.2 duplicar accion formativa"

# 2. Ejecutar la app en navegador, verificar que el catalogo funciona

# 3. Mergear Lane A
git merge worktree-a/branch-f1.1-f1.8 --no-ff -m "merge: F1.1 busqueda flexible + F1.8 auto-relleno XML"

# 4. Verificar carga de Excel y generacion de XML

# 5. Mergear Lane B
git merge worktree-b/branch-f1.4-f1.7 --no-ff -m "merge: F1.4-F1.7 toasts, upload SVG, validacion, guardado"
# Si hay conflicto en handleFile(): aceptar ambos cambios (A toca parseo, B toca post-carga)

# 6. Verificar toasts, upload, validacion on-blur, indicador de guardado

# 7. Mergear Lane C
git merge worktree-c/branch-f1.3-f1.9 --no-ff -m "merge: F1.3 alertas + F1.9 credito FUNDAE"
# Si hay conflicto en showToast: usar la version de Lane B (reescrita en F1.4)

# 8. Test integral: abrir app, cargar Excel, navegar todas las pestanas, enviar convocatoria
```

---

## Fase 0: Infraestructura de coherencia

### Tarea F0.1: Migracion parcial de inline styles a CSS

**Objetivo:** Migrar los estilos inline del JavaScript a clases CSS para los componentes que se tocan en Fases 1-3: toasts, dialogs, cola, upload, empty states. No tocar dashboard ni calendario.

**Files:**
- Modify: `convocatoria.html:1457-1480` (CSS toasts)
- Modify: `convocatoria.html:3112-3130` (HTML queue bar)
- Modify: `convocatoria.html:3696` (HTML toast container)
- Modify: `convocatoria.html:6666-6676` (JS showToast)
- Modify: `convocatoria.html:8220-8300` (JS renderQueue)

**Scope:** Solo los componentes que se van a tocar en Fases 1-3. NO migrar dashboard, calendario, ni catalogo en esta tarea.

- [ ] **Paso 1: Inventariar inline styles en componentes objetivo**

Buscar `style="` en las siguientes funciones/zonas:
- `showToast()` (linea 6666)
- `renderQueue()` / `#queueBar` (linea 3112 y 8220)
- `#toastContainer` (linea 3696)
- Dialogs (lineas 3700-3898)
- `#uploadZone` area (lineas 2980-3010)

Contar ocurrencias: actualmente hay ~556 `style="` en el fichero. Solo migrar las que estan en los componentes objetivo.

- [ ] **Paso 2: Extraer estilos del #toastContainer a CSS**

El contenedor de toasts tiene estilos inline en el HTML (linea 3696):

```html
<!-- ANTES -->
<div id="toastContainer" style="position:fixed;top:20px;right:20px;z-index:2000;display:flex;flex-direction:column;gap:8px;"></div>
```

Anadir clase CSS en `<style>` (tras linea 1480, antes del bloque dashboard):

```css
/* ── Toast container ── */
#toastContainer {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

Y limpiar el HTML:

```html
<!-- DESPUES -->
<div id="toastContainer"></div>
```

- [ ] **Paso 3: Extraer estilos del #queueBar a CSS**

El queue bar tiene estilos inline (linea 3112):

```html
<!-- ANTES -->
<div id="queueBar" style="display:none; padding:12px 28px; border-bottom:1px solid var(--border); background:var(--accent-subtle);">
```

Anadir clase CSS:

```css
/* ── Queue bar ── */
.queue-bar {
  display: none;
  padding: 12px 28px;
  border-bottom: 1px solid var(--border);
  background: var(--accent-subtle);
}
.queue-bar.visible {
  display: block;
}
```

Actualizar HTML:

```html
<div id="queueBar" class="queue-bar">
```

Actualizar JS donde se hace `queueBar.style.display = 'block'/'none'` para usar `classList.add/remove('visible')`.

- [ ] **Paso 4: Extraer estilos del #queueList a CSS**

El queue list (linea 3123):

```html
<!-- ANTES -->
<div id="queueList" style="display:flex; flex-direction:column; gap:6px;"></div>
```

```css
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
```

```html
<div id="queueList" class="queue-list"></div>
```

- [ ] **Paso 5: Migrar estilos inline de dialogs**

Buscar `style="` en las lineas 3700-3898 (zona de dialogs). Extraer a clases CSS los patrones repetidos. Los dialogs ya tienen clases (`.dialog-overlay`, `.dialog-box`), pero hay estilos inline en elementos hijos.

Para cada `style="..."` encontrado dentro de un dialog:
1. Si el estilo ya corresponde a una clase existente, eliminar el inline y usar la clase.
2. Si es un estilo unico necesario, crear una clase descriptiva (ej: `.dialog-header`, `.dialog-body-text`).

- [ ] **Paso 6: Verificar que la apariencia no cambia**

Abrir `convocatoria.html` en Chrome. Verificar:
- Toasts aparecen en esquina superior derecha, con animacion.
- Queue bar aparece correctamente al anadir items a la cola.
- Dialogs (settings, historial, confirm) se ven identicos.
- Upload zone funciona y se ve identico.

- [ ] **Paso 7: Commit**

```bash
git add convocatoria.html
git commit -m "refactor(F0.1): migrate inline styles to CSS classes for toasts, queue, dialogs"
```

---

### Tarea F0.2: Unificar terminologia

**Objetivo:** Aplicar el glosario vinculante del spec en toda la UI. Sustituir "empleados" por "personas trabajadoras", "asistentes" por "personas destinatarias" (en contexto de convocatoria), etc.

**Files:**
- Modify: `convocatoria.html` (multiples zonas)

**Mapeo de sustituciones en texto visible al usuario:**

| Texto actual | Texto nuevo | Contexto |
|--------------|-------------|----------|
| `empleados` | `personas trabajadoras` | Conteos, labels, mensajes |
| `empleados activos` | `personas trabajadoras activas` | Post-carga Excel |
| `empleado` (singular) | `persona trabajadora` | Mensajes singulares |
| `asistentes` (contexto convocatoria) | `personas destinatarias` | Conteos, botones, export |
| `asistentes` (contexto FUNDAE/catalogo) | `participantes` | Catalogo, XML |
| `No se encontraron empleados` | `No se encontraron personas trabajadoras` | Empty state filtros |
| `empleados de ejemplo` | `personas trabajadoras de ejemplo` | Datos demo |
| `Datos de empleados` | `Datos de personas trabajadoras` | Onboarding |
| `hoja ORGANIGRAMA` | `hoja Organigrama` | Label post-carga |

**IMPORTANTE:** NO cambiar nombres de variables JS, funciones, keys de localStorage ni IDs del DOM. Solo texto visible al usuario. La variable `state.employees` sigue llamandose `employees` en el codigo.

- [ ] **Paso 1: Sustituir "empleados" en mensajes y labels**

Buscar todas las ocurrencias de texto visible con "empleado" y reemplazar por "persona trabajadora" o su plural. Lineas clave:

- Linea 3101: `de 0 empleados` → `de 0 personas trabajadoras`
- Linea 3876: `datos de empleados` → `datos de personas trabajadoras`
- Linea 3880: `Filtra y selecciona asistentes` → `Filtra y selecciona personas destinatarias`
- Linea 6046: `No se encontraron empleados` → `No se encontraron personas trabajadoras`
- Linea 6543: `No hay empleados activos` → `No hay personas trabajadoras activas`
- Linea 7451: `empleados activos` → `personas trabajadoras activas`
- Linea 7465: `empleados activos · hoja ORGANIGRAMA` → `personas trabajadoras activas · hoja Organigrama`
- Linea 7536: `empleados de ejemplo` → `personas trabajadoras de ejemplo`
- Linea 7547: `25 empleados` → `25 personas trabajadoras`
- Linea 8014: `empleados` → `personas trabajadoras`
- Linea 9110: `empleados externos importados` → `personas externas importadas`
- Linea 9146: `empleados` → `personas trabajadoras`
- Linea 9189: `empleados activos` → `personas trabajadoras activas`
- Linea 11976: `empleados del Excel` → `personas del Excel`
- Linea 13985: `empleados sin formacion` → `personas sin formacion`

- [ ] **Paso 2: Sustituir "asistentes" en contexto de convocatoria**

Reemplazar "asistentes" por "personas destinatarias" en el flujo de envio:

- Linea 2967: `title="Seleccionar asistentes"` → `title="Seleccionar personas destinatarias"`
- Linea 3009: `2. Selecciona asistentes` → `2. Selecciona personas destinatarias`
- Linea 8031: `sin asistentes` → `sin personas destinatarias`
- Linea 8336: `asistentes` → `personas destinatarias`
- Linea 8631: `asistentes ya convocados` → `personas ya convocadas`
- Linea 8670: `asistentes` → `personas destinatarias`
- Linea 8673: `asistentes` → `personas destinatarias`
- Linea 8782: `No hay asistentes seleccionados` → `No hay personas destinatarias seleccionadas`
- Linea 8918: `No hay asistentes seleccionados` → `No hay personas destinatarias seleccionadas`
- Linea 8937: `_asistentes.xlsx` → `_destinatarias.xlsx`
- Linea 8940: `asistentes` → `personas destinatarias`
- Linea 12211: `asistentes procesados` → `personas procesadas`

- [ ] **Paso 3: Mantener "participantes" en contexto FUNDAE/catalogo**

Verificar que en el contexto de catalogo FUNDAE, la palabra "participante" se mantiene (es el termino oficial FUNDAE). Lineas como 7396 (`participantes huerfanos`) son contexto de catalogo y se mantienen.

- [ ] **Paso 4: Verificar coherencia visual**

Abrir la app y verificar:
- Seccion "2. Selecciona personas destinatarias" se lee correctamente.
- Conteos "de X personas trabajadoras" se ven bien (no truncados).
- Historial muestra "personas destinatarias" donde habia "asistentes".
- Los textos no desbordan sus contenedores.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "refactor(F0.2): unify terminology - persona trabajadora, persona destinataria, formacion obligatoria"
```

---

### Tarea F0.3: Resolver ambiguedad de sombras

**Objetivo:** Aclarar la relacion entre las 2 sombras de elevacion (`--shadow-sm`, `--shadow-lg`) y las variantes accent (`--shadow-accent`, `--shadow-accent-hover`). Ajustar opacidad de `--shadow-accent`.

**Files:**
- Modify: `convocatoria.html:38` (`:root`)
- Modify: `CLAUDE.md:46-48` (documentacion)

- [ ] **Paso 1: Ajustar --shadow-accent en :root**

En linea 38, cambiar la opacidad de 0.3 a 0.2:

```css
/* ANTES (linea 38) */
--shadow-accent: 0 1px 3px rgba(79,70,229,0.3);

/* DESPUES */
--shadow-accent: 0 1px 3px rgba(79,70,229,0.2);
```

- [ ] **Paso 2: Actualizar CLAUDE.md**

En la seccion "Sombras: solo 2 niveles" del CLAUDE.md, anadir clarificacion:

Despues de la linea que dice `- NO crear sombras intermedias`, anadir:

```markdown
- `--shadow-accent` y `--shadow-accent-hover` NO son niveles de elevacion adicionales — son variantes cromaticas de `--shadow-sm` aplicadas a botones primarios. El modelo sigue siendo 2 niveles de elevacion (sm/lg) + 1 variante de color.
```

- [ ] **Paso 3: Verificar que botones primarios no cambian visualmente**

Los botones `.btn-primary` usan `--shadow-accent` (linea 1166) y `--shadow-accent-hover` (linea 1172). Con la opacidad reducida de 0.3→0.2, la sombra sera algo mas sutil. Verificar que los botones siguen siendo visualmente prominentes.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html CLAUDE.md
git commit -m "fix(F0.3): clarify shadow model - 2 elevation levels + accent color variant"
```

---

### Tarea F0.4: Renombrar app a Formación_AGORA

**Objetivo:** Cambiar "Convocatoria de Formaciones" por "Formación_AGORA" en todos los puntos visibles.

**Files:**
- Modify: `convocatoria.html:6` (`<title>`)
- Modify: `convocatoria.html:2963` (`.app-header-title`)
- Modify: `convocatoria.html:3872` (onboarding)

- [ ] **Paso 1: Cambiar el `<title>`**

```html
<!-- ANTES (linea 6) -->
<title>Convocatoria de Formaciones</title>

<!-- DESPUES -->
<title>Formación_AGORA</title>
```

- [ ] **Paso 2: Cambiar el header del panel izquierdo**

```html
<!-- ANTES (linea 2963) -->
<span class="app-header-title">Convocatoria de Formaciones</span>

<!-- DESPUES -->
<span class="app-header-title">Formación_AGORA</span>
```

- [ ] **Paso 3: Cambiar el texto del onboarding**

```html
<!-- ANTES (linea 3872) -->
<h3 style="margin-bottom:4px;">Bienvenido a Convocatoria de Formaciones</h3>

<!-- DESPUES -->
<h3 style="margin-bottom:4px;">Bienvenido a Formación_AGORA</h3>
```

- [ ] **Paso 4: Buscar otras referencias textuales**

Buscar "Convocatoria de Formaciones" y "Formaciones FUNDAE" en todo el fichero para asegurar que no queda ninguna referencia al nombre antiguo en texto visible. Las references en comentarios de codigo o en nombres de variables NO se cambian.

- [ ] **Paso 5: Verificar**

Abrir la app. La pestana del navegador dice "Formación_AGORA". El header del panel izquierdo dice "Formación_AGORA". El onboarding dice "Bienvenido a Formación_AGORA".

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F0.4): rename app to Formación_AGORA"
```

---

## Fase 1: Quick wins funcionales

### Tarea F1.1: Busqueda flexible de hoja en Excel

**Objetivo:** Al cargar un Excel, si la hoja "ORGANIGRAMA" no existe con ese nombre exacto, hacer match case-insensitive. Si hay una unica hoja, usarla directamente. Si hay multiples, mostrar dialogo de seleccion.

**Files:**
- Modify: `convocatoria.html:6499-6520` (JS `parseOrgSheet()`)
- Modify: `convocatoria.html:7401-7420` (JS `handleFile()`)
- Modify: `convocatoria.html:~3700` (HTML, nuevo dialog)
- Modify: `convocatoria.html:~1400` (CSS, estilos del dialog)

- [ ] **Paso 1: Anadir CSS para el dialog selector de hoja**

Antes del bloque `/* ── Toast notifications ── */` (~linea 1455), anadir:

```css
/* ── Sheet selector dialog ── */
.sheet-selector-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}
.sheet-selector-item {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-input);
  transition: all var(--transition);
  text-align: left;
  width: 100%;
  font-family: var(--font-body);
}
.sheet-selector-item:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
  color: var(--accent);
}
```

- [ ] **Paso 2: Anadir HTML del dialog selector**

Junto a los otros dialogs (~linea 3700), anadir:

```html
<div class="dialog-overlay" id="sheetSelectorDialog" role="dialog" aria-modal="true">
  <div class="dialog-box">
    <div style="font-weight:600; font-size:14px; margin-bottom:4px;">Seleccionar hoja</div>
    <div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">
      No se encontro una hoja llamada "ORGANIGRAMA". Selecciona la hoja correcta:
    </div>
    <div id="sheetSelectorList" class="sheet-selector-list"></div>
    <div style="margin-top:12px; text-align:right;">
      <button class="btn btn-secondary" id="btnSheetCancel">Cancelar</button>
    </div>
  </div>
</div>
```

- [ ] **Paso 3: Refactorizar parseOrgSheet para aceptar nombre de hoja**

Modificar `parseOrgSheet()` (linea 6499) para que acepte un parametro opcional con el nombre de la hoja:

```javascript
function parseOrgSheet(workbook, sheetNameOverride) {
  const errors = [];

  // 1. Intentar nombre exacto
  let sheetName = sheetNameOverride || workbook.SheetNames.find(n => n === 'ORGANIGRAMA');

  // 2. Intentar case-insensitive
  if (!sheetName) {
    sheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'organigrama');
  }

  // 3. Si una sola hoja, usarla directamente
  if (!sheetName && workbook.SheetNames.length === 1) {
    sheetName = workbook.SheetNames[0];
  }

  // 4. Si multiples hojas sin match, devolver señal especial
  if (!sheetName) {
    return { employees: [], errors: [], needsSheetSelection: true, sheetNames: workbook.SheetNames };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX_sheetToJSON(sheet);
  if (rows.length === 0) {
    errors.push('La hoja "' + sheetName + '" esta vacia.');
    return { employees: [], errors };
  }

  // ... resto de la funcion sin cambios ...
```

- [ ] **Paso 4: Gestionar seleccion de hoja en handleFile()**

En `handleFile()` (linea 7401), despues de `const result = parseOrgSheet(workbook);` (linea 7413), anadir la logica de seleccion:

```javascript
const result = parseOrgSheet(workbook);

if (result.needsSheetSelection) {
  // Mostrar dialog de seleccion
  uploadZone.classList.remove('loading');
  promptDiv.innerHTML = origPromptHTML;

  const dialog = document.getElementById('sheetSelectorDialog');
  const list = document.getElementById('sheetSelectorList');
  list.innerHTML = result.sheetNames.map(function(name) {
    return '<button class="sheet-selector-item" data-sheet="' + esc(name) + '">' + esc(name) + '</button>';
  }).join('');

  list.addEventListener('click', function handler(ev) {
    const btn = ev.target.closest('.sheet-selector-item');
    if (!btn) return;
    list.removeEventListener('click', handler);
    dialog.classList.remove('visible');

    // Re-parsear con la hoja seleccionada
    uploadZone.classList.add('loading');
    promptDiv.querySelector('div:nth-child(2)').textContent = 'Procesando...';

    setTimeout(function() {
      const retryResult = parseOrgSheet(workbook, btn.dataset.sheet);
      uploadZone.classList.remove('loading');
      promptDiv.innerHTML = origPromptHTML;
      processParseResult(retryResult, file);
    }, 50);
  });

  document.getElementById('btnSheetCancel').onclick = function() {
    dialog.classList.remove('visible');
  };

  dialog.classList.add('visible');
  return;
}

// Continuar con procesamiento normal...
```

- [ ] **Paso 5: Extraer logica post-parseo a funcion reutilizable**

Extraer el bloque de codigo que va desde `if (result.errors.length > 0)` hasta el final del callback de `handleFile()` a una funcion `processParseResult(result, file)` para que pueda ser reutilizada tanto en la carga directa como tras la seleccion de hoja.

```javascript
function processParseResult(result, file) {
  if (result.errors.length > 0) {
    result.errors.forEach(function(err) { showToast(err, 'error', 6000); });
    if (result.employees.length === 0) return;
  }

  state.employees = result.employees;

  // ... todo el bloque de quality report y configuracion de UI (lineas 7423-7490) ...
}
```

- [ ] **Paso 6: Verificar los 4 escenarios**

1. Excel con hoja "ORGANIGRAMA" exacta → carga directa (sin cambio).
2. Excel con hoja "organigrama" (lowercase) → carga directa con match case-insensitive.
3. Excel con una sola hoja llamada "Datos" → carga directa (unica hoja).
4. Excel con multiples hojas sin "ORGANIGRAMA" → dialog de seleccion.

- [ ] **Paso 7: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.1): flexible sheet search - case-insensitive match, single-sheet auto-select, multi-sheet dialog"
```

---

### Tarea F1.2: Duplicar accion formativa

**Objetivo:** Boton "Duplicar" en la ficha de una accion del catalogo que crea una copia con datos reutilizables y limpia campos de estado/fechas/participantes.

**Files:**
- Modify: `convocatoria.html:4933+` (JS `renderCatalogForm()`)
- Add function: `duplicateAction()` (JS, junto a `renderCatalogForm`)

- [ ] **Paso 1: Anadir boton "Duplicar" en renderCatalogForm()**

En `renderCatalogForm()` (linea 4933), localizar la zona donde se renderizan los botones de accion de la ficha (buscar botones como "Eliminar" o la barra de acciones del formulario). Anadir un boton "Duplicar":

```javascript
// Dentro de renderCatalogForm(), en la zona de botones de accion
'<button class="btn btn-secondary" onclick="duplicateAction(\'' + actionId + '\')" title="Crear copia de esta accion">' +
  'Duplicar' +
'</button>'
```

- [ ] **Paso 2: Implementar duplicateAction()**

Anadir la funcion justo antes de `renderCatalogForm()`:

```javascript
function duplicateAction(actionId) {
  var catalog = state.catalogActions || [];
  var original = catalog.find(function(a) { return a.id === actionId; });
  if (!original) {
    showToast('Accion no encontrada', 'error');
    return;
  }

  // Deep clone
  var copy = JSON.parse(JSON.stringify(original));

  // Nuevo ID
  copy.id = 'af_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  // Datos que se copian (se mantienen tal cual en el clone):
  // titulo (con prefijo), modalidad, horas, centro, tutor, objetivos, contenidos,
  // areaProfesional, nivel, competencia, tipoConvocatoria, proveedor, coste, instrucciones

  // Titulo con prefijo
  copy.titulo = 'Copia de ' + (original.titulo || 'Sin titulo');

  // Datos que se limpian
  copy.participantes = [];
  copy.asistencia = [];
  copy.sesiones = [];
  copy.fechaInicio = '';
  copy.fechaFin = '';
  copy.estado = 'En preparacion';
  copy.comunicacionInicio = '';
  copy.comunicacionFin = '';
  copy.rlt = null;
  copy.createdAt = new Date().toISOString();

  // Insertar en catalogo
  catalog.push(copy);
  state.catalogActions = catalog;

  // Guardar
  try {
    localStorage.setItem('convocatoria_catalogActions', JSON.stringify(catalog));
  } catch(e) {}

  // Navegar a la nueva accion
  renderCatalogList();
  // Seleccionar la nueva accion y abrir su ficha
  var catalogListItems = document.querySelectorAll('.catalog-list-item');
  if (catalogListItems.length > 0) {
    // Buscar el item con el nuevo ID y hacer click
    state.selectedCatalogAction = copy.id;
    renderCatalogForm();
  }

  showToast('Accion duplicada: "' + esc(copy.titulo) + '"', 'success');
}
```

- [ ] **Paso 3: Verificar campos del modelo**

Revisar la estructura real de un objeto de accion formativa en el catalogo (explorar `renderCatalogForm()` lineas 4933+ para ver todos los campos). Ajustar los nombres de campos en el paso anterior segun los nombres reales del modelo. Los campos a limpiar deben incluir TODOS los campos de estado, fechas, participantes y comunicaciones.

- [ ] **Paso 4: Verificar**

1. Abrir catalogo, crear una accion con datos completos.
2. Pulsar "Duplicar".
3. Verificar que la nueva accion aparece en la lista como "Copia de [nombre]".
4. Verificar que la ficha del duplicado tiene: datos copiados (titulo, modalidad, horas, etc.) y datos limpios (sin participantes, sin fechas, estado "En preparacion").
5. Verificar que la accion original no ha cambiado.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.2): duplicate catalog action with clean state/dates/participants"
```

---

### Tarea F1.3: Alertas proactivas (Motor de alertas)

**Objetivo:** Al abrir la app, al cambiar al dashboard, y cada 60 minutos, evaluar reglas de alerta para plazos FUNDAE y formaciones proximas. Mostrar banner en tab Convocatoria y panel ampliado en dashboard.

**Files:**
- Modify: `convocatoria.html:~2060-2110` (CSS alertas dashboard)
- Modify: `convocatoria.html:~2956` (HTML banner en tab Convocatoria)
- Modify: `convocatoria.html:3514-3518` (HTML dash-alerts-widget)
- Modify: `convocatoria.html:~13047` (JS dashboard)
- Add function: `evaluateAlerts()` (JS)

- [ ] **Paso 1: Anadir CSS para el banner de alertas en Convocatoria**

Despues de los estilos de `.tab-btn` (~linea 288), anadir:

```css
/* ── Alert banner (tab Convocatoria) ── */
.alert-banner {
  display: none;
  padding: 8px 24px;
  background: var(--warning-light);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
  align-items: center;
  gap: 8px;
}
.alert-banner.visible {
  display: flex;
}
.alert-banner-text {
  flex: 1;
}
.alert-banner-count {
  font-weight: 600;
  color: var(--warning);
}
.alert-banner-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}
.alert-banner-close:hover {
  color: var(--text-primary);
}
```

- [ ] **Paso 2: Anadir HTML del banner**

Despues de la linea del tab-bar (linea 2955), antes de que empiece el tab-content de Convocatoria:

```html
<div id="alertBanner" class="alert-banner" role="status">
  <span class="alert-banner-count" id="alertBannerCount">0</span>
  <span class="alert-banner-text" id="alertBannerText">alertas pendientes</span>
  <button class="alert-banner-close" id="alertBannerClose" aria-label="Cerrar alertas">&times;</button>
</div>
```

- [ ] **Paso 3: Implementar evaluateAlerts()**

Anadir la funcion antes de `renderDashboard()` (~linea 13047):

```javascript
function evaluateAlerts() {
  var alerts = [];
  var catalog = state.catalogActions || [];
  var now = new Date();

  catalog.forEach(function(action) {
    if (!action.fechaInicio) return;

    var fechaInicio = new Date(action.fechaInicio + 'T00:00:00');
    var diffDays = Math.ceil((fechaInicio - now) / (1000 * 60 * 60 * 24));

    // Alerta: formacion en <= 2 dias habiles sin comunicar inicio
    if (diffDays <= 3 && diffDays >= 0 && action.estado !== 'Inicio comunicado' && action.estado !== 'Cerrada') {
      alerts.push({
        type: 'danger',
        message: 'Comunica inicio de "' + (action.titulo || 'Sin titulo') + '" a FUNDAE (faltan ' + diffDays + ' dias)',
        actionId: action.id,
        actionLabel: 'Generar XML'
      });
    }

    // Alerta: formacion en <= 5 dias aun en preparacion
    if (diffDays <= 5 && diffDays > 0 && action.estado === 'En preparacion') {
      alerts.push({
        type: 'warning',
        message: '"' + (action.titulo || 'Sin titulo') + '" en ' + diffDays + ' dias, aun en preparacion',
        actionId: action.id,
        actionLabel: 'Ver accion'
      });
    }

    // Alerta: formacion finalizada sin comunicar fin
    if (action.fechaFin) {
      var fechaFin = new Date(action.fechaFin + 'T00:00:00');
      var diffFin = Math.ceil((now - fechaFin) / (1000 * 60 * 60 * 24));
      if (diffFin > 0 && action.estado !== 'Fin comunicado' && action.estado !== 'Cerrada') {
        alerts.push({
          type: 'danger',
          message: 'Comunica finalizacion de "' + (action.titulo || 'Sin titulo') + '" a FUNDAE (finalizo hace ' + diffFin + ' dias)',
          actionId: action.id,
          actionLabel: 'Generar XML'
        });
      }
    }
  });

  // Ordenar: danger primero, luego warning
  alerts.sort(function(a, b) {
    if (a.type === 'danger' && b.type !== 'danger') return -1;
    if (a.type !== 'danger' && b.type === 'danger') return 1;
    return 0;
  });

  // Actualizar banner en tab Convocatoria
  var banner = document.getElementById('alertBanner');
  var bannerCount = document.getElementById('alertBannerCount');
  var bannerText = document.getElementById('alertBannerText');

  if (alerts.length > 0 && !banner.dataset.dismissed) {
    bannerCount.textContent = alerts.length;
    bannerText.textContent = alerts.length === 1 ? 'alerta pendiente' : 'alertas pendientes';
    banner.classList.add('visible');
  } else {
    banner.classList.remove('visible');
  }

  // Actualizar widget de alertas del dashboard
  updateDashboardAlerts(alerts);

  return alerts;
}
```

- [ ] **Paso 4: Implementar updateDashboardAlerts()**

```javascript
function updateDashboardAlerts(alerts) {
  var widget = document.getElementById('dashAlertsWidget');
  var badge = document.getElementById('dashAlertsBadge');
  var summary = document.getElementById('dashAlertsSummary');

  if (!widget) return;

  if (alerts.length === 0) {
    widget.style.display = 'none';
    return;
  }

  widget.style.display = '';
  badge.textContent = alerts.length;
  badge.className = 'dash-alerts-badge' + (alerts.some(function(a) { return a.type === 'danger'; }) ? ' dash-badge-danger' : '');
  summary.textContent = alerts.length === 1 ? 'alerta pendiente' : 'alertas pendientes';

  // Renderizar lista de alertas en el body del widget
  var body = document.getElementById('dashAlertsBody');
  if (body) {
    body.innerHTML = alerts.map(function(a) {
      return '<div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:12px;">' +
        '<span style="color:var(--' + (a.type === 'danger' ? 'danger' : 'warning') + '); font-weight:600;">●</span> ' +
        esc(a.message) +
        (a.actionLabel ? ' <button class="link-btn link-add" onclick="navigateToAction(\'' + a.actionId + '\')" style="font-size:11px;">' + esc(a.actionLabel) + '</button>' : '') +
        '</div>';
    }).join('');
  }
}
```

- [ ] **Paso 5: Conectar evaluateAlerts() a los triggers**

Al final del script, en la zona de inicializacion (buscar donde se invoca `renderDashboard` o la logica de `DOMContentLoaded` / carga inicial):

```javascript
// Ejecutar alertas al cargar
evaluateAlerts();

// Ejecutar alertas al cambiar de tab al dashboard
// (anadir en el handler de click de los tab-btn)

// Ejecutar cada 60 minutos
setInterval(evaluateAlerts, 60 * 60 * 1000);
```

En el handler del click de tab-btn que navega al dashboard, anadir `evaluateAlerts()`.

- [ ] **Paso 6: Anadir handler para cerrar banner**

```javascript
document.getElementById('alertBannerClose').addEventListener('click', function() {
  var banner = document.getElementById('alertBanner');
  banner.classList.remove('visible');
  banner.dataset.dismissed = 'true';
});
```

- [ ] **Paso 7: Verificar**

1. Sin acciones en catalogo → no hay banner ni alertas.
2. Con accion con fechaInicio en 2 dias y estado "En preparacion" → alerta danger.
3. Con accion con fechaFin pasada y estado sin "Fin comunicado" → alerta danger.
4. Banner se cierra al pulsar X.
5. Dashboard muestra alertas con botones de accion.

- [ ] **Paso 8: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.3): proactive alert engine - FUNDAE deadlines, preparation warnings, dashboard + banner"
```

---

### Tarea F1.4: Toasts premium con icono, progreso, undo y aria-live

**Objetivo:** Redisenar los toasts con layout grid (icono | texto | accion), barra de progreso visible, boton "Deshacer" opcional, y `aria-live="polite"`.

**Files:**
- Modify: `convocatoria.html:1457-1480` (CSS toasts)
- Modify: `convocatoria.html:3696` (HTML toast container)
- Modify: `convocatoria.html:6666-6676` (JS showToast)

- [ ] **Paso 1: Reescribir CSS de toasts**

Reemplazar las lineas 1457-1480 (todo el bloque de toast CSS) por:

```css
/* ── Toast notifications (premium) ── */
.toast {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  color: white;
  box-shadow: var(--shadow-lg);
  animation: toastIn 0.3s ease-out;
  max-width: 420px;
  min-width: 280px;
  line-height: 1.4;
  position: relative;
  overflow: hidden;
}
.toast-icon {
  font-size: 16px;
  line-height: 1;
  margin-top: 1px;
}
.toast-message {
  flex: 1;
}
.toast-action {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-body);
  transition: background var(--transition);
  white-space: nowrap;
}
.toast-action:hover {
  background: rgba(255,255,255,0.35);
}
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255,255,255,0.4);
  border-radius: 0 0 var(--radius) var(--radius);
  transition: width linear;
}
.toast-success { background: var(--success); }
.toast-error { background: var(--danger); }
.toast-warning { background: var(--warning); }
.toast-info { background: var(--accent); }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(40px); }
}
```

- [ ] **Paso 2: Anadir aria-live al contenedor HTML**

```html
<!-- ANTES (linea 3696) -->
<div id="toastContainer"></div>

<!-- DESPUES -->
<div id="toastContainer" role="status" aria-live="polite"></div>
```

(Nota: si F0.1 ya extrajo los estilos inline del contenedor a CSS, el HTML ya sera limpio.)

- [ ] **Paso 3: Reescribir showToast() con nueva firma**

Reemplazar la funcion `showToast()` (lineas 6666-6676):

```javascript
function showToast(message, type, duration, options) {
  if (type === undefined) type = 'info';
  if (duration === undefined) duration = 4000;
  if (!options) options = {};

  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  // Icon
  var icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  var iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || 'ℹ';
  toast.appendChild(iconEl);

  // Message
  var msgEl = document.createElement('span');
  msgEl.className = 'toast-message';
  msgEl.textContent = message;
  toast.appendChild(msgEl);

  // Action button (undo or custom)
  if (options.undoFn) {
    var actionBtn = document.createElement('button');
    actionBtn.className = 'toast-action';
    actionBtn.textContent = options.actionLabel || 'Deshacer';
    actionBtn.addEventListener('click', function() {
      options.undoFn();
      toast.style.animation = 'toastOut 0.3s ease-in forwards';
      toast.addEventListener('animationend', function() { toast.remove(); });
    });
    toast.appendChild(actionBtn);
  }

  // Progress bar
  var progress = document.createElement('div');
  progress.className = 'toast-progress';
  progress.style.width = '100%';
  toast.appendChild(progress);

  container.appendChild(toast);

  // Start progress animation
  requestAnimationFrame(function() {
    progress.style.transitionDuration = duration + 'ms';
    progress.style.width = '0%';
  });

  // Auto-dismiss
  var timeout = setTimeout(function() {
    toast.style.animation = 'toastOut 0.3s ease-in forwards';
    toast.addEventListener('animationend', function() { toast.remove(); });
  }, duration);

  // Allow click to dismiss early
  toast.addEventListener('click', function(e) {
    if (e.target.closest('.toast-action')) return;
    clearTimeout(timeout);
    toast.style.animation = 'toastOut 0.3s ease-in forwards';
    toast.addEventListener('animationend', function() { toast.remove(); });
  });

  return toast;
}
```

- [ ] **Paso 4: Verificar compatibilidad con invocaciones existentes**

La nueva firma `showToast(message, type, duration, options)` es retrocompatible con todas las invocaciones existentes que usan `showToast(msg, type)` o `showToast(msg, type, duration)`. El cuarto parametro `options` es nuevo y opcional.

Buscar todas las invocaciones de `showToast(` en el fichero y verificar que ninguna se rompe.

- [ ] **Paso 5: Verificar**

1. `showToast('Datos cargados', 'success')` → toast verde con icono check, progreso, auto-cierre.
2. `showToast('Error', 'error', 6000)` → toast rojo con progreso de 6s.
3. `showToast('Eliminado', 'info', 5000, { undoFn: function() { ... } })` → toast con boton "Deshacer".
4. Click en el toast lo cierra inmediatamente.
5. Verificar en screen reader que `aria-live` anuncia los toasts.

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.4): premium toasts with icon, progress bar, undo action, and aria-live"
```

---

### Tarea F1.5: Check SVG animado en upload

**Objetivo:** Al cargar un archivo exitosamente, mostrar check SVG animado con `stroke-dasharray`/`stroke-dashoffset`. Sin ring expansivo, sin `scale()`.

**Files:**
- Modify: `convocatoria.html:883-940` (CSS upload-zone)
- Modify: `convocatoria.html:2980` (HTML upload zone)
- Modify: `convocatoria.html:7461-7466` (JS post-carga)

- [ ] **Paso 1: Anadir CSS para la animacion SVG**

Despues de `.upload-zone.loading::after` (~linea 940), anadir:

```css
/* ── Upload success check ── */
.upload-check {
  display: none;
  width: 48px;
  height: 48px;
  margin: 0 auto 8px;
}
.upload-zone.loaded .upload-check {
  display: block;
}
.upload-check-circle {
  fill: none;
  stroke: var(--success);
  stroke-width: 2;
  stroke-dasharray: 150;
  stroke-dashoffset: 150;
  animation: uploadCheckCircle 0.4s ease-out 0.1s forwards;
}
.upload-check-mark {
  fill: none;
  stroke: var(--success);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: uploadCheckDraw 0.3s ease-out 0.4s forwards;
}
@keyframes uploadCheckCircle {
  to { stroke-dashoffset: 0; }
}
@keyframes uploadCheckDraw {
  to { stroke-dashoffset: 0; }
}
```

- [ ] **Paso 2: Anadir SVG al HTML del upload zone**

Dentro de `#uploadZone` (linea 2980), antes o despues de `#uploadPrompt`, anadir el SVG (oculto por defecto, visible cuando `.loaded`):

```html
<svg class="upload-check" viewBox="0 0 52 52" aria-hidden="true">
  <circle class="upload-check-circle" cx="26" cy="26" r="24"/>
  <path class="upload-check-mark" d="M14 27l8 8 16-16"/>
</svg>
```

- [ ] **Paso 3: Re-trigger de animacion al cargar nuevo fichero**

En `handleFile()` (o en `processParseResult()` tras F1.1), al llegar al punto donde se marca `uploadZone.classList.add('loaded')` (linea 7461):

```javascript
// Re-trigger SVG animation by removing and re-adding the loaded class
uploadZone.classList.remove('loaded');
void uploadZone.offsetWidth; // Force reflow
uploadZone.classList.add('loaded');
```

- [ ] **Paso 4: Verificar**

1. Cargar un Excel valido → check SVG se dibuja suavemente (circulo primero, luego el tick).
2. Cargar otro Excel → animacion se resetea y vuelve a ejecutarse.
3. Sin `scale()`, sin ring, solo `stroke-dasharray`.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.5): animated SVG check on successful upload with stroke-dasharray draw"
```

---

### Tarea F1.6: Validacion on-blur en datos del evento

**Objetivo:** Al salir de un campo obligatorio vacio (titulo, fecha, hora inicio, hora fin), mostrar borde `--warning` y texto "Campo obligatorio". Al rellenarlo, desaparece.

**Files:**
- Modify: `convocatoria.html:~1160` (CSS, nuevas clases)
- Modify: `convocatoria.html:~8639` (JS, listeners blur)

- [ ] **Paso 1: Anadir CSS para validacion**

Junto a los estilos de `.input-field` (buscar `.input-field` en CSS, ~linea 1100-1200):

```css
/* ── Inline validation ── */
.input-field.incomplete {
  border-color: var(--warning);
}
.input-field.incomplete:focus {
  border-color: var(--warning);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}
.input-field.has-error {
  border-color: var(--danger);
}
.input-field.has-error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}
.field-hint {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 3px;
  animation: fieldHintIn 0.2s ease-out;
}
.field-hint.field-error {
  color: var(--danger);
}
@keyframes fieldHintIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Paso 2: Anadir listeners de validacion on-blur**

Despues de `validateEvent()` (linea 8651), anadir:

```javascript
// On-blur validation for required event fields
(function setupBlurValidation() {
  var requiredFields = [
    { id: 'eventTitle', label: 'Campo obligatorio' },
    { id: 'eventDate', label: 'Campo obligatorio' }
  ];

  requiredFields.forEach(function(field) {
    var el = document.getElementById(field.id);
    if (!el) return;

    el.addEventListener('blur', function() {
      var hint = el.parentNode.querySelector('.field-hint');
      if (!el.value.trim()) {
        el.classList.add('incomplete');
        if (!hint) {
          hint = document.createElement('span');
          hint.className = 'field-hint';
          hint.textContent = field.label;
          el.parentNode.appendChild(hint);
        }
      } else {
        el.classList.remove('incomplete');
        if (hint) hint.remove();
      }
    });

    el.addEventListener('input', function() {
      if (el.value.trim()) {
        el.classList.remove('incomplete');
        var hint = el.parentNode.querySelector('.field-hint');
        if (hint) hint.remove();
      }
    });
  });

  // Time validation: endTime < startTime
  var startEl = document.getElementById('eventStart');
  var endEl = document.getElementById('eventEnd');
  if (startEl && endEl) {
    endEl.addEventListener('blur', function() {
      var hint = endEl.parentNode.querySelector('.field-hint');
      if (startEl.value && endEl.value && endEl.value <= startEl.value) {
        endEl.classList.add('has-error');
        endEl.classList.remove('incomplete');
        if (!hint) {
          hint = document.createElement('span');
          hint.className = 'field-hint field-error';
          endEl.parentNode.appendChild(hint);
        }
        hint.textContent = 'La hora de fin debe ser posterior a la de inicio';
        hint.className = 'field-hint field-error';
      } else if (!endEl.value) {
        endEl.classList.add('incomplete');
        endEl.classList.remove('has-error');
        if (!hint) {
          hint = document.createElement('span');
          hint.className = 'field-hint';
          endEl.parentNode.appendChild(hint);
        }
        hint.textContent = 'Campo obligatorio';
        hint.className = 'field-hint';
      } else {
        endEl.classList.remove('incomplete', 'has-error');
        if (hint) hint.remove();
      }
    });

    endEl.addEventListener('input', function() {
      if (endEl.value && (!startEl.value || endEl.value > startEl.value)) {
        endEl.classList.remove('incomplete', 'has-error');
        var hint = endEl.parentNode.querySelector('.field-hint');
        if (hint) hint.remove();
      }
    });
  }
})();
```

- [ ] **Paso 3: Verificar**

1. Hacer click en titulo, dejarlo vacio, hacer tab → borde warning + "Campo obligatorio".
2. Escribir algo → desaparece.
3. Hora fin < hora inicio → borde danger + "La hora de fin debe ser posterior".
4. Las validaciones son sutiles, no modales.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.6): on-blur validation for required event fields with warning/error indicators"
```

---

### Tarea F1.7: Indicador de guardado y estado de sesion

**Objetivo:** (1) Texto "Guardado hace X min" en el pie del panel izquierdo. (2) Banner al abrir con cola pendiente. (3) Icono junto al nombre del fichero.

**Files:**
- Modify: `convocatoria.html:~3100` (HTML, pie del panel)
- Modify: `convocatoria.html:~3112` (HTML, banner sesion)
- Modify: `convocatoria.html:7555-7579` (JS saveState)
- Modify: `convocatoria.html:~9100-9200` (JS inicializacion)
- Modify: `convocatoria.html:~880` (CSS, nuevos estilos)

- [ ] **Paso 1: Anadir CSS para indicador de guardado y banner de sesion**

```css
/* ── Save indicator ── */
.save-indicator {
  padding: 8px var(--space-xl);
  font-size: 11px;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  transition: color var(--transition);
}
.save-indicator.just-saved {
  color: var(--success);
}

/* ── Session recovery banner ── */
.session-banner {
  display: none;
  padding: 12px 28px;
  background: var(--accent-subtle);
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-secondary);
  align-items: center;
  gap: 12px;
}
.session-banner.visible {
  display: flex;
}
.session-banner-text {
  flex: 1;
}
.session-banner-actions {
  display: flex;
  gap: 8px;
}
```

- [ ] **Paso 2: Anadir HTML del indicador de guardado**

Al final de `.left-panel`, justo antes del cierre del panel (buscar la estructura del panel izquierdo), anadir:

```html
<div class="save-indicator" id="saveIndicator">Sin cambios</div>
```

- [ ] **Paso 3: Anadir HTML del banner de sesion**

Antes o justo despues de `#queueBar` (linea 3112):

```html
<div id="sessionBanner" class="session-banner" role="status">
  <span class="session-banner-text" id="sessionBannerText"></span>
  <div class="session-banner-actions">
    <button class="btn btn-primary" id="btnSessionContinue" style="font-size:12px; padding:6px 14px;">Continuar</button>
    <button class="btn btn-secondary" id="btnSessionDiscard" style="font-size:12px; padding:6px 14px;">Empezar de nuevo</button>
  </div>
</div>
```

- [ ] **Paso 4: Actualizar saveState() para mostrar timestamp**

En `saveState()` (linea 7555), despues de guardar en localStorage, actualizar el indicador:

```javascript
function saveState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(function() {
    try {
      var snapshot = {
        activeFilters: state.activeFilters,
        excludedNIFs: [...state.excludedNIFs],
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
        timestamp: Date.now()
      };
      localStorage.setItem('convocatoria_state', JSON.stringify(snapshot));

      // Update save indicator
      updateSaveIndicator();
    } catch(e) {}
  }, 500);
}

var lastSaveTimestamp = null;
function updateSaveIndicator() {
  lastSaveTimestamp = Date.now();
  var el = document.getElementById('saveIndicator');
  if (!el) return;
  el.textContent = 'Guardado ahora';
  el.classList.add('just-saved');
  setTimeout(function() { el.classList.remove('just-saved'); }, 2000);
}

// Update relative time every 30s
setInterval(function() {
  if (!lastSaveTimestamp) return;
  var el = document.getElementById('saveIndicator');
  if (!el) return;
  var diff = Math.floor((Date.now() - lastSaveTimestamp) / 1000);
  if (diff < 60) {
    el.textContent = 'Guardado hace unos segundos';
  } else if (diff < 3600) {
    var mins = Math.floor(diff / 60);
    el.textContent = 'Guardado hace ' + mins + ' min';
  } else {
    var hours = Math.floor(diff / 3600);
    el.textContent = 'Guardado hace ' + hours + 'h';
  }
}, 30000);
```

- [ ] **Paso 5: Implementar deteccion de cola pendiente al cargar**

En la zona de inicializacion (donde se ejecuta `loadQueue()` y se restaura el estado), despues de cargar la cola:

```javascript
// Check for pending queue on app load
(function checkPendingSession() {
  loadQueue();
  if (state.queue.length > 0) {
    var banner = document.getElementById('sessionBanner');
    var text = document.getElementById('sessionBannerText');
    var queueDate = state.queue[0].date || 'desconocida';
    text.textContent = 'Tienes ' + state.queue.length + ' convocatoria' + (state.queue.length > 1 ? 's' : '') + ' en cola del dia ' + queueDate + '.';
    banner.classList.add('visible');

    document.getElementById('btnSessionContinue').addEventListener('click', function() {
      banner.classList.remove('visible');
      renderQueue();
    });

    document.getElementById('btnSessionDiscard').addEventListener('click', function() {
      state.queue = [];
      saveQueue();
      banner.classList.remove('visible');
      renderQueue();
      showToast('Cola vaciada', 'info');
    });
  }
})();
```

- [ ] **Paso 6: Verificar**

1. Modificar un campo → "Guardado ahora" en verde, luego "Guardado hace unos segundos".
2. Esperar 2 min → "Guardado hace 2 min".
3. Anadir items a cola, cerrar y reabrir → banner "Tienes N convocatorias en cola...".
4. "Continuar" → cierra banner, muestra cola.
5. "Empezar de nuevo" → cierra banner, limpia cola.

- [ ] **Paso 7: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.7): save indicator with relative time + session recovery banner for pending queue"
```

---

### Tarea F1.8: Auto-relleno de datos del grupo XML

**Objetivo:** Guardar los datos del grupo XML mas recientes por CIF y pre-rellenarlos en futuras generaciones.

**Files:**
- Modify: `convocatoria.html:9741-10571` (JS XML generation)
- Add localStorage key: `convocatoria_xmlGroupDefaults_{CIF}`

- [ ] **Paso 1: Localizar donde se renderizan los campos del grupo XML**

En la zona de XML generation (lineas 9741+), buscar donde se renderizan los campos del formulario de grupo (ID grupo, responsable, telefono, email). Identificar los IDs de los inputs.

- [ ] **Paso 2: Implementar guardado de defaults al generar XML**

Localizar la funcion que se ejecuta al pulsar "Generar XML" (buscar `btnGenXml` o similar). Antes de generar, guardar los datos actuales:

```javascript
function saveXmlGroupDefaults(cif, data) {
  if (!cif) return;
  try {
    localStorage.setItem('convocatoria_xmlGroupDefaults_' + cif, JSON.stringify({
      idGrupo: data.idGrupo || '',
      responsable: data.responsable || '',
      telefono: data.telefono || '',
      emailResponsable: data.emailResponsable || '',
      savedAt: Date.now()
    }));
  } catch(e) {}
}

function loadXmlGroupDefaults(cif) {
  if (!cif) return null;
  try {
    return JSON.parse(localStorage.getItem('convocatoria_xmlGroupDefaults_' + cif));
  } catch(e) { return null; }
}
```

- [ ] **Paso 3: Pre-rellenar campos al abrir generador XML**

Donde se renderizan los campos del formulario XML (buscar donde se crean los inputs de grupo), despues de renderizar:

```javascript
// Pre-fill from saved defaults
var empresaCif = /* obtener CIF de la empresa seleccionada */;
var defaults = loadXmlGroupDefaults(empresaCif);
if (defaults) {
  // Pre-rellenar los inputs con los valores guardados
  var idGrupoInput = document.getElementById(/* ID del input de grupo */);
  var responsableInput = document.getElementById(/* ID del input de responsable */);
  var telefonoInput = document.getElementById(/* ID del input de telefono */);
  var emailInput = document.getElementById(/* ID del input de email */);

  if (idGrupoInput && !idGrupoInput.value) idGrupoInput.value = defaults.idGrupo;
  if (responsableInput && !responsableInput.value) responsableInput.value = defaults.responsable;
  if (telefonoInput && !telefonoInput.value) telefonoInput.value = defaults.telefono;
  if (emailInput && !emailInput.value) emailInput.value = defaults.emailResponsable;

  showToast('Datos del grupo pre-rellenados desde la ultima generacion', 'info', 3000);
}
```

- [ ] **Paso 4: Guardar al generar XML exitosamente**

Al final de cada funcion de generacion de XML (tras el `downloadXML()` exitoso), guardar:

```javascript
saveXmlGroupDefaults(empresaCif, {
  idGrupo: /* valor actual del input */,
  responsable: /* valor actual */,
  telefono: /* valor actual */,
  emailResponsable: /* valor actual */
});
```

- [ ] **Paso 5: Verificar**

1. Generar un XML con datos de grupo → datos guardados.
2. Abrir otro XML de la misma empresa → datos pre-rellenados + toast.
3. Empresa diferente → sin pre-relleno.

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.8): auto-fill XML group data from last generation per CIF"
```

---

### Tarea F1.9: Credito FUNDAE con simulacion y alertas

**Objetivo:** Ampliar el modulo de credito del dashboard con simulador de impacto, alertas de infrautilizacion/sobreconsumo, y proyeccion temporal.

**Files:**
- Modify: `convocatoria.html:9640-9710` (JS empresas/credito)
- Modify: `convocatoria.html:~12571` (JS dashboard credito)
- Modify: `convocatoria.html:3535` (HTML dash-card credito)
- Modify: `convocatoria.html:~2100` (CSS, nuevos estilos)

- [ ] **Paso 1: Anadir CSS para simulador de credito**

En la zona de CSS del dashboard (~linea 2100+):

```css
/* ── Credit simulator ── */
.credit-simulator {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-input);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.credit-simulator-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}
.credit-simulator-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 0;
}
.credit-simulator-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.credit-bar {
  height: 8px;
  background: var(--bg-input);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 8px 0;
  border: 1px solid var(--border);
}
.credit-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-lg);
  transition: width 0.5s ease-out;
}
.credit-bar-fill.high {
  background: var(--warning);
}
.credit-bar-fill.critical {
  background: var(--danger);
}
```

- [ ] **Paso 2: Ampliar la funcion de renderizado de credito en el dashboard**

Localizar donde se renderiza la tarjeta de credito en `renderDashboard()` (buscar `data-card-id="credito"` o el bloque que usa las empresas con credito, linea ~12571). Ampliar para incluir:

```javascript
function renderCreditSimulator(containerEl) {
  var empresas = getEmpresasGrupo();
  var totalCredito = empresas.reduce(function(sum, e) { return sum + (e.credito || 0); }, 0);

  // Calcular consumo de acciones del catalogo
  var catalog = state.catalogActions || [];
  var consumido = 0;
  var planificado = 0;

  catalog.forEach(function(action) {
    var coste = parseFloat(action.coste) || 0;
    if (action.estado === 'Cerrada' || action.estado === 'Fin comunicado') {
      consumido += coste;
    } else if (action.estado !== 'Cancelada') {
      planificado += coste;
    }
  });

  var totalProyectado = consumido + planificado;
  var pctConsumido = totalCredito > 0 ? Math.round((consumido / totalCredito) * 100) : 0;
  var pctProyectado = totalCredito > 0 ? Math.round((totalProyectado / totalCredito) * 100) : 0;

  // Determinar estado de la barra
  var barClass = '';
  if (pctProyectado >= 95) barClass = 'critical';
  else if (pctProyectado >= 80) barClass = 'high';

  var html = '<div class="credit-simulator">' +
    '<div class="credit-simulator-title">Simulacion de credito</div>' +
    '<div class="credit-bar"><div class="credit-bar-fill ' + barClass + '" style="width:' + Math.min(pctConsumido, 100) + '%;"></div></div>' +
    '<div class="credit-simulator-row"><span>Consumido</span><span class="credit-simulator-value">' + consumido.toLocaleString('es-ES', {minimumFractionDigits:2}) + ' EUR (' + pctConsumido + '%)</span></div>' +
    '<div class="credit-simulator-row"><span>Planificado</span><span class="credit-simulator-value">' + planificado.toLocaleString('es-ES', {minimumFractionDigits:2}) + ' EUR</span></div>' +
    '<div class="credit-simulator-row"><span>Proyectado total</span><span class="credit-simulator-value">' + totalProyectado.toLocaleString('es-ES', {minimumFractionDigits:2}) + ' EUR (' + pctProyectado + '%)</span></div>' +
    '<div class="credit-simulator-row"><span>Disponible</span><span class="credit-simulator-value">' + Math.max(0, totalCredito - totalProyectado).toLocaleString('es-ES', {minimumFractionDigits:2}) + ' EUR</span></div>' +
    '</div>';

  containerEl.insertAdjacentHTML('beforeend', html);
}
```

- [ ] **Paso 3: Integrar alertas de credito con el motor de alertas**

En `evaluateAlerts()` (implementada en F1.3), anadir reglas de credito:

```javascript
// Alertas de credito FUNDAE
var empresas = getEmpresasGrupo();
var totalCredito = empresas.reduce(function(sum, e) { return sum + (e.credito || 0); }, 0);
if (totalCredito > 0) {
  var consumido = 0;
  catalog.forEach(function(a) {
    if (a.estado === 'Cerrada' || a.estado === 'Fin comunicado') {
      consumido += parseFloat(a.coste) || 0;
    }
  });
  var pct = consumido / totalCredito;

  if (pct >= 0.95) {
    alerts.push({
      type: 'danger',
      message: 'Credito FUNDAE casi agotado (' + Math.round(pct * 100) + '%)',
      actionLabel: 'Ver credito'
    });
  } else if (pct >= 0.80) {
    alerts.push({
      type: 'warning',
      message: 'Credito FUNDAE al ' + Math.round(pct * 100) + '%',
      actionLabel: 'Ver credito'
    });
  }

  // Alerta de infrautilizacion (septiembre-diciembre)
  var currentMonth = new Date().getMonth(); // 0-indexed
  if (currentMonth >= 8 && pct < 0.50) { // septiembre = 8
    alerts.push({
      type: 'warning',
      message: 'Credito FUNDAE infrautilizado (' + Math.round(pct * 100) + '%) — quedan ' + (12 - currentMonth - 1) + ' meses del ejercicio',
      actionLabel: 'Ver credito'
    });
  }
}
```

- [ ] **Paso 4: Invocar renderCreditSimulator desde renderDashboard**

Dentro de `renderDashboard()`, localizar donde se renderiza la tarjeta de credito y anadir la invocacion:

```javascript
// Despues de renderizar la tabla de empresas con credito
renderCreditSimulator(creditContainer);
```

- [ ] **Paso 5: Verificar**

1. Sin empresas/credito → sin simulador ni alertas.
2. Con empresas y acciones con coste → barra de progreso, consumido/planificado.
3. Con consumo > 80% → alerta warning en motor.
4. Con consumo > 95% → alerta danger.
5. En octubre con < 50% consumido → alerta de infrautilizacion.

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F1.9): FUNDAE credit simulator with consumption bar, projections, and threshold alerts"
```

---

## Resumen de Fase 0 + Fase 1

| Tarea | Fase | Lane | Esfuerzo est. | Secciones principales |
|-------|------|------|---------------|----------------------|
| F0.1 Inline → CSS | 0 | Secuencial | 4-6h | CSS 1457-1480, HTML 3112/3696, JS 6666/8220 |
| F0.2 Terminologia | 0 | Secuencial | 2-3h | ~50 ocurrencias de texto en HTML/JS |
| F0.3 Sombras | 0 | Secuencial | 30min | CSS :root linea 38, CLAUDE.md |
| F0.4 Rename | 0 | Secuencial | 15min | HTML lineas 6, 2963, 3872 |
| F1.1 Hoja Excel | 1 | A | 1h | JS 6499-6520, 7401-7420, HTML ~3700 |
| F1.2 Duplicar | 1 | D | 1-2h | JS ~4933 (catalogo) |
| F1.3 Alertas | 1 | C | 3-4h | JS ~13047, HTML 2956/3514, CSS ~2061 |
| F1.4 Toasts | 1 | B | 2-3h | CSS 1457-1480, JS 6666-6676, HTML 3696 |
| F1.5 SVG upload | 1 | B | 1h | CSS ~940, HTML 2980, JS 7461 |
| F1.6 On-blur | 1 | B | 1-2h | CSS ~1160, JS ~8639 |
| F1.7 Guardado | 1 | B | 2h | HTML ~3100, JS 7555-7579 |
| F1.8 XML auto-fill | 1 | A | 1h | JS 9741-10571 |
| F1.9 Credito | 1 | C | 3-4h | JS ~12571, HTML 3535, CSS ~2100 |

**Total estimado Fase 0:** ~7-10h
**Total estimado Fase 1:** ~16-21h
**Total Parte 1:** ~23-31h
