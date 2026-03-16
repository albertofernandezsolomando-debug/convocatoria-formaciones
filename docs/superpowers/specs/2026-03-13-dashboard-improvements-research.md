# Investigacion: Mejoras del Cuadro de Mando (Dashboard)

**Fecha:** 13 de marzo de 2026
**Tipo:** Investigacion de estado del arte + propuestas de mejora
**Ambito:** `convocatoria.html` — tab "Cuadro de Mando"

---

## 1. Resumen ejecutivo

Tras analizar el estado del arte en diseno de dashboards (2024-2026) y auditar en profundidad la implementacion actual del Cuadro de Mando en `convocatoria.html`, se identifican **5 mejoras de alto impacto**:

1. **Tooltips interactivos en graficos SVG** — Los graficos actuales (barras, donuts, lineas) carecen de cualquier interactividad hover/touch. Anadir tooltips contextuales con valores exactos, porcentajes y comparaciones multiplicaria la utilidad de cada grafico sin anadir complejidad visual.

2. **Skeleton loading con shimmer** — El dashboard tarda en renderizar porque calcula todo sincronicamente. Mostrar esqueletos animados con CSS (shimmer) durante los 200-500ms de calculo reduciria la percepcion de espera un 20-30% segun estudios de Viget y Google.

3. **Tarjetas KPI enriquecidas con tendencia contextual** — Las KPI cards ya incluyen sparklines y trend, pero el contexto es insuficiente. Anadir un tooltip o popover con desglose temporal (ultimo mes vs media historica) y formateo condicional mas agresivo (fondo de tarjeta teñido) las haria accionables.

4. **Navegacion por secciones con scroll-spy mejorado y filtros globales** — El dashboard es un scroll largo (~15 cards). La nav sticky actual (pills) es correcta pero no comunica progreso. Anadir un indicador de progreso de scroll y filtros globales (por empresa, periodo, estado) reduciria la carga cognitiva un 40% segun principios de divulgacion progresiva.

5. **Accesibilidad de graficos SVG** — Ningun grafico tiene `role`, `aria-label`, ni texto alternativo para lectores de pantalla. Las donuts dependen exclusivamente del color para codificar categorias, sin patrones ni texturas alternativas. Esto incumple WCAG 2.1 nivel A (criterio 1.1.1 y 1.4.1).

---

## 2. Analisis del estado del arte

### 2.1 Patrones de diseno de dashboards modernos

Las mejores aplicaciones de 2025-2026 comparten varios patrones clave:

**Jerarquia visual tipo F.** Los usuarios escanean dashboards siguiendo un patron en F: primero horizontal en la zona superior (KPIs), luego un segundo barrido horizontal, y despues vertical por el lado izquierdo. Aplicaciones como [Vercel](https://vercel.com/try/new-dashboard) y [Linear](https://linear.app/docs/dashboards) colocan las metricas mas criticas arriba-izquierda y las secundarias debajo.

**Divulgacion progresiva.** Grafana 12, PostHog y Plausible usan filtros contextuales y drill-down para reducir la carga cognitiva. En lugar de mostrar todo simultaneamente, revelan detalle bajo demanda (hover, click, expansion). Segun UXPin, esto reduce la carga cognitiva hasta un 40%.

**Layouts personalizables.** Retool, Metabase y Grafana permiten reordenar widgets, guardar vistas y cambiar entre modos compacto/expandido. Notion y Airtable llevan esto al extremo con bloques arrastrables.

**Temas oscuros para uso prolongado.** Para usuarios que trabajan con datos densos durante horas, un tema oscuro reduce fatiga visual. Grafana, PostHog y Linear ofrecen dark mode nativo.

**Colaboracion embebida.** Tendencia emergente en 2025: comentarios, menciones y tareas directamente dentro del dashboard (Linear, Notion, Retool).

### 2.2 Tendencias en visualizacion de datos

**Sparklines y micro-graficos.** La tendencia dominante es integrar graficos diminutos dentro de tablas y tarjetas KPI. No llevan ejes ni etiquetas; solo comunican tendencia. Son el complemento perfecto para valores absolutos. Displayr y VitaraCharts documentan extensamente este patron.

**Transiciones animadas.** Micro-animaciones de 200-500ms (segun Gartner, el 75% de aplicaciones B2C las incluiran como estandar en 2025). Usos clave: conteo animado de numeros, morphing entre vistas de grafico, transiciones suaves al filtrar datos, pulso sutil en puntos de datos al hover.

**Graficos de area apilada y barras agrupadas.** Para comparaciones temporales, los graficos de area apilada con gradiente (usados en Plausible y PostHog) comunican volumen y composicion simultaneamente. Las barras agrupadas (como las que ya usa el dashboard de estacionalidad) son efectivas pero se benefician de interactividad.

**Sankey y flujos.** Para datos como "formacion interempresarial" o "flujos de credito FUNDAE", diagramas de flujo tipo Sankey comunicarian relaciones mejor que tablas planas.

### 2.3 Diseno de tarjetas KPI

La "anatomia" de una KPI card moderna (segun Anastasiya Kuznetsova y Tabular Editor) incluye cuatro capas:

| Capa | Proposito | Estado actual | Gap |
|------|-----------|---------------|-----|
| **Etiqueta** | Titulo claro e inequivoco | Presente (`.dash-kpi-label`) | OK |
| **Valor principal** | Numero grande y prominente | Presente (`.dash-kpi-value`) con animacion | OK |
| **Comparacion/Tendencia** | % cambio vs benchmark | Parcial (`.dash-kpi-trend` + sparkline) | Falta benchmark configurable |
| **Visual contextual** | Mini-grafico o icono de estado | Presente (sparkline SVG) | Falta tooltip al hover |

**Formateo condicional semantico.** Las mejores implementaciones (Power BI, Tableau, Shadcn) tiñen el fondo completo de la tarjeta segun umbrales: verde (objetivo cumplido), ambar (zona de riesgo), rojo (accion urgente). El dashboard actual solo colorea el borde izquierdo con colores de chart (no semanticos).

### 2.4 Tablas de datos responsivas

Cinco estrategias principales documentadas en 2025:

1. **Colapso a tarjetas** — Cada fila se transforma en una mini-tarjeta en movil. Ideal para tablas con 4-6 columnas.
2. **Scroll horizontal con columna fija** — La primera columna (leyenda) queda fija; el resto se desplaza. Ideal para tablas anchas.
3. **Priorizacion de columnas** — Se ocultan columnas secundarias con un boton "ver mas".
4. **Headers sticky** — La cabecera permanece visible al hacer scroll vertical. Ya implementado en el dashboard.
5. **Diseño mobile-first** — Disenar primero para pantalla estrecha y expandir.

El dashboard actual usa tablas inline con estilos hardcodeados (`style.cssText`), sin `<table>` semantico en algunos casos, lo que dificulta responsividad.

### 2.5 Sistemas de color para datos

**Paletas categoricas.** IBM Carbon Design System y Cloudscape (AWS) recomiendan paletas de 8-12 colores con contraste minimo 3:1 entre colores vecinos. El dashboard actual define 8 colores (`--chart-1` a `--chart-8`), lo cual es correcto en cantidad.

**Contraste WCAG.** El ratio de contraste 3:1 para elementos graficos (WCAG 2.1 SC 1.4.11) debe verificarse. Algunos colores del chart palette (ej: `--chart-4: #F59E0B` sobre fondo blanco) pueden no cumplir.

**Alternativas al color.** WCAG 2.1 SC 1.4.1 exige que el color no sea el unico medio para transmitir informacion. Las donuts actuales dependen 100% del color; deberian incluir patrones (stripes, dots) o etiquetas directas.

**Daltonismo.** ~8% de hombres tienen alguna forma de daltonismo. Los pares rojo-verde (usados para exito/peligro) necesitan diferenciacion adicional (iconos, patrones).

### 2.6 Micro-interacciones y animacion

**Conteo animado.** Ya implementado en `animateValue()` con ease-out cubico. Es efectivo pero podria mejorar con formateo locale durante la animacion (actualmente formatea solo al final).

**Fade-up escalonado.** Implementado con `dashFadeUp` y `animation-delay`. Patron correcto y bien ejecutado.

**Hover en graficos.** Ausente por completo. Es la micro-interaccion de mayor impacto que falta. Todas las aplicaciones de referencia (Grafana, Metabase, PostHog, Plausible) muestran tooltip al hover sobre barras, segmentos y puntos.

**Transiciones de filtrado.** Ausente. Al cambiar de modo (Completo/Resumen) o al filtrar, el contenido deberia transicionar suavemente en lugar de repintarse de golpe.

### 2.7 Arquitectura de informacion

**Organizacion actual del dashboard:**
```
Cuadro de Mando
  |-- Header (titulo + modo + timestamp)
  |-- Nav sticky (pills por seccion)
  |-- Busqueda + Exportar
  |-- KPI Cards (5)
  |-- Alertas (colapsable)
  |-- Plazos FUNDAE
  |-- Completitud
  |-- [Seccion] Analytics avanzado (6 cards)
  |-- [Seccion] Vision general (2 cards)
  |-- [Seccion] Distribucion operativa (4 cards)
  |-- [Seccion] Personas y participacion (4 cards)
  |-- [Seccion] Calidad y proveedores (2 cards)
  |-- [Seccion] Actividad del gestor (1 card)
```

**Problemas identificados:**
- **Exceso de scroll vertical.** ~19 cards en un solo flujo vertical. El usuario debe hacer scroll considerable para llegar a "Calidad y proveedores".
- **Falta de filtros globales.** No hay manera de filtrar el dashboard completo por empresa, periodo o estado.
- **Seccion "Analytics avanzado" es demasiado densa.** 6 cards de analytics pesado (riesgo, ROI, cobertura, equidad, managers, cross-company) seguidas sin respiro visual.
- **Orden cuestionable.** "Vision general" aparece despues de "Analytics avanzado", cuando logicamente deberia ser al reves (primero lo general, despues lo detallado).

### 2.8 Accesibilidad en visualizacion de datos

**Estado actual:**
- `focus-visible` definido globalmente (correcto)
- `prefers-reduced-motion` solo para tablas de catalogo, no para animaciones del dashboard
- SVGs sin `role="img"` ni `aria-label`
- Donuts sin texto alternativo programatico
- Graficos de barras sin soporte de teclado
- Alertas colapsables sin `aria-expanded`

**Requisitos WCAG 2.1 para graficos:**
1. **1.1.1 (A):** Texto alternativo para todo contenido no textual
2. **1.4.1 (A):** El color no debe ser el unico medio de transmision de informacion
3. **1.4.11 (AA):** Contraste minimo 3:1 para elementos graficos
4. **2.1.1 (A):** Toda funcionalidad accesible por teclado
5. **4.1.2 (A):** Nombre, rol y valor programaticamente determinables

---

## 3. Evaluacion del dashboard actual

### 3.1 Fortalezas

1. **Design system coherente.** Uso consistente de variables CSS (`--accent`, `--border`, etc.) en toda la interfaz. Buen sistema de tokens.
2. **Animaciones de entrada.** `dashFadeUp` con delays escalonados crea una experiencia de carga fluida.
3. **Sparklines en KPIs.** Implementacion limpia con SVG polyline que comunica tendencia eficazmente.
4. **Conteo animado.** `animateValue()` con ease-out cubico es una micro-interaccion de alta calidad.
5. **Sistema de alertas colapsable.** Patron correcto con priorizacion (danger > warning), persistencia de descartados en localStorage, y badge en el tab.
6. **Completitud con barras de progreso.** Patron efectivo con colorizacion semantica y pulsacion para items criticos.
7. **Cards colapsables.** Cada `dash-card` puede colapsarse individualmente, reduciendo ruido.
8. **Nav sticky con scroll-spy.** IntersectionObserver para resaltar la seccion visible es un patron moderno y correcto.
9. **Modo Completo/Resumen.** Buena funcionalidad de divulgacion progresiva.
10. **Modulos analiticos profundos.** Risk scoring, ROI, equidad, estacionalidad y recurrencia son funcionalidades avanzadas y diferenciadas.

### 3.2 Debilidades

1. **Cero interactividad en graficos.** Ningun hover, click ni tooltip en barras, donuts ni lineas. Es la carencia mas grave de UX.
2. **Scroll vertical excesivo.** 19+ cards sin agrupacion visual fuerte. El usuario pierde contexto.
3. **Estilos inline masivos.** Muchos modulos analiticos (attendance, confirmation, recurrence, etc.) usan `style.cssText` extensivamente en lugar de clases CSS. Esto dificulta mantenimiento, responsividad y consistencia.
4. **Sin filtros globales.** No se puede filtrar por empresa, periodo o estado de la accion a nivel de dashboard completo.
5. **Falta de accesibilidad en SVGs.** Ningun `role`, `aria-label`, ni soporte de teclado.
6. **Sin soporte para `prefers-reduced-motion` en dashboard.** Las animaciones dashFadeUp, conteo y pulse ignoran esta preferencia del sistema.
7. **Color como unico diferenciador en donuts.** Sin patrones, texturas ni etiquetas directas como alternativa.
8. **Tablas inline sin semantica.** Las tablas dentro de modulos analiticos se construyen con `style.cssText` sin clases reutilizables.
9. **Sin exportacion individual de graficos.** No se puede copiar o exportar un grafico especifico.
10. **Sin indicador de datos vacios vs cargando.** El `renderEmptyState` es generico y no distingue entre "sin datos" y "cargando".
11. **Orden de secciones no optimo.** "Analytics avanzado" antes de "Vision general" rompe el patron de lo general a lo especifico.
12. **Sin dark mode.** Todos los colores asumen fondo claro.

---

## 4. Propuestas de mejora

### 4.1 Diseno visual

#### P1: Formateo condicional en tarjetas KPI

**Que es:** Teñir el fondo de la tarjeta KPI segun umbrales semanticos (verde/ambar/rojo) en lugar de usar solo el borde izquierdo decorativo.

**Por que importa:** Las mejores practicas de 2025 (Power BI, Tableau, Shadcn) demuestran que el formateo condicional de fondo es 2-3x mas visible que un borde lateral. Transforma KPIs de "informativos" a "accionables" al comunicar urgencia visualmente.

**Aplicacion concreta:** La tarjeta "Credito FUNDAE" (actualmente 5a KPI) deberia mostrar fondo verde suave si uso <80%, ambar si 80-95%, rojo si >95%. Similar para "Participantes vinculados" (rojo si 0, ambar si <50% de acciones tienen participantes).

**Enfoque de implementacion:** Añadir clases CSS `.dash-kpi--success`, `.dash-kpi--warning`, `.dash-kpi--danger` que apliquen un `background: var(--success-light)` / `var(--warning-light)` / `var(--danger-light)` sutil. Aplicar la clase dinamicamente en `addKpi()` segun un parametro `thresholdStatus`.

**Referencia:** Power BI New Card Visual, Shadcn KPI Cards.

#### P2: Tipografia de datos con fuente tabular

**Que es:** Forzar `font-variant-numeric: tabular-nums` globalmente en todos los valores numericos del dashboard para alineacion vertical perfecta.

**Por que importa:** Cuando numeros con distinto numero de digitos se muestran en columna (KPIs, tablas de riesgo, scorecard), la alineacion proporcional causa "saltos" visuales. Los numeros tabulares eliminan esto.

**Aplicacion concreta:** Ya se usa en `.dash-kpi-value` y `.dash-gauge-value`, pero no en las tablas inline de los modulos analiticos (attendance, confirmation, recurrence, etc.).

**Enfoque de implementacion:** Crear una clase utilitaria `.tabnum { font-variant-numeric: tabular-nums; }` y aplicarla a todos los contenedores de valores numericos. Auditar las tablas inline de los modulos analiticos.

**Referencia:** Inter font feature sets, Vercel dashboard typography.

#### P3: Espaciado y ritmo vertical mejorado

**Que es:** Aumentar el contraste visual entre secciones usando separadores mas prominentes, padding asimetrico y fondos alternados.

**Por que importa:** El dashboard actual usa un ritmo vertical uniforme (16px margin-bottom entre cards, `dash-section-heading` sutil). Las secciones se funden visualmente. Un ritmo con mas contraste ayuda al escaneo.

**Aplicacion concreta:** Las secciones (`dash-section-heading`) podrian tener un padding-top de 32px (doble del actual) y un fondo ligeramente diferenciado (alternar entre `--bg-primary` y `--bg-panel`).

**Enfoque de implementacion:** Ajustar `.dash-section-heading` margin y padding. Considerar envolver cada grupo de seccion en un contenedor con fondo alternado.

**Referencia:** Linear app section grouping, Grafana 12 dashboard sections.

### 4.2 Visualizacion de datos

#### P4: Tooltips interactivos en todos los graficos SVG

**Que es:** Anadir tooltips HTML posicionados al hacer hover/touch sobre barras, segmentos de donut y puntos de linea, mostrando valor exacto, porcentaje y etiqueta.

**Por que importa:** Es la mejora de UX de mayor impacto. El 100% de las aplicaciones de referencia (Grafana, Metabase, PostHog, Plausible, Vercel Analytics) incluyen tooltips interactivos. Sin ellos, el usuario debe estimar valores visualmente, lo que introduce error y frustracion. Segun Pencil & Paper, los tooltips en dashboards densos son "no negociables".

**Aplicacion concreta:**
- **Donut:** Al hover sobre un segmento, tooltip con "{label}: {value} ({pct}%)". Segmento se expande ligeramente (stroke-width +2).
- **Barras (gauge-row):** Al hover sobre una barra, tooltip con "{label}: {value}" con formato. Barra se ilumina (opacity 1, sombra sutil).
- **Line chart (attendance):** Al hover sobre un punto, tooltip con "Sesion {fecha}: {pct}% asistencia ({present}/{total})".

**Enfoque de implementacion:** Crear un unico elemento tooltip reutilizable (`#dashTooltip`) posicionado con `position: fixed`. Registrar listeners `mouseenter`/`mouseleave` en cada elemento grafico SVG. Calcular posicion basandose en `getBoundingClientRect()`. Para touch, usar `touchstart`/`touchend`.

```css
.dash-tooltip {
  position: fixed;
  z-index: 1000;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-size: 12px;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
}
.dash-tooltip.visible { opacity: 1; }
```

**Referencia:** Plausible Analytics hover tooltips, Grafana panel tooltips, Recharts/Nivo tooltip patterns.

#### P5: Patrones y texturas en donuts para accesibilidad

**Que es:** Anadir patrones SVG (rayas diagonales, puntos, cruces, ondas) como fill alternativo en los segmentos de donut, visible cuando el usuario activa modo de alto contraste o para usuarios daltonicos.

**Por que importa:** WCAG 2.1 criterio 1.4.1 (nivel A) prohibe usar color como unico medio para transmitir informacion. Las donuts actuales dependen 100% del color. Aproximadamente el 8% de hombres tienen daltonismo; en una organizacion de 200 personas, ~8 hombres no podran distinguir segmentos rojo/verde.

**Aplicacion concreta:** Definir 6-8 patrones SVG (`<pattern>`) en un bloque `<defs>` reutilizable. Cada segmento de donut recibe tanto un `stroke` de color como un `fill` con patron. Los patrones se activan con media query `prefers-contrast: more` o mediante un toggle manual.

**Enfoque de implementacion:** Crear una funcion `getPattern(index)` que devuelva un ID de patron SVG. En `renderSvgDonut`, anadir los `<pattern>` al `<defs>` del SVG y aplicar `fill="url(#pattern-{n})"` como capa adicional sobre el stroke coloreado.

**Referencia:** Highcharts Accessibility patterns, IBM Carbon accessible charts.

#### P6: Graficos de barras horizontales mejorados con micro-labels

**Que es:** Anadir etiquetas de valor directamente sobre las barras (cuando caben) en lugar de solo al lado derecho. Las barras cortas muestran el valor fuera; las largas, dentro.

**Por que importa:** Reduce el movimiento ocular necesario para asociar barra con valor. Grafana, Metabase y Tableau usan este patron extensivamente. En el dashboard actual, el valor esta a la derecha (`.dash-gauge-value`) separado de la barra, forzando al ojo a "saltar".

**Aplicacion concreta:** En `renderSvgBarChart`, si `pctTotal > 30%`, el label se posiciona dentro de la barra (color blanco). Si `pctTotal <= 30%`, se posiciona justo a la derecha (color del texto).

**Enfoque de implementacion:** Modificar `renderSvgBarChart` para calcular el ancho disponible dentro de la barra y posicionar un `<span>` con texto truncado si es necesario.

**Referencia:** Grafana bar chart inline labels, Metabase horizontal bars.

### 4.3 Arquitectura de informacion

#### P7: Reordenar secciones de general a especifico

**Que es:** Cambiar el orden del dashboard para seguir el patron clasico de piramide invertida: KPIs globales -> vision general -> distribucion operativa -> personas -> analytics avanzado -> calidad -> actividad del gestor.

**Por que importa:** El principio de divulgacion progresiva (GoodData, Toptal) dicta que la informacion debe fluir de lo general a lo detallado. Actualmente "Analytics avanzado" (lo mas granular) aparece primero, seguido de "Vision general" (lo mas global). Esto invierte la jerarquia natural.

**Aplicacion concreta:**
```
NUEVO ORDEN:
1. KPIs (ya correcto)
2. Alertas (ya correcto)
3. Plazos FUNDAE (ya correcto)
4. Vision general (credito + estado)
5. Completitud
6. Distribucion operativa (proveedor, modalidad, area, departamento)
7. Personas y participacion (asistencia, confirmaciones, estacionalidad, recurrencia)
8. Calidad y proveedores (encuestas, scorecard)
9. Analytics avanzado (riesgo, ROI, cobertura, equidad, managers, cross-company)
10. Actividad del gestor
```

**Enfoque de implementacion:** Reorganizar los bloques `<div>` en el HTML del tab dashboard. Actualizar los IDs de seccion en el `dashNav`.

**Referencia:** Principios de IA de GoodData, patron de piramide invertida de Toptal.

#### P8: Filtros globales de dashboard

**Que es:** Anadir una barra de filtros debajo del header con selectores para: Empresa (select multiple), Periodo (date range o preset: mes actual, trimestre, ano), Estado (pills toggleables).

**Por que importa:** Actualmente el dashboard muestra datos agregados de todas las acciones sin posibilidad de segmentar. Un gestor de formacion con 5 empresas necesita poder ver metricas por empresa individual. Los dashboards de referencia (Grafana, Metabase, PostHog, Retool) incluyen filtros globales prominentes como funcion basica.

**Aplicacion concreta:** Una fila horizontal con 3 filtros tipo pill/chip. Al seleccionar filtros, `renderDashboard()` recibe un objeto `filters` que se aplica a `acciones` antes de calcular stats. Los filtros se persisten en `sessionStorage` (no `localStorage`, para no contaminar entre sesiones).

**Enfoque de implementacion:** Crear un `<div class="dash-filters">` debajo del header. Reutilizar el componente `.filter-select` existente. Modificar `renderDashboard()` para filtrar `acciones` al inicio. Anadir `renderDashboardFilters()` como funcion de inicializacion.

**Referencia:** Grafana template variables, Metabase dashboard filters, PostHog date/property filters.

#### P9: Navegacion con indicador de progreso

**Que es:** Transformar la nav sticky actual (pills) en una barra de progreso segmentada que muestra visualmente cuanto del dashboard se ha recorrido.

**Por que importa:** Con 19+ cards, el usuario pierde nocion de "donde estoy" en el scroll. Un indicador de progreso segmentado (estilo tabla de contenidos con progress bar) comunica posicion y longitud total del contenido.

**Aplicacion concreta:** Debajo del nav actual, anadir una barra fina (2px) dividida en segmentos proporcionales al tamano de cada seccion. El segmento activo se rellena con `--accent`. Alternativa: convertir las pills en steps tipo stepper (1/6, 2/6...).

**Enfoque de implementacion:** Usar el IntersectionObserver existente para actualizar una barra CSS. Crear `.dash-nav-progress` con segmentos `<div>` de ancho proporcional.

**Referencia:** Linear app section progress, long-form article scroll indicators.

### 4.4 Micro-interacciones y polish

#### P10: Skeleton loading durante renderizado

**Que es:** Antes de ejecutar `renderDashboard()`, inyectar placeholders grises animados con shimmer que replican la estructura del dashboard (5 rectangulosKPI, 2 cards rectangulares, etc.). Al completar el render, los skeletons se reemplazan por contenido real.

**Por que importa:** Estudios de Viget demuestran que skeleton screens hacen que los usuarios perciban tiempos de carga 20-30% mas rapidos que spinners o pantallas vacias. El dashboard actual muestra contenido vacio brevemente antes de poblarse, creando un "flash" visual.

**Aplicacion concreta:** Al entrar al tab Dashboard, mostrar inmediatamente: 5 rectangulosKPI con shimmer, 2 cards con shimmer, y una barra de alertas con shimmer. Tras `renderDashboard()`, reemplazar con contenido real usando `dashFadeUp`.

**Enfoque de implementacion:**
```css
.dash-skeleton {
  background: linear-gradient(90deg, var(--bg-input) 25%, var(--border) 50%, var(--bg-input) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius);
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
Funcion `showDashboardSkeleton()` que inyecta el HTML del skeleton. `renderDashboard()` lo elimina al empezar.

**Referencia:** LogRocket skeleton loading guide, freeCodeCamp skeleton CSS patterns.

#### P11: Transiciones suaves al colapsar/expandir cards

**Que es:** Animar la transicion de colapso de cards (`dash-card.collapsed`) con `max-height` + `overflow: hidden` en lugar del actual `display: none` abrupto.

**Por que importa:** El colapso abrupto (actual: `display: none` en hijos) causa un "salto" visual y reflow de todo el contenido inferior. Una transicion suave con `max-height` es un patron estandar que mejora la percepcion de calidad y reduce desorientacion.

**Aplicacion concreta:** Al hacer click en `.dash-card-title`, la card transiciona suavemente su altura a 0 (colapsada) o a su tamano natural (expandida). El icono chevron rota simultaneamente.

**Enfoque de implementacion:** Reemplazar `display: none` por `max-height: 0; overflow: hidden; transition: max-height 0.3s ease`. Usar `scrollHeight` para calcular la `max-height` objetivo al expandir.

**Referencia:** Material Design expansion panels, Shadcn accordion component.

#### P12: Hover states en barras de gauge

**Que es:** Al hover sobre una fila `.dash-gauge-row`, resaltar la barra (brightness +10%), oscurecer ligeramente las demas (opacity 0.6), y mostrar el tooltip contextual.

**Por que importa:** Las barras de gauge son el tipo de grafico mas usado en el dashboard (credito, proveedor, area, departamento). Sin hover, son elementos estaticos y "muertos". Con hover, se convierten en elementos explorables.

**Aplicacion concreta:** CSS puro para el efecto de focus (`.dash-gauge-row:hover .dash-gauge-bar-fill { filter: brightness(1.1); }`) combinado con JS para el tooltip.

**Enfoque de implementacion:** Anadir hover styles CSS a `.dash-gauge-row`. Para el efecto "dim others", usar el selector `.dash-card:has(.dash-gauge-row:hover) .dash-gauge-row:not(:hover) { opacity: 0.5; }`.

**Referencia:** Grafana hover focus on bar panels, Plausible country breakdown hover.

### 4.5 Accesibilidad

#### P13: ARIA roles y labels en graficos SVG

**Que es:** Anadir `role="img"` y `aria-label` descriptivo a cada SVG grafico. Anadir `aria-hidden="true"` a elementos decorativos (grid lines, background circles).

**Por que importa:** Lectores de pantalla (NVDA, JAWS, VoiceOver) no pueden interpretar graficos SVG sin roles ARIA. WCAG 2.1 criterio 1.1.1 (nivel A) lo exige. Sin esto, todo el contenido visual del dashboard es invisible para usuarios ciegos.

**Aplicacion concreta:**
- Donut: `<svg role="img" aria-label="Grafico circular: Acciones por estado. En marcha 12, Terminada 8, Pendiente 5.">`
- Barras: `<div role="img" aria-label="Credito FUNDAE por empresa. Empresa A: 15.000 EUR consumido de 25.000 EUR.">`
- Line chart: `<svg role="img" aria-label="Tendencia de asistencia para Accion X. Sesion 1: 95%, Sesion 2: 88%, Sesion 3: 72%.">`

**Enfoque de implementacion:** Modificar `renderSvgDonut`, `renderSvgBarChart`, `renderCompleteness` y los modulos analiticos para generar un texto alternativo descriptivo a partir de los datos renderizados. Pasar este texto como `aria-label` al SVG o al contenedor.

**Referencia:** Smashing Magazine "Accessibility Standards Empower Better Chart Design", Deque "How to make interactive charts accessible".

#### P14: Soporte para `prefers-reduced-motion`

**Que es:** Respetar la preferencia del sistema `prefers-reduced-motion: reduce` desactivando animaciones de entrada (`dashFadeUp`), conteo animado, pulse en completitud, y transiciones de donut.

**Por que importa:** Algunos usuarios tienen trastornos vestibulares que les causan nauseas o vertigo con animaciones. WCAG 2.3.3 (AAA) lo recomienda, y WCAG 2.3.1 (A) lo exige para animaciones que parpadean. Es una mejora de bajo esfuerzo y alto impacto etico.

**Aplicacion concreta:** Ya existe `@media (prefers-reduced-motion: reduce)` para tablas de catalogo pero NO para animaciones del dashboard.

**Enfoque de implementacion:**
```css
@media (prefers-reduced-motion: reduce) {
  .dash-kpi, .dash-card { animation: none; opacity: 1; transform: none; }
  .dash-donut-segment { transition: none; }
  .dash-gauge-bar-fill { transition: none; }
  .dash-completeness-fill { transition: none; animation: none; }
  .dash-completeness-fill.dash-pulse { animation: none; }
}
```
En JS, verificar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` antes de llamar a `animateValue()`.

**Referencia:** MDN prefers-reduced-motion, Smashing Magazine motion accessibility.

#### P15: Navegacion por teclado en graficos interactivos

**Que es:** Hacer que los elementos interactivos de graficos (segmentos de donut, barras, puntos de linea) sean focusables con teclado (Tab/Shift+Tab) y muestren tooltip al recibir foco.

**Por que importa:** WCAG 2.1 criterio 2.1.1 (nivel A) exige que toda funcionalidad sea accesible por teclado. Si los tooltips (P4) solo funcionan con mouse, los usuarios de teclado quedan excluidos.

**Aplicacion concreta:** Anadir `tabindex="0"` a cada barra/segmento interactivo. En `focus`, mostrar el mismo tooltip que en `mouseenter`. En `blur`, ocultarlo.

**Enfoque de implementacion:** Modificar las funciones de render para anadir `tabindex="0"` y `role="listitem"` a elementos interactivos. Registrar listeners `focus`/`blur` ademas de `mouseenter`/`mouseleave`.

**Referencia:** Highcharts keyboard navigation, Cambridge Intelligence accessible graph tools.

### 4.6 Diseno responsivo

#### P16: Clases CSS para tablas inline de modulos analiticos

**Que es:** Reemplazar los `style.cssText` extensivos en los modulos analiticos (attendance, confirmation, recurrence, provider scorecard, etc.) por clases CSS reutilizables.

**Por que importa:** Los modulos analiticos construyen tablas y KPI rows con estilos inline hardcodeados. Esto impide que los media queries afecten estos elementos. En pantallas <900px, las tablas se salen del viewport porque no tienen reglas responsivas. Ademas, el CSS inline es 3-5x mas costoso de mantener.

**Aplicacion concreta:** Crear clases: `.dash-mini-table`, `.dash-mini-kpi-row`, `.dash-mini-kpi`, `.dash-mini-chart-label`, `.dash-mini-alert-section`. Aplicarlas en lugar de los `style.cssText` existentes.

**Enfoque de implementacion:** Definir las clases en el bloque `<style>`. Refactorizar cada modulo analitico para usarlas. Anadir media queries para <900px.

**Referencia:** Responsive design best practices, CSS specificity management.

#### P17: KPI cards apiladas en movil

**Que es:** En pantallas <600px, las KPI cards deberian apilarse en 2 columnas (en lugar de `auto-fit`) y reducir padding/font-size para mejor uso del espacio.

**Por que importa:** Actualmente `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` funciona razonablemente, pero en 320px de ancho se apilan en 1 columna con mucho espacio desperdiciado. Un breakpoint explicito optimizaria el layout.

**Aplicacion concreta:**
```css
@media (max-width: 600px) {
  .dash-kpi-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .dash-kpi { padding: 12px; }
  .dash-kpi-value { font-size: 20px; }
}
```

**Enfoque de implementacion:** Anadir el media query al bloque de estilos del dashboard.

**Referencia:** Shadcn responsive KPI cards, Material Tailwind KPI blocks.

### 4.7 Percepcion de rendimiento

#### P18: Renderizado incremental del dashboard

**Que es:** En lugar de calcular y renderizar todo en `renderDashboard()` sincronicamente, dividir el renderizado en fases con `requestIdleCallback` o `setTimeout(fn, 0)`:
  - Fase 1 (inmediata): KPIs + Alertas
  - Fase 2 (50ms): Plazos + Completitud
  - Fase 3 (100ms): Vision general
  - Fase 4 (150ms): Resto de modulos analiticos

**Por que importa:** `renderDashboard()` ejecuta ~10 funciones de renderizado y ~5 funciones de calculo pesado (risk score, ROI, coverage, equity, manager analysis) sincronicamente. En datasets grandes (100+ acciones), esto puede bloquear el main thread >500ms, causando jank visible.

**Aplicacion concreta:** Envolver los bloques de render en `setTimeout` con delays incrementales. Las secciones below-the-fold (analytics avanzado, gestor) se renderizan solo cuando son visibles (IntersectionObserver lazy rendering).

**Enfoque de implementacion:** Reestructurar `renderDashboard()` para despachar renders en chunks:
```js
// Fase 1: inmediata
renderKpis();
renderAlerts();
// Fase 2: siguiente frame
requestAnimationFrame(function() {
  renderPlazos();
  renderCompletitud();
  // Fase 3
  requestAnimationFrame(function() {
    renderVisionGeneral();
    // etc.
  });
});
```

**Referencia:** Chrome DevTools performance profiling, Progressive rendering patterns.

#### P19: Lazy rendering de secciones below-the-fold

**Que es:** Usar IntersectionObserver para renderizar secciones del dashboard solo cuando estan a punto de entrar en el viewport (100px antes de ser visibles).

**Por que importa:** El 60-70% del dashboard esta below-the-fold al cargar. Renderizar todo inmediatamente desperdicia CPU en contenido que quizas nunca se vea. Lazy rendering reduciria el tiempo de carga inicial a ~1/3.

**Aplicacion concreta:** Las secciones "Personas y participacion", "Calidad y proveedores" y "Actividad del gestor" se renderizan lazy. Se muestra un placeholder skeleton hasta que son visibles.

**Enfoque de implementacion:** Cada seccion tiene un flag `rendered: false`. El IntersectionObserver existente (usado para scroll-spy) se extiende para disparar el render de la seccion al intersectar.

**Referencia:** React lazy loading patterns adaptados a vanilla JS, Grafana lazy panel rendering.

---

## 5. Matriz de prioridad

| # | Propuesta | Impacto | Esfuerzo | Prioridad |
|---|-----------|---------|----------|-----------|
| P4 | Tooltips interactivos en graficos | **Alto** | Medio | **P0** |
| P13 | ARIA roles y labels en SVGs | **Alto** | Bajo | **P0** |
| P14 | Soporte prefers-reduced-motion | **Alto** | **Bajo** | **P0** |
| P7 | Reordenar secciones general->detalle | **Alto** | **Bajo** | **P0** |
| P10 | Skeleton loading con shimmer | **Alto** | Medio | **P1** |
| P1 | Formateo condicional en KPIs | Alto | **Bajo** | **P1** |
| P8 | Filtros globales de dashboard | **Alto** | Alto | **P1** |
| P5 | Patrones en donuts (accesibilidad) | Alto | Medio | **P1** |
| P12 | Hover states en barras gauge | Alto | **Bajo** | **P1** |
| P16 | Clases CSS para tablas inline | Medio | Alto | **P2** |
| P11 | Transiciones suaves al colapsar | Medio | **Bajo** | **P2** |
| P6 | Labels inline en barras | Medio | **Bajo** | **P2** |
| P18 | Renderizado incremental | Medio | Medio | **P2** |
| P15 | Navegacion por teclado en graficos | Alto | Alto | **P2** |
| P2 | Tipografia tabular global | Bajo | **Bajo** | **P3** |
| P3 | Espaciado y ritmo vertical | Bajo | **Bajo** | **P3** |
| P9 | Indicador de progreso en nav | Bajo | Medio | **P3** |
| P17 | KPI cards apiladas en movil | Bajo | **Bajo** | **P3** |
| P19 | Lazy rendering below-the-fold | Medio | Medio | **P3** |

**Leyenda de prioridad:**
- **P0:** Hacer inmediatamente. Alto impacto, bajo-medio esfuerzo.
- **P1:** Hacer a corto plazo. Alto impacto, mayor esfuerzo.
- **P2:** Planificar. Impacto medio, mejora la calidad general.
- **P3:** Nice-to-have. Bajo impacto o alto esfuerzo relativo.

---

## 6. Galeria de inspiracion

| Patron | Aplicacion de referencia | URL / Ejemplo |
|--------|--------------------------|---------------|
| Tooltips interactivos | Plausible Analytics | plausible.io/sites |
| Tooltips interactivos | PostHog | app.posthog.com |
| KPI cards con tendencia | Vercel Analytics | vercel.com/analytics |
| KPI cards enriquecidas | Shadcn UI Blocks | shadcnstore.com/blocks/application/widgets |
| Skeleton loading | Linear App | linear.app |
| Dashboard navigation | Grafana 12 | grafana.com/docs/grafana/latest/visualizations/dashboards |
| Filtros globales | Metabase | metabase.com |
| Filtros globales | PostHog | posthog.com |
| Accesibilidad en charts | Highcharts | highcharts.com/accessibility |
| Patrones SVG accesibles | IBM Carbon | carbondesignsystem.com/data-visualization |
| Color palettes accesibles | Cloudscape (AWS) | cloudscape.design/foundation/visual-foundation/data-vis-colors |
| Responsive tables | Smashing Magazine patterns | smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1 |
| Micro-interacciones | Awwwards collection | awwwards.com/awwwards/collections/animation |
| KPI anatomy | Anastasiya Kuznetsova | nastengraph.substack.com/p/anatomy-of-the-kpi-card |
| Dashboard IA principles | GoodData | gooddata.com/blog/six-principles-of-dashboard-information-architecture |
| Dashboard best practices | Pencil & Paper | pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards |
| Dashboard principles | UXPin | uxpin.com/studio/blog/dashboard-design-principles |
| Dashboard trends 2025 | UI Top | uitop.design/blog/design/top-dashboard-design-trends |
| Data viz color | Datylon | datylon.com/blog/a-guide-to-data-visualization-color-palette |
| Sparklines compact | Displayr | displayr.com/using-sparklines-to-augment-bar-and-column-charts |

---

## Fuentes consultadas

- [Pencil & Paper — Dashboard UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [UXPin — Dashboard Design Principles 2025](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [UI Top — Dashboard Design Trends 2025](https://uitop.design/blog/design/top-dashboard-design-trends/)
- [Fuselab — Dashboard Design Trends 2025](https://fuselabcreative.com/top-dashboard-design-trends-2025/)
- [DesignRush — 9 Dashboard Design Principles 2026](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)
- [Fuselab — Data Visualization Trends 2025](https://fuselabcreative.com/top-data-visualization-trends-2025/)
- [Luzmo — Data Visualization Trends 2026](https://www.luzmo.com/blog/data-visualization-trends)
- [Anastasiya Kuznetsova — Anatomy of the KPI Card](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card)
- [Tabular Editor — KPI Card Best Practices](https://tabulareditor.com/blog/kpi-card-best-practices-dashboard-design)
- [Shadcn UI — KPI & Metric Cards](https://shadcnstore.com/blocks/application/widgets)
- [NinjaTables — Responsive Tables](https://ninjatables.com/responsive-tables/)
- [Smashing Magazine — Accessible Responsive Tables](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/)
- [IBM Carbon — Color Palettes for Data Viz](https://medium.com/carbondesign/color-palettes-and-accessibility-features-for-data-visualization-7869f4874fca)
- [Cloudscape — Data Vis Colors](https://cloudscape.design/foundation/visual-foundation/data-vis-colors/)
- [Datylon — Data Visualization Color Palette Guide](https://www.datylon.com/blog/a-guide-to-data-visualization-color-palette)
- [BricxLabs — 12 Micro Animation Examples 2025](https://bricxlabs.com/blogs/micro-interactions-2025-examples)
- [Justinmind — Micro-interactions Web Design 2025](https://www.justinmind.com/web-design/micro-interactions)
- [GoodData — Six Principles of Dashboard IA](https://www.gooddata.com/blog/six-principles-of-dashboard-information-architecture/)
- [Toptal — Dashboard Design Best Practices](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)
- [Smashing Magazine — Accessibility Standards Chart Design](https://www.smashingmagazine.com/2024/02/accessibility-standards-empower-better-chart-visual-design/)
- [Deque — How to Make Interactive Charts Accessible](https://www.deque.com/blog/how-to-make-interactive-charts-accessible/)
- [TPGi — Making Data Visualizations Accessible](https://www.tpgi.com/making-data-visualizations-accessible/)
- [LogRocket — Skeleton Loading Screen Design](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)
- [Grafana — Dashboard Best Practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/)
- [Vercel — New Dashboard UX](https://medium.com/design-bootcamp/vercels-new-dashboard-ux-what-it-teaches-us-about-developer-centric-design-93117215fe31)
- [Linear — Dashboards Documentation](https://linear.app/docs/dashboards)
