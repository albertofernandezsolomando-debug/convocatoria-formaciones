# Revision Cruzada: Auditoria de Empatia con la Usuaria

**Fecha:** 14 de marzo de 2026
**Tipo:** Revision cruzada de todos los documentos de diseno desde la perspectiva de Laura
**Autora:** Especialista en empatia con la usuaria y flujos de trabajo
**Documentos auditados:** propuestas-empatia-usuaria, propuestas-frontend-premium, auditoria-coherencia-propuesta-valor, estado-del-arte-ui-ux, percepcion-alto-valor-research

---

## 0. Encuadre: quien es Laura y que le importa

Antes de entrar en la auditoria, conviene recordar que Laura no evalua la app como un disenador ni como un arquitecto. Laura evalua la app por una sola pregunta: **"¿Hoy he podido hacer mi trabajo mas rapido y con menos miedo a equivocarme?"**

Sus tres ejes vitales son:
1. **Velocidad operativa** — Cuantas convocatorias puedo preparar antes de la reunion de las 12.
2. **Seguridad ante errores** — ¿Estoy segura de que no me dejo nada? (plazos FUNDAE, datos incompletos, asistentes que faltan).
3. **Reduccion de tareas repetitivas** — No quiero copiar la misma informacion en tres sitios.

Cualquier propuesta que no conecte directamente con uno de estos tres ejes es, para Laura, ruido.

---

## 1. Incoherencias detectadas

### 1.1 Propuestas que ignoran los pain points reales de Laura

**Incoherencia 1: Sound design (frontend-premium 9.1) vs. contexto real de Laura**

La propuesta de feedback auditivo (4 sonidos, Web Audio API) ignora un dato fundamental del perfil de Laura: trabaja en una oficina compartida de RRHH. El sonido al enviar una convocatoria o completar la cola no solo no aporta valor — genera incomodidad social. Laura silenciaria el navegador y nunca activaria la opcion.

El documento de empatia no menciona el sonido en ningun momento porque no es un pain point ni un deseo. La propuesta nace de la investigacion de percepcion de valor (seccion 4.7: "el feedback auditivo llega al cerebro 10x mas rapido"), pero aplica un hallazgo generico a un contexto donde no encaja.

**Veredicto:** Esfuerzo que no resuelve nada para Laura. Si se implementa, que sea lo ultimo — hay 20 propuestas antes con impacto real.

---

**Incoherencia 2: Confetti en completacion de cola (frontend-premium 3.2) vs. percepcion de profesionalismo**

La propuesta de confetti CSS al completar la cola cita a Linear y Asana como referentes. Pero Laura no es una product manager que cierra milestones; es una gestora de formacion que ha enviado 3 correos de PRL. El confetti trivializa su trabajo. Laura probablemente pensaria: "¿En serio? Esto es una convocatoria de prevencion de riesgos laborales, no un juego."

El hallazgo del estado del arte (seccion 4.5 de notificaciones) es explicito: "Las mejores animaciones de exito celebran logros reales, no acciones triviales. Esto mantiene los momentos de celebracion significativos." Enviar 3 convocatorias de PRL no es un logro significativo — es martes.

**Veredicto:** El rediseno del dialogo de confirmacion (frontend-premium 3.1) SI tiene sentido porque da seguridad. El confetti no. Reemplazar por un resumen visual limpio con check animado sutil.

---

**Incoherencia 3: Paleta de comandos Cmd+K (frontend-premium 7.1) priorizada como "Muy alto impacto" vs. perfil de Laura**

La paleta de comandos se presenta como "la senal definitiva de aplicacion premium" y se prioriza con impacto "Muy alto". Pero Laura no usa atajos de teclado. Laura usa el raton. Laura no conoce Figma, Linear ni VS Code — conoce Excel, Outlook y la plataforma FUNDAE.

El propio documento de estado del arte reconoce que Cmd+K viene de herramientas para desarrolladores y power users (seccion 1.2). Laura no es ni lo uno ni lo otro.

Esto no significa que Cmd+K sea mala idea — significa que su impacto para Laura es **medio**, no "muy alto". El impacto "muy alto" esta en el semaforo de readiness FUNDAE (P3 del doc de empatia), que evita que Laura pierda 15 minutos descubriendo datos incompletos al final del proceso.

**Veredicto:** Cmd+K es un nice-to-have. No es la senal de calidad que Laura busca. La senal de calidad que Laura busca es que la app le diga "te faltan 3 NSS antes de que intentes generar el XML", no que tenga un overlay bonito con fuzzy search.

---

**Incoherencia 4: Atencion excesiva al primer contacto visual (investigacion de percepcion) vs. uso continuado de Laura**

La investigacion de percepcion de alto valor abre con "50 milisegundos determinan todo" y dedica secciones enteras al juicio estetico instantaneo. Esto es correcto para un SaaS que busca conversion de trial-to-paid.

Pero Laura no esta evaluando si adoptar la app. Laura YA la usa. La abrio ayer, la abrira manana. Su primer contacto fue hace meses. Lo que Laura evalua cada dia no es la estetica — es si la restauracion de sesion funciono, si los datos del Excel siguen ahi, si hay alertas pendientes.

El doc de empatia ya identifica la restauracion automatica de sesion como "probablemente el feature mas valorado inconscientemente" (seccion 2.1). Pero ninguna propuesta de frontend premium invierte en mejorar ese momento. El empty state inicial (frontend-premium 4.1) asume un usuario nuevo; Laura es un usuario recurrente.

**Veredicto:** Invertir mas en el "momento de retorno" (abrir la app y ver todo listo) que en el "momento de descubrimiento" (primera impresion).

---

**Incoherencia 5: Migrar estilos inline a CSS (coherencia R6) priorizado como "esfuerzo alto"**

La auditoria de coherencia recomienda migrar estilos inline del JS a clases CSS (R6). Esta recomendacion es correcta desde una perspectiva de arquitectura. Pero para Laura tiene impacto **cero**. Laura no ve si los estilos estan inline o en clases. Laura ve si el boton funciona.

En el ranking de priorizacion del doc de coherencia, R6 aparece como prioridad 11 (ultima). Correcto. Pero la inclusion de esta recomendacion en un informe de "propuesta de valor" puede desviar atencion de cambios que Laura si nota.

**Veredicto:** Mantener como deuda tecnica, no como propuesta de valor.

---

### 1.2 Propuestas que asumen flujos de trabajo que no coinciden con la realidad

**Incoherencia 6: Los empty states asumen un usuario nuevo — Laura nunca los ve**

Los tres documentos (frontend-premium 4.1-4.3, coherencia R8, estado del arte seccion 5.3) invierten significativamente en empty states: tabla sin datos, cola vacia, historial vacio. Se disenan tres variantes de empty state para la tabla.

Pero el doc de empatia deja claro que Laura restaura su sesion cada dia (seccion 2.1: "Restauracion de sesion automatica... Probablemente el feature mas valorado"). Laura ve el empty state de la tabla exactamente una vez: la primera vez que abre la app. Despues, siempre tiene datos cargados.

El empty state de la cola si tiene sentido porque Laura la vacia al lanzarla. Pero el empty state de la tabla es una inversion para un momento que ocurre una vez en la vida del usuario.

**Veredicto:** Invertir el esfuerzo en el estado "cargado con problemas" (panel de calidad de datos, P1 del doc de empatia) en lugar del estado "sin datos". El estado que Laura ve todos los dias no es "vacio" — es "cargado pero con 5 emails invalidos y 2 NIFs duplicados que no recuerdo si vi en el toast".

---

**Incoherencia 7: El flujo de lotes por ubicacion esta ausente de todos los documentos excepto el de empatia**

El doc de empatia identifica en la seccion 4.1 un escenario concreto: Laura prepara 3 convocatorias de PRL para 3 centros de trabajo. Es la misma formacion, el mismo formador, la misma fecha, pero tres grupos distintos filtrados por ubicacion. Laura tiene que cambiar el filtro, verificar asistentes, anadir a cola, y repetir 2 veces. El punto 5 del mapa emocional lo marca como "Frustracion".

Ninguna propuesta de frontend premium, de coherencia, ni del estado del arte aborda este escenario. Ni siquiera se menciona "lote por ubicacion" o "convocatoria multiple" fuera del doc de empatia.

**Veredicto:** Propuesta nueva necesaria (ver seccion 3).

---

**Incoherencia 8: La duplicacion funcional de templates (coherencia 2.4) no propone solucion desde la perspectiva de Laura**

La auditoria de coherencia identifica que existen 3 tipos de templates (plantillas de evento, plantillas de filtro+evento, plantillas de formaciones recurrentes) y los considera "duplicacion funcional". Pero no propone cual eliminar ni como simplificar.

Desde la perspectiva de Laura, la confusion es real. El doc de empatia no analiza este punto directamente, pero el pain point 1.2b (los presets no guardan la seleccion individual) y el pain point 1.3a (no hay vinculacion automatica con el catalogo) apuntan a que Laura quiere UN mecanismo que haga todo: cargar filtros, cargar datos del evento, vincular con la accion del catalogo, y recordar exclusiones.

**Veredicto:** Unificar los tres tipos de template en uno solo con campos opcionales. Laura no deberia tener que entender la diferencia entre "preset de filtro" y "plantilla de evento".

---

### 1.3 Prioridades desalineadas con lo que mas duele

**Incoherencia 9: Las sombras, el attendee-count y los hover de filtros se priorizan en Fase 1/Fase 4 del frontend premium**

El doc de frontend premium incluye en Fase 1 (quick wins):
- 1.4: Refinar shadow-accent (cambiar un valor de opacidad de 0.3 a 0.2)

Y en Fase 4 (pulido fino):
- 1.2: Refinar jerarquia del attendee-count
- 2.2: Hover mejorado en filter-select

Estos cambios son imperceptibles para Laura. La diferencia entre una sombra con opacidad 0.3 y 0.2 no resuelve ninguno de sus 26 pain points documentados.

Mientras tanto, los pain points de severidad alta del doc de empatia que no aparecen en el frontend premium son:
- 1.1d: No se puede editar el organigrama in situ (si un email esta mal, Laura tiene que volver al Excel)
- 1.4c: El flujo de series es tedioso (8 clicks para 8 sesiones)
- 1.6e: No hay duplicado rapido de acciones formativas

**Veredicto:** Eliminar el pulido de sombras y hover de filtros de la priorizacion. Sustituir por el panel de calidad de datos con edicion in situ (P1 del doc de empatia, ampliado).

---

**Incoherencia 10: El doc de coherencia prioriza "renombrar la aplicacion" (R1) como prioridad 2**

La auditoria de coherencia pone "Renombrar la aplicacion" como prioridad 2 (esfuerzo muy bajo, impacto alto). Desde la perspectiva de Laura, esto no le importa. Laura ya sabe que la app se llama "Convocatoria de Formaciones". El nombre no le genera confusion porque ella la usa para exactamente eso. Que la app haga mas cosas de las que su nombre sugiere no es un problema para Laura — es una sorpresa positiva.

El impacto de renombrar la app es nulo para la usuaria existente y marginal para un nuevo usuario que descubra las pestanas en 30 segundos.

**Veredicto:** Bajar a prioridad baja. El tiempo que se invierte en decidir entre "Gestor de Formacion FUNDAE", "Central de Formacion" y "Formaciones" se invierte mejor en implementar el semaforo de readiness FUNDAE.

---

## 2. Oportunidades perdidas

### 2.1 Pain points de Laura que ningun otro documento aborda

**Oportunidad 1: Edicion in situ del organigrama (pain point 1.1d)**

Laura carga un Excel con 500 empleados. 3 tienen emails invalidos. 1 tiene el NIF duplicado. Hoy, Laura tiene que:
1. Abrir el Excel en otra ventana.
2. Buscar los empleados afectados.
3. Corregir los datos.
4. Guardar el Excel.
5. Volver a la app y recargar.
6. Al recargar, pierde los filtros y selecciones que tenia.

Ningun documento propone edicion in situ de los datos del organigrama. El panel de calidad de datos (P1 del doc de empatia) propone MOSTRAR los problemas, pero no CORREGIRLOS. El estado del arte (seccion 2.5) documenta que el paradigma moderno es "reencuadrar al usuario como revisor en lugar de escribano de datos" — exactamente lo que Laura necesita: revisar y corregir errores detectados sin salir de la app.

**Propuesta:** Ampliar P1 (panel de calidad de datos) con un mini-editor inline. Al hacer click en "3 emails invalidos", la app muestra la lista de empleados afectados con un campo editable para corregir el email. La correccion se aplica solo a los datos en memoria (no modifica el Excel original). Se persiste en localStorage como "correcciones de organigrama" para que no se pierdan al recargar.

---

**Oportunidad 2: Vista de "quien falta por confirmar" (pain point 1.6d + workflow 3.1b)**

Laura necesita saber antes de la formacion: ¿quien ha confirmado asistencia? El doc de empatia identifica que la confirmacion de asistencia es un workflow critico ausente (3.1b). Pero ninguno de los otros documentos propone una UI para esto.

El estado del arte (seccion 3.4, acciones de fila) documenta que las tablas modernas incluyen "seleccion masiva con barra de acciones globales". La tabla de asistentes ya tiene checkboxes. Si Laura pudiera marcar "confirmado" / "pendiente" / "declinado" directamente en la tabla (incluso manualmente, sin envio automatico de email), tendria una vision que hoy no existe.

**Propuesta:** Anadir una columna "Estado" a la tabla de asistentes con 3 iconos clickables: check (confirmado), reloj (pendiente), X (declinado). Por defecto "pendiente". Laura puede actualizar manualmente o, en el futuro, vincularlo con un flujo de confirmacion via PA. Esto no requiere ningun backend — es un estado local por convocatoria.

---

**Oportunidad 3: "Guardar y continuar manana" explicito (pain point implicito en todo el mapa emocional)**

El autoguardado existe (seccion 2.1 del doc de empatia). Pero Laura no sabe exactamente QUE se guarda. ¿Se guardan los filtros? ¿Se guarda el evento a medio configurar? ¿Se guarda la cola? Si Laura cierra el navegador a mitad de la preparacion de 3 convocatorias, ¿puede retomar donde lo dejo?

El estado del arte (seccion 2.2) establece que la "persistencia de estado" es un requisito de formularios multi-paso modernos: "Guardar el progreso automaticamente para que el usuario pueda retomar donde lo dejo." La app ya hace esto, pero la investigacion de percepcion (seccion 4.3) anade un matiz: "El autoguardado protege contra cierres accidentales [...] es una senal de calidad."

El problema no es que no funcione — es que Laura no sabe que funciona. No hay indicador de "ultimo guardado: hace 2 minutos" ni de "tienes una sesion sin terminar con 2 convocatorias en cola".

**Propuesta:** Anadir un indicador discreto en la barra de estado o en el panel izquierdo: "Guardado automaticamente hace 2 min" (estilo Google Docs). Al abrir la app con cola no vacia, mostrar un banner: "Tienes 2 convocatorias en cola del dia 13/3. ¿Quieres continuar?"

---

### 2.2 Hallazgos del research que mejorarian los flujos de Laura

**Oportunidad 4: Validacion on-blur en el formulario de evento (estado del arte, seccion 2.3)**

El estado del arte establece: "Validacion on blur (al salir del campo) es el patron preferido. Mensajes de error contextuales: mostrar el mensaje cerca del campo afectado."

El frontend premium (5.1) propone errores contextuales en el formulario de evento, pero solo al intentar enviar. El estado del arte dice que la validacion debe ocurrir al SALIR del campo (on blur), no al intentar enviar. La diferencia para Laura es enorme: si olvida poner la hora de inicio y salta al siguiente campo, un aviso sutil junto al campo le dice "Hora de inicio obligatoria" ANTES de que intente enviar y reciba un toast generico.

**Propuesta:** Implementar validacion on-blur para los campos obligatorios del evento (titulo, fecha, hora inicio, hora fin). Mostrar `.field-error` debajo del campo al perder el foco si esta vacio. Esto transforma la experiencia de "intento enviar y descubro que falta algo" a "voy completando y la app me guia".

---

**Oportunidad 5: Busqueda integrada en tabla con scroll automatico (estado del arte, seccion 3.5)**

El doc de empatia identifica en el pain point 1.2a: "El campo de busqueda de tabla solo filtra visualmente, no scrollea hasta el resultado." Laura tiene 500 empleados y busca a "Maria Garcia" para excluirla. Escribe "Maria" en el buscador, la tabla se filtra, pero Laura no sabe si "Maria Garcia Rodriguez" esta a la vista o hay que hacer scroll.

El estado del arte (seccion 3.5) documenta que "la busqueda integrada en la tabla con filtrado en tiempo real" es un patron consolidado. Pero el patron moderno incluye scroll-to-first-match y highlight de la fila encontrada.

**Propuesta:** Al usar el buscador de tabla, la app scrollea automaticamente a la primera coincidencia y la resalta brevemente con un flash de `background: var(--accent-subtle)` que se desvanece en 400ms. Si hay multiples coincidencias, un mini-indicador "1 de 5" permite navegar con flechas arriba/abajo.

---

**Oportunidad 6: Formulario de accion formativa con divulgacion progresiva (estado del arte, seccion 2.2 + percepcion seccion 4.5)**

El doc de empatia identifica el pain point 1.6a: "El formulario de una accion tiene 20+ campos. Laura se pierde entre lo operativo y lo administrativo." La propuesta P14 (modo compacto) sugiere dos vistas: "Operativo" y "FUNDAE".

Pero el estado del arte va mas lejos (seccion 2.2): "Los wizards con una media de 5 campos por paso tienen las tasas de conversion mas altas." Y la investigacion de percepcion (hallazgo 9): "La divulgacion progresiva reduce la carga cognitiva un 40%."

La propuesta P14 del doc de empatia esta bien, pero se queda en "nice-to-have" (orden 13). Es un error de priorizacion. La sobrecarga cognitiva del formulario de acciones es un pain point diario para Laura — cada vez que crea una accion, se enfrenta a 20+ campos. Deberia estar mas arriba.

**Propuesta:** Subir P14 a should-have. Implementar con `<details>` colapsables por grupos: "Datos basicos" (titulo, tipo, modalidad, fechas, estado — siempre visible), "Participantes y sesiones" (tabla, asistencia — expandible), "Datos FUNDAE" (area profesional, nivel, grupo, tutor, centro — colapsado por defecto). Anadir un mini-semaforo en el header de cada grupo colapsado indicando si hay campos vacios requeridos dentro.

---

### 2.3 Momentos emocionales que podrian aprovecharse mejor

**Oportunidad 7: El momento post-envio — cierre emocional incompleto**

El mapa emocional del doc de empatia (seccion 4.1) muestra que el "Punto 10 — Finalizar" es de "Alivio", no de satisfaccion. Laura siente alivio porque ha terminado, pero no satisfaccion porque no tiene certeza de que todo salio bien.

La auditoria de coherencia (R9) propone invertir en el momento final. El frontend premium (3.1) propone redisenar el dialogo de confirmacion. Pero ninguno propone lo que Laura realmente quiere en ese momento: **un resumen accionable post-envio**.

Lo que Laura necesita despues de enviar no es confetti ni un check animado. Necesita:
- "Convocatoria 'PRL Oficinas Madrid' enviada a 24 personas."
- "Encuesta programada para el 20/3 a las 17:00."
- "Plazo FUNDAE: comunica inicio antes del 18/3." (con boton para ir al generador XML)
- "¿Quieres preparar la siguiente convocatoria?"

Este resumen transforma el "alivio" en "control". Laura sabe que todo esta hecho y sabe cual es el siguiente paso.

**Propuesta:** Reemplazar el toast de exito post-envio por un mini-dialog con resumen accionable. Mostrar los datos clave, los plazos FUNDAE asociados, y un boton "Siguiente convocatoria" que limpia los datos del evento pero mantiene los filtros y la seleccion.

---

**Oportunidad 8: El momento "descubrimiento de datos incompletos" — prevencion en vez de curacion**

El peak negativo del mapa emocional es "descubrir datos FUNDAE incompletos despues de configurar todo" (seccion 4.2). La propuesta P3 (semaforo de readiness FUNDAE) del doc de empatia aborda esto parcialmente — muestra el estado en la ficha de la accion formativa.

Pero el momento de maxima frustracion no es al ver la ficha de la accion — es al intentar generar el XML (pain point 1.8d). Laura ha pasado 10 minutos configurando el grupo, los participantes y los costes, y al pulsar "Generar" descubre que 3 personas no tienen NSS.

El estado del arte (seccion 2.5) documenta que en importacion masiva de datos, el patron moderno es "un paso de validacion que permite identificar y corregir errores directamente en la interfaz". El generador XML deberia tener este paso ANTES de la generacion, no como resultado de error.

**Propuesta:** Al abrir la pestana de generacion XML, si se ha seleccionado una accion formativa, ejecutar inmediatamente la validacion completa y mostrar un panel de readiness en la parte superior. No como dialog — como panel persistente que se actualiza en tiempo real mientras Laura corrige datos. Rojo = bloqueante, amarillo = aviso, verde = listo. Cada item del panel enlaza directamente al campo que falta (scroll + focus).

---

**Oportunidad 9: El momento "RRHH no me ha dado los datos" — no abordado por ningun documento**

El doc de empatia menciona de pasada que Laura "trabaja con un Excel de organigrama que recibe de RRHH mensualmente (o menos)" y que "los datos del Excel no siempre estan actualizados (altas, bajas, cambios de departamento)".

Pero ningun documento aborda lo que pasa cuando Laura carga un Excel nuevo y los datos han cambiado: empleados que ya no estan, departamentos que se han renombrado, nuevas incorporaciones. Hoy, al recargar:
- Los presets de filtros pueden dejar de funcionar (si un departamento cambio de nombre).
- Las exclusiones se pierden (estan basadas en `_id`, pero si el Excel cambia, los `_id` se regeneran).
- Las acciones formativas del catalogo siguen teniendo participantes del Excel anterior.

**Propuesta:** Al detectar cambios significativos entre el Excel anterior y el nuevo (diferente numero de empleados, columnas diferentes, NIFs que desaparecen), mostrar un resumen de cambios: "12 nuevas incorporaciones, 3 bajas, 2 cambios de departamento." Si hay participantes en el catalogo que ya no estan en el Excel nuevo, avisar: "5 participantes de acciones formativas activas no aparecen en el nuevo organigrama."

---

## 3. Propuestas de mejora

### 3.1 Resolver las incoherencias poniendo a Laura en el centro

| Incoherencia | Resolucion propuesta |
|---|---|
| Sound design sin encaje | Despriorizarlo completamente. Si se implementa alguna vez, limitarlo a un solo sonido (envio exitoso) y que sea opt-in con default OFF. No invertir tiempo de desarrollo ahora. |
| Confetti en cola | Sustituir por resumen visual post-cola: cuantas convocatorias, cuantos asistentes, encuestas programadas, plazos FUNDAE. Check animado sutil (SVG draw), sin confetti. |
| Cmd+K como "muy alto impacto" | Reclasificar como impacto medio para Laura. Implementar despues de las propuestas funcionales. Si se implementa, poblar con acciones que Laura usa (buscar empleado, ir a accion formativa, aplicar preset) en vez de acciones de navegacion entre pestanas. |
| Atencion al primer contacto | Redirigir inversion al "momento de retorno": mejorar el banner de restauracion de sesion, mostrar alertas FUNDAE pendientes al abrir, indicar si hay cola sin lanzar. |
| Migrar estilos inline | Mantener como tarea tecnica, no como propuesta de valor. No incluir en comunicacion de mejoras. |
| Empty states para tabla | Invertir el esfuerzo: dedicar el 80% al panel de calidad de datos (estado "cargado con problemas") y el 20% al empty state (estado "sin datos"). |
| Templates triplicados | Unificar en un unico concepto de "plantilla" que guarda todo: filtros, exclusiones, datos del evento, vinculacion al catalogo. Un dropdown, un boton "Guardar plantilla", un boton "Cargar plantilla". |
| Renombrar la app | No priorizar. Si se hace, que sea como parte de un rediseno del header, no como tarea aislada. |

### 3.2 Nuevas propuestas que surgen del cruce de pain points con estado del arte

#### NP1: Convocatoria por lotes (una formacion, multiples ubicaciones)

**Escenario:** Laura quiere enviar "PRL Oficinas" a Madrid, Barcelona y Valencia. Misma formacion, mismo formador, misma fecha, tres grupos de asistentes definidos por ubicacion.

**Propuesta:** Nuevo modo "Envio por lotes" accesible desde un boton en la action bar. Al activarlo:
1. Laura configura los datos del evento una sola vez.
2. Selecciona un campo de agrupacion (Ubicacion, Departamento, Empresa).
3. La app muestra un preview: "Se crearan 3 convocatorias: Madrid (28 personas), Barcelona (15 personas), Valencia (22 personas)."
4. Laura puede excluir grupos o personas individualmente.
5. Al confirmar, las 3 convocatorias se anaden a la cola.

**Conecta con:** Pain point 1.4c (series tediosas), escenario 4.1 del mapa emocional (punto 5: frustracion al repetir para 3 centros), estado del arte seccion 2.5 (entrada de datos masiva).
**Esfuerzo:** Medio (4-5h). La logica de filtrado y cola ya existe.
**Impacto para Laura:** Muy alto. Convierte una tarea de 15 minutos (configurar 3 veces) en 3 minutos (configurar una vez).

---

#### NP2: Panel de calidad de datos con edicion in situ

**Propuesta ampliada de P1:** No solo mostrar los problemas — permitir corregirlos.

Al cargar el Excel, si hay problemas detectados (emails invalidos, NIFs duplicados, empleados sin email):
1. Mostrar un panel lateral colapsable con todos los problemas agrupados por tipo.
2. Cada problema es clickable: al hacer click en "maria.garcia@invalid", la app abre un mini-editor inline con el campo editable.
3. Las correcciones se aplican a los datos en memoria (no al Excel).
4. Se persisten en localStorage como `convocatoria_corrections` para que sobrevivan a la sesion.
5. Al recargar un Excel nuevo, se intentan reaplicar las correcciones (match por NIF) y se avisa si alguna ya no aplica.

**Conecta con:** Pain point 1.1d (edicion in situ), estado del arte seccion 2.5 (reencuadrar al usuario como revisor), estado del arte seccion 2.3 (validacion contextual).
**Esfuerzo:** Medio-alto (5-6h). Requiere estructura de datos para correcciones y logica de merge.
**Impacto para Laura:** Alto. Elimina el bucle Excel-recargar-perder filtros que hoy ocurre cada vez que hay un dato incorrecto.

---

#### NP3: Indicador de guardado y estado de sesion

**Propuesta:** Tres micro-mejoras que dan tranquilidad a Laura:

1. **Indicador de ultimo guardado:** Texto discreto en el pie del panel izquierdo: "Guardado hace 2 min" que parpadea brevemente al guardar. Estilo Google Docs.
2. **Banner de sesion pendiente:** Al abrir la app con cola no vacia o con datos de evento a medio rellenar, mostrar un banner sticky: "Tienes 2 convocatorias en cola y 1 evento sin enviar del 13/3. [Continuar] [Empezar de nuevo]".
3. **Indicador de sesion en el header:** Un icono discreto (circulo verde) junto al nombre del fichero cargado que indica "datos guardados y actualizados".

**Esfuerzo:** Bajo (2h).
**Impacto para Laura:** Medio-alto. Reduce la ansiedad de "¿se habra guardado?" y la confusion de "¿que estaba haciendo ayer?".

---

#### NP4: Resumen de cambios al recargar organigrama

**Propuesta:** Al cargar un nuevo Excel cuando ya existian datos en sesion:
1. Comparar el Excel nuevo con los datos anteriores (por NIF).
2. Mostrar un resumen: "15 nuevas incorporaciones, 2 bajas, 4 cambios de departamento/ubicacion."
3. Si hay participantes en el catalogo que ya no estan en el nuevo Excel: "Atencion: 3 participantes de acciones formativas activas no aparecen en el nuevo organigrama: Juan Perez (PRL-001), Ana Lopez (LOPD-002)..."
4. Si hay presets de filtros que ahora dan 0 resultados: "El preset 'Dpto. Marketing Madrid' ahora coincide con 0 empleados. Posible cambio en el organigrama."

**Esfuerzo:** Medio (3-4h).
**Impacto para Laura:** Alto. Previene el descubrimiento tardio de que el organigrama cambio y los datos del catalogo ya no cuadran.

---

#### NP5: Validacion on-blur en datos del evento

**Propuesta:** Al salir de un campo obligatorio vacio (titulo, fecha, hora inicio, hora fin), mostrar un mensaje inline `.field-error` debajo del campo: "Este campo es obligatorio". Al rellenarlo, el mensaje desaparece con transicion suave.

No usar rojo agresivo — usar el color `--warning` para campos vacios (no son errores, son incompletos) y reservar `--danger` para valores invalidos (ej: hora de fin anterior a hora de inicio).

**Esfuerzo:** Bajo (1-2h).
**Impacto para Laura:** Medio. Reduce el numero de intentos fallidos de envio.

---

### 3.3 Ajustes a propuestas existentes

**P1 (Panel de calidad de datos) → Ampliar con edicion (ver NP2)**

**P3 (Semaforo readiness FUNDAE) → Adelantar a la pestana XML**
No esperar a que Laura abra la ficha de la accion. Mostrar el semaforo en la pestana de generacion XML como panel superior persistente. Esto intercepta el peak negativo en el momento justo.

**P5 (Vista previa de convocatoria) → Anadir resumen post-envio**
La vista previa antes de enviar es importante, pero el resumen post-envio (ver Oportunidad 7) es igual de valioso. Combinar ambos: preview antes, resumen despues.

**P9 (Alertas proactivas) → Ampliar al momento de apertura**
No solo un banner en la pestana de Convocatoria. Al abrir la app, si hay plazos FUNDAE en las proximas 48 horas, mostrar un dialog no-bloqueante con los plazos pendientes. Laura puede cerrarlo con un click, pero lo ha visto.

**P14 (Modo compacto acciones) → Subir a should-have**
Es un pain point diario, no un nice-to-have. La sobrecarga cognitiva de 20+ campos afecta a Laura cada vez que interactua con el catalogo.

**Frontend-premium 4.1 (Empty states tabla) → Simplificar**
En vez de 3 variantes elaboradas, hacer una variante principal ("Carga tu organigrama") y un estado de "sin resultados de filtro" con link "Limpiar filtros". La tercera variante (todos excluidos) es un edge case que puede resolverse con un toast.

**Frontend-premium 3.3 (Barra de progreso en cola) → SI, pero con item-tracking**
La barra de progreso es necesaria, pero lo que Laura realmente necesita es saber CUALES se han enviado y cuales no. Marcar cada item de la cola con un check o un X a medida que se procesa. Si el pop-up se bloquea, Laura puede ver exactamente donde se quedo.

---

## 4. Priorizacion revisada: las 10 propuestas mas impactantes PARA LAURA

Priorizadas por impacto real en el dia a dia de Laura, no por percepcion estetica ni por dificultad tecnica.

| # | Propuesta | Origen | Impacto para Laura | Esfuerzo | Justificacion |
|---|-----------|--------|---------------------|----------|---------------|
| 1 | **Semaforo de readiness FUNDAE en pestana XML** | P3 (empatia) + ajuste | Muy alto | Medio (4-5h) | Elimina el peak negativo mas intenso del flujo: descubrir datos incompletos al generar. Previene 15+ minutos de frustracion por cada generacion fallida. Laura genera XML al menos 2 veces al mes para cada accion formativa. |
| 2 | **Panel de calidad de datos con edicion in situ** | P1 (empatia) + NP2 (nueva) | Muy alto | Medio-alto (5-6h) | Elimina el bucle Excel-recargar-perder filtros. Convierte problemas efimeros (toasts de 5 segundos) en problemas accionables. Laura carga el Excel al menos 1 vez por semana. |
| 3 | **Duplicar accion formativa** | P4 (empatia) | Alto | Bajo (1-2h) | Ahorra 5-10 minutos por accion duplicada. Para las 30+ acciones anuales similares de Laura (PRL en 3 centros, compliance para 4 sociedades), el ahorro acumulado es de horas. |
| 4 | **Busqueda flexible de hoja en Excel** | P11 (empatia) | Alto | Bajo (1h) | Elimina la peor primera impresion posible. Si RRHH cambia el nombre de la hoja, Laura no se queda bloqueada. Coste de oportunidad altisimo: si falla aqui, Laura no llega a ninguna otra mejora. |
| 5 | **Convocatoria por lotes** | NP1 (nueva) | Muy alto | Medio (4-5h) | Convierte la tarea mas repetitiva de Laura (misma formacion para N ubicaciones) de 15 minutos a 3. Es la propuesta con mayor ratio de ahorro de tiempo por esfuerzo de implementacion. |
| 6 | **Vista previa + resumen post-envio** | P5 (empatia) + Oportunidad 7 | Alto | Medio (4h) | Reduce el miedo a errores antes de enviar y da cierre emocional despues. Conecta el envio con los plazos FUNDAE (siguiente paso). Laura envia al menos 3-5 convocatorias por semana. |
| 7 | **Alertas proactivas al abrir la app** | P9 (empatia) + ajuste | Alto | Bajo (1-2h) | Previene incumplimiento de plazos FUNDAE (potencial sancion). Laura no abre el dashboard cada dia. Las alertas deben ir a ella, no esperar a que ella las busque. |
| 8 | **Barra de progreso en cola con tracking de items** | 3.3 (frontend) + ajuste | Alto | Medio (3h) | Transforma el momento de mayor ansiedad (lanzar cola con 5+ convocatorias) en un proceso controlable. Laura sabe exactamente que se envio y que no. |
| 9 | **Modo compacto para formulario de acciones** | P14 (empatia), subido de prioridad | Medio-alto | Medio (3h) | Reduce la sobrecarga cognitiva de 20+ campos a 5-7 campos operativos. Laura interactua con el formulario de acciones al menos 2-3 veces por semana. |
| 10 | **Recordatorios automaticos** | P7 (empatia) | Alto | Medio (3-4h) | Es la tarea manual mas frecuente que Laura hace FUERA de la app. Cada recordatorio manual le cuesta 5-10 minutos en Outlook (buscar la convocatoria anterior, copiar asistentes, redactar email). Con 3-5 formaciones semanales, son 15-50 minutos semanales eliminados. |

### Propuestas descartadas o depriorizadas respecto a otros documentos

| Propuesta | Documento original | Razon de depriorizacion |
|---|---|---|
| Sound design (4 sonidos) | frontend-premium 9.1 | No encaja con el contexto de oficina de Laura. Impacto nulo. |
| Confetti en cola | frontend-premium 3.2 | Trivializa el trabajo de Laura. Sustituido por resumen post-envio. |
| Cmd+K como prioridad 1 | frontend-premium 7.1 | Laura no usa atajos. Impacto medio, no muy alto. |
| Refinar shadow-accent | frontend-premium 1.4 | Imperceptible para Laura. |
| Hover mejorado filtros | frontend-premium 2.2 | No resuelve ningun pain point documentado. |
| Renombrar la app | coherencia R1 | Impacto nulo para la usuaria existente. |
| Migrar estilos inline | coherencia R6 | Tarea tecnica sin beneficio para Laura. |
| PDF de convocatoria | frontend-premium 10.1 | Laura envia por Outlook, no por PDF. Nice-to-have real. |

---

## 5. Conclusion

Los cinco documentos analizados contienen un total de 47 propuestas (16 empatia + 20 frontend + 11 coherencia). De esas 47, solo 14 abordan directamente los pain points documentados de Laura. El resto mejoran la percepcion estetica, la arquitectura interna o la experiencia de un hipotetico usuario nuevo.

Las tres brechas mas criticas son:

1. **La brecha de la repeticion.** Laura repite la misma configuracion para multiples ubicaciones/departamentos y ningun documento (excepto el de empatia, tangencialmente) propone automatizar esto. La propuesta NP1 (lotes por ubicacion) es la que mas tiempo real le ahorraria.

2. **La brecha de la prevencion.** Los documentos proponen mejorar como se muestran los errores (toasts mejorados, empty states, errores contextuales), pero pocas propuestas previenen el error antes de que ocurra. El semaforo de readiness (P3) y la validacion on-blur (NP5) son las excepciones — y deberian ser la regla.

3. **La brecha del cierre.** Laura termina su flujo de trabajo con un toast de 6 segundos. No tiene resumen, no tiene conexion con el siguiente paso (plazo FUNDAE), no tiene certeza de que todo salio bien. Los documentos de frontend proponen animaciones de exito; Laura necesita informacion de cierre.

La aplicacion ya es buena. Lo que la hara excelente para Laura no es confetti, sonido ni paleta de comandos — es que le diga "te faltan 3 NSS", que le permita corregir un email sin recargar el Excel, y que le prepare 3 convocatorias de PRL con un solo click.
