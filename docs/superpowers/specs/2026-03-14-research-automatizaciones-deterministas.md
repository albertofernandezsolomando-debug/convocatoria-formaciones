# Research: Automatizaciones Deterministas en Gestion de Formacion de RRHH

**Fecha:** 14 de marzo de 2026
**Tipo:** Deep research + propuestas de implementacion
**Ambito:** Automatizaciones sin IA, 100% basadas en reglas, aplicables a `convocatoria.html`
**Principio rector:** Si X entonces Y, siempre. Sin ambiguedad, sin juicio humano, sin excepciones.

---

## PARTE I: DEEP RESEARCH — AUTOMATIZACIONES DETERMINISTAS

---

### 1. Taxonomia de triggers deterministas en formacion

Un trigger determinista es un evento que puede evaluarse con una condicion booleana (verdadero/falso) sin necesidad de interpretacion humana. En el area de formacion de RRHH, los triggers se clasifican en tres familias:

#### 1.1 Triggers temporales (fecha/plazo)

Son los mas fiables porque dependen exclusivamente del calendario, una fuente de verdad inambigua.

| Trigger | Condicion | Accion automatica | Ejemplo |
|---------|-----------|-------------------|---------|
| **Pre-formacion (N dias antes)** | `hoy >= fechaFormacion - N dias` | Enviar recordatorio a asistentes | "La formacion PRL es el lunes. Recuerda asistir." |
| **Plazo FUNDAE inicio** | `hoy >= fechaInicio - 2 dias habiles` | Alerta a Laura: "Comunica inicio a FUNDAE" | Formacion el miercoles → alerta el lunes |
| **Plazo FUNDAE finalizacion** | `hoy >= fechaFin + 1 dia habil` | Alerta: "Comunica finalizacion a FUNDAE" | Formacion acabo el viernes → alerta el lunes |
| **Plazo RLT** | `hoy >= fechaComunicacionRLT + 15 dias habiles` | Marcar RLT como "informada sin objeciones" | Enviado el 1/3 → plazo el 22/3 |
| **Caducidad de certificacion** | `hoy >= fechaCertificacion + periodoValidez - 60 dias` | Alerta: "PRL de Maria Garcia caduca en 60 dias" | PRL hecho el 15/3/2025, validez 1 ano → alerta 14/1/2026 |
| **Cierre ejercicio FUNDAE** | `hoy >= 1 junio del ano siguiente` | Alerta: "Cierra formaciones pendientes antes del 30/6" | — |
| **Informe periodico** | `hoy == primer dia del mes/trimestre` | Generar informe automatico de periodo anterior | Informe mensual el 1 de cada mes |
| **Encuesta de seguimiento** | `hoy >= fechaFinFormacion + 30 dias` | Enviar encuesta de seguimiento (Kirkpatrick L3) | Formacion el 1/3 → seguimiento el 31/3 |

**Lo que hacen las plataformas del mercado:**

- **SAP SuccessFactors Learning** permite configurar `ApmLearningReminder` y `ApmTrainingExpiration` como procesos automaticos programados en el Scheduled Job Manager, con parametro `Remind in Days` configurable por workflow.
- **Docebo** ofrece un app de Automation con reglas basadas en fecha: recertificacion automatica cuando un certificado caduca, re-enrollment automatico N dias antes de expiracion.
- **Workday Learning** envia recordatorios automaticos antes, en, y despues de la fecha limite, con copia al manager directo.
- **ExpirationReminder** (herramienta especializada) automatiza el ciclo completo: alerta de vencimiento → auto-inscripcion en formacion de renovacion → emision automatica del nuevo certificado → actualizacion del registro del empleado.

#### 1.2 Triggers por cambio de estado

Se disparan cuando un registro cambia de un estado a otro. Son deterministas si los estados estan bien definidos y las transiciones son univocas.

| Trigger | Transicion | Accion automatica | Ejemplo |
|---------|-----------|-------------------|---------|
| **Convocatoria enviada** | Borrador → Enviada | Registrar en historial, sincronizar con accion formativa, programar encuesta | Enviar convocatoria → todo lo demas ocurre solo |
| **Formacion finalizada** | En marcha → Terminada | Enviar encuesta de satisfaccion, generar certificados, abrir plazo de comunicacion FUNDAE | Formacion termina → encuesta sale automaticamente |
| **Inscripcion confirmada** | Invitado → Confirmado | Actualizar contador de asistentes, verificar aforo | Participante confirma → conteo se actualiza |
| **Asistencia registrada** | Sin registro → Asistio/No asistio | Actualizar perfil formativo del empleado, recalcular % asistencia | Se marca asistencia → metricas se actualizan |
| **Accion FUNDAE comunicada** | Pendiente → Comunicada | Registrar fecha de comunicacion, calcular plazo de finalizacion | Se marca "inicio comunicado" → fecha queda registrada |
| **Estado RLT actualizado** | Pendiente → Enviada → Sin objeciones | Desbloquear comunicacion FUNDAE de inicio | RLT informada → se puede comunicar inicio a FUNDAE |
| **Presupuesto aprobado** | Pendiente → Aprobado | Marcar accion como "En preparacion", habilitar convocatoria | Direccion aprueba → Laura puede convocar |

**Lo que hacen las plataformas del mercado:**

- **Cornerstone OnDemand** automatiza workflows post-completion: emision de certificado, inscripcion en curso siguiente, notificacion al manager.
- **Moodle Workplace** usa "dynamic rules" para asignar usuarios a certificaciones cuando cambian de puesto o completan un curso previo.
- **360Learning** dispara automaticamente alertas de escalado: si un empleado no completa formacion obligatoria, notifica al manager; si el manager no actua, escala a RRHH.
- **Docebo** permite configurar reglas tipo: "cuando el usuario completa el curso X, inscribirlo automaticamente en el curso Y y enviar notificacion Z".

#### 1.3 Triggers por umbral numerico

Se disparan cuando un valor numerico cruza un limite predefinido. Son deterministas si el calculo del valor y el limite son objetivos.

| Trigger | Condicion | Accion automatica | Ejemplo |
|---------|-----------|-------------------|---------|
| **Minimo de asistentes** | `numInscritos >= minimoRequerido` | Confirmar ejecucion de la formacion, notificar al proveedor | Minimo 8 inscritos, se llega a 8 → "Formacion confirmada" |
| **Maximo de aforo** | `numInscritos >= aforoMaximo` | Cerrar inscripciones, activar lista de espera | Aforo 20, se llega a 20 → lista de espera |
| **Credito FUNDAE agotado** | `creditoConsumido / creditoTotal >= umbral%` | Alerta: "Credito FUNDAE al 80%. Quedan X EUR" | Credito 10.000, consumido 8.000 → alerta |
| **Presupuesto area consumido** | `gastoArea / presupuestoArea >= umbral%` | Alerta: "Presupuesto de Marketing al 90%" | Asignado 15.000, gastado 13.500 → alerta |
| **Tasa de asistencia baja** | `asistenciasReales / asistenciasEsperadas < umbral%` | Alerta: "Asistencia al 50% en PRL-003" | 10 de 20 asistieron → alerta |
| **Tasa de respuesta encuesta** | `respuestasEncuesta / totalEnviadas < umbral%` | Reenviar encuesta a los que no respondieron | 5 de 20 respondieron → reenvio |
| **Horas formativas per capita** | `horasImpartidas / numEmpleados < objetivo` | Alerta: "Solo 12h/empleado de las 20h objetivo" | — |

**Lo que hacen las plataformas del mercado:**

- **Absorb LMS** configura alertas de certificacion basadas en porcentaje de completitud y proximidad a fecha de caducidad.
- **D2L Brightspace** usa "Intelligent Agents" que se disparan por umbrales: si un usuario no ha accedido al curso en N dias, o si la nota esta por debajo del X%.
- **Training Orchestra (TMS)** monitoriza umbrales de utilizacion de recursos: si una sala esta reservada menos del 60%, sugiere consolidar sesiones.

---

### 2. Cadenas de acciones deterministas (flujos end-to-end)

Una cadena determinista es una secuencia de acciones donde cada paso se dispara automaticamente por la finalizacion del anterior, sin intervencion humana en ningun punto intermedio (excepto donde se indique explicitamente "MANUAL").

#### 2.1 Cadena completa: Alta de formacion bonificada

```
[MANUAL] Laura crea accion formativa en catalogo
    |
[AUTO] Validar datos minimos (titulo, fechas, modalidad, participantes)
    |
[AUTO] Calcular coste estimado de bonificacion
    |
[AUTO] Verificar credito FUNDAE disponible
    | Si credito insuficiente → [AUTO] Alerta "Credito insuficiente"
    | Si credito suficiente
[AUTO] Generar comunicacion RLT con datos de la accion
    |
[MANUAL] Laura envia comunicacion a la RLT (email/documento)
    |
[AUTO] Registrar fecha de envio RLT, calcular plazo 15 dias habiles
    |
[AUTO] Esperar 15 dias habiles
    | Si RLT responde con objeciones → [MANUAL] Laura gestiona discrepancias
    | Si RLT no responde o responde favorable
[AUTO] Marcar RLT como "informada", habilitar comunicacion FUNDAE
    |
[AUTO] Alerta 2 dias habiles antes del inicio: "Comunica inicio a FUNDAE"
    |
[AUTO] Generar XML de comunicacion de inicio
    |
[MANUAL] Laura sube XML a la plataforma FUNDAE
    |
[AUTO] Registrar fecha de comunicacion de inicio
    |
[MANUAL] Laura envia convocatoria a participantes
    |
[AUTO] Registrar envio en historial, sincronizar con accion formativa
    |
[AUTO] Programar recordatorio N dias antes
    |
[AUTO] Enviar recordatorio a participantes
    |
[EJECUCION DE LA FORMACION]
    |
[MANUAL] Laura registra asistencia
    |
[AUTO] Calcular % asistencia, detectar ausencias
    |
[AUTO] Enviar encuesta de satisfaccion a asistentes
    |
[AUTO] Generar certificados de asistencia
    |
[AUTO] Alerta: "Comunica finalizacion a FUNDAE (plazo: 2 dias habiles)"
    |
[AUTO] Generar XML de comunicacion de finalizacion
    |
[MANUAL] Laura sube XML a la plataforma FUNDAE
    |
[AUTO] Registrar fecha de comunicacion de fin
    |
[AUTO] Calcular bonificacion aplicable
    |
[AUTO] Alerta: "Aplica bonificacion en cotizacion del mes X"
    |
[AUTO] Actualizar credito FUNDAE consumido
    |
[AUTO] Verificar documentacion completa (checklist de inspeccion)
    | Si documentacion incompleta → [AUTO] Alerta con lo que falta
    | Si documentacion completa
[AUTO] Marcar accion como "cerrada"
```

**Pasos manuales inevitables:** 6 de 24 (25%). Los restantes 18 son 100% automatizables con logica determinista.

#### 2.2 Cadena: Formacion obligatoria con recertificacion

```
[MANUAL] Laura define tipos de formacion obligatoria y periodicidad
    |
[AUTO] Calcular fecha de caducidad por empleado y tipo
    |
[AUTO] 90 dias antes de caducidad → Alerta amarilla a Laura
    |
[AUTO] 60 dias antes → Alerta naranja + sugerir "Crear convocatoria"
    |
[AUTO] 30 dias antes → Alerta roja + listar empleados afectados
    |
[MANUAL] Laura crea convocatoria con empleados pre-seleccionados
    |
[... cadena de convocatoria estandar ...]
    |
[MANUAL] Laura registra asistencia y resultado
    |
[AUTO] Actualizar fecha de certificacion del empleado
    |
[AUTO] Calcular nueva fecha de caducidad
    |
[AUTO] Generar certificado de renovacion
    |
[AUTO] Reiniciar ciclo de alertas con nueva fecha
```

#### 2.3 Cadena: Convocatoria con recordatorio y encuesta

```
[MANUAL] Laura configura convocatoria (asistentes, fecha, hora, datos)
    |
[MANUAL] Laura envia convocatoria (via Outlook o Power Automate)
    |
[AUTO] Registrar en historial con timestamp
    |
[AUTO] Sincronizar participantes con accion formativa del catalogo
    |
[AUTO] Si "recordatorio activado": programar envio N dias antes
    |
[AUTO] N dias antes: enviar recordatorio via webhook PA
    |
[EJECUCION]
    |
[AUTO] A la hora de fin del evento: enviar encuesta de satisfaccion via webhook PA
    |
[AUTO] 7 dias despues: si tasa de respuesta < 50%, reenviar encuesta
    |
[AUTO] 14 dias despues: cerrar ciclo de encuesta, registrar resultados
```

---

### 3. Generacion automatica de documentos

La generacion automatica de documentos es una de las automatizaciones mas valiosas en formacion, porque los documentos siguen plantillas fijas con datos variables. Es 100% determinista: los mismos datos producen siempre el mismo documento.

#### 3.1 Documentos automatizables

| Documento | Datos necesarios | Formato | Frecuencia |
|-----------|-----------------|---------|------------|
| **Comunicacion a la RLT** | Acciones formativas (nombre, objetivos, fechas, participantes, criterios seleccion, medios pedagogicos, balance ejercicio anterior) | HTML imprimible | Por lote de formaciones |
| **Listado de asistencia (hoja de firmas)** | Nombre formacion, fecha, hora, lugar, lista de participantes (nombre, NIF, firma) | HTML imprimible | Por sesion |
| **Certificado de asistencia** | Nombre participante, NIF, formacion, horas, fecha, firma del responsable | HTML/PDF | Por participante |
| **XML FUNDAE (inicio)** | Datos accion, grupo, participantes, centro, tutor, fechas, horarios | XML | Por grupo formativo |
| **XML FUNDAE (finalizacion)** | Datos anteriores + asistencia real, horas efectivas | XML | Por grupo formativo |
| **XML FUNDAE (accion)** | Datos administrativos de la accion (area profesional, nivel, competencia...) | XML | Por accion formativa |
| **Informe periodico** | KPIs del periodo: acciones, horas, participantes, presupuesto, credito | HTML | Mensual/Trimestral |
| **Informe para la RLT (balance anual)** | Resumen de formaciones del ejercicio por tipo, departamento, horas | HTML imprimible | Anual |
| **Dossier de inspeccion** | Todos los documentos anteriores agrupados por accion formativa + checklist | HTML/ZIP | Bajo demanda |

**Lo que hacen las plataformas del mercado:**

- **Power Automate** con DocuGenerate o Adobe Document Generation permite generar PDFs desde plantillas Word con placeholders dinamicos (`{{ParticipantName}}`, `{{EventTitle}}`). Se pueden generar certificados en lote.
- **Sipadan GIF** genera mas de 20 documentos autocompletados en el ciclo de formacion: desde el plan formativo hasta la justificacion economica.
- **Gesbon** automatiza la generacion de documentacion de cursos y comunicaciones XML a FUNDAE, ahorrando segun sus datos un 80% del tiempo dedicado a bonificaciones.
- **Factorial HR** genera XML compatible con FUNDAE con un solo click, extrayendo automaticamente datos de contratos y perfiles de empleados.

#### 3.2 Tecnologia para generacion de documentos en una app HTML single-file

Dado que `convocatoria.html` es una app sin servidor, la generacion de documentos se limita a lo que se puede hacer en el navegador:

| Formato | Tecnologia | Viabilidad | Ejemplo de uso |
|---------|-----------|------------|----------------|
| **HTML imprimible** | `window.print()` + CSS `@media print` | Excelente | Hojas de firmas, comunicacion RLT, informes |
| **XML** | Construccion de string XML + `Blob` + `URL.createObjectURL` + descarga | Excelente (ya implementado) | XMLs FUNDAE |
| **CSV/Excel** | SheetJS (ya incluido como CDN) | Excelente (ya implementado) | Exportacion de datos |
| **ICS (calendario)** | Construccion de string ICS + `Blob` + descarga | Excelente | Eventos de formacion |
| **PDF** | html2pdf.js (CDN) o `window.print()` como PDF | Buena | Certificados formales |
| **ZIP** | JSZip (ya utilizado para el flujo PA) o similar | Buena | Dossier de inspeccion |

---

### 4. Validaciones automaticas

Las validaciones son la automatizacion mas simple y con mayor ratio impacto/esfuerzo. Son funciones puras: entrada de datos → resultado booleano + mensaje.

#### 4.1 Validaciones de datos del empleado

| Validacion | Regla | Datos necesarios | Accion si falla |
|-----------|-------|-----------------|----------------|
| **NIF/NIE formato** | Patron regex: `[0-9]{8}[A-Z]` (NIF) o `[XYZ][0-9]{7}[A-Z]` (NIE) + letra de control | NIF/NIE | Marcar en rojo, tooltip con error |
| **Email valido** | Regex de email (ya implementado con `isValidEmail`) | Email | Marcar, impedir envio de convocatoria |
| **NSS formato** | 12 digitos, 2 primeros = provincia (01-52) | NSS | Avisar antes de generar XML FUNDAE |
| **Empleado duplicado** | NIF aparece mas de una vez en el organigrama | NIF | Toast de aviso al cargar Excel |
| **Empleado sin email** | Campo email vacio o invalido | Email | Contar y listar en panel de calidad |

#### 4.2 Validaciones de la accion formativa

| Validacion | Regla | Accion si falla |
|-----------|-------|----------------|
| **Coherencia de fechas** | `fechaInicio <= fechaFin` | Bloquear guardado |
| **Solapamiento de horarios** | Participante tiene otra formacion en la misma franja horaria | Aviso en confirmacion de envio (ya implementado) |
| **Datos FUNDAE completos** | Todos los campos obligatorios para XML rellenos | Semaforo rojo en la ficha |
| **Tutor asignado** | Accion con fechas pero sin tutor | Aviso antes de comunicar inicio |
| **Centro asignado** | Accion presencial sin centro de formacion | Aviso antes de comunicar inicio |
| **Participantes con datos FUNDAE** | Todos los participantes tienen NSS, grupo cotizacion, tipo documento | Lista de "datos faltantes" antes de generar XML |
| **Plazo RLT cumplido** | Comunicacion RLT enviada >= 15 dias habiles antes del inicio | Aviso al intentar comunicar inicio |
| **Credito FUNDAE suficiente** | Coste estimado de bonificacion <= credito disponible | Aviso al crear accion bonificada |

#### 4.3 Validaciones de presupuesto

| Validacion | Regla | Accion si falla |
|-----------|-------|----------------|
| **Presupuesto total no excedido** | `SUM(costes acciones) <= presupuesto anual` | Alerta en dashboard |
| **Coste/hora dentro de limites FUNDAE** | Modalidad presencial: max 13 EUR/participante-hora; teleformacion: max 7,5 EUR | Aviso al configurar costes |
| **Cofinanciacion privada** | Empresas >9 empleados: aportacion privada segun tamano | Calculo automatico |

---

### 5. Automatizaciones por canal

#### 5.1 Automatizaciones por email (via Power Automate webhook)

| Automatizacion | Trigger | Contenido del email | Implementacion |
|---------------|---------|--------------------|--------------  |
| **Convocatoria** | Laura pulsa "Enviar" | Datos del evento, fecha, hora, lugar, instrucciones | Webhook PA → Outlook email |
| **Recordatorio** | N dias antes de la formacion | "Recuerda: manana tienes formacion PRL a las 10:00" | Webhook PA con `scheduledTime` |
| **Encuesta de satisfaccion** | Hora de fin de la formacion | Link a MS Forms con contexto de la formacion | Webhook PA con `scheduledTime` (ya implementado) |
| **Reenvio de encuesta** | 7 dias despues si tasa < X% | "No hemos recibido tu respuesta..." | Webhook PA con delay adicional |
| **Certificado de asistencia** | Asistencia registrada + formacion completada | PDF adjunto con certificado | Webhook PA con attachment |
| **Notificacion a Laura** | Plazo FUNDAE proximo | "Manana vence el plazo para comunicar inicio de PRL-003" | Webhook PA programado |

#### 5.2 Automatizaciones de calendario

| Automatizacion | Trigger | Output | Implementacion |
|---------------|---------|--------|----------------|
| **Exportacion ICS** | Laura pulsa "Exportar calendario" | Archivo .ics con todas las formaciones visibles | JS nativo: construir string VCALENDAR |
| **Evento individual ICS** | Laura pulsa "Descargar .ics" en una accion | Archivo .ics con esa formacion | JS nativo |
| **Bloqueo de agenda** | Convocatoria enviada | .ics adjunto en el email de convocatoria | Se incluye en el deeplink de Outlook (ya funciona parcialmente) |

Formato ICS (determinista, texto plano):
```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260315T100000
DTEND:20260315T140000
SUMMARY:PRL Oficinas Madrid
LOCATION:Sala Formacion Planta 3
DESCRIPTION:Formacion obligatoria de PRL...
END:VEVENT
END:VCALENDAR
```

#### 5.3 Automatizaciones de reporting

| Informe | Trigger | Contenido | Implementacion |
|---------|---------|-----------|----------------|
| **Informe mensual auto-generado** | `dia == 1 del mes` (al abrir la app) | KPIs del mes anterior: acciones, horas, participantes, credito | JS: detectar al abrir si hay informe pendiente |
| **Informe de compliance** | Bajo demanda o trimestral | Estado de formaciones obligatorias por empleado | JS: cruzar datos de compliance con organigrama |
| **Informe para Direccion** | Bajo demanda | Resumen ejecutivo con graficos | JS: reutilizar modulos del dashboard |
| **Informe para la RLT (balance anual)** | Anual (diciembre/enero) | Formaciones del ejercicio por tipo, horas, cobertura | JS: filtrar acciones del ejercicio |

---

### 6. Lo que NO se debe automatizar

Basado en la investigacion de KPMG, Predictive Index, AIHR y multiples fuentes del sector, estas son las areas donde la automatizacion determinista NO funciona y el juicio humano es imprescindible:

#### 6.1 Decisiones que requieren juicio humano

| Decision | Por que no automatizar | Consecuencia de automatizar mal |
|----------|----------------------|--------------------------------|
| **Seleccion de participantes para formacion voluntaria** | Requiere equilibrar necesidades individuales, prioridades del negocio, equidad, y disponibilidad operativa | Formacion para las personas equivocadas, desmotivacion |
| **Eleccion de proveedor/formador** | Requiere evaluar propuestas, negociar, y considerar factores cualitativos (estilo, adaptacion al publico) | Mala calidad, presupuesto desperdiciado |
| **Aprobacion de excepciones presupuestarias** | Requiere contexto del negocio: una formacion cara puede ser critica si hay un cambio regulatorio | Rigidez que bloquea formaciones necesarias |
| **Evaluacion de la transferencia (Kirkpatrick L3-L4)** | Requiere observacion, entrevistas, y correlacion con indicadores de negocio | Datos sin sentido, conclusiones erroneas |
| **Gestion de conflictos de agenda complejos** | Requiere negociar con managers, priorizar personas clave, considerar impacto operativo | Operaciones afectadas, empleados clave ausentes |
| **Diseno de itinerarios formativos** | Requiere entender las necesidades individuales, la trayectoria profesional, y los objetivos del empleado | Formacion generica, sin impacto |

#### 6.2 Aprobaciones que necesitan contexto

| Aprobacion | Contexto necesario |
|-----------|-------------------|
| **Cancelar formacion por baja asistencia** | Quienes son los inscritos? Es obligatoria? El proveedor cobra igualmente? |
| **Aceptar sustituto de ultimo momento** | El sustituto tiene los requisitos previos? Afecta al grupo formativo FUNDAE? |
| **Aprobar formacion fuera de plan** | Hay presupuesto? Es urgente? Encaja con la estrategia? |
| **Gestionar discrepancias con la RLT** | Cuales son las objeciones? Son razonables? Como negociar? |

#### 6.3 Anti-patrones de automatizacion en formacion

| Anti-patron | Descripcion | Consecuencia |
|------------|-------------|--------------|
| **Automatizar la decision de enviar** | Enviar convocatorias automaticamente sin revision de Laura | Errores en datos, envios a personas incorrectas, perdida de control |
| **Sobre-notificar** | Enviar demasiados recordatorios/alertas | "Fatiga de notificaciones": Laura ignora todas, incluidas las criticas |
| **Automatizar sin feedback** | Ejecutar acciones sin confirmar a Laura que se ejecutaron | Incertidumbre: "se envio la encuesta o no?" |
| **Encadenar sin puntos de control** | Flujos de 10+ pasos sin que Laura pueda verificar estados intermedios | Errores que se propagan en cascada sin deteccion |
| **Automatizar excepciones** | Intentar cubrir con reglas todos los casos borde | Complejidad explosiva, reglas contradictorias, mantenimiento imposible |
| **Confiar en plazos del navegador** | Programar acciones futuras que dependen de que el navegador este abierto | Acciones perdidas si Laura cierra el navegador o apaga el PC |

**Regla de oro para esta herramienta:** Automatizar la PREPARACION y la DETECCION, no la EJECUCION. Laura decide cuando enviar, pero la herramienta le prepara todo para que sea un solo click. Laura decide si actua ante una alerta, pero la herramienta se asegura de que la alerta llegue a tiempo.

---

### 7. Herramientas FUNDAE especializadas: que automatizan

Un analisis de las principales herramientas del mercado espanol revela que automatizaciones son estandar en la industria:

#### 7.1 Gesbon (ERP Formacion Bonificada)

- Generacion automatica de XMLs para comunicaciones a FUNDAE
- Firma digital integrada (ilimitada) de documentacion formativa
- Migracion de datos desde/hacia la plataforma FUNDAE
- Cargas masivas de acciones, grupos y participantes
- Documentacion automatica de cursos (hojas de firmas, diplomas, actas)
- **Ahorro declarado:** 80% del tiempo dedicado a bonificacion

#### 7.2 Softmetry (ERP Formacion)

- Conversion de datos desde cualquier fuente (texto plano, Excel) a XML FUNDAE
- Comunicacion automatizada con la "plataforma lanzadera" de FUNDAE
- Cargas masivas unitarias y por lotes
- Soporte 24/7 para incidencias

#### 7.3 Sipadan GIF (Software Gestion Formacion)

- Automatizacion del ciclo completo: plan → accion → grupo → comunicacion → justificacion
- Generacion de 20+ documentos autocompletados
- Firma digitalizada de trabajadores en todos los documentos formativos
- Dashboard con KPIs, datos identificativos y economicos
- Integracion ERP + LMS + aulas virtuales en un solo entorno
- Cargas masivas a FUNDAE

#### 7.4 Factorial HR (HRIS con modulo formacion)

- Generacion de XML compatible con FUNDAE con un click
- Extraccion automatica de datos desde contratos y perfiles de empleados
- Automatizacion de certificados con flujos de trabajo (workflows)
- Checkbox "Bonificado por FUNDAE" que activa campos especificos

#### 7.5 Bonificado Formacion

- Gestion financiera, administrativa y legal de la formacion
- Portal web para centros formativos
- Generacion de documentacion adaptada a FUNDAE
- Cumplimiento regulatorio integrado

**Conclusion:** Todas las herramientas del mercado convergen en las mismas automatizaciones deterministas: generacion de XML, documentacion automatica, cargas masivas, y calculo de credito. La diferenciacion no esta en QUE se automatiza sino en la EXPERIENCIA de usuario y la integracion con el flujo de trabajo completo.

---

### 8. RPA en departamentos de formacion

La Robotic Process Automation (UiPath, Power Automate Desktop) se aplica en formacion para tareas que requieren interactuar con interfaces de usuario de terceros (como la plataforma web de FUNDAE):

| Tarea RPA | Herramienta | Ahorro |
|-----------|------------|--------|
| **Subir XMLs a la plataforma FUNDAE** | UiPath / PA Desktop | 5-10 min por grupo formativo |
| **Descargar datos de participantes de FUNDAE** | UiPath / PA Desktop | 10-15 min por consulta |
| **Consolidar datos de asistencia desde multiples fuentes** | PA Desktop | 15-30 min por formacion |
| **Generar informes en formato corporativo** | PA Desktop + Word/Excel | 30-60 min por informe |
| **Extraer datos de facturas de proveedores** | UiPath + Document Understanding | 2-5 min por factura |

**Nota para convocatoria.html:** La herramienta NO puede hacer RPA (es un HTML sin servidor). Pero puede PREPARAR todo para que el RPA (o la accion manual) sea lo mas rapido posible: XMLs listos para subir, datos formateados, informes pre-generados.

---

## PARTE II: PROPUESTAS DE AUTOMATIZACION PARA LA HERRAMIENTA

---

### Contexto tecnico de `convocatoria.html`

| Aspecto | Realidad |
|---------|---------|
| **Arquitectura** | HTML single-file, sin servidor, sin build |
| **Persistencia** | localStorage (limite ~5-10 MB) |
| **Acciones externas** | Webhook a Power Automate (ya implementado para encuestas) |
| **Limitacion critica** | No puede ejecutar acciones cuando el navegador esta cerrado |
| **Capacidad de envio** | Via Outlook deeplink (limitado) o via webhook PA (robusto) |
| **Generacion de documentos** | HTML imprimible, XML, CSV/Excel (SheetJS), ICS, ZIP |

**Implicacion para automatizaciones:** Las automatizaciones "al abrir la app" y "al cambiar estado" son viables en JS nativo. Las automatizaciones temporales programadas (recordatorios, encuestas con delay) REQUIEREN Power Automate. Las notificaciones push no son posibles sin Service Worker.

---

### A1: Motor de alertas y plazos (Alerta Engine)

**Prioridad:** #1 (frecuencia altisima x impacto alto x viabilidad excelente)

**Flujo determinista:**
```
[AUTO] Al abrir la app o cambiar de pestana al dashboard:
    |
[AUTO] Recorrer todas las acciones formativas del catalogo
    |
[AUTO] Para cada accion, evaluar reglas de plazo:
    |-- Si fechaInicio - hoy <= 2 dias habiles Y estado != "Inicio comunicado"
    |     → Alerta ROJA: "Comunica inicio de [nombre] a FUNDAE (plazo: [fecha])"
    |-- Si fechaFin pasada Y estado != "Fin comunicado" Y estado != "Cerrada"
    |     → Alerta ROJA: "Comunica finalizacion de [nombre] a FUNDAE"
    |-- Si fechaInicio - hoy <= 5 dias Y estado == "En preparacion"
    |     → Alerta AMARILLA: "Formacion [nombre] en 5 dias, aun en preparacion"
    |-- Si fechaComunicacionRLT + 15 dias habiles <= hoy Y estadoRLT == "Enviada"
    |     → [AUTO] Marcar RLT como "Sin objeciones (plazo vencido)"
    |-- Si creditoConsumido / creditoTotal >= 0.8
    |     → Alerta AMARILLA: "Credito FUNDAE al [X]%"
    |-- Si creditoConsumido / creditoTotal >= 0.95
    |     → Alerta ROJA: "Credito FUNDAE casi agotado"
    |
[AUTO] Mostrar alertas ordenadas por urgencia en:
    |-- Banner en pestana Convocatoria (resumen: "3 alertas pendientes")
    |-- Panel completo en Dashboard (detalle con acciones disponibles)
```

**Trigger:** Apertura de la app + cambio de pestana + cada 60 minutos si la app esta abierta.

**Acciones automaticas:**
- Evaluar todas las reglas de plazo contra los datos actuales del catalogo
- Generar lista de alertas con severidad (rojo/amarillo/info)
- Mostrar banner resumido fuera del dashboard
- Cada alerta con boton de accion directa ("Generar XML", "Marcar como comunicado", "Ver accion")

**Datos necesarios:**
- Acciones formativas del catalogo (fechas, estados, participantes)
- Configuracion de plazos (ya existe: `diasAvisoInicio`, `diasAvisoFin`)
- Datos de comunicacion RLT (nuevo: fecha envio, estado)
- Credito FUNDAE (ya existe en dashboard)

**Implementacion tecnica:**
- JS nativo al 100%
- Funcion `evaluateAlerts()` que recorre `state.catalogActions` y genera array de alertas
- Se ejecuta en `onTabChange()`, `onAppLoad()` y con `setInterval(60000)`
- Las alertas ya existen parcialmente en el dashboard (`dash-alerts-widget`); se reutiliza la logica
- Nuevo componente: banner ligero en la pestana Convocatoria (2-3 lineas HTML)

**Lo que queda manual:**
- Laura decide cuando actuar ante cada alerta
- Laura sube los XMLs a FUNDAE manualmente
- Laura gestiona las discrepancias con la RLT

**Impacto:**
- Tiempo ahorrado por alerta: 5-15 min (buscar el dato, calcular el plazo, recordar la obligacion)
- Frecuencia: 2-5 alertas diarias durante periodos activos
- Estimacion: 30-60 min/semana de ahorro
- Impacto legal: previene incumplimientos de plazos FUNDAE (devolucion de bonificaciones + sanciones)

**Coherencia:** El motor de alertas es el sistema nervioso central de la herramienta. Sin el, Laura tiene que recordar mentalmente todos los plazos de todas las formaciones. Con el, la herramienta actua como su asistente de calendario legal.

**Esfuerzo estimado:** 3-4 horas (la logica de plazos FUNDAE ya existe; se amplia y se muestra fuera del dashboard).

---

### A2: Recordatorios automaticos pre-formacion (via Power Automate)

**Prioridad:** #2 (frecuencia alta x impacto alto x viabilidad alta)

**Flujo determinista:**
```
[MANUAL] Laura activa "Enviar recordatorio" al configurar la convocatoria
    |
[MANUAL] Laura selecciona: 1, 2 o 3 dias antes de la formacion
    |
[AUTO] Al enviar la convocatoria:
    |-- Registrar convocatoria en historial (ya existe)
    |-- Programar encuesta de satisfaccion (ya existe)
    |-- Programar recordatorio:
         |-- Calcular scheduledTime = fechaFormacion - N dias, a las 09:00
         |-- Enviar payload al webhook PA con type: "reminder"
    |
[AUTO] Power Automate recibe el payload
    |
[AUTO] PA espera hasta scheduledTime (accion "Delay until")
    |
[AUTO] PA envia email de recordatorio a todos los asistentes
    |
[FIN]
```

**Trigger:** Laura marca checkbox "Enviar recordatorio" + selecciona dias + envia convocatoria.

**Acciones automaticas:**
- Calcular fecha y hora del recordatorio
- Construir payload con datos del evento y lista de emails
- Enviar al webhook existente de PA con un campo `type: "reminder"` para distinguirlo de la encuesta

**Datos necesarios:**
- Datos del evento (titulo, fecha, hora, lugar, modalidad)
- Lista de emails de asistentes
- Configuracion: dias de antelacion para recordatorio (1, 2 o 3)
- URL del webhook PA (ya configurado en Ajustes)

**Implementacion tecnica:**

*En convocatoria.html (JS nativo):*
- Checkbox + select en la seccion "Datos del evento": `[ ] Enviar recordatorio _ dias antes`
- Funcion `sendReminderEmail(event, emails, daysBeforeReminder)` que reutiliza la estructura de `sendSurveyEmail`
- Payload ampliado:
```javascript
{
  type: "reminder",
  to: ["email1@...", "email2@..."],
  subject: "Recordatorio: Formacion PRL manana a las 10:00",
  body: "<html>...(datos del evento)...</html>",
  scheduledTime: "2026-03-14T09:00:00Z"
}
```

*En Power Automate (ampliacion del flujo existente):*
- Anadir una condicion al flujo actual: `if triggerBody()?['type'] == 'reminder'` → branch de recordatorio
- El branch de recordatorio usa el mismo patron: `Delay until` + `Send email (V2)`
- El email de recordatorio es mas corto que la convocatoria: fecha, hora, lugar, y un "nos vemos manana"

**Lo que queda manual:**
- Laura decide si activar el recordatorio (checkbox)
- Laura elige cuantos dias antes
- Laura verifica que los datos del evento son correctos antes de enviar

**Impacto:**
- Tiempo ahorrado por recordatorio: 10-15 min (abrir Outlook, buscar emails, redactar, enviar)
- Frecuencia: 30-80 formaciones/ano = 30-80 recordatorios
- Estimacion: 5-20 horas/ano de ahorro
- Impacto indirecto: mejor asistencia (los recordatorios reducen no-shows un 20-30% segun estudios de scheduling)

**Coherencia:** Cierra el gap mas solicitado por las gestoras de formacion (segun la investigacion de empatia, P7). Reutiliza la infraestructura de Power Automate existente, manteniendo la arquitectura sin servidor.

**Esfuerzo estimado:** 3-4 horas (2h en HTML/JS + 1-2h ampliando el flujo PA).

---

### A3: Generacion automatica de comunicacion RLT

**Prioridad:** #3 (frecuencia media x impacto muy alto x viabilidad alta)

**Flujo determinista:**
```
[MANUAL] Laura selecciona acciones formativas para comunicar a la RLT
    |
[AUTO] Recopilar datos de cada accion seleccionada:
    |-- Denominacion y objetivos
    |-- Colectivo destinatario (departamentos/puestos de participantes)
    |-- Numero de participantes
    |-- Calendario previsto (fechas de todas las sesiones)
    |-- Medios pedagogicos (modalidad)
    |-- Criterios de seleccion (texto libre o generado desde filtros)
    |-- Balance del ejercicio anterior (acciones del ano previo)
    |
[AUTO] Generar documento HTML con formato profesional:
    |-- Encabezado: "COMUNICACION A LA REPRESENTACION LEGAL DE LOS TRABAJADORES"
    |-- Datos de la empresa (desde configuracion)
    |-- Tabla con todas las acciones formativas
    |-- Seccion de balance del ejercicio anterior (auto-calculado desde catalogo)
    |-- Pie con fecha y espacio para firma
    |
[AUTO] Mostrar vista previa del documento
    |
[MANUAL] Laura revisa, ajusta si es necesario, e imprime o envia
    |
[MANUAL] Laura marca fecha de envio a la RLT
    |
[AUTO] Calcular fecha limite de respuesta (envio + 15 dias habiles)
    |
[AUTO] Registrar en cada accion: fechaComunicacionRLT, estadoRLT = "Enviada"
    |
[AUTO] Activar alerta: cuando se cumplan 15 dias habiles, marcar como "Sin objeciones"
```

**Trigger:** Laura pulsa "Generar comunicacion RLT" desde el catalogo.

**Acciones automaticas:**
- Recopilar todos los datos legalmente requeridos de las acciones seleccionadas
- Calcular balance del ejercicio anterior automaticamente
- Generar documento HTML formateado
- Calcular y monitorizar plazo de 15 dias habiles
- Auto-transicion de estado cuando vence el plazo

**Datos necesarios:**
- Acciones formativas del catalogo (nombre, objetivos, fechas, modalidad, participantes)
- Datos de empresa (nombre, CIF — desde configuracion/settings)
- Historial de acciones del ejercicio anterior (ya disponible en catalogo/historial)
- Calendario de dias habiles (para calcular 15 dias habiles)

**Implementacion tecnica:**

*En convocatoria.html (JS nativo):*
- Nuevo boton en catalogo de acciones: "Comunicacion RLT"
- Funcion `generateRLTDocument(selectedActions)`:
  - Recibe array de IDs de acciones
  - Recopila datos de cada accion
  - Calcula balance del ejercicio anterior (`state.catalogActions.filter(a => a.year === currentYear - 1)`)
  - Genera HTML con formato tabular profesional
  - Abre en nueva ventana para imprimir (`window.open` + `window.print()`)
- Nuevo campo en cada accion: `rlt: { sentDate, deadline, status }`
- Funcion `calculateBusinessDays(startDate, days)` (ya existe parcialmente para plazos FUNDAE)
- En `evaluateAlerts()`: verificar si `rlt.deadline` ha pasado y auto-transicionar estado

**Lo que queda manual:**
- Laura selecciona que acciones incluir en la comunicacion
- Laura envia el documento a la RLT (email, entrega en mano, etc.)
- Laura registra la fecha de envio
- Laura gestiona discrepancias si las hay

**Impacto:**
- Tiempo ahorrado por comunicacion: 30-60 min (recopilar datos, formatear documento, calcular plazos)
- Frecuencia: 4-8 comunicaciones/ano (por lotes de formaciones)
- Estimacion: 4-8 horas/ano de ahorro
- Impacto legal: documentacion formalizada y archivada (reduce riesgo ante inspeccion)
- Impacto cognitivo: Laura no tiene que recordar que datos son obligatorios — la herramienta los incluye todos

**Coherencia:** Cubre un requisito legal que ninguna herramienta del mercado automatiza bien (segun el research de flujos RRHH). Encaja perfectamente en la narrativa de "ciclo completo FUNDAE".

**Esfuerzo estimado:** 4-5 horas.

---

### A4: Semaforo de readiness y validacion progresiva

**Prioridad:** #4 (frecuencia alta x impacto alto x viabilidad excelente)

**Flujo determinista:**
```
[AUTO] Cada vez que Laura abre una ficha de accion formativa:
    |
[AUTO] Ejecutar checkFundaeReadiness(action):
    |-- Verificar datos de la accion (titulo, fechas, modalidad, horas) → %
    |-- Verificar datos del centro (si presencial: nombre, direccion, CIF) → %
    |-- Verificar datos del tutor (nombre, NIF, email) → %
    |-- Verificar datos de participantes:
    |     |-- Todos tienen NIF/NIE valido → check
    |     |-- Todos tienen NSS → check
    |     |-- Todos tienen grupo cotizacion → check
    |     |-- Todos tienen tipo documento → check
    |-- Verificar comunicacion RLT (si aplica) → check
    |-- Calcular puntuacion global: 0-100%
    |
[AUTO] Mostrar indicador visual en la ficha:
    |-- < 50%  → Rojo:    "No lista para FUNDAE (faltan X datos)"
    |-- 50-90% → Amarillo: "Parcialmente lista (N items pendientes)"
    |-- > 90%  → Verde:   "Lista para generar XML FUNDAE"
    |
[AUTO] Mostrar lista expandible con cada item:
    |-- OK: Titulo y fechas completos
    |-- FALTA: 3 participantes sin NSS: [Maria Garcia, Pedro Lopez, Ana Ruiz]
    |-- FALTA: Tutor sin asignar
    |-- OK: Centro de formacion configurado
    |
[AUTO] En el generador XML: mostrar este mismo semaforo ANTES de la generacion
    |
[AUTO] En la vista lista del catalogo: columna de semaforo (punto de color)
```

**Trigger:** Apertura de ficha de accion formativa + apertura del generador XML + vista lista del catalogo.

**Acciones automaticas:**
- Evaluar completitud de datos contra los campos requeridos para XML FUNDAE
- Calcular porcentaje de readiness
- Mostrar indicador visual con lista de items faltantes
- Cada item faltante es un link clickable que lleva al campo correspondiente

**Datos necesarios:**
- Todos los datos de la accion formativa (ya en el catalogo)
- Datos de participantes (ya vinculados)
- Datos de centro y tutor (ya en catalogos)
- Lista de campos requeridos por tipo de XML (ya implementada en la logica de generacion)

**Implementacion tecnica:**
- La funcion `checkFundaeReadiness()` ya existe conceptualmente en la validacion del generador XML
- Se refactoriza para que sea reutilizable y devuelva un objeto `{ score, items: [{field, status, message}] }`
- Nuevo componente visual: barra de progreso + lista expandible en la ficha
- En vista lista: columna con `<span class="readiness-dot" style="background: ${color}"></span>`

**Lo que queda manual:**
- Laura completa los datos faltantes
- Laura decide cuando generar el XML

**Impacto:**
- Tiempo ahorrado por formacion: 10-20 min (evita el ciclo "intentar generar → descubrir error → buscar dato → volver")
- Frecuencia: 30-80 acciones formativas/ano
- Estimacion: 5-25 horas/ano de ahorro
- Impacto emocional: elimina el "peak negativo" identificado en el mapa emocional (descubrir errores al final)

**Coherencia:** Directamente alineada con P3 del spec de empatia. Transforma "sorpresa desagradable" en "tarea pendiente visible".

**Esfuerzo estimado:** 4-5 horas.

---

### A5: Generacion automatica de hojas de firmas

**Prioridad:** #5 (frecuencia alta x impacto medio x viabilidad excelente)

**Flujo determinista:**
```
[MANUAL] Laura abre una accion formativa con participantes vinculados
    |
[MANUAL] Laura pulsa "Generar hoja de firmas"
    |
[AUTO] Para cada sesion de la accion:
    |-- Generar tabla HTML:
    |     |-- Encabezado: nombre formacion, fecha sesion, hora, lugar, formador
    |     |-- Filas: una por participante (nombre, NIF, firma [espacio vacio], hora entrada, hora salida)
    |     |-- Pie: espacio para firma del formador, sello de empresa
    |-- Pagina por sesion (CSS page-break)
    |
[AUTO] Abrir ventana de impresion con todas las hojas
    |
[MANUAL] Laura imprime
```

**Trigger:** Laura pulsa "Generar hoja de firmas" en la ficha de la accion.

**Acciones automaticas:**
- Recopilar datos de la accion y sus sesiones
- Generar tabla HTML formateada para impresion (A4, landscape)
- Una pagina por sesion
- Ordenar participantes alfabeticamente

**Datos necesarios:**
- Nombre de la formacion, fechas de sesiones, horario, lugar (del catalogo)
- Lista de participantes con nombre completo y NIF (del catalogo + organigrama)
- Nombre del formador/tutor (del catalogo)

**Implementacion tecnica:**
- Funcion `generateAttendanceSheet(actionId)` que genera HTML con CSS `@media print`
- Abre nueva ventana con el contenido HTML formateado y llama a `window.print()`
- CSS especifico para impresion: bordes de tabla visibles, fuente legible, espacio para firmas
- Patron ya conocido en la herramienta (similar a la generacion de documentos existente)

**Lo que queda manual:**
- Laura imprime la hoja
- Los asistentes firman durante la formacion
- Laura escanea/archiva la hoja firmada

**Impacto:**
- Tiempo ahorrado por sesion: 5-10 min (crear hoja en Word, copiar nombres, formatear)
- Frecuencia: 50-200 sesiones/ano (30-80 acciones x 1-4 sesiones)
- Estimacion: 4-30 horas/ano de ahorro
- Impacto legal: hojas de firmas son requisito documental para FUNDAE

**Coherencia:** Documento esencial del ciclo FUNDAE que la herramienta no genera actualmente. Su ausencia obliga a Laura a usar Word/Excel para algo que la app ya tiene todos los datos.

**Esfuerzo estimado:** 2-3 horas.

---

### A6: Generacion automatica de certificados de asistencia

**Prioridad:** #6 (frecuencia alta x impacto medio x viabilidad buena)

**Flujo determinista:**
```
[MANUAL] Laura registra asistencia en la accion formativa
    |
[AUTO] Identificar participantes que cumplen criterio de certificacion:
    |-- Asistencia >= 75% de las sesiones (configurable)
    |-- O bien: asistio a todas las sesiones (formacion obligatoria)
    |
[MANUAL] Laura pulsa "Generar certificados"
    |
[AUTO] Para cada participante que cumple criterio:
    |-- Generar certificado HTML con:
    |     |-- Nombre del participante
    |     |-- NIF
    |     |-- Nombre de la formacion
    |     |-- Horas totales de formacion
    |     |-- Fechas (inicio - fin)
    |     |-- Modalidad
    |     |-- Nombre del formador/empresa formadora
    |     |-- Fecha de emision
    |     |-- Fecha de caducidad (si formacion con recertificacion)
    |     |-- Espacio para firma y sello
    |-- CSS con page-break entre certificados
    |
[AUTO] Abrir ventana de impresion (o "Guardar como PDF" del navegador)
    |
[AUTO] Registrar en la accion: certificados generados, fecha, participantes
```

**Trigger:** Laura pulsa "Generar certificados" en la ficha de la accion (habilitado cuando hay asistencia registrada).

**Acciones automaticas:**
- Filtrar participantes que cumplen el criterio de certificacion
- Generar HTML con formato de certificado profesional (centrado, con espacios formales)
- Registrar la emision en los datos de la accion

**Datos necesarios:**
- Accion formativa (nombre, horas, fechas, modalidad, formador)
- Participantes con asistencia registrada
- Criterio de certificacion (configurable: % minimo de asistencia)
- Datos de empresa (nombre, CIF — desde configuracion)

**Implementacion tecnica:**
- Funcion `generateCertificates(actionId)` → HTML con CSS de impresion
- Plantilla de certificado con variables: `{{nombre}}`, `{{formacion}}`, `{{horas}}`, etc.
- CSS: centrado vertical y horizontal, fuente formal (Inter 400/600), bordes decorativos sutiles
- Opcion: dos formatos — "Certificado de asistencia" y "Certificado de aprovechamiento"
- `window.print()` con opcion de guardar como PDF (funcionalidad nativa del navegador)

**Lo que queda manual:**
- Laura decide cuando generar los certificados
- Laura revisa la lista de participantes certificables
- Laura firma/sella los certificados (si es necesario)
- Laura distribuye los certificados (email, entrega fisica)

**Impacto:**
- Tiempo ahorrado por formacion: 15-30 min (crear certificados en Word, personalizar uno a uno)
- Frecuencia: 30-80 formaciones/ano
- Estimacion: 8-40 horas/ano de ahorro
- Impacto legal: certificados requeridos para documentacion FUNDAE y para el empleado

**Coherencia:** Cierra otra pieza del ciclo FUNDAE. Hoy Laura usa Word/Publisher para esto. Automatizarlo dentro de la herramienta elimina la duplicacion de datos.

**Esfuerzo estimado:** 3-4 horas.

---

### A7: Tracking de formacion obligatoria con caducidades

**Prioridad:** #7 (frecuencia media x impacto muy alto x viabilidad media)

**Flujo determinista:**
```
[MANUAL] Laura define tipos de formacion obligatoria:
    |-- PRL General (periodicidad: anual, aplica a: todos)
    |-- PRL Puesto (periodicidad: segun puesto, aplica a: segun evaluacion riesgos)
    |-- LOPD/GDPR (periodicidad: anual, aplica a: todos)
    |-- Prevencion acoso (periodicidad: bianual, aplica a: todos)
    |-- Canal denuncias (periodicidad: al incorporarse, aplica a: todos)
    |-- [tipos custom]
    |
[MANUAL] Laura asocia tipos a departamentos/puestos/empleados
    |
[AUTO] Al cargar organigrama, cruzar empleados x tipos obligatorios
    |
[AUTO] Para cada par (empleado, tipo obligatorio):
    |-- Si hay registro de formacion completada:
    |     |-- Calcular fecha caducidad = fechaFormacion + periodicidad
    |     |-- Si caducidad > hoy + 90 dias → VERDE "Vigente"
    |     |-- Si caducidad <= hoy + 90 dias Y > hoy → AMARILLO "Caduca pronto"
    |     |-- Si caducidad <= hoy → ROJO "Caducada"
    |-- Si NO hay registro:
         → ROJO "Sin formacion registrada"
    |
[AUTO] Vista de compliance:
    |-- Tabla: empleados x tipos obligatorios con semaforo
    |-- Filtros: departamento, ubicacion, tipo de formacion, estado
    |-- Resumen: "87% de la plantilla con PRL vigente" / "12 empleados con LOPD caducada"
    |-- Exportacion a Excel
    |
[AUTO] Alertas en el motor de alertas (A1):
    |-- "5 empleados con PRL caducada o a punto de caducar"
    |-- Boton: "Crear convocatoria con empleados afectados"
    |
[MANUAL] Laura pulsa "Crear convocatoria"
    |
[AUTO] Pre-seleccionar empleados con formacion caducada/proxima a caducar
    |
[... flujo normal de convocatoria ...]
    |
[MANUAL] Laura registra asistencia
    |
[AUTO] Actualizar registro de compliance del empleado
    |
[AUTO] Recalcular fecha de caducidad
    |
[AUTO] Reiniciar ciclo de alertas
```

**Trigger:** Apertura de la app (evaluacion de caducidades) + accion manual de Laura (definir tipos, registrar completitud).

**Acciones automaticas:**
- Cruce automatico de empleados con obligaciones formativas
- Calculo de caducidades y semaforo
- Generacion de vista de gaps de compliance
- Pre-seleccion de empleados para convocatoria de renovacion
- Actualizacion automatica al registrar asistencia

**Datos necesarios:**
- Tipos de formacion obligatoria (nombre, periodicidad, ambito de aplicacion)
- Registros de completitud por empleado (fecha de ultima formacion por tipo)
- Organigrama con departamento/puesto (ya disponible)

**Implementacion tecnica:**

*Nuevo modelo de datos en localStorage:*
```javascript
state.complianceTypes = [
  { id: 'prl-general', name: 'PRL General', periodMonths: 12, scope: 'all' },
  { id: 'lopd', name: 'LOPD/GDPR', periodMonths: 12, scope: 'all' },
  { id: 'acoso', name: 'Prevencion acoso', periodMonths: 24, scope: 'all' },
  // ...
];

state.complianceRecords = [
  { employeeId: '_id_123', typeId: 'prl-general', completedDate: '2025-06-15', actionId: 'AF-034' },
  // ...
];
```

*UI:*
- Nueva sub-pestana en Catalogos: "Formacion obligatoria"
- Vista de configuracion: tabla de tipos editables
- Vista de compliance: matriz empleados x tipos con semaforo
- Integracion con motor de alertas (A1)

**Lo que queda manual:**
- Laura define los tipos de formacion obligatoria y su periodicidad
- Laura asocia tipos a ambitos (todos, departamento, puesto)
- Laura puede cargar registros historicos iniciales (importacion desde Excel)
- Laura gestiona las convocatorias de renovacion

**Impacto:**
- Tiempo ahorrado por revision: 30-60 min (revisar Excel de compliance, cruzar con organigrama, identificar gaps)
- Frecuencia: revision mensual/trimestral
- Estimacion: 6-12 horas/ano de ahorro
- Impacto legal: incumplimiento en PRL puede suponer sanciones de 2.046 a 40.985 EUR (graves) o 40.986 a 819.780 EUR (muy graves)
- Impacto estrategico: posiciona la herramienta como imprescindible para el cumplimiento normativo

**Coherencia:** Cubre la fase de formacion obligatoria que actualmente no tiene soporte (propuesta F2 del research de flujos). Conecta con el 30-50% del trabajo de Laura que es compliance.

**Esfuerzo estimado:** 8-10 horas.

---

### A8: Auto-sincronizacion convocatoria-catalogo con datos completos

**Prioridad:** #8 (frecuencia altisima x impacto medio x viabilidad excelente)

**Flujo determinista:**
```
[MANUAL] Laura envia convocatoria (ya existe)
    |
[AUTO] Buscar accion formativa vinculada en el catalogo:
    |-- Si existe accion vinculada:
    |     |-- [AUTO] Anadir participantes de la convocatoria a la accion
    |     |-- [AUTO] Crear sesiones de asistencia con las fechas de la convocatoria
    |     |-- [AUTO] Actualizar estado de la accion si procede:
    |     |     |-- Si fechaInicio <= hoy → "En marcha"
    |     |     |-- Si solo se ha enviado convocatoria → "Convocada"
    |     |-- [AUTO] Si la accion no tiene tutor y la convocatoria tiene formador → copiar
    |     |-- [AUTO] Si la accion no tiene centro y la convocatoria tiene ubicacion → copiar
    |-- Si NO existe accion vinculada:
         |-- [AUTO] Ofrecer "Crear accion formativa desde esta convocatoria"
         |-- [AUTO] Pre-rellenar accion con datos de la convocatoria
    |
[AUTO] Mostrar toast de confirmacion: "Accion PRL-003 actualizada: 15 participantes, 2 sesiones"
```

**Trigger:** Envio de convocatoria (ya parcialmente implementado).

**Acciones automaticas (ampliacion de lo existente):**
- La sincronizacion actual vincula participantes. Se amplia para:
  - Copiar datos de formador y ubicacion si faltan en la accion
  - Crear sesiones de asistencia automaticamente
  - Transicionar estado de la accion
  - Ofrecer creacion rapida de accion si no existe

**Datos necesarios:** Ya disponibles en la convocatoria y el catalogo.

**Implementacion tecnica:**
- Ampliar la funcion `syncConvocatoriaToAction()` existente
- Anadir logica de copia de campos faltantes (formador, ubicacion)
- Anadir creacion automatica de filas de asistencia por sesion
- Anadir transicion de estado con logica de fechas

**Lo que queda manual:**
- Laura elige si vincular con accion existente o crear nueva
- Laura completa los datos especificos FUNDAE que la convocatoria no tiene

**Impacto:**
- Tiempo ahorrado por convocatoria: 3-5 min (entrar al catalogo, buscar accion, actualizar manualmente)
- Frecuencia: 30-80 convocatorias/ano
- Estimacion: 2-7 horas/ano de ahorro
- Impacto en calidad de datos: reduce discrepancias entre convocatoria y catalogo

**Coherencia:** Refuerza la integracion entre las dos funciones core (Convocatoria + Catalogo FUNDAE). Cada click ahorrado en la sincronizacion es un momento de deleite.

**Esfuerzo estimado:** 2-3 horas.

---

### A9: Generacion automatica del informe para la RLT (balance anual)

**Prioridad:** #9 (frecuencia baja x impacto alto x viabilidad alta)

**Flujo determinista:**
```
[MANUAL] Laura pulsa "Generar balance anual para RLT"
    |
[AUTO] Filtrar acciones formativas del ejercicio (o ejercicio anterior)
    |
[AUTO] Calcular estadisticas:
    |-- Total de acciones formativas realizadas
    |-- Total de horas de formacion impartidas
    |-- Total de participantes (unicos)
    |-- Desglose por tipo: obligatoria / voluntaria / desarrollo
    |-- Desglose por modalidad: presencial / teleformacion / mixta
    |-- Desglose por departamento/area
    |-- Presupuesto ejecutado vs. planificado
    |-- Credito FUNDAE consumido vs. disponible
    |-- Satisfaccion media (si hay datos de encuestas)
    |
[AUTO] Generar documento HTML con formato profesional:
    |-- Titulo: "BALANCE DE ACCIONES FORMATIVAS - EJERCICIO [ano]"
    |-- Datos de empresa
    |-- Tablas con estadisticas
    |-- Listado de acciones con detalle basico
    |-- Fecha y espacio para firma
    |
[AUTO] Abrir vista previa / ventana de impresion
    |
[MANUAL] Laura revisa, imprime, y entrega a la RLT
```

**Trigger:** Laura pulsa boton (bajo demanda, tipicamente en diciembre/enero).

**Impacto:**
- Tiempo ahorrado: 2-4 horas (recopilar datos, crear presentacion, formatear)
- Frecuencia: 1-2 veces/ano
- Estimacion: 2-8 horas/ano de ahorro
- Impacto legal: el balance anual para la RLT es obligatorio por ley

**Esfuerzo estimado:** 2-3 horas.

---

### A10: Exportacion de calendario ICS

**Prioridad:** #10 (frecuencia media x impacto medio x viabilidad excelente)

**Flujo determinista:**
```
[MANUAL] Laura pulsa "Exportar calendario" en la pestana Calendario
    |
[AUTO] Recopilar acciones formativas visibles (segun filtros activos)
    |
[AUTO] Para cada accion con fechas:
    |-- Crear evento VCALENDAR:
    |     |-- SUMMARY: nombre de la formacion
    |     |-- DTSTART / DTEND: fechas y horas
    |     |-- LOCATION: centro/sala
    |     |-- DESCRIPTION: formador, participantes count, estado
    |     |-- STATUS: CONFIRMED / TENTATIVE (segun estado)
    |-- Si accion tiene multiples sesiones: un evento por sesion
    |
[AUTO] Generar archivo .ics (texto plano UTF-8)
    |
[AUTO] Ofrecer descarga del archivo
    |
[MANUAL] Laura importa en Outlook / Google Calendar
```

**Trigger:** Laura pulsa "Exportar .ics" en la pestana Calendario.

**Implementacion tecnica:**
```javascript
function generateICS(actions) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Formaciones//ES\n';
  actions.forEach(a => {
    if (!a.fechaInicio) return;
    ics += 'BEGIN:VEVENT\n';
    ics += 'DTSTART:' + formatICSDate(a.fechaInicio, a.horaInicio) + '\n';
    ics += 'DTEND:' + formatICSDate(a.fechaFin || a.fechaInicio, a.horaFin) + '\n';
    ics += 'SUMMARY:' + escapeICS(a.nombre) + '\n';
    ics += 'LOCATION:' + escapeICS(a.centro || '') + '\n';
    ics += 'DESCRIPTION:' + escapeICS(a.descripcion || '') + '\n';
    ics += 'END:VEVENT\n';
  });
  ics += 'END:VCALENDAR';
  downloadBlob(ics, 'formaciones.ics', 'text/calendar');
}
```

**Impacto:**
- Tiempo ahorrado: 5-10 min por exportacion
- Frecuencia: 2-4 veces/mes
- Estimacion: 2-8 horas/ano de ahorro

**Esfuerzo estimado:** 1-2 horas.

---

### A11: Auto-relleno de datos del grupo XML

**Prioridad:** #11 (frecuencia alta x impacto bajo x viabilidad excelente)

**Flujo determinista:**
```
[MANUAL] Laura abre el generador XML para una accion formativa
    |
[AUTO] Buscar datos de grupo previos para la misma empresa pagadora:
    |-- Si existen datos previos:
    |     |-- Pre-rellenar: ID grupo, responsable, telefono, email responsable
    |     |-- Toast: "Datos del grupo pre-rellenados desde la ultima generacion"
    |-- Si no existen datos previos:
         |-- Campos vacios (comportamiento actual)
    |
[MANUAL] Laura ajusta si es necesario
```

**Trigger:** Apertura del generador XML.

**Implementacion tecnica:**
- Guardar en `localStorage` los datos del grupo por CIF de empresa pagadora
- Key: `convocatoria_xmlGroupDefaults_${cif}`
- Al abrir generador XML: buscar y pre-rellenar
- Al generar XML: guardar los datos actuales como nuevos defaults

**Impacto:**
- Tiempo ahorrado: 1-2 min por generacion XML
- Frecuencia: 30-80 generaciones/ano
- Estimacion: 1-3 horas/ano de ahorro

**Esfuerzo estimado:** 1 hora.

---

### A12: Envio masivo de convocatorias via Power Automate

**Prioridad:** #12 (frecuencia media x impacto muy alto x viabilidad media-alta)

**Flujo determinista:**
```
[MANUAL] Laura configura convocatoria (asistentes, evento, datos)
    |
[MANUAL] Laura pulsa "Enviar via Power Automate" (alternativa al deeplink Outlook)
    |
[AUTO] Construir payload completo:
    {
      type: "convocatoria",
      to: ["email1@...", "email2@..."],
      subject: "Convocatoria: PRL Oficinas - 20/03/2026 10:00",
      body: "<html>...(email completo de convocatoria)...</html>",
      calendarEvent: {
        start: "2026-03-20T10:00:00",
        end: "2026-03-20T14:00:00",
        location: "Sala Formacion Planta 3",
        subject: "PRL Oficinas Madrid"
      }
    }
    |
[AUTO] Enviar al webhook PA
    |
[AUTO] PA recibe y envia email via Outlook connector
    |-- Si calendarEvent presente: crear tambien evento de calendario
    |-- Enviar a todos los destinatarios en un unico email (o en lotes de 50)
    |
[AUTO] PA responde 200/202
    |
[AUTO] Registrar en historial como "enviada via PA"
    |
[AUTO] Sincronizar con accion formativa (A8)
    |
[AUTO] Programar recordatorio si configurado (A2)
    |
[AUTO] Programar encuesta si configurada (ya existe)
```

**Trigger:** Laura pulsa "Enviar via Power Automate".

**Acciones automaticas:**
- Construir email completo con HTML formateado
- Enviar al webhook PA en un unico POST
- PA se encarga de enviar el email real (sin limites de URL, sin pop-up blockers)
- Registrar envio, sincronizar, programar acciones futuras

**Datos necesarios:**
- Datos del evento (ya disponibles)
- Lista de emails (ya disponible)
- Cuerpo del email HTML (ya generado para el deeplink)
- URL del webhook PA (ya configurado)

**Implementacion tecnica:**

*En convocatoria.html:*
- Nuevo boton junto a "Abrir en Outlook": "Enviar via Power Automate"
- Reutilizar `buildSurveyPayload` como patron, con `type: "convocatoria"`
- Usar la misma funcion `fetch()` con el webhook existente

*En Power Automate (ampliacion del flujo):*
- Nuevo branch: `if type == 'convocatoria'`
- Accion "Send an email (V2)" del conector Outlook/Office 365
- Si el payload incluye `calendarEvent`: accion adicional "Create event (V4)" del conector Calendar

**Lo que queda manual:**
- Laura decide cuando enviar
- Laura verifica los datos antes del envio
- Laura no necesita interactuar con Outlook directamente

**Impacto:**
- Tiempo ahorrado por convocatoria: 5-15 min (elimina deeplink, pop-ups, copy-paste de emails >50)
- Frecuencia: 30-80 convocatorias/ano
- Estimacion: 3-20 horas/ano de ahorro
- Impacto en fiabilidad: elimina el problema de pop-up blockers y limite de URL
- Impacto en series: las 8 sesiones se envian con un solo click

**Coherencia:** Es la P2 del spec de empatia (envio por lotes via PA). Transforma la herramienta de "preparadora de convocatorias" a "herramienta que envia convocatorias". El mayor salto cualitativo posible.

**Esfuerzo estimado:** 8-12 horas (requiere ampliar significativamente el flujo PA).

---

### A13: Panel persistente de calidad de datos

**Prioridad:** #13 (frecuencia alta x impacto medio x viabilidad excelente)

**Flujo determinista:**
```
[AUTO] Al cargar un Excel:
    |
[AUTO] Ejecutar validaciones sobre todos los empleados:
    |-- Emails invalidos: count + lista
    |-- NIFs duplicados: count + lista
    |-- Empleados sin email: count + lista
    |-- NIFs con formato invalido: count + lista
    |-- Empleados sin departamento: count + lista
    |-- Empleados sin puesto: count + lista
    |
[AUTO] Generar resumen de calidad:
    |-- "347 empleados cargados"
    |-- "12 sin email"
    |-- "3 NIFs duplicados"
    |-- "2 emails invalidos"
    |
[AUTO] Mostrar panel colapsable PERSISTENTE (no toast):
    |-- Barra de resumen siempre visible: "12 avisos de calidad"
    |-- Click para expandir: lista detallada de problemas
    |-- Cada problema clickable: "Maria Garcia (sin email)" → resaltar en tabla
```

**Trigger:** Carga de Excel (ya se ejecutan las validaciones; la diferencia es como se muestra el resultado).

**Impacto:**
- Elimina la incertidumbre de "habia algo mal y no lo vi" (toast efimero)
- Permite actuar cuando convenga, no en los 5 segundos del toast
- Frecuencia: cada vez que se carga un Excel (1-4 veces/mes)

**Esfuerzo estimado:** 2-3 horas.

---

### A14: Duplicar accion formativa

**Prioridad:** #14 (frecuencia media x impacto medio x viabilidad excelente)

**Flujo determinista:**
```
[MANUAL] Laura pulsa "Duplicar" en la ficha de una accion formativa
    |
[AUTO] Crear copia de la accion con:
    |-- Datos copiados: titulo, modalidad, horas, centro, tutor, objetivos,
    |   contenidos, area profesional, nivel, competencia, tipo convocatoria,
    |   proveedor, coste, instrucciones
    |-- Datos LIMPIADOS: participantes, asistencia, sesiones, fechas,
    |   estado (→ "En preparacion"), comunicaciones FUNDAE, RLT
    |-- Titulo: "Copia de [nombre original]"
    |
[AUTO] Abrir ficha de la nueva accion para edicion
    |
[MANUAL] Laura ajusta: titulo, fechas, centro, participantes
```

**Trigger:** Laura pulsa "Duplicar" en la ficha de la accion.

**Impacto:**
- Tiempo ahorrado: 5-10 min (crear accion desde cero con los mismos datos base)
- Frecuencia: 10-30 veces/ano (formaciones recurrentes: PRL, idiomas, compliance)
- Estimacion: 1-5 horas/ano de ahorro

**Esfuerzo estimado:** 1-2 horas.

---

### A15: Reenvio automatico de encuesta de satisfaccion

**Prioridad:** #15 (frecuencia media x impacto bajo-medio x viabilidad buena)

**Flujo determinista:**
```
[AUTO] Al enviar encuesta de satisfaccion (ya implementado):
    |
[AUTO] Programar reenvio via PA:
    {
      type: "survey_reminder",
      to: [mismos emails],
      subject: "Recordatorio: Tu opinion sobre [formacion]",
      body: "<html>...(mismo enlace MS Forms)...</html>",
      scheduledTime: fechaEncuestaOriginal + 7 dias
    }
    |
[AUTO] PA espera 7 dias
    |
[AUTO] PA envia recordatorio de encuesta
```

**Trigger:** Envio de la encuesta original (automatico, vinculado al flujo existente).

**Nota:** Este flujo no sabe quien ha respondido (MS Forms es externo). Envia el reenvio a TODOS. Quienes ya respondieron simplemente lo ignoran. Es una limitacion aceptable para el ratio esfuerzo/beneficio.

**Impacto:**
- Mejora la tasa de respuesta un 15-25% (dato estandar de email marketing)
- Sin coste de tiempo para Laura (100% automatico)

**Esfuerzo estimado:** 1-2 horas (extension minima del flujo PA).

---

## PARTE III: PRIORIZACION Y HOJA DE RUTA

---

### Matriz de priorizacion

La puntuacion se calcula como: **(frecuencia x impacto x viabilidad) / esfuerzo**

| # | Automatizacion | Frecuencia | Impacto | Viabilidad | Esfuerzo | Puntuacion | Requisitos previos |
|---|---------------|-----------|---------|-----------|---------|-----------|-------------------|
| **A1** | Motor de alertas y plazos | Diaria | Alto | Excelente | 3-4h | **36** | Ninguno |
| **A14** | Duplicar accion formativa | Mensual | Medio | Excelente | 1-2h | **30** | Ninguno |
| **A11** | Auto-relleno grupo XML | Semanal | Bajo | Excelente | 1h | **27** | Ninguno |
| **A13** | Panel calidad de datos | Semanal | Medio | Excelente | 2-3h | **24** | Ninguno |
| **A10** | Exportacion ICS | Semanal | Medio | Excelente | 1-2h | **24** | Ninguno |
| **A4** | Semaforo readiness FUNDAE | Semanal | Alto | Excelente | 4-5h | **22** | Ninguno |
| **A5** | Hojas de firmas | Semanal | Medio | Excelente | 2-3h | **20** | Ninguno |
| **A8** | Sync convocatoria-catalogo++ | Semanal | Medio | Excelente | 2-3h | **20** | Ninguno |
| **A2** | Recordatorios via PA | Semanal | Alto | Alta | 3-4h | **18** | Webhook PA configurado |
| **A6** | Certificados de asistencia | Mensual | Medio | Buena | 3-4h | **15** | Asistencia registrada |
| **A3** | Comunicacion RLT | Trimestral | Muy alto | Alta | 4-5h | **14** | Ninguno |
| **A9** | Informe RLT anual | Anual | Alto | Alta | 2-3h | **12** | Acciones del ejercicio |
| **A15** | Reenvio encuesta | Semanal | Bajo | Buena | 1-2h | **12** | Encuestas PA configuradas |
| **A7** | Compliance/caducidades | Mensual | Muy alto | Media | 8-10h | **10** | Nuevo modelo de datos |
| **A12** | Envio via PA | Semanal | Muy alto | Media-Alta | 8-12h | **9** | Flujo PA ampliado |

---

### Hoja de ruta propuesta

#### Fase 1 — "Quick wins" (1-2 dias, ~10h)
Automatizaciones que se implementan sin dependencias externas, con impacto inmediato.

1. **A14: Duplicar accion formativa** (1-2h) — Maxima ratio impacto/esfuerzo
2. **A11: Auto-relleno grupo XML** (1h) — Trivial pero elimina una molestia recurrente
3. **A13: Panel calidad de datos** (2-3h) — Elimina incertidumbre al cargar Excel
4. **A10: Exportacion ICS** (1-2h) — Funcionalidad muy solicitada, implementacion sencilla
5. **A5: Hojas de firmas** (2-3h) — Documento legal esencial, facil de generar

**Resultado Fase 1:** Laura abre la app y encuentra 5 mejoras que le ahorran tiempo cada dia. Sin configuracion adicional.

#### Fase 2 — "Inteligencia preventiva" (2-3 dias, ~12h)
Automatizaciones que previenen errores y anticipan problemas.

6. **A1: Motor de alertas y plazos** (3-4h) — El sistema nervioso central de la herramienta
7. **A4: Semaforo readiness FUNDAE** (4-5h) — Elimina el peak negativo del mapa emocional
8. **A8: Sync convocatoria-catalogo++** (2-3h) — Reduce duplicacion de datos

**Resultado Fase 2:** Laura nunca mas se sorprende con un plazo vencido ni con datos incompletos al generar XML.

#### Fase 3 — "Documentos y compliance" (2-3 dias, ~14h)
Automatizaciones que generan documentos legales y cubren obligaciones de compliance.

9. **A3: Comunicacion RLT** (4-5h) — Requisito legal cubierto automaticamente
10. **A6: Certificados de asistencia** (3-4h) — Cierra el ciclo post-formacion
11. **A9: Informe RLT anual** (2-3h) — Obligacion anual resuelta con un click
12. **A7: Compliance/caducidades** (8-10h) — Posiciona la herramienta como imprescindible para compliance

**Resultado Fase 3:** Laura genera toda la documentacion legal desde la herramienta. No necesita Word ni Excel para ningun documento de formacion.

#### Fase 4 — "Power Automate avanzado" (2-3 dias, ~12h)
Automatizaciones que requieren ampliar la integracion con Power Automate.

13. **A2: Recordatorios via PA** (3-4h) — Recordatorios automaticos pre-formacion
14. **A15: Reenvio encuesta** (1-2h) — Mejora tasa de respuesta de encuestas
15. **A12: Envio masivo via PA** (8-12h) — Envio de convocatorias sin limite de URL ni pop-ups

**Resultado Fase 4:** Laura envia convocatorias, recordatorios y encuestas desde la herramienta sin tocar Outlook. El flujo es 100% autocontenido.

---

### Tiempo total estimado

| Fase | Horas | Automatizaciones | Impacto acumulado |
|------|-------|-----------------|-------------------|
| Fase 1 | ~10h | 5 quick wins | Laura ahorra 10-20 min/dia |
| Fase 2 | ~12h | 3 preventivas | Laura nunca pierde un plazo |
| Fase 3 | ~14h | 4 documentales | Laura genera toda la documentacion legal |
| Fase 4 | ~12h | 3 PA avanzadas | Laura no necesita Outlook |
| **TOTAL** | **~48h** | **15 automatizaciones** | **50-100 horas/ano ahorradas** |

---

### Principios de diseno para las automatizaciones

1. **Preparar, no ejecutar.** La herramienta prepara todo; Laura decide y confirma. Esto mantiene la confianza y el control.

2. **Alertar, no bloquear.** Los avisos son informativos, no modales. Laura puede ignorar una alerta si sabe que no aplica (ej: accion no bonificada, no necesita XML).

3. **Progresivo, no abrumador.** Las automatizaciones se activan a medida que Laura introduce datos. Una accion con solo un titulo no genera alertas. Una accion con fechas, participantes y datos FUNDAE genera un semaforo completo.

4. **Visible, no oculto.** Cada accion automatica produce feedback visible: un toast, un cambio de estado, un indicador visual. Laura siempre sabe que ha hecho la herramienta.

5. **Determinista, no probabilistico.** Cero IA, cero heuristicas, cero "quizas". Si la regla se cumple, la accion se ejecuta. Si no se cumple, no se ejecuta. Siempre.

6. **Offline-first, PA-second.** Todo lo que se puede hacer en el navegador se hace en el navegador. Solo se usa Power Automate para lo que REQUIERE un servidor: enviar emails, esperar hasta una fecha futura, interactuar con APIs externas.

7. **Datos existentes primero.** Ninguna automatizacion debe requerir datos que Laura no tenga ya. Si los datos estan en el catalogo, el organigrama o el historial, la herramienta los usa directamente.

---

## FUENTES

### Automatizaciones y workflows en LMS
- [Docebo: 7 Ways LMS Workflow Automation Can Save You Time](https://www.docebo.com/learning-network/blog/lms-workflow-automation/)
- [Docebo: How to Automate Compliance Training](https://www.docebo.com/learning-network/blog/how-to-automate-compliance-training/)
- [Docebo: Creating a rule for the Automation app](https://help.docebo.com/hc/en-us/articles/360020082520-Creating-a-rule-for-the-Automation-app)
- [Absorb LMS: How to boost training completion rates with automated reminders](https://www.absorblms.com/resources/articles/how-to-boost-training-completion-rates-with-automated-training-reminders)
- [Absorb LMS: Best ways to track certifications](https://www.absorblms.com/resources/articles/training-certification-tracking-management)
- [D2L: LMS for Compliance Training](https://www.d2l.com/blog/lms-compliance-training/)
- [Moodle Workplace: Simplify, automate & track compliance training](https://moodle.com/news/simplify-automate-and-track-compliance-training-with-moodle-workplace/)
- [360Learning: Compliance Training](https://360learning.com/use-cases/compliance-training/)

### Plataformas enterprise
- [SAP SuccessFactors: Learning Reminder Notifications](https://userapps.support.sap.com/sap/support/knowledge/en/3532489)
- [SAP SuccessFactors: Configuring Workflows](https://learning.sap.com/learning-journeys/configure-sap-successfactors-employee-central-core/configuring-workflows-during-implementation_a0840dea-10fb-4626-bd53-7c3795cbf3b8)
- [Cornerstone OnDemand: Learning Management System](https://www.cornerstoneondemand.com/platform/learning-management-lms/)
- [Workday Learning: Features and Guide](https://www.training-central.net/2026/01/06/workday-learning/)
- [Workday: Learning Management System](https://www.workday.com/en-us/products/talent-management/learning.html)

### Herramientas FUNDAE especializadas
- [Gesbon: Software ERP Formacion Bonificada](https://www.gesbon.es/)
- [Softmetry: Automatizacion comunicaciones a FUNDAE](https://www.softmetry.com/automatizar-fundae/)
- [Sipadan GIF: Software Gestion Formacion](https://www.sipadan.es/programa-gestion-formacion/)
- [Sipadan: Automatizacion formaciones obligatorias](https://sipadan.es/automatizacion-formaciones-obligatoria)
- [Factorial HR: Automatizar bonificacion FUNDAE con XML](https://help.factorialhr.com/es_ES/formaciones/automate-the-fundae-subsidisation-process-with-the-training-xml)
- [Bonificado Formacion](https://bonificado.es/)

### FUNDAE plazos y normativa
- [Autoforma: Plazos para comunicar y realizar modificaciones en FUNDAE](https://autoforma.es/plazos-para-comunicar-y-realizar-modificaciones-en-fundae/)
- [Autoforma: Informacion a la RLT: 15 dias o caracter preceptivo](https://autoforma.es/informacion-a-la-representacion-legal-de-los-trabajadores-15-dias-o-caracter-preceptivo/)
- [Autoforma: El mito de los 15 dias](https://autoforma.es/el-mito-de-los-15-dias-cuando-informar-a-la-rlt-sobre-la-formacion/)
- [FUNDAE: Bonificacion acciones programadas](https://www.fundae.es/empresas/home/como-bonificarte/bonificaci%C3%B3n-acciones-programadas)
- [ADR Formacion: Comunicacion de inicio FUNDAE](https://www.adrformacion.com/blog/comunicacion_de_inicio_fundae.html)
- [Plataforma SELF: Como calcular el credito disponible FUNDAE](https://www.plataformaself.com/recursos/bonificacion-fundae-02-1-calcular-credito)

### RPA y automatizacion HR
- [UiPath: How Modern Companies Automate HR Processes with RPA](https://www.uipath.com/blog/industry-solutions/hr-automation-rpa)
- [Itransition: RPA in Human Resources](https://www.itransition.com/rpa/hr)
- [FlowForma: Top 21 HR Automation Trends](https://www.flowforma.com/blog/hr-automation-trends)

### Automatizacion de documentos
- [Power Automate: Automate Bulk Certificate Generation](https://www.build-automate-ai-repeat.com/blogs/bulk-document-generation-for-large-data-sets-with-power-automate)
- [DocuGenerate: Automate PDF Certificate Generation](https://www.docugenerate.com/blog/automate-pdf-certificate-generation-with-flowrunner/)
- [Microsoft Learn: Automate document generation](https://learn.microsoft.com/en-us/microsoft-365/documentprocessing/automate-document-generation)

### Lo que no automatizar
- [Predictive Index: What Happens When AI Replaces Human Judgment in HR](https://www.predictiveindex.com/blog/ai-in-hr-hiring-decisions/)
- [InvigorateHR: Which HR Tasks Should (And Shouldn't) Be Automated](https://www.invigoratehr.com/post/which-hr-tasks-should-and-shouldn-t-be-automated)
- [Xenia: HR Automation: What It Is, Where It Pays Off](https://www.xenia.team/articles/hr-automation)

### Notificaciones y calendario
- [MDN: Using the Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)
- [Chrome Developers: Notification Triggers API](https://developer.chrome.com/docs/web-platform/notification-triggers)
- [ExpirationReminder: Training Tracking Software](https://www.expirationreminder.com/solutions/training-tracking-software)
