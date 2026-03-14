# Spec Consolidado — Gestion Integral de Formacion

**Fecha:** 14 de marzo de 2026
**Tipo:** Spec de implementacion consolidado y reconciliado (revision 2 — alcance ampliado)
**Fuentes:** 3 specs originales + 2 research (UI/UX + flujos RRHH) + 3 revisiones cruzadas
**Archivo objetivo:** `convocatoria.html` (~15.500 lineas, single-file HTML app)

---

## Narrativa del producto

### Nombre del producto

> **FormacionES**

**Justificacion del nombre:**

- **"Formacion"** identifica el dominio: gestion de formacion corporativa.
- **"ES"** en mayusculas funciona como doble sentido deliberado: el plural natural de "formacion" y el codigo de pais de Espana (donde FUNDAE, la RLT y la normativa PRL/LOPD son contexto legal obligatorio).
- No se limita a FUNDAE ni a convocatorias. Tampoco es generico hasta ser vacio.
- Sustituye a "Convocatoria de Formaciones" (describia una funcionalidad, no un producto) y a "Formaciones FUNDAE" (limitaba la identidad a un solo flujo regulatorio).
- Aplicacion practica: `<title>FormacionES</title>`, `.app-header-title` muestra "FormacionES".

### Identidad en una frase

> **"La herramienta de escritorio que permite a las gestoras de formacion cubrir todo el ciclo — desde la deteccion de necesidades hasta el reporting a Direccion, incluyendo el cumplimiento normativo FUNDAE — sin necesitar nada de TI."**

### Desglose

- **Herramienta de escritorio:** No es un SaaS ni una plataforma departamental. Es un fichero HTML que funciona abriendo en el navegador. Sin servidores, sin licencias, sin TI.
- **Gestoras de formacion:** La usuaria principal es Laura, 38 anos, responsable de formacion en un grupo empresarial con 4-6 sociedades y 500-2.000 empleados. No es directora de RRHH ni desarrolladora.
- **Todo el ciclo de formacion:** No solo el ciclo FUNDAE. Cubre el ciclo completo de gestion de formacion corporativa: deteccion de necesidades, planificacion, sourcing, logistica, convocatoria, ejecucion, evaluacion, compliance y reporting. FUNDAE es un flujo regulatorio critico dentro de ese ciclo, no el unico.
- **Cumplimiento normativo:** FUNDAE (formacion bonificada), comunicacion a la RLT, formacion obligatoria (PRL, LOPD, acoso), documentacion para inspeccion — el departamento de formacion tiene obligaciones legales que la herramienta cubre de forma nativa.
- **Sin necesitar nada de TI:** Zero-deployment, zero-cost, datos en localStorage. La autonomia es la ventaja competitiva principal.

### Lo que la herramienta NO es

- No es un LMS (Learning Management System) — no entrega contenido e-learning ni gestiona cursos online.
- No es un sistema de gestion de talento integral (evaluaciones de desempeno, planes de carrera, sucesion).
- No es una herramienta colaborativa multi-usuario.
- No es un ERP de RRHH — cubre el area de formacion, no nomina, seleccion ni administracion de personal.

### Lo que la herramienta SI es (vision completa)

La herramienta cubre las 7 fases del ciclo de gestion de formacion corporativa:

| Fase del ciclo L&D | Cobertura actual | Cobertura objetivo (post-overhaul) |
|---------------------|-----------------|-------------------------------------|
| 1. Deteccion de necesidades (TNA) | Nula | Basica — mini-TNA con formulario importable |
| 2. Planificacion y presupuesto | Baja | Media-Alta — plan anual, simulacion de credito |
| 3. Diseno y sourcing | Media-Baja | Media — catalogo de proveedores con evaluacion |
| 4. Logistica y convocatoria | **Alta** (core existente) | **Muy alta** — lotes, recordatorios, listas de espera |
| 5. Ejecucion y seguimiento | Media | Alta — asistencia, certificados, semaforo FUNDAE |
| 6. Evaluacion | Media-Baja | Media — Kirkpatrick L1-L2 integrado con encuestas |
| 7. Reporting y compliance | Media | **Muy alta** — RLT, inspeccion, informe Direccion, compliance training |

Ademas, cubre los flujos especificos de Espana:
- **Ciclo FUNDAE completo** (comunicacion inicio/fin, XML, bonificacion, credito)
- **Comunicacion a la RLT** (generacion de documento, plazos, estados)
- **Formacion obligatoria** con tracking de caducidades (PRL, LOPD, acoso, canal de denuncias)
- **Documentacion para inspeccion** (dossier con checklist de evidencias)

### Publico objetivo

Laura evalua la app cada dia por una sola pregunta: "¿Hoy he podido hacer mi trabajo mas rapido y con menos miedo a equivocarme?" Sus tres ejes vitales son:

1. **Velocidad operativa** — Cuantas convocatorias puede preparar antes de la reunion de las 12.
2. **Seguridad ante errores** — ¿Estoy segura de que no me dejo nada? (plazos FUNDAE, datos incompletos, formaciones obligatorias caducadas, documentacion para inspeccion).
3. **Reduccion de tareas repetitivas** — No quiero copiar la misma informacion en tres sitios, ni preparar manualmente el informe para Direccion, ni calcular el credito FUNDAE en un Excel aparte.

Cualquier propuesta que no conecte directamente con uno de estos tres ejes es, para Laura, ruido.

### Publicos secundarios

La vision amplia introduce dos publicos adicionales que consumen outputs de la herramienta:

- **Director/a de RRHH:** Recibe el informe de ejecucion del plan, el estado de compliance, y la prevision de credito FUNDAE. No usa la herramienta directamente — recibe informes generados por Laura.
- **Representacion Legal de los Trabajadores (RLT):** Recibe las comunicaciones de acciones formativas y el balance anual. No usa la herramienta — recibe documentos generados automaticamente.

---

## Glosario vinculante

Estos son los terminos que se usaran en la interfaz, el codigo y la documentacion. La inconsistencia terminologica es la fractura de identidad mas visible; este glosario la resuelve.

| Concepto | Termino en la UI | NO usar | Razon |
|----------|-----------------|---------|-------|
| La aplicacion | **FormacionES** | "Convocatoria de Formaciones", "Formaciones FUNDAE" | Nombre decidido; refleja alcance completo |
| Persona del organigrama Excel | **Empleado/a** | "Trabajador/a" | Es el termino del campo Excel |
| Empleado/a seleccionado/a para una convocatoria | **Destinatario/a** | "Asistente" en contexto de envio | "Asistente" confunde con "asistio"; "Participante" es FUNDAE |
| Empleado/a registrado/a en accion FUNDAE | **Participante** | "Asistente" en contexto FUNDAE | Es el termino oficial FUNDAE. Solo en catalogos, XML y dashboard. |
| Acto de enviar invitaciones | **Convocar** / **Convocatoria** | — | Se mantiene el verbo del dominio. |
| Email que recibe el empleado | **Invitacion** | "Convocatoria" cuando se refiere al email | Distingue el email del acto de convocar. |
| Registro del catalogo | **Accion formativa** | "Formacion" (cuando hay ambiguedad), "Curso" | Termino oficial FUNDAE. |
| Evento con fecha y hora | **Sesion** | "Evento" (cuando hay ambiguedad) | Distingue la sesion puntual de la accion formativa completa. |
| Datos del organigrama | **Censo** / **Organigrama** | "Datos", "Excel" (cuando se refiere al contenido) | "Datos" es demasiado generico. |
| Proveedor de formacion | **Proveedor** | "Empresa formadora" | Consistencia. |
| Persona que imparte la formacion | **Formador/a** | "Tutor/a" en la UI general | FUNDAE usa "tutor/a", pero la UI puede ser mas natural. Mantener "tutor/a" solo en contexto XML. |
| Formacion obligatoria por ley | **Formacion de compliance** | "Formacion legal", "Formacion regulatoria" | Termino establecido internacionalmente |
| Representacion Legal de los Trabajadores | **RLT** | "Sindicatos", "Comite de empresa" | Termino legal correcto, cubre todas las formas de representacion |
| Vencimiento de una formacion obligatoria | **Caducidad** | "Expiracion", "Vencimiento" | Termino natural en espanol para este contexto |
| Conjunto de documentos para la ITSS | **Dossier de inspeccion** | "Expediente", "Carpeta" | Distingue claramente la funcion |
| Informe periodico para Direccion | **Informe de ejecucion** | "Report", "Dashboard export" | Termino que Laura usa naturalmente |
| Plan anual aprobado por Direccion | **Plan de formacion** | "Roadmap", "Planificacion" | Termino de RRHH establecido |

**Regla de transicion semantica:** Un empleado se convierte en destinatario al seleccionarlo para una convocatoria. Se convierte en participante al registrarlo en una accion formativa del catalogo FUNDAE. Esta transicion refleja la transicion funcional real: Convocatoria -> Catalogo.

---

## Fases de implementacion

### Fase 0: Infraestructura de coherencia

**Objetivo:** Crear las condiciones tecnicas y terminologicas para que todas las mejoras posteriores sean coherentes y mantenibles. Ningun cambio visible para Laura excepto el nombre y la terminologia.

**Duracion estimada:** 2-3 dias

---

#### F0.1 — Migracion parcial de estilos inline a clases CSS

**Que:** Migrar los estilos inline del JavaScript a clases CSS SOLO para los componentes que se van a tocar en Fases 1-3: toasts, dialogos, empty states, panel de calidad de datos, skeletons, cola.

**Por que:** Es el prerequisito tecnico para que cualquier mejora visual sea consistente y mantenible. Sin esto, cada mejora visual es deuda tecnica nueva. No es una propuesta de valor para Laura — es infraestructura.

**Como:** Buscar `style="` en las funciones de renderizado de los componentes afectados. Extraer a clases CSS en el bloque `<style>`. Verificar que la apariencia no cambia. No tocar los estilos inline del dashboard avanzado ni del calendario (se hara cuando se toquen esos modulos).

**Fase:** 0.
**Esfuerzo:** Medio (4-6h, busqueda sistematica).
**Impacto:** Nulo para Laura — alto para la mantenibilidad de todo lo que sigue.

---

#### F0.2 — Unificar terminologia en la interfaz

**Que:** Aplicar el glosario vinculante en toda la UI: sustituir "asistentes" por "destinatarios" en el flujo de convocatoria, "trabajadores" por "empleados", etc. Actualizar tooltips, labels, mensajes de toast, textos de ayuda.

**Por que:** La terminologia inconsistente dice "esto lo hicieron personas distintas que no se hablan". La consistencia terminologica es la fractura de identidad mas visible y la mas facil de cerrar.

**Fase:** 0.
**Esfuerzo:** Bajo (2-3h, busqueda sistematica).
**Impacto:** Alto — transversal en toda la app.

---

#### F0.3 — Resolver ambiguedad de sombras (2 vs. 4 niveles)

**Que:** Redefinir la documentacion: 2 niveles de elevacion (`--shadow-sm`, `--shadow-lg`) + 1 variante de color accent aplicada al nivel `sm` (para botones primarios). Ajustar `--shadow-accent` a opacidad 0.2 (de 0.3 actual).

**Por que:** El CLAUDE.md dice "solo 2 niveles de sombra" pero existen `--shadow-accent` y `--shadow-accent-hover`. Tres documentos lo senalan como ambiguedad. La resolucion: las sombras accent no son un "nivel" de elevacion adicional, sino una variante cromatica aplicada al mismo nivel.

**Como:** Actualizar CLAUDE.md con la definicion aclarada. Ajustar `--shadow-accent: 0 1px 3px rgba(79,70,229,0.2)` en `:root` (linea ~38). Mantener `--shadow-accent-hover` tal como esta.

**Fase:** 0.
**Esfuerzo:** Muy bajo (30 min).
**Impacto:** Bajo — pero elimina una ambiguedad que genera confusion en cada mejora visual.

---

#### F0.4 — Renombrar la aplicacion

**Que:** Cambiar "Convocatoria de Formaciones" por "FormacionES" en `<title>` (linea 6), `.app-header-title` y cualquier referencia visible.

**Por que:** El nombre actual describe una funcionalidad (convocar), no un producto. El nuevo nombre refleja el alcance completo (gestion integral de formacion) sin limitarse a FUNDAE. Con la vision amplia que cubre las 7 fases del ciclo L&D, un nombre que solo diga "convocatoria" o "FUNDAE" subestima la herramienta.

**Como:** Buscar y reemplazar el nombre en todo el HTML. Actualizar el `<title>` y el texto del header.

**Fase:** 0.
**Esfuerzo:** Muy bajo (15 min).
**Impacto:** Medio — alinea la identidad con la vision amplia del producto.

---

### Fase 1: Quick wins funcionales

**Objetivo:** Mejoras de bajo esfuerzo y alto impacto que Laura nota inmediatamente. Se priorizan las propuestas que eliminan blockers, reducen repeticion, y dan seguridad.

**Duracion estimada:** 3-4 dias

---

#### F1.1 — Busqueda flexible de hoja en Excel

**Que:** Al cargar un Excel, si no se encuentra la hoja "ORGANIGRAMA", hacer match case-insensitive y si hay una unica hoja, usarla directamente. Si hay multiples, mostrar dialogo de seleccion.

**Por que:** El error "hoja no encontrada" es la peor primera impresion posible. Si RRHH cambia el nombre de la hoja, Laura se queda completamente bloqueada. Es un pain point de severidad alta con solucion trivial.

**Como:** En la funcion de parseo del Excel, antes de buscar exactamente "ORGANIGRAMA", obtener `workbook.SheetNames`, hacer match case-insensitive, y si hay una unica hoja, usarla directamente. Si hay multiples, mostrar un dialogo de seleccion.

**Fase:** 1.
**Esfuerzo:** Bajo (1h).
**Impacto:** Alto — elimina el blocker mas critico del primer contacto.

---

#### F1.2 — Duplicar accion formativa

**Que:** Boton "Duplicar" en la ficha de una accion del catalogo que crea una copia con todos los datos excepto participantes, fechas y estado.

**Por que:** Laura gestiona formaciones recurrentes (PRL, compliance) que se repiten con variaciones minimas. Crear desde cero cada vez es un desperdicio de 5-10 minutos por accion.

**Como:** Copiar el objeto de la accion en el catalogo, limpiar campos de estado/fechas/participantes, asignar nuevo ID, abrir la ficha del duplicado para edicion.

**Fase:** 1.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Alto — para 30+ acciones anuales similares, el ahorro acumulado es de horas.

---

#### F1.3 — Alertas proactivas al abrir la app

**Que:** Al abrir la app, si hay plazos FUNDAE en las proximas 48h o formaciones obligatorias proximas a caducar, mostrar un banner sticky no-bloqueante con los plazos pendientes. Laura puede cerrarlo con un click.

**Por que:** Laura no abre el dashboard cada dia. Las alertas deben ir a ella, no esperar a que ella las busque. Previene incumplimiento de plazos FUNDAE (potencial sancion) y caducidades de formacion obligatoria.

**Como:** Al arrancar la app, verificar `state.alertas` y plazos del catalogo. Si hay alertas pendientes, mostrar banner con lista compacta. Cerrable con X, con checkbox "No volver a mostrar hoy".

**Fase:** 1.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Alto — previene incumplimientos legales.

---

#### F1.4 — Toasts con icono, progreso, undo y aria-live

**Que:** Redisenar los toasts con: icono por tipo (check verde, warning amarillo, error rojo, info azul), barra de progreso visible que indica el tiempo restante, boton "Deshacer" cuando la accion sea reversible, y `aria-live="polite"` en el contenedor.

**Por que:** Cada operacion de la app pasa por toasts. Mejorarlos mejora TODO. La adicion de `aria-live` alinea con WCAG 2.2. El boton "Deshacer" es un safety net que reduce la ansiedad de Laura.

**Como:** Redisenar `.toast` con layout de grid (icono | texto | accion). Barra de progreso con `transition: width Xs linear` donde X es la duracion del toast. Anadir `role="status" aria-live="polite"` al contenedor `#toastContainer`.

**Fase:** 1.
**Esfuerzo:** Bajo (2-3h).
**Impacto:** Alto — cada operacion de la app pasa por toasts.

---

#### F1.5 — Animacion de exito en upload-zone

**Que:** Al cargar un archivo exitosamente, aplicar un "pulso de exito" CSS (scale breve + ring que se expande y desvanece). El icono de check se "dibuja" con animacion `stroke-dasharray`/`stroke-dashoffset`.

**Por que:** La carga del Excel es el primer momento significativo de la experiencia. Un pulso de exito transforma un evento funcional en un momento memorable.

**Como:** Animacion CSS `@keyframes uploadSuccess` con `scale(1.02)` + `box-shadow` ring. Animacion SVG draw para el check.

**Fase:** 1.
**Esfuerzo:** Bajo (1h).
**Impacto:** Alto — primer momento de interaccion significativa.

---

#### F1.6 — Validacion on-blur en datos del evento

**Que:** Al salir de un campo obligatorio vacio (titulo, fecha, hora inicio, hora fin), mostrar un indicador sutil: borde `var(--warning)` con texto "Campo obligatorio" en `font-size: 11px; color: var(--text-muted)`. Al rellenarlo, el indicador desaparece con transicion.

**Por que:** La validacion actual solo ocurre al intentar enviar. Laura descubre que falta la fecha cuando ya ha intentado enviar y recibe un toast generico. La validacion on-blur es prevencion, no castigo. Es el patron preferido en 2025-2026.

**Como:** Anadir event listeners `blur` a los campos obligatorios. Si esta vacio al perder foco, aplicar `.input-field.incomplete` (borde `--warning`) y anadir `<span class="field-hint">Campo obligatorio</span>` debajo. Usar `--warning` para campos vacios (incompletos), reservar `--danger` para valores invalidos (hora fin < hora inicio).

**Fase:** 1.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Medio — reduce intentos fallidos de envio.

---

#### F1.7 — Indicador de guardado y estado de sesion

**Que:** Tres micro-mejoras: (1) Texto discreto en el pie del panel izquierdo: "Guardado hace 2 min" que parpadea brevemente al guardar. (2) Al abrir la app con cola no vacia, banner: "Tienes N convocatorias en cola del dia X. [Continuar] [Empezar de nuevo]". (3) Icono discreto junto al nombre del fichero cargado indicando "datos guardados".

**Por que:** El autoguardado ya funciona, pero Laura no sabe que funciona. La ansiedad de "¿se habra guardado?" es real y no tiene coste tecnico resolver.

**Como:** Tras cada `saveState()`, actualizar un timestamp visible en el panel izquierdo. Al abrir la app, verificar si hay cola pendiente y mostrar banner sticky.

**Fase:** 1.
**Esfuerzo:** Bajo (2h).
**Impacto:** Medio-alto — reduce ansiedad y confusion al retomar trabajo.

---

#### F1.8 — Auto-relleno de datos del grupo XML

**Que:** Guardar los datos del grupo mas recientes (responsable, telefono, ID grupo) y ofrecerlos como default al generar XML de la misma empresa/accion.

**Por que:** Laura escribe los mismos datos cada vez que genera un XML. Es repeticion innecesaria.

**Como:** Guardar en localStorage por CIF de empresa pagadora. Al abrir la pestana XML y seleccionar una accion, precargar los datos del grupo anteriores.

**Fase:** 1.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Medio — elimina repeticion cada vez que genera XML.

---

#### F1.9 — Credito FUNDAE con simulacion y alertas

**Que:** Ampliar el modulo de credito existente del dashboard con: (1) simulador que calcula el impacto de acciones planificadas, (2) alerta de infrautilizacion a partir de septiembre (credito consumido < 50%), (3) alerta de sobreconsumo, (4) proyeccion temporal con linea de tendencia.

**Por que:** Perder credito FUNDAE por infrautilizacion es un error comun y costoso. Exceder el credito tambien es problematico. Tener visibilidad predictiva (no solo retrospectiva) transforma la gestion del credito.

**Como:** Ampliar el modulo de credito del dashboard. El simulador suma costes de acciones seleccionadas. Las alertas son logica de umbrales. El grafico reutiliza la estructura de sparklines existente.

**Fase:** 1.
**Esfuerzo:** Bajo (3-4h).
**Impacto:** Alto — previene perdida de credito FUNDAE.

---

### Fase 2: Core UX premium + compliance

**Objetivo:** Mejoras sustanciales del flujo principal que transforman la experiencia de enviar convocatorias y gestionar el ciclo formativo. Cada propuesta requiere esfuerzo medio pero resuelve pain points criticos. Se integran las primeras propuestas de compliance que refuerzan la vision amplia.

**Duracion estimada:** 7-10 dias

---

#### F2.1 — Panel persistente de calidad de datos con edicion in situ

**Que:** Al cargar el Excel, mostrar un panel colapsable (no toasts efimeros) con todos los problemas detectados: emails invalidos, NIFs duplicados, empleados sin email. Cada problema es clickable y abre un mini-editor inline para corregir el dato. Las correcciones se aplican a los datos en memoria y se persisten en localStorage.

**Por que:** Laura pierde informacion critica porque los toasts desaparecen en 4-6 segundos. El panel transforma la incertidumbre en confianza. La edicion in situ elimina el bucle frustrante Excel -> corregir -> recargar -> perder filtros.

**Como:**
- Al completar el parseo del Excel, recopilar problemas de calidad y almacenarlos en un array `state.dataQualityIssues`.
- Renderizar panel lateral colapsable (reutilizar estructura de `dash-alerts-widget`) con problemas agrupados por tipo.
- Cada item del panel abre mini-editor inline: campo editable, boton guardar, boton cancelar.
- Correcciones se almacenan en `convocatoria_corrections` (localStorage), indexadas por NIF. Al recargar Excel, se intentan reaplicar.

**Fase:** 2.
**Esfuerzo:** Medio-alto (5-6h).
**Impacto:** Muy alto — elimina el bucle de recarga mas frustrante.

---

#### F2.2 — Semaforo de readiness FUNDAE con data storytelling

**Que:** Indicador visual rojo/amarillo/verde de "readiness para FUNDAE" en la ficha de cada accion formativa Y como panel superior persistente en la pestana de generacion XML. Con texto narrativo generado: "Faltan 3 datos para generar el XML: NSS de 2 participantes y el telefono del responsable. [Completar datos]".

**Por que:** El peak negativo mas intenso del mapa emocional de Laura es descubrir datos incompletos al final, despues de 10 minutos de configuracion. Este semaforo invierte el flujo: muestra el estado ANTES de intentar generar. El data storytelling lo hace accionable en vez de solo informativo.

**Como:**
- Ampliar `checkFundaeReadiness()` para generar un resumen narrativo.
- En la ficha de accion formativa, mostrar el semaforo como chip junto al titulo.
- En la pestana XML, al seleccionar una accion, ejecutar la validacion completa y mostrar panel de readiness en la parte superior que se actualiza en tiempo real.
- Cada item del panel enlaza directamente al campo que falta (scroll + focus).
- Rojo = bloqueante, amarillo = aviso, verde = listo para generar.

**Fase:** 2.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Muy alto — elimina 15+ minutos de frustracion por cada generacion fallida.

---

#### F2.3 — Dialogo de preview + confirmacion fusionado

**Que:** Transformar el dialogo de confirmacion actual en un dialogo de preview+confirmacion de dos secciones. Arriba: preview del email (titulo, fecha, ubicacion, lista de destinatarios truncada). Abajo: avisos (conflictos, FUNDAE, encuesta). Tratamiento visual premium: entrada con `scale(0.9->1)`, `backdrop-filter: blur(8px)`, borde superior de 3px en `--accent`.

**Por que:** Dos propuestas separadas (rediseno de dialogo + vista previa) se fusionan para evitar que Laura vea la misma informacion dos veces. Confirmar la convocatoria ES el pico de la experiencia (regla pico-final). Resuelve el miedo a errores: Laura ve exactamente que se va a enviar antes de confirmar.

**Como:**
- Reestructurar `#confirmDialog` con dos secciones: `.confirm-preview` y `.confirm-alerts`.
- La preview incluye: titulo del evento en negrita, fecha formateada, icono de tipo (Teams/Presencial), conteo de destinatarios como chip `.dash-kpi-value`, tabla truncada de primeros 5 destinatarios con "y N mas".
- Los avisos se muestran como cards con icono (warning/info), no como HTML inline.
- Boton "Enviar" con estado de carga (spinner 300ms antes de cerrar).
- Post-confirmacion: mini-dialogo de resumen accionable (ver F2.5).

**Fase:** 2.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Muy alto — define la memoria de la experiencia.

---

#### F2.4 — Barra de progreso en cola con tracking de items

**Que:** Anadir barra de progreso encima de `#queueBar` que se llena proporcionalmente + texto "Procesando 3 de 5..." + marcar cada item de la cola con check/X a medida que se procesa.

**Por que:** La cola es el flujo mas largo. Sin progreso visual, cada paso se siente aislado. Con barra de progreso Y tracking de items, Laura sabe exactamente que se envio y que no, incluso si un pop-up se bloquea.

**Como:**
- Anadir `<div class="queue-progress">` con `<div class="queue-progress-fill">` cuyo `width` se actualiza en `launchNext()`.
- Actualizar texto "Procesando X de Y" con cada iteracion.
- En `#queueList`, al procesar un item, anadir clase `.queue-item-done` (check verde + opacidad reducida) o `.queue-item-failed` (X roja).
- Barra con `transition: width 0.3s ease-out`.

**Fase:** 2.
**Esfuerzo:** Medio (3h).
**Impacto:** Alto — transforma el momento de mayor ansiedad en un proceso controlable.

---

#### F2.5 — Resumen post-envio accionable

**Que:** Reemplazar el toast de exito post-envio por un mini-dialogo de resumen con: datos clave de lo enviado, plazos FUNDAE asociados, encuesta programada (si aplica), y boton "Siguiente convocatoria" que limpia datos del evento pero mantiene filtros.

**Por que:** Laura termina su flujo con un toast de 6 segundos. No tiene certeza de que todo salio bien ni conexion con el siguiente paso. Laura necesita informacion de cierre, no animacion. El resumen transforma "alivio" en "control".

**Como:**
- Tras el envio exitoso (apertura de Outlook o completacion de cola), mostrar dialogo con:
  - "Convocatoria 'PRL Oficinas Madrid' enviada a 24 destinatarios."
  - "Encuesta programada para el 20/3 a las 17:00." (si aplica)
  - "Plazo FUNDAE: comunica inicio antes del 18/3." (con link al generador XML)
  - Boton "Preparar siguiente" y boton "Cerrar".
- Check animado sutil (SVG draw) como icono del dialogo. Sin confetti.

**Fase:** 2.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — cierra el ciclo emocional del flujo principal.

---

#### F2.6 — Errores contextuales en formulario de evento

**Que:** Cuando un campo obligatorio esta vacio al intentar enviar, aplicar `.input-field.error` directamente al campo, anadir label de error debajo, y hacer scroll al primer campo con error.

**Por que:** Los errores fuera de contexto (toast generico arriba) son un anti-patron documentado. Laura no deberia tener que buscar cual campo falta. Complementa la validacion on-blur de F1.6: on-blur previene, errores contextuales corrigen al intentar enviar.

**Como:**
- En `validateEvent()`, en vez de solo `showToast()`, iterar sobre campos obligatorios vacios y aplicar `.input-field.error` + `<span class="field-error">`.
- `scrollIntoView({ behavior: 'smooth', block: 'center' })` al primer campo con error.
- Mantener toast como resumen ("Completa los campos obligatorios"), pero la guia detallada esta en los campos.

**Fase:** 2.
**Esfuerzo:** Medio (2-3h).
**Impacto:** Alto — reduce frustracion en el flujo critico de envio.

---

#### F2.7 — Diagnostico accionable de errores de Excel

**Que:** Clasificar errores de carga del Excel en categorias (formato incorrecto, archivo vacio, columnas parciales) con mensajes especificos y accionables. Usar dialogo (no toast) para errores criticos.

**Por que:** El parseo del Excel es el punto de fallo mas probable. Un mensaje que ayuda a Laura a corregir su archivo es la diferencia entre "esta app no funciona" y "mi archivo necesita ajustes".

**Como:**
- En la logica de parseo, detectar tipo de error y mostrar dialogo con:
  - Titulo especifico ("Formato incorrecto", "Archivo vacio", "Columnas parciales").
  - Descripcion clara de que esperaba la app.
  - Boton "Ver columnas esperadas" que muestre la lista completa.
  - Para columnas parciales: "Se encontraron N de M columnas. Faltan: [lista]. Los datos se cargaran parcialmente."

**Fase:** 2.
**Esfuerzo:** Medio (2-3h).
**Impacto:** Alto — impacta directamente en la primera impresion.

---

#### F2.8 — Skeleton screen para tabla de destinatarios

**Que:** Al iniciar la carga del Excel, mostrar skeleton (8-10 filas) que replique la estructura de la tabla con animacion `shimmer` existente.

**Por que:** El dashboard ya tiene skeletons. La tabla no. Es una incoherencia interna. Los skeleton screens reducen la percepcion de espera un 30% frente a spinners.

**Como:** Reutilizar la animacion `shimmer` existente (`.dash-skeleton`). Crear `.table-skeleton` con filas de `skeleton-cell` de anchos proporcionales a las columnas reales. Mostrar al iniciar carga, ocultar al completar parseo.

**Fase:** 2.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Alto — especialmente con Excels grandes (>1000 filas).

---

#### F2.9 — Modo compacto para formulario de acciones formativas

**Que:** Reorganizar el formulario de acciones formativas con `<details>` colapsables por grupos: "Datos basicos" (titulo, tipo, modalidad, fechas, estado — siempre visible), "Participantes y sesiones" (tabla, asistencia — expandible), "Datos FUNDAE" (area profesional, nivel, grupo, tutor, centro — colapsado por defecto). Mini-semaforo en el header de cada grupo indicando si hay campos vacios requeridos.

**Por que:** El formulario tiene 20+ campos. Laura se pierde entre lo operativo y lo administrativo. La divulgacion progresiva reduce la carga cognitiva un 40%. Es un pain point diario, no esporadico.

**Como:**
- Envolver secciones del formulario en `<details>` con `<summary>` estilizado.
- "Datos basicos" tiene `open` por defecto.
- "Datos FUNDAE" colapsado por defecto; abierto automaticamente al acceder desde pestana XML.
- Semaforo en cada `<summary>`: punto verde/amarillo/rojo segun completitud de campos internos.

**Fase:** 2.
**Esfuerzo:** Medio (3h).
**Impacto:** Medio-alto — reduce sobrecarga cognitiva en cada interaccion con el catalogo.

---

#### F2.10 — Tracking de formacion obligatoria con caducidades

**Que:** Nueva seccion en el catalogo o sub-pestana "Formacion obligatoria" con: (1) definicion de tipos (PRL general, PRL puesto, LOPD, acoso, canal de denuncias, etc.) con periodicidad, (2) al cargar organigrama, marcar que formaciones aplican a cada puesto/departamento, (3) registrar ultima fecha de formacion por empleado, (4) semaforo de caducidad (verde/amarillo/rojo), (5) vista de gaps de compliance filtrable, (6) boton "Crear convocatoria" que pre-selecciona los empleados afectados.

**Por que:** La formacion obligatoria representa el 30-50% de las acciones formativas del departamento. Un incumplimiento en PRL puede suponer sanciones graves. Laura mantiene hoy un Excel separado con caducidades, sin conexion con el organigrama ni con el calendario. Ninguna herramienta FUNDAE del mercado integra este tracking con el organigrama.

**Como:** Nuevo modelo de datos en localStorage (tipos de formacion obligatoria + registros por empleado). La UI reutiliza la estructura del catalogo con una sub-pestana adicional. El semaforo de caducidad es logica de fechas sencilla. El boton "Crear convocatoria" pre-aplica filtros y selecciona los empleados con formacion caducada o pendiente.

**Fase:** 2.
**Esfuerzo:** Medio-alto (8-10h).
**Impacto:** Muy alto — la formacion obligatoria es responsabilidad legal del empresario. Posiciona la herramienta como imprescindible para compliance.

---

#### F2.11 — Gestion de la comunicacion a la RLT

**Que:** Nuevo flujo "Comunicacion RLT" accesible desde el catalogo de acciones formativas: (1) seleccionar acciones, (2) generar automaticamente el documento de comunicacion con todos los datos requeridos por ley, (3) registrar fecha de envio y fecha limite de respuesta (envio + 15 dias habiles), (4) estados (Pendiente/Enviada/Plazo abierto/Sin objeciones/Con discrepancias), (5) alerta en dashboard y al abrir la app.

**Por que:** La comunicacion a la RLT es obligatoria si la empresa tiene representacion legal de los trabajadores. Su ausencia puede invalidar la bonificacion. Laura prepara hoy estos documentos manualmente en Word y controla los plazos mentalmente. Si gestiona 40+ acciones anuales, el volumen es significativo.

**Como:** Los datos necesarios ya estan en el catalogo. Generar el documento es formatear HTML. El calculo de dias habiles ya existe para los plazos FUNDAE. Persiste en localStorage como un campo mas de la accion formativa.

**Fase:** 2.
**Esfuerzo:** Medio (5-6h).
**Impacto:** Alto — elimina un proceso manual con consecuencias legales.

---

### Fase 3: Diferenciadores premium + reporting

**Objetivo:** Features que elevan la percepcion de calidad de la app, extienden la coherencia a todas las pestanas, y anadir capacidades de reporting que generan valor para Direccion y la RLT. Solo se implementan despues de que el core (Fases 0-2) este solido.

**Duracion estimada:** 10-14 dias

---

#### F3.1 — Paleta de comandos Cmd+K

**Que:** Command palette con `Cmd+K` / `Ctrl+K`. Input de busqueda grande, lista de resultados con fuzzy search, categorias de comandos, navegacion con flechas, atajos visibles.

**Por que:** La app tiene 5 pestanas con funcionalidades dispersas — y con la vision amplia, crece la superficie funcional. Cmd+K es el punto de acceso unificado que resuelve el problema de descubribilidad. Es Fase 3 porque Laura no usa atajos de teclado: es un diferenciador premium, no un pain point.

**Como:**
- Nuevo componente overlay `.cmdk-overlay` + `.cmdk-box`.
- Listener global `keydown` para `Cmd+K`.
- Fuzzy search simple sin dependencias.
- Categorias: Navegacion, Datos, Filtros, Convocatoria, Herramientas, Catalogos, Compliance.
- Acciones contextuales: si hay datos cargados, "Buscar empleado: [nombre]"; si hay catalogo, "Ir a accion: [nombre]"; si hay compliance gaps, "Ver gaps de formacion obligatoria".

**Fase:** 3.
**Esfuerzo:** Alto (6-8h).
**Impacto:** Alto — hub central de navegacion.

---

#### F3.2 — Atajos de teclado globales

**Que:** Conjunto reducido de atajos que no intercepten atajos nativos del navegador.

**Atajos definitivos:**

| Atajo | Accion | Contexto |
|-------|--------|----------|
| `Cmd+K` | Abrir paleta de comandos | Global |
| `Cmd+Enter` | Enviar (abrir en Outlook) | Tab Convocatoria, con datos |
| `Cmd+Shift+Enter` | Anadir a cola | Tab Convocatoria, con datos |
| `Cmd+1..5` | Navegar a pestana 1-5 | Global |
| `Cmd+Shift+H` | Abrir historial | Global |
| `Cmd+,` | Abrir ajustes | Global |
| `Escape` | Cerrar dialogo / paleta / panel | Global (ya existe parcialmente) |

**NO se interceptan:** `Cmd+F` (buscar en pagina), `Cmd+A` (seleccionar todo), `Cmd+S` (guardar). Estos son atajos nativos del navegador.

**Revelacion progresiva:** Tooltips con atajos al hacer hover con delay 800ms. En la paleta de comandos, cada accion muestra su atajo. No mostrar tooltips de atajos hasta que el usuario ha interactuado con la app al menos 3 veces.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — transforma la percepcion de herramienta profesional.

---

#### F3.3 — Empty states contextuales unificados (todas las pestanas)

**Que:** Sistema unificado de componentes `.empty-state` con variantes por tipo y pestana. Cubre tabla de destinatarios, cola, historial, cada modulo del dashboard, calendario, y catalogos.

**Variantes para la tabla de destinatarios (simplificado):**
- **Sin datos cargados:** Icono upload, "Carga tu censo de empleados", CTA "Cargar Excel".
- **Sin resultados de filtro:** Icono lupa, "Sin resultados", CTA "Limpiar filtros".

**Variantes para dashboard (critico):** Cada `renderEmptyState()` explica: (1) que datos necesita el modulo, (2) donde se introducen, (3) si el modulo es avanzado y se puede ignorar.

**Variante para cola:** Icono bandeja vacia, "Cola vacia", subtitulo explicativo.

**Variante para historial:** Icono reloj, "Sin historial", subtitulo "Las convocatorias que envies se registraran aqui".

**Variante para calendario:** Icono calendario, "Calendario vacio", subtitulo "Las acciones formativas con fechas aparecen aqui automaticamente. [Ir a Catalogos]".

**Variante para formacion obligatoria:** Icono escudo, "Sin formaciones obligatorias definidas", subtitulo "Define los tipos de formacion obligatoria que aplican a tu empresa. [Configurar]".

**Fase:** 3.
**Esfuerzo:** Medio (4-5h — muchas variantes pero patron reutilizable).
**Impacto:** Alto — consistencia transversal de producto.

---

#### F3.4 — Divulgacion progresiva en dashboard

**Que:** Los modulos avanzados del dashboard (ROI, equidad, interempresarial, riesgo, gestor, formacion cruzada) se colapsan por defecto. Solo se muestran los modulos operativos (KPIs, alertas, plazos FUNDAE, credito, estado, completitud, compliance). El usuario expande lo que le interesa. La seleccion se persiste en localStorage.

**Por que:** Con 15+ modulos, la carga cognitiva es maxima. Laura no consulta ROI ni indice Gini — consulta alertas, plazos y estado de compliance.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — resuelve el problema de feature bloat mas visible.

---

#### F3.5 — Dashboard accionable

**Que:** Cada alerta y KPI del dashboard enlaza a la accion correctiva. "3 grupos sin participantes" -> abre catalogo filtrado. "5 formaciones obligatorias caducadas" -> abre vista de gaps de compliance. "Credito al 85%" -> abre vista de credito. "2 comunicaciones RLT pendientes" -> abre vista RLT.

**Por que:** El dashboard actual presenta datos pero rara vez conecta con acciones. Un dashboard accionable transforma "coleccion de graficos" en "centro de operaciones".

**Como:** Anadir handlers `onclick` a los elementos de alerta/KPI que invocan la navegacion a la pestana correspondiente con filtros preaplicados.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — cierra la brecha entre ver datos y actuar.

---

#### F3.6 — PDF de convocatoria con branding

**Que:** Nuevo boton "Exportar convocatoria" que genera un PDF via `window.open()` con: cabecera con nombre del producto ("FormacionES") y paleta indigo, datos del evento, tabla de destinatarios con filas alternas, pie con fecha de generacion.

**Por que:** El PDF es la unica pieza de la app que personas externas ven. Su calidad comunica directamente la calidad del producto.

**Como:** Funcion `exportConvocatoriaPDF()` que abre `window.open()` con HTML inline usando estilos `@media print` + `@page`. Cabecera con borde inferior de 3px en `--accent`, titulo del evento, metadata, tabla de destinatarios, pie con fecha.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — extension de la identidad del producto.

---

#### F3.7 — Mejora de hoja de firmas y certificados

**Que:** Aplicar branding unificado (misma cabecera "FormacionES", misma paleta, misma tipografia) a la hoja de firmas y certificados existentes. Mejorar el generador de certificados con: plantilla personalizable (logo de empresa como data URL), generacion masiva, numeracion automatica, distincion asistencia vs. aprovechamiento.

**Por que:** Los certificados son parte de la documentacion para inspeccion. Cada documento generado con un nivel de pulido diferente fragmenta la percepcion de calidad. Unificar el branding visual en todos los documentos generados extiende la identidad de forma coherente.

**Fase:** 3.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Medio-alto — consistencia en todos los outputs + valor para inspeccion.

---

#### F3.8 — Dossier de documentacion para inspeccion

**Que:** Boton "Generar dossier de inspeccion" en la ficha de cada accion formativa que: (1) recopila automaticamente todos los datos disponibles (FUNDAE, asistencia, encuestas, XML, comunicacion RLT), (2) genera HTML/PDF con indice, (3) muestra checklist de documentacion requerida vs. disponible, (4) permite anadir notas/referencias a documentos externos (factura, programa), (5) exportacion como ZIP.

**Por que:** Cuando llega una inspeccion de la ITSS, Laura dedica horas o dias a recopilar documentacion dispersa. El checklist de documentacion actua como prevencion, alertando de lo que falta ANTES de que llegue la inspeccion. Ninguna herramienta del mercado genera automaticamente el "dossier de inspeccion" integrado.

**Como:** La herramienta ya tiene la mayoria de los datos internos (catalogo, participantes, asistencia, XML). El checklist es logica de presencia/ausencia de datos. La generacion de HTML/PDF y ZIP ya existe en el proyecto.

**Fase:** 3.
**Esfuerzo:** Medio (5-7h).
**Impacto:** Alto — reduce de horas/dias a minutos la preparacion ante inspeccion.

---

#### F3.9 — Informe de ejecucion del plan para Direccion

**Que:** Boton "Generar informe para Direccion" en el dashboard: (1) seleccionar periodo, (2) generar automaticamente un informe ejecutivo con KPIs (acciones, horas, participantes, presupuesto, credito FUNDAE, estado de compliance), (3) comparativa con periodo anterior, (4) distribucion por area, (5) formato HTML imprimible con graficos SVG y cabecera personalizable con logo.

**Por que:** Este informe es uno de los entregables mas visibles del departamento de formacion. Automatizarlo ahorra 4-8 horas por trimestre y posiciona la herramienta como generadora de valor para Direccion, no solo para Laura.

**Como:** Los datos y calculos ya existen en el dashboard. El informe es una reorganizacion en formato narrativo. Los graficos SVG ya se usan (asistencia, sparklines). La exportacion HTML es nativa.

**Fase:** 3.
**Esfuerzo:** Medio (5-7h).
**Impacto:** Alto — genera valor visible para stakeholders fuera del departamento.

---

#### F3.10 — Balance formativo para la RLT

**Que:** Boton "Generar balance RLT" que genera automaticamente el informe anual con: acciones realizadas, horas totales, participantes (con desglose por genero si disponible), distribucion por tipo/modalidad/departamento, presupuesto y credito FUNDAE consumido, listado de proveedores.

**Por que:** Complementa directamente F2.11 (comunicacion RLT). El balance del ejercicio anterior es un dato requerido en la comunicacion. Muchos convenios colectivos obligan a compartir informes periodicos de formacion con los representantes.

**Como:** Todos los datos necesarios ya estan en el catalogo y dashboard. Es reorganizarlos en formato de informe especifico.

**Fase:** 3.
**Esfuerzo:** Bajo (3-4h).
**Impacto:** Medio — ahorra 2-4 horas cada vez que Laura lo necesita.

---

#### F3.11 — Bordes laterales con color semantico en secciones del panel izquierdo

**Que:** La barra indicadora de cada seccion del panel izquierdo cambia de color segun estado: `--success` cuando la seccion esta completa, `--accent` por defecto, `--warning` si faltan campos obligatorios.

**Fase:** 3.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Medio — refuerza la sensacion de flujo guiado.

---

#### F3.12 — Animacion de seleccion/deseleccion en tabla

**Que:** Al excluir una fila, transicion suave de 200ms a `opacity: 0.4` con `text-decoration: line-through`. Al reincluir, flash breve de `background: var(--success-light)` que se desvanece.

**Fase:** 3.
**Esfuerzo:** Bajo (1h).
**Impacto:** Medio.

---

#### F3.13 — Exportacion .ics de calendario

**Que:** Boton en la pestana Calendario para exportar un archivo .ics con todas las formaciones visibles (respetando filtros activos).

**Por que:** Laura necesita las formaciones en su calendario de Outlook para planificar su semana. Anadir exportacion .ics hace la pestana Calendario accionable y la conecta con el ecosistema de herramientas de Laura.

**Como:** Generar texto plano .ics con `VCALENDAR` + `VEVENT` por cada accion con fechas. Descargar como archivo via `URL.createObjectURL`.

**Fase:** 3.
**Esfuerzo:** Bajo (2h).
**Impacto:** Medio — reduce duplicacion de trabajo.

---

#### F3.14 — View Transitions API para cambio de pestanas

**Que:** Al cambiar de pestana, usar `document.startViewTransition()` para un cross-fade de 150ms. Degradacion elegante en navegadores sin soporte.

```javascript
function switchTab(tabId) {
  if (document.startViewTransition) {
    document.startViewTransition(() => applyTabChange(tabId));
  } else {
    applyTabChange(tabId);
  }
}
```

**Fase:** 3.
**Esfuerzo:** Bajo (1h).
**Impacto:** Medio — pulido visual transversal.

---

#### F3.15 — Blur sistematico en overlays

**Que:** Unificar `backdrop-filter: blur(8px)` en todos los overlays (dialogos, paleta de comandos, dropdowns de filtros). Actualmente los dialogos usan `blur(4px)`.

**Fase:** 3.
**Esfuerzo:** Muy bajo (30 min).
**Impacto:** Bajo-medio — contribuye al efecto compuesto de pulido.

---

#### F3.16 — Precomputacion del dashboard al cargar datos

**Que:** Al completar la carga del Excel, calcular las metricas del dashboard en un `requestIdleCallback()`. Cuando Laura navega al dashboard, renderizar instantaneamente si los datos no han cambiado.

**Fase:** 3.
**Esfuerzo:** Medio (3h).
**Impacto:** Medio-alto — el dashboard carga instantaneamente.

---

#### F3.17 — Checklist de activacion persistente

**Que:** Panel colapsable en la parte superior de la app (visible solo las primeras sesiones) con 7 pasos: (1) Cargar organigrama, (2) Enviar primera convocatoria, (3) Crear accion formativa, (4) Generar primer XML, (5) Definir formaciones obligatorias, (6) Generar primer informe, (7) Explorar el dashboard. Progreso persistido en localStorage. Se oculta al completar o al pulsar "No mostrar mas".

**Por que:** El onboarding actual tiene 3 pasos que solo describen el flujo de convocatoria. Las otras pestanas no tienen guia de entrada. Con la vision amplia, el checklist comunica activamente que la app cubre el ciclo completo de formacion.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Medio — mejora significativamente la descubribilidad y la tasa de activacion.

---

### Fase 4: Extensiones avanzadas

**Objetivo:** Features opcionales que amplian el alcance de la app. Algunas requieren infraestructura externa (Power Automate). Solo se abordan cuando Fases 0-3 estan completadas.

**Duracion estimada:** Variable, sin deadline

---

#### F4.1 — Convocatoria por lotes (una formacion, multiples ubicaciones)

**Que:** Nuevo modo "Envio por lotes" accesible desde la action bar. Laura configura datos del evento una vez, selecciona un campo de agrupacion (Ubicacion, Departamento, Empresa), la app muestra preview de los lotes generados, y al confirmar se anaden a la cola.

**Por que:** Es la propuesta con mayor ratio de ahorro de tiempo. Convierte la tarea mas repetitiva de Laura (misma formacion para N ubicaciones, 15 minutos) en 3 minutos.

**Fase:** 4.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Muy alto para flujos repetitivos.

---

#### F4.2 — Seleccion por lista de NIFs/emails

**Que:** Textarea donde Laura puede pegar una lista de NIFs o emails. La app hace match con el organigrama y selecciona exactamente esos empleados.

**Fase:** 4.
**Esfuerzo:** Bajo (2-3h).
**Impacto:** Medio.

---

#### F4.3 — Recordatorios automaticos

**Que:** Checkbox en datos del evento: "Enviar recordatorio X dias antes" que usa el webhook de PA para programar un email de recordatorio.

**Fase:** 4.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — pero depende de Power Automate.

---

#### F4.4 — Envio via Power Automate (sin deeplink)

**Que:** Nuevo modo de envio que usa el webhook existente para enviar convocatorias directamente via PA/Graph API, sin abrir pestanas de Outlook.

**Fase:** 4.
**Esfuerzo:** Alto (8-12h). Requiere ampliar el flujo de Power Automate.
**Impacto:** Muy alto — pero transforma la arquitectura.

---

#### F4.5 — Virtual scrolling en tabla de destinatarios

**Que:** Para datasets >500 filas, renderizar solo las filas visibles + 20 de buffer. Implementacion con IntersectionObserver o calculo de viewport sin dependencias externas.

**Fase:** 4.
**Esfuerzo:** Medio-alto (5-6h).
**Impacto:** Alto para datasets grandes.

---

#### F4.6 — Dark mode

**Que:** Definir tokens dark bajo `[data-theme="dark"]` en `:root`. Toggle en ajustes con 3 opciones: Claro, Oscuro, Sistema.

**Fase:** 4 — depende de que F0.1 (migracion de estilos inline) este significativamente avanzada.
**Esfuerzo:** Alto (8-10h).
**Impacto:** Alto — pero bloqueado por estilos inline.

---

#### F4.7 — Backup automatico de datos

**Que:** Boton "Exportar/Importar datos" que serializa todo el estado a fichero JSON. Recordatorio periodico ("Hace 7 dias que no exportas").

**Fase:** 4.
**Esfuerzo:** Bajo-medio (3h).
**Impacto:** Critico para resiliencia — pero no urgente para el flujo diario.

---

#### F4.8 — Perfil formativo de empleado

**Que:** Al buscar un empleado en el dashboard, mostrar perfil con: formaciones recibidas, horas acumuladas, formaciones obligatorias vigentes/caducadas, certificados emitidos, encuestas contestadas.

**Por que:** Con la vision amplia, la perspectiva del empleado individual es tan valiosa como la perspectiva de la accion formativa. Laura necesita responder a preguntas como "¿Maria Garcia ya hizo PRL este ano?" sin buscar manualmente en el catalogo.

**Fase:** 4.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Medio — util para consultas puntuales y evaluaciones de desempeno.

---

#### F4.9 — Informe personalizable

**Que:** En el dashboard, permitir seleccionar que secciones incluir en la exportacion, anadir header con logo de empresa, opcion de exportar a PDF.

**Fase:** 4.
**Esfuerzo:** Alto (6-8h).
**Impacto:** Medio.

---

#### F4.10 — Resumen de cambios al recargar organigrama

**Que:** Al cargar un nuevo Excel con datos previos en sesion, comparar por NIF y mostrar resumen: "15 nuevas incorporaciones, 2 bajas, 4 cambios de departamento." Avisar si participantes de acciones activas o empleados con formaciones obligatorias registradas ya no estan en el nuevo organigrama.

**Fase:** 4.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — previene descubrimiento tardio de cambios.

---

#### F4.11 — Datos de ejemplo en dashboard

**Que:** Boton "Ver con datos de ejemplo" en el empty state del dashboard que carga dataset sintetico de 3-5 acciones formativas con participantes, encuestas, formaciones obligatorias y metricas de compliance. Marca visual clara ("Datos de ejemplo") con boton "Borrar datos de ejemplo".

**Fase:** 4.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Alto para activacion de nuevos usuarios.

---

#### F4.12 — Tipografia fluida con clamp()

**Que:** Reemplazar tamanos de fuente fijos por escalas fluidas con `clamp()`. Cargar Inter como variable font (`wght@300..700`) en vez de pesos estaticos.

**Fase:** 4.
**Esfuerzo:** Bajo (2h).
**Impacto:** Bajo — mejora responsive sin breakpoints tipograficos.

---

#### F4.13 — Unificacion de templates

**Que:** Unificar los 3 tipos de template (plantillas de evento, plantillas de filtro+evento, plantillas de formaciones recurrentes) en un unico concepto de "plantilla" que guarda todo: filtros, exclusiones, datos del evento, vinculacion al catalogo. Un dropdown, un boton "Guardar plantilla", un boton "Cargar plantilla".

**Fase:** 4.
**Esfuerzo:** Medio-alto (5-6h).
**Impacto:** Medio — simplifica un modelo mental confuso.

---

#### F4.14 — Plan anual de formacion

**Que:** Nueva vista "Plan anual" con: (1) acciones formativas "planificadas" (estado previo a "En preparacion"), (2) vista agrupada por trimestre/mes con resumen de presupuesto, (3) comparativa plan vs. ejecucion, (4) exportacion del plan a formato presentable, (5) boton para convertir accion planificada en accion real del catalogo.

**Por que:** Cubre la fase 2 del ciclo L&D (Planificacion y presupuesto). Conecta la planificacion estrategica con la ejecucion operativa y elimina la doble gestion (plan en Excel + ejecucion en la herramienta).

**Fase:** 4.
**Esfuerzo:** Medio-alto (6-8h).
**Impacto:** Medio-alto — flujo que Laura usa 1-2 veces al ano pero consulta trimestralmente.

---

#### F4.15 — Gestion ampliada de proveedores

**Que:** Ampliar el catalogo de "Centros de formacion" con: persona de contacto, telefono, email, especialidades, tarifa referencia, scorecard automatico (satisfaccion media, numero de acciones, ultima colaboracion, coste medio), vista comparativa.

**Fase:** 4.
**Esfuerzo:** Bajo (3-4h).
**Impacto:** Medio — util pero no critico.

---

#### F4.16 — Gestion de listas de espera

**Que:** Campo opcional "Aforo maximo" en datos del evento. Si destinatarios seleccionados > aforo, ofrecer crear lista de espera. Vista con confirmados vs. espera. Paso automatico al eliminar confirmado.

**Fase:** 4.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Medio-bajo — util pero infrecuente.

---

#### F4.17 — Deteccion basica de necesidades formativas (mini-TNA)

**Que:** Formulario de solicitud de formacion exportable/importable. Laura genera un formulario, los managers rellenan (area, tema, justificacion, urgencia), Laura importa las respuestas. Vista de solicitudes con filtros. Boton "Crear accion formativa" que pre-rellena el catalogo.

**Por que:** Cubre la fase 1 del ciclo L&D (Deteccion de necesidades). Conecta el "por que" de cada formacion con su ejecucion.

**Fase:** 4.
**Esfuerzo:** Medio (5-7h).
**Impacto:** Medio — util 1-2 meses al ano.

---

#### F4.18 — Evaluacion Kirkpatrick L1-L2 integrada

**Que:** Ampliar el sistema de encuestas existente con: (1) estructura de cuestionario de Kirkpatrick L1 (reaccion: utilidad percibida, calidad formador, materiales, NPS), (2) soporte para test pre/post formacion L2 (aprendizaje), (3) resultados agregados por accion formativa y por proveedor, (4) benchmarking entre formaciones.

**Por que:** La evaluacion post-formacion es la fase 6 del ciclo L&D. El sistema de encuestas actual solo recoge satisfaccion basica via Microsoft Forms/Google Forms. Estructurar la evaluacion segun Kirkpatrick alinea con el estandar de la industria y genera datos comparables.

**Nota:** Los niveles L3 (comportamiento) y L4 (resultados) requieren datos externos a la herramienta y se excluyen del alcance. L5 (ROI Phillips) ya esta parcialmente cubierto en el dashboard.

**Fase:** 4.
**Esfuerzo:** Alto (8-10h).
**Impacto:** Medio — mejora la calidad del reporting pero no cambia el dia a dia de Laura.

---

## Propuestas descartadas o aplazadas

| Propuesta | Origen | Decision | Justificacion |
|-----------|--------|----------|---------------|
| **Sound design (4 sonidos Web Audio)** | Frontend 9.1 | **Descartada** | Laura trabaja en una oficina compartida de RRHH. El feedback auditivo no aporta valor en ese contexto. Los 3 revisores convergen en que es la propuesta con peor encaje. Si se implementa alguna vez, limitarlo a un solo sonido, opt-in con default OFF, y como ultima prioridad. |
| **Confetti CSS al completar cola** | Frontend 3.2 | **Descartada** | Trivializa el trabajo de Laura. Enviar 3 convocatorias de PRL no es un milestone — es martes. Sustituido por resumen post-envio accionable (F2.5) con check animado sutil. |
| **Refinar opacidad de shadow-accent (0.3->0.2)** | Frontend 1.4 | **Absorbida en F0.3** | Se aplica como parte de la resolucion de ambiguedad de sombras en Fase 0. No merece propuesta propia. |
| **Hover mejorado en filter-select-btn** | Frontend 2.2 | **Aplazada indefinidamente** | No resuelve ningun pain point documentado de Laura. |
| **Refinar jerarquia del attendee-count** | Frontend 1.2 | **Aplazada a pulido general** | Correcto pero no urgente. Se puede hacer en un pase de pulido junto con otros ajustes tipograficos menores. |
| **Filtros avanzados AND/OR** | Frontend revision (2.10) | **Aplazada indefinidamente** | Complejidad UI alta para un caso de uso infrecuente. El sistema actual cubre el 95% de los escenarios. |
| **Bento Grid para dashboard** | Frontend revision (2.6) | **Aplazada indefinidamente** | Requiere un rediseno completo del dashboard. La divulgacion progresiva (F3.4) resuelve el problema de sobrecarga sin rehacer el layout. |
| **Personalizacion de columnas en tabla** | Frontend revision (2.3) | **Aplazada a Fase 4+** | La tabla tiene pocas columnas fijas. La personalizacion tiene sentido para tablas de 10+ columnas. |
| **Gestion de competencias / Skills Matrix** | Research RRHH (seccion 12) | **Aplazada indefinidamente** | Es un modulo de gestion de talento que desborda el alcance de "gestion de formacion". La herramienta cubre el ciclo L&D, no la gestion de competencias estrategica. Si Laura necesita una skills matrix, usa un Excel aparte o un HRIS. Sin embargo, el perfil formativo del empleado (F4.8) cubre parcialmente esta necesidad desde la perspectiva de formacion. |
| **Integracion con LMS** | Research RRHH (seccion 13) | **Fuera de alcance** | La herramienta es un fichero HTML sin backend. Integraciones con LMS (SCORM, APIs) requieren infraestructura incompatible con la arquitectura zero-deployment. |
| **PIF (Permisos Individuales de Formacion)** | Research RRHH (seccion 16) | **Aplazada indefinidamente** | Los PIF son un mecanismo distinto de la formacion programada (iniciativa del trabajador, no de la empresa). Su gestion es poco frecuente (pocas empresas los tramitan activamente) y anadirlo sin un caso de uso claro seria feature bloat. |
| **Onboarding completo (formacion de incorporacion)** | Research RRHH (seccion 11) | **Fuera de alcance** | El onboarding completo es responsabilidad compartida con RRHH general, el manager y TI. La herramienta cubre la parte formativa del onboarding a traves del tracking de formacion obligatoria (F2.10) — las formaciones de incorporacion se registran como formaciones obligatorias de tipo "inicial". |

---

## Integracion de propuestas del research RRHH

Las 13 propuestas del research de flujos RRHH (F1-F13 del documento original) se han evaluado contra la vision amplia de "gestion integral de formacion". A continuacion, el mapa de como cada propuesta del research se integra en el spec:

| Propuesta research | Evaluacion de coherencia | Integracion en el spec |
|--------------------|--------------------------|------------------------|
| **F1: Comunicacion RLT** | Muy alta — es un paso legal obligatorio del ciclo FUNDAE y de formacion en general | **Fase 2** (F2.11) — Core compliance |
| **F2: Tracking formacion obligatoria** | Muy alta — 30-50% del trabajo del departamento, responsabilidad legal directa | **Fase 2** (F2.10) — Core compliance |
| **F3: Dossier de inspeccion** | Muy alta — cierra el ciclo de documentacion; diferenciador unico | **Fase 3** (F3.8) — Tras tener datos de RLT y compliance |
| **F4: Plan anual de formacion** | Alta — cubre fase 2 del ciclo L&D, poco frecuente pero estrategico | **Fase 4** (F4.14) — Extension estrategica |
| **F5: Gestion de proveedores** | Media-Alta — amplia lo existente sin anadir complejidad | **Fase 4** (F4.15) — Refinamiento |
| **F6: Exportacion .ics calendario** | Alta — trivial de implementar, valor inmediato | **Fase 3** (F3.13) — Quick win |
| **F7: Balance formativo RLT** | Muy alta — complemento directo de F1 (comunicacion RLT) | **Fase 3** (F3.10) — Tras implementar RLT |
| **F8: Listas de espera** | Media — refinamiento del flujo existente, infrecuente | **Fase 4** (F4.16) — Extension |
| **F9: Mini-TNA** | Media — util 1-2 meses al ano, riesgo de feature bloat | **Fase 4** (F4.17) — Extension |
| **F10: Credito FUNDAE con simulacion** | Muy alta — amplifica modulo existente, alto impacto | **Fase 1** (F1.9) — Quick win que amplifica lo existente |
| **F11: Certificados mejorados** | Alta — parte de documentacion para inspeccion | **Fase 3** (F3.7) — Junto con branding unificado |
| **F12: Perfil formativo empleado** | Alta — la "otra cara" de la perspectiva centrada en acciones | **Fase 4** (F4.8) — Extension |
| **F13: Informe para Direccion** | Muy alta — genera valor visible para stakeholders | **Fase 3** (F3.9) — Reporting |

### Propuesta nueva derivada del research: Evaluacion Kirkpatrick

El research documenta extensamente el modelo Kirkpatrick + Phillips (seccion 8). La herramienta ya tiene encuestas de satisfaccion via PA (L1 basico) y un modulo de ROI en el dashboard (L5 parcial). La propuesta F4.18 cierra el gap estructurando la evaluacion segun el estandar de la industria.

---

## Registro de resolucion de incoherencias

### Incoherencias del revisor de frontend (8)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **1.1** | **Inter: elogio como "Excelente" vs. estado del arte que la identifica como "segura"** | Mantener Inter — es la fuente correcta para productividad. Modernizar la carga como variable font + `clamp()` (F4.12). No es prioridad: el impacto para Laura es nulo. |
| **1.2** | **Sombras: 2 niveles documentados vs. 4 reales en CSS** | Resuelto en F0.3. Las sombras accent son una variante de color, no un nivel. Se redefinira la documentacion y se ajusta opacidad. |
| **1.3** | **Toasts: mejora incremental vs. panel persistente vs. centro de notificaciones** | Tres capas complementarias: (1) Toasts mejorados (F1.4). (2) Panel persistente de calidad de datos (F2.1). (3) No centro de notificaciones — excesivo para app single-user. |
| **1.4** | **Empty states: tabla vs. dashboard vs. datos de ejemplo** | Unificados en F3.3 bajo sistema de componentes con variantes. Datos de ejemplo aplazados a F4.11. |
| **1.5** | **Atajos de teclado: conflicto con nativos del navegador** | No interceptar nativos. Conjunto definitivo en F3.2. |
| **1.6** | **Dialogo de confirmacion vs. vista previa — solapamiento funcional** | Fusionados en F2.3. |
| **1.7** | **Confetti al completar cola vs. selectividad** | Confetti descartado. Sustituido por F2.5 (resumen post-envio). |
| **1.8** | **Nombre del producto** | Resuelto en F0.4. Se adopta "FormacionES" (no "Formaciones FUNDAE" — la vision amplia requiere un nombre que no se limite a un solo flujo regulatorio). |

### Incoherencias del revisor de empatia (10)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **E1** | **Sound design no encaja con el contexto de oficina** | Descartado. |
| **E2** | **Confetti trivializa el trabajo de Laura** | Descartado. Sustituido por resumen accionable (F2.5). |
| **E3** | **Cmd+K como "Muy alto impacto" pero Laura no usa atajos** | Reclasificado: impacto alto pero Fase 3. Diferenciador premium, no pain point. |
| **E4** | **Atencion excesiva al primer contacto vs. uso continuado** | Redirigida: F1.7 mejora el "momento de retorno". Empty states simplificados. |
| **E5** | **Migrar estilos inline — impacto cero para Laura** | Reclasificado: prerequisito tecnico en F0.1, no propuesta de valor. |
| **E6** | **Empty states asumen usuario nuevo — Laura nunca los ve** | Resuelto: 80% esfuerzo en panel de calidad de datos (F2.1), 20% en empty states. |
| **E7** | **Flujo de lotes por ubicacion ausente** | Incorporado como F4.1. |
| **E8** | **Duplicacion funcional de templates** | Incorporado como F4.13. |
| **E9** | **Sombras y hover priorizados por encima de pain points reales** | Sombras absorbidas en F0.3. Hover aplazado. Prioridades alineadas con pain points. |
| **E10** | **Renombrar la app como prioridad 2 — impacto nulo para Laura** | Resuelto en F0.4 como cambio trivial. Pero con la vision amplia, el nombre SI importa: "FormacionES" refleja que la herramienta no es solo convocatorias. |

### Incoherencias del revisor de coherencia (6)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **C1** | **La brecha de identidad se agranda con propuestas de empatia** | Resuelto por la nueva narrativa: la app cubre el ciclo completo de formacion (no solo FUNDAE). Las propuestas que antes "desbordaban" (reporting, compliance, perfil formativo) ahora encajan naturalmente en la vision amplia. |
| **C2** | **Herramienta personal vs. plataforma departamental** | Resuelto: es una herramienta personal para Laura que genera outputs para Direccion y la RLT. Laura es la operadora; los stakeholders reciben informes generados. No es multiusuario, pero si genera valor departamental. |
| **C3** | **Terminologia inconsistente** | Resuelto por el glosario vinculante, ampliado con terminos del research RRHH (compliance, caducidad, RLT, dossier). |
| **C4** | **Disparidad de madurez entre pestanas** | La vision amplia profundiza este riesgo (mas funcionalidades = mas superficie). Mitigacion: Fase 3 iguala la calidad con empty states transversales, checklist de activacion de 7 pasos, y dashboard accionable que conecta todas las pestanas. |
| **C5** | **Tension localStorage vs. funcionalidades con backend** | Las funcionalidades con PA siguen en Fase 4. La identidad base no depende de backend. Nuevo riesgo: el volumen de datos de compliance (formaciones obligatorias por empleado) puede estresar localStorage. Mitigacion: considerar IndexedDB si el volumen supera el 70% del limite. F4.7 (backup) se vuelve mas urgente. |
| **C6** | **Onboarding se complica con cada nueva funcionalidad** | Resuelto: checklist de activacion (F3.17) ampliado a 7 pasos que cubren la vision amplia. Las funcionalidades de compliance se descubren via el checklist. |

### Nuevas incoherencias detectadas en esta revision (3)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **N1** | **La vision amplia multiplica el riesgo de feature bloat** | Las 13 propuestas del research RRHH anaden funcionalidades sustanciales. Mitigacion: las propuestas que cubren fases del ciclo L&D poco frecuentes (TNA = 1-2 meses/ano, plan anual = 1 vez/ano, PIF = casi nunca) se clasifican como Fase 4. La regla YAGNI se aplica estrictamente: no implementar hasta que Laura lo pida. Divulgacion progresiva en TODAS las funcionalidades nuevas. |
| **N2** | **El nombre "FormacionES" podria percibirse como generico** | El nombre es deliberadamente amplio para reflejar la vision completa. La diferenciacion viene del subtitulo en la UI (si se necesita) y de la experiencia de uso, no del nombre. "FormacionES" es mas memorable que "Gestor de Formacion" o "Central de Formacion" y el doble sentido con "ES" le da identidad espanola. |
| **N3** | **Las funcionalidades de compliance (F2.10, F2.11) anaden peso a Fase 2** | Fase 2 pasa de "Core UX premium" a "Core UX premium + compliance". El esfuerzo total de Fase 2 sube de 5-7 dias a 7-10 dias. Esto es aceptable porque: (a) compliance es tan core como FUNDAE en la vision amplia, (b) las propuestas de compliance reutilizan patrones existentes (catalogo, plazos, alertas), (c) el impacto legal justifica la prioridad. |

---

## Analisis competitivo post-overhaul

Si se implementan las Fases 0-3, FormacionES cubrira:

| Fase del ciclo L&D | FormacionES (actual) | FormacionES (post-overhaul) | Gesbon | Cezanne HR | SAP SF Learning |
|---------------------|---------------------|----------------------------|--------|------------|-----------------|
| Deteccion necesidades | No | No (Fase 4) | No | Parcial | Parcial |
| Planificacion/presupuesto | Baja | Media (simulacion credito) | Parcial | Si | Si |
| Sourcing proveedores | Baja | Baja (Fase 4) | No | Si | Si |
| **Convocatoria** | **Alta** | **Muy alta** | No | Basica | Basica |
| Ejecucion/asistencia | Media | Alta (certificados) | Parcial | Si | Si |
| Evaluacion | Media-Baja | Media | No | Si | Si |
| Reporting | Media | **Muy alta** (Direccion + RLT) | Parcial | Si | Si |
| **Compliance FUNDAE** | **Alta** | **Muy alta** | **Alta** | No | No |
| **Comunicacion RLT** | No | **Si** | Parcial | No | No |
| **Dossier inspeccion** | No | **Si** | Parcial | No | No |
| **Formacion obligatoria** | No | **Si** | No | Parcial | Si |
| Certificados | Baja | Media-Alta | Parcial | Si | Si |
| Perfil empleado | No | No (Fase 4) | No | Si | Si |
| Calendario exportable | No | **Si** | No | Si | Si |

**Diferenciadores unicos post-overhaul:**
1. Unica herramienta que cubre convocatoria + FUNDAE + RLT + compliance + inspeccion en un solo fichero
2. Zero-cost, zero-deployment (ningun competidor lo iguala)
3. Tracking de formacion obligatoria con caducidades integrado con el organigrama
4. Velocidad de operacion (todo local, sin latencia de red)
5. Informe para Direccion y balance RLT generados automaticamente desde los datos operativos

**Propuesta de valor actualizada:**
> "Todo lo que necesitas para gestionar la formacion de tu empresa — desde la convocatoria hasta el informe a Direccion, pasando por el compliance FUNDAE, las formaciones obligatorias y la documentacion para inspeccion — en una herramienta de escritorio que puedes abrir manana mismo sin pedir nada a TI."

---

## Principios para la implementacion

Derivados de la investigacion, el CLAUDE.md, las conclusiones de los 3 revisores, y la vision amplia:

1. **Todo dentro de `convocatoria.html`** — no crear archivos adicionales.
2. **Usar variables CSS existentes** — nunca hardcodear colores.
3. **Respetar `prefers-reduced-motion`** — todas las animaciones nuevas deben tener fallback en el bloque `@media (prefers-reduced-motion: reduce)` existente.
4. **Consistencia sobre novedad** — cada nuevo componente reutiliza patrones existentes (`--radius`, `--transition`, `--shadow-sm/lg`).
5. **El efecto compuesto** — la percepcion premium no viene de una sola mejora sino de la acumulacion de cientos de decisiones correctas.
6. **Laura sobre el disenador** — ante cualquier duda de priorizacion, la pregunta es: "¿Esto ayuda a Laura a hacer su trabajo mas rapido o con menos miedo a errores?"
7. **Prevencion sobre curacion** — es mas valioso evitar un error (semaforo FUNDAE, validacion on-blur, alerta de caducidad) que mostrar un error bonito.
8. **Informacion de cierre sobre celebracion** — Laura necesita saber que salio bien y cual es el siguiente paso, no confetti ni sonidos.
9. **Coherencia transversal** — no pulir la pestana de Convocatoria al nivel de Stripe mientras el Calendario sigue siendo un Gantt sin guia. Cada fase debe elevar todas las pestanas proporcionalmente.
10. **La deuda tecnica se paga primero** — Fase 0 existe por una razon. Implementar mejoras visuales sobre estilos inline es construir sobre arena.
11. **Compliance es core, no extension** — la gestion de formacion obligatoria, la comunicacion a la RLT y la documentacion para inspeccion son tan fundamentales como las convocatorias y el ciclo FUNDAE. No son funcionalidades "avanzadas" — son el dia a dia del departamento de formacion.
12. **Divulgacion progresiva como antidoto al feature bloat** — cada funcionalidad nueva se presenta colapsada, oculta, o accesible via Cmd+K hasta que Laura la descubre o la necesita. Nunca anadir pestanas principales. Nuevas funcionalidades se integran como sub-secciones, paneles colapsables o acciones contextuales.
13. **No crear pestanas nuevas** — Las funcionalidades de RLT y formacion obligatoria se integran como sub-secciones del catalogo. El dossier de inspeccion es un boton en la ficha de accion. Los informes son secciones del dashboard. La estructura de 5 pestanas se mantiene.
