# Investigacion UX: Empatia con la Gestora de Formacion

**Fecha:** 14 de marzo de 2026
**Tipo:** Investigacion de usuario, analisis de flujos, propuestas de mejora
**Usuaria principal:** Gestora de formacion en empresa espanola con multiples sociedades
**Aplicacion analizada:** `convocatoria.html` (~15.500 lineas, single-file, sin servidor)

---

## 0. Perfil de la usuaria

**Nombre arquetipico:** Laura, 38 anos, responsable de formacion en un grupo empresarial espanol con 4-6 sociedades y ~500-2.000 empleados.

**Su dia a dia:**
- Gestiona entre 30 y 80 acciones formativas al ano.
- Trabaja con un Excel de organigrama que recibe de RRHH mensualmente (o menos).
- Coordina con 10-20 proveedores externos, negocia presupuestos.
- Lucha con plazos FUNDAE: comunicaciones de inicio (5 dias habiles antes), finalizacion (5 dias habiles despues), bonificaciones.
- Envia convocatorias a empleados via Outlook, una a una o en lotes.
- Controla asistencia, encuestas de satisfaccion, certificados.
- Rinde cuentas a Direccion con informes de horas, credito consumido, cobertura formativa.
- Gestiona simultaneamente formaciones obligatorias (PRL, compliance), voluntarias, y de desarrollo.

**Sus frustraciones cronicas:**
- FUNDAE cambia reglas y formularios sin previo aviso.
- Los empleados no confirman asistencia.
- Los mandos intermedios piden formacion "para ayer".
- Los datos del Excel no siempre estan actualizados (altas, bajas, cambios de departamento).
- Pierde tiempo en tareas repetitivas: misma formacion, mismo publico, diferente fecha.

---

## 1. Analisis de pain points por flujo

### 1.1 Carga de datos desde Excel

**Flujo actual:**
1. Arrastra o selecciona un Excel.
2. La app busca la hoja `ORGANIGRAMA`.
3. Filtra empleados activos (`Alta/Baja = 1`).
4. Muestra toast con estadisticas (empleados sin email, NIFs duplicados, etc.).
5. Si hay sesion previa en localStorage, ofrece restaurarla.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.1a | **El Excel debe llamarse exactamente "ORGANIGRAMA".** Si RRHH cambia el nombre de la hoja, la carga falla con un error críptico. Laura no sabe por que. | Alta | Frustracion, inseguridad |
| 1.1b | **No hay feedback de progreso.** Para Excels grandes (>2.000 filas), el spinner no indica cuanto falta. Laura no sabe si la app se ha colgado. | Media | Ansiedad |
| 1.1c | **Los avisos de calidad de datos desaparecen.** Los toasts de NIFs duplicados o emails invalidos duran 4-6 segundos. Si Laura no los lee a tiempo, pierde esa informacion. No hay manera de revisar esos problemas despues. | Alta | Inseguridad ("¿habia algo mal y no lo vi?") |
| 1.1d | **El organigrama no se puede editar in situ.** Si un email esta mal o falta, Laura tiene que volver al Excel, corregirlo, y recargar. Cada recarga resetea filtros y seleccion. | Alta | Frustracion, perdida de tiempo |
| 1.1e | **Dependencia de un unico fichero Excel.** Si Laura gestiona varias empresas que no comparten un unico organigrama, no hay manera de combinar varios Excels. | Media | Limitacion |

**Momento emocional:** Este es el primer contacto de Laura con la app. Si algo falla aqui (hoja no encontrada, cero empleados), la primera impresion es negativa y todo lo que sigue queda teñido por la regla del pico-final (Kahneman).

---

### 1.2 Filtrado y seleccion de asistentes

**Flujo actual:**
1. Los filtros aparecen tras cargar datos (Empresa, Departamento, Ubicacion, Puesto).
2. Dropdowns con checkboxes y typeahead.
3. Presets para guardar combinaciones de filtros.
4. Plantillas completas (filtros + datos de evento).
5. Posibilidad de anadir lista externa (otro Excel con columna NIF).
6. Boton "Cargar desde Accion Formativa" para sincronizar con el catalogo.
7. La tabla muestra empleados filtrados; se pueden excluir individualmente con checkboxes.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.2a | **No hay busqueda rapida de empleados.** Si Laura quiere anadir a "Maria Garcia" especificamente, tiene que buscarla en la tabla con Ctrl+F o el campo de busqueda de tabla (que solo filtra visualmente, no selecciona). | Media | Friccion en tarea frecuente |
| 1.2b | **Los presets solo guardan filtros, no la seleccion individual.** Si Laura excluye 3 personas manualmente, eso no se guarda en el preset. Al recargar el preset, tiene que volver a excluirlas. | Alta | Repeticion frustrante |
| 1.2c | **No hay "seleccion inversa" ni "seleccionar solo estos".** Si Laura tiene una lista de 15 NIFs que deben asistir, no puede pegarlos para seleccionar solo esos. Tiene que filtrar manualmente o usar la lista externa, que es un proceso de mas pasos. | Media | Fricccion |
| 1.2d | **El boton "Cargar desde Accion Formativa" es poco visible.** Esta al final de la seccion de filtros, en linea con otros links. Laura puede no descubrirlo. | Media | Funcionalidad oculta |
| 1.2e | **Los chips de filtros activos no son interactivos.** Se muestran en la summary bar pero no se pueden clickar para modificar o eliminar filtros individuales. | Baja | Pequeña friccion |

---

### 1.3 Datos del evento

**Flujo actual:**
1. Seleccionar plantilla o formacion recurrente (dropdown).
2. Rellenar: titulo, fecha, hora inicio/fin, presencial/Teams, ubicacion, instrucciones, formador.
3. Opcion de "Serie de sesiones" (repetir semanalmente o fechas manuales).
4. Checkbox de "Enviar encuesta de satisfaccion al finalizar".

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.3a | **No hay vinculacion automatica con el catalogo de acciones.** Si Laura tiene una accion "PRL-001" en el catalogo con proveedor, tutor y centro, al crear la convocatoria tiene que rellenar todo manualmente o usar una plantilla. La relacion es solo por nombre (titulo = nombre accion). | Alta | Trabajo duplicado |
| 1.3b | **Las plantillas no incluyen la fecha.** Correcto por diseno, pero el toast "Ajusta la fecha" es facil de pasar por alto. No hay indicacion visual en el campo de fecha de que necesita atencion. | Media | Riesgo de error |
| 1.3c | **No hay selector de proveedor/centro/tutor desde el catalogo.** El campo "Formador/a" es texto libre. Si Laura tiene 15 tutores en el catalogo, tiene que recordar o buscar el nombre. | Media | Friccion, inconsistencia |
| 1.3d | **No hay previa del email de convocatoria.** Laura no sabe exactamente como se vera la invitacion en Outlook hasta que la abre. Si algo esta mal (titulo incorrecto, ubicacion faltante), tiene que cancelar y volver. | Alta | Inseguridad, miedo a errores |
| 1.3e | **La configuracion de series es limitada.** Solo permite repetir "cada semana" o fechas manuales. No hay opcion de repetir cada 2 semanas, mensualmente, ni de excluir festivos. | Media | Limitacion para formaciones largas |

---

### 1.4 Generacion y envio de convocatorias

**Flujo actual:**
1. Click en "Abrir en Outlook" → dialogo de confirmacion con resumen.
2. Deteccion de conflictos de agenda (solapamiento con otras convocatorias enviadas).
3. Deteccion de duplicados (misma formacion+fecha ya enviada).
4. Avisos FUNDAE no bloqueantes (falta centro, tutor, participantes).
5. Se abre una nueva pestana con deeplink a Outlook Web.
6. Si hay mas de 50 asistentes, los emails se copian al portapapeles.
7. Para series: se abren secuencialmente con un dialogo "Siguiente sesion".
8. Se registra en historial y se sincroniza con la accion formativa del catalogo.
9. Se programa la encuesta de satisfaccion via webhook a Power Automate.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.4a | **El deeplink de Outlook tiene limite de URL.** Para >50 asistentes, Laura tiene que pegar emails manualmente en el campo "Para". Es torpe y propenso a errores. | Alta | Frustracion recurrente |
| 1.4b | **No hay confirmacion de que Outlook abrio correctamente.** La app no sabe si el usuario realmente envio la convocatoria. El historial la marca como "enviada" aunque Laura haya cerrado la pestana sin enviar. | Alta | Datos de historial poco fiables |
| 1.4c | **El flujo de series es tedioso.** Para una serie de 8 sesiones, Laura tiene que pulsar "Siguiente" 7 veces, esperar a que se abra Outlook, y completar cada una. Si la ventana emergente se bloquea por el bloqueador de pop-ups, se interrumpe todo. | Alta | Frustracion extrema en formaciones largas |
| 1.4d | **La encuesta se programa al enviar, no al finalizar la formacion.** Si Laura envia la convocatoria 2 semanas antes y luego cambia la fecha, la encuesta queda programada para la fecha original. | Media | Riesgo de encuesta a destiempo |
| 1.4e | **No hay opcion de enviar recordatorios.** Si la formacion es el proximo lunes, Laura no puede enviar un recordatorio automatico el viernes anterior. | Alta | Necesidad muy comun no cubierta |

---

### 1.5 Gestion de la cola de convocatorias

**Flujo actual:**
1. "Anadir a cola" guarda la convocatoria con sus asistentes y datos.
2. La queue bar aparece encima de la tabla.
3. "Lanzar cola" abre todas las convocatorias secuencialmente.
4. Panel lateral con detalle de cada item (reordenable por drag).

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.5a | **No se pueden editar items en cola.** Si Laura anade una convocatoria y luego se da cuenta de que falta un asistente o la hora es incorrecta, tiene que eliminarla y recrearla. | Alta | Trabajo repetido |
| 1.5b | **Al lanzar la cola, si un pop-up se bloquea, no hay recuperacion.** Laura pierde la cuenta de cuales se enviaron y cuales no. | Media | Ansiedad |
| 1.5c | **La cola no muestra un resumen total.** Laura no ve de un vistazo "3 convocatorias, 87 asistentes totales, para el 15/3, 16/3 y 17/3". | Baja | Falta de vision rapida |

---

### 1.6 Catalogos FUNDAE (Proveedores, Centros, Tutores, Acciones)

**Flujo actual:**
1. Pestana dedicada con sub-pestanas por tipo de registro.
2. Vista ficha (izq: lista + busqueda, der: formulario detallado) y vista lista (tabla editable con filtros).
3. Importacion/exportacion JSON y Excel.
4. Las acciones formativas tienen: datos FUNDAE, participantes vinculados, asistencia por sesion, confirmaciones, notas.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.6a | **Hay demasiados campos en las acciones formativas.** El formulario de una accion tiene 20+ campos, muchos de ellos solo relevantes para FUNDAE. Laura se pierde entre lo operativo (fechas, participantes) y lo administrativo (codigo, area profesional, nivel formacion). | Alta | Sobrecarga cognitiva |
| 1.6b | **No hay estados claros de progreso.** El campo "estado" es un select manual (En preparacion, En marcha, Terminada, Anulada). Laura tiene que actualizarlo a mano. La app intenta hacer auto-transicion, pero no es transparente. | Media | Inseguridad sobre el estado real |
| 1.6c | **La vinculacion de participantes es por NIF.** Si el organigrama no esta cargado, Laura no puede ver quienes son. Solo ve NIFs. | Alta | Deshumanizacion, dificultad de verificacion |
| 1.6d | **El control de asistencia es basico.** Una matriz de checkboxes (sesiones x participantes). No hay vista rapida de "quien no ha venido nunca" ni "quien lleva 2 faltas consecutivas". | Media | Tarea tediosa sin insights rapidos |
| 1.6e | **No hay duplicado rapido de acciones.** Si Laura tiene "PRL Oficinas Madrid" y quiere crear "PRL Oficinas Barcelona" con los mismos datos pero diferente centro y participantes, tiene que crear desde cero. | Alta | Trabajo repetitivo evitable |

---

### 1.7 Cuadro de Mando (Dashboard)

**Flujo actual:**
1. KPIs principales: acciones, horas, participantes, presupuesto, credito FUNDAE.
2. Alertas FUNDAE (plazos de comunicacion de inicio/fin).
3. Timeline de plazos con botones "Marcar enviada" y "Generar XML".
4. Graficos: credito por empresa, distribucion por modalidad, estacionalidad, completitud del catalogo.
5. Modulos de analytics: asistencia, confirmaciones, riesgo, ROI, cobertura, equidad, por responsable, formacion cruzada.
6. Filtros globales: empresa, periodo, estado.
7. Busqueda de empleado individual.
8. Exportacion de informe.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.7a | **El dashboard es abrumador.** Con 15+ tarjetas y graficos, Laura no sabe donde mirar primero. El modo "Resumen" ayuda, pero el dashboard completo requiere scroll extenso. | Media | Sobrecarga, "esto no es para mi" |
| 1.7b | **Las alertas no son proactivas.** Laura tiene que abrir el dashboard para ver los avisos. No hay notificaciones al abrir la app ni en la pestana de Convocatoria. | Alta | Riesgo de perder plazos FUNDAE |
| 1.7c | **La busqueda de empleado es poco util.** Muestra todas las acciones de un empleado, pero no hay un "perfil formativo" con historico, horas acumuladas, carencias. | Media | Informacion parcial |
| 1.7d | **El informe exportado es basico.** No hay opcion de personalizar que datos incluir ni de generar informes periodicos automatizados. | Media | Necesidad de informes manuales complementarios |

---

### 1.8 Generacion de XML FUNDAE

**Flujo actual:**
1. Seleccionar accion formativa del catalogo.
2. Rellenar datos del grupo (ID, responsable, telefono, etc.).
3. Seleccionar centro y tutor de los catalogos.
4. Definir calendario y costes.
5. Tabla de participantes (editable: tipo doc, categoria, nivel estudios, diploma, coste/hora, discapacidad).
6. Generar XML individual (Accion, Inicio, Finalizacion) o ZIP con los 3.
7. Validacion con errores/avisos.
8. Exportacion Excel FUNDAE.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.8a | **Es el flujo mas complejo de la app.** Requiere que todo este perfectamente configurado: catalogo de acciones completo, proveedores con CIF, tutores con datos personales, participantes con NSS, grupo cotizacion, etc. Cualquier dato faltante bloquea la generacion. | Alta | Ansiedad, sensacion de "nunca esta todo listo" |
| 1.8b | **No hay auto-relleno de datos del grupo.** Laura tiene que escribir el ID del grupo, el responsable, el telefono cada vez. Estos datos son casi siempre los mismos. | Media | Repeticion innecesaria |
| 1.8c | **Los costes salariales se calculan con un boton, pero el resultado no se explica.** Laura ve un numero pero no sabe como se calculo (que coste/hora se uso para cada participante, cuantas horas). | Media | Desconfianza en el calculo |
| 1.8d | **No hay validacion preventiva.** Laura descubre errores solo al generar. Seria mejor ver un "semaforo" de readiness antes de intentar generar. | Alta | Frustracion por errores de ultimo momento |

---

### 1.9 Calendario

**Flujo actual:**
1. Vista Gantt con barras de colores por estado.
2. Zoom: mes, trimestre, ano.
3. Filtros por estado, agrupacion (departamento, estado, modalidad), busqueda de empleado.
4. Split view: Gantt arriba, tabla abajo.
5. Detalle al hacer click en una barra.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.9a | **El calendario solo muestra acciones del catalogo.** Las convocatorias enviadas que no estan vinculadas a una accion no aparecen. | Alta | Vision incompleta |
| 1.9b | **No hay exportacion a calendario externo.** Laura no puede sincronizar con su Outlook o Google Calendar. | Media | Duplicacion de trabajo |
| 1.9c | **No hay drag-and-drop para reprogramar.** Si Laura quiere mover una formacion del 15 al 22, tiene que editar la accion en el catalogo. | Baja | Rigidez |

---

### 1.10 Encuestas de satisfaccion

**Flujo actual:**
1. Se programa automaticamente al enviar una convocatoria (si el checkbox esta activado).
2. Usa un webhook a Power Automate que envia un email con link a Microsoft Forms.
3. El email incluye la formacion, formador y fecha como contexto.
4. Se programa para la hora de fin del evento.

**Pain points identificados:**

| # | Problema | Severidad | Impacto emocional |
|---|---------|-----------|-------------------|
| 1.10a | **No hay visibilidad de respuestas.** Laura no sabe cuantas personas respondieron ni los resultados sin ir a Microsoft Forms manualmente. | Alta | Falta de cierre del ciclo |
| 1.10b | **No se pueden reenviar encuestas.** Si un empleado no contesta, Laura no puede enviar un recordatorio desde la app. | Media | Limitacion operativa |
| 1.10c | **La configuracion del webhook es tecnica.** Laura necesita crear un flujo en Power Automate, configurar URLs, IDs de pregunta. El dialogo de instrucciones ayuda, pero es intimidante. | Alta | Barrera de adopcion |

---

## 2. Momentos de deleite vs. frustracion

### 2.1 Momentos de deleite (donde la app ya brilla)

1. **Restauracion de sesion automatica.** Al abrir la app, Laura ve sus datos de ayer con un click. Esto ahorra 2-3 minutos diarios. Probablemente el feature mas valorado inconscientemente.

2. **Deteccion de conflictos de agenda.** La app avisa si un asistente ya tiene otra formacion a la misma hora. Esto previene errores vergonzosos. Momento de "la app me cuida".

3. **Deteccion de duplicados.** "Ya enviaste esta convocatoria el 5/3 a 24 personas." Esto previene reenvios accidentales. Confianza.

4. **Plantillas completas (filtros + evento).** Para formaciones mensuales recurrentes, Laura solo cambia la fecha. Ahorro de 5-10 minutos por convocatoria.

5. **Sincronizacion automatica convocatoria-accion.** Al enviar, la app vincula automaticamente los participantes y sesiones de asistencia con la accion del catalogo. Esto elimina doble entrada de datos.

6. **Avisos FUNDAE con plazos calculados.** El dashboard muestra "PRL-001 empieza en 3 dias, comunica inicio a FUNDAE" con boton directo para generar XML. Esto es extremadamente valioso.

7. **El greeting contextual.** "Buenos dias" vs "Buenas tardes" en el empty state. Detalle sutil que humaniza la herramienta.

8. **Los skeleton screens en el dashboard.** Siguiendo la investigacion, la app usa shimmer loading en lugar de spinners. Laura percibe el dashboard como mas rapido.

### 2.2 Momentos de frustracion (donde la app pierde a Laura)

1. **El momento "50+ asistentes".** Laura tiene que copiar/pegar emails manualmente. Este es probablemente el mayor pain point recurrente para formaciones masivas. El flow se interrumpe abruptamente.

2. **Series de 8+ sesiones.** Click "Siguiente" 7 veces, esperar, verificar, repetir. Laura probablemente abre el movil mientras espera. Momento de "esto deberia ser automatico".

3. **Error de hoja ORGANIGRAMA no encontrada.** Tras 30 segundos de carga, un toast rojo que dice "No se ha encontrado la hoja ORGANIGRAMA". Laura no sabe que hacer. Momento de "la app me odia".

4. **Formulario de accion formativa.** 20+ campos, la mitad solo relevantes para generar XML. Laura no sabe cuales son obligatorios. Momento de "estoy rellenando esto para nada".

5. **Buscar un empleado concreto para excluirlo.** 500 empleados en la tabla, scroll interminable. El campo de busqueda filtra visualmente pero no scrollea hasta el resultado. Momento de "donde esta Maria Garcia".

6. **Generar XML y descubrir que faltan datos.** Laura ha pasado 10 minutos configurando todo y al final descubre que 3 participantes no tienen NSS. Tiene que ir al catalogo, buscar cada uno, completar datos, volver. Momento de abandono.

---

## 3. Workflows ausentes

### 3.1 Workflows criticos que faltan

| # | Workflow | Impacto | Justificacion |
|---|---------|---------|---------------|
| 3.1a | **Recordatorios automaticos** | Alto | Laura necesita enviar un recordatorio 2-3 dias antes de la formacion. Ahora lo hace manualmente en Outlook. Con el historial que ya tiene la app, esto se podria automatizar via Power Automate. |
| 3.1b | **Confirmacion de asistencia** | Alto | Laura necesita saber quien va a venir antes de la formacion. Un flujo de "enviar email de confirmacion" con link para confirmar/declinar seria transformador. |
| 3.1c | **Gestion de listas de espera** | Medio | Si una formacion tiene aforo limitado, Laura no puede definir un maximo y tener una lista de espera automatica. |
| 3.1d | **Seguimiento post-formacion** | Alto | Despues de la formacion: encuesta (ya existe), pero tambien evaluacion de conocimientos, seguimiento a 30/60/90 dias, certificados de finalizacion. |
| 3.1e | **Informes programados** | Medio | Laura necesita enviar a Direccion un informe mensual/trimestral. Ahora lo hace manualmente exportando datos y formateando en Excel/PowerPoint. |
| 3.1f | **Integracion con calendario** | Medio | Exportar las formaciones como archivo .ics para importar en Outlook/Google Calendar. |

### 3.2 Integraciones que ahorrian tiempo

| Integracion | Beneficio | Viabilidad |
|-------------|-----------|------------|
| **FUNDAE portal** | Subir XMLs directamente en lugar de descargar + subir manualmente | Baja (FUNDAE no tiene API publica) |
| **Outlook/Exchange** | Enviar convocatorias sin deeplink, gestionar respuestas | Media (requiere Graph API) |
| **SharePoint/OneDrive** | Almacenar certificados generados, compartir informes | Media |
| **Teams** | Crear reuniones de Teams automaticamente para formaciones online | Media (Graph API) |
| **SAP/Meta4/A3Nom** | Importar organigrama automaticamente en lugar de depender de Excel | Baja (cada cliente tiene diferente ERP) |

### 3.3 Reporting ausente

- **Informe de cumplimiento normativo:** Que formaciones obligatorias (PRL, LOPD, etc.) tienen todos los empleados cubiertos y cuales no.
- **Informe de coste per capita por departamento:** Cuanto se invierte en formacion por empleado en cada area.
- **Historico interanual:** Comparativa de horas/presupuesto/participantes con el ano anterior.
- **Informe para la RLT:** Datos de formacion para la representacion legal de los trabajadores (obligatorio por ley en muchos convenios).

---

## 4. Mapa emocional de una sesion tipica

### 4.1 Escenario: Laura prepara 3 convocatorias de PRL para 3 centros de trabajo

```
Emocion
  ^
  |
5 |                              *                                        *
  |                           (Deleite)                               (Alivio)
4 |   *
  | (Bien)
3 |        *        *                    *                 *
  |     (OK)      (OK)               (Neutro)          (Neutro)
2 |                    *                                        *
  |                 (Tension)                              (Cansancio)
1 |                        *    *
  |                    (Frustr.) (Frustr.)
  +-----------------------------------------------------------------> Tiempo
    Abrir   Cargar  Filtrar  Datos   Cola   Lanzar  Serie  Hecho   XML
    app     Excel   dept.    evento  x3     cola    Outlook        FUNDAE
```

**Punto 1 — Abrir la app (Bien):** Laura abre el HTML, ve sus datos restaurados. Confortable.

**Punto 2 — Cargar Excel (OK):** Si el Excel no ha cambiado, usa la sesion anterior. Si ha cambiado, carga el nuevo. Proceso rapido.

**Punto 3 — Filtrar departamento (OK):** Selecciona "Centro Madrid" en filtro de ubicacion. Rapido, funciona bien.

**Punto 4 — Datos del evento (Tension):** Laura carga la plantilla recurrente "PRL Oficinas". Rellena la fecha. Quiere verificar que el formador es el correcto pero no puede consultarlo desde aqui sin ir al catalogo.

**Punto 5 — Repetir para 3 centros (Frustracion):** Laura tiene que cambiar el filtro de ubicacion, verificar asistentes, anadir a cola, y repetir 2 veces mas. Son 3 convocatorias identicas excepto por la ubicacion y los asistentes. No hay "lote por ubicacion".

**Punto 6 — Rellenar datos FUNDAE (Frustracion):** Laura descubre que 5 empleados nuevos no tienen NSS ni grupo de cotizacion en el Excel. Tiene que contactar a RRHH.

**Punto 7 — Anadir a cola (Deleite):** Las 3 convocatorias estan en cola. Laura ve el resumen. Momento de satisfaccion.

**Punto 8 — Lanzar cola (Neutro a Tenso):** Se abren 3 pestanas de Outlook secuencialmente. El bloqueador de pop-ups avisa. Laura tiene que permitirlos y volver a intentar.

**Punto 9 — Series en Outlook (Cansancio):** Si alguna es serie de sesiones, el proceso se multiplica.

**Punto 10 — Finalizar (Alivio):** Todo enviado. El historial lo confirma. Momento de cierre.

**Punto 11 — XML FUNDAE (Neutro a Frustracion):** Laura pasa al generador XML. Descubre datos incompletos. Tiene que completarlos antes de generar.

### 4.2 Analisis peak-end

- **Peak positivo:** El momento de lanzar la cola y ver "3 convocatorias enviadas" (toast verde). Invertir en que este momento sea mas celebratorio.
- **Peak negativo:** El momento de descubrir datos FUNDAE incompletos despues de configurar todo. Invertir en prevencion (semaforo de readiness).
- **End:** Depende del flujo. Si acaba en convocatoria, el cierre es positivo. Si acaba en XML FUNDAE con errores, el cierre es negativo.

---

## 5. Propuestas concretas

### 5.1 MUST-HAVE — Impacto alto, reducen friccion critica

#### P1: Panel persistente de calidad de datos
**Que:** Al cargar el Excel, mostrar un panel colapsable (no toasts efimeros) con todos los problemas detectados: emails invalidos, NIFs duplicados, empleados sin email. Cada problema clickable para ir al empleado afectado.
**Por que:** Laura pierde informacion critica porque los toasts desaparecen en 4-6 segundos. Los problemas de datos afectan todo lo que hace despues.
**Como reduce friccion:** Elimina la incertidumbre de "¿habia algo mal?". Permite actuar cuando convenga, no en los 5 segundos del toast.
**Esfuerzo:** Medio (3-4h). Reutilizar la estructura de `dash-alerts-widget`.

#### P2: Envio por lotes sin deeplink (via Power Automate)
**Que:** Nuevo modo de envio que usa el webhook existente para enviar convocatorias directamente via Power Automate/Graph API, sin abrir pestanas de Outlook. Requiere ampliar el flujo de PA existente.
**Por que:** El deeplink de Outlook es el mayor pain point para >50 asistentes y para series largas. Es la diferencia entre "herramienta que ayuda" y "herramienta que funciona sola".
**Como reduce friccion:** Elimina el proceso manual de 5-15 minutos por convocatoria. Elimina problemas de pop-up blockers. Permite envios programados.
**Esfuerzo:** Alto (8-12h). Requiere ampliar el flujo de Power Automate y anadir un nuevo path de envio.

#### P3: Semaforo de readiness FUNDAE
**Que:** En la ficha de cada accion formativa, mostrar un indicador visual (rojo/amarillo/verde) de "readiness para FUNDAE" con lista de lo que falta. En el generador XML, mostrar este semaforo ANTES de intentar generar.
**Por que:** Laura descubre errores al final del proceso. Esto invierte el flujo: muestra el estado desde el principio.
**Como reduce friccion:** Previene el momento de frustracion mas intenso (peak negativo). Convierte "sorpresa desagradable" en "tarea pendiente visible".
**Esfuerzo:** Medio (4-5h). La funcion `checkFundaeReadiness` ya existe; hay que hacerla mas visible y proactiva.

#### P4: Duplicar accion formativa
**Que:** Boton "Duplicar" en la ficha de una accion que crea una copia con todos los datos excepto participantes, fechas y estado.
**Por que:** Laura gestiona formaciones recurrentes (PRL, compliance) que se repiten con variaciones minimas. Crear desde cero cada vez es un desperdicio.
**Como reduce friccion:** Ahorra 5-10 minutos por accion duplicada. Para 30+ acciones anuales similares, el ahorro es sustancial.
**Esfuerzo:** Bajo (1-2h). CRUD ya existe; es copiar y limpiar campos.

#### P5: Vista previa de la convocatoria
**Que:** Antes del dialogo de confirmacion, mostrar una previa de como se vera el email de convocatoria en Outlook: titulo, fecha/hora, ubicacion, cuerpo, lista de asistentes.
**Por que:** Laura no tiene forma de verificar que todo esta correcto antes de abrir Outlook. Si hay un error, tiene que descartar y volver.
**Como reduce friccion:** Reduce el miedo a "enviar algo mal". Permite detectar errores antes de que sea costoso corregirlos.
**Esfuerzo:** Medio (3-4h). La informacion ya esta disponible; solo hay que presentarla en formato de email.

---

### 5.2 SHOULD-HAVE — Impacto medio-alto, mejoran significativamente la experiencia

#### P6: Seleccion por lista de NIFs/emails
**Que:** Poder pegar una lista de NIFs o emails para seleccionar exactamente esos empleados, sin filtros. Textarea donde se pegan y la app hace match con el organigrama.
**Por que:** Laura recibe listas de "estos 15 tienen que ir" por email. Convertir eso en filtros es torpe.
**Esfuerzo:** Bajo (2-3h).

#### P7: Recordatorios automaticos
**Que:** Checkbox en datos del evento: "Enviar recordatorio X dias antes" que usa el mismo webhook de PA para programar un email de recordatorio.
**Por que:** Es la tarea manual mas frecuente que Laura hace fuera de la app.
**Esfuerzo:** Medio (3-4h). Reutiliza la infraestructura de encuestas.

#### P8: Exportacion .ics de calendario
**Que:** Boton en la pestana Calendario para exportar un archivo .ics con todas las formaciones visibles, importable en cualquier calendario.
**Por que:** Laura necesita tener las formaciones en su calendario de Outlook para planificar su semana.
**Esfuerzo:** Bajo (2h). El formato .ics es texto plano con estructura simple.

#### P9: Alertas proactivas al abrir la app
**Que:** Si hay alertas de plazos FUNDAE pendientes, mostrar un banner discreto en la pestana de Convocatoria (no solo en el Dashboard) con "2 plazos FUNDAE proximos" clickable.
**Por que:** Laura no abre el Dashboard cada dia. Los plazos FUNDAE son criticos y tienen multas asociadas.
**Esfuerzo:** Bajo (1-2h). Los datos ya se calculan; solo hay que mostrar un resumen fuera del dashboard.

#### P10: Auto-relleno de datos del grupo XML
**Que:** Guardar los "datos del grupo" mas recientes (responsable, telefono, ID grupo) y ofrecerlos como default al generar XML de la misma empresa/accion.
**Por que:** Laura escribe los mismos datos cada vez que genera un XML.
**Esfuerzo:** Bajo (1-2h). Guardar en localStorage por CIF de empresa pagadora.

#### P11: Busqueda flexible de hoja en el Excel
**Que:** Si la hoja "ORGANIGRAMA" no existe, buscar hojas con nombres similares (organigrama, Organigrama, PLANTILLA, etc.) y preguntar al usuario cual usar. Si solo hay una hoja, usarla directamente.
**Por que:** El error "hoja no encontrada" es el peor primer contacto posible con la app.
**Esfuerzo:** Bajo (1h). Anadir fuzzy match de nombre de hoja.

---

### 5.3 NICE-TO-HAVE — Mejoran la percepcion de calidad

#### P12: Atajos de teclado
**Que:** Implementar atajos para acciones frecuentes: Ctrl+E (enviar), Ctrl+Q (anadir a cola), Ctrl+F (buscar empleado), Ctrl+S (guardar preset).
**Por que:** Laura usa la app intensivamente. Los atajos comunican "herramienta profesional" y ahorran segundos que se acumulan.
**Esfuerzo:** Bajo (2h).

#### P13: Animacion de celebracion al lanzar cola
**Que:** Un momento de deleite al completar la cola: animacion sutil de check/confetti, resumen de lo enviado, timestamp. No un simple toast sino un mini-dialog de "mision cumplida".
**Por que:** Peak-end rule. Este es el momento mas satisfactorio del flujo. Invertir en que se sienta como un logro.
**Esfuerzo:** Bajo (1-2h).

#### P14: Modo compacto para el formulario de acciones
**Que:** Dos modos de vista para la ficha de accion formativa: "Operativo" (fechas, participantes, asistencia, notas) y "FUNDAE" (todos los campos administrativos). Por defecto mostrar el operativo.
**Por que:** Divulgacion progresiva. Laura no necesita ver el area profesional ni el nivel de formacion hasta que va a generar XML.
**Esfuerzo:** Medio (3h). Reestructurar el formulario con `<details>` adicionales.

#### P15: Perfil formativo de empleado
**Que:** Al buscar un empleado en el dashboard, mostrar un "perfil" con: formaciones recibidas, horas acumuladas, encuestas contestadas, certificados emitidos, historial de asistencia.
**Por que:** Laura necesita esta informacion para tomar decisiones ("¿esta persona ya hizo PRL este ano?") y para informes individuales.
**Esfuerzo:** Medio (4-5h). Los datos estan distribuidos entre historial, catalogo y asistencia.

#### P16: Informe personalizable
**Que:** En el dashboard, permitir seleccionar que secciones incluir en la exportacion y anadir un header con logo de empresa. Opcion de exportar a PDF ademas de Excel.
**Por que:** Laura necesita presentar informes a Direccion con formato corporativo.
**Esfuerzo:** Alto (6-8h). Requiere generador de PDF basico.

---

## 6. Matriz de priorizacion

| Propuesta | Impacto | Esfuerzo | Prioridad | Orden sugerido |
|-----------|---------|----------|-----------|----------------|
| P4: Duplicar accion | Alto | Bajo | Must-have | 1 |
| P11: Busqueda flexible de hoja | Alto | Bajo | Must-have | 2 |
| P1: Panel de calidad de datos | Alto | Medio | Must-have | 3 |
| P3: Semaforo readiness FUNDAE | Alto | Medio | Must-have | 4 |
| P5: Vista previa convocatoria | Alto | Medio | Must-have | 5 |
| P9: Alertas proactivas | Medio | Bajo | Should-have | 6 |
| P10: Auto-relleno grupo XML | Medio | Bajo | Should-have | 7 |
| P6: Seleccion por lista NIFs | Medio | Bajo | Should-have | 8 |
| P12: Atajos de teclado | Medio | Bajo | Should-have | 9 |
| P8: Exportacion .ics | Medio | Bajo | Should-have | 10 |
| P13: Celebracion fin de cola | Bajo | Bajo | Nice-to-have | 11 |
| P7: Recordatorios automaticos | Alto | Medio | Should-have | 12 |
| P14: Modo compacto acciones | Medio | Medio | Nice-to-have | 13 |
| P15: Perfil formativo empleado | Medio | Medio | Nice-to-have | 14 |
| P2: Envio via Power Automate | Muy alto | Alto | Must-have | 15 |
| P16: Informe personalizable | Medio | Alto | Nice-to-have | 16 |

**Nota sobre P2:** Aunque es must-have por impacto, se posiciona al final por esfuerzo. Es un proyecto en si mismo que transforma la arquitectura (de app local a app con backend de envio). Se recomienda implementar las demas mejoras primero para acumular valor con esfuerzo bajo, y abordar P2 como fase 2.

---

## 7. Resumen ejecutivo

La aplicacion ya resuelve el problema central de Laura: generar convocatorias de formacion de forma eficiente. Los flujos de filtrado, plantillas, cola, historial y sincronizacion con catalogos estan bien diseñados y ahorran tiempo real.

Los mayores puntos de friccion se concentran en tres areas:

1. **La frontera entre la app y Outlook** (deeplinks con limite de URL, pop-ups bloqueados, series tediosas). Solucion a largo plazo: envio via Power Automate (P2).

2. **La completitud de datos FUNDAE** (descubrimiento tardio de datos faltantes). Solucion: semaforo de readiness proactivo (P3) y panel de calidad de datos (P1).

3. **La repeticion de tareas entre convocatorias similares** (misma formacion para diferentes grupos). Solucion: duplicar acciones (P4), seleccion por lista (P6), recordatorios (P7).

Las propuestas estan priorizadas para maximizar el ratio impacto/esfuerzo. Las primeras 5 propuestas (P4, P11, P1, P3, P5) se pueden implementar en ~15 horas y resuelven los pain points mas agudos.

La clave de la percepcion de valor, como documenta la investigacion complementaria, no esta en una unica funcionalidad transformadora, sino en la acumulacion de detalles que reducen friccion y aumentan confianza. Laura no necesita una app perfecta; necesita una app que demuestre que entiende su trabajo.
