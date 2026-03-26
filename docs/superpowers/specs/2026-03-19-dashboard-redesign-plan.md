# Plan de implementación: Dashboard Redesign

**Fecha**: 2026-03-19
**Base**: `docs/superpowers/specs/2026-03-19-design-critique.md`
**Archivo**: `convocatoria.html` (~26K líneas)

---

## Dirección estética

Editorial/magazine. Datos con narrativa, no métricas sueltas. Inter con intención: pesos contrastados, escala modular, spacing rítmico base-4.

Principio rector: "Si la usuaria de RRHH abre el dashboard y en 3 segundos no sabe qué necesita su atención, hemos fallado."

---

## Fase 1: Jerarquía de KPIs

### 1.1 Hero KPI — Crédito FUNDAE (full-width)

**CSS**: Nueva clase `.dash-kpi-hero`
- `grid-column: 1 / -1` (ocupa todo el ancho)
- Fondo: `var(--accent-subtle)` con `border-left: 4px solid var(--accent)`
- Padding: 24px
- Número principal: 40px, font-weight 800, `font-variant-numeric: tabular-nums`
- Subtexto "de X €": 15px, `--text-muted`
- Barra de progreso: `height: 16px` (actual: 6px), `border-radius: 8px`
- Label directo sobre la barra: "67% consumido" posicionado con absolute
- Marcador de 100% como tick visual

**JS**: Refactorizar bloque DOM-building de KPIs en `renderDashboard()` (líneas 22640-22790)
- `addKpi()` definida en línea ~22652. `animateValue()` en línea 22713. `buildSparklineSvg()` en línea 22759
- Las 5 llamadas a `addKpi()` en líneas 22767-22790 se reemplazan por 3 bloques: hero, primary, contextual
- Eliminar sparkline de todas las KPIs

### 1.2 KPIs primarias (2 cards)

**CSS**: Clase `.dash-kpi-primary`
- Grid: 2 columnas (`1fr 1fr`)
- Número: `--font-size-2xl` (28px), font-weight 700
- Label: 11px, uppercase, `letter-spacing: 0.05em`, `--text-muted`
- Sin sparkline, sin badge de tendencia

**KPIs**: Participantes vinculados, Presupuesto total

### 1.3 KPIs contextuales (inline)

**CSS**: Clase `.dash-kpi-context`
- Flex row, gap 24px, `background: var(--bg-input)`, padding 8px 16px, border-radius
- Cada item: label + valor en una línea, font-size 13px
- Sin cards individuales

**KPIs**: Total acciones, Total horas

### 1.4 Kill list

- Eliminar `animateValue()` calls en KPIs (línea ~22708)
- Eliminar `buildSparklineSvg()` calls en KPIs (línea ~22757)
- Eliminar stagger delays (`animation-delay` en KPI cards)
- Mostrar números inmediatamente

---

## Fase 2: Modo Resumen como default

### 2.1 Toggle behavior

**JS**: En `renderDashboard()`, cambiar default de `state.dashMode` de `'completo'` a `'resumen'`

**Resumen** muestra SOLO:
1. Alertas danger (banner full-width con borde-left rojo, ENCIMA de KPIs)
2. Hero KPI (crédito FUNDAE)
3. KPIs primarias (2 cards)
4. KPIs contextuales (1 línea)
5. Nada más. Sin scroll.

**Completo**: todo lo actual (secciones colapsables con charts)

### 2.2 Alertas

No modificar — excluidas por el usuario. En modo Resumen, ocultar `dashAlertsWidget` vía display:none.

---

## Fase 3: Visualizaciones legibles

### 3.1 Estados → Stacked horizontal bar

**Reemplaza**: Donut de "Acciones por estado"

**Implementación**:
- SVG con `<rect>` elements apilados horizontalmente
- Cada segmento: ancho proporcional al conteo
- Labels directos sobre segmentos grandes (>15% del total)
- Segmentos pequeños agrupados en "Otros" si <5%
- Colores semánticos: En marcha=indigo, Terminada=green, Anulada=gray, En prep=amber, Planificada=slate-300
- Tooltip en hover con valor exacto

### 3.2 Modalidad → 3 números grandes

**Reemplaza**: Donut de "Horas por modalidad"

**Implementación**:
- 3 bloques inline-flex con icono + número + label
- Presencial: icono users, número grande, "X horas presenciales"
- Teleformación: icono monitor, número grande, "X horas teleformación"
- Mixta: icono mix, número grande, "X horas mixta"
- Sin chart, solo números con contexto

### 3.3 Estacionalidad → Heatmap horizontal

**Reemplaza**: Grouped bar chart de 24 barras

**Implementación**:
- 12 celdas (una por mes), coloreadas por intensidad (blanco → indigo)
- Escala de color: `color-mix(in srgb, var(--accent) Xpct%, var(--bg-input))` (ya usado en línea 262 — browser support validado; Safari <16.2 fallback: usar opacity en vez de color-mix)
- Label del mes (E, F, M, A, M, J, J, A, S, O, N, D) debajo
- Tooltip con valor exacto en hover
- Dimensiones: 100% ancho, 48px alto por fila (una para acciones, otra para horas)

### 3.4 Gauge rows (renombrar)

- Renombrar `renderSvgBarChart` → `renderGaugeRows` (4 call sites: ~23074, ~23161, ~23213, ~23228)
- Añadir gridlines sutiles (líneas verticales cada 25%)
- Label ancho fijo calculado (no 180px hardcoded)
- Eje X visible con marcadores 0%, 25%, 50%, 75%, 100%

---

## Fase 4: Limpieza técnica

### 4.1 Utility classes CSS (20 nuevas)

```css
.d-label { font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
.d-value-lg { font-size: var(--font-size-2xl); font-weight: 700; font-variant-numeric: tabular-nums; }
.d-value-xl { font-size: 40px; font-weight: 800; font-variant-numeric: tabular-nums; }
.d-card { background: var(--bg-panel); border-radius: var(--radius); padding: 16px; }
.d-card-flush { background: var(--bg-panel); border-radius: var(--radius); padding: 16px 0; }
.d-section-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
.d-flex-between { display: flex; justify-content: space-between; align-items: center; }
.d-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.d-mb-16 { margin-bottom: 16px; }
.d-mb-24 { margin-bottom: 24px; }
.d-mb-32 { margin-bottom: 32px; }
.d-p-16 { padding: 16px; }
.d-p-24 { padding: 24px; }
/* Reutilizar existentes: u-text-sm, u-text-muted, u-text-secondary — NO duplicar */
.d-border-left-accent { border-left: 4px solid var(--accent); }
.d-border-left-danger { border-left: 4px solid var(--danger); }
.d-bg-subtle { background: var(--accent-subtle); }
.d-gauge-bar { height: 8px; border-radius: 4px; background: var(--bg-input); overflow: hidden; }
```

### 4.2 Dark mode consolidation

- ANTES de modificar: grep `data-theme.*system` en todo el archivo para verificar que NO hay selectores CSS fuera del bloque de variables (líneas 83-157) que dependan de `[data-theme="system"]`
- Eliminar el bloque duplicado `@media (prefers-color-scheme: dark) { [data-theme="system"] { ... } }` (líneas 120-157 y todas las duplicaciones en dashboard CSS ~3004-3022)
- En `applyTheme()` (~línea 13765): si theme === 'system', detectar `window.matchMedia('(prefers-color-scheme: dark)')` y aplicar `[data-theme="dark"]` o `[data-theme="light"]` directamente
- Añadir listener de `change` en el media query para reaccionar a cambios de sistema
- Resultado: una sola definición de dark mode (`[data-theme="dark"]`), ~75 líneas CSS eliminadas
- Re-render dashboard en `applyTheme()` para actualizar SVG colors

### 4.3 Fix text-secondary/text-muted en dark mode

```css
[data-theme="dark"] {
  --text-secondary: #cbd5e1; /* Slate-300, ratio ~7:1 sobre #0f172a */
  --text-muted: #94a3b8;     /* Slate-400, ratio ~4.6:1 sobre #1e293b — mantener para WCAG AA */
}
```
Nota: no bajar de Slate-400 para --text-muted en dark mode (Slate-500 #64748b solo da 3.5:1 sobre panel bg).

### 4.4 Spacing scale enforcement

Reemplazar valores hardcoded en CSS del dashboard:
- 28px → 32px (`--space-2xl: 32px` nueva variable)
- 20px → 24px (usar `--space-xl`)
- 10px → 12px (usar `--space-md`)
- 6px → 8px (usar `--space-sm`)

Añadir: `--space-2xl: 32px`, `--space-3xl: 48px`

### 4.5 SVG colors y dark mode

- En `renderDashboard()`, llamar a re-render cuando cambie el tema
- Los SVGs que usan `DS.*` colors: invalidar cache del dashboard en `applyTheme()`

---

## Orden de implementación

1. **Fase 4.1-4.4** (limpieza técnica) — primero, porque establece la base
2. **Fase 1** (KPIs) — máximo impacto visual
3. **Fase 2** (modo resumen) — hace el dashboard útil en 3 segundos
4. **Fase 3** (charts) — reemplaza chartjunk por visualizaciones claras

## Restricciones

- Todo en `convocatoria.html` (single file)
- Usar `esc()` para todo dato dinámico
- No romper dark mode
- No romper responsive (breakpoints 900px y 600px)
- Mantener `precomputeDashboard()` cache
- No tocar alertas (excluidas por el usuario)
