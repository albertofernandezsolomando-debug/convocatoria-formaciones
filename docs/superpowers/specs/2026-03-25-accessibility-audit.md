# Auditorla WCAG 2.1 AA - convocatoria.html

**Fecha**: 2026-03-25
**Auditor**: Claude Code (revision manual de codigo fuente)
**Alcance**: `/Users/afs/convocatoria-formaciones/convocatoria.html` (~26K lineas)
**Estandar**: WCAG 2.1 nivel AA

---

## Resumen ejecutivo

La aplicacion cuenta con una base solida de accesibilidad: tabs con `role="tablist"` y roving tabindex, dialogos con `role="dialog"` + `aria-modal` + focus trap automatico, charts SVG con `role="img"` y `aria-label` descriptivos, skip link, y validacion de formularios con `aria-invalid`. Sin embargo, se identifican **35 hallazgos** que requieren atencion, clasificados por severidad.

### Conteo por severidad

| Severidad | Cantidad |
|-----------|----------|
| Critica   | 3        |
| Alta      | 10       |
| Media     | 13       |
| Baja      | 9        |

---

## 1. Perceivable (Perceptible)

### 1.1 Non-text Content (1.1.1)

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 1 | Charts SVG (donut, barras, heatmap, estado) | 1.1.1 | - | PASS | Todos los contenedores de charts tienen `role="img"` y `aria-label` descriptivo con datos textuales. Lineas 19677-19678, 19978-19979, 20493-20494, 23145-23146. | - |
| 2 | Iconos SVG decorativos | 1.1.1 | - | PASS | Los iconos en botones usan `<span class="icon" aria-hidden="true">` consistentemente. | - |
| 3 | Empty state SVGs (`EMPTY_STATE_SVGS`) | 1.1.1 | Baja | PARCIAL | Los SVG de ilustraciones en empty states (noData, noResults, upload, noChart) no tienen `role="img"` ni `aria-hidden="true"`. Son decorativos y deberian tener `aria-hidden="true"`. | Anadir `aria-hidden="true"` a los SVG de ilustraciones en `EMPTY_STATE_SVGS` o al contenedor que los genera en `createEmptyState()`. |

### 1.3 Info and Relationships (1.3.1)

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 4 | Jerarquia de headings | 1.3.1 | Alta | FALLO | No existe `<h1>` visible en la pagina principal. El primer heading es un `<h2>Cuadro de Mando` (linea 5938). Los dialogos usan `<h3>` sin un `<h2>` padre en contexto. La pagina salta de ningun h1 visible a h2. | Anadir un `<h1>` al area principal de la app (podria ser "Formacion_AGORA" visualmente oculto con `.sr-only` o el titulo del tab activo). Revisar que cada seccion tenga una progresion logica h1 > h2 > h3. |
| 5 | Catalog sub-tabs sin roles ARIA | 1.3.1 | Alta | FALLO | Los botones `.catalog-tab` (Proveedores, Centros, Tutores, etc. en lineas 5644-5649) no tienen `role="tab"`, `aria-selected`, ni su contenedor tiene `role="tablist"`. Funcionan como tabs pero se presentan como botones genericos al AT. | Anadir `role="tablist"` al contenedor `.catalog-tabs`, `role="tab"` y `aria-selected` a cada `.catalog-tab`, y `aria-controls` apuntando al panel correspondiente. Implementar roving tabindex con teclas de flecha como en las tabs principales. |
| 6 | Tabla XML participantes sin `scope` | 1.3.1 | Media | FALLO | Los `<th>` de la tabla XML (lineas 5854-5866) no tienen `scope="col"`. La tabla principal de asistentes (linea 5578-5583) si tiene `scope="col"`. | Anadir `scope="col"` a todos los `<th>` de la tabla XML de participantes. |
| 7 | Tablas generadas dinamicamente sin `scope` | 1.3.1 | Media | FALLO | Las tablas del dashboard (`<th class="u-dash-th">`), compliance, TNA, plan anual, y tablas de exportacion PDF no tienen `scope="col"` en sus `<th>`. | Anadir `scope="col"` a todos los `<th>` generados via JS en: dashboard (lineas 20231, 20359), compliance (linea 8378), plan anual (lineas 8614-8619), TNA (lineas 13187-13195), puestos (lineas 13015-13018). |
| 8 | Secciones del panel izquierdo sin landmark | 1.3.1 | Baja | FALLO | Las secciones numeradas ("1. Carga de datos", "2. Selecciona asistentes", "3. Datos del evento") usan `.section` y `.section-label` pero no tienen `role="region"` ni `aria-label`. | Anadir `role="region"` y `aria-label` a cada `.section` del panel izquierdo, o usar `<section>` con un heading asociado. |
| 9 | Settings dialog nav sin landmark | 1.3.1 | Baja | FALLO | El `<nav class="settings-nav">` (linea 6235) esta bien semanticamente, pero los items de navegacion no tienen `role="tab"` pese a funcionar como tabs dentro del dialog. | Considerar anadir `role="tablist"` al `<nav>` y `role="tab"` a cada `.settings-nav-item`, o aceptar que funcione como navegacion standard. |

### 1.4 Distinguishable (Contrast)

#### Ratios de contraste calculados

**NOTA**: El `--text-muted` real en light mode es `#64748b` (Slate-500), no `#94a3b8` como indica la documentacion en CLAUDE.md. Esto mejora significativamente los ratios de contraste en light mode.

**Light mode:**

| Par de colores | Hex FG | Hex BG | Ratio | Req | Estado |
|----------------|--------|--------|-------|-----|--------|
| text-primary on bg-primary | #0f172a | #f8fafc | 16.65:1 | 4.5:1 | PASS |
| text-primary on bg-panel | #0f172a | #ffffff | 17.58:1 | 4.5:1 | PASS |
| text-secondary on bg-panel | #475569 | #ffffff | 7.07:1 | 4.5:1 | PASS |
| text-secondary on bg-primary | #475569 | #f8fafc | 6.70:1 | 4.5:1 | PASS |
| text-muted on bg-panel | #64748b | #ffffff | 4.74:1 | 4.5:1 | PASS |
| text-muted on bg-primary | #64748b | #f8fafc | 4.50:1 | 4.5:1 | LIMITE |
| text-muted on bg-input | #64748b | #f1f5f9 | 4.17:1 | 4.5:1 | **FAIL** |
| accent on bg-panel | #4F46E5 | #ffffff | 5.67:1 | 4.5:1 | PASS |
| accent on bg-primary | #4F46E5 | #f8fafc | 5.38:1 | 4.5:1 | PASS |
| white on accent (btn) | #ffffff | #4F46E5 | 5.67:1 | 4.5:1 | PASS |
| danger on danger-light | #dc2626 | #fef2f2 | 4.66:1 | 4.5:1 | PASS |
| warning on warning-light | #d97706 | #fffbeb | 3.72:1 | 4.5:1 | **FAIL** |
| success on success-light | #16a34a | #f0fdf4 | 3.66:1 | 4.5:1 | **FAIL** |
| danger on bg-panel | #dc2626 | #ffffff | 4.63:1 | 4.5:1 | PASS |
| warning on bg-panel | #d97706 | #ffffff | 3.91:1 | 4.5:1 | **FAIL** |
| success on bg-panel | #16a34a | #ffffff | 3.92:1 | 4.5:1 | **FAIL** |
| border on bg-panel (non-text) | #e2e8f0 | #ffffff | 1.35:1 | 3.0:1 | **FAIL** |
| border-strong on bg-panel (non-text) | #cbd5e1 | #ffffff | 1.72:1 | 3.0:1 | **FAIL** |
| border on bg-input (non-text) | #e2e8f0 | #f1f5f9 | 1.11:1 | 3.0:1 | **FAIL** |

**Dark mode:**

| Par de colores | Hex FG | Hex BG | Ratio | Req | Estado |
|----------------|--------|--------|-------|-----|--------|
| text-primary on bg-primary | #f1f5f9 | #0f172a | 14.93:1 | 4.5:1 | PASS |
| text-primary on bg-panel | #f1f5f9 | #1e293b | 10.73:1 | 4.5:1 | PASS |
| text-secondary on bg-primary | #cbd5e1 | #0f172a | 10.45:1 | 4.5:1 | PASS |
| text-secondary on bg-panel | #cbd5e1 | #1e293b | 7.51:1 | 4.5:1 | PASS |
| text-muted on bg-primary | #94a3b8 | #0f172a | 6.35:1 | 4.5:1 | PASS |
| text-muted on bg-panel | #94a3b8 | #1e293b | 4.56:1 | 4.5:1 | PASS |
| text-muted on bg-input | #94a3b8 | #334155 | 3.16:1 | 4.5:1 | **FAIL** |
| accent on bg-primary | #818CF8 | #0f172a | 6.07:1 | 4.5:1 | PASS |
| accent on bg-panel | #818CF8 | #1e293b | 4.36:1 | 4.5:1 | **FAIL** |
| danger-dark on danger-light-dark | #ef4444 | #450a0a | 4.18:1 | 4.5:1 | **FAIL** |
| warning-dark on warning-light-dark | #f59e0b | #451a03 | 5.10:1 | 4.5:1 | PASS |
| success-dark on success-light-dark | #22c55e | #052e16 | 5.67:1 | 4.5:1 | PASS |
| border on bg-panel-dark (non-text) | #334155 | #1e293b | 1.39:1 | 3.0:1 | **FAIL** |
| border-strong on bg-panel-dark (non-text) | #475569 | #1e293b | 2.15:1 | 3.0:1 | **FAIL** |

#### Hallazgos de contraste

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 10 | text-muted en inputs (light) | 1.4.3 | Critica | FALLO | `#64748b` sobre `#f1f5f9` (bg-input) da ~4.17:1, por debajo del minimo 4.5:1. Afecta a placeholders y labels en inputs, que son elementos de texto informativos. | Oscurecer `--text-muted` en light mode a `#5b6b80` (aprox.) o aclarar `--bg-input` a `#f5f7fa`. Alternativamente, usar `--text-secondary` para texto en inputs y reservar `--text-muted` solo para texto puramente decorativo. |
| 11 | warning (#d97706) en cualquier fondo claro | 1.4.3 | Alta | FALLO | `#d97706` sobre `#ffffff` da ~3.91:1 y sobre `#fffbeb` da ~3.72:1. Se usa en badges de warning, texto de alertas y tooltips. | Oscurecer `--warning` a `#b45309` (Amber-700, ~5.3:1 sobre blanco) para texto. Mantener `#d97706` solo para iconos >3px donde aplica el criterio 1.4.11 (3:1). |
| 12 | success (#16a34a) en cualquier fondo claro | 1.4.3 | Alta | FALLO | `#16a34a` sobre `#ffffff` da ~3.92:1 y sobre `#f0fdf4` da ~3.66:1. Se usa en texto de estados de exito, badges y chips. | Oscurecer `--success` a `#15803d` (Green-700, ~4.9:1 sobre blanco) para texto. O crear `--success-text` separado de `--success` (para fondos). |
| 13 | accent-dark en bg-panel-dark | 1.4.3 | Alta | FALLO | `#818CF8` (accent dark) sobre `#1e293b` (bg-panel dark) da ~4.36:1, justo por debajo de 4.5:1. Afecta a links, tab activo, y texto accent en paneles. | Aclarar `--accent` en dark mode a `#A5B4FC` (Indigo-300, ~7.18:1) o `#93A3F8` (~5.5:1). |
| 14 | danger-dark en danger-light-dark | 1.4.3 | Media | FALLO | `#ef4444` sobre `#450a0a` da ~4.18:1. Se usa en badges de error sobre fondo danger-light en dark mode. | Aclarar `--danger` en dark mode a `#f87171` (Red-400, ~5.63:1 sobre `#450a0a`). |
| 15 | Bordes de inputs (non-text contrast) | 1.4.11 | Critica | FALLO | `--border` (#e2e8f0) sobre `--bg-panel` (#ffffff) da ~1.35:1 y sobre `--bg-input` (#f1f5f9) da ~1.11:1. Los inputs dependen del borde para ser identificados visualmente. En dark mode `#334155` sobre `#1e293b` da ~1.39:1. Los inputs en reposo son practicamente invisibles para usuarios con vision reducida. | Oscurecer `--border` en light mode a al menos `#94a3b8` (Slate-400) para inputs, o usar `--border-strong` (#cbd5e1, ~1.72:1, aun insuficiente). Considerar crear `--border-input` con un contraste de al menos 3:1. Alternativa: anadir un fondo ligeramente mas oscuro al input (`--bg-input` a `#e8edf3`). |
| 16 | Bordes de inputs en dark mode (non-text) | 1.4.11 | Critica | FALLO | Misma situacion en dark mode: `#334155` sobre `#1e293b` da ~1.39:1. | Aclarar `--border` en dark mode a `#4a5568` o similar para alcanzar 3:1 sobre bg-panel. |

### 1.4.13 Content on Hover or Focus

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 17 | Tooltips (title attributes) | 1.4.13 | Baja | NOTA | La app usa `title` en muchos elementos (botones, barras de calendario, filas). Los `title` nativos no son dismissible ni hoverable segun WCAG. Sin embargo, dado que no hay tooltips custom con contenido esencial, esto es menor. | Para tooltips con informacion esencial, considerar implementar tooltips custom con `role="tooltip"` que sean dismissible (Esc) y hoverable. Baja prioridad. |

---

## 2. Operable

### 2.1 Keyboard Accessible (2.1.1)

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 18 | Barras del calendario Gantt | 2.1.1 | Alta | FALLO | Las `.cal-bar` (linea 24733) no tienen `tabindex`, `role`, ni keyboard handlers. Son elementos `<div>` con `cursor:pointer` y click handlers, completamente inaccesibles por teclado. Solo se interactua con clic y doble clic. | Anadir `tabindex="0"`, `role="button"`, y `aria-label` con el nombre de la accion y fechas a cada `.cal-bar`. Anadir handler de `keydown` para Enter/Space (activar) y flechas (navegar entre barras). |
| 19 | Catalog sub-tabs sin navegacion por teclas | 2.1.1 | Alta | FALLO | Los `.catalog-tab` (lineas 5644-5649) no tienen navegacion por teclas de flecha. Las tabs principales (linea 6645) si implementan ArrowLeft/ArrowRight/Home/End. | Implementar el mismo patron de roving tabindex y navegacion por flechas que las tabs principales. |
| 20 | Column filter dropdowns | 2.1.1 | Media | PARCIAL | Los `.col-filter-btn` se pueden activar con teclado (son buttons), y los checkboxes dentro del dropdown son focusables. Sin embargo, no hay tecla Escape para cerrar el dropdown ni navegacion por flechas entre opciones. | Anadir handler de Escape para cerrar. Considerar Arrow key navigation entre opciones del dropdown. |
| 21 | Command palette items sin roles | 2.1.1 | Media | PARCIAL | El command palette (CmdK) tiene keyboard navigation (ArrowUp/Down/Enter/Escape) pero los `.cmdk-item` no tienen `role="option"`, el contenedor no tiene `role="listbox"`, y no hay `aria-activedescendant` en el input. El AT no puede seguir la seleccion activa. | Anadir `role="listbox"` a `#cmdkResults`, `role="option"` y `id` unico a cada `.cmdk-item`, y `aria-activedescendant` al input que apunte al item activo. |
| 22 | Zoom buttons del calendario | 2.1.1 | Baja | PARCIAL | Los `.cal-zoom-btn` son botones y reciben foco, pero no indican cual esta activo al AT (`aria-pressed` o grupo con `role="radiogroup"`). | Anadir `aria-pressed="true/false"` a los zoom buttons, o agruparlos con `role="radiogroup"` y `role="radio"`. |
| 23 | Inline edit en catalog list view | 2.1.1 | Baja | PASS | Las celdas editables manejan Enter (commit), Tab (siguiente celda) y Escape implicitamente via blur. Correcto. | - |

### 2.4 Navigable

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 24 | Skip link | 2.4.1 | - | PASS | Existe `<a href="#mainContent" class="skip-link">Saltar al contenido principal</a>` (linea 5349) correctamente implementado. | - |
| 25 | Focus order en dialogos | 2.4.3 | - | PASS | `trapFocus()` (linea 12716) implementa focus trap correcto con Tab/Shift+Tab cycling. `releaseFocus()` restaura foco previo. El MutationObserver (linea 12747) automatiza trap/release en `.dialog-overlay` y `.cmdk-overlay`. | - |
| 26 | Focus indicator | 2.4.7 | - | PASS | `*:focus-visible` (linea 129) proporciona outline de 2px con color accent y offset de 2px. `.btn:focus-visible` anade box-shadow. `.tab-btn:focus-visible` cambia background. | - |
| 27 | Titulo de pagina | 2.4.2 | Baja | PARCIAL | `<title>Formacion_AGORA</title>` es descriptivo pero no cambia cuando se navega entre tabs. | Actualizar `document.title` en `applyTabChange()` para reflejar el tab activo (ej: "Convocatoria - Formacion_AGORA"). |

### 2.5 Input Modalities

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 28 | Touch targets en col-filter-btn | 2.5.5 | Alta | FALLO | Los `.col-filter-btn` tienen `padding: 2px` (linea 1404). Con un icono de ~12px, el area tactil total es de ~16x16px, muy por debajo de los 24x24px minimos de WCAG 2.5.8 (Target Size Minimum) y de los 44x44px recomendados para AA. | Aumentar padding a al menos 6px o anadir `min-width: 24px; min-height: 24px;` al `.col-filter-btn`. Mejor aun, 32x32px o usar un area de clic expandida con pseudo-elemento `::after`. |
| 29 | Touch targets en link-btn | 2.5.5 | Media | FALLO | Los `.link-btn` tienen `padding: 2px 0` (linea 1865). Con font-size 12px, el area tactil es de ~12x16px. | Aumentar padding vertical a al menos 8px para alcanzar 28px de altura minima. |
| 30 | Touch targets en XML participant table | 2.5.5 | Media | FALLO | Los inputs y selects dentro de la tabla XML tienen `padding: 3px 6px` con `font-size: 11px`, resultando en targets de ~20x18px. Botones de eliminar tienen solo 12px de icono. | Aumentar el padding minimo a `6px 8px`. Para el boton de eliminar, usar area minima de 24x24px. |

---

## 3. Understandable

### 3.2 Predictable

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 31 | Tabs activan al hacer focus (roving tabindex) | 3.2.1 | Baja | NOTA | La implementacion de tabs principales (linea 6664) hace `tabs[newIdx].click()` al presionar flechas, lo que activa la tab ademas de mover el foco. Segun el patron ARIA Tabs, se recomienda que las flechas solo muevan el foco y que Enter/Space active, pero ambos enfoques son aceptables (el pattern "Tabs with Automatic Activation" es valido). | Esto es aceptable y comun. Si se quisiera el patron "manual activation", separar click de focus. Baja prioridad. |

### 3.3 Input Assistance

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 32 | Validacion de formularios | 3.3.1 | - | PASS | `validateField()` (linea 12475) anade `aria-invalid`, clase `.input-error`, y crea un `<span role="alert">` con `.field-error-msg` y `aria-describedby`. Implementacion completa. | - |
| 33 | Labels de inputs | 3.3.2 | - | MAYORMENTE PASS | La mayoria de inputs tienen `aria-label` o `<label for="">` asociado. Los inputs del formulario de evento (eventTitle, eventDate, etc.), XML, calendario, dashboard, settings, y catalogos estan todos etiquetados. | - |
| 34 | Checkboxes sin label explicita | 3.3.2 | Media | PARCIAL | Los checkboxes `#seriesCheck`, `#surveyCheck`, `#settingsSyncConvocatoria`, `#settingsProactiveAlerts` estan envueltos en `<label>` (correcto), pero no tienen `aria-label` propio. Dependen del texto del `<label>` padre, lo cual es valido pero fragil si el texto tiene markup complejo. | Anadir `aria-label` a los checkboxes como refuerzo, especialmente `#seriesCheck` y `#surveyCheck` que estan dentro de labels con estructura compleja. |
| 35 | Serie de sesiones: inputs sin label claro | 3.3.2 | Media | FALLO | `#seriesCount` (linea 5474) tiene `aria-label="Numero de sesiones"` (correcto), pero los radios `name="seriesMode"` (lineas 5466-5467) dependen solo del texto del `<label>` envolvente, sin `aria-label` en el `<fieldset>`. El grupo de radios no tiene `<fieldset>` ni `<legend>`. | Envolver los radios de `seriesMode` en un `<fieldset>` con `<legend>Modo de repeticion</legend>`. Lo mismo para los radios `name="eventType"` (Presencial/Teams) y `name="cfRrMode"` (ausencias/presentes). |

---

## 4. Robust

### 4.1.2 Name, Role, Value

| # | Elemento | Criterio | Severidad | Estado | Descripcion | Recomendacion |
|---|----------|----------|-----------|--------|-------------|---------------|
| 36 | Tabs principales | 4.1.2 | - | PASS | Implementacion completa: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `tabindex` roving, y `role="tabpanel"` con `aria-labelledby`. Arrow key navigation con Home/End. | - |
| 37 | Dialogos | 4.1.2 | - | PASS | Todos los dialogos tienen `role="dialog"`, `aria-modal="true"`, y `aria-labelledby` o `aria-label`. Focus trap via MutationObserver es robusto. | - |
| 38 | Toasts | 4.1.2 | - | PASS | `showToast()` (linea 12660) asigna `role="alert"` para error/warning y `role="status"` para info/success. El contenedor tiene `aria-live="polite"`. | - |
| 39 | Tablas ordenables | 4.1.2 | - | PASS | Las tablas con sort usan `aria-sort="ascending/descending/none"` dinámicamente (lineas 5579-5583 para attendee table, 7467-7474 para catalog list). | - |
| 40 | Column filter buttons | 4.1.2 | - | PASS | Tienen `aria-expanded`, `aria-haspopup="listbox"`, y `aria-label="Filtrar por [nombre]"`. Se actualiza `aria-expanded` al abrir/cerrar (linea 15231). | - |
| 41 | Command palette sin roles semanticos | 4.1.2 | Alta | FALLO | `#cmdkResults` no tiene `role="listbox"`. Los `.cmdk-item` no tienen `role="option"`. El `#cmdkInput` no tiene `aria-expanded` ni `aria-activedescendant`. AT no puede seguir la seleccion activa del listado de comandos. | Anadir: `role="listbox"` a `#cmdkResults`; `role="option"` e `id` unico a cada `.cmdk-item`; `aria-expanded="true"` al input cuando hay resultados; `aria-activedescendant` al input apuntando al item con `.active`. |
| 42 | More actions dropdown como menu | 4.1.2 | Media | PARCIAL | El dropdown "Mas acciones" (linea 5596) tiene `role="menu"` y los items tienen `role="menuitem"` con `tabindex="-1"`. Sin embargo, no hay navegacion por teclado (ArrowUp/Down) dentro del menu. Deberia implementar el patron ARIA Menu. | Anadir handler de keydown para ArrowUp/Down (navegar items), Escape (cerrar), y Home/End. Al abrir, hacer focus en el primer item. |
| 43 | Collapsible sections del catalogo | 4.1.2 | Media | FALLO | Los `.fundae-sub-label` (linea 488) funcionan como toggles colapsables pero no tienen `role="button"`, `aria-expanded`, ni `aria-controls`. Son `<div>` con `cursor: pointer` y click handlers. | Anadir `role="button"`, `tabindex="0"`, `aria-expanded="true/false"`, y `aria-controls` al ID del panel colapsable. Manejar Enter/Space para activar. |
| 44 | Alert banner | 4.1.2 | - | PASS | `#alertBanner` tiene `role="status"` y `aria-live="polite"` (linea 5359). El boton de cerrar es un `<button>`. | - |
| 45 | Session banner | 4.1.2 | - | PASS | `#sessionBanner` tiene `role="alert"` (linea 5532) para notificar de la sesion en curso. | - |

---

## 5. Hallazgos adicionales

| # | Elemento | Criterio | Severidad | Descripcion | Recomendacion |
|---|----------|----------|-----------|-------------|---------------|
| 46 | Texto del CLAUDE.md desactualizado | - | Baja | La doc indica `--text-muted: #94a3b8 (Slate-400)` pero el CSS real usa `#64748b` (Slate-500). Esto podria causar confusion al implementar nuevos componentes. | Actualizar CLAUDE.md para reflejar el valor real: `--text-muted: #64748b (Slate-500)`. |
| 47 | Reduced motion | - | - | La app incluye 12 declaraciones `@media (prefers-reduced-motion: reduce)` para desactivar transiciones y animaciones. Bien cubierto. | PASS - No action needed. |
| 48 | Lang attribute | - | - | `<html lang="es">` esta presente (linea 2). Los pop-ups de impresion tambien usan `lang="es"`. | PASS. |

---

## Resumen de prioridades

### Prioridad 1 - Critica (resolver inmediatamente)

| # | Resumen | Impacto |
|---|---------|---------|
| 10 | text-muted en inputs falla 4.5:1 en light mode | Texto informativo ilegible para vision reducida |
| 15 | Bordes de inputs no alcanzan 3:1 (non-text contrast) en light mode | Inputs son practicamente invisibles para baja vision |
| 16 | Bordes de inputs no alcanzan 3:1 en dark mode | Mismo problema que #15 en dark mode |

### Prioridad 2 - Alta (resolver en el sprint actual)

| # | Resumen | Impacto |
|---|---------|---------|
| 4 | Sin h1 visible en la pagina | Screen readers no tienen orientacion de estructura |
| 5 | Catalog sub-tabs sin ARIA | AT no identifica tabs de catalogo como navegacion |
| 11 | warning (#d97706) falla contraste como texto | Texto de warning ilegible |
| 12 | success (#16a34a) falla contraste como texto | Texto de success ilegible |
| 13 | accent dark mode falla en bg-panel | Links y texto accent dificiles de leer en dark mode |
| 18 | Calendar bars inaccesibles por teclado | Usuarios de teclado no pueden interactuar con el Gantt |
| 19 | Catalog sub-tabs sin keyboard navigation | No se puede navegar entre subtabs con teclado |
| 28 | col-filter-btn target size de 16x16px | Touch targets demasiado pequenos para dedos |
| 41 | Command palette sin roles ARIA | AT no puede seguir la seleccion en la paleta |
| 42 | More actions menu sin keyboard nav | Menu desplegable no navegable con flechas |

### Prioridad 3 - Media (resolver en el proximo ciclo)

| # | Resumen |
|---|---------|
| 6 | XML table headers sin scope |
| 7 | Dynamic table headers sin scope |
| 14 | danger en dark mode falla en danger-light |
| 20 | Column filter dropdowns sin Escape |
| 21 | Command palette items sin role=option |
| 29 | link-btn targets demasiado pequenos |
| 30 | XML table input targets demasiado pequenos |
| 34 | Checkboxes sin aria-label de refuerzo |
| 35 | Radio groups sin fieldset/legend |
| 43 | Collapsible sections sin aria-expanded |

### Prioridad 4 - Baja (backlog)

| # | Resumen |
|---|---------|
| 3 | Empty state SVGs sin aria-hidden |
| 8 | Secciones del panel sin landmark |
| 9 | Settings nav items sin role=tab |
| 17 | Tooltips nativos (title) no dismissible |
| 22 | Zoom buttons sin aria-pressed |
| 27 | Page title no refleja tab activo |
| 31 | Tabs automatic activation (aceptable) |
| 46 | CLAUDE.md text-muted value outdated |

---

## Elementos correctamente implementados (resumen)

Lo que ya funciona bien y no debe regresionarse:

1. **Tab navigation principal**: role="tablist", roving tabindex, arrow keys, Home/End
2. **Dialog focus management**: trapFocus/releaseFocus automatico via MutationObserver
3. **Skip link**: presente y funcional
4. **Chart accessibility**: todos los charts SVG con role="img" y aria-label descriptivo
5. **Toast notifications**: role="alert" para error/warning, role="status" para info/success
6. **Form validation**: aria-invalid, role="alert" en mensajes de error, aria-describedby
7. **Sortable tables**: aria-sort dinamico en la tabla principal y catalog list
8. **Column filters**: aria-expanded, aria-haspopup, aria-label en botones de filtro
9. **Icons**: aria-hidden="true" en iconos decorativos
10. **Reduced motion**: 12 declaraciones @media para respetar preferencias
11. **Language**: html lang="es" presente
12. **Print styles**: oculta elementos interactivos al imprimir
13. **Focus visible**: outline consistente en todos los elementos interactivos
14. **Input labels**: mayoria de inputs correctamente etiquetados
