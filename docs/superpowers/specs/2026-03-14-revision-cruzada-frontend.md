# Revision Cruzada — Perspectiva Frontend y Diseno Visual

**Fecha:** 14 de marzo de 2026
**Rol:** Especialista en frontend premium y diseno visual
**Documentos cruzados:**
1. `propuestas-frontend-premium.md` (20 propuestas)
2. `propuestas-empatia-usuaria.md` (16 propuestas)
3. `auditoria-coherencia-propuesta-valor.md` (11 recomendaciones)
4. `estado-del-arte-ui-ux.md` (research UI/UX 2025-2026)
5. `percepcion-alto-valor-research.md` (research percepcion)

---

## 1. Incoherencias detectadas

### 1.1 Inter como fuente: elogio vs. estado del arte

**Conflicto:** Las propuestas frontend (seccion 0, diagnostico) califican la eleccion de Inter como "Excelente" y dicen "no tocar". La auditoria de coherencia (seccion 3.1) ratifica el "cumplimiento alto" de la tipografia unica.

**Pero el research de estado del arte dice otra cosa.** La seccion 7.3 del estado del arte documenta que en 2025-2026 la tendencia dominante es **variable fonts y tipografia fluida con `clamp()`**. Inter ya es variable font, pero `convocatoria.html` la carga con pesos estaticos (`wght@400;500;600;700` en la linea 9 del HTML). Esto significa que no se esta aprovechando la capacidad de variable font de Inter (transiciones suaves entre pesos, optimizacion de carga).

Ademas, el skill de frontend-design advierte explicitamente: "NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts)". Inter es una fuente correcta para aplicaciones de productividad, pero el propio research la identifica como una eleccion "segura" que no diferencia. Ningun documento aborda esta tension.

**Impacto:** Bajo en terminos practicos (Inter funciona bien), pero relevante para la narrativa de "premium". Tres de los cuatro referentes del research (Stripe, Linear, Vercel) usan tipografias custom o diferenciadas, no Inter.

### 1.2 Sombras: 2 niveles vs. 4 reales

**Conflicto directo entre documentos.** Las propuestas frontend (seccion 1.4) modifican `--shadow-accent` y proponen ajustar su opacidad. La auditoria (R7) senala que existen 4 niveles de sombra reales (`--shadow-sm`, `--shadow-lg`, `--shadow-accent`, `--shadow-accent-hover`) cuando el CLAUDE.md dice "solo 2 niveles". El research de percepcion (seccion 3.3) recomienda "limitar los niveles de sombra a 2-3".

Las propuestas frontend proponen refinar `--shadow-accent` (seccion 1.4) sin resolver la contradiccion de fondo: son 2 niveles o son 4. Se modifica un valor que, segun las propias reglas del proyecto, no deberia existir como nivel independiente.

**Resolucion propuesta:** Las sombras accent no son un "nivel" de elevacion — son una variante de color aplicada al mismo nivel. Redefinir la documentacion: 2 niveles de elevacion (`sm`, `lg`) + 1 variante de color accent (para botones primarios). Esto resuelve la ambiguedad sin cambiar el CSS.

### 1.3 Toasts: mejora incremental vs. cambio de paradigma

**Conflicto entre propuestas.** Las propuestas frontend (1.1) mejoran los toasts con icono, progreso y accion undo. Las propuestas de empatia (P1, pain point 1.1c) piden un panel persistente de calidad de datos porque "los toasts de NIFs duplicados o emails invalidos duran 4-6 segundos; si Laura no los lee, pierde la informacion".

Estos dos enfoques son **parcialmente contradictorios**. Frontend propone mejorar los toasts (hacerlos mas ricos); empatia propone complementarlos con un panel persistente para los casos donde los toasts son insuficientes por naturaleza. Pero ninguno de los dos aborda la recomendacion del estado del arte (seccion 4.3): un **centro de notificaciones in-app** con historial, categorizacion y marcado de leido/no leido.

**Ademas, el estado del arte (seccion 4.2) advierte sobre accesibilidad de toasts:** "Aparecen de forma impredecible y desaparecen demasiado rapido. Carecen de accesibilidad por teclado. Raramente son anunciados correctamente por tecnologias asistivas." Las propuestas frontend mejoran la estetica pero no abordan `aria-live` regions ni control de duracion por parte del usuario.

**Resolucion propuesta:** Tres capas complementarias. (1) Toasts mejorados segun propuesta frontend para feedback inmediato. (2) Panel persistente segun empatia para problemas de datos. (3) Atributo `aria-live="polite"` en el contenedor de toasts, con opcion de pausar la desaparicion al hacer hover. No necesitan un centro de notificaciones completo (excesivo para una app single-user), pero si un historial basico accesible desde un icono en el header.

### 1.4 Empty states: convergencia con matices divergentes

**Alineacion parcial con desalineacion en prioridad.** Las propuestas frontend (seccion 4) definen 3 variantes de empty state para la tabla + cola + historial. Las propuestas de empatia no mencionan empty states explicitamente. La auditoria (R8) pide empty states accionables para el dashboard.

El **conflicto** esta en que las propuestas frontend se centran en los empty states de la pestana de convocatoria (tabla, cola, historial), mientras la auditoria se centra en los del dashboard. El estado del arte (seccion 5.3) va mas alla y propone **datos de ejemplo** como patron: "Mostrar un dashboard de ejemplo con boton 'Generar datos de prueba' en lugar de mensajes genericos."

Ningun documento propone datos de ejemplo para el dashboard. Esto es una oportunidad perdida significativa que desarrollo en la seccion 2.

### 1.5 Atajos de teclado: conflicto de convencion entre documentos

**Conflicto directo.** Las propuestas frontend (seccion 8.1) proponen `Cmd+F` para busqueda de tabla y `Cmd+A` para seleccionar todos. Las propuestas de empatia (P12) proponen `Ctrl+E` para enviar y `Ctrl+F` para buscar empleado.

Problemas:
- `Cmd+F` / `Ctrl+F` es un atajo nativo del navegador (buscar en pagina). Interceptarlo romperia la expectativa del usuario y viola el principio del estado del arte (seccion 6.2): "Atajos de teclado estandarizados".
- `Cmd+A` / `Ctrl+A` es "seleccionar todo el texto" en el navegador. Interceptarlo en una app web es agresivo.
- Los atajos de empatia usan `Ctrl+` y los de frontend usan `Cmd+`. Deberian unificarse con la convencion `isMod = e.metaKey || e.ctrlKey`.

**Resolucion propuesta:** No interceptar atajos nativos del navegador (`Cmd+F`, `Cmd+A`). Usar en su lugar: `Cmd+K` para la paleta de comandos (que incluye buscar), `Cmd+Enter` para enviar, `Cmd+Shift+Enter` para anadir a cola. El estado del arte (seccion 1.2) confirma que `Cmd+K` es el estandar de facto.

### 1.6 Dialogo de confirmacion vs. vista previa de convocatoria

**Solapamiento funcional.** Las propuestas frontend (3.1) redisenan el dialogo de confirmacion con "resumen visual estructurado" (titulo del evento, fecha, conteo de asistentes, avisos FUNDAE). Las propuestas de empatia (P5) piden una "vista previa de la convocatoria" que muestre como se vera el email en Outlook.

Ambas propuestas anadir informacion antes de enviar, pero con enfoques diferentes:
- Frontend: enriquecer el dialogo de confirmacion existente con formato visual premium.
- Empatia: crear un componente nuevo de preview del email.

Si se implementan ambas, el usuario veria la informacion dos veces: primero en la preview del email, luego resumida en el dialogo de confirmacion.

**Resolucion propuesta:** Fusionar ambas. El dialogo de confirmacion actual se transforma en un dialogo de preview+confirmacion de dos secciones: arriba, preview del email (titulo, fecha, ubicacion, lista de asistentes truncada); abajo, avisos (conflictos, FUNDAE, encuesta). Un solo dialogo que cumple ambos objetivos con el tratamiento visual premium de la propuesta frontend.

### 1.7 Celebracion de cola vs. selectividad

**Tension con el research.** Las propuestas frontend (3.2) proponen confetti CSS al completar la cola. El estado del arte (seccion 4.5) advierte explicitamente: "Contexto sobre espectaculo. El confetti funciona mejor cuando se superpone a un progreso real. No celebrar la creacion de cuenta, sino el momento en que la cuenta es usable." Y tambien: "Selectividad: Las mejores animaciones de exito celebran logros reales, no acciones triviales."

Completar la cola ES un logro real, asi que el confetti estaria justificado. Pero la propuesta debe ser explicita sobre los limites: confetti SOLO al completar la cola (no al enviar una convocatoria individual). El research de percepcion (seccion 4.7) indica que "cuanto mas frecuente es un sonido/efecto, mas sutil debe ser". Si el confetti se usa para cada accion, pierde significado.

### 1.8 Nomenclatura del producto

**Incoherencia en scope.** La auditoria (R1) recomienda renombrar de "Convocatoria de Formaciones" a algo como "Gestor de Formacion FUNDAE". Las propuestas frontend no abordan esto — pero proponen un PDF de convocatoria (10.1) con cabecera que dice el titulo del evento, no el nombre de la app. Las propuestas de empatia no mencionan el nombre.

El estado del arte (seccion 5.1, onboarding) dice que el "aha moment" debe ocurrir rapido. Un nombre que no refleja el alcance real retrasa ese momento porque el usuario subestima la herramienta.

**Impacto visual:** El nombre actual aparece en `<title>` (linea 6 del HTML) y en `.app-header-title` (linea 197 del CSS). Un cambio de nombre afecta la identidad visual de toda la app.

---

## 2. Oportunidades perdidas

### 2.1 Dark mode: el elefante en la sala

El estado del arte (seccion 7.4) es rotundo: "El dark mode ya no es opcional en 2025." El research de percepcion (seccion 8.5) muestra que los 4 referentes premium (Stripe, Linear, Figma, Vercel) lo ofrecen. La auditoria (seccion 5.3) lo menciona como debilidad competitiva. **Pero ninguna de las 20 propuestas frontend lo incluye, ni las 16 de empatia, ni las 11 de auditoria lo priorizan como accion.**

El HTML ya tiene `prefers-reduced-motion` en linea ~742. No tiene `prefers-color-scheme`. El design system basado en CSS variables en `:root` (linea 13-55) esta preparado para dark mode — bastaria definir un segundo set de valores bajo `@media (prefers-color-scheme: dark)` o una clase `.dark`.

**Por que nadie lo propone:** Probablemente porque los estilos inline en el JS (detectado por la auditoria, R6) harian la implementacion muy laboriosa. Pero esto no es excusa para no mencionarlo como objetivo a medio plazo.

**Propuesta nueva:** Implementar dark mode en tres fases: (1) Definir tokens dark en `:root` con `[data-theme="dark"]`. (2) Migrar los estilos inline del JS mas criticos (dashboard, calendario) a clases CSS. (3) Anadir toggle en ajustes con opcion "Sistema" que use `prefers-color-scheme`.

### 2.2 Virtual scrolling para tablas grandes

El estado del arte (seccion 3.1) es explicito: "Virtual scrolling (windowing) es esencial para tablas con miles de filas. Solo renderiza las filas visibles en pantalla, manteniendo 60 FPS incluso con 10.000+ registros."

Las propuestas de empatia (1.2a, 2.2 punto 5) documentan que la tabla de 500+ empleados genera friccion al buscar. Las propuestas frontend (6.1) proponen skeleton screens para la carga, pero **ninguna propone virtual scrolling**.

`convocatoria.html` renderiza TODAS las filas del organigrama en el DOM. Con 2.000 empleados, eso son 2.000 nodos `<tr>` con multiples `<td>` cada uno. No es un problema de velocidad percibida (la app es local) — es un problema de rendimiento real que afecta scroll smoothness y memoria.

**Propuesta nueva:** Implementar virtual scrolling basico (sin libreria externa, con IntersectionObserver o calculo de viewport). Renderizar solo las filas visibles + 20 de buffer arriba y abajo. Mantener un `<div>` spacer con la altura total calculada para preservar la posicion del scroll. Esto mejoraria significativamente la experiencia con datasets >500 filas.

### 2.3 Personalizacion de columnas en la tabla

El estado del arte (seccion 3.2) documenta que las tablas modernas ofrecen show/hide columns, reordenar columnas y guardar configuracion. Ninguna propuesta lo incluye.

La tabla de asistentes tiene columnas fijas (checkbox, nombre, puesto, ubicacion, email). Para la gestora, no todas son igualmente relevantes en todo momento. Poder ocultar "Puesto" u "Ubicacion" cuando no son relevantes liberaria espacio visual, especialmente en pantallas mas estrechas.

### 2.4 Validacion on-blur en formularios

El estado del arte (seccion 2.3) establece que la validacion **on blur** (al salir del campo) es el patron preferido. Las propuestas frontend (5.1) proponen errores contextuales pero los vinculan al momento de intentar enviar. Las propuestas de empatia (pain point 1.3b) documentan que la fecha sin rellenar es un riesgo de error.

Ningun documento propone validacion on-blur para los campos de evento. Cuando la gestora sale del campo "Fecha" dejandolo vacio, deberia aparecer inmediatamente un indicador sutil (no un error agresivo — un borde naranja y un texto "Campo obligatorio" en gris). Esto es prevencion, no castigo.

### 2.5 Datos de ejemplo en el dashboard

El estado del arte (seccion 5.3) propone: "Mostrar un dashboard de ejemplo con boton 'Generar datos de prueba' en lugar de mensajes genericos." La auditoria (R8) pide empty states accionables pero no llega a proponer datos de ejemplo.

Para una herramienta single-file sin onboarding guiado para el dashboard, un boton "Ver con datos de ejemplo" permitiria a la gestora entender el valor del cuadro de mando ANTES de invertir horas rellenando el catalogo. Es el principio del "aha moment" (research percepcion seccion 7.6): "Si no se logra activar al usuario en los primeros 3 dias, hay un 90% de probabilidad de que lo abandone."

### 2.6 Bento Grid para el dashboard

El estado del arte (seccion 7.1) documenta que los bento grids dominaron 2025 y continuan en 2026, adoptados por Apple, Samsung, Microsoft y Google. El dashboard actual usa un layout lineal de cards apiladas verticalmente. Ninguna propuesta sugiere un layout de bento grid.

Un bento grid permitiria mostrar KPIs criticos en celdas mas grandes y metricas secundarias en celdas mas pequenas, creando jerarquia visual a traves del tamano del contenedor ademas del tamano tipografico. Esto se alinea con el principio de "patron de lectura en F" del research de percepcion (seccion 5.2).

### 2.7 View Transitions API

El estado del arte (seccion 9.3) documenta la View Transitions API como patron emergente para transiciones suaves entre estados. `convocatoria.html` cambia entre 5 pestanas mostrando/ocultando divs. No hay transicion entre pestanas — el cambio es instantaneo (toggle de `display: none`).

Anadir `document.startViewTransition()` al cambio de pestana daria una transicion suave (cross-fade de 150ms) que elevaria la percepcion de pulido sin complejidad significativa. El API es nativo de Chrome/Edge y degrada elegantemente en otros navegadores.

### 2.8 Glassmorphism funcional en overlays

El estado del arte (seccion 7.2) documenta que el glassmorphism ha madurado a "herramienta funcional para crear jerarquia visual". Los dialogos actuales usan `backdrop-filter: blur(4px)` (linea ~1457 del CSS). Las propuestas frontend (3.1) sugieren aumentar a `blur(8px)` para el dialogo de confirmacion.

La oportunidad perdida es sistematizar esto: todos los overlays (dialogos, paleta de comandos, dropdowns de filtros) deberian usar un nivel consistente de blur que cree la sensacion de profundidad que el estado del arte identifica como tendencia dominante.

### 2.9 Checklist de activacion

El estado del arte (seccion 5.4) documenta que las empresas con checklists de onboarding ven tasas de activacion del 40%+, un 60% por encima de la norma. El efecto Zeigarnik (necesidad de completar tareas inacabadas) es un mecanismo psicologico poderoso.

La app ya tiene un workflow de 3 pasos en la pestana de convocatoria, pero no tiene un checklist de activacion global que cubra: (1) Cargar organigrama, (2) Enviar primera convocatoria, (3) Crear primera accion formativa, (4) Explorar el dashboard. Esto guiaria a la gestora a descubrir el alcance real de la herramienta.

### 2.10 Filtros avanzados AND/OR

El estado del arte (seccion 3.5) documenta que Linear implemento en febrero 2026 filtros con condiciones AND/OR multiples. El sistema de filtros actual de `convocatoria.html` es AND implicito (Empresa=X AND Departamento=Y). No hay posibilidad de filtros OR (Empresa=X OR Empresa=Y dentro de un filtro es posible via multi-select, pero entre filtros diferentes siempre es AND).

Ningun documento propone esto. Para la gestora que necesita seleccionar "todos los de Madrid O todos los de Barcelona del departamento Comercial", el sistema actual requiere dos operaciones separadas.

---

## 3. Propuestas de mejora

### 3.1 Resolver incoherencias

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| 1.1 | Inter: elogio vs. estado del arte | Mantener Inter (la fuente es correcta), pero cargarla como variable font (`wght@300..700`) y usar `clamp()` para tipografia fluida. Esto moderniza sin cambiar la identidad. |
| 1.2 | Sombras 2 vs. 4 | Redefinir en documentacion: 2 niveles de elevacion + 1 variante de color. No cambiar CSS. |
| 1.3 | Toasts: mejora vs. panel persistente | Tres capas: toasts mejorados + panel persistente para datos + `aria-live` region. |
| 1.4 | Empty states: tabla vs. dashboard | Unificar bajo un sistema de componentes `.empty-state` con variantes por tipo, cubriendo tabla, cola, historial Y dashboard. |
| 1.5 | Atajos: conflicto de teclas | No interceptar atajos nativos. Usar `Cmd+K`, `Cmd+Enter`, `Cmd+Shift+Enter`, `Cmd+1..5`. |
| 1.6 | Confirmacion vs. preview | Fusionar en un dialogo de preview+confirmacion de dos secciones. |
| 1.7 | Confetti: selectividad | Confetti SOLO al completar la cola. Check animado para envios individuales. |
| 1.8 | Nombre del producto | Renombrar a "Central de Formacion" o "Formaciones FUNDAE". Actualizar `<title>` y header. |

### 3.2 Nuevas propuestas desde el research de UI/UX

#### NP1: Dark mode (impacto alto, esfuerzo alto)

Implementar dark mode aprovechando que el design system ya usa CSS variables. Fases:
1. Definir tokens dark bajo `[data-theme="dark"]` en `:root`.
2. Migrar los 10 componentes del dashboard con mas estilos inline a clases CSS.
3. Toggle en ajustes con 3 opciones: Claro, Oscuro, Sistema.

Referencia del estado del arte: seccion 7.4 — "No usar negro puro. Optar por grises oscuros. Sistema de superficies con elevaciones."

#### NP2: Virtual scrolling en tabla de asistentes (impacto alto, esfuerzo medio)

Para datasets >500 filas, renderizar solo las filas visibles + buffer. Implementacion con `IntersectionObserver` o calculo de viewport sin dependencias externas.

Referencia: estado del arte seccion 3.1.

#### NP3: View Transitions API para cambio de pestanas (impacto medio, esfuerzo bajo)

```javascript
function switchTab(tabId) {
  if (document.startViewTransition) {
    document.startViewTransition(() => applyTabChange(tabId));
  } else {
    applyTabChange(tabId);
  }
}
```

Cross-fade de 150ms entre pestanas. Degradacion elegante en navegadores sin soporte.

Referencia: estado del arte seccion 9.3.

#### NP4: Validacion on-blur en campos de evento (impacto medio, esfuerzo bajo)

Al salir de un campo obligatorio vacio (titulo, fecha, hora), mostrar indicador sutil: borde `var(--warning)` con `transition: border-color var(--transition)` y label "Campo obligatorio" en `font-size: 11px; color: var(--text-muted)`. No bloquear, solo informar.

Referencia: estado del arte seccion 2.3.

#### NP5: Datos de ejemplo en dashboard (impacto alto, esfuerzo medio)

Boton "Ver con datos de ejemplo" en el empty state principal del dashboard que carga un dataset sintetico de 3-5 acciones formativas con participantes, sesiones y metricas. Marca visual clara ("Datos de ejemplo") con boton "Borrar datos de ejemplo" persistente.

Referencia: estado del arte seccion 5.3.

#### NP6: Checklist de activacion (impacto medio, esfuerzo bajo)

Panel colapsable en la parte superior de la app (visible solo las primeras 5 sesiones) con 4 pasos: cargar organigrama, enviar primera convocatoria, crear accion formativa, explorar dashboard. Progreso persistido en localStorage. Se oculta permanentemente al completar o al pulsar "No mostrar mas".

Referencia: estado del arte seccion 5.4 — "mejora del 60% en tasas de activacion".

#### NP7: Tipografia fluida con clamp() (impacto bajo, esfuerzo bajo)

Reemplazar los tamanos de fuente fijos del design system por escalas fluidas:
```css
/* Ejemplo: el titulo del header */
.app-header-title { font-size: clamp(14px, 0.9rem + 0.2vw, 16px); }
/* KPI values en dashboard */
.dash-kpi-value { font-size: clamp(24px, 1.5rem + 0.5vw, 32px); }
```

Esto elimina la necesidad de breakpoints tipograficos para pantallas intermedias.

Referencia: estado del arte seccion 7.3.

#### NP8: Blur sistematico en overlays (impacto bajo, esfuerzo bajo)

Unificar el `backdrop-filter` de todos los overlays:
```css
.dialog-overlay, .cmdk-overlay, .filter-dropdown-backdrop {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

Actualmente los dialogos usan `blur(4px)` (linea ~1457). Aumentar a `blur(8px)` de forma consistente en todos los overlays crea profundidad y jerarquia visual uniforme.

Referencia: estado del arte seccion 7.2.

### 3.3 Ajustes a propuestas existentes

#### Ajuste a Frontend 1.1 (Toasts): anadir `aria-live`

La propuesta de toasts mejorados es solida pero omite accesibilidad. Anadir al contenedor de toasts:
```html
<div id="toastContainer" role="status" aria-live="polite" aria-atomic="false">
```

Esto permite que lectores de pantalla anuncien los toasts sin interrumpir al usuario. El estado del arte (seccion 4.2) lo exige explicitamente.

#### Ajuste a Frontend 7.1 (Cmd+K): anadir acciones contextuales

La propuesta de paleta de comandos lista acciones estaticas. El estado del arte (seccion 1.2) documenta que los command palettes modernos "no solo buscan contenido sino que ejecutan acciones". Anadir acciones contextuales:
- Si hay datos cargados: "Buscar empleado: [nombre]" que filtra la tabla en tiempo real.
- Si hay catalogo: "Ir a accion: [nombre]" que abre la ficha de la accion formativa.
- Si hay filtros activos: "Limpiar filtros" aparece como accion sugerida.

#### Ajuste a Frontend 6.1 (Skeleton tabla): usar shimmer existente

La propuesta es correcta pero define un nuevo `@keyframes shimmer`. El dashboard ya tiene la animacion `shimmer` (linea ~1800 aprox. del CSS). Reutilizar la existente en vez de definir una nueva, siguiendo el principio del CLAUDE.md de no duplicar.

#### Ajuste a Frontend 3.1 (Dialogo confirmacion): integrarlo con preview de empatia

Como se resolvio en la incoherencia 1.6, el dialogo de confirmacion debe fusionarse con la vista previa del email. El diseño visual premium de la propuesta frontend (animacion diferenciada, borde indigo superior) se mantiene, pero el contenido incluye la preview del email que pide la propuesta de empatia (P5).

#### Ajuste a Auditoria R3 (Divulgacion progresiva en dashboard): opcion B con bento

La auditoria propone dos opciones: (A) colapsar modulos avanzados, (B) dashboard personalizable. La opcion B es mas alineada con el estado del arte, pero se puede mejorar combinandola con un layout bento grid (oportunidad perdida 2.6). El usuario no solo elige que modulos ver, sino que los puede reorganizar en una grid de tamanos variables.

#### Ajuste a Empatia P3 (Semaforo FUNDAE): anadir data storytelling

La propuesta de semaforo de readiness es funcional pero "datos crudos". El research de percepcion (seccion 5.5) establece que "el data storytelling es siempre explicativo, anadiendo narrativa y contexto". En vez de solo rojo/amarillo/verde, anadir una frase generada: "Faltan 3 datos para generar el XML: NSS de 2 participantes y el telefono del responsable. [Completar datos]". Esto transforma un semaforo en una guia accionable.

---

## 4. Priorizacion revisada — Top 10

Considerando todas las propuestas (originales de los 3 specs + nuevas del research), ordenadas por impacto real ponderado por: (a) mejora de percepcion premium, (b) reduccion de friccion, (c) alineacion con estado del arte, (d) ratio impacto/esfuerzo.

| # | Propuesta | Origen | Esfuerzo | Impacto | Justificacion |
|---|-----------|--------|----------|---------|---------------|
| **1** | **Paleta de comandos Cmd+K** (con acciones contextuales) | Frontend 7.1 + ajuste 3.3 | Alto | Muy alto | El estado del arte (1.2) la situa como patron universal, ya no solo para power users. Linear, Notion, Vercel, GitHub, Figma la implementan. Es la senal de sofisticacion mas reconocible. La app tiene 5 pestanas con funcionalidades dispersas — un hub central de navegacion es critico. |
| **2** | **Dialogo de preview+confirmacion fusionado** | Frontend 3.1 + Empatia P5 | Medio | Muy alto | Regla pico-final (percepcion 2.4): confirmar la convocatoria ES el pico de la experiencia. Fusionar preview y confirmacion maximiza el impacto de ese momento con un unico componente premium. Resuelve el miedo a errores de la gestora. |
| **3** | **Panel persistente de calidad de datos** | Empatia P1 | Medio | Alto | Pain point 1.1c es de severidad alta. Los toasts efimeros para informacion critica son un anti-patron documentado (estado del arte 4.2). Este panel transforma la incertidumbre en confianza — la gestora sabe en todo momento si hay problemas sin depender de su capacidad de leer toasts en 4 segundos. |
| **4** | **Toasts con icono, progreso, accion undo y aria-live** | Frontend 1.1 + ajuste 3.3 | Bajo | Alto | Efecto multiplicador: cada operacion de la app pasa por toasts. Mejorarlos mejora TODO. La adicion de `aria-live` alinea con WCAG 2.2 (estado del arte 8.1). Bajo esfuerzo, alto impacto acumulativo. |
| **5** | **Empty states contextuales (tabla + cola + historial + dashboard)** | Frontend 4.1-4.3 + Auditoria R8 | Medio | Alto | El research de percepcion (hallazgo 8) es contundente: "Los estados vacios son tests de calidad." Unificar todas las propuestas de empty states en un sistema coherente de componentes con variantes cubre los edge cases que definen la percepcion de profesionalismo. |
| **6** | **Semaforo de readiness FUNDAE con data storytelling** | Empatia P3 + ajuste 3.3 | Medio | Alto | Elimina el peak negativo del mapa emocional (empatia 4.2): descubrir datos FUNDAE incompletos al final. Prevenir es mas valioso que curar. El data storytelling lo hace accionable en vez de solo informativo. |
| **7** | **Errores contextuales en formulario + validacion on-blur** | Frontend 5.1 + NP4 | Medio | Alto | Los errores fuera de contexto son anti-patron documentado (percepcion 9.2). La validacion on-blur es el patron preferido 2025 (estado del arte 2.3). Combinar ambos: on-blur para prevencion, contextual para correccion al enviar. |
| **8** | **Barra de progreso + celebracion al completar cola** | Frontend 3.2 + 3.3 | Medio | Alto | La cola es el flujo mas largo. Sin progreso visual, se siente como una secuencia de dialogos aislados. La barra de progreso transforma la experiencia en un flujo coherente; la celebracion cierra el momento final con impacto emocional (regla pico-final). |
| **9** | **Skeleton screen para tabla de asistentes** | Frontend 6.1 | Bajo | Alto | El dashboard ya tiene skeletons. La tabla no. Incoherencia interna que el estado del arte marca como critica (percepcion 6.4): "los skeleton screens reducen la percepcion de espera un 30%". Bajo esfuerzo porque se reutiliza la animacion `shimmer` existente. |
| **10** | **Atajos de teclado globales** (sin interceptar nativos) | Frontend 8.1 + resolucion 1.5 | Medio | Alto | "Keyboard-first como filosofia" es mega-tendencia 2025-2026 (estado del arte, conclusion 2). Incluso un conjunto reducido (`Cmd+K`, `Cmd+Enter`, `Cmd+1..5`, `Escape`) transforma la percepcion de herramienta profesional. Los tooltips con atajos son revelacion progresiva (percepcion 4.5). |

### Menciones honorables (posiciones 11-15)

| # | Propuesta | Origen | Nota |
|---|-----------|--------|------|
| 11 | Dark mode | NP1 | Impacto muy alto pero esfuerzo alto. Depende de la migracion de estilos inline (auditoria R6). Objetivo a medio plazo, no quick win. |
| 12 | PDF de convocatoria | Frontend 10.1 | "La calidad del PDF es senal directa de calidad enterprise" (percepcion 7.3). Unico artefacto que personas externas a la app ven. |
| 13 | Duplicar accion formativa | Empatia P4 | Bajo esfuerzo, alto impacto funcional. No es una mejora de frontend/visual sino de flujo, por eso no entra en el top 10 visual. |
| 14 | Busqueda flexible de hoja Excel | Empatia P11 | Bajo esfuerzo, elimina el peor primer contacto posible. Critico funcionalmente, no visualmente. |
| 15 | Virtual scrolling | NP2 | Necesario para datasets >500 filas. Impacto creciente con el tamano del organigrama. |

---

## 5. Observaciones finales de coherencia de diseno

### 5.1 El problema de los estilos inline en JS es el bloqueador numero uno

La auditoria (R6) detecta que los estilos inline en el JS son un problema de mantenimiento. Desde la perspectiva de frontend premium, son mucho mas que eso: **son el bloqueador principal de cualquier evolucion visual significativa**. Dark mode, temas personalizados, responsive refinado, auditoria de consistencia tipografica — todo queda bloqueado mientras haya miles de lineas de `style="font-size:12px;color:var(--text-muted)"` en funciones de renderizado.

Ninguna de las 3 specs prioriza esto suficientemente. La auditoria lo pone en posicion 11 de 11. Lo elevo a prerequisito para las propuestas de fase 3.

### 5.2 La app tiene una base visual excelente que pocos proyectos internos alcanzan

Quiero ser explicito: el design system de `convocatoria.html` (`:root` con 30+ variables, paleta restringida, tipografia unica, transicion estandar, focus-visible, skeleton screens) es significativamente superior al 95% de herramientas internas corporativas. Las propuestas de los 3 specs son de **refinamiento**, no de correccion fundamental. Eso habla de una base solida.

### 5.3 El efecto compuesto es la estrategia correcta

El research de percepcion (hallazgo 10) documenta que la percepcion premium de Stripe, Linear y Vercel no viene de ninguna feature individual sino del "efecto compuesto de cientos de decisiones de diseno correctas". La priorizacion de este informe refleja esa filosofia: las primeras 4 propuestas son de impacto medio individual pero impacto acumulativo muy alto. Toasts mejorados + empty states + errores contextuales + skeleton screens = una app que se siente cuidada en cada interaccion.

### 5.4 El research de UI/UX aporta 3 patrones que ningun spec previo menciona

1. **View Transitions API** (NP3) — transiciones nativas entre estados, zero-dependency.
2. **Virtual scrolling** (NP2) — esencial para escalabilidad, no mencionado por nadie.
3. **Checklist de activacion** (NP6) — 60% de mejora en activacion con un patron simple.

Estos tres patrones son complementarios a las propuestas existentes y representan las mayores oportunidades de diferenciacion no cubiertas.
