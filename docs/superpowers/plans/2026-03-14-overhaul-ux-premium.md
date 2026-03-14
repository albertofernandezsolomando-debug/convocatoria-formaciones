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

---

## Fase 2: Core UX + compliance (Parte 2 del plan)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar las 12 tareas de Fase 2 que transforman el flujo principal de convocatorias y anaden compliance (RLT, formacion obligatoria). Cada tarea produce cambios autocontenidos y testeables.

**Duracion estimada:** 7-10 dias

**Prerequisitos:** Fase 0 y Fase 1 completadas (especialmente F0.1 inline-CSS, F0.2 terminologia, F1.3 motor de alertas, F1.4 toasts, F1.6 on-blur).

**Directivas de diseno (validadas):**
- NO semaforos (verde/amarillo/rojo) en ninguna parte
- NO sound design, NO confetti
- Indicadores de estado: texto en `--text-muted` + fechas vencidas en `--danger`
- Animaciones: solo opacidad y `stroke-dasharray`. Sin flash de color, sin scale, sin ring
- Terminologia: persona trabajadora, persona destinataria, formacion obligatoria
- Nombre: Formacion_AGORA

---

### Mapa de paralelismo — Fase 2

#### Carriles de ejecucion paralela

```
Lane E (UX Convocatoria):  F2.1 → F2.7 → F2.8
Lane F (Dialogos + envio): F2.3 → F2.5 → F2.6
Lane G (Cola + progreso):  F2.4
Lane H (Catalogos):        F2.9 → F2.2
Lane I (Compliance):       F2.10 → F2.11
Lane J (Sync):             F2.12
```

#### Justificacion de lanes

| Lane | Secciones HTML/JS que toca | Por que es independiente |
|------|---------------------------|-------------------------|
| **E** | JS 6499-7480 (parsing, handleFile), HTML 2956-3004 (upload zone) | Toca parseo Excel y zona de carga — no se solapa con dialogos ni catalogos |
| **F** | HTML 3823-3832 (confirmDialog), JS 8639-8745 (validateEvent, send flow) | Toca dialogos de confirmacion y flujo de envio — zona aislada |
| **G** | HTML 3112-3124 (queueBar), JS 8822-8900 (launchNext) | Solo toca la cola — completamente aislada |
| **H** | HTML 3213-3500 (tabXml), JS 9741-9833 (XML logic), JS 4933-5090 (catalogForm) | Toca pestanas XML y Catalogos — no se solapa con Convocatoria |
| **I** | HTML 3168-3210 (tabCatalogos), JS nuevo (compliance) | Anade sub-pestanas y logica nueva — secciones nuevas del catalogo |
| **J** | JS 8490-8544 (syncConvocatoriaWithAccion) | Modifica una sola funcion existente |

#### Orden de merge recomendado

1. **Lane G** (F2.4) — cambio aislado, sin conflictos posibles
2. **Lane J** (F2.12) — modifica una sola funcion
3. **Lane E** (F2.1 → F2.7 → F2.8) — zona de parseo/carga
4. **Lane H** (F2.9 → F2.2) — zona catalogos/XML
5. **Lane F** (F2.3 → F2.5 → F2.6) — zona de envio (mas cambios interrelacionados)
6. **Lane I** (F2.10 → F2.11) — compliance (mas codigo nuevo, menos conflictos)

#### Dependencias entre lanes

```
Lane I (F2.10, F2.11) depende de F1.3 (motor de alertas) — Fase 1
Lane F (F2.6) depende de F1.6 (on-blur) — Fase 1
Lane H (F2.2) depende de F2.9 (modo compacto) — misma lane, secuencial
Ninguna lane de Fase 2 depende de otra lane de Fase 2
```

---

### Task F2.1: Panel calidad de datos con edicion in situ

**Lane:** E (UX Convocatoria)

**Files:**
- Modify: `convocatoria.html:1457-1480` (CSS — nuevas clases `.dq-panel`, `.dq-issue`, `.dq-editor`)
- Modify: `convocatoria.html:2977-3004` (HTML — insertar panel colapsable despues de upload-zone)
- Modify: `convocatoria.html:6682-6692` (JS state — anadir `dataQualityIssues`)
- Modify: `convocatoria.html:7401-7480` (JS handleFile — reemplazar toasts por panel persistente)

- [ ] **Paso 1: Anadir CSS del panel de calidad**

Insertar antes de la linea `/* --- Cuadro de Mando --- */` (linea 1481):

```css
/* --- Panel calidad de datos --- */
.dq-panel {
  margin-top: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-panel);
  overflow: hidden;
}
.dq-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  user-select: none;
  transition: background var(--transition);
}
.dq-summary:hover { background: var(--accent-subtle); }
.dq-summary-count {
  font-weight: 600;
  color: var(--text-primary);
}
.dq-body {
  display: none;
  border-top: 1px solid var(--border);
  max-height: 240px;
  overflow-y: auto;
}
.dq-panel.open .dq-body { display: block; }
.dq-group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
}
.dq-issue {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition);
}
.dq-issue:hover { background: var(--accent-subtle); }
.dq-issue-text { flex: 1; min-width: 0; }
.dq-issue-action {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--accent);
  cursor: pointer;
}
.dq-editor {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 12px 8px;
}
.dq-editor input {
  flex: 1;
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
}
.dq-editor button {
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
}
```

- [ ] **Paso 2: Verificar que el CSS compila**

Abrir `convocatoria.html` en el navegador, abrir DevTools, confirmar que no hay errores de parseo CSS.

- [ ] **Paso 3: Anadir estado de calidad de datos**

Modificar el bloque `const state = {` en linea 6682. Anadir propiedad al final:

```javascript
const state = {
  employees: [],
  externalEmployees: [],
  activeFilters: {},
  excludedNIFs: new Set(),
  seriesDates: [],
  currentSessionIndex: 0,
  sortColumn: 'Empleado',
  sortDirection: 'asc',
  queue: [],
  dataQualityIssues: [],  // NEW
};
```

- [ ] **Paso 4: Crear funcion collectDataQualityIssues()**

Insertar despues de `function XLSX_sheetToJSON(sheet)` (linea 6549-6551):

```javascript
function collectDataQualityIssues(employees) {
  var issues = [];
  var nifCounts = {};
  employees.forEach(function(emp) {
    if (emp.NIF) nifCounts[emp.NIF] = (nifCounts[emp.NIF] || 0) + 1;
  });

  employees.forEach(function(emp, idx) {
    var email = emp['Email trabajo'];
    if (!email || email === '') {
      issues.push({ type: 'no-email', empId: emp._id, name: emp.Empleado || ('Fila ' + (idx+1)), field: 'Email trabajo', current: '' });
    } else if (!isValidEmail(email)) {
      issues.push({ type: 'invalid-email', empId: emp._id, name: emp.Empleado || ('Fila ' + (idx+1)), field: 'Email trabajo', current: email });
    }
    if (!emp.NIF || emp.NIF === '') {
      issues.push({ type: 'no-nif', empId: emp._id, name: emp.Empleado || ('Fila ' + (idx+1)), field: 'NIF', current: '' });
    } else if (nifCounts[emp.NIF] > 1) {
      issues.push({ type: 'dup-nif', empId: emp._id, name: emp.Empleado || ('Fila ' + (idx+1)), field: 'NIF', current: emp.NIF });
    }
  });
  return issues;
}
```

- [ ] **Paso 5: Crear funcion renderDataQualityPanel()**

Insertar justo despues de `collectDataQualityIssues`:

```javascript
function renderDataQualityPanel() {
  var container = document.getElementById('dqPanel');
  if (!container) return;
  var issues = state.dataQualityIssues;
  if (issues.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';

  var grouped = { 'no-email': [], 'invalid-email': [], 'no-nif': [], 'dup-nif': [] };
  issues.forEach(function(iss) {
    if (grouped[iss.type]) grouped[iss.type].push(iss);
  });

  var labels = {
    'no-email': 'Sin email',
    'invalid-email': 'Email invalido',
    'no-nif': 'Sin NIF',
    'dup-nif': 'NIF duplicado'
  };

  var bodyHtml = '';
  Object.keys(grouped).forEach(function(type) {
    var items = grouped[type];
    if (items.length === 0) return;
    bodyHtml += '<div class="dq-group-title">' + esc(labels[type]) + ' (' + items.length + ')</div>';
    items.forEach(function(iss) {
      bodyHtml += '<div class="dq-issue" data-emp-id="' + esc(iss.empId) + '" data-field="' + esc(iss.field) + '">' +
        '<span class="dq-issue-text">' + esc(iss.name) +
          (iss.current ? ' <span style="color:var(--text-muted);">(' + esc(iss.current) + ')</span>' : '') +
        '</span>' +
        '<span class="dq-issue-action">Editar</span>' +
      '</div>';
    });
  });

  container.innerHTML =
    '<div class="dq-summary" onclick="this.parentElement.classList.toggle(\'open\')">' +
      '<span><span class="dq-summary-count">' + issues.length + '</span> avisos de calidad</span>' +
      '<span style="font-size:10px;">&#9660;</span>' +
    '</div>' +
    '<div class="dq-body">' + bodyHtml + '</div>';

  // Bind edit handlers
  container.querySelectorAll('.dq-issue').forEach(function(el) {
    el.addEventListener('click', function() {
      var empId = el.dataset.empId;
      var field = el.dataset.field;
      var emp = state.employees.find(function(e) { return e._id === empId; });
      if (!emp) return;
      var existing = el.nextElementSibling;
      if (existing && existing.classList.contains('dq-editor')) { existing.remove(); return; }
      var editor = document.createElement('div');
      editor.className = 'dq-editor';
      editor.innerHTML = '<input class="input-field" type="text" value="' + esc(emp[field] || '') + '" placeholder="Nuevo valor">' +
        '<button class="btn btn-primary" style="font-size:11px; padding:4px 10px;">Guardar</button>' +
        '<button class="btn btn-secondary" style="font-size:11px; padding:4px 8px;">X</button>';
      el.after(editor);
      var input = editor.querySelector('input');
      input.focus();
      editor.querySelector('.btn-primary').addEventListener('click', function() {
        var newVal = input.value.trim();
        emp[field] = newVal;
        try {
          var corrections = JSON.parse(localStorage.getItem('convocatoria_corrections') || '{}');
          if (!corrections[empId]) corrections[empId] = {};
          corrections[empId][field] = newVal;
          localStorage.setItem('convocatoria_corrections', JSON.stringify(corrections));
        } catch(e) {}
        state.dataQualityIssues = collectDataQualityIssues(state.employees);
        renderDataQualityPanel();
        renderTable();
        showToast('Dato corregido: ' + emp.Empleado, 'success', 3000);
      });
      editor.querySelector('.btn-secondary').addEventListener('click', function() { editor.remove(); });
    });
  });
}
```

- [ ] **Paso 6: Insertar contenedor HTML del panel**

Despues del cierre de `upload-zone` (linea ~3003, justo antes de `<a href="#" class="link-btn link-add" id="btnDemoData"`), insertar:

```html
<div class="dq-panel" id="dqPanel" style="display:none;"></div>
```

- [ ] **Paso 7: Reemplazar toasts de calidad en handleFile()**

En `handleFile()` (lineas 7425-7452), reemplazar el bloque completo desde `// Data quality report` hasta el toast de resumen por:

```javascript
// Data quality report — panel persistente (no toasts efimeros)
state.dataQualityIssues = collectDataQualityIssues(state.employees);

// Apply saved corrections
try {
  var corrections = JSON.parse(localStorage.getItem('convocatoria_corrections') || '{}');
  Object.keys(corrections).forEach(function(empId) {
    var emp = state.employees.find(function(e) { return e._id === empId; });
    if (!emp) return;
    Object.keys(corrections[empId]).forEach(function(field) {
      emp[field] = corrections[empId][field];
    });
  });
  state.dataQualityIssues = collectDataQualityIssues(state.employees);
} catch(e) {}

var emptyEmails = state.employees.filter(function(e) { return !e['Email trabajo']; }).length;
showToast(state.employees.length + ' personas trabajadoras cargadas' +
  (state.dataQualityIssues.length > 0 ? ' · ' + state.dataQualityIssues.length + ' avisos de calidad' : ''), 'info', 4000);

renderDataQualityPanel();
```

- [ ] **Paso 8: Verificar manualmente**

1. Cargar un Excel con datos reales
2. Verificar que aparece el panel colapsable debajo de la zona de carga
3. Hacer click en el panel para expandirlo
4. Hacer click en un issue para abrir el editor inline
5. Editar un email, pulsar Guardar, verificar que el panel se actualiza
6. Recargar la pagina, cargar el mismo Excel, verificar que las correcciones se reaplicaron

- [ ] **Paso 9: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.1): panel calidad de datos con edicion in situ

Reemplaza toasts efimeros por panel colapsable persistente.
Edicion inline de emails y NIFs con persistencia en localStorage."
```

---

### Task F2.2: Panel inline checklist narrativo FUNDAE

**Lane:** H (Catalogos)

**Files:**
- Modify: `convocatoria.html:~1480` (CSS — nuevas clases `.fundae-readiness`)
- Modify: `convocatoria.html:3228` (HTML — insertar panel en pestana XML)
- Modify: `convocatoria.html:~8600` (JS — nueva funcion `checkFundaeReadinessDetailed()`)
- Modify: `convocatoria.html:9772-9800` (JS — vincular panel al select de accion XML)

- [ ] **Paso 1: Anadir CSS del panel readiness**

Insertar antes de `/* --- Cuadro de Mando --- */` (linea ~1481):

```css
/* --- Panel readiness FUNDAE --- */
.fundae-readiness {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-panel);
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
}
.fundae-readiness-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-size: 13px;
}
.fundae-readiness-ok { color: var(--text-secondary); }
.fundae-readiness-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}
.fundae-readiness-list li {
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.fundae-readiness-list li::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}
.fundae-readiness-list li.missing::before {
  background: var(--danger);
}
.fundae-readiness-link {
  color: var(--accent);
  cursor: pointer;
  font-size: 11px;
}
.fundae-readiness-link:hover { text-decoration: underline; }
```

- [ ] **Paso 2: Insertar contenedor HTML en pestana XML**

Despues de `<div id="xmlAccionInfo" class="text-sm text-muted mt-sm"></div>` (linea 3228):

```html
<div id="fundaeReadinessPanel" class="fundae-readiness" style="display:none;"></div>
```

- [ ] **Paso 3: Crear funcion checkFundaeReadinessDetailed()**

Insertar despues de `checkFundaeReadiness()` (tras linea ~8600):

```javascript
function checkFundaeReadinessDetailed(actionCode) {
  var acciones = getCatalog('acciones');
  var accion = acciones.find(function(a) { return a.codigo === actionCode; });
  if (!accion) return { complete: true, items: [], narrative: '' };

  var items = [];
  if (!accion.nombre) items.push({ field: 'nombre', message: 'Nombre de la accion', missing: true });
  if (!accion.fechaInicio) items.push({ field: 'fechaInicio', message: 'Fecha de inicio', missing: true });
  if (!accion.fechaFin) items.push({ field: 'fechaFin', message: 'Fecha de fin', missing: true });
  if (!accion.modalidad) items.push({ field: 'modalidad', message: 'Modalidad', missing: true });
  if (!accion.horasPresenciales && !accion.horasTeleformacion) items.push({ field: 'horas', message: 'Horas', missing: true });
  if (!accion.areaProfesional) items.push({ field: 'areaProfesional', message: 'Area profesional', missing: true });

  if (accion.modalidad === 'Presencial' || accion.modalidad === 'Mixta') {
    var centro = accion.centroVinculado ? getCatalog('centros').find(function(c) { return c.documento === accion.centroVinculado; }) : null;
    if (!centro) items.push({ field: 'centro', message: 'Centro de imparticion', missing: true });
    else {
      if (!centro.nombre) items.push({ field: 'centro.nombre', message: 'Nombre del centro', missing: true });
      if (!centro.direccion) items.push({ field: 'centro.direccion', message: 'Direccion del centro', missing: true });
    }
  }

  var tutor = accion.tutorVinculado ? getCatalog('tutores').find(function(t) { return t.documento === accion.tutorVinculado; }) : null;
  if (!tutor) items.push({ field: 'tutor', message: 'Tutor/a', missing: true });
  else {
    if (!tutor.nombre) items.push({ field: 'tutor.nombre', message: 'Nombre del tutor/a', missing: true });
    if (!tutor.email) items.push({ field: 'tutor.email', message: 'Email del tutor/a', missing: true });
  }

  var participantes = accion.participantes || [];
  if (participantes.length === 0) items.push({ field: 'participantes', message: 'Participantes (0 registrados)', missing: true });
  else {
    var sinNSS = 0;
    participantes.forEach(function(nif) {
      var emp = (state.employees || []).find(function(e) { return e.NIF === nif; });
      if (emp && (!emp['_f_NSS'] || emp['_f_NSS'] === '')) sinNSS++;
    });
    if (sinNSS > 0) items.push({ field: 'nss', message: 'NSS de ' + sinNSS + ' participante' + (sinNSS > 1 ? 's' : ''), missing: true });
  }

  var missingItems = items.filter(function(i) { return i.missing; });
  var narrative = missingItems.length === 0
    ? 'Todos los datos listos para generar XML.'
    : 'Faltan ' + missingItems.length + ' dato' + (missingItems.length > 1 ? 's' : '') + ': ' + missingItems.map(function(i) { return i.message; }).join(', ') + '.';

  return { complete: missingItems.length === 0, items: items, narrative: narrative };
}
```

- [ ] **Paso 4: Crear funcion renderFundaeReadinessPanel()**

```javascript
function renderFundaeReadinessPanel(actionCode) {
  var panel = document.getElementById('fundaeReadinessPanel');
  if (!panel) return;
  if (!actionCode) { panel.style.display = 'none'; return; }
  var result = checkFundaeReadinessDetailed(actionCode);
  panel.style.display = '';

  if (result.complete) {
    panel.innerHTML = '<div class="fundae-readiness-title">Readiness FUNDAE</div>' +
      '<div class="fundae-readiness-ok">' + esc(result.narrative) + '</div>';
    return;
  }

  var listHtml = result.items.filter(function(i) { return i.missing; }).map(function(i) {
    return '<li class="missing">' + esc(i.message) + '</li>';
  }).join('');

  panel.innerHTML = '<div class="fundae-readiness-title">Readiness FUNDAE</div>' +
    '<div>' + esc(result.narrative) + '</div>' +
    '<ul class="fundae-readiness-list">' + listHtml + '</ul>' +
    '<a class="fundae-readiness-link" onclick="document.querySelector(\'.tab-btn[data-tab=&quot;tabCatalogos&quot;]\').click();">Completar datos en Catalogos</a>';
}
```

- [ ] **Paso 5: Vincular al select de accion XML**

En `xmlAccionSelect change` (linea 9772), anadir `renderFundaeReadinessPanel(codigo);` al final del handler y `renderFundaeReadinessPanel(null);` en el bloque `if (!codigo)`.

- [ ] **Paso 6: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.2): panel inline checklist narrativo FUNDAE

Panel de readiness en pestana XML con texto narrativo.
Lista detallada de datos faltantes con links a Catalogos."
```

---

### Task F2.3: Dialogo preview + confirmacion fusionado

**Lane:** F (Dialogos + envio)

**Files:**
- Modify: `convocatoria.html:~1380-1450` (CSS — `.confirm-preview`, `.confirm-alerts`, `.confirm-dialog-enter`)
- Modify: `convocatoria.html:3823-3832` (HTML — reestructurar `#confirmDialog`)
- Modify: `convocatoria.html:8653-8690` (JS — construir preview en el dialogo)

- [ ] **Paso 1: Anadir CSS del dialogo fusionado**

Insertar antes de `/* --- Cuadro de Mando --- */`:

```css
/* --- Dialogo preview + confirmacion --- */
.confirm-preview { padding: 16px; border-bottom: 1px solid var(--border); }
.confirm-preview-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.confirm-preview-meta { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.confirm-preview-meta span { display: inline-block; margin-right: 12px; }
.confirm-preview-count {
  display: inline-block; padding: 2px 10px;
  background: var(--accent-light); color: var(--accent);
  border-radius: var(--radius-lg); font-weight: 600; font-size: 13px;
}
.confirm-attendee-list { margin-top: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
.confirm-attendee-more { color: var(--text-muted); font-style: italic; }
.confirm-alerts { padding: 12px 16px; }
.confirm-alert-card {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 8px 10px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); margin-bottom: 6px;
  font-size: 12px; color: var(--text-secondary); line-height: 1.5;
}
.confirm-alert-icon { flex-shrink: 0; font-size: 14px; }
.confirm-dialog-enter { animation: confirmEnter 0.25s ease-out; }
@keyframes confirmEnter {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

- [ ] **Paso 2: Reestructurar HTML del dialogo**

Reemplazar `#confirmDialog` (lineas 3823-3832):

```html
<div class="dialog-overlay" id="confirmDialog" role="dialog" aria-modal="true">
  <div class="dialog-box confirm-dialog-enter" style="max-width:520px; padding:0; border-top:3px solid var(--accent);">
    <div class="confirm-preview" id="confirmPreview"></div>
    <div class="confirm-alerts" id="confirmAlerts"></div>
    <div class="dialog-buttons" style="padding:12px 16px; border-top:1px solid var(--border);">
      <button class="btn btn-secondary" id="confirmCancel">Cancelar</button>
      <button class="btn btn-primary" id="confirmProceed">Abrir en Outlook</button>
    </div>
  </div>
</div>
```

- [ ] **Paso 3: Refactorizar construccion del summary en btnOpenOutlook**

Reemplazar lineas 8661-8690 (construccion de `summary` y asignacion a `confirmBody`) por:

```javascript
var dateStr = new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long'
});
var typeLabel = event.isTeams ? 'Teams' : 'Presencial';

var previewHtml = '<div class="confirm-preview-title">' + esc(event.title) + '</div>' +
  '<div class="confirm-preview-meta">' +
    '<span>' + dateStr + '</span><span>' + event.startTime + ' - ' + event.endTime + '</span>' +
    '<span>' + typeLabel + (event.location && !event.isTeams ? ' · ' + esc(event.location) : '') + '</span>' +
  '</div>' +
  '<div style="margin-top:8px;"><span class="confirm-preview-count">' + selected.length + '</span>' +
    '<span style="font-size:12px;color:var(--text-muted);margin-left:6px;">personas destinatarias</span></div>';

var attendeeListHtml = '<div class="confirm-attendee-list">';
var showCount = Math.min(5, selected.length);
for (var ai = 0; ai < showCount; ai++) attendeeListHtml += esc(selected[ai].Empleado) + '<br>';
if (selected.length > 5) attendeeListHtml += '<span class="confirm-attendee-more">y ' + (selected.length - 5) + ' mas</span>';
attendeeListHtml += '</div>';
if (isSeries) attendeeListHtml += '<div style="margin-top:6px;font-size:12px;color:var(--text-muted);">' + state.seriesDates.length + ' sesiones (serie)</div>';
previewHtml += attendeeListHtml;

document.getElementById('confirmPreview').innerHTML = previewHtml;

var alertsHtml = '';
if (selected.length > 50) alertsHtml += '<div class="confirm-alert-card"><span class="confirm-alert-icon">&#9888;</span><span>Se copiaran los emails al portapapeles (&gt;50 personas destinatarias)</span></div>';
var conflicts = detectConflicts(emails, event.date, event.startTime, event.endTime);
if (conflicts.length > 0) alertsHtml += '<div class="confirm-alert-card"><span class="confirm-alert-icon">&#9888;</span><span>' + buildConflictWarningHtml(conflicts) + '</span></div>';
var fundaeCheck = checkFundaeReadiness(event.title);
if (fundaeCheck.found && fundaeCheck.warnings.length > 0) alertsHtml += '<div class="confirm-alert-card"><span class="confirm-alert-icon">&#8505;</span><span>' + buildFundaeWarningHtml(fundaeCheck.warnings) + '</span></div>';
document.getElementById('confirmAlerts').innerHTML = alertsHtml;
document.getElementById('confirmDialog').classList.add('visible');
```

- [ ] **Paso 4: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.3): dialogo preview + confirmacion fusionado

Preview con titulo, fecha, tipo, chip de conteo, lista truncada.
Alertas como cards. Borde superior accent, animacion de entrada."
```

---

### Task F2.4: Barra de progreso en cola

**Lane:** G (Cola + progreso)

**Files:**
- Modify: `convocatoria.html:~1480` (CSS — `.queue-progress`)
- Modify: `convocatoria.html:3112-3124` (HTML — insertar barra en `#queueBar`)
- Modify: `convocatoria.html:8822-8900` (JS — actualizar barra en `launchNext()`)

- [ ] **Paso 1: Anadir CSS**

Insertar antes de `/* --- Cuadro de Mando --- */`:

```css
/* --- Barra de progreso cola --- */
.queue-progress { height: 4px; background: var(--border); border-radius: 2px; margin-bottom: 8px; overflow: hidden; }
.queue-progress-fill { height: 100%; background: var(--accent); border-radius: 2px; width: 0%; transition: width 0.3s ease-out; }
.queue-status-text { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
.queue-item-done { opacity: 0.5; position: relative; }
.queue-item-done::after { content: '\2713'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; }
.queue-item-failed { opacity: 0.5; border-color: var(--danger) !important; }
.queue-item-failed::after { content: '\2717'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--danger); font-size: 14px; }
```

- [ ] **Paso 2: Insertar barra en HTML de queueBar**

Despues de la linea de controles (linea ~3122, antes de `<div id="queueList"`):

```html
<div class="queue-progress" id="queueProgress" style="display:none;">
  <div class="queue-progress-fill" id="queueProgressFill"></div>
</div>
<div class="queue-status-text" id="queueStatusText" style="display:none;"></div>
```

- [ ] **Paso 3: Actualizar launchNext() con progreso**

Al inicio de `launchNext()` (linea 8828), antes del check `if (index >= state.queue.length)`:

```javascript
var progressFill = document.getElementById('queueProgressFill');
var statusText = document.getElementById('queueStatusText');
document.getElementById('queueProgress').style.display = '';
statusText.style.display = '';
progressFill.style.width = Math.round((index / total) * 100) + '%';
statusText.textContent = 'Procesando ' + (index + 1) + ' de ' + total + '...';
```

Al inicio del listener `btnLaunchQueue` (linea 8822, tras `let index = 0;`):

```javascript
document.getElementById('queueProgress').style.display = '';
document.getElementById('queueStatusText').style.display = '';
document.getElementById('queueProgressFill').style.width = '0%';
```

Donde la cola se completa (lineas 8831-8835 y 8892-8895), anadir:

```javascript
document.getElementById('queueProgressFill').style.width = '100%';
document.getElementById('queueStatusText').textContent = total + ' convocatorias procesadas';
setTimeout(function() {
  document.getElementById('queueProgress').style.display = 'none';
  document.getElementById('queueStatusText').style.display = 'none';
}, 3000);
```

- [ ] **Paso 4: Marcar items procesados**

Tras abrir el deep link en `launchNext()` (~linea 8850), anadir:

```javascript
var queueItems = document.querySelectorAll('#queueList > div');
if (queueItems[index - 1]) {
  queueItems[index - 1].classList.add('queue-item-done');
  queueItems[index - 1].style.position = 'relative';
}
```

- [ ] **Paso 5: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.4): barra de progreso en cola con tracking

Barra proporcional, texto de estado, items atenuados al procesarse."
```

---

### Task F2.5: Resumen post-envio accionable

**Lane:** F (Dialogos + envio)

**Files:**
- Modify: `convocatoria.html:~1480` (CSS — `.post-send-*`)
- Modify: `convocatoria.html:~3832` (HTML — nuevo dialogo `#postSendDialog`)
- Modify: `convocatoria.html:8695-8714` (JS — invocar resumen tras doSend)

- [ ] **Paso 1: Anadir CSS**

```css
/* --- Resumen post-envio --- */
.post-send-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.post-send-check { width: 40px; height: 40px; flex-shrink: 0; }
.post-send-check circle { fill: var(--accent-light); }
.post-send-check polyline {
  fill: none; stroke: var(--accent); stroke-width: 2.5;
  stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 24; stroke-dashoffset: 24;
  animation: postSendDraw 0.5s ease-out 0.2s forwards;
}
@keyframes postSendDraw { to { stroke-dashoffset: 0; } }
.post-send-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.post-send-details { font-size: 12px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; padding-left: 52px; }
.post-send-detail-item { display: flex; align-items: center; gap: 6px; }
.post-send-detail-label { color: var(--text-muted); min-width: 80px; }
```

- [ ] **Paso 2: Insertar HTML del dialogo**

Despues del cierre de `#confirmDialog` (linea ~3832):

```html
<div class="dialog-overlay" id="postSendDialog" role="dialog" aria-modal="true">
  <div class="dialog-box" style="max-width:460px; text-align:left;">
    <div id="postSendContent"></div>
    <div class="dialog-buttons">
      <button class="btn btn-secondary" id="postSendClose">Cerrar</button>
      <button class="btn btn-primary" id="postSendNext">Preparar siguiente</button>
    </div>
  </div>
</div>
```

- [ ] **Paso 3: Crear funcion showPostSendSummary()**

Insertar despues de `syncConvocatoriaWithAccion` (~linea 8544):

```javascript
function showPostSendSummary(event, attendeeCount, emails) {
  var content = document.getElementById('postSendContent');
  var html = '<div class="post-send-header">' +
    '<svg class="post-send-check" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/><polyline points="12,20 18,26 28,14"/></svg>' +
    '<div class="post-send-title">Convocatoria enviada</div></div>' +
    '<div class="post-send-details">' +
      '<div class="post-send-detail-item"><span class="post-send-detail-label">Titulo</span><span>' + esc(event.title) + '</span></div>' +
      '<div class="post-send-detail-item"><span class="post-send-detail-label">Fecha</span><span>' + esc(event.date) + '</span></div>' +
      '<div class="post-send-detail-item"><span class="post-send-detail-label">Destinatarios</span><span>' + attendeeCount + ' personas</span></div>';

  var fundaeCheck = checkFundaeReadiness(event.title);
  if (fundaeCheck.found) {
    var accion = getCatalog('acciones').find(function(a) { return (a.nombre||'').trim().toLowerCase() === event.title.trim().toLowerCase(); });
    if (accion && accion.fechaInicio) {
      var deadline = new Date(accion.fechaInicio);
      deadline.setDate(deadline.getDate() - 2);
      html += '<div class="post-send-detail-item"><span class="post-send-detail-label">Plazo FUNDAE</span><span>Comunica inicio antes del ' +
        deadline.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + '</span></div>';
    }
  }
  if (document.getElementById('surveyCheck').checked) {
    html += '<div class="post-send-detail-item"><span class="post-send-detail-label">Encuesta</span><span>Programada</span></div>';
  }
  html += '</div>';
  content.innerHTML = html;

  document.getElementById('postSendDialog').classList.add('visible');
  document.getElementById('postSendClose').onclick = function() { document.getElementById('postSendDialog').classList.remove('visible'); };
  document.getElementById('postSendNext').onclick = function() {
    document.getElementById('postSendDialog').classList.remove('visible');
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventFormador').value = '';
    document.getElementById('eventBody').value = '';
    state.excludedNIFs = new Set();
    renderTable();
  };
}
```

- [ ] **Paso 4: Invocar tras doSend()**

Al final de `doSend()` (tras `syncConvocatoriaWithAccion`):

```javascript
showPostSendSummary(event, selected.length, emails);
```

- [ ] **Paso 5: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.5): resumen post-envio accionable

Check SVG animado, datos de convocatoria, plazo FUNDAE, boton preparar siguiente."
```

---

### Task F2.6: Errores contextuales en formulario

**Lane:** F (Dialogos + envio)

**Files:**
- Modify: `convocatoria.html:~1160` (CSS — `.input-field.error`, `.field-error`)
- Modify: `convocatoria.html:8639-8651` (JS — refactorizar `validateEvent()`)

- [ ] **Paso 1: Anadir CSS**

Despues de la regla `.input-field` existente (~linea 1160):

```css
.input-field.error { border-color: var(--danger); }
.field-error { display: block; font-size: 11px; color: var(--danger); margin-top: 2px; }
```

- [ ] **Paso 2: Refactorizar validateEvent()**

Reemplazar lineas 8639-8651:

```javascript
function validateEvent() {
  var event = getCurrentEvent();
  var valid = true;
  document.querySelectorAll('.field-error').forEach(function(el) { el.remove(); });
  document.querySelectorAll('.input-field.error').forEach(function(el) { el.classList.remove('error'); });

  var requiredFields = [
    { id: 'eventTitle', label: 'Titulo es obligatorio', value: event.title },
    { id: 'eventDate', label: 'Fecha es obligatoria', value: event.date }
  ];
  var firstError = null;
  requiredFields.forEach(function(f) {
    if (!f.value) {
      valid = false;
      var el = document.getElementById(f.id);
      el.classList.add('error');
      var hint = document.createElement('span');
      hint.className = 'field-error';
      hint.textContent = f.label;
      el.parentNode.appendChild(hint);
      if (!firstError) firstError = el;
    }
  });
  if (event.startTime && event.endTime && event.startTime >= event.endTime) {
    valid = false;
    var endEl = document.getElementById('eventEnd');
    endEl.classList.add('error');
    var hint = document.createElement('span');
    hint.className = 'field-error';
    hint.textContent = 'Hora fin debe ser posterior a hora inicio';
    endEl.parentNode.appendChild(hint);
    if (!firstError) firstError = endEl;
  }
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Completa los campos obligatorios', 'warning', 3000);
  }
  return valid;
}
```

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.6): errores contextuales en formulario de evento

Errores inline bajo cada campo, scroll al primer error, validacion hora."
```

---

### Task F2.7: Diagnostico accionable errores Excel

**Lane:** E (UX Convocatoria)

**Files:**
- Modify: `convocatoria.html:6499-6547` (JS — refactorizar `parseOrgSheet()`)
- Modify: `convocatoria.html:7418-7421` (JS — dialogo para errores criticos)

- [ ] **Paso 1: Refactorizar parseOrgSheet() con tipos de error**

Reemplazar `parseOrgSheet()` (lineas 6499-6547). Cada error ahora es un objeto `{ type, title, detail, suggestion }`:

```javascript
function parseOrgSheet(workbook) {
  var errors = [];

  var sheetName = workbook.SheetNames.find(function(n) { return n === 'ORGANIGRAMA'; });
  if (!sheetName) {
    sheetName = workbook.SheetNames.find(function(n) { return n.toLowerCase() === 'organigrama'; });
  }
  if (!sheetName && workbook.SheetNames.length === 1) {
    sheetName = workbook.SheetNames[0];
  }
  if (!sheetName) {
    errors.push({ type: 'sheet-not-found', title: 'Hoja no encontrada',
      detail: 'No se encontro la hoja ORGANIGRAMA. Hojas disponibles: ' + workbook.SheetNames.join(', ') + '.',
      suggestion: 'Renombra la hoja a "ORGANIGRAMA" o usa un archivo con una sola hoja.' });
    return { employees: [], errors: errors };
  }

  var sheet = workbook.Sheets[sheetName];
  var rows = XLSX_sheetToJSON(sheet);
  if (rows.length === 0) {
    errors.push({ type: 'empty-sheet', title: 'Hoja vacia',
      detail: 'La hoja "' + sheetName + '" no contiene datos.',
      suggestion: 'Verifica que los datos empiezan en la fila 1 con cabeceras.' });
    return { employees: [], errors: errors };
  }

  var headers = Object.keys(rows[0]);
  var missing = RELEVANT_COLUMNS.filter(function(c) { return !headers.includes(c); });
  if (missing.length > 0) {
    errors.push({ type: 'missing-columns', title: 'Columnas parciales',
      detail: 'Se encontraron ' + (RELEVANT_COLUMNS.length - missing.length) + ' de ' + RELEVANT_COLUMNS.length + '. Faltan: ' + missing.join(', ') + '.',
      suggestion: 'Los datos se cargaran parcialmente.' });
  }

  var employees = rows
    .filter(function(row) { var ab = row['Alta/Baja']; return ab === 1 || ab === '1'; })
    .map(function(row, idx) {
      var emp = {};
      RELEVANT_COLUMNS.forEach(function(col) { emp[col] = row[col] != null ? String(row[col]).trim() : ''; });
      FUNDAE_COLUMNS.forEach(function(col) { if (row[col] != null) emp['_f_' + col] = String(row[col]).trim(); });
      emp._id = String(idx);
      FILTER_KEYS.forEach(function(col) { emp[col] = emp[col].replace(/\s+/g, ' ').trim(); });
      return emp;
    });

  if (employees.length === 0) {
    errors.push({ type: 'no-active', title: 'Sin personas activas',
      detail: 'No hay registros con Alta/Baja = 1.',
      suggestion: 'Verifica que la columna "Alta/Baja" contiene 1 para personas en activo.' });
  }
  return { employees: employees, errors: errors };
}
```

- [ ] **Paso 2: Crear funcion showExcelErrorDialog()**

Insertar despues de `parseOrgSheet`:

```javascript
function showExcelErrorDialog(errors) {
  var critical = errors.find(function(e) { return e.type === 'sheet-not-found' || e.type === 'empty-sheet'; });
  if (!critical && errors.length === 0) return false;

  if (critical) {
    var overlay = document.createElement('div');
    overlay.className = 'dialog-overlay visible';
    overlay.innerHTML = '<div class="dialog-box" style="max-width:460px; text-align:left;">' +
      '<h3 style="margin:0 0 12px; font-size:15px; font-weight:600; color:var(--danger);">' + esc(critical.title) + '</h3>' +
      '<p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:8px;">' + esc(critical.detail) + '</p>' +
      '<p style="font-size:12px; color:var(--text-muted); line-height:1.5;">' + esc(critical.suggestion) + '</p>' +
      '<details style="margin-top:12px; font-size:12px; color:var(--text-muted);"><summary style="cursor:pointer;">Ver columnas esperadas</summary>' +
        '<div style="margin-top:6px; font-family:monospace; font-size:11px; line-height:1.8;">' +
        RELEVANT_COLUMNS.map(function(c) { return esc(c); }).join('<br>') + '</div></details>' +
      '<div class="dialog-buttons" style="margin-top:16px;"><button class="btn btn-primary" id="excelErrorClose">Cerrar</button></div></div>';
    document.body.appendChild(overlay);
    document.getElementById('excelErrorClose').addEventListener('click', function() { overlay.remove(); });
    return true;
  }
  errors.forEach(function(err) { showToast(err.title + ': ' + err.detail, 'warning', 8000); });
  return false;
}
```

- [ ] **Paso 3: Actualizar handleFile()**

Reemplazar lineas 7418-7421:

```javascript
if (result.errors.length > 0) {
  var blocked = showExcelErrorDialog(result.errors);
  if (blocked) return;
}
```

- [ ] **Paso 4: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.7): diagnostico accionable errores Excel

Errores clasificados con titulo, detalle y sugerencia.
Dialogo para criticos, toasts para advertencias."
```

---

### Task F2.8: Skeleton screen para tabla

**Lane:** E (UX Convocatoria)

**Files:**
- Modify: `convocatoria.html:~1480` (CSS — `.table-skeleton`)
- Modify: `convocatoria.html:3129-3144` (HTML — insertar skeleton en `#tableWrap`)
- Modify: `convocatoria.html:7404-7415` (JS — mostrar/ocultar skeleton)

- [ ] **Paso 1: Anadir CSS**

Insertar antes de `/* --- Cuadro de Mando --- */`:

```css
/* --- Skeleton tabla --- */
.table-skeleton { padding: 12px 28px; }
.table-skeleton-row { display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.table-skeleton-cell {
  height: 14px; border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--bg-input) 25%, var(--border) 50%, var(--bg-input) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

- [ ] **Paso 2: Insertar skeleton HTML**

Despues de `<div class="empty-state" id="emptyState"></div>` (linea 3131):

```html
<div class="table-skeleton" id="tableSkeleton" style="display:none;">
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:25%;"></div><div class="table-skeleton-cell" style="width:25%;"></div><div class="table-skeleton-cell" style="width:20%;"></div><div class="table-skeleton-cell" style="width:30%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:22%;"></div><div class="table-skeleton-cell" style="width:28%;"></div><div class="table-skeleton-cell" style="width:18%;"></div><div class="table-skeleton-cell" style="width:32%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:27%;"></div><div class="table-skeleton-cell" style="width:23%;"></div><div class="table-skeleton-cell" style="width:22%;"></div><div class="table-skeleton-cell" style="width:28%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:24%;"></div><div class="table-skeleton-cell" style="width:26%;"></div><div class="table-skeleton-cell" style="width:20%;"></div><div class="table-skeleton-cell" style="width:30%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:26%;"></div><div class="table-skeleton-cell" style="width:24%;"></div><div class="table-skeleton-cell" style="width:19%;"></div><div class="table-skeleton-cell" style="width:31%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:23%;"></div><div class="table-skeleton-cell" style="width:27%;"></div><div class="table-skeleton-cell" style="width:21%;"></div><div class="table-skeleton-cell" style="width:29%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:25%;"></div><div class="table-skeleton-cell" style="width:25%;"></div><div class="table-skeleton-cell" style="width:20%;"></div><div class="table-skeleton-cell" style="width:30%;"></div></div>
  <div class="table-skeleton-row"><div class="table-skeleton-cell" style="width:30px;"></div><div class="table-skeleton-cell" style="width:28%;"></div><div class="table-skeleton-cell" style="width:22%;"></div><div class="table-skeleton-cell" style="width:20%;"></div><div class="table-skeleton-cell" style="width:30%;"></div></div>
</div>
```

- [ ] **Paso 3: Mostrar/ocultar en handleFile()**

Tras `uploadZone.classList.add('loading');` (linea ~7405):

```javascript
document.getElementById('tableSkeleton').style.display = '';
document.getElementById('attendeeTable').style.display = 'none';
document.getElementById('emptyState').style.display = 'none';
```

Tras `uploadZone.classList.remove('loading');` (linea ~7415):

```javascript
document.getElementById('tableSkeleton').style.display = 'none';
```

- [ ] **Paso 4: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.8): skeleton screen para tabla

8 filas skeleton con shimmer reutilizado del dashboard."
```

---

### Task F2.9: Modo compacto acciones (details/summary)

**Lane:** H (Catalogos)

**Files:**
- Modify: `convocatoria.html:~1480` (CSS — `.catalog-details`)
- Modify: `convocatoria.html:5091-5370` (JS — refactorizar `getCatalogFormHtml()` para acciones)

- [ ] **Paso 1: Anadir CSS**

```css
/* --- Modo compacto catalogo --- */
.catalog-details { border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 10px; overflow: hidden; }
.catalog-details summary {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-primary);
  cursor: pointer; user-select: none; list-style: none;
  background: var(--bg-input); transition: background var(--transition);
}
.catalog-details summary::-webkit-details-marker { display: none; }
.catalog-details summary:hover { background: var(--accent-subtle); }
.catalog-details summary::after { content: '\25B6'; font-size: 9px; color: var(--text-muted); transition: transform var(--transition); }
.catalog-details[open] summary::after { transform: rotate(90deg); }
.catalog-details-body { padding: 10px 12px; }
.catalog-details-pending { font-size: 11px; font-weight: 400; color: var(--text-muted); }
```

- [ ] **Paso 2: Modificar getCatalogFormHtml() para acciones**

Localizar el bloque `if (key === 'acciones')` en `getCatalogFormHtml()` (~linea 5200). Envolver los campos en tres `<details class="catalog-details">`:

**Seccion 1 — "Datos basicos" (`open`):** codigo, nombre, tipo, modalidad, estado, fechaInicio, fechaFin, horasPresenciales, horasTeleformacion, proveedor, centro, tutor.

**Seccion 2 — "Participantes y sesiones":** tabla de participantes, asistencia (renderAsistenciaHtml).

**Seccion 3 — "Datos FUNDAE":** areaProfesional, nivelFormacion, tipoConvocatoria, objetivos, contenidos, instrucciones.

Cada `<summary>` muestra pendientes:

```javascript
var pendingBasic = 0;
if (!record.nombre) pendingBasic++;
if (!record.fechaInicio) pendingBasic++;
if (!record.fechaFin) pendingBasic++;
var pendingBasicText = pendingBasic > 0 ? ' <span class="catalog-details-pending">' + pendingBasic + ' pendiente' + (pendingBasic > 1 ? 's' : '') + '</span>' : '';

var pendingFundae = 0;
if (!record.areaProfesional) pendingFundae++;
if (!record.nivelFormacion) pendingFundae++;
if (!record.tipoConvocatoria) pendingFundae++;
var pendingFundaeText = pendingFundae > 0 ? ' <span class="catalog-details-pending">' + pendingFundae + ' pendiente' + (pendingFundae > 1 ? 's' : '') + '</span>' : '';

body = '<details class="catalog-details" open><summary>Datos basicos' + pendingBasicText + '</summary><div class="catalog-details-body">' +
  /* campos basicos */ +
'</div></details>' +
'<details class="catalog-details"><summary>Participantes y sesiones</summary><div class="catalog-details-body">' +
  /* participantes + asistencia */ +
'</div></details>' +
'<details class="catalog-details"><summary>Datos FUNDAE' + pendingFundaeText + '</summary><div class="catalog-details-body">' +
  /* campos FUNDAE */ +
'</div></details>';
```

**Nota:** El implementador debe leer `getCatalogFormHtml()` para acciones completo (lineas ~5200-5370), identificar los campos, y redistribuirlos. Los campos concretos varian segun el estado actual del codigo.

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.9): modo compacto acciones con details/summary

3 secciones colapsables. Pendientes en --text-muted en summary."
```

---

### Task F2.10: Tracking formacion obligatoria con caducidades

**Lane:** I (Compliance)

**Files:**
- Modify: `convocatoria.html:~1480` (CSS — `.compliance-*`)
- Modify: `convocatoria.html:3168-3210` (HTML — anadir sub-pestana en Catalogos)
- Modify: `convocatoria.html:6682-6692` (JS state — `complianceTypes`, `complianceRecords`)
- Modify: `convocatoria.html:~4890` (JS — renderComplianceView)

- [ ] **Paso 1: Anadir CSS**

```css
/* --- Tracking formacion obligatoria --- */
.compliance-table { width: 100%; font-size: 12px; border-collapse: collapse; }
.compliance-table th { text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); }
.compliance-table td { padding: 6px 10px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
.compliance-expired { color: var(--danger); font-weight: 600; }
.compliance-summary { padding: 12px 16px; font-size: 13px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.compliance-type-card { padding: 10px 16px; border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
.compliance-type-name { font-weight: 600; font-size: 13px; color: var(--text-primary); }
.compliance-type-meta { font-size: 11px; color: var(--text-muted); }
```

- [ ] **Paso 2: Ampliar state**

En `const state = {` (linea 6682), anadir:

```javascript
complianceTypes: [],
complianceRecords: {},
```

- [ ] **Paso 3: Funciones de persistencia**

Despues de `loadQueue()` (~linea 6703):

```javascript
function saveCompliance() {
  try {
    localStorage.setItem('convocatoria_compliance_types', JSON.stringify(state.complianceTypes));
    localStorage.setItem('convocatoria_compliance_records', JSON.stringify(state.complianceRecords));
  } catch(e) { showToast('Error al guardar compliance', 'error'); }
}
function loadCompliance() {
  try {
    state.complianceTypes = JSON.parse(localStorage.getItem('convocatoria_compliance_types') || '[]');
    state.complianceRecords = JSON.parse(localStorage.getItem('convocatoria_compliance_records') || '{}');
  } catch(e) { state.complianceTypes = []; state.complianceRecords = {}; }
}
```

- [ ] **Paso 4: Anadir sub-pestana HTML**

Despues de `<button class="catalog-tab" data-catalog="acciones">Acciones</button>` (linea 3176):

```html
<button class="catalog-tab" data-catalog="compliance">Formacion obligatoria</button>
```

- [ ] **Paso 5: Crear renderComplianceView()**

Insertar tras `renderCatalogForm()` (~linea 4954). Funcion completa que:
1. Muestra tipos de formacion obligatoria en panel izquierdo (con formulario para anadir nuevos)
2. Muestra matriz persona-tipo en panel derecho (fechas vencidas en `--danger`)
3. Boton "Importar registros" para carga masiva futura

```javascript
function renderComplianceView() {
  var panel = document.getElementById('catalogFormPanel');
  var listPanel = document.getElementById('catalogListPanel');

  // Types in left panel
  var typesHtml = '<div style="padding:12px 16px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Tipos de formacion obligatoria</div>';
  if (state.complianceTypes.length === 0) {
    typesHtml += '<div style="font-size:12px;color:var(--text-muted);padding:8px 0;">Sin tipos definidos. Anade PRL, LOPD, Acoso, etc.</div>';
  } else {
    state.complianceTypes.forEach(function(ct) {
      typesHtml += '<div class="compliance-type-card" data-type-id="' + esc(ct.id) + '"><div>' +
        '<div class="compliance-type-name">' + esc(ct.name) + '</div>' +
        '<div class="compliance-type-meta">Cada ' + ct.periodMonths + ' meses</div></div>' +
        '<button class="link-btn link-clear" data-delete-type="' + esc(ct.id) + '" style="font-size:11px;">&times;</button></div>';
    });
  }
  typesHtml += '<div style="margin-top:8px;display:flex;gap:6px;">' +
    '<input class="input-field" id="complianceNewName" placeholder="Nombre (ej: PRL General)" style="font-size:12px;flex:1;">' +
    '<input class="input-field" id="complianceNewPeriod" type="number" placeholder="Meses" style="font-size:12px;width:70px;" min="1" value="12">' +
    '<button class="btn btn-primary" id="btnAddComplianceType" style="font-size:11px;">Anadir</button></div></div>';
  listPanel.innerHTML = typesHtml;

  // Bind add/delete
  document.getElementById('btnAddComplianceType').addEventListener('click', function() {
    var name = document.getElementById('complianceNewName').value.trim();
    var period = parseInt(document.getElementById('complianceNewPeriod').value) || 12;
    if (!name) { showToast('Introduce un nombre', 'warning'); return; }
    state.complianceTypes.push({ id: 'ct_' + Date.now(), name: name, periodMonths: period, scope: 'all', scopeValues: [] });
    saveCompliance(); renderComplianceView();
  });
  listPanel.querySelectorAll('[data-delete-type]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      state.complianceTypes = state.complianceTypes.filter(function(ct) { return ct.id !== btn.dataset.deleteType; });
      saveCompliance(); renderComplianceView();
    });
  });

  // Matrix in right panel
  if (state.complianceTypes.length === 0 || !state.employees || state.employees.length === 0) {
    panel.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px;text-align:center;padding:20px;">' +
      (state.employees.length === 0 ? 'Carga el censo para ver la matriz de compliance.' : 'Define tipos en el panel izquierdo.') + '</div>';
    return;
  }

  var today = new Date();
  var totalExpired = 0;
  var tableHtml = '<table class="compliance-table"><thead><tr><th>Persona</th>';
  state.complianceTypes.forEach(function(ct) { tableHtml += '<th>' + esc(ct.name) + '</th>'; });
  tableHtml += '</tr></thead><tbody>';

  state.employees.slice(0, 100).forEach(function(emp) {
    tableHtml += '<tr><td style="font-weight:500;color:var(--text-primary);">' + esc(emp.Empleado) + '</td>';
    state.complianceTypes.forEach(function(ct) {
      var record = (state.complianceRecords[emp.NIF] || {})[ct.id];
      if (!record || !record.lastDate) {
        tableHtml += '<td style="color:var(--text-muted);">Sin registro</td>';
      } else {
        var expiry = new Date(record.lastDate);
        expiry.setMonth(expiry.getMonth() + ct.periodMonths);
        var isExpired = expiry < today;
        if (isExpired) totalExpired++;
        tableHtml += '<td' + (isExpired ? ' class="compliance-expired"' : '') + '>' +
          expiry.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' }) + '</td>';
      }
    });
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';

  var summaryHtml = '<div class="compliance-summary">' + state.employees.length + ' personas trabajadoras';
  if (totalExpired > 0) summaryHtml += ' · <span style="color:var(--danger);font-weight:600;">' + totalExpired + ' caducadas</span>';
  summaryHtml += '</div>';

  panel.innerHTML = summaryHtml + '<div style="padding:12px 16px;overflow-y:auto;max-height:calc(100vh - 200px);">' + tableHtml + '</div>';
}
```

- [ ] **Paso 6: Vincular sub-pestana**

En el listener de sub-tabs (~linea 4890), detectar `data-catalog="compliance"`:

```javascript
if (btn.dataset.catalog === 'compliance') {
  loadCompliance();
  document.getElementById('catalogListViewContainer').style.display = 'none';
  renderComplianceView();
  return;
}
```

- [ ] **Paso 7: Cargar compliance al iniciar**

Junto a `loadQueue();`, anadir `loadCompliance();`.

- [ ] **Paso 8: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.10): tracking formacion obligatoria con caducidades

Sub-pestana en Catalogos con tipos personalizables,
matriz persona-formacion, fechas vencidas en --danger."
```

---

### Task F2.11: Gestion comunicacion RLT

**Lane:** I (Compliance)

**Files:**
- Modify: `convocatoria.html:5091-5370` (JS — campos RLT en ficha de accion)
- Modify: `convocatoria.html:5373` (JS — bindCatalogFormEvents para RLT)
- Modify: `convocatoria.html:~6664` (JS — helper calculateBusinessDays)

- [ ] **Paso 1: Crear calculateBusinessDays()**

Despues de `esc()` (linea ~6664):

```javascript
function calculateBusinessDays(startDate, days) {
  var date = new Date(startDate);
  var added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added++;
  }
  return date;
}
```

- [ ] **Paso 2: Crear generateRLTDocument()**

```javascript
function generateRLTDocument(selectedActions) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Comunicacion RLT</title>' +
    '<style>body{font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.6;max-width:800px;margin:40px auto;padding:0 20px;color:#0f172a;}' +
    'h1{font-size:16px;text-align:center;margin-bottom:24px;border-bottom:3px solid #4F46E5;padding-bottom:12px;}' +
    'table{width:100%;border-collapse:collapse;margin:16px 0;}th,td{padding:6px 10px;border:1px solid #e2e8f0;text-align:left;font-size:12px;}' +
    'th{background:#f1f5f9;font-weight:600;}.footer{margin-top:40px;font-size:12px;color:#475569;}</style></head><body>' +
    '<h1>COMUNICACION A LA REPRESENTACION LEGAL DE LOS TRABAJADORES</h1>' +
    '<p>En cumplimiento de la legislacion vigente, se comunica el plan de acciones formativas previstas:</p>' +
    '<table><thead><tr><th>Accion</th><th>Modalidad</th><th>Horas</th><th>Fechas</th><th>Destinatarios</th></tr></thead><tbody>';
  selectedActions.forEach(function(a) {
    html += '<tr><td>' + esc(a.nombre||'') + '</td><td>' + esc(a.modalidad||'') + '</td><td>' +
      (a.horasPresenciales||0) + 'h</td><td>' + esc(a.fechaInicio||'') + ' - ' + esc(a.fechaFin||'') +
      '</td><td>' + (a.participantes||[]).length + '</td></tr>';
  });
  html += '</tbody></table><div class="footer"><p>Fecha: ' +
    new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }) +
    '</p><p style="margin-top:40px;">Fdo. _________________________</p></div></body></html>';
  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}
```

- [ ] **Paso 3: Anadir campos RLT en getCatalogFormHtml()**

En la seccion de acciones de `getCatalogFormHtml()`, despues de los campos basicos (dentro de la seccion "Datos basicos" si F2.9 ya esta implementado):

```javascript
var rltStatus = record.rlt ? record.rlt.status || 'Pendiente' : 'Pendiente';
var rltSentDate = record.rlt ? record.rlt.sentDate || '' : '';
var rltDeadline = record.rlt ? record.rlt.deadline || '' : '';

body += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">' +
  '<div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">Comunicacion RLT</div>' +
  '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">' +
    '<span style="font-size:12px;color:var(--text-muted);">Estado:</span>' +
    '<span style="font-size:12px;color:var(--text-secondary);">' + esc(rltStatus) + '</span></div>' +
  field('Fecha envio RLT', 'rltSentDate', esc(rltSentDate), { type: 'date' }) +
  (rltDeadline ? '<div style="font-size:11px;color:var(--text-muted);">Plazo respuesta: ' + esc(rltDeadline) + '</div>' : '') +
  '<button class="btn btn-secondary" id="btnGenerateRLT" style="font-size:11px;margin-top:6px;">Generar comunicacion RLT</button></div>';
```

- [ ] **Paso 4: Vincular eventos en bindCatalogFormEvents()**

Al final del bloque para acciones:

```javascript
var btnRLT = document.getElementById('btnGenerateRLT');
if (btnRLT) {
  btnRLT.addEventListener('click', function() { generateRLTDocument([record]); });
}
var rltDateInput = document.getElementById('cf_rltSentDate');
if (rltDateInput) {
  rltDateInput.addEventListener('change', function() {
    if (!record.rlt) record.rlt = {};
    record.rlt.sentDate = rltDateInput.value;
    record.rlt.status = 'Enviada';
    if (rltDateInput.value) {
      var deadline = calculateBusinessDays(new Date(rltDateInput.value), 15);
      record.rlt.deadline = deadline.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
    }
    upsertCatalogRecord('acciones', 'codigo', record);
    renderCatalogForm();
    showToast('RLT registrada. Plazo: ' + record.rlt.deadline, 'info', 5000);
  });
}
```

- [ ] **Paso 5: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.11): gestion comunicacion RLT

Generacion automatica de documento, registro de envio,
calculo de plazo 15 dias habiles, estados."
```

---

### Task F2.12: Sync convocatoria-catalogo ampliada

**Lane:** J (Sync)

**Files:**
- Modify: `convocatoria.html:8490-8544` (JS — ampliar `syncConvocatoriaWithAccion()`)

- [ ] **Paso 1: Ampliar syncConvocatoriaWithAccion()**

Reemplazar la funcion (lineas 8490-8544). Cambios respecto a la version actual:
- Si no hay accion coincidente, mostrar toast informativo (no silencio)
- Copiar formador (match por nombre en catalogo de tutores) si la accion no tiene tutor
- Copiar ubicacion (match por nombre en catalogo de centros) si la accion no tiene centro
- Actualizar estado: "En preparacion" → "Convocada" (o "En marcha" si fecha ya pasada)
- Toast con resumen detallado de lo sincronizado

```javascript
function syncConvocatoriaWithAccion(event, emails) {
  var settings = loadSettings();
  if (settings.syncConvocatoriaAccion === false) return;

  var acciones = getCatalog('acciones');
  var titleNorm = (event.title || '').trim().toLowerCase();
  var accion = acciones.find(function(a) { return (a.nombre || '').trim().toLowerCase() === titleNorm; });

  if (!accion) {
    showToast('No se encontro accion "' + event.title + '" en el catalogo.', 'info', 5000);
    return;
  }

  var attendeeNIFs = [];
  if (state.employees && state.employees.length > 0) {
    var emailSet = {};
    emails.forEach(function(e) { emailSet[e] = true; });
    state.employees.forEach(function(emp) {
      if (emailSet[emp['Email trabajo']]) attendeeNIFs.push(emp.NIF);
    });
  }
  if (attendeeNIFs.length === 0) return;

  if (!accion.participantes) accion.participantes = [];
  var added = 0;
  attendeeNIFs.forEach(function(nif) {
    if (accion.participantes.indexOf(nif) === -1) { accion.participantes.push(nif); added++; }
  });

  if (event.date) {
    if (!accion.asistencia) accion.asistencia = { sesiones: [], registro: {} };
    if (!accion.asistencia.sesiones) accion.asistencia.sesiones = [];
    if (!accion.asistencia.registro) accion.asistencia.registro = {};
    if (accion.asistencia.sesiones.indexOf(event.date) === -1) {
      accion.asistencia.sesiones.push(event.date); accion.asistencia.sesiones.sort();
    }
    accion.participantes.forEach(function(nif) {
      if (!accion.asistencia.registro[nif]) accion.asistencia.registro[nif] = [];
      while (accion.asistencia.registro[nif].length < accion.asistencia.sesiones.length) accion.asistencia.registro[nif].push(false);
    });
  }

  // Copy formador
  if (!accion.tutorVinculado && event.formador) {
    var tutores = getCatalog('tutores');
    var matchTutor = tutores.find(function(t) {
      return [t.nombre, t.apellido1, t.apellido2].filter(Boolean).join(' ').toLowerCase() === event.formador.toLowerCase();
    });
    if (matchTutor) accion.tutorVinculado = matchTutor.documento;
  }

  // Copy location
  if (!accion.centroVinculado && event.location && !event.isTeams) {
    var centros = getCatalog('centros');
    var matchCentro = centros.find(function(c) { return (c.nombre||'').toLowerCase() === event.location.toLowerCase(); });
    if (matchCentro) accion.centroVinculado = matchCentro.documento;
  }

  // Update status
  if (accion.estado === 'En preparacion' || !accion.estado) {
    var today = new Date().toISOString().slice(0, 10);
    accion.estado = (accion.fechaInicio && accion.fechaInicio <= today) ? 'En marcha' : 'Convocada';
  }

  upsertCatalogRecord('acciones', 'codigo', accion);
  var parts = [];
  if (added > 0) parts.push(added + ' participantes');
  if (accion.tutorVinculado) parts.push('tutor');
  if (accion.centroVinculado) parts.push('centro');
  parts.push('estado: ' + accion.estado);
  showToast('Sync ' + accion.codigo + ': ' + parts.join(', '), 'info', 5000);
}
```

- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F2.12): sync convocatoria-catalogo ampliada

Copia tutor, centro y estado. Transicion a Convocada/En marcha."
```

---

## Resumen de Fase 2

| Tarea | Lane | Esfuerzo est. | Secciones principales |
|-------|------|---------------|----------------------|
| F2.1 Panel calidad datos | E | 5-6h | CSS ~1480, HTML 2977-3004, JS 6499-7480 |
| F2.2 Readiness FUNDAE | H | 4-5h | CSS ~1480, HTML 3228, JS 8546-9800 |
| F2.3 Dialogo preview | F | 4-5h | CSS ~1400, HTML 3823-3832, JS 8653-8690 |
| F2.4 Barra progreso cola | G | 3h | CSS ~1480, HTML 3112-3124, JS 8822-8900 |
| F2.5 Resumen post-envio | F | 3-4h | CSS ~1480, HTML ~3832, JS 8695-8714 |
| F2.6 Errores contextuales | F | 2-3h | CSS ~1160, JS 8639-8651 |
| F2.7 Diagnostico Excel | E | 2-3h | JS 6499-6547, 7418-7421 |
| F2.8 Skeleton tabla | E | 1-2h | CSS ~1480, HTML 3129-3144, JS 7404-7415 |
| F2.9 Modo compacto | H | 3h | CSS ~1480, JS 5091-5370 |
| F2.10 Formacion obligatoria | I | 8-10h | CSS ~2900, HTML 3168-3210, JS 4890-6692 |
| F2.11 Comunicacion RLT | I | 5-6h | JS 5091-6664 |
| F2.12 Sync ampliada | J | 2-3h | JS 8490-8544 |

**Total estimado Fase 2:** ~43-55h (7-10 dias)
**Total acumulado Partes 1+2:** ~66-86h

---

# Formación_AGORA — Overhaul UX Premium (Parte 3: Fases 3-4)

## Fase 3: Diferenciadores premium + reporting (10-14 dias)

**Objetivo:** Features que elevan la percepcion de calidad, extienden la coherencia a todas las pestanas, y anaden capacidades de reporting y documentacion automatica. Solo se implementan despues de que el core (Fases 0-2) este solido.

**Prerequisitos:** Fases 0, 1 y 2 completadas y mergeadas a main.

---

### Task F3.1: Paleta de comandos Cmd+K

**Files:**
- Modify: `convocatoria.html:1370-1430` (CSS — nuevas clases `.cmdk-*` junto a `.dialog-overlay`)
- Modify: `convocatoria.html:3823-3900` (HTML — nuevo overlay `#cmdkOverlay` junto a dialogos existentes)
- Modify: `convocatoria.html:3931-3952` (JS — tab navigation, reutilizar para Cmd+K)
- Modify: `convocatoria.html:~9135` (JS — zona de init, registrar listener global keydown)

**Contexto:** La app tiene 5 pestanas con funcionalidades dispersas. Cmd+K es el punto de acceso unificado. Sigue el patron de `.dialog-overlay` + `.dialog-box` ya existente (lineas 1370-1430). El fuzzy search se implementa sin dependencias externas.

- [ ] **Paso 1: Escribir CSS de la paleta de comandos**

Anadir despues de `.dialog-overlay.closing .dialog-box` (linea ~1421):

```css
/* ═══ Command Palette ═══ */
.cmdk-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1100;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
}
.cmdk-overlay.visible { display: flex; animation: overlayIn 0.2s ease-out; }
.cmdk-overlay.closing { animation: overlayOut 0.15s ease-in forwards; }
.cmdk-box {
  background: var(--bg-panel);
  border-radius: var(--radius);
  width: 90%;
  max-width: 520px;
  box-shadow: var(--shadow-lg);
  animation: dialogIn 0.25s ease-out;
  overflow: hidden;
}
.cmdk-overlay.closing .cmdk-box {
  animation: dialogOut 0.15s ease-in forwards;
}
.cmdk-input {
  width: 100%;
  padding: 16px 20px;
  border: none;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-body);
  font-size: 15px;
  background: var(--bg-panel);
  color: var(--text-primary);
  outline: none;
}
.cmdk-input::placeholder { color: var(--text-muted); }
.cmdk-results {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
}
.cmdk-group-label {
  padding: 8px 20px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cmdk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background var(--transition);
  font-size: 13px;
  color: var(--text-primary);
}
.cmdk-item:hover, .cmdk-item.active {
  background: var(--accent-subtle);
}
.cmdk-item-icon {
  width: 20px;
  text-align: center;
  color: var(--text-muted);
  flex-shrink: 0;
}
.cmdk-item-label { flex: 1; }
.cmdk-item-shortcut {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-body);
}
.cmdk-empty {
  padding: 24px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
```

- [ ] **Paso 2: Escribir HTML del overlay**

Anadir despues de `<div id="toastContainer">` (linea ~3696):

```html
<div class="cmdk-overlay" id="cmdkOverlay" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
  <div class="cmdk-box">
    <input class="cmdk-input" id="cmdkInput" type="text" placeholder="Buscar comando, pestana o accion..." autocomplete="off">
    <div class="cmdk-results" id="cmdkResults"></div>
  </div>
</div>
```

- [ ] **Paso 3: Implementar motor de busqueda fuzzy y catalogo de comandos**

Anadir en la zona JS, despues del bloque de tab navigation (~linea 3952):

```javascript
// ═══════════════════════════════════
// COMMAND PALETTE (Cmd+K)
// ═══════════════════════════════════
const CmdK = {
  overlay: null, input: null, results: null,
  activeIndex: -1,
  commands: [],

  init() {
    this.overlay = document.getElementById('cmdkOverlay');
    this.input = document.getElementById('cmdkInput');
    this.results = document.getElementById('cmdkResults');

    this.commands = [
      { group: 'Navegacion', label: 'Ir a Dashboard', icon: '\u2261', shortcut: 'Alt+1', action: () => document.querySelector('.tab-btn[data-tab="tabDashboard"]').click() },
      { group: 'Navegacion', label: 'Ir a Calendario', icon: '\uD83D\uDCC5', shortcut: 'Alt+2', action: () => document.querySelector('.tab-btn[data-tab="tabCalendario"]').click() },
      { group: 'Navegacion', label: 'Ir a Convocatoria', icon: '\u2709', shortcut: 'Alt+3', action: () => document.querySelector('.tab-btn[data-tab="tabConvocatoria"]').click() },
      { group: 'Navegacion', label: 'Ir a Catalogos', icon: '\uD83D\uDCCB', shortcut: 'Alt+4', action: () => document.querySelector('.tab-btn[data-tab="tabCatalogos"]').click() },
      { group: 'Navegacion', label: 'Ir a XML FUNDAE', icon: '\uD83D\uDCC4', shortcut: 'Alt+5', action: () => document.querySelector('.tab-btn[data-tab="tabXml"]').click() },
      { group: 'Herramientas', label: 'Abrir ajustes', icon: '\u2699', action: () => document.getElementById('settingsDialog').classList.add('visible') },
      { group: 'Herramientas', label: 'Ver historial', icon: '\uD83D\uDD52', action: () => document.getElementById('historyDialog')?.classList.add('visible') },
      { group: 'Convocatoria', label: 'Limpiar filtros', icon: '\u2715', action: () => { document.querySelectorAll('.filter-select').forEach(s => { s.value = ''; }); renderFilters(); renderTable(); } },
      { group: 'Convocatoria', label: 'Enviar convocatoria', icon: '\u2709', shortcut: 'Ctrl+Enter', action: () => document.getElementById('btnOpenOutlook').click() },
    ];

    this.input.addEventListener('input', () => this.render());
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
  },

  open() {
    this.overlay.classList.remove('closing');
    this.overlay.classList.add('visible');
    this.input.value = '';
    this.activeIndex = -1;
    this.render();
    requestAnimationFrame(() => this.input.focus());
  },

  close() {
    this.overlay.classList.add('closing');
    setTimeout(() => { this.overlay.classList.remove('visible', 'closing'); }, 150);
  },

  fuzzyMatch(query, text) {
    var q = query.toLowerCase();
    var t = text.toLowerCase();
    if (!q) return true;
    var qi = 0;
    for (var ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) qi++;
    }
    return qi === q.length;
  },

  render() {
    var query = this.input.value.trim();
    var filtered = this.commands.filter(c => this.fuzzyMatch(query, c.label) || this.fuzzyMatch(query, c.group));
    this.results.textContent = '';
    this.activeIndex = -1;

    if (filtered.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = 'Sin resultados para "' + query + '"';
      this.results.appendChild(empty);
      return;
    }

    var groups = {};
    filtered.forEach(function(c) {
      if (!groups[c.group]) groups[c.group] = [];
      groups[c.group].push(c);
    });

    var self = this;
    var itemIndex = 0;
    Object.keys(groups).forEach(function(groupName) {
      var label = document.createElement('div');
      label.className = 'cmdk-group-label';
      label.textContent = groupName;
      self.results.appendChild(label);

      groups[groupName].forEach(function(cmd) {
        var item = document.createElement('div');
        item.className = 'cmdk-item';
        item.dataset.index = itemIndex++;
        item.innerHTML = '<span class="cmdk-item-icon">' + cmd.icon + '</span>'
          + '<span class="cmdk-item-label">' + cmd.label + '</span>'
          + (cmd.shortcut ? '<span class="cmdk-item-shortcut">' + cmd.shortcut + '</span>' : '');
        item.addEventListener('click', function() { self.execute(cmd); });
        self.results.appendChild(item);
      });
    });
  },

  handleKeydown(e) {
    var items = this.results.querySelectorAll('.cmdk-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1); this.highlightActive(items); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.activeIndex = Math.max(this.activeIndex - 1, 0); this.highlightActive(items); }
    else if (e.key === 'Enter' && this.activeIndex >= 0) { e.preventDefault(); items[this.activeIndex]?.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); this.close(); }
  },

  highlightActive(items) {
    items.forEach(function(it, i) { it.classList.toggle('active', i === CmdK.activeIndex); });
    if (items[this.activeIndex]) items[this.activeIndex].scrollIntoView({ block: 'nearest' });
  },

  execute(cmd) {
    this.close();
    setTimeout(function() { cmd.action(); }, 160);
  }
};
```

- [ ] **Paso 4: Registrar listener global y arrancar CmdK**

En la zona de inicializacion (despues de `DOMContentLoaded` o junto al tab navigation ~linea 3952):

```javascript
CmdK.init();

document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    CmdK.open();
  }
  if (e.key === 'Escape' && CmdK.overlay.classList.contains('visible')) {
    e.preventDefault();
    CmdK.close();
  }
});
```

- [ ] **Paso 5: Verificar**

1. Pulsar Cmd+K (Mac) / Ctrl+K (Windows) → se abre la paleta centrada con blur de fondo.
2. Escribir "dash" → filtra a "Ir a Dashboard".
3. Flechas arriba/abajo → navegan la lista.
4. Enter → ejecuta el comando y cierra la paleta.
5. Click fuera → cierra. Escape → cierra.
6. Sin query → muestra todos los comandos agrupados.

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.1): command palette with Cmd+K, fuzzy search, keyboard navigation"
```

---

### Task F3.2: Atajos de teclado globales

**Files:**
- Modify: `convocatoria.html:~3952` (JS — anadir listeners keydown junto al bloque de CmdK)
- Modify: `convocatoria.html:~3931-3952` (JS — tab navigation, refactorizar para reutilizar con Alt+N)

**Contexto:** Atajos seguros que no conflictan con el navegador. Deteccion de OS con `navigator.userAgentData?.platform || navigator.platform`. Alt+1..5 para pestanas (NO Ctrl+1..5 que conflicta en Windows con pestanas del navegador). Los tooltips de atajos se revelan progresivamente despues de 3 interacciones.

- [ ] **Paso 1: Implementar deteccion de OS y constante de modificador**

```javascript
// ═══════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════
const KBD = {
  isMac: /mac/i.test(navigator.userAgentData?.platform || navigator.platform || ''),
  get mod() { return this.isMac ? '\u2318' : 'Ctrl'; },
  interactionCount: 0,
  REVEAL_THRESHOLD: 3,

  init() {
    try {
      this.interactionCount = parseInt(localStorage.getItem('convocatoria_kbdInteractions') || '0', 10);
    } catch(e) { this.interactionCount = 0; }
  },

  trackInteraction() {
    this.interactionCount++;
    try { localStorage.setItem('convocatoria_kbdInteractions', String(this.interactionCount)); } catch(e) {}
  },

  shouldShowShortcuts() {
    return this.interactionCount >= this.REVEAL_THRESHOLD;
  }
};
KBD.init();
```

- [ ] **Paso 2: Registrar atajos globales**

Integrar en el listener `keydown` global (junto al de CmdK):

```javascript
document.addEventListener('keydown', function(e) {
  // Cmd/Ctrl+K — command palette (ya registrado en F3.1)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault(); CmdK.open(); return;
  }

  // Escape — cerrar overlays
  if (e.key === 'Escape') {
    if (CmdK.overlay.classList.contains('visible')) { CmdK.close(); return; }
    var visibleDialog = document.querySelector('.dialog-overlay.visible');
    if (visibleDialog) { visibleDialog.classList.remove('visible'); return; }
  }

  // Alt+1..5 — navegar pestanas
  if (e.altKey && e.key >= '1' && e.key <= '5') {
    e.preventDefault();
    var tabIndex = parseInt(e.key) - 1;
    var tabs = document.querySelectorAll('.tab-btn');
    if (tabs[tabIndex]) { tabs[tabIndex].click(); KBD.trackInteraction(); }
    return;
  }

  // Ctrl/Cmd+Enter — enviar convocatoria (solo en tab Convocatoria)
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !e.shiftKey) {
    var activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && activeTab.dataset.tab === 'tabConvocatoria') {
      e.preventDefault();
      document.getElementById('btnOpenOutlook').click();
      KBD.trackInteraction();
    }
    return;
  }

  // Ctrl/Cmd+Shift+Enter — anadir a cola
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Enter') {
    var activeTab2 = document.querySelector('.tab-btn.active');
    if (activeTab2 && activeTab2.dataset.tab === 'tabConvocatoria') {
      e.preventDefault();
      var addBtn = document.getElementById('btnAddToQueue');
      if (addBtn) { addBtn.click(); KBD.trackInteraction(); }
    }
    return;
  }
});
```

- [ ] **Paso 3: Actualizar tooltips de botones con atajos**

En la zona de init, despues de registrar atajos:

```javascript
// Revelar atajos en tooltips solo tras N interacciones
function updateShortcutTooltips() {
  if (!KBD.shouldShowShortcuts()) return;
  var mod = KBD.mod;
  var btnOutlook = document.getElementById('btnOpenOutlook');
  if (btnOutlook) btnOutlook.title = 'Enviar convocatoria (' + mod + '+Enter)';
  var btnAdd = document.getElementById('btnAddToQueue');
  if (btnAdd) btnAdd.title = 'Anadir a cola (' + mod + '+Shift+Enter)';
  document.querySelectorAll('.tab-btn').forEach(function(btn, i) {
    btn.title = (btn.title || btn.textContent.trim()) + ' (Alt+' + (i+1) + ')';
  });
}
updateShortcutTooltips();
```

- [ ] **Paso 4: Actualizar comandos de CmdK con shortcuts dinamicos**

Actualizar la inicializacion de `CmdK.commands` para usar `KBD.mod`:

```javascript
// En CmdK.init(), actualizar shortcuts:
// shortcut: KBD.mod + '+Enter' en vez de 'Ctrl+Enter'
// shortcut: 'Alt+1' a 'Alt+5' (estos no cambian por OS)
```

- [ ] **Paso 5: Verificar**

1. Alt+1 → Dashboard. Alt+2 → Calendario. Alt+3 → Convocatoria. Alt+4 → Catalogos. Alt+5 → XML.
2. Ctrl+Enter (Windows) / Cmd+Enter (Mac) en tab Convocatoria → dispara envio.
3. Ctrl+Shift+Enter → anade a cola.
4. Escape → cierra dialogo visible, luego paleta si esta abierta.
5. Tras 3 interacciones con atajos, los tooltips muestran los shortcuts.
6. En Mac, tooltips muestran Cmd. En Windows, Ctrl.

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.2): global keyboard shortcuts with OS detection and progressive tooltip reveal"
```

---

### Task F3.3: Empty states contextuales unificados (todas las pestanas)

**Files:**
- Modify: `convocatoria.html:1265-1280` (CSS — ampliar `.empty-state` existente)
- Modify: `convocatoria.html:3131` (HTML — `#emptyState` tabla personas destinatarias)
- Modify: `convocatoria.html:3402` (HTML — `#calEmptyState` calendario)
- Modify: `convocatoria.html:3455` (HTML — `#dashEmptyState` dashboard)
- Modify: `convocatoria.html:7902-7910` (JS — `renderTable()` empty state)
- Modify: `convocatoria.html:10816-10835` (JS — `renderEmptyState()` dashboard)
- Modify: `convocatoria.html:8219-8311` (JS — `renderQueue()` / `renderQueuePanel()`)

**Contexto:** La app tiene 3 tipos de empty state: `.empty-state` en tabla (linea 1265), `.cal-empty-state` en calendario (linea 3402), `.dash-empty` en dashboard (linea 10816). Unificar en un sistema de componentes `.empty-state` con variantes por contexto. Cada variante explica: que datos necesita, donde se introducen, y un CTA accionable.

- [ ] **Paso 1: Ampliar CSS del sistema de empty states**

Reemplazar el bloque `.empty-state` existente (~linea 1265):

```css
/* ═══ Unified Empty States ═══ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
}
.empty-state-icon {
  font-size: 32px;
  line-height: 1;
  margin-bottom: 4px;
  opacity: 0.6;
}
.empty-state-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}
.empty-state-desc {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.5;
}
.empty-state-cta {
  margin-top: 8px;
}
```

- [ ] **Paso 2: Crear funcion generadora de empty states**

Funcion reutilizable en JS (zona helpers, ~linea 6670):

```javascript
function createEmptyState(opts) {
  // opts: { icon, title, desc, ctaText, ctaAction }
  var wrap = document.createElement('div');
  wrap.className = 'empty-state';
  if (opts.icon) {
    var ic = document.createElement('div');
    ic.className = 'empty-state-icon';
    ic.textContent = opts.icon;
    wrap.appendChild(ic);
  }
  if (opts.title) {
    var t = document.createElement('div');
    t.className = 'empty-state-title';
    t.textContent = opts.title;
    wrap.appendChild(t);
  }
  if (opts.desc) {
    var d = document.createElement('div');
    d.className = 'empty-state-desc';
    d.textContent = opts.desc;
    wrap.appendChild(d);
  }
  if (opts.ctaText && opts.ctaAction) {
    var btn = document.createElement('button');
    btn.className = 'btn btn-primary empty-state-cta';
    btn.textContent = opts.ctaText;
    btn.addEventListener('click', opts.ctaAction);
    wrap.appendChild(btn);
  }
  return wrap;
}
```

- [ ] **Paso 3: Aplicar empty states a tabla de personas destinatarias**

En `renderTable()` (linea ~7902), reemplazar la logica existente:

```javascript
// Sin datos cargados
if (!state.employees || state.employees.length === 0) {
  emptyState.textContent = '';
  emptyState.appendChild(createEmptyState({
    icon: '\u2B06',
    title: 'Carga tu censo de personas trabajadoras',
    desc: 'Arrastra un archivo Excel o haz click en "Cargar Excel" en el panel izquierdo.',
    ctaText: 'Cargar Excel',
    ctaAction: function() { document.getElementById('fileInput').click(); }
  }));
  emptyState.style.display = '';
  return;
}

// Sin resultados de filtro
if (filtered.length === 0) {
  emptyState.textContent = '';
  emptyState.appendChild(createEmptyState({
    icon: '\uD83D\uDD0D',
    title: 'Sin resultados',
    desc: 'Ningun registro coincide con los filtros actuales.',
    ctaText: 'Limpiar filtros',
    ctaAction: function() { /* limpiar filtros existentes */ }
  }));
  emptyState.style.display = '';
  return;
}
```

- [ ] **Paso 4: Aplicar empty states al dashboard**

Actualizar `renderEmptyState()` existente (linea 10816) para usar el sistema unificado:

```javascript
function renderEmptyState(container, hint) {
  container.textContent = '';
  container.appendChild(createEmptyState({
    icon: '?',
    title: 'Sin datos disponibles',
    desc: hint || ''
  }));
}
```

Actualizar el empty state global del dashboard (`#dashEmptyState`, linea 3455) con contenido contextual.

- [ ] **Paso 5: Aplicar empty states a calendario, cola e historial**

Para calendario (`#calEmptyState`):
```javascript
createEmptyState({
  icon: '\uD83D\uDCC5',
  title: 'Calendario vacio',
  desc: 'Las acciones formativas con fechas aparecen aqui automaticamente.',
  ctaText: 'Ir a Catalogos',
  ctaAction: function() { document.querySelector('.tab-btn[data-tab="tabCatalogos"]').click(); }
});
```

Para cola (`renderQueue()` / `renderQueuePanel()`):
```javascript
createEmptyState({
  icon: '\uD83D\uDCE5',
  title: 'Cola vacia',
  desc: 'Anade convocatorias a la cola para enviarlas en lote.'
});
```

Para historial:
```javascript
createEmptyState({
  icon: '\uD83D\uDD52',
  title: 'Sin historial',
  desc: 'Las convocatorias que envies se registraran aqui.'
});
```

- [ ] **Paso 6: Verificar**

1. Sin Excel cargado → tabla muestra empty state con CTA "Cargar Excel".
2. Filtros sin resultados → empty state con CTA "Limpiar filtros".
3. Dashboard sin catalogo → cada modulo muestra hint contextual.
4. Calendario sin acciones → empty state con CTA "Ir a Catalogos".
5. Cola vacia → empty state descriptivo.
6. Historial vacio → empty state descriptivo.

- [ ] **Paso 7: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.3): unified empty states system across all tabs with contextual CTAs"
```

---

### Task F3.4: Divulgacion progresiva en dashboard

**Files:**
- Modify: `convocatoria.html:1601-1662` (CSS — `.dash-card`, collapsed state ya existe)
- Modify: `convocatoria.html:13047-15000` (JS — `renderDashboard()`, aplicar colapso por defecto)

**Contexto:** El dashboard ya tiene soporte para colapsar tarjetas (`.dash-card.collapsed`, lineas 1647-1662). Los modulos avanzados (ROI, equidad, interempresarial, riesgo, gestor, formacion cruzada) se colapsan por defecto. Los modulos operativos (KPIs, alertas, plazos, credito, estado, completitud, compliance) permanecen abiertos. La seleccion se persiste en `localStorage` key `convocatoria_dashCollapsed`.

- [ ] **Paso 1: Definir modulos por defecto colapsados**

```javascript
const DASH_COLLAPSED_DEFAULTS = [
  'dash-roi', 'dash-equity', 'dash-crosscompany',
  'dash-risk', 'dash-manager', 'dash-crosstrain'
];

function getDashCollapsedState() {
  try {
    var saved = localStorage.getItem('convocatoria_dashCollapsed');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return DASH_COLLAPSED_DEFAULTS.slice();
}

function saveDashCollapsedState(collapsed) {
  try { localStorage.setItem('convocatoria_dashCollapsed', JSON.stringify(collapsed)); } catch(e) {}
}
```

- [ ] **Paso 2: Aplicar estado colapsado al renderizar**

En `renderDashboard()`, despues de renderizar todas las tarjetas:

```javascript
var collapsed = getDashCollapsedState();
document.querySelectorAll('.dash-card[data-module]').forEach(function(card) {
  if (collapsed.indexOf(card.dataset.module) >= 0) {
    card.classList.add('collapsed');
  } else {
    card.classList.remove('collapsed');
  }
});
```

- [ ] **Paso 3: Persistir cambios de colapso al click**

En el handler de click de `.dash-card-title` (ya existente para toggle):

```javascript
// Dentro del handler de toggle existente:
var collapsed = getDashCollapsedState();
var mod = card.dataset.module;
if (card.classList.contains('collapsed')) {
  collapsed = collapsed.filter(function(m) { return m !== mod; });
} else {
  if (collapsed.indexOf(mod) < 0) collapsed.push(mod);
}
saveDashCollapsedState(collapsed);
```

- [ ] **Paso 4: Verificar**

1. Al abrir dashboard por primera vez → modulos avanzados colapsados.
2. Click en titulo de modulo avanzado → se expande, se persiste.
3. Recargar → mantiene el estado de colapso personalizado.
4. Modulos operativos (KPIs, alertas) → siempre visibles por defecto.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.4): progressive disclosure in dashboard with persisted collapsed state"
```

---

### Task F3.5: Dashboard accionable

**Files:**
- Modify: `convocatoria.html:13047-15000` (JS — `renderDashboard()`, anadir handlers onclick a alertas y KPIs)
- Modify: `convocatoria.html:1509-1600` (CSS — cursor pointer en KPIs accionables)

**Contexto:** El dashboard muestra alertas (`dash-alerts-widget`, linea 2061), KPIs (`.dash-kpi`, linea 1516), y tarjetas de datos. Actualmente son presentacionales. Cada alerta y KPI que tenga una accion correctiva enlaza a la pestana y vista correspondiente con filtros preaplicados.

- [ ] **Paso 1: Anadir CSS para KPIs accionables**

```css
.dash-kpi[data-action], .dash-alert-item[data-action] {
  cursor: pointer;
}
.dash-kpi[data-action]:hover {
  border-left-width: 4px;
}
```

- [ ] **Paso 2: Implementar funcion de navegacion con contexto**

```javascript
function dashNavigateTo(tab, context) {
  // tab: 'tabCatalogos', 'tabXml', 'tabConvocatoria', etc.
  // context: { filter, scrollTo, subView }
  var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
  if (btn) btn.click();
  if (context && context.scrollTo) {
    setTimeout(function() {
      var el = document.getElementById(context.scrollTo) || document.querySelector(context.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }
}
```

- [ ] **Paso 3: Anadir acciones a alertas del dashboard**

Dentro de la funcion que renderiza alertas (en `renderDashboard()`), anadir `data-action` y handlers:

```javascript
// Ejemplo para alertas FUNDAE:
alertItem.dataset.action = 'navigate';
alertItem.addEventListener('click', function() {
  dashNavigateTo('tabXml');
});

// Ejemplo para alertas de compliance:
alertItem.dataset.action = 'navigate';
alertItem.addEventListener('click', function() {
  dashNavigateTo('tabCatalogos', { scrollTo: 'complianceSection' });
});

// Ejemplo para alertas de credito:
alertItem.dataset.action = 'navigate';
alertItem.addEventListener('click', function() {
  dashNavigateTo('tabDashboard', { scrollTo: 'dash-credit' });
});
```

- [ ] **Paso 4: Anadir acciones a KPIs**

En las KPIs que tengan accion correctiva (grupos sin participantes, formaciones caducadas, etc.):

```javascript
kpiElement.dataset.action = 'navigate';
kpiElement.style.cursor = 'pointer';
kpiElement.addEventListener('click', function() {
  dashNavigateTo('tabCatalogos');
});
```

- [ ] **Paso 5: Verificar**

1. Click en alerta FUNDAE → navega a pestana XML.
2. Click en alerta de compliance → navega a catalogos, seccion compliance.
3. Click en KPI de participantes → navega a catalogos.
4. Cursor pointer en elementos accionables, cursor default en los demas.

- [ ] **Paso 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.5): actionable dashboard with click-through navigation from alerts and KPIs"
```

---

### Task F3.6: PDF de convocatoria con branding Formacion_AGORA

**Files:**
- Modify: `convocatoria.html:~8653-8743` (JS — zona de envio, anadir boton export)
- Modify: `convocatoria.html:3155-3165` (HTML — action bar, nuevo boton "Exportar PDF")
- Modify: `convocatoria.html:~1447` (CSS — estilos print para documento generado)

**Contexto:** PDF generado con `window.open()` + HTML inline con `@media print` + `@page`. Cabecera con borde inferior 3px en `--accent` (#4F46E5), titulo del evento, metadata, tabla de personas destinatarias con filas alternas, pie con fecha. Boton en la action bar junto a "Abrir en Outlook". Todo contenido dinamico del Excel sanitizado con `esc()`.

- [ ] **Paso 1: Anadir boton en la action bar**

En la action bar (linea ~3160), junto a `btnOpenOutlook`:

```html
<button class="btn btn-secondary" id="btnExportPDF" title="Exportar convocatoria como PDF">Exportar PDF</button>
```

- [ ] **Paso 2: Implementar funcion de generacion**

```javascript
function exportConvocatoriaPDF() {
  var ev = validateEvent();
  if (!ev) return;
  var selected = getSelectedEmployees();
  if (selected.length === 0) { showToast('Selecciona al menos una persona destinataria', 'warning'); return; }

  var w = window.open('', '_blank');
  if (!w) { showToast('Permite las ventanas emergentes para exportar', 'warning'); return; }

  var rows = selected.map(function(emp) {
    return '<tr><td>' + esc(emp['NOMBRE'] || '') + '</td><td>' + esc(emp['EMAIL'] || '') + '</td>'
      + '<td>' + esc(emp['DEPARTAMENTO'] || '') + '</td><td>' + esc(emp['UBICACION'] || '') + '</td></tr>';
  }).join('');

  var locationLine = ev.location ? '<p><strong>Ubicacion:</strong> ' + esc(ev.location) + '</p>' : '';
  var dateLine = ev.date ? '<p><strong>Fecha:</strong> ' + esc(ev.date) + '</p>' : '';
  var timeLine = (ev.startTime && ev.endTime) ? '<p><strong>Horario:</strong> ' + esc(ev.startTime) + ' - ' + esc(ev.endTime) + '</p>' : '';

  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>Convocatoria - ' + esc(ev.title || 'Sin titulo') + '</title>'
    + '<style>@page{size:A4;margin:20mm}'
    + 'body{font-family:Inter,-apple-system,sans-serif;color:#0f172a;font-size:12px;line-height:1.6}'
    + '.header{border-bottom:3px solid #4F46E5;padding-bottom:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}'
    + '.header-brand{font-size:11px;color:#94a3b8}'
    + '.header-title{font-size:20px;font-weight:600}'
    + '.meta{margin-bottom:24px} .meta p{margin:4px 0;font-size:13px}'
    + 'table{width:100%;border-collapse:collapse;margin-top:16px}'
    + 'th{background:#f1f5f9;padding:8px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e2e8f0}'
    + 'td{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:12px}'
    + 'tr:nth-child(even) td{background:#f8fafc}'
    + '.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:right}'
    + '.count{margin-top:16px;font-size:13px;color:#475569}'
    + '</style></head><body>'
    + '<div class="header"><div><div class="header-title">' + esc(ev.title || 'Convocatoria') + '</div></div><div class="header-brand">Formacion_AGORA</div></div>'
    + '<div class="meta">' + dateLine + timeLine + locationLine + '</div>'
    + '<div class="count">' + selected.length + ' personas destinatarias</div>'
    + '<table><thead><tr><th>Nombre</th><th>Email</th><th>Departamento</th><th>Ubicacion</th></tr></thead><tbody>' + rows + '</tbody></table>'
    + '<div class="footer">Generado el ' + new Date().toLocaleDateString('es-ES') + ' con Formacion_AGORA</div>'
    + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}

document.getElementById('btnExportPDF').addEventListener('click', exportConvocatoriaPDF);
```

- [ ] **Paso 3: Verificar**

1. Con datos y evento completo → "Exportar PDF" → nueva ventana con documento formateado.
2. Cabecera con borde indigo, tabla con filas alternas, pie con fecha.
3. Sin personas seleccionadas → toast de advertencia.
4. Contenido sanitizado con `esc()`.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.6): branded PDF export for convocatoria with print-ready layout"
```

---

### Task F3.7: Certificados y hojas de firmas mejorados

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — zona catalogo, nuevas funciones en ficha de accion)
- Modify: `convocatoria.html:~5200` (JS — renderCatalogForm(), botones "Hoja de firmas" y "Certificados")

**Contexto:** Branding unificado (cabecera "Formacion_AGORA", paleta indigo, misma tipografia). Hoja de firmas genera tabla por sesion. Certificados generan documento por participante con asistencia >= 75%. Ambos con `window.open()` + `window.print()`. Datos del catalogo. Contenido sanitizado con `esc()`.

- [ ] **Paso 1: Implementar hojas de firmas**

```javascript
function generateAttendanceSheet(actionId) {
  var action = getCatalogAction(actionId);
  if (!action) { showToast('Accion no encontrada', 'error'); return; }
  var sessions = action.sessions || [];
  if (sessions.length === 0) { showToast('No hay sesiones registradas', 'warning'); return; }
  var participants = (action.participants || []).slice().sort(function(a, b) {
    return (a.name || '').localeCompare(b.name || '');
  });

  var sheetsHtml = sessions.map(function(session, idx) {
    var rows = participants.map(function(p) {
      return '<tr><td>' + esc(p.name || '') + '</td><td>' + esc(p.nif || '') + '</td>'
        + '<td class="sign"></td><td class="time"></td><td class="time"></td></tr>';
    }).join('');
    return '<div class="sheet' + (idx > 0 ? ' pb' : '') + '">'
      + '<div class="hdr"><div class="htitle">HOJA DE FIRMAS</div><div class="hbrand">Formacion_AGORA</div></div>'
      + '<div class="meta"><p><strong>Formacion:</strong> ' + esc(action.title || '') + '</p>'
      + '<p><strong>Fecha:</strong> ' + esc(session.date || '') + ' | <strong>Horario:</strong> ' + esc(session.startTime || '') + ' - ' + esc(session.endTime || '') + '</p>'
      + '<p><strong>Lugar:</strong> ' + esc(action.location || '') + ' | <strong>Formador/a:</strong> ' + esc(action.trainer || '') + '</p></div>'
      + '<table><thead><tr><th>Nombre</th><th>NIF</th><th>Firma</th><th>H. entrada</th><th>H. salida</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="tsign"><p>Firma formador/a:</p><div class="sline"></div></div></div>';
  }).join('');

  var w = window.open('', '_blank');
  if (!w) { showToast('Permite ventanas emergentes', 'warning'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hoja de firmas - ' + esc(action.title || '') + '</title>'
    + '<style>@page{size:A4;margin:15mm} body{font-family:Inter,-apple-system,sans-serif;color:#0f172a;font-size:11px}'
    + '.pb{page-break-before:always} .hdr{border-bottom:3px solid #4F46E5;padding-bottom:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-end}'
    + '.htitle{font-size:16px;font-weight:600} .hbrand{font-size:10px;color:#94a3b8} .meta p{margin:2px 0}'
    + 'table{width:100%;border-collapse:collapse;margin-top:12px} th{background:#f1f5f9;padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e2e8f0}'
    + 'td{padding:12px 8px;border-bottom:1px solid #e2e8f0} .sign{width:120px} .time{width:80px}'
    + '.tsign{margin-top:40px} .sline{border-bottom:1px solid #0f172a;width:250px;margin-top:40px}'
    + '</style></head><body>' + sheetsHtml + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}
```

- [ ] **Paso 2: Implementar certificados**

```javascript
function generateCertificates(actionId) {
  var action = getCatalogAction(actionId);
  if (!action) { showToast('Accion no encontrada', 'error'); return; }
  var minAtt = 75;
  var eligible = (action.participants || []).filter(function(p) { return (p.attendancePercent || 0) >= minAtt; });
  if (eligible.length === 0) { showToast('Sin participantes con asistencia >= ' + minAtt + '%', 'warning'); return; }

  var year = new Date().getFullYear();
  var certsHtml = eligible.map(function(p, idx) {
    var num = 'CERT-' + year + '-' + String(idx+1).padStart(4,'0');
    return '<div class="cert' + (idx > 0 ? ' pb' : '') + '">'
      + '<div class="chdr"><div class="cbrand">Formacion_AGORA</div><div class="cnum">' + num + '</div></div>'
      + '<h1 class="ctitle">CERTIFICADO DE ASISTENCIA</h1>'
      + '<div class="cbody"><p>Se certifica que <strong>' + esc(p.name || '') + '</strong>, '
      + 'con NIF <strong>' + esc(p.nif || '') + '</strong>, ha completado la accion formativa:</p>'
      + '<div class="caction"><p class="cat">' + esc(action.title || '') + '</p>'
      + '<p>' + (action.hours || 0) + ' horas | ' + esc(action.modality || 'Presencial') + '</p>'
      + (action.trainer ? '<p>Formador/a: ' + esc(action.trainer) + '</p>' : '') + '</div></div>'
      + '<div class="cfooter"><div class="cdate">Emision: ' + new Date().toLocaleDateString('es-ES') + '</div>'
      + '<div class="csign"><div class="sline"></div><p>Firma y sello</p></div></div></div>';
  }).join('');

  var w = window.open('', '_blank');
  if (!w) { showToast('Permite ventanas emergentes', 'warning'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificados - ' + esc(action.title || '') + '</title>'
    + '<style>@page{size:A4;margin:25mm} body{font-family:Inter,-apple-system,sans-serif;color:#0f172a}'
    + '.cert{min-height:700px;display:flex;flex-direction:column} .pb{page-break-before:always}'
    + '.chdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #4F46E5;padding-bottom:12px;margin-bottom:40px}'
    + '.cbrand{font-size:12px;color:#94a3b8} .cnum{font-size:11px;color:#94a3b8}'
    + '.ctitle{text-align:center;font-size:22px;font-weight:600;margin-bottom:32px;letter-spacing:.05em}'
    + '.cbody{flex:1;font-size:14px;line-height:1.8}'
    + '.caction{background:#f8fafc;border-left:3px solid #4F46E5;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0}'
    + '.cat{font-size:16px;font-weight:600;margin-bottom:4px} .caction p{margin:2px 0;font-size:13px;color:#475569}'
    + '.cfooter{display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;padding-top:20px}'
    + '.cdate{font-size:12px;color:#475569} .csign{text-align:center}'
    + '.sline{border-bottom:1px solid #0f172a;width:200px;margin-bottom:8px} .csign p{font-size:11px;color:#475569;margin:0}'
    + '</style></head><body>' + certsHtml + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
  showToast(eligible.length + ' certificados generados', 'success');
}
```

- [ ] **Paso 3: Anadir botones en ficha de accion del catalogo**

En `renderCatalogForm()`, crear grupo de botones de documentacion:

```javascript
var docsGroup = document.createElement('div');
docsGroup.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
var btnSheet = document.createElement('button');
btnSheet.className = 'btn btn-secondary'; btnSheet.textContent = 'Hoja de firmas';
btnSheet.addEventListener('click', function() { generateAttendanceSheet(currentActionId); });
var btnCerts = document.createElement('button');
btnCerts.className = 'btn btn-secondary'; btnCerts.textContent = 'Certificados';
btnCerts.addEventListener('click', function() { generateCertificates(currentActionId); });
docsGroup.appendChild(btnSheet); docsGroup.appendChild(btnCerts);
```

- [ ] **Paso 4: Verificar**

1. Hoja de firmas con sesiones → tabla por sesion, page-break, espacio firma formador.
2. Certificados con asistencia registrada → certificado por persona >= 75% asistencia.
3. Branding unificado. Contenido sanitizado. Numeracion automatica.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.7): attendance sheets and certificates with unified branding"
```

---

### Task F3.8: Dossier de inspeccion

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — zona catalogo, funcion dossier)
- Modify: `convocatoria.html:~5200` (JS — renderCatalogForm(), boton "Dossier inspeccion")

**Contexto:** Boton en ficha de accion. Recopila datos disponibles (FUNDAE, asistencia, XML, RLT), genera HTML con indice y checklist de documentacion requerida vs. disponible. Mismo patron `window.open()` + branding.

- [ ] **Paso 1: Implementar checklist y generacion**

```javascript
function buildInspectionChecklist(action) {
  return [
    { label: 'Datos de la accion formativa', ok: !!(action.title && action.hours && action.modality) },
    { label: 'Participantes registrados', ok: (action.participants || []).length > 0 },
    { label: 'Sesiones con fechas', ok: (action.sessions || []).length > 0 },
    { label: 'Asistencia registrada', ok: (action.participants || []).some(function(p) { return p.attendancePercent > 0; }) },
    { label: 'Hoja de firmas', ok: !!action.attendanceSheetGenerated },
    { label: 'Certificados emitidos', ok: !!action.certificatesGenerated },
    { label: 'XML FUNDAE', ok: !!action.xmlGenerated },
    { label: 'Comunicacion inicio FUNDAE', ok: ['Inicio comunicado','Fin comunicado','Cerrada'].indexOf(action.fundaeStatus) >= 0 },
    { label: 'Comunicacion fin FUNDAE', ok: ['Fin comunicado','Cerrada'].indexOf(action.fundaeStatus) >= 0 },
    { label: 'Comunicacion RLT', ok: !!(action.rlt && action.rlt.status !== 'Pendiente') },
    { label: 'Encuesta de satisfaccion', ok: !!action.surveyStatus },
  ];
}

function generateInspectionDossier(actionId) {
  var action = getCatalogAction(actionId);
  if (!action) { showToast('Accion no encontrada', 'error'); return; }
  var checklist = buildInspectionChecklist(action);
  var done = checklist.filter(function(i) { return i.ok; }).length;

  var clRows = checklist.map(function(i) {
    var c = i.ok ? '#16a34a' : '#dc2626';
    return '<tr><td style="color:' + c + ';font-weight:600;width:24px">' + (i.ok ? '\u2713' : '\u2717') + '</td>'
      + '<td>' + i.label + '</td><td style="color:' + c + '">' + (i.ok ? 'Disponible' : 'Pendiente') + '</td></tr>';
  }).join('');

  var pRows = (action.participants || []).map(function(p) {
    return '<tr><td>' + esc(p.name || '') + '</td><td>' + esc(p.nif || '') + '</td><td>' + (p.attendancePercent || 0) + '%</td></tr>';
  }).join('');

  var w = window.open('', '_blank');
  if (!w) { showToast('Permite ventanas emergentes', 'warning'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dossier - ' + esc(action.title || '') + '</title>'
    + '<style>@page{size:A4;margin:20mm} body{font-family:Inter,-apple-system,sans-serif;color:#0f172a;font-size:12px;line-height:1.6}'
    + '.header{border-bottom:3px solid #4F46E5;padding-bottom:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}'
    + '.ht{font-size:18px;font-weight:600} .hb{font-size:11px;color:#94a3b8}'
    + 'h2{font-size:14px;font-weight:600;margin:24px 0 12px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}'
    + 'table{width:100%;border-collapse:collapse;margin:8px 0 16px}'
    + 'th{background:#f1f5f9;padding:6px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e2e8f0}'
    + 'td{padding:6px 10px;border-bottom:1px solid #e2e8f0}'
    + '.sbox{background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0}'
    + '.sbox p{margin:4px 0} .prog{font-size:14px;font-weight:600;margin-top:12px}'
    + '.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:right}'
    + '</style></head><body>'
    + '<div class="header"><div class="ht">DOSSIER DE INSPECCION</div><div class="hb">Formacion_AGORA</div></div>'
    + '<div class="sbox"><p><strong>Accion:</strong> ' + esc(action.title || '') + '</p>'
    + '<p><strong>Horas:</strong> ' + (action.hours || 0) + ' | <strong>Modalidad:</strong> ' + esc(action.modality || '') + '</p>'
    + '<div class="prog">Documentacion: ' + done + ' de ' + checklist.length + ' elementos</div></div>'
    + '<h2>Checklist de documentacion</h2>'
    + '<table><thead><tr><th></th><th>Documento</th><th>Estado</th></tr></thead><tbody>' + clRows + '</tbody></table>'
    + '<h2>Participantes</h2>'
    + '<table><thead><tr><th>Nombre</th><th>NIF</th><th>Asistencia</th></tr></thead><tbody>' + pRows + '</tbody></table>'
    + '<div class="footer">Generado el ' + new Date().toLocaleDateString('es-ES') + ' con Formacion_AGORA</div>'
    + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}
```

- [ ] **Paso 2: Anadir boton en ficha de accion**

```javascript
var btnDossier = document.createElement('button');
btnDossier.className = 'btn btn-secondary'; btnDossier.textContent = 'Dossier inspeccion';
btnDossier.addEventListener('click', function() { generateInspectionDossier(currentActionId); });
docsGroup.appendChild(btnDossier);
```

- [ ] **Paso 3: Verificar**

1. Checklist muestra verde/rojo segun datos disponibles.
2. Progreso correcto. Tabla de participantes. Branding unificado.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.8): inspection dossier with documentation checklist"
```

---

### Task F3.9: Informe de ejecucion para Direccion

**Files:**
- Modify: `convocatoria.html:13047-15000` (JS — dashboard, funcion de generacion)
- Modify: `convocatoria.html:3501-3700` (HTML — dashboard, boton "Informe para Direccion")

**Contexto:** Boton en el dashboard. Genera informe ejecutivo con KPIs, distribucion por modalidad/departamento. Datos ya calculados en `renderDashboard()`. Formato HTML imprimible con branding unificado.

- [ ] **Paso 1: Anadir boton en dashboard**

```html
<button class="btn btn-secondary" id="btnReportDirection" style="font-size:12px;">Informe para Direccion</button>
```

- [ ] **Paso 2: Implementar generacion**

```javascript
function generateDirectionReport() {
  var year = new Date().getFullYear();
  var actions = getAllCatalogActions().filter(function(a) {
    return a.startDate && a.startDate.startsWith(String(year));
  });
  var totalActions = actions.length;
  var totalHours = actions.reduce(function(s,a) { return s + (parseFloat(a.hours)||0); }, 0);
  var uniqueNifs = new Set();
  var totalParts = 0;
  var byMod = {}, byDept = {};
  actions.forEach(function(a) {
    var m = a.modality || 'Sin definir'; byMod[m] = (byMod[m]||0) + 1;
    (a.participants||[]).forEach(function(p) {
      totalParts++;
      if (p.nif) uniqueNifs.add(p.nif);
      var d = p.department || 'Sin asignar'; byDept[d] = (byDept[d]||0) + 1;
    });
  });

  var modRows = Object.keys(byMod).map(function(k) { return '<tr><td>'+esc(k)+'</td><td>'+byMod[k]+'</td></tr>'; }).join('');
  var deptRows = Object.keys(byDept).sort(function(a,b){return byDept[b]-byDept[a];}).slice(0,10)
    .map(function(k) { return '<tr><td>'+esc(k)+'</td><td>'+byDept[k]+'</td></tr>'; }).join('');

  var w = window.open('', '_blank');
  if (!w) { showToast('Permite ventanas emergentes', 'warning'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe Direccion ' + year + '</title>'
    + '<style>@page{size:A4;margin:20mm} body{font-family:Inter,-apple-system,sans-serif;color:#0f172a;font-size:12px;line-height:1.6}'
    + '.header{border-bottom:3px solid #4F46E5;padding-bottom:12px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-end}'
    + '.ht{font-size:20px;font-weight:600} .hs{font-size:13px;color:#475569;margin-top:4px} .hb{font-size:11px;color:#94a3b8}'
    + '.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px 0}'
    + '.kpi{background:#f8fafc;border-radius:8px;padding:16px;text-align:center;border-left:3px solid #4F46E5}'
    + '.kv{font-size:28px;font-weight:700;color:#4F46E5} .kl{font-size:11px;color:#475569;margin-top:4px;text-transform:uppercase;letter-spacing:.05em}'
    + 'h2{font-size:14px;font-weight:600;margin:28px 0 12px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}'
    + 'table{width:100%;border-collapse:collapse;margin:8px 0 16px}'
    + 'th{background:#f1f5f9;padding:6px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e2e8f0}'
    + 'td{padding:6px 10px;border-bottom:1px solid #e2e8f0}'
    + '.footer{margin-top:40px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:right}'
    + '</style></head><body>'
    + '<div class="header"><div><div class="ht">INFORME DE EJECUCION DEL PLAN DE FORMACION</div><div class="hs">Ejercicio ' + year + '</div></div><div class="hb">Formacion_AGORA</div></div>'
    + '<div class="kpis">'
    + '<div class="kpi"><div class="kv">' + totalActions + '</div><div class="kl">Acciones</div></div>'
    + '<div class="kpi"><div class="kv">' + totalHours + '</div><div class="kl">Horas</div></div>'
    + '<div class="kpi"><div class="kv">' + totalParts + '</div><div class="kl">Participaciones</div></div>'
    + '<div class="kpi"><div class="kv">' + uniqueNifs.size + '</div><div class="kl">Personas</div></div>'
    + '</div>'
    + '<h2>Distribucion por modalidad</h2>'
    + '<table><thead><tr><th>Modalidad</th><th>Acciones</th></tr></thead><tbody>' + modRows + '</tbody></table>'
    + '<h2>Participacion por departamento (Top 10)</h2>'
    + '<table><thead><tr><th>Departamento</th><th>Participaciones</th></tr></thead><tbody>' + deptRows + '</tbody></table>'
    + '<div class="footer">Generado el ' + new Date().toLocaleDateString('es-ES') + ' con Formacion_AGORA</div>'
    + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}

document.getElementById('btnReportDirection').addEventListener('click', generateDirectionReport);
```

- [ ] **Paso 3: Verificar**

1. Dashboard con catalogo → "Informe para Direccion" → documento con KPIs, tablas.
2. Sin datos → informe con 0s (no error).

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.9): direction report with KPI grid and department breakdown"
```

---

### Task F3.10: Balance formativo RLT

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — zona catalogo, funcion balance)
- Modify: `convocatoria.html:~5200` (JS — seccion RLT, boton "Balance anual RLT")

**Contexto:** Complementa F2.11. Informe anual: acciones, horas, participantes, distribucion tipo/modalidad, espacio para firmas empresa y RLT. Mismo patron `window.open()` + branding.

- [ ] **Paso 1: Implementar generacion**

```javascript
function generateRLTBalance(year) {
  year = year || new Date().getFullYear();
  var actions = getAllCatalogActions().filter(function(a) {
    return a.startDate && a.startDate.startsWith(String(year));
  });
  var total = actions.length;
  var hours = actions.reduce(function(s,a) { return s+(parseFloat(a.hours)||0); }, 0);
  var uniq = new Set();
  actions.forEach(function(a) { (a.participants||[]).forEach(function(p) { if(p.nif) uniq.add(p.nif); }); });

  var byType = {};
  actions.forEach(function(a) { var t=a.type||'Sin tipo'; byType[t]=(byType[t]||0)+1; });
  var typeRows = Object.keys(byType).map(function(k) { return '<tr><td>'+esc(k)+'</td><td>'+byType[k]+'</td></tr>'; }).join('');
  var actRows = actions.map(function(a) {
    return '<tr><td>'+esc(a.title||'')+'</td><td>'+esc(a.modality||'')+'</td><td>'+(a.hours||0)+'</td><td>'+(a.participants||[]).length+'</td></tr>';
  }).join('');

  var w = window.open('', '_blank');
  if (!w) { showToast('Permite ventanas emergentes', 'warning'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Balance RLT ' + year + '</title>'
    + '<style>@page{size:A4;margin:20mm} body{font-family:Inter,-apple-system,sans-serif;color:#0f172a;font-size:12px;line-height:1.6}'
    + '.header{border-bottom:3px solid #4F46E5;padding-bottom:12px;margin-bottom:32px}'
    + '.ht{font-size:18px;font-weight:600;text-align:center} .hs{font-size:13px;color:#475569;text-align:center;margin-top:4px}'
    + '.sum{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}'
    + '.si{background:#f8fafc;border-radius:8px;padding:14px;text-align:center}'
    + '.sv{font-size:24px;font-weight:700;color:#4F46E5} .sl{font-size:11px;color:#475569}'
    + 'h2{font-size:14px;font-weight:600;margin:24px 0 12px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}'
    + 'table{width:100%;border-collapse:collapse;margin:8px 0 16px}'
    + 'th{background:#f1f5f9;padding:6px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e2e8f0}'
    + 'td{padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px}'
    + '.signs{margin-top:60px;display:flex;justify-content:space-between}'
    + '.sb{text-align:center} .sline{border-bottom:1px solid #0f172a;width:200px;margin-bottom:6px;margin-top:50px} .sb p{font-size:11px;color:#475569;margin:0}'
    + '.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:right}'
    + '</style></head><body>'
    + '<div class="header"><div class="ht">BALANCE DE ACCIONES FORMATIVAS</div><div class="hs">Ejercicio ' + year + '</div></div>'
    + '<div class="sum"><div class="si"><div class="sv">' + total + '</div><div class="sl">Acciones</div></div>'
    + '<div class="si"><div class="sv">' + hours + '</div><div class="sl">Horas</div></div>'
    + '<div class="si"><div class="sv">' + uniq.size + '</div><div class="sl">Personas</div></div></div>'
    + '<h2>Por tipo</h2><table><thead><tr><th>Tipo</th><th>Acciones</th></tr></thead><tbody>' + typeRows + '</tbody></table>'
    + '<h2>Listado de acciones</h2><table><thead><tr><th>Denominacion</th><th>Modalidad</th><th>Horas</th><th>Participantes</th></tr></thead><tbody>' + actRows + '</tbody></table>'
    + '<div class="signs"><div class="sb"><div class="sline"></div><p>Por la empresa</p></div><div class="sb"><div class="sline"></div><p>Por la RLT</p></div></div>'
    + '<div class="footer">Generado el ' + new Date().toLocaleDateString('es-ES') + ' con Formacion_AGORA</div>'
    + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}
```

- [ ] **Paso 2: Anadir boton**

```javascript
var btnBalance = document.createElement('button');
btnBalance.className = 'btn btn-secondary'; btnBalance.textContent = 'Balance anual RLT';
btnBalance.addEventListener('click', function() { generateRLTBalance(); });
```

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.10): annual RLT training balance report"
```

---

### Task F3.11: Animacion de seleccion/deseleccion en tabla

**Files:**
- Modify: `convocatoria.html:~400-450` (CSS — nueva clase `.row-excluded`)
- Modify: `convocatoria.html:7881-8030` (JS — renderTable(), aplicar clase)

**Contexto:** Transicion 200ms a `opacity: 0.4` con `text-decoration: line-through` al excluir. Volver a `opacity: 1` al reincluir. Sin flash de color, sin verde, sin escala. Solo opacidad como indicador. Usa `state.excludedNIFs` (contiene `_id`, no NIFs reales).

- [ ] **Paso 1: CSS**

```css
tr.row-excluded td {
  opacity: 0.4;
  text-decoration: line-through;
  transition: opacity 0.2s ease, text-decoration 0.2s ease;
}
tr:not(.row-excluded) td {
  opacity: 1;
  text-decoration: none;
  transition: opacity 0.2s ease;
}
```

- [ ] **Paso 2: Aplicar en renderTable()**

```javascript
var isExcluded = state.excludedNIFs && state.excludedNIFs.indexOf(emp._id) >= 0;
tr.className = isExcluded ? 'row-excluded' : '';
```

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.11): table row exclusion animation with opacity transition"
```

---

### Task F3.12: Exportacion .ics

**Files:**
- Modify: `convocatoria.html:14620-15000` (JS — renderCalendarTab(), boton export)
- Modify: `convocatoria.html:~3402` (HTML — pestana calendario, boton "Exportar .ics")

**Contexto:** Boton en la pestana Calendario. Exporta archivo .ics con acciones formativas visibles (respetando filtros activos). Formato VCALENDAR con SUMMARY, DTSTART/DTEND, LOCATION, DESCRIPTION. Si accion tiene multiples sesiones, un evento por sesion. Genera Blob y descarga via `URL.createObjectURL`. ~30 lineas de JS.

- [ ] **Paso 1: Implementar generacion ICS**

```javascript
function generateICS(actions) {
  var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FormacionAGORA//ES', 'CALSCALE:GREGORIAN'];

  actions.forEach(function(action) {
    var sessions = action.sessions && action.sessions.length > 0 ? action.sessions : [action];
    sessions.forEach(function(session) {
      if (!session.date && !session.startDate) return;
      var dateStr = (session.date || session.startDate || '').replace(/-/g, '');
      var startTime = (session.startTime || '09:00').replace(':', '') + '00';
      var endTime = (session.endTime || '14:00').replace(':', '') + '00';
      var uid = 'agora-' + (action.id || Math.random().toString(36).substr(2)) + '-' + dateStr + '@formacionagora';

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + uid);
      lines.push('DTSTART:' + dateStr + 'T' + startTime);
      lines.push('DTEND:' + dateStr + 'T' + endTime);
      lines.push('SUMMARY:' + icsEscape(action.title || 'Formacion'));
      if (action.location) lines.push('LOCATION:' + icsEscape(action.location));
      var desc = [];
      if (action.trainer) desc.push('Formador/a: ' + action.trainer);
      if (action.participants) desc.push('Participantes: ' + action.participants.length);
      if (action.modality) desc.push('Modalidad: ' + action.modality);
      if (desc.length) lines.push('DESCRIPTION:' + icsEscape(desc.join('\\n')));
      lines.push('STATUS:' + (action.status === 'Cerrada' ? 'CONFIRMED' : 'TENTATIVE'));
      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function icsEscape(str) {
  return (str || '').replace(/[\\;,\n]/g, function(c) {
    if (c === '\\') return '\\\\';
    if (c === ';') return '\\;';
    if (c === ',') return '\\,';
    if (c === '\n') return '\\n';
    return c;
  });
}

function exportCalendarICS() {
  var actions = getVisibleCalendarActions();
  if (!actions || actions.length === 0) {
    showToast('No hay acciones formativas con fechas para exportar', 'warning');
    return;
  }
  var icsContent = generateICS(actions);
  var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'formacion_agora_' + new Date().toISOString().slice(0,10) + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(actions.length + ' eventos exportados a .ics', 'success');
}
```

- [ ] **Paso 2: Anadir boton en pestana Calendario**

```html
<button class="btn btn-secondary" id="btnExportICS" style="font-size:12px;">Exportar .ics</button>
```

```javascript
document.getElementById('btnExportICS').addEventListener('click', exportCalendarICS);
```

- [ ] **Paso 3: Verificar**

1. Con acciones con fechas → "Exportar .ics" → descarga archivo .ics.
2. Sin acciones → toast de advertencia.
3. Archivo importable en Outlook/Google Calendar.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.12): ICS calendar export with per-session events"
```

---

### Task F3.13: View Transitions API para cambio de pestanas

**Files:**
- Modify: `convocatoria.html:3931-3952` (JS — tab navigation, wrap con startViewTransition)

**Contexto:** Al cambiar de pestana, usar `document.startViewTransition()` para cross-fade de 150ms. Degradacion elegante en navegadores sin soporte. Refactorizar el bloque de tab navigation existente (lineas 3931-3952) para extraer la logica de cambio a una funcion `applyTabChange(tabId)`.

- [ ] **Paso 1: Refactorizar tab navigation**

Extraer la logica actual del listener de click a una funcion:

```javascript
function applyTabChange(tabId) {
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
  var content = document.getElementById(tabId);
  if (content) content.classList.add('active');
  if (tabId === 'tabDashboard') { showDashboardSkeleton(); requestAnimationFrame(function() { renderDashboard(); }); }
  if (tabId === 'tabCalendario') renderCalendarTab();
  if (tabId === 'tabCatalogos') {
    var savedModes = getCatalogViewModes();
    var savedMode = savedModes[catalogState.activeCatalog] || 'ficha';
    toggleCatalogViewMode(catalogState.activeCatalog, savedMode);
    if (savedMode === 'ficha') { renderCatalogList(); renderCatalogForm(); }
  }
  if (tabId === 'tabXml') refreshXmlSelects();
}

document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var tabId = btn.dataset.tab;
    if (document.startViewTransition) {
      document.startViewTransition(function() { applyTabChange(tabId); });
    } else {
      applyTabChange(tabId);
    }
  });
});
```

- [ ] **Paso 2: Anadir CSS para view transitions**

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 150ms;
}
```

- [ ] **Paso 3: Verificar**

1. En Chrome/Edge (con soporte) → cross-fade suave de 150ms al cambiar pestana.
2. En Firefox/Safari (sin soporte) → cambio instantaneo sin error.
3. La funcionalidad de cada pestana sigue intacta.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.13): View Transitions API for tab switching with graceful fallback"
```

---

### Task F3.14: Blur sistematico en overlays

**Files:**
- Modify: `convocatoria.html:1370-1380` (CSS — `.dialog-overlay`, cambiar blur(4px) a blur(8px))
- Modify: `convocatoria.html:2747-2756` (CSS — `.queue-panel-overlay`, anadir blur)

**Contexto:** Unificar `backdrop-filter: blur(8px)` en todos los overlays. Actualmente `.dialog-overlay` usa `blur(4px)` (linea 1375). El overlay de CmdK ya usa `blur(8px)` (F3.1). Unificar para coherencia.

- [ ] **Paso 1: Actualizar dialog-overlay**

En linea 1375, cambiar:
```css
/* Antes: */
backdrop-filter: blur(4px);
-webkit-backdrop-filter: blur(4px);

/* Despues: */
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
```

- [ ] **Paso 2: Actualizar queue-panel-overlay**

En `.queue-panel-overlay` (~linea 2747), anadir:
```css
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
```

- [ ] **Paso 3: Verificar**

1. Abrir cualquier dialogo → blur de 8px en el fondo.
2. Abrir panel de cola → blur de 8px.
3. Abrir CmdK → blur de 8px (ya tenia).
4. Todos los overlays con el mismo nivel de blur.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.14): unify backdrop blur to 8px across all overlays"
```

---

### Task F3.15: Precomputacion del dashboard al cargar datos

**Files:**
- Modify: `convocatoria.html:7401-7540` (JS — handleFile(), anadir requestIdleCallback post-carga)
- Modify: `convocatoria.html:13047-15000` (JS — renderDashboard(), cache de metricas)

**Contexto:** Al completar la carga del Excel, calcular metricas del dashboard en un `requestIdleCallback()`. Cuando Laura navega al dashboard, renderizar instantaneamente si los datos no han cambiado. Key en estado: `state._dashboardCache` con hash de datos. Si el hash coincide, usar cache; si no, recalcular.

- [ ] **Paso 1: Implementar precomputacion**

```javascript
var _dashCache = { hash: null, data: null };

function precomputeDashboard() {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(function() {
      _dashCache.data = computeDashboardMetrics();
      _dashCache.hash = computeDashHash();
    });
  }
}

function computeDashHash() {
  var catalog = getAllCatalogActions();
  var empCount = (state.employees || []).length;
  return catalog.length + ':' + empCount + ':' + (catalog[0]?.title || '') + ':' + (catalog[catalog.length-1]?.title || '');
}

function computeDashboardMetrics() {
  // Extraer los calculos de renderDashboard() que son puros (sin DOM)
  // Retornar objeto con todas las metricas precalculadas
  var actions = getAllCatalogActions();
  return {
    totalActions: actions.length,
    totalHours: actions.reduce(function(s,a) { return s + (parseFloat(a.hours)||0); }, 0),
    // ... demas metricas
    computedAt: Date.now()
  };
}
```

- [ ] **Paso 2: Invocar tras carga de Excel**

En `handleFile()`, despues de parsear y guardar:

```javascript
// Tras completar la carga exitosa del Excel:
precomputeDashboard();
```

- [ ] **Paso 3: Usar cache en renderDashboard()**

Al inicio de `renderDashboard()`:

```javascript
var currentHash = computeDashHash();
if (_dashCache.hash === currentHash && _dashCache.data) {
  // Usar datos precalculados — render instantaneo
  renderDashboardFromCache(_dashCache.data);
  return;
}
// Si no hay cache valida, calcular normalmente
```

- [ ] **Paso 4: Verificar**

1. Cargar Excel → esperar 2s → navegar a Dashboard → carga instantanea.
2. Modificar datos del catalogo → navegar a Dashboard → recalcula (hash diferente).
3. Sin `requestIdleCallback` (Safari antiguo) → funciona sin precomputar.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.15): dashboard precomputation with requestIdleCallback and hash-based cache"
```

---

### Task F3.16: Checklist de activacion persistente

**Files:**
- Modify: `convocatoria.html:~2956` (HTML — zona Convocatoria, panel colapsable)
- Modify: `convocatoria.html:~1265` (CSS — estilos `.activation-checklist`)
- Modify: `convocatoria.html:~9135` (JS — zona init, logica de checklist)

**Contexto:** Panel colapsable en la parte superior de la app (visible solo las primeras sesiones). 7 pasos: (1) Cargar organigrama, (2) Enviar primera convocatoria, (3) Crear accion formativa, (4) Generar primer XML, (5) Definir formaciones obligatorias, (6) Generar primer informe, (7) Explorar el dashboard. Progreso persistido en `convocatoria_activationChecklist` (localStorage). Se oculta al completar o al pulsar "No mostrar mas".

- [ ] **Paso 1: CSS del checklist**

```css
/* ═══ Activation Checklist ═══ */
.activation-checklist {
  background: var(--accent-subtle);
  border: 1px solid var(--accent-light);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin: 0 16px 16px;
}
.activation-checklist.hidden { display: none; }
.activation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.activation-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.activation-progress {
  font-size: 12px;
  color: var(--text-muted);
}
.activation-dismiss {
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
  border: none;
  background: none;
  padding: 4px 8px;
}
.activation-dismiss:hover { color: var(--text-secondary); }
.activation-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.activation-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 0;
}
.activation-step.done {
  color: var(--text-muted);
  text-decoration: line-through;
}
.activation-check {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  transition: all var(--transition);
}
.activation-step.done .activation-check {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
```

- [ ] **Paso 2: Implementar logica del checklist**

```javascript
const ActivationChecklist = {
  STORAGE_KEY: 'convocatoria_activationChecklist',
  steps: [
    { id: 'loadOrg', label: 'Cargar organigrama', action: function() { document.getElementById('fileInput').click(); } },
    { id: 'sendFirst', label: 'Enviar primera convocatoria', action: function() { applyTabChange('tabConvocatoria'); } },
    { id: 'createAction', label: 'Crear accion formativa', action: function() { applyTabChange('tabCatalogos'); } },
    { id: 'generateXml', label: 'Generar primer XML', action: function() { applyTabChange('tabXml'); } },
    { id: 'setupCompliance', label: 'Definir formaciones obligatorias', action: function() { applyTabChange('tabCatalogos'); } },
    { id: 'generateReport', label: 'Generar primer informe', action: function() { applyTabChange('tabDashboard'); } },
    { id: 'exploreDash', label: 'Explorar el dashboard', action: function() { applyTabChange('tabDashboard'); } },
  ],

  getState() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); } catch(e) { return {}; }
  },

  saveState(s) {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(s)); } catch(e) {}
  },

  markDone(stepId) {
    var s = this.getState();
    s[stepId] = true;
    this.saveState(s);
    this.render();
  },

  isDismissed() {
    var s = this.getState();
    return s._dismissed === true;
  },

  dismiss() {
    var s = this.getState();
    s._dismissed = true;
    this.saveState(s);
    var el = document.getElementById('activationChecklist');
    if (el) el.classList.add('hidden');
  },

  render() {
    var container = document.getElementById('activationChecklist');
    if (!container) return;
    if (this.isDismissed()) { container.classList.add('hidden'); return; }

    var s = this.getState();
    var doneCount = this.steps.filter(function(step) { return s[step.id]; }).length;

    if (doneCount >= this.steps.length) { container.classList.add('hidden'); return; }

    container.classList.remove('hidden');
    container.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'activation-header';
    var title = document.createElement('div');
    title.className = 'activation-title';
    title.textContent = 'Primeros pasos con Formacion_AGORA';
    var progress = document.createElement('span');
    progress.className = 'activation-progress';
    progress.textContent = doneCount + ' de ' + this.steps.length;
    var dismiss = document.createElement('button');
    dismiss.className = 'activation-dismiss';
    dismiss.textContent = 'No mostrar mas';
    dismiss.addEventListener('click', this.dismiss.bind(this));
    header.appendChild(title);
    header.appendChild(progress);
    header.appendChild(dismiss);
    container.appendChild(header);

    var stepsDiv = document.createElement('div');
    stepsDiv.className = 'activation-steps';
    var self = this;
    this.steps.forEach(function(step) {
      var item = document.createElement('div');
      item.className = 'activation-step' + (s[step.id] ? ' done' : '');
      var check = document.createElement('div');
      check.className = 'activation-check';
      check.textContent = s[step.id] ? '\u2713' : '';
      var label = document.createElement('span');
      label.textContent = step.label;
      item.appendChild(check);
      item.appendChild(label);
      if (!s[step.id] && step.action) {
        item.addEventListener('click', function() { step.action(); });
      }
      stepsDiv.appendChild(item);
    });
    container.appendChild(stepsDiv);
  },

  init() {
    this.render();
  }
};
```

- [ ] **Paso 3: Anadir HTML y conectar triggers**

En el HTML, despues de la tab-bar (~linea 2955):
```html
<div class="activation-checklist" id="activationChecklist"></div>
```

En la zona de init:
```javascript
ActivationChecklist.init();
```

Conectar triggers automaticos (en las funciones correspondientes):
```javascript
// En handleFile(), tras carga exitosa:
ActivationChecklist.markDone('loadOrg');

// En btnOpenOutlook handler, tras envio exitoso:
ActivationChecklist.markDone('sendFirst');

// En renderDashboard(), al renderizar por primera vez:
ActivationChecklist.markDone('exploreDash');
```

- [ ] **Paso 4: Verificar**

1. Primera apertura → checklist visible con 7 pasos.
2. Cargar Excel → paso 1 se marca como completado.
3. "No mostrar mas" → checklist desaparece y no vuelve.
4. Completar todos los pasos → checklist desaparece automaticamente.
5. Estado persistido en localStorage.

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F3.16): persistent activation checklist with 7-step onboarding"
```

---

## Fase 4: Extensiones avanzadas (variable, sin deadline)

**Objetivo:** Features opcionales que amplian el alcance de la app. Algunas requieren Power Automate. Solo se abordan cuando Fases 0-3 estan completadas.

**Prerequisitos:** Fases 0, 1, 2 y 3 completadas y mergeadas a main.

---

### Task F4.1: Convocatoria por lotes

**Files:**
- Modify: `convocatoria.html:3155-3165` (HTML — action bar, nuevo boton "Envio por lotes")
- Modify: `convocatoria.html:~8653` (JS — zona envio, logica de lotes)
- Modify: `convocatoria.html:~1370` (CSS — dialogo de preview de lotes)

**Contexto:** Nuevo modo "Envio por lotes". Laura configura datos del evento una vez, selecciona campo de agrupacion (Ubicacion, Departamento, Empresa), la app muestra preview de los lotes generados, al confirmar se anaden a la cola. Mayor ratio de ahorro de tiempo: convierte 15 min en 3 min para misma formacion con N ubicaciones.

- [ ] **Paso 1: Anadir boton en action bar**

```html
<button class="btn btn-secondary" id="btnBatchSend" title="Enviar por lotes">Por lotes</button>
```

- [ ] **Paso 2: Implementar dialogo de configuracion de lotes**

```javascript
function showBatchDialog() {
  var ev = validateEvent();
  if (!ev) return;
  var employees = getSelectedEmployees();
  if (employees.length === 0) { showToast('Selecciona personas destinatarias', 'warning'); return; }

  var groupFields = ['UBICACION', 'DEPARTAMENTO', 'EMPRESA'];
  var available = groupFields.filter(function(f) {
    return employees.some(function(e) { return e[f] && e[f].trim(); });
  });

  if (available.length === 0) { showToast('No hay campos de agrupacion disponibles', 'warning'); return; }

  // Crear dialogo de seleccion de campo de agrupacion
  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay visible';
  overlay.id = 'batchDialog';
  var box = document.createElement('div');
  box.className = 'dialog-box';
  box.style.maxWidth = '520px';
  box.innerHTML = '<h3>Envio por lotes</h3>'
    + '<p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">Agrupar personas destinatarias por:</p>'
    + '<div id="batchFieldSelect" style="display:flex;gap:8px;margin-bottom:16px;justify-content:center;"></div>'
    + '<div id="batchPreview" style="max-height:300px;overflow-y:auto;text-align:left;"></div>'
    + '<div class="dialog-buttons" style="margin-top:16px;">'
    + '<button class="btn btn-secondary" id="batchCancel">Cancelar</button>'
    + '<button class="btn btn-primary" id="batchConfirm" disabled>Anadir a cola</button>'
    + '</div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  var selectedField = null;

  available.forEach(function(field) {
    var btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.textContent = field.charAt(0) + field.slice(1).toLowerCase();
    btn.addEventListener('click', function() {
      document.querySelectorAll('#batchFieldSelect .btn').forEach(function(b) { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      selectedField = field;
      renderBatchPreview(field, employees, ev);
      document.getElementById('batchConfirm').disabled = false;
    });
    document.getElementById('batchFieldSelect').appendChild(btn);
  });

  document.getElementById('batchCancel').addEventListener('click', function() {
    overlay.remove();
  });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  document.getElementById('batchConfirm').addEventListener('click', function() {
    if (!selectedField) return;
    addBatchToQueue(selectedField, employees, ev);
    overlay.remove();
  });
}

function renderBatchPreview(field, employees, ev) {
  var groups = {};
  employees.forEach(function(emp) {
    var key = emp[field] || 'Sin ' + field.toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(emp);
  });

  var preview = document.getElementById('batchPreview');
  preview.textContent = '';
  var keys = Object.keys(groups).sort();
  keys.forEach(function(key) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px;';
    row.innerHTML = '<span>' + esc(key) + '</span><span class="chip" style="font-size:11px;">' + groups[key].length + ' personas</span>';
    preview.appendChild(row);
  });

  var summary = document.createElement('div');
  summary.style.cssText = 'padding:12px;font-size:12px;color:var(--text-muted);text-align:center;';
  summary.textContent = keys.length + ' lotes se anadiran a la cola';
  preview.appendChild(summary);
}

function addBatchToQueue(field, employees, ev) {
  var groups = {};
  employees.forEach(function(emp) {
    var key = emp[field] || 'Sin ' + field.toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(emp);
  });

  var keys = Object.keys(groups).sort();
  keys.forEach(function(key) {
    var queueItem = {
      title: ev.title + ' — ' + key,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location || key,
      employees: groups[key],
      groupField: field,
      groupValue: key
    };
    state.queue.push(queueItem);
  });

  renderQueue();
  saveState();
  showToast(keys.length + ' convocatorias anadidas a la cola', 'success');
}

document.getElementById('btnBatchSend').addEventListener('click', showBatchDialog);
```

- [ ] **Paso 3: Verificar**

1. Seleccionar personas de multiples ubicaciones → "Por lotes" → dialogo con opciones de agrupacion.
2. Seleccionar "Ubicacion" → preview muestra lotes con conteos.
3. "Anadir a cola" → N items en la cola, uno por ubicacion.
4. Sin campo disponible → toast de advertencia.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.1): batch send with grouping by location, department, or company"
```

---

### Task F4.2: Seleccion por lista de NIFs/emails

**Files:**
- Modify: `convocatoria.html:~3040-3060` (HTML — panel izquierdo, seccion filtros, textarea)
- Modify: `convocatoria.html:~7585-7881` (JS — renderFilters()/renderTable(), logica de match)

**Contexto:** Textarea donde Laura pega lista de NIFs o emails. La app hace match con el organigrama y selecciona exactamente esas personas. El match es case-insensitive, ignora espacios, acepta separadores variados (coma, punto y coma, salto de linea, tabulacion). Las personas sin match se muestran como advertencia.

- [ ] **Paso 1: Anadir textarea en panel izquierdo**

En la seccion de filtros, anadir un `<details>` colapsado:

```html
<details class="form-section" id="nifListSection">
  <summary>Seleccion por lista</summary>
  <textarea class="input-field" id="nifListInput" rows="4"
    placeholder="Pega NIFs o emails separados por comas, puntos y coma, o saltos de linea..."
    style="font-size:12px;resize:vertical;"></textarea>
  <div style="display:flex;gap:8px;margin-top:8px;">
    <button class="btn btn-primary" id="btnApplyNifList" style="font-size:12px;flex:1;">Aplicar</button>
    <button class="link-btn link-clear" id="btnClearNifList" style="font-size:12px;">Limpiar</button>
  </div>
  <div id="nifListFeedback" style="font-size:11px;color:var(--text-muted);margin-top:8px;"></div>
</details>
```

- [ ] **Paso 2: Implementar logica de matching**

```javascript
document.getElementById('btnApplyNifList').addEventListener('click', function() {
  var raw = document.getElementById('nifListInput').value.trim();
  if (!raw) { showToast('Pega una lista de NIFs o emails', 'warning'); return; }

  var items = raw.split(/[,;\t\n]+/).map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);
  var matched = [];
  var unmatched = [];

  items.forEach(function(item) {
    var found = (state.employees || []).find(function(emp) {
      var nif = (emp['NIF'] || '').toLowerCase().trim();
      var email = (emp['EMAIL'] || '').toLowerCase().trim();
      return nif === item || email === item;
    });
    if (found) { matched.push(found); } else { unmatched.push(item); }
  });

  if (matched.length === 0) {
    showToast('Ningun NIF o email coincide con el organigrama', 'warning');
    return;
  }

  // Deseleccionar todos, luego seleccionar solo los matched
  state.excludedNIFs = (state.employees || [])
    .filter(function(emp) { return !matched.some(function(m) { return m._id === emp._id; }); })
    .map(function(emp) { return emp._id; });

  renderTable();
  saveState();

  var feedback = document.getElementById('nifListFeedback');
  var msg = matched.length + ' personas encontradas.';
  if (unmatched.length > 0) {
    msg += ' ' + unmatched.length + ' sin coincidencia: ' + unmatched.slice(0, 5).join(', ') + (unmatched.length > 5 ? '...' : '');
  }
  feedback.textContent = msg;
  showToast(matched.length + ' personas seleccionadas', 'success');
});

document.getElementById('btnClearNifList').addEventListener('click', function() {
  document.getElementById('nifListInput').value = '';
  document.getElementById('nifListFeedback').textContent = '';
  state.excludedNIFs = [];
  renderTable();
  saveState();
});
```

- [ ] **Paso 3: Verificar**

1. Pegar lista de NIFs → "Aplicar" → solo esas personas seleccionadas.
2. Pegar emails → match correcto, case-insensitive.
3. NIFs sin match → feedback con listado.
4. "Limpiar" → restaura seleccion completa.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.2): select employees by pasting NIF or email list"
```

---

### Task F4.3: Recordatorios automaticos via PA

**Files:**
- Modify: `convocatoria.html:~3060-3090` (HTML — datos del evento, checkbox recordatorio)
- Modify: `convocatoria.html:~8653-8743` (JS — zona envio, enviar payload recordatorio a PA)

**Contexto:** Checkbox en datos del evento: "Enviar recordatorio X dias antes" que usa el webhook de PA para programar email de recordatorio. Reutiliza `sendSurveyEmail()` con `type: "reminder"`. El flujo de PA necesita un branch adicional `if type == 'reminder'` → `Delay until` + `Send email (V2)`. La parte de PA no se implementa aqui — solo el JS.

- [ ] **Paso 1: Anadir checkbox en datos del evento**

```html
<div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
  <input type="checkbox" id="chkReminder" style="margin:0;">
  <label for="chkReminder" style="font-size:12px;color:var(--text-secondary);">Enviar recordatorio</label>
  <select id="selReminderDays" class="filter-select" style="font-size:12px;width:auto;padding:4px 8px;" disabled>
    <option value="1">1 dia antes</option>
    <option value="2" selected>2 dias antes</option>
    <option value="3">3 dias antes</option>
  </select>
</div>
```

```javascript
document.getElementById('chkReminder').addEventListener('change', function() {
  document.getElementById('selReminderDays').disabled = !this.checked;
});
```

- [ ] **Paso 2: Integrar en flujo de envio**

En el handler de `btnOpenOutlook`, despues del envio exitoso:

```javascript
if (document.getElementById('chkReminder').checked) {
  var daysBeforeReminder = parseInt(document.getElementById('selReminderDays').value, 10);
  var eventDate = new Date(ev.date);
  var reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - daysBeforeReminder);
  reminderDate.setHours(9, 0, 0, 0);

  var reminderPayload = {
    type: 'reminder',
    to: selectedEmails,
    subject: 'Recordatorio: ' + ev.title,
    eventTitle: ev.title,
    eventDate: ev.date,
    eventTime: ev.startTime,
    eventLocation: ev.location || '',
    scheduledTime: reminderDate.toISOString()
  };

  // Reutilizar el webhook existente de PA
  fetch(getSurveyWebhookUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderPayload)
  }).then(function() {
    showToast('Recordatorio programado para ' + reminderDate.toLocaleDateString('es-ES'), 'success');
  }).catch(function(err) {
    showToast('Error al programar recordatorio: ' + err.message, 'warning');
  });
}
```

- [ ] **Paso 3: Verificar**

1. Checkbox desactivado por defecto → select deshabilitado.
2. Activar checkbox → select se habilita.
3. Enviar convocatoria con recordatorio → payload enviado al webhook con type "reminder".
4. Sin webhook configurado → error capturado en catch.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.3): pre-training reminders via Power Automate webhook"
```

---

### Task F4.4: Sync automatica encuestas PA (reenvio)

**Files:**
- Modify: `convocatoria.html:~8653-8743` (JS — zona envio, programar reenvio de encuesta)

**Contexto:** Al enviar encuesta de satisfaccion, programar automaticamente reenvio 7 dias despues via PA. Tipo `survey_reminder`. Extension minima del flujo PA existente. No sabe quien ha respondido (limitacion aceptable). La parte PA necesita branch `if type == 'survey_reminder'`.

- [ ] **Paso 1: Implementar reenvio automatico**

En la funcion que envia encuestas (`sendSurveyEmail`), despues de enviar la encuesta original:

```javascript
function scheduleSurveyReminder(surveyPayload) {
  var reminderDate = new Date(surveyPayload.scheduledTime || Date.now());
  reminderDate.setDate(reminderDate.getDate() + 7);

  var reminderPayload = {
    type: 'survey_reminder',
    to: surveyPayload.to,
    subject: 'Recordatorio: Tu opinion nos importa',
    formsUrl: surveyPayload.formsUrl,
    eventTitle: surveyPayload.eventTitle || '',
    scheduledTime: reminderDate.toISOString()
  };

  fetch(getSurveyWebhookUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderPayload)
  }).catch(function(err) {
    console.warn('Error al programar reenvio de encuesta:', err);
  });
}
```

- [ ] **Paso 2: Invocar tras envio de encuesta**

En la logica existente de `sendSurveyEmail`, tras el `.then()` exitoso:

```javascript
// Dentro del .then() de sendSurveyEmail:
scheduleSurveyReminder(payload);
```

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.4): automatic survey reminder via PA 7 days after initial send"
```

---

### Task F4.5: Virtual scrolling en tabla de personas destinatarias

**Files:**
- Modify: `convocatoria.html:~400-450` (CSS — tabla, altura fija y overflow)
- Modify: `convocatoria.html:7881-8030` (JS — renderTable(), virtual scrolling)

**Contexto:** Para datasets >500 filas, renderizar solo las filas visibles + 20 de buffer. Sin dependencias externas. El contenedor de la tabla `#employeeTableContainer` ya tiene `overflow-y: auto`. La clave es calcular la posicion del scroll, determinar que filas son visibles, y renderizar solo esas con spacers arriba y abajo.

- [ ] **Paso 1: Implementar virtual scrolling**

```javascript
const VirtualScroll = {
  ROW_HEIGHT: 36,
  BUFFER: 20,
  THRESHOLD: 500,

  isActive(totalRows) { return totalRows > this.THRESHOLD; },

  setup(container, tbody, allRows) {
    if (!this.isActive(allRows.length)) {
      // Render normal para datasets pequenos
      allRows.forEach(function(row) { tbody.appendChild(row); });
      return;
    }

    var totalHeight = allRows.length * this.ROW_HEIGHT;
    var spacerTop = document.createElement('tr');
    spacerTop.id = 'vsSpacerTop';
    var spacerBottom = document.createElement('tr');
    spacerBottom.id = 'vsSpacerBottom';

    tbody.appendChild(spacerTop);
    tbody.appendChild(spacerBottom);

    var self = this;
    var rafId = null;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        rafId = null;
        self.renderVisible(container, tbody, allRows, spacerTop, spacerBottom, totalHeight);
      });
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    self.renderVisible(container, tbody, allRows, spacerTop, spacerBottom, totalHeight);
  },

  renderVisible(container, tbody, allRows, spacerTop, spacerBottom, totalHeight) {
    var scrollTop = container.scrollTop;
    var viewHeight = container.clientHeight;
    var startIndex = Math.max(0, Math.floor(scrollTop / this.ROW_HEIGHT) - this.BUFFER);
    var endIndex = Math.min(allRows.length, Math.ceil((scrollTop + viewHeight) / this.ROW_HEIGHT) + this.BUFFER);

    // Remove old visible rows
    while (tbody.children.length > 2) {
      var child = tbody.children[1];
      if (child === spacerBottom) break;
      tbody.removeChild(child);
    }

    // Set spacer heights
    spacerTop.style.height = (startIndex * this.ROW_HEIGHT) + 'px';
    spacerBottom.style.height = ((allRows.length - endIndex) * this.ROW_HEIGHT) + 'px';

    // Insert visible rows
    var frag = document.createDocumentFragment();
    for (var i = startIndex; i < endIndex; i++) {
      frag.appendChild(allRows[i]);
    }
    tbody.insertBefore(frag, spacerBottom);
  }
};
```

- [ ] **Paso 2: Integrar en renderTable()**

En `renderTable()`, despues de construir todas las filas como array:

```javascript
// En vez de: filtered.forEach(emp => tbody.appendChild(createRow(emp)));
// Hacer:
var allRowElements = filtered.map(function(emp) { return createRow(emp); });
VirtualScroll.setup(tableContainer, tbody, allRowElements);
```

- [ ] **Paso 3: Verificar**

1. Dataset < 500 → render normal completo.
2. Dataset > 500 → solo filas visibles + buffer renderizadas.
3. Scroll rapido → filas se actualizan fluidamente.
4. Seleccion/exclusion funciona correctamente con virtual scroll.

- [ ] **Paso 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.5): virtual scrolling for large datasets (>500 rows)"
```

---

### Task F4.6: Dark mode

**Files:**
- Modify: `convocatoria.html:13-55` (CSS — `:root`, tokens dark bajo `[data-theme="dark"]`)
- Modify: `convocatoria.html:3712-3770` (HTML — settingsDialog, toggle dark mode)
- Modify: `convocatoria.html:~6711` (JS — getSettings(), persistir tema)

**Contexto:** Tokens dark bajo `[data-theme="dark"]` en `:root`. Toggle en ajustes con 3 opciones: Claro, Oscuro, Sistema. Depende de que F0.1 (migracion de estilos inline) este significativamente avanzada. Los estilos inline que queden NO responderan al tema oscuro — por eso es Fase 4.

- [ ] **Paso 1: Definir tokens dark**

Despues del bloque `:root` existente (linea ~55):

```css
[data-theme="dark"] {
  --accent: #818CF8; /* Indigo-400 */
  --accent-hover: #6366F1; /* Indigo-500 */
  --accent-light: #312E81; /* Indigo-900 */
  --accent-subtle: #1E1B4B; /* Indigo-950 */
  --text-primary: #f1f5f9; /* Slate-100 */
  --text-secondary: #94a3b8; /* Slate-400 */
  --text-muted: #64748b; /* Slate-500 */
  --bg-primary: #0f172a; /* Slate-900 */
  --bg-panel: #1e293b; /* Slate-800 */
  --bg-input: #334155; /* Slate-700 */
  --border: #334155; /* Slate-700 */
  --border-strong: #475569; /* Slate-600 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
}

@media (prefers-color-scheme: dark) {
  [data-theme="system"] {
    --accent: #818CF8;
    --accent-hover: #6366F1;
    --accent-light: #312E81;
    --accent-subtle: #1E1B4B;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --bg-primary: #0f172a;
    --bg-panel: #1e293b;
    --bg-input: #334155;
    --border: #334155;
    --border-strong: #475569;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
  }
}
```

- [ ] **Paso 2: Anadir selector en ajustes**

En `#settingsDialog`:

```html
<label style="font-size:13px;color:var(--text-secondary);">Tema</label>
<select id="themeSelect" class="input-field" style="font-size:13px;">
  <option value="light">Claro</option>
  <option value="dark">Oscuro</option>
  <option value="system">Sistema</option>
</select>
```

- [ ] **Paso 3: Implementar cambio de tema**

```javascript
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { var s = getSettings(); s.theme = theme; saveSettings(s); } catch(e) {}
}

function initTheme() {
  var s = getSettings();
  var theme = s.theme || 'light';
  applyTheme(theme);
  var sel = document.getElementById('themeSelect');
  if (sel) sel.value = theme;
}

document.getElementById('themeSelect')?.addEventListener('change', function() {
  applyTheme(this.value);
});

initTheme();
```

- [ ] **Paso 4: Verificar**

1. Claro → paleta original. Oscuro → fondo slate-900, textos claros.
2. Sistema → respeta `prefers-color-scheme` del OS.
3. Persistencia: al recargar mantiene el tema elegido.
4. Los estilos inline que no usen variables CSS quedaran incoherentes (esperado si F0.1 no esta completa).

- [ ] **Paso 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.6): dark mode with light/dark/system toggle"
```

---

### Task F4.7: Backup JSON

**Files:**
- Modify: `convocatoria.html:3712-3770` (HTML — settingsDialog, botones export/import)
- Modify: `convocatoria.html:~6711` (JS — funciones de backup)

**Contexto:** Boton "Exportar datos" que serializa todo el estado a JSON. Boton "Importar datos" que lee JSON y restaura. Recordatorio en `convocatoria_lastBackup`: tras 7 dias sin backup, toast suave al abrir la app.

- [ ] **Paso 1: Implementar export/import**

```javascript
function exportBackup() {
  var data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state: null, employees: null, fileName: null,
    catalog: null, settings: null, history: null,
    queue: null, presets: null, templates: null
  };
  try {
    data.state = JSON.parse(localStorage.getItem('convocatoria_state') || 'null');
    data.employees = JSON.parse(localStorage.getItem('convocatoria_employees') || 'null');
    data.fileName = localStorage.getItem('convocatoria_fileName');
    data.catalog = JSON.parse(localStorage.getItem('fundae_catalogActions') || '[]');
    data.settings = JSON.parse(localStorage.getItem('convocatoria_settings') || '{}');
    data.history = JSON.parse(localStorage.getItem('convocatoria_history') || '[]');
    data.queue = JSON.parse(localStorage.getItem('convocatoria_queue') || '[]');
    data.presets = JSON.parse(localStorage.getItem('convocatoria_presets') || '[]');
    data.templates = JSON.parse(localStorage.getItem('convocatoria_templates') || '[]');
  } catch(e) {}

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'formacion_agora_backup_' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  try { localStorage.setItem('convocatoria_lastBackup', new Date().toISOString()); } catch(e) {}
  showToast('Backup exportado correctamente', 'success');
}

function importBackup() {
  var input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      try {
        var data = JSON.parse(evt.target.result);
        if (!data.version) { showToast('Archivo de backup no valido', 'error'); return; }
        if (data.state) localStorage.setItem('convocatoria_state', JSON.stringify(data.state));
        if (data.employees) localStorage.setItem('convocatoria_employees', JSON.stringify(data.employees));
        if (data.fileName) localStorage.setItem('convocatoria_fileName', data.fileName);
        if (data.catalog) localStorage.setItem('fundae_catalogActions', JSON.stringify(data.catalog));
        if (data.settings) localStorage.setItem('convocatoria_settings', JSON.stringify(data.settings));
        if (data.history) localStorage.setItem('convocatoria_history', JSON.stringify(data.history));
        if (data.queue) localStorage.setItem('convocatoria_queue', JSON.stringify(data.queue));
        if (data.presets) localStorage.setItem('convocatoria_presets', JSON.stringify(data.presets));
        if (data.templates) localStorage.setItem('convocatoria_templates', JSON.stringify(data.templates));
        showToast('Backup restaurado. Recargando...', 'success');
        setTimeout(function() { location.reload(); }, 1500);
      } catch(err) { showToast('Error al leer backup: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
  });
  input.click();
}

// Recordatorio de backup
function checkBackupReminder() {
  try {
    var last = localStorage.getItem('convocatoria_lastBackup');
    if (!last) return;
    var daysSince = (Date.now() - new Date(last).getTime()) / (1000*60*60*24);
    if (daysSince >= 7) {
      showToast('Hace ' + Math.floor(daysSince) + ' dias que no exportas un backup', 'info', 6000);
    }
  } catch(e) {}
}
```

- [ ] **Paso 2: Anadir botones en ajustes**

```html
<div style="display:flex;gap:8px;margin-top:12px;">
  <button class="btn btn-secondary" onclick="exportBackup()" style="flex:1;font-size:12px;">Exportar datos</button>
  <button class="btn btn-secondary" onclick="importBackup()" style="flex:1;font-size:12px;">Importar datos</button>
</div>
```

- [ ] **Paso 3: Invocar recordatorio al abrir**

En init: `checkBackupReminder();`

- [ ] **Paso 4: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.7): JSON backup export/import with weekly reminder"
```

---

### Task F4.8: Perfil formativo persona trabajadora

**Files:**
- Modify: `convocatoria.html:13047-15000` (JS — dashboard, nueva funcion de busqueda y perfil)
- Modify: `convocatoria.html:~3501` (HTML — dashboard, campo de busqueda)

**Contexto:** Buscador en el dashboard para localizar una persona trabajadora. Perfil con: formaciones recibidas, horas acumuladas, formaciones obligatorias vigentes/caducadas, certificados emitidos. Datos cruzados entre organigrama, catalogo y compliance. Panel inline (no dialogo).

- [ ] **Paso 1: Anadir buscador en dashboard**

```html
<div style="margin:12px 16px;">
  <input class="input-field" id="workerSearchInput" type="text"
    placeholder="Buscar persona trabajadora por nombre o NIF..." style="font-size:13px;">
</div>
<div id="workerProfilePanel" style="display:none; margin:0 16px 16px; padding:16px; background:var(--bg-panel); border:1px solid var(--border); border-radius:var(--radius);"></div>
```

- [ ] **Paso 2: Implementar busqueda y renderizado de perfil**

```javascript
document.getElementById('workerSearchInput').addEventListener('input', debounce(function() {
  var q = this.value.trim().toLowerCase();
  if (q.length < 2) { document.getElementById('workerProfilePanel').style.display = 'none'; return; }

  var match = (state.employees || []).find(function(emp) {
    return (emp['NOMBRE'] || '').toLowerCase().includes(q) || (emp['NIF'] || '').toLowerCase().includes(q);
  });

  if (!match) { document.getElementById('workerProfilePanel').style.display = 'none'; return; }
  renderWorkerProfile(match);
}, 300));

function renderWorkerProfile(emp) {
  var panel = document.getElementById('workerProfilePanel');
  panel.style.display = '';

  var actions = getAllCatalogActions();
  var participated = actions.filter(function(a) {
    return (a.participants || []).some(function(p) { return p.nif === emp['NIF']; });
  });
  var totalHours = participated.reduce(function(s, a) { return s + (parseFloat(a.hours) || 0); }, 0);

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
    + '<div><strong style="font-size:14px;">' + esc(emp['NOMBRE'] || '') + '</strong>'
    + '<div style="font-size:12px;color:var(--text-muted);">' + esc(emp['NIF'] || '') + ' | ' + esc(emp['DEPARTAMENTO'] || '') + ' | ' + esc(emp['PUESTO'] || '') + '</div></div>'
    + '<div style="text-align:right;"><div style="font-size:20px;font-weight:700;color:var(--accent);">' + totalHours + 'h</div>'
    + '<div style="font-size:11px;color:var(--text-muted);">' + participated.length + ' formaciones</div></div></div>';

  if (participated.length > 0) {
    html += '<div style="font-size:12px;font-weight:600;margin:8px 0 4px;">Formaciones recibidas</div>';
    html += '<div style="max-height:200px;overflow-y:auto;">';
    participated.forEach(function(a) {
      html += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px;">'
        + '<span>' + esc(a.title || '') + '</span><span style="color:var(--text-muted);">' + (a.hours || 0) + 'h | ' + esc(a.dateRange || '') + '</span></div>';
    });
    html += '</div>';
  }

  panel.innerHTML = html;
}
```

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.8): worker training profile with participation history"
```

---

### Task F4.9: Informe personalizable

**Files:**
- Modify: `convocatoria.html:13047-15000` (JS — dashboard, dialogo de seleccion de secciones)

**Contexto:** Extension de F3.9 (informe para Direccion). Antes de generar, mostrar checklist de secciones a incluir. Opcion de anadir header con logo de empresa (data URL). Reutilizar la funcion `generateDirectionReport()` con parametros de configuracion.

- [ ] **Paso 1: Implementar dialogo de personalizacion**

```javascript
function showCustomReportDialog() {
  var sections = [
    { id: 'kpis', label: 'KPIs resumen', checked: true },
    { id: 'modality', label: 'Distribucion por modalidad', checked: true },
    { id: 'department', label: 'Participacion por departamento', checked: true },
    { id: 'actions', label: 'Listado de acciones', checked: false },
    { id: 'compliance', label: 'Estado de compliance', checked: false },
    { id: 'credit', label: 'Credito FUNDAE', checked: false },
  ];

  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay visible';
  var box = document.createElement('div');
  box.className = 'dialog-box';
  box.style.maxWidth = '420px';
  box.style.textAlign = 'left';

  var html = '<h3 style="text-align:center;">Personalizar informe</h3>';
  sections.forEach(function(s) {
    html += '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;cursor:pointer;">'
      + '<input type="checkbox" data-section="' + s.id + '"' + (s.checked ? ' checked' : '') + '>'
      + s.label + '</label>';
  });
  html += '<div class="dialog-buttons" style="margin-top:16px;text-align:center;">'
    + '<button class="btn btn-secondary" id="customReportCancel">Cancelar</button>'
    + '<button class="btn btn-primary" id="customReportGenerate">Generar</button></div>';
  box.innerHTML = html;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById('customReportCancel').addEventListener('click', function() { overlay.remove(); });
  document.getElementById('customReportGenerate').addEventListener('click', function() {
    var selected = {};
    box.querySelectorAll('input[data-section]').forEach(function(cb) {
      selected[cb.dataset.section] = cb.checked;
    });
    overlay.remove();
    generateDirectionReport(selected);
  });
}
```

- [ ] **Paso 2: Actualizar boton para usar el dialogo**

```javascript
document.getElementById('btnReportDirection').removeEventListener('click', generateDirectionReport);
document.getElementById('btnReportDirection').addEventListener('click', showCustomReportDialog);
```

- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.9): customizable report with section selector dialog"
```

---

### Task F4.10: Diff de organigrama

**Files:**
- Modify: `convocatoria.html:7401-7540` (JS — handleFile(), comparar con datos previos)

**Contexto:** Al cargar nuevo Excel con datos previos en sesion, comparar por NIF. Avisar de participantes en acciones activas que ya no estan.

- [ ] **Paso 1: Implementar comparacion**

```javascript
function compareOrganigrams(oldEmps, newEmps) {
  var oldByNif = {}, newByNif = {};
  (oldEmps || []).forEach(function(e) { if (e.NIF) oldByNif[e.NIF] = e; });
  (newEmps || []).forEach(function(e) { if (e.NIF) newByNif[e.NIF] = e; });
  var added = [], removed = [], changed = [];
  Object.keys(newByNif).forEach(function(nif) {
    if (!oldByNif[nif]) added.push(newByNif[nif]);
    else if (oldByNif[nif].DEPARTAMENTO !== newByNif[nif].DEPARTAMENTO) changed.push(nif);
  });
  Object.keys(oldByNif).forEach(function(nif) { if (!newByNif[nif]) removed.push(oldByNif[nif]); });
  return { added: added, removed: removed, changed: changed };
}
```

- [ ] **Paso 2: Invocar en handleFile() y verificar**

```bash
git add convocatoria.html
git commit -m "feat(F4.10): organigrm diff with change summary and participant warnings"
```

---

### Task F4.11: Datos de ejemplo en dashboard

**Files:**
- Modify: `convocatoria.html:13047-15000` (JS — dashboard, datos sinteticos)

**Contexto:** Boton en empty state del dashboard. Dataset sintetico de 3-5 acciones. Solo en memoria, no persiste. Banner visual "Datos de ejemplo".

- [ ] **Paso 1: Implementar loadDemoData() y clearDemoData()**

Datos sinteticos con 3 acciones: PRL (cerrada, 3 participantes), LOPD (convocada, 2 participantes), Liderazgo (en preparacion, 1 participante). Boton en empty state. Banner en modo demo.

- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.11): demo data in dashboard with non-persistent synthetic dataset"
```

---

### Task F4.12: Tipografia fluida con clamp()

**Files:**
- Modify: `convocatoria.html:13-55` (CSS — `:root`, clamp() en font-sizes)
- Modify: `convocatoria.html:~6` (HTML — Inter variable font import)

**Contexto:** Inter variable font (`wght@300..700`), clamp() en tamanos principales.

- [ ] **Paso 1: Actualizar import y aplicar clamp()**

```css
body { font-size: clamp(12px, 0.8vw + 8px, 14px); }
```

- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.12): fluid typography with clamp() and Inter variable font"
```

---

### Task F4.13: Unificacion de templates

**Files:**
- Modify: `convocatoria.html:6729-7013` (JS — 3 sistemas de templates → 1)
- Modify: `convocatoria.html:~3040` (HTML — dropdown unificado)

**Contexto:** Unificar convocatoria_templates, convocatoria_filterTemplates, convocatoria_trainingTemplates en convocatoria_unifiedTemplates. Migracion automatica.

- [ ] **Paso 1: Implementar estructura unificada y migracion**

Un solo dropdown "Plantillas", boton "Guardar", boton "Cargar". Cada plantilla guarda filtros + evento + exclusiones + vinculacion catalogo.

- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.13): unified template system with automatic migration"
```

---

### Task F4.14: Plan anual de formacion

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — catalogo, sub-vista "Plan anual")

**Contexto:** Sub-pestana en Catalogos con acciones "Planificadas" agrupadas por trimestre. Vista plan vs. ejecucion. Boton "Activar" que cambia estado a "En preparacion".

- [ ] **Paso 1: Implementar renderAnnualPlan()**

Vista por trimestres Q1-Q4, conteo de acciones, boton "Activar" por accion.

- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.14): annual training plan with quarterly view"
```

---

### Task F4.15: Gestion ampliada de proveedores

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — catalogo, ampliar ficha proveedores)

**Contexto:** Campos adicionales: contacto, telefono, email, especialidades, tarifa. Scorecard automatico: acciones, coste medio, ultima colaboracion.

- [ ] **Paso 1: Ampliar formulario y calcular scorecard**
- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.15): extended provider management with scorecard"
```

---

### Task F4.16: Listas de espera

**Files:**
- Modify: `convocatoria.html:~3060` (HTML — campo "Aforo maximo")
- Modify: `convocatoria.html:~8653` (JS — logica espera)

**Contexto:** Campo opcional aforo. Si seleccionadas > aforo, crear lista de espera. Paso automatico al eliminar confirmado.

- [ ] **Paso 1: Implementar checkWaitlist()**
- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.16): waitlist management with capacity overflow"
```

---

### Task F4.17: Mini-TNA

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — catalogo, sub-vista "Necesidades")

**Contexto:** Formulario de solicitud de formacion (area, tema, justificacion, urgencia). Exportable/importable. Boton "Crear accion formativa" que pre-rellena. Sub-pestana en Catalogos.

- [ ] **Paso 1: Implementar renderTNAView() con CRUD de solicitudes**
- [ ] **Paso 2: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.17): mini-TNA with training request management"
```

---

### Task F4.18: Evaluacion Kirkpatrick L1-L2

**Files:**
- Modify: `convocatoria.html:4933-6440` (JS — catalogo, seccion evaluacion en ficha)
- Modify: `convocatoria.html:13047-15000` (JS — dashboard, metricas evaluacion)

**Contexto:** L1: utilidad (1-5), calidad formador (1-5), materiales (1-5), NPS (0-10), num. respuestas. L2: puntuacion pre/post test (%), mejora calculada. Resultados agregados por accion y proveedor. L3-L4 fuera de alcance.

- [ ] **Paso 1: Ampliar modelo de datos con evaluation y renderizar seccion**
- [ ] **Paso 2: Integrar metricas en dashboard**
- [ ] **Paso 3: Verificar y commit**

```bash
git add convocatoria.html
git commit -m "feat(F4.18): Kirkpatrick L1-L2 evaluation with NPS and pre/post scores"
```

---

## Mapa de paralelismo Fases 3-4

### Fase 3: 4 lanes paralelas

```
Prerequisito: Fases 0-2 mergeadas a main
  │
  ├── Lane E (worktree-e): F3.1 → F3.2
  │     Command palette + atajos de teclado
  │     Secciones: CSS ~1421, HTML ~3696, JS ~3952
  │
  ├── Lane F (worktree-f): F3.3 → F3.4 → F3.5 → F3.16
  │     Empty states + dashboard + checklist activacion
  │     Secciones: CSS ~1265, JS ~10816/13047, HTML ~3131/3402/3455/2955
  │
  ├── Lane G (worktree-g): F3.6 → F3.7 → F3.8 → F3.9 → F3.10
  │     Documentos y reporting (PDF, firmas, certs, dossier, informes)
  │     Secciones: JS ~4933/8653/13047, HTML ~3160/3501
  │
  └── Lane H (worktree-h): F3.11 → F3.12 → F3.13 → F3.14 → F3.15
        Pulido visual + rendimiento
        Secciones: CSS ~400/1370, JS ~3931/7401/7881/14620
```

### Dependencias Fase 3

| Tarea | Depende de | Razon |
|-------|-----------|-------|
| F3.2 | F3.1 | Atajos dependen de CmdK |
| F3.4 | F3.3 | Empty states antes de divulgacion progresiva |
| F3.5 | F3.4 | Dashboard progresivo antes de accionable |
| F3.7 | F3.6 | Branding PDF antes de firmas/certificados |
| F3.8 | F3.7 | Hojas de firmas antes de dossier |
| F3.15 | F3.13 | View transitions antes de precomputacion |
| F3.16 | F3.3 | Checklist usa createEmptyState() |

### Orden de merge Fase 3

1. Lane H (pulido — bajo riesgo de conflicto)
2. Lane E (paleta/atajos — nuevo overlay, bajo conflicto)
3. Lane F (empty states/dashboard — toca renderDashboard)
4. Lane G (documentos — toca catalogo y dashboard)

### Fase 4: 7 lanes bajo demanda

```
Prerequisito: Fases 0-3 mergeadas a main
  │
  ├── Lane I: F4.1 → F4.2 → F4.16   (Convocatoria: lotes, NIFs, espera)
  ├── Lane J: F4.3 → F4.4            (Power Automate: recordatorios, reenvio)
  ├── Lane K: F4.5 → F4.12           (Rendimiento: virtual scroll, tipografia)
  ├── Lane L: F4.6 → F4.7            (Infraestructura: dark mode, backup)
  ├── Lane M: F4.8 → F4.9 → F4.11   (Dashboard: perfil, informe, datos ejemplo)
  ├── Lane N: F4.10 → F4.13          (Datos: diff organigrama, templates)
  └── Lane O: F4.14 → F4.15 → F4.17 → F4.18  (Catalogo: plan, proveedores, TNA, Kirkpatrick)
```

---

## Resumen final: todas las fases

| Fase | Tareas | Esfuerzo est. | Lanes | Prerequisitos |
|------|--------|---------------|-------|---------------|
| **Fase 0** | 4 (F0.1-F0.4) | 7-10h | 1 (secuencial) | Ninguno |
| **Fase 1** | 9 (F1.1-F1.9) | 16-21h | 4 (A-D) | Fase 0 |
| **Fase 2** | 12 (F2.1-F2.12) | 40-55h | Por definir | Fase 1 |
| **Fase 3** | 16 (F3.1-F3.16) | 40-55h | 4 (E-H) | Fase 2 |
| **Fase 4** | 18 (F4.1-F4.18) | 55-80h | 7 (I-O) | Fase 3 |

| Metrica | Valor |
|---------|-------|
| **Total tareas** | 59 |
| **Total esfuerzo secuencial** | 158-221h (~20-28 dias) |
| **Lanes paralelas maximas** | 7 (Fase 4) |
| **Timeline con paralelismo** | ~12-18 dias laborables |

### Timeline estimado

```
Semana 1-2:   Fase 0 (secuencial) + Fase 1 (4 lanes)
Semana 3-4:   Fase 2 (lanes por definir en Parte 2)
Semana 5-7:   Fase 3 (4 lanes: E, F, G, H)
Semana 8+:    Fase 4 (bajo demanda, sin deadline)
```

### Directivas clave

1. **NO semaforos, NO sound design, NO confetti, NO flash de color** — solo opacidad como indicador de estado.
2. **Atajos:** Alt+1..5 para pestanas, deteccion OS con `navigator.userAgentData?.platform || navigator.platform`.
3. **Terminologia:** persona trabajadora, persona destinataria, formacion obligatoria, Formacion_AGORA.
4. **Fase 4 es YAGNI** — implementar solo cuando Laura lo pida.
5. **Cada commit es un incremento funcional** — la app nunca queda rota.
6. **`prefers-reduced-motion`** — todas las animaciones nuevas deben respetarlo.
7. **`esc()`** — todo contenido dinamico del Excel sanitizado antes de innerHTML.
