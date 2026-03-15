# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Arquitectura

Single self-contained HTML file (`convocatoria.html`). Todo inline: CSS en `<style>`, HTML en `<body>`, JS en `<script>`. Sin servidor, sin build, sin frameworks. ~22,500 líneas. Dependencias externas vía CDN:
- **Inter** (Google Fonts) — tipografía
- **SheetJS** (xlsx-0.20.3) — parseo de Excel

Persistencia: `localStorage` para estado, presets, historial, cola. No hay backend.

### Pestañas principales

La app tiene múltiples pestañas (tabs) que comparten el mismo archivo:
- **Cuadro de Mando** — KPIs, gráficos, informes (precomputado con `requestIdleCallback`)
- **Calendario** — vista calendario de formaciones
- **Convocatoria** — flujo principal: carga Excel → filtra → configura evento → envía
- **Personas** — perfil formativo por persona trabajadora
- **Catálogos** — sub-pestañas: Proveedores, Centros, Tutores, Acciones, Formación obligatoria (compliance), Necesidades (TNA). Vista ficha/lista toggle. Plan anual (solo en Acciones)
- **XML FUNDAE** — generación de XML para comunicaciones FUNDAE

El tab switching usa `data-tab` attributes y muestra/oculta paneles.

## Design System — Reglas estrictas

Cualquier cambio visual DEBE usar las variables CSS definidas en `:root`. NUNCA hardcodear colores, sombras, radii o fuentes.

### Paleta: Indigo-600 + Slate

| Variable | Valor | Uso |
|----------|-------|-----|
| `--accent` | `#4F46E5` (Indigo-600) | Botones primarios, links, estados activos |
| `--accent-hover` | `#4338CA` (Indigo-700) | Hover de botones primarios |
| `--accent-light` | `#E0E7FF` (Indigo-100) | Chips, badges, fondo sutil |
| `--accent-subtle` | `#EEF2FF` (Indigo-50) | Hover de filas, fondos de paneles destacados |
| `--text-primary` | `#0f172a` (Slate-900) | Texto principal |
| `--text-secondary` | `#475569` (Slate-600) | Texto secundario |
| `--text-muted` | `#94a3b8` (Slate-400) | Labels, placeholders, conteos |
| `--bg-primary` | `#f8fafc` (Slate-50) | Fondo general |
| `--bg-panel` | `#ffffff` | Paneles, barras, dialogs |
| `--bg-input` | `#f1f5f9` (Slate-100) | Inputs, dropdowns |
| `--border` | `#e2e8f0` (Slate-200) | Bordes normales |
| `--border-strong` | `#cbd5e1` (Slate-300) | Bordes con más contraste |
| `--danger` | `#dc2626` | Errores, eliminar |
| `--warning` | `#d97706` | Advertencias |
| `--success` | `#16a34a` | Confirmaciones, éxito |

### Tipografía: Inter (única)

- `--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- `--font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace` — para bloques de código/XML
- NO usar `font-family` directo — siempre `var(--font-body)` o `var(--font-mono)`
- Body: `font-feature-settings: 'cv11' 1, 'ss01' 1` (alternativas de Inter)
- Tamaños via variables: `--font-size-xs` (11px), `--font-size-sm` (12px), `--font-size-base` (13px), `--font-size-md` (15px), `--font-size-lg` (18px), `--font-size-xl` (22px), `--font-size-2xl` (28px). SIEMPRE usar `var(--font-size-*)`, nunca valores directos.

### Sombras: solo 2 niveles

- `--shadow-sm: 0 1px 2px rgba(15,23,42,0.05)` — bordes sutiles, paneles
- `--shadow-lg: 0 8px 24px rgba(15,23,42,0.12)` — dropdowns, dialogs, toasts
- NO crear sombras intermedias
- `--shadow-accent` y `--shadow-accent-hover` NO son niveles de elevación adicionales — son variantes cromáticas de `--shadow-sm` aplicadas a botones primarios. El modelo sigue siendo 2 niveles de elevación (sm/lg) + 1 variante de color.
- Focus ring: `0 0 0 3px rgba(79,70,229,0.15)` (inline, no variable)

### Border-radius: 3 valores

- `--radius-sm: 4px` — inputs, chips pequeños
- `--radius: 8px` — tarjetas, dropdowns, dialogs, toasts
- `--radius-lg: 9999px` — pills (chips, session tabs)
- NO usar otros valores de radius

### Z-index: escala definida

- `--z-dropdown: 100` — dropdowns, sticky headers
- `--z-sticky: 200` — filter dropdowns
- `--z-modal: 1000` — dialog overlays
- `--z-overlay: 10000` — toast container
- `--z-command-palette: 99999` — command palette
- SIEMPRE usar `var(--z-*)`, nunca valores directos

### Transición estándar

- `--transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- Usar siempre `var(--transition)` para consistencia
- NO usar `transition: all` — especificar propiedades: `transition: background-color var(--transition), color var(--transition), box-shadow var(--transition)`

## Sistema de iconos

- `Icons` object con ~40 iconos SVG inline (estilo Lucide, `currentColor`, tamaños 16/20/24)
- `icon(name, size)` helper para insertar iconos
- CSS: `.icon` (inline-flex), `.icon-sm` (16px), `.icon-md` (20px), `.icon-lg` (24px)
- NUNCA usar emojis (📋⚡🎯) ni caracteres Unicode (✕▼◉) como iconos
- Los SVGs usan `currentColor` → funcionan automáticamente en dark mode

## Componentes reutilizables

- `.btn` + `.btn-primary` / `.btn-secondary` — botones
- `.link-btn` + `.link-add` / `.link-clear` — links inline
- `.input-field` — inputs y textareas
- `.chip` — badges en pills
- `.dialog-overlay` + `.dialog-box` — modales
- `.toast` + `.toast-success/error/warning/info` — notificaciones
- `.filter-select` + `.filter-dropdown` — dropdowns de filtros con typeahead
- `.preset-chip` — presets de filtros guardados
- `.table-base` — estilos base compartidos por todas las tablas (`.att-table`, `.cat-table`, `.dash-table` la extienden)
- `createEmptyState({icon, title, desc, ctaText, ctaAction, illustration})` — empty states con ilustración SVG opcional
- `EMPTY_STATE_SVGS` — 4 ilustraciones geométricas: `noData`, `noResults`, `upload`, `noChart`

## Utility classes

- `u-hidden`, `u-flex`, `u-flex-col`, `u-flex-center` — display
- `u-mt-xs/sm/md/lg`, `u-mb-xs/sm/md/lg` — margins (4/8/12/16px)
- `u-gap-xs/sm/md/lg` — flex/grid gaps
- `u-text-center`, `u-text-right`, `u-text-muted`, `u-text-secondary` — text
- `u-text-xs`, `u-text-sm`, `u-font-semibold`, `u-font-bold` — typography
- `u-w-full`, `u-truncate` — sizing
- Preferir utility classes sobre `style=""` inline

## Accesibilidad (WCAG AA)

- `trapFocus(dialogEl)` / `releaseFocus(dialogEl)` — focus trap en modales (auto via MutationObserver)
- Skip link: `<a class="skip-link">` al inicio de `<body>`
- `scroll-behavior: smooth` en `:root`
- Diálogos: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tablas ordenables: `aria-sort` dinámico en `<th>`
- Dropdowns custom: `aria-expanded`, `aria-haspopup="listbox"`, `role="option"`
- Charts SVG: `role="img"` + `aria-label` descriptivo
- Toasts: `role="alert"` (error/warning), `role="status"` (info/success)
- `validateField(input)` — validación inline con `aria-invalid` y `.field-error-msg`

## Patrones JS

- `esc(s)` — sanitizar CUALQUIER valor del Excel antes de innerHTML (prevención XSS)
- `showToast(message, type, duration)` — en vez de `alert()` (NUNCA usar alert)
- `isValidEmail(email)` — validación de email (regex)
- `saveState()` — autoguardado con debounce 500ms
- IDs sintéticos (`emp._id`) — NUNCA usar NIF como clave primaria de selección
- `state.excludedNIFs` — contiene `_id` (no NIFs reales, pese al nombre legacy)
- `createRowElement(emp)` — crea filas de tabla con DOM (NO innerHTML) para rendimiento y seguridad
- `VirtualScroll` — objeto para renderizar datasets grandes (>500 filas) con `requestAnimationFrame` throttling
- `loadSettings()` / `saveSettings(obj)` — lee/escribe settings en `convocatoria_settings`
- `applyTheme(theme)` / `initTheme()` — dark mode (light/dark/system) via `[data-theme]` en `<html>`
- `getUnifiedTemplates()` / `saveUnifiedTemplatesStore()` / `migrateTemplates()` — sistema unificado de plantillas (reemplaza los 4 stores legacy separados)
- `precomputeDashboard()` — precalcula datos del dashboard con `requestIdleCallback` y cache basado en hash
- `checkWaitlist()` — gestiona lista de espera cuando se supera capacidad máxima

## Convenciones de código

- Español para texto visible al usuario, inglés para código/variables
- `FILTER_KEYS` y `RELEVANT_COLUMNS` definen las columnas del Excel esperadas
- Los filtros normalizan espacios (`trim` + collapse) al parsear
- `localStorage` keys `convocatoria_*`: `_state`, `_employees`, `_fileName`, `_presets`, `_history`, `_queue`, `_settings`, `_unifiedTemplates`, `_catalog_viewMode`, `_corrections`, `_compliance_types`, `_compliance_records`, `_tnaRequests`, `_dashCollapsed`, `_dash_mode`, `_onboarding_done`, `_lastBackup`, `_kbdInteractions`
- `localStorage` keys `fundae_*`: `_acciones`, `_proveedores`, `_centros`, `_tutores` — acceso vía `getCatalog(key)` / `saveCatalog(key, data)` (prefijan `fundae_` automáticamente)

## Dark mode

- Tres modos: `light`, `dark`, `system` — almacenado en settings como `theme`
- CSS: variables re-declaradas en `[data-theme="dark"]` y media query para `[data-theme="system"]`
- JS: `applyTheme(theme)` pone el atributo en `<html>`, `initTheme()` lo restaura al cargar
- Selector en settings dialog (`#themeSelect`)
- NUNCA hardcodear colores fuera de las variables — dark mode los invierte automáticamente

## Visibilidad de paneles

- `u-hidden` class = `display:none` via CSS. Para mostrar/ocultar: `classList.remove('u-hidden')` / `classList.add('u-hidden')`. NUNCA usar `style.display=''` para mostrar un elemento con `u-hidden` — no funciona (la clase CSS tiene prioridad sobre inline vacío)
- Los contenedores de compliance (`#complianceViewContainer`), TNA (`#tnaViewContainer`) y plan anual (`#annualPlanContainer`) usan `u-hidden`. El resto de paneles de catálogo usan `style.display`

## Layout

- Panel izquierdo: 380px fijo (filtros, evento, config)
- Panel derecho: flex-1 (tabla, acciones)
- Secciones del panel izquierdo numeradas: "1. Carga de datos", "2. Selecciona asistentes", "3. Datos del evento"
- Action bar fijada al fondo del panel derecho
- Queue bar encima de la tabla cuando hay items en cola

## Subsistemas añadidos en el overhaul

- **Command palette** — `Cmd+K` / `Ctrl+K`, búsqueda fuzzy, navegación por teclado
- **Keyboard shortcuts** — atajos globales con detección de OS, tooltips progresivos
- **Virtual scrolling** — `VirtualScroll` object para tablas >500 filas
- **Unified templates** — `migrateTemplates()` fusiona 4 stores legacy en `convocatoria_unifiedTemplates`
- **Compliance tracking** — formación obligatoria con caducidades
- **TNA requests** — mini sistema de detección de necesidades formativas
- **Annual training plan** — plan anual con vista trimestral
- **Provider management** — gestión de proveedores con scorecard
- **Kirkpatrick L1-L2** — evaluación post-formación (utilidad, calidad formador, materiales, NPS, pre/post test)
- **Worker profile** — perfil formativo por persona trabajadora
- **Organigram diff** — detección de cambios entre cargas de Excel
- **PDF/ICS exports** — dossier inspección, asistencia, certificados, eventos calendario
- **Branded reports** — informe dirección, balance RLT, report customizable
- **JSON backup** — export/import completo del estado de la app
- **Onboarding checklist** — activación progresiva en 7 pasos

## Modelo de datos del catálogo

Los objetos de catálogo usan campos en español: `nombre`, `fechaInicio`, `fechaFin`, `modalidad`, `horasPresenciales`, `horasTeleformacion`, `codigo`, `proveedor`, `coste`, `plazas`.

## Trabajo en paralelo (worktrees)

- Los agentes en worktrees NO pueden hacer git commit — el coordinador commitea manualmente
- NUNCA lanzar múltiples agentes en paralelo sobre el mismo archivo SIN worktree — se pisan las ediciones y se pierden cambios
- Si se usan worktrees: mergear con 3-way merge (`git merge` o `diff3`), resolver conflictos manualmente
- Los merges producen conflictos en zonas de inserción comunes. Resolución: mantener ambos lados secuencialmente
- Siempre verificar `grep '<<<<<<' convocatoria.html` tras un merge antes de commitear
- Para evitar conflictos: lanzar agentes SECUENCIALMENTE sobre el mismo archivo, o en worktrees con merge posterior

## Principios UX

- Feedback visual mínimo: UN indicador de éxito es suficiente (no borde + icono + SVG animado)
- No añadir decoración sin función (steppers, wizards, iconos puramente estéticos)
- Avisos proactivos deben ser opt-in (configurables en settings, desactivados por defecto)
- Preferir subtlety: badges discretos, puntos de notificación, no banners invasivos

## Encuestas de satisfacción (Power Automate)

- `sendSurveyEmail(event, emails)` — envía payload JSON al webhook de PA
- `buildSurveyPayload(event, emails, formsUrl)` — `to` es array de strings (NO string con `;`)
- PA schema: `to` como `array` de strings → `join(triggerBody()?['to'],';')` en el campo To del email
- Se invoca desde: envío directo (`btnOpenOutlook`), series, y cola (`btnLaunchQueue`)
- **Decisión pendiente**: en series, actualmente se envía UNA sola encuesta al confirmar (todos los asistentes, `scheduledTime` de la última sesión). Preguntar al usuario si prefiere que cada sesión de la serie envíe su propia encuesta con su propia `scheduledTime`.

## Lo que NO hacer

- NO añadir body::before ni overlays decorativos
- NO añadir más de 2 niveles de sombra
- NO usar amber/stone (paleta anterior, reemplazada)
- NO usar DM Serif Display ni Plus Jakarta Sans (fuentes anteriores, reemplazadas)
- NO usar `alert()`, `confirm()` ni `prompt()` — usar `showToast()` y diálogos custom con `.dialog-overlay`
- NO usar NIF como clave de selección — usar `_id`
- NO hardcodear colores rgba — usar variables CSS
- NO crear ficheros adicionales (todo va en convocatoria.html)
- NO usar innerHTML para filas de tabla — usar `createRowElement()` (DOM API)
- NO añadir alertas/avisos que salten automáticamente sin control del usuario
- NO usar emojis ni Unicode como iconos — usar `Icons.*`
- NO usar `font-size` directo — usar `var(--font-size-*)`
- NO usar `z-index` directo — usar `var(--z-*)`
- NO usar `transition: all` — especificar propiedades concretas
- NO añadir datos demo que se mezclen con datos reales del usuario

## Testing

- `test-data.js` en raíz — script para consola que carga datos realistas en todos los localStorage keys. Ejecutar en consola del navegador + recargar. Incluye 50 empleados, 12 acciones, 4 proveedores, compliance, TNA, historial, cola, templates.
