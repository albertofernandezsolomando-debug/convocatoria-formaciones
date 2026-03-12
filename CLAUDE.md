# Convocatoria de Formaciones

## Arquitectura

Single self-contained HTML file (`convocatoria.html`). Todo inline: CSS en `<style>`, HTML en `<body>`, JS en `<script>`. Sin servidor, sin build, sin frameworks. Dependencias externas vía CDN:
- **Inter** (Google Fonts) — tipografía
- **SheetJS** (xlsx-0.20.3) — parseo de Excel

Persistencia: `localStorage` para estado, presets, historial, cola. No hay backend.

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
- NO usar `font-family` directo — siempre `var(--font-body)`
- NO añadir otras fuentes (ni display, ni serif, ni mono)
- Body: `font-feature-settings: 'cv11' 1, 'ss01' 1` (alternativas de Inter)
- Tamaños: 11px (labels pequeños), 12px (filtros, chips), 13px (tabla, inputs), 15px (header)

### Sombras: solo 2 niveles

- `--shadow-sm: 0 1px 2px rgba(15,23,42,0.05)` — bordes sutiles, paneles
- `--shadow-lg: 0 8px 24px rgba(15,23,42,0.12)` — dropdowns, dialogs, toasts
- NO crear sombras intermedias
- Focus ring: `0 0 0 3px rgba(79,70,229,0.15)` (inline, no variable)

### Border-radius: 3 valores

- `--radius-sm: 4px` — inputs, chips pequeños
- `--radius: 8px` — tarjetas, dropdowns, dialogs, toasts
- `--radius-lg: 9999px` — pills (chips, session tabs)
- NO usar otros valores de radius

### Transición estándar

- `--transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- Usar siempre `var(--transition)` para consistencia

## Componentes reutilizables

- `.btn` + `.btn-primary` / `.btn-secondary` — botones
- `.link-btn` + `.link-add` / `.link-clear` — links inline
- `.input-field` — inputs y textareas
- `.chip` — badges en pills
- `.dialog-overlay` + `.dialog-box` — modales
- `.toast` + `.toast-success/error/warning/info` — notificaciones
- `.filter-select` + `.filter-dropdown` — dropdowns de filtros con typeahead
- `.preset-chip` — presets de filtros guardados

## Patrones JS

- `esc(s)` — sanitizar CUALQUIER valor del Excel antes de innerHTML (prevención XSS)
- `showToast(message, type, duration)` — en vez de `alert()` (NUNCA usar alert)
- `isValidEmail(email)` — validación de email (regex)
- `saveState()` — autoguardado con debounce 500ms
- IDs sintéticos (`emp._id`) — NUNCA usar NIF como clave primaria de selección
- `state.excludedNIFs` — contiene `_id` (no NIFs reales, pese al nombre legacy)

## Convenciones de código

- Español para texto visible al usuario, inglés para código/variables
- `FILTER_KEYS` y `RELEVANT_COLUMNS` definen las columnas del Excel esperadas
- Los filtros normalizan espacios (`trim` + collapse) al parsear
- `localStorage` keys: `convocatoria_state`, `convocatoria_employees`, `convocatoria_fileName`, `convocatoria_presets`, `convocatoria_history`, `convocatoria_queue`

## Layout

- Panel izquierdo: 380px fijo (filtros, evento, config)
- Panel derecho: flex-1 (tabla, acciones)
- Secciones del panel izquierdo numeradas: "1. Carga de datos", "2. Selecciona asistentes", "3. Datos del evento"
- Action bar fijada al fondo del panel derecho
- Queue bar encima de la tabla cuando hay items en cola

## Lo que NO hacer

- NO añadir body::before ni overlays decorativos
- NO añadir más de 2 niveles de sombra
- NO usar amber/stone (paleta anterior, reemplazada)
- NO usar DM Serif Display ni Plus Jakarta Sans (fuentes anteriores, reemplazadas)
- NO usar `alert()` — usar `showToast()`
- NO usar NIF como clave de selección — usar `_id`
- NO hardcodear colores rgba — usar variables CSS
- NO crear ficheros adicionales (todo va en convocatoria.html)
