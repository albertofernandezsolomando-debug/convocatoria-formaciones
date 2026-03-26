# Auditoria de Coherencia de la Propuesta de Valor

**Fecha:** 14 de marzo de 2026
**Tipo:** Analisis estrategico de producto — sin cambios de codigo
**Ambito:** `convocatoria.html` como herramienta integral de gestion de formacion

---

## 0. Metodologia

Esta auditoria evalua la coherencia interna de `convocatoria.html` cruzando tres fuentes:

1. **El codigo fuente completo** (~15.500 lineas) — CSS, HTML y JS leidos seccion por seccion.
2. **El document de investigacion** `2026-03-14-percepcion-alto-valor-research.md` — hallazgos sobre percepcion de valor, consistencia visual, feature bloat y uso funcional del color.
3. **Las convenciones del proyecto** (`CLAUDE.md`) — design system, patrones JS, restricciones explicitas.

Cada seccion incluye hallazgos positivos y negativos, con citas especificas de la investigacion cuando son relevantes.

---

## 1. Auditoria de la Propuesta de Valor

### 1.1 Identidad declarada vs. identidad real

**Declarada:** El titulo del documento HTML es "Convocatoria de Formaciones". El onboarding describe un flujo de 3 pasos: cargar organigrama, filtrar y seleccionar asistentes, configurar evento y enviar. La pestana activa por defecto es "Convocatoria".

**Real:** La aplicacion contiene 5 pestanas con alcances muy distintos:

| Pestana | Alcance funcional | Lineas CSS+HTML+JS aprox. |
|---------|-------------------|---------------------------|
| **Convocatoria** | Carga Excel, filtros, seleccion, series, templates, cola, envio Outlook, encuestas PA | Nucleo original, ~4.000 lineas JS |
| **Catalogos FUNDAE** | CRUD de 4 entidades (acciones, grupos, centros, empresas), import/export Excel, vista lista con sort/filter/edit inline, formularios con timeline de notas, asignacion de participantes, control de asistencia y confirmaciones | ~3.000 lineas JS |
| **Generar XML FUNDAE** | 3 tipos de XML (Accion, Inicio, Finalizacion), validacion de campos, tabla de participantes, ZIP batch, exportacion Excel FUNDAE | ~1.500 lineas JS |
| **Calendario** | Gantt con zoom (dia/semana/mes), swim lanes, agrupacion, filtros, split pane con drag, tabla ordenable, panel de detalle | ~1.200 lineas JS |
| **Cuadro de Mando** | 15+ modulos analiticos (KPIs con sparklines, alertas, plazos FUNDAE, credito, estado, completitud, proveedores, modalidad, areas, asistencia con SVG, confirmaciones, estacionalidad, recurrencia, encuestas, scorecard, riesgo, ROI, cobertura con heatmap, equidad, gestor, interempresarial) | ~4.000 lineas JS |

**Diagnostico:** Existe una **brecha de identidad** significativa. El nombre "Convocatoria de Formaciones" describe una funcionalidad (enviar convocatorias), no un producto (gestionar formacion bonificada). El usuario que llega a la aplicacion espera una herramienta de envio; lo que encuentra es una plataforma de gestion integral con compliance FUNDAE, analitica avanzada y planificacion temporal.

> *Hallazgo de la investigacion:* "Las interfaces que se ajustan a las expectativas del usuario (prototipicidad alta) y mantienen baja complejidad visual reciben calificaciones mas altas" (Tuch et al., 2012). La brecha entre el nombre y el alcance real viola este principio: el usuario forma una expectativa con el titulo y la encuentra rota al descubrir 5 pestanas con funcionalidades dispares.

### 1.2 Propuesta de valor implicita

Analizando las funcionalidades implementadas, la propuesta de valor real es:

> **"Todo lo que necesitas para gestionar formacion bonificada FUNDAE en una sola pagina: desde la convocatoria hasta la justificacion XML, con analitica operativa y seguimiento de catalogos."**

Esta propuesta es coherente internamente — cada pestana cubre una fase del ciclo de vida de la formacion bonificada. Pero no esta articulada en ningun lugar de la interfaz. El onboarding solo menciona la convocatoria (3 pasos). Las otras 4 pestanas no tienen guia de entrada.

### 1.3 Tension: herramienta personal vs. plataforma departamental

Varios indicadores sugieren que la aplicacion fue concebida para un usuario unico (el gestor de formacion):

- **Sin autenticacion ni roles.** Todo se persiste en `localStorage` del navegador del usuario.
- **Un solo webhook de Power Automate.** Configurado en Settings, no por usuario.
- **Dashboard con "Actividad del gestor"** — seccion con nombre singular.
- **Sin funciones colaborativas.** No hay comentarios, menciones, permisos, ni actividad en tiempo real.

Pero otros indicadores apuntan a una ambicion mas amplia:

- **Modulos analiticos de nivel directivo** (ROI, equidad, cobertura con heatmap por departamento, riesgo scoring con 7 factores ponderados).
- **Scorecard de proveedores** con metricas de coste/hora y diversificacion.
- **Analisis interempresarial** con comparativa entre empresas del grupo.

**Diagnostico:** Hay una tension no resuelta. Si es una herramienta personal, los modulos analiticos avanzados son over-engineering. Si es una plataforma departamental, la arquitectura de un solo fichero HTML con localStorage es insuficiente. La propuesta de valor necesita decidir cual es.

---

## 2. Analisis de Coherencia Funcional

### 2.1 Mapa de madurez por funcionalidad

No todas las funcionalidades tienen el mismo grado de pulido. Esto afecta directamente a la percepcion de calidad:

| Funcionalidad | Madurez | Evidencia |
|---------------|---------|-----------|
| Flujo de convocatoria (3 pasos) | **Alta** | Workflow visual con pasos numerados, validacion, series, templates (3 tipos), cola de envio con persistencia, deep links Outlook, integracion PA |
| Sistema de filtros | **Alta** | Cascading, typeahead, presets guardados, exclusion por `_id`, normalizacion de espacios |
| Catalogos FUNDAE | **Alta** | CRUD completo, 4 entidades, import/export Excel, vista lista con sort/filter/inline edit, formularios con notas timeline, asignacion de participantes |
| Generacion XML | **Media-Alta** | 3 tipos de XML, validacion, ZIP batch. Pero la UI es densa y sin guia |
| Calendario/Gantt | **Media** | Zoom, swim lanes, split pane con drag. Pero es read-only (no se pueden crear ni editar eventos desde el calendario), y depende enteramente del catalogo |
| Dashboard: KPIs y alertas | **Media** | Sparklines, tendencias, alertas con umbrales configurables. Skeleton loading implementado |
| Dashboard: modulos intermedios | **Media-Baja** | Donut charts, completeness bars, distribucion por area. Funcionales pero con muchos estados vacios si no hay datos suficientes |
| Dashboard: modulos avanzados | **Baja** | ROI, equidad, riesgo, interempresarial, gestor. Altamente especializados pero sin datos para alimentarlos en la mayoria de escenarios reales |
| Certificados/hoja de firmas | **Baja** | Estructura basica con `@media print`, sin diseno visual ni personalizacion |

> *Hallazgo de la investigacion:* "Los usuarios juzgan la calidad de una aplicacion no por los happy paths, sino por como maneja los edge cases" (seccion 3.5). "Un empty state informativo y accionable comunica profesionalismo; un error generico tipo 'Ha ocurrido un error' comunica negligencia."

**Problema concreto:** Los modulos avanzados del dashboard usan `renderEmptyState()` con mensajes como "Sin datos disponibles", "Sin datos suficientes", "Sin datos del campo 'Depende de'". Estos empty states son informativos pero no accionables — no dicen al usuario que hacer para conseguir datos. Dado que muchos usuarios nunca tendran datos para estos modulos (requieren campos del Excel que no siempre existen), la experiencia habitual es ver multiples secciones vacias. Esto degrada la percepcion de calidad de toda la pestana.

### 2.2 Coherencia del flujo entre pestanas

**Flujos conectados:**
- Convocatoria -> Catalogos: al enviar una convocatoria con "Vincular a catalogo" activo, se anaden participantes a la accion formativa correspondiente. Flujo bien implementado.
- Catalogos -> XML: el selector de accion formativa en la pestana XML se alimenta del catalogo. Conexion funcional.
- Catalogos -> Calendario: el calendario lee las acciones formativas del catalogo para generar barras Gantt. Conexion funcional.
- Catalogos -> Dashboard: todas las metricas se calculan desde los datos del catalogo. Conexion funcional.

**Flujos rotos o ausentes:**
- **Calendario -> Convocatoria:** No se puede iniciar una convocatoria desde el calendario. Si el usuario ve una formacion en el Gantt y quiere convocar, debe cambiar de pestana y configurar manualmente.
- **Dashboard -> Accion:** Los KPIs y alertas del dashboard son informativos pero no accionables. No hay links que lleven al usuario a la accion concreta (ej: "3 grupos sin participantes" no enlaza a esos grupos en el catalogo).
- **Convocatoria -> Dashboard:** Enviar convocatorias no actualiza automaticamente el dashboard (requiere cambiar de pestana para que se re-renderice).

> *Hallazgo de la investigacion:* "Disenar el dashboard para conectar metricas con acciones: incluir umbrales, indicadores o sugerencias basadas en tendencias de datos" (seccion 5.4). El dashboard actual presenta datos pero rara vez conecta con acciones correctivas.

### 2.3 Feature bloat vs. feature richness

La distincion clave de la investigacion:

> *"Feature bloat ocurre cuando la adicion continua de funcionalidades abruma la propuesta de valor principal del producto. Los productos mas exitosos no son los que tienen mas funciones, sino los que tienen las funciones correctas."* (seccion 9.5)

> *"La disposicion del usuario a aprender es el factor mas importante: si los usuarios estan entusiasmados con la interfaz, aceptaran mas funciones e invertiran tiempo en aprenderlas."* (seccion 9.5)

**Evaluacion:** La aplicacion esta en la frontera entre riqueza y sobrecarga, con algunos modulos claramente al otro lado:

**Riqueza funcional (justificada):**
- El flujo Convocatoria + Catalogos + XML cubre el ciclo completo de gestion FUNDAE. Cada parte resuelve un problema real del gestor.
- Los filtros con presets y templates son sofisticados pero justificados por el uso repetitivo (formaciones recurrentes).
- El sistema de cola permite preparar multiples envios — util para gestores con muchas formaciones.

**Posible bloat (no justificado para un usuario unico):**
- **15+ modulos de dashboard** cuando el usuario tipo probablemente consulta 3-5 metricas regularmente. No hay personalizacion de cuales mostrar.
- **ROI y calculo de retorno** requieren datos que la herramienta no puede obtener (impacto real en productividad). El calculo usa proxies que pueden dar una falsa sensacion de precision.
- **Analisis de equidad** (indice Gini de distribucion de formacion) es una metrica de nivel directivo de RRHH, no de gestor operativo.
- **Analisis interempresarial** asume grupos de empresas con formacion compartida — un caso de uso muy especifico.
- **Risk scoring con 7 factores ponderados** es sofisticado pero opaco — el usuario no puede entender por que una formacion tiene una puntuacion concreta sin estudiar los pesos.

**Senal de bloat critica:** La aplicacion tiene modulos que requieren datos que solo existen si el usuario mantiene meticulosamente el catalogo con campos opcionales. El gestor que simplemente quiere enviar convocatorias encontrara que la mitad del dashboard muestra empty states.

### 2.4 Duplicacion funcional

Existen solapamientos que crean confusion:

- **Templates de convocatoria (3 tipos):** Plantillas de evento, plantillas de filtro+evento, plantillas de formaciones recurrentes. La distincion entre los tres tipos no es obvia para el usuario. Podrian unificarse.
- **Asignacion de participantes:** Se puede hacer desde la convocatoria (con envio automatico al catalogo) O directamente en el catalogo (manualmente o por importacion masiva). Dos caminos al mismo resultado con flujos diferentes.
- **Datos del evento:** Se configuran en el panel izquierdo de Convocatoria Y en los formularios del catalogo. La duplicacion genera riesgo de inconsistencia.

---

## 3. Coherencia del Lenguaje de Diseno

### 3.1 Cumplimiento del design system

El design system definido en `:root` es ejemplar en su restriccion:

| Aspecto | Definicion | Cumplimiento |
|---------|-----------|--------------|
| Paleta (Indigo-600 + Slate) | 14 variables de color | **Alto** — variables usadas consistentemente en CSS |
| Tipografia (Inter unica) | `var(--font-body)` | **Alto** — no se detectan otras fuentes |
| Sombras (2 niveles) | `--shadow-sm`, `--shadow-lg` | **Alto** en CSS. Nota: existe `--shadow-accent` y `--shadow-accent-hover` adicionales (4 niveles reales) |
| Border-radius (3 valores) | `--radius-sm`, `--radius`, `--radius-lg` | **Alto** en CSS |
| Transicion estandar | `--transition` | **Alto** en CSS |

> *Hallazgo de la investigacion:* "Un 75% de los juicios de credibilidad de marca se basan en la coherencia del diseno. Las inconsistencias visuales (incluso pequenas) generan desconfianza desproporcionada" (seccion 2, hallazgo 5).

**Fortaleza:** El CSS del fichero es notablemente consistente. Las variables se usan en los selectores de clase de forma disciplinada. Esto es una ventaja competitiva real frente a herramientas internas que usan defaults de frameworks.

### 3.2 El problema de los estilos inline en JS

Sin embargo, la consistencia se degrada significativamente en el JavaScript. Busquedas en el codigo revelan patrones como:

- **Estilos inline masivos** en funciones de renderizado del dashboard, calendario y catalogos. Cada `renderDashboard*()` construye HTML con `style="..."` directamente, sin usar clases CSS.
- **Colores hardcodeados** via variables CSS pero insertados inline: `color:var(--text-muted)`, `background:var(--accent-light)`. Esto respeta la paleta pero no la arquitectura — cambiar el diseno de un componente requiere buscar en miles de lineas de JS, no en CSS.
- **Tamaños de fuente dispersos** en atributos `style`: `font-size:11px`, `font-size:12px`, `font-size:13px`, `font-size:14px`, `font-size:15px`. Los valores son correctos (coinciden con la escala del design system), pero su distribucion en JS inline hace imposible auditar la consistencia tipografica.

**Impacto:** La coherencia visual se mantiene *hoy* porque un solo desarrollador controla todo. Pero el patron es fragil — cualquier adicion futura puede introducir inconsistencias sin que sean detectables por inspeccion del CSS.

### 3.3 Uso funcional del color

> *Hallazgo de la investigacion:* "Cada uso de color debe tener un proposito funcional. El color no es decoracion; es jerarquia funcional" (seccion 3.2, citando el patron de Stripe).

**Evaluacion del uso de color en la aplicacion:**

| Color | Uso previsto (design system) | Uso real |
|-------|------------------------------|----------|
| `--accent` (Indigo-600) | Acciones primarias, estados activos | **Correcto**: botones primarios, tabs activos, workflow steps activos, links |
| `--accent-light` (Indigo-100) | Chips, badges, fondo sutil | **Correcto**: chips de filtro, badges de conteo |
| `--accent-subtle` (Indigo-50) | Hover de filas, fondos de paneles destacados | **Correcto**: hover, filas seleccionadas |
| `--danger` (Red-600) | Errores, eliminar | **Correcto**: botones de eliminar, mensajes de error |
| `--warning` (Amber-600) | Advertencias | **Correcto**: toasts de advertencia, alertas del dashboard |
| `--success` (Green-600) | Confirmaciones, exito | **Correcto**: toasts de exito, estados completados |
| `--chart-1` a `--chart-8` | Graficos del dashboard | **Correcto**: cada serie de datos tiene un color asignado |

**Hallazgo positivo:** El uso del color es consistentemente funcional. No se detecta uso decorativo del color (degradados, colores de fondo para "animar", tonos arbitrarios). Cada color comunica un estado o tipo de elemento.

**Area de mejora:** La paleta de charts (`--chart-1` a `--chart-8`) introduce 8 colores adicionales. Algunos (como `--chart-5: #EF4444`) son muy cercanos a `--danger: #dc2626`. En un dashboard con alertas rojas Y graficos con segmentos rojos, el usuario podria confundir una serie de datos con una senal de error.

### 3.4 Espaciado y densidad

El design system incluye variables de espaciado (`--space-xs` a `--space-xl`), pero muchos valores de padding y margin estan hardcodeados en los estilos inline del JS:

- `padding:6px 8px` — no coincide con ninguna variable de spacing.
- `margin:12px 0` — corresponde a `--space-md` pero no la usa.
- `gap:12px` — idem.

Esto no genera inconsistencia visual (los valores son sensatos), pero rompe la sistematicidad del design system. Si se decidiera aumentar el espaciado global, no bastaria con cambiar las variables CSS.

---

## 4. Coherencia del Recorrido del Usuario

### 4.1 El flujo principal: excelente

El flujo Convocatoria (cargar -> filtrar -> configurar -> enviar) es el nucleo de la aplicacion y esta muy bien resuelto:

1. **Onboarding** con 3 pasos claros y visuales.
2. **Workflow visual** con indicadores de progreso (pending/active/completed).
3. **Panel izquierdo** con secciones numeradas que guian la secuencia.
4. **Validacion progresiva** — los pasos se van habilitando.
5. **Action bar** fija que siempre muestra las acciones disponibles.
6. **Confirmacion** con dialogo de conflictos y checklist de preparacion FUNDAE.
7. **Feedback** via toasts de exito/error.
8. **Historial** que registra la accion realizada.

> *Hallazgo de la investigacion:* "La regla del pico-final (Kahneman): las personas juzgan una experiencia basandose en el punto de mayor intensidad emocional y el momento final" (seccion 2.4).

**Evaluacion pico-final del flujo principal:**
- **Pico:** El momento de confirmar la convocatoria, con su dialogo de conflictos y checklist de preparacion. Es un buen pico — el usuario siente control y confianza.
- **Final:** Un toast de exito ("Convocatoria enviada") mas la apertura de Outlook. Es funcional pero no memorable. Una animacion de exito, un resumen de lo enviado, o un mensaje de cierre mas elaborado elevarian significativamente la experiencia del momento final.

### 4.2 Los flujos secundarios: sin guia

Las otras 4 pestanas carecen del nivel de guia del flujo principal:

- **Catalogos FUNDAE:** El usuario llega a una pestana con 4 sub-tabs (Acciones, Grupos, Centros, Empresas) sin indicacion de por cual empezar ni por que. No hay onboarding especifico. El boton "Nuevo" esta visible pero el formulario es extenso (15+ campos para una accion formativa) sin indicacion de cuales son obligatorios para el funcionamiento basico.

- **Generar XML:** La pestana pide seleccionar una accion formativa y un grupo, pero no explica la relacion entre ambos ni el flujo de trabajo FUNDAE. Un gestor novato no sabra que el XML de Inicio va despues de comunicar la formacion a FUNDAE. No hay documentacion inline.

- **Calendario:** Es una vista de consulta pasiva. El usuario ve las formaciones en un Gantt pero no puede actuar sobre ellas (no puede convocar, editar ni eliminar desde aqui). El empty state dice "Calendario vacio" con una invitacion a "Ir a Catalogos", pero no explica que el calendario se genera automaticamente desde las fechas del catalogo.

- **Dashboard:** Presenta 15+ secciones sin jerarquia de importancia. No hay sugerencia de cuales son las metricas clave para cada momento del ciclo de gestion. El modo toggle (operativo/estrategico) existe en el HTML pero los modulos no estan claramente categorizados entre uno y otro.

> *Hallazgo de la investigacion:* "La divulgacion progresiva reduce la carga cognitiva un 40%. Mostrar solo lo esencial en la interfaz primaria y revelar complejidad bajo demanda" (hallazgo 9).

**El dashboard es el caso mas critico de ausencia de divulgacion progresiva.** Los 15+ modulos se renderizan todos a la vez. Un sistema de secciones colapsables, o un dashboard personalizable donde el usuario elige que modulos ver, aplicaria este principio directamente.

### 4.3 Descubribilidad de funcionalidades

Funcionalidades valiosas que son dificiles de descubrir:

- **Templates de formaciones recurrentes:** Estan en un dropdown dentro de la seccion de templates del panel izquierdo. El usuario debe saber que existen para buscarlas.
- **Vinculacion automatica al catalogo:** Un checkbox en los datos del evento que silenciosamente conecta la convocatoria con el catalogo. Su importancia es enorme (mantiene la trazabilidad FUNDAE) pero su presencia visual es minima.
- **Calculo de costes salariales:** Un boton "Calc." pequeno junto al campo de costes en la pestana XML. Calcula costes desde los datos del Excel — una funcion muy util pero casi invisible.
- **Asignacion masiva de participantes:** Disponible en la vista lista del catalogo via un boton en la barra de acciones bulk. Requiere seleccionar multiples registros primero.
- **Exportacion del flujo Power Automate:** En Settings, un boton que genera y descarga un ZIP con el flujo PA. Una funcion critica para la configuracion inicial, enterrada en ajustes.

> *Hallazgo de la investigacion:* "Las aplicaciones premium revelan atajos progresivamente: tooltips que muestran el atajo al pasar el cursor sobre un boton, paleta de comandos (Cmd+K)" (seccion 4.4).

### 4.4 Consistencia terminologica

La investigacion advierte:

> *"Si 'Participantes' y 'Asistentes' se usan intercambiablemente, el usuario pierde confianza en la precision de la aplicacion"* (seccion 9.4).

**Hallazgo critico:** La aplicacion usa ambos terminos:

- **"Asistentes"** en: "Selecciona asistentes" (paso 2), "No hay asistentes seleccionados" (toasts del flujo principal), filtros del panel izquierdo.
- **"Participantes"** en: todo el catalogo FUNDAE, la pestana XML, los formularios de accion formativa, "Asignar participantes", "Recurrencia de participantes" (dashboard).
- **"Empleado/Empleados"** en: columna de la tabla principal, placeholder de busqueda ("Buscar empleado..."), campo del calendario, etiqueta de conteo ("de 0 empleados").

La razon tecnica es comprensible: "asistentes" son los seleccionados para UNA convocatoria; "participantes" son los registrados en el catalogo FUNDAE; "empleados" son los registros del organigrama. Pero el usuario no conoce esta distincion. Para el, son la misma persona y la inconsistencia genera confusion.

---

## 5. Posicionamiento Competitivo

### 5.1 Contexto del mercado

Las alternativas para gestion de formacion bonificada FUNDAE en Espana son:

| Solucion | Tipo | Coste | Debilidades |
|----------|------|-------|-------------|
| **Plataformas SaaS especializadas** (Cezanne HR, Bizneo, etc.) | Cloud multi-tenant | Licencia mensual por empleado | Genericas, no optimizadas para el workflow FUNDAE, curva de aprendizaje, dependencia de proveedor |
| **ERP con modulo de formacion** (SAP SuccessFactors, Workday) | Enterprise | Muy alto | Excesivamente complejos para la tarea, tiempo de implementacion largo, requieren consultores |
| **Excel + email manual** | Manual | Cero | No escalable, propenso a errores, sin trazabilidad, sin validacion FUNDAE |
| **convocatoria.html** | Single-file local | Cero | Sin colaboracion, sin persistencia en servidor, sin soporte |

### 5.2 Ventajas competitivas reales

La aplicacion tiene ventajas genuinas que pocas herramientas ofrecen:

1. **Zero-deployment, zero-cost.** Un fichero HTML que funciona abriendo en el navegador. Sin servidores, sin licencias, sin TI. Para un departamento de formacion que no tiene presupuesto de software, esto es transformador.

2. **Workflow FUNDAE nativo.** No es un modulo generico de formacion adaptado a Espana — esta construido desde cero para el flujo FUNDAE (acciones formativas, grupos, XML de comunicacion, costes bonificables, plazos legales).

3. **Integracion Outlook sin servidor.** Los deep links `mailto:` con parametros de calendario son ingeniosos — permiten crear eventos de Outlook sin necesidad de API ni permisos de administrador.

4. **Velocidad.** Todo opera en memoria y localStorage. No hay latencia de red. Esto cumple uno de los hallazgos mas contundentes de la investigacion:

> *"La velocidad percibida ES calidad percibida. Los usuarios asocian velocidad con competencia tecnica y seriedad empresarial"* (hallazgo 3).

5. **Autonomia de datos.** Los datos nunca salen del navegador del usuario (excepto el webhook de encuestas). Para organizaciones con restricciones de datos, esto es una ventaja de compliance.

### 5.3 Debilidades competitivas

1. **Fragilidad del almacenamiento.** `localStorage` puede borrarse al limpiar datos del navegador. Un gestor que pierde meses de historial y catalogos por una limpieza de cache experimenta una quiebra de confianza irrecuperable. No hay backup automatico ni exportacion periodica.

2. **Ausencia de colaboracion.** La investigacion identifica las funciones multi-usuario como senal de madurez (seccion 7.4). La aplicacion es estrictamente monousuario.

3. **Sin soporte movil funcional.** Aunque existe un breakpoint responsive (`@media` para pantallas estrechas), la experiencia en movil es reducida (los tabs se comprimen, el panel izquierdo desaparece). Esto limita la consulta del dashboard en movilidad.

4. **Sin dark mode.** Los 4 referentes premium analizados en la investigacion (Stripe, Linear, Figma, Vercel) ofrecen dark mode. Su ausencia es una senal de que la aplicacion no esta pensada para sesiones largas de trabajo.

### 5.4 Posicionamiento optimo

La aplicacion ocupa un nicho unico: **herramienta especialista de cero friccion para gestores de formacion FUNDAE**. No compite con ERPs (es demasiado simple) ni con Excel (es demasiado sofisticada). Su posicionamiento natural es:

> "La herramienta que un gestor de formacion puede abrir manana mismo, cargar su organigrama, y empezar a enviar convocatorias con trazabilidad FUNDAE — sin pedir nada a TI."

Este posicionamiento es coherente con las funcionalidades core (Convocatoria + Catalogos + XML). Es *incoherente* con los modulos analiticos avanzados del dashboard, que sugieren un producto para directores de RRHH, no para gestores operativos.

---

## 6. Recomendaciones

### 6.1 Coherencia de identidad (impacto alto, esfuerzo bajo)

**R1. Renombrar la aplicacion** a algo que refleje su alcance real. Opciones:

- "Gestor de Formacion FUNDAE"
- "Formaciones — Gestion y seguimiento"
- "Central de Formacion"

El cambio afecta al `<title>`, al header visible, y al framing mental del usuario. Es un cambio de una linea con impacto en toda la experiencia.

**R2. Reescribir el onboarding** para cubrir las 5 pestanas, no solo la convocatoria. Actualmente el onboarding tiene 3 pasos que solo describen el flujo de convocatoria. Anadir una cuarta pantalla que presente las otras capacidades ("Tambien puedes gestionar catalogos FUNDAE, generar XMLs y consultar tu cuadro de mando").

### 6.2 Coherencia funcional (impacto alto, esfuerzo medio)

**R3. Implementar divulgacion progresiva en el dashboard.** Dos opciones viables:

- **Opcion A (minima):** Colapsar por defecto los modulos avanzados (ROI, equidad, interempresarial, riesgo, gestor). Mostrar solo los modulos operativos (KPIs, alertas, plazos, credito, estado, completitud). El usuario expande lo que le interesa.
- **Opcion B (ideal):** Permitir al usuario elegir que modulos ver y en que orden. Persistir la seleccion en `localStorage`. Esto convierte el dashboard de "todo para todos" a "lo que tu necesitas".

> *Aplicacion del hallazgo:* "La divulgacion progresiva reduce la carga cognitiva un 40%" (hallazgo 9). Con 15+ modulos, la carga actual es maxima.

**R4. Hacer el dashboard accionable.** Cada alerta y KPI deberia enlazar a la accion correctiva:

- "3 grupos sin participantes" -> clic abre el catalogo filtrado por esos grupos.
- "Credito consumido al 85%" -> clic abre la vista de credito con detalle por accion.
- "2 formaciones sin confirmacion" -> clic abre la lista de formaciones pendientes.

> *Aplicacion del hallazgo:* "Disenar el dashboard para conectar metricas con acciones" (seccion 5.4).

**R5. Unificar terminologia.** Decidir un unico termino para las personas que asisten a formaciones y usarlo en toda la aplicacion. Sugerencia:

- **"Participantes"** en todo el contexto FUNDAE (catalogo, XML, dashboard, formularios).
- **"Seleccionados"** en el contexto de la convocatoria (en lugar de "asistentes", que puede confundirse con el estado de asistencia real).
- **"Empleados"** solo para referirse al organigrama Excel cargado.

### 6.3 Coherencia del lenguaje de diseno (impacto medio, esfuerzo alto)

**R6. Migrar estilos inline del JS a clases CSS.** Este es un esfuerzo significativo (afecta a miles de lineas de funciones de renderizado), pero es la unica forma de:

- Garantizar que el design system se aplica desde un unico punto de verdad.
- Hacer posible un futuro dark mode.
- Permitir auditorias de consistencia visual inspeccionando solo el CSS.

**Estrategia incremental:** No intentar migrar todo a la vez. Empezar por los componentes que mas se repiten (cards del dashboard, filas de tabla, botones en formularios) y crear clases CSS para cada uno.

**R7. Resolver la ambiguedad de 2 vs. 4 niveles de sombra.** El CLAUDE.md dice "solo 2 niveles" (`--shadow-sm`, `--shadow-lg`), pero existen `--shadow-accent` y `--shadow-accent-hover`. Decidir si son niveles adicionales (y actualizar la documentacion) o si deben eliminarse a favor de usar los 2 niveles existentes con color accent via otro mecanismo (ej: `box-shadow` compuesto).

### 6.4 Coherencia del recorrido del usuario (impacto alto, esfuerzo medio)

**R8. Anadir empty states accionables.** Cada `renderEmptyState()` del dashboard deberia:

1. Explicar *que datos* necesita el modulo.
2. Indicar *donde* se introducen esos datos (con link a la pestana/seccion correspondiente).
3. Si los datos son opcionales, indicar que el modulo es *avanzado* y se puede ignorar.

Ejemplo actual: "Sin datos disponibles."
Ejemplo mejorado: "Este modulo analiza la recurrencia de participantes. Necesita al menos 2 acciones formativas con participantes asignados en el catalogo. [Ir al catalogo]"

> *Aplicacion del hallazgo:* "Un empty state bien disenado es informativo (explica que esta pasando), accionable (indica que hacer) y, idealmente, alentador" (seccion 3.5).

**R9. Invertir en el momento final del flujo principal.** El pico (dialogo de confirmacion) esta bien resuelto; el final (toast + apertura de Outlook) es debil. Sugerencias:

- Mostrar un resumen de lo enviado (nombre del evento, numero de participantes, fecha).
- Anadir una animacion sutil de exito (checkmark animado, no confeti).
- Ofrecer acciones post-envio: "Ver en historial", "Preparar siguiente", "Vincular al catalogo".

> *Aplicacion del hallazgo:* "Las aplicaciones premium invierten desproporcionadamente en el momento pico y en el final" (seccion 2.4, regla pico-final de Kahneman).

**R10. Considerar una paleta de comandos (Cmd+K).** Dada la amplitud de funcionalidades dispersas en 5 pestanas, una paleta de comandos seria el punto de acceso unificado mas efectivo. Permitiria buscar acciones formativas, saltar entre pestanas, aplicar filtros predefinidos, y abrir templates — todo desde el teclado.

> *Aplicacion del hallazgo:* "La paleta de comandos se ha convertido en un patron estandar de aplicaciones premium modernas: Figma, Linear, VS Code, Notion, Vercel" (seccion 4.4).

### 6.5 Resiliencia y confianza (impacto critico, esfuerzo bajo-medio)

**R11. Implementar backup automatico de datos.** La dependencia de `localStorage` sin backup es el mayor riesgo de la aplicacion. Opciones:

- **Minima:** Boton de "Exportar/Importar datos" que serializa todo el estado a un fichero JSON.
- **Media:** Recordatorio periodico ("Hace 7 dias que no exportas tus datos").
- **Ideal:** Export automatico a fichero local (usando la API File System Access cuando este disponible).

### 6.6 Priorizacion

Ordenadas por ratio impacto/esfuerzo:

| Prioridad | Recomendacion | Impacto | Esfuerzo |
|-----------|---------------|---------|----------|
| 1 | R5. Unificar terminologia | Alto | Bajo |
| 2 | R1. Renombrar la aplicacion | Alto | Muy bajo |
| 3 | R8. Empty states accionables | Alto | Bajo-Medio |
| 4 | R3. Divulgacion progresiva en dashboard | Alto | Medio |
| 5 | R11. Backup de datos | Critico | Bajo-Medio |
| 6 | R4. Dashboard accionable | Alto | Medio |
| 7 | R9. Momento final del flujo principal | Medio-Alto | Bajo |
| 8 | R2. Reescribir onboarding | Medio | Bajo |
| 9 | R10. Paleta de comandos | Medio | Medio |
| 10 | R7. Resolver ambiguedad de sombras | Bajo | Muy bajo |
| 11 | R6. Migrar estilos inline a CSS | Medio | Alto |

---

## 7. Conclusion

`convocatoria.html` es una herramienta notable por su ambicion tecnica y su sofisticacion funcional. El design system es disciplinado, el flujo principal es excelente, y la especializacion FUNDAE es una ventaja competitiva real.

Su mayor riesgo no es tecnico sino estrategico: **la aplicacion no sabe si es una herramienta operativa para un gestor o una plataforma analitica para un director de RRHH.** Esta ambiguedad se manifiesta en un dashboard sobredimensionado, una identidad (nombre + onboarding) que solo describe un tercio de sus capacidades, y una terminologia que refleja las capas geologicas de su desarrollo.

La buena noticia es que las correcciones de mayor impacto (R1, R2, R5, R8) son de esfuerzo bajo. La coherencia no se consigue anadiendo funcionalidades — se consigue con las que ya existen.

> *"Las experiencias verdaderamente excepcionales se crean cuando se elimina complejidad manteniendo el nivel de poder y control."* (Investigacion, seccion 9.5)
