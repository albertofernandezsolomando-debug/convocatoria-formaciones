# Spec Consolidado — Gestion Integral de Formacion

**Fecha:** 14 de marzo de 2026
**Tipo:** Spec de implementacion consolidado y reconciliado (revision 3 — automatizaciones integradas)
**Fuentes:** 3 specs originales + 2 research (UI/UX + flujos RRHH) + 3 revisiones cruzadas + 1 research de automatizaciones deterministas
**Archivo objetivo:** `convocatoria.html` (~15.500 lineas, single-file HTML app)

---

## Narrativa del producto

### Nombre del producto

> **Formación_AGORA**

**Justificacion del nombre:**

- **"Formación"** identifica el dominio: gestion de formacion corporativa.
- **"AGORA"** como espacio donde confluyen todos los flujos de formacion. El guion bajo da caracter tecnico/moderno.
- No se limita a FUNDAE ni a convocatorias. Tampoco es generico hasta ser vacio.
- Sustituye a "Convocatoria de Formaciones" (describia una funcionalidad, no un producto) y a "Formaciones FUNDAE" (limitaba la identidad a un solo flujo regulatorio).
- Aplicacion practica: `<title>Formación_AGORA</title>`, `.app-header-title` muestra "Formación_AGORA".

### Desglose

- **Herramienta de escritorio:** No es un SaaS ni una plataforma departamental. Es un fichero HTML que funciona abriendo en el navegador. Sin servidores, sin licencias, sin TI.
- **Gestoras de formacion:** La usuaria principal es Laura, 38 anos, responsable de formacion en un grupo empresarial con 4-6 sociedades y 500-2.000 personas trabajadoras. No es directora de RRHH ni desarrolladora.
- **Todo el ciclo de formacion:** No solo el ciclo FUNDAE. Cubre el ciclo completo de gestion de formacion corporativa: deteccion de necesidades, planificacion, sourcing, logistica, convocatoria, ejecucion, evaluacion, compliance y reporting. FUNDAE es un flujo regulatorio critico dentro de ese ciclo, no el unico.
- **Cumplimiento normativo:** FUNDAE (formacion bonificada), comunicacion a la RLT, formacion obligatoria (PRL, LOPD, acoso), documentacion para inspeccion — el departamento de formacion tiene obligaciones legales que la herramienta cubre de forma nativa.
- **Sin necesitar nada de TI:** Zero-deployment, zero-cost, datos en localStorage. La autonomia es la ventaja competitiva principal.
- **Automatizada donde importa:** La herramienta automatiza la PREPARACION y la DETECCION — plazos, alertas, documentos, validaciones, sincronizaciones — para que Laura solo tenga que decidir y confirmar. Las automatizaciones son deterministas (si X entonces Y, siempre) y funcionan sin IA, sin servidor, sin ambiguedad.

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
| 2. Planificacion y presupuesto | Baja | Media-Alta — plan anual, simulacion de credito con alertas de umbral |
| 3. Diseno y sourcing | Media-Baja | Media — catalogo de proveedores con evaluacion |
| 4. Logistica y convocatoria | **Alta** (core existente) | **Muy alta** — lotes, recordatorios automaticos via PA, listas de espera, sync automatica con catalogo |
| 5. Ejecucion y seguimiento | Media | **Muy alta** — asistencia, hojas de firmas auto-generadas, certificados, checklist readiness FUNDAE, motor de alertas |
| 6. Evaluacion | Media-Baja | Media-Alta — Kirkpatrick L1-L2 integrado con encuestas + reenvio automatico |
| 7. Reporting y compliance | Media | **Muy alta** — RLT auto-generada, inspeccion, informe Direccion, formacion obligatoria con caducidades |

Ademas, cubre los flujos especificos de Espana:
- **Ciclo FUNDAE completo** (comunicacion inicio/fin, XML con auto-relleno de datos de grupo, bonificacion, credito con simulacion)
- **Comunicacion a la RLT** (generacion automatica de documento, plazos con auto-transicion de estado, estados)
- **Formacion obligatoria** con tracking automatico de caducidades (PRL, LOPD, acoso, canal de denuncias)
- **Documentacion para inspeccion** (dossier con checklist de evidencias, hojas de firmas y certificados generados)

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
| La aplicacion | **Formación_AGORA** | "Convocatoria de Formaciones", "Formaciones FUNDAE" | Nombre decidido; refleja alcance completo |
| Persona del organigrama Excel | **Persona trabajadora** | "Trabajador/a", "Empleado/a" | Termino inclusivo y neutral |
| Persona trabajadora seleccionada para una convocatoria | **Persona destinataria** | "Asistente" en contexto de envio | "Asistente" confunde con "asistio"; "Participante" es FUNDAE |
| Persona trabajadora registrada en accion FUNDAE | **Participante** | "Asistente" en contexto FUNDAE | Es el termino oficial FUNDAE. Solo en catalogos, XML y dashboard. |
| Acto de enviar invitaciones | **Convocar** / **Convocatoria** | — | Se mantiene el verbo del dominio. |
| Email que recibe la persona trabajadora | **Invitacion** | "Convocatoria" cuando se refiere al email | Distingue el email del acto de convocar. |
| Registro del catalogo | **Accion formativa** | "Formacion" (cuando hay ambiguedad), "Curso" | Termino oficial FUNDAE. |
| Evento con fecha y hora | **Sesion** | "Evento" (cuando hay ambiguedad) | Distingue la sesion puntual de la accion formativa completa. |
| Datos del organigrama | **Censo** / **Organigrama** | "Datos", "Excel" (cuando se refiere al contenido) | "Datos" es demasiado generico. |
| Proveedor de formacion | **Proveedor** | "Empresa formadora" | Consistencia. |
| Persona que imparte la formacion | **Formador/a** | "Tutor/a" en la UI general | FUNDAE usa "tutor/a", pero la UI puede ser mas natural. Mantener "tutor/a" solo en contexto XML. |
| Formacion obligatoria por ley | **Formacion obligatoria** | "Formacion legal", "Formacion regulatoria", "Formacion de compliance" | Termino directo y comprensible en el contexto normativo espanol |
| Representacion Legal de los Trabajadores | **RLT** | "Sindicatos", "Comite de empresa" | Termino legal correcto, cubre todas las formas de representacion |
| Vencimiento de una formacion obligatoria | **Caducidad** | "Expiracion", "Vencimiento" | Termino natural en espanol para este contexto |
| Conjunto de documentos para la ITSS | **Dossier de inspeccion** | "Expediente", "Carpeta" | Distingue claramente la funcion |
| Informe periodico para Direccion | **Informe de ejecucion** | "Report", "Dashboard export" | Termino que Laura usa naturalmente |
| Plan anual aprobado por Direccion | **Plan de formacion** | "Roadmap", "Planificacion" | Termino de RRHH establecido |

**Regla de transicion semantica:** Una persona trabajadora se convierte en persona destinataria al seleccionarla para una convocatoria. Se convierte en participante al registrarla en una accion formativa del catalogo FUNDAE. Esta transicion refleja la transicion funcional real: Convocatoria -> Catalogo.

---

## Principios de automatizacion

Derivados del research de automatizaciones deterministas. Rigen el diseno e implementacion de todas las automatizaciones de la herramienta.

### Regla de oro

> **Automatizar la PREPARACION y la DETECCION, no la EJECUCION.** Laura decide cuando enviar, pero la herramienta le prepara todo para que sea un solo click. Laura decide si actua ante una alerta, pero la herramienta se asegura de que la alerta llegue a tiempo.

### 7 principios de diseno

1. **Preparar, no ejecutar.** La herramienta prepara todo; Laura decide y confirma. Esto mantiene la confianza y el control.
2. **Alertar, no bloquear.** Los avisos son informativos, no modales. Laura puede ignorar una alerta si sabe que no aplica (ej: accion no bonificada, no necesita XML).
3. **Progresivo, no abrumador.** Las automatizaciones se activan a medida que Laura introduce datos. Una accion con solo un titulo no genera alertas. Una accion con fechas, participantes y datos FUNDAE genera un checklist de readiness completo.
4. **Visible, no oculto.** Cada accion automatica produce feedback visible: un toast, un cambio de estado, un indicador visual. Laura siempre sabe que ha hecho la herramienta.
5. **Determinista, no probabilistico.** Cero IA, cero heuristicas, cero "quizas". Si la regla se cumple, la accion se ejecuta. Si no se cumple, no se ejecuta. Siempre.
6. **Offline-first, PA-second.** Todo lo que se puede hacer en el navegador se hace en el navegador. Solo se usa Power Automate para lo que REQUIERE un servidor: enviar emails, esperar hasta una fecha futura, interactuar con APIs externas.
7. **Datos existentes primero.** Ninguna automatizacion debe requerir datos que Laura no tenga ya. Si los datos estan en el catalogo, el organigrama o el historial, la herramienta los usa directamente.

### Anti-patrones (lo que NO automatizar)

| Anti-patron | Descripcion | Consecuencia |
|------------|-------------|--------------|
| **Automatizar la decision de enviar** | Enviar convocatorias automaticamente sin revision de Laura | Errores en datos, envios a personas incorrectas, perdida de control |
| **Sobre-notificar** | Enviar demasiados recordatorios/alertas | "Fatiga de notificaciones": Laura ignora todas, incluidas las criticas |
| **Automatizar sin feedback** | Ejecutar acciones sin confirmar a Laura que se ejecutaron | Incertidumbre: "se envio la encuesta o no?" |
| **Encadenar sin puntos de control** | Flujos de 10+ pasos sin que Laura pueda verificar estados intermedios | Errores que se propagan en cascada sin deteccion |
| **Automatizar excepciones** | Intentar cubrir con reglas todos los casos borde | Complejidad explosiva, reglas contradictorias, mantenimiento imposible |
| **Confiar en plazos del navegador** | Programar acciones futuras que dependen de que el navegador este abierto | Acciones perdidas si Laura cierra el navegador o apaga el PC |

### Decisiones que requieren juicio humano (no automatizables)

- Seleccion de participantes para formacion voluntaria
- Eleccion de proveedor/formador
- Aprobacion de excepciones presupuestarias
- Evaluacion de la transferencia (Kirkpatrick L3-L4)
- Gestion de conflictos de agenda complejos
- Diseno de itinerarios formativos
- Cancelar formacion por baja asistencia
- Aceptar sustituto de ultimo momento
- Gestionar discrepancias con la RLT

### Contexto tecnico para automatizaciones

| Aspecto | Realidad |
|---------|---------|
| **Arquitectura** | HTML single-file, sin servidor, sin build |
| **Persistencia** | localStorage (limite ~5-10 MB) |
| **Acciones externas** | Webhook a Power Automate (ya implementado para encuestas) |
| **Limitacion critica** | No puede ejecutar acciones cuando el navegador esta cerrado |
| **Capacidad de envio** | Via Outlook deeplink (limitado) o via webhook PA (robusto) |
| **Generacion de documentos** | HTML imprimible, XML, CSV/Excel (SheetJS), ICS, ZIP |

**Implicacion:** Las automatizaciones "al abrir la app" y "al cambiar estado" son viables en JS nativo. Las automatizaciones temporales programadas (recordatorios, encuestas con delay) REQUIEREN Power Automate. Las notificaciones push no son posibles sin Service Worker.

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

**Que:** Aplicar el glosario vinculante en toda la UI: sustituir "asistentes" por "personas destinatarias" en el flujo de convocatoria, "trabajadores" por "personas trabajadoras", etc. Actualizar tooltips, labels, mensajes de toast, textos de ayuda.

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

**Que:** Cambiar "Convocatoria de Formaciones" por "Formación_AGORA" en `<title>` (linea 6), `.app-header-title` y cualquier referencia visible.

**Por que:** El nombre actual describe una funcionalidad (convocar), no un producto. El nuevo nombre refleja el alcance completo (gestion integral de formacion) sin limitarse a FUNDAE. Con la vision amplia que cubre las 7 fases del ciclo L&D, un nombre que solo diga "convocatoria" o "FUNDAE" subestima la herramienta.

**Como:** Buscar y reemplazar el nombre en todo el HTML. Actualizar el `<title>` y el texto del header.

**Fase:** 0.
**Esfuerzo:** Muy bajo (15 min).
**Impacto:** Medio — alinea la identidad con la vision amplia del producto.

---

### Fase 1: Quick wins funcionales

**Objetivo:** Mejoras de bajo esfuerzo y alto impacto que Laura nota inmediatamente. Se priorizan las propuestas que eliminan blockers, reducen repeticion, y dan seguridad. Incluye automatizaciones triviales que no requieren configuracion.

**Duracion estimada:** 4-5 dias

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

**Automatizacion (A14):**
- **Trigger:** Laura pulsa "Duplicar" en la ficha de la accion.
- **Acciones automaticas:** Crear copia con datos copiados (titulo, modalidad, horas, centro, tutor, objetivos, contenidos, area profesional, nivel, competencia, tipo convocatoria, proveedor, coste, instrucciones) y datos limpiados (participantes, asistencia, sesiones, fechas, estado → "En preparacion", comunicaciones FUNDAE, RLT). Titulo automatico: "Copia de [nombre original]". Abrir ficha de la nueva accion para edicion.
- **Lo que queda manual:** Laura ajusta titulo, fechas, centro, participantes.
- **Implementacion:** JS nativo. Copia profunda del objeto, limpieza de campos, nuevo ID.

**Fase:** 1.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Alto — para 30+ acciones anuales similares, el ahorro acumulado es de horas.

---

#### F1.3 — Alertas proactivas al abrir la app (Motor de alertas)

**Que:** Al abrir la app, si hay plazos FUNDAE en las proximas 48h o formaciones obligatorias proximas a caducar, mostrar un banner sticky no-bloqueante con los plazos pendientes. Laura puede cerrarlo con un click. Ademas, recalcular alertas al cambiar de pestana al dashboard y cada 60 minutos si la app esta abierta.

**Por que:** Laura no abre el dashboard cada dia. Las alertas deben ir a ella, no esperar a que ella las busque. Previene incumplimiento de plazos FUNDAE (potencial sancion) y caducidades de formacion obligatoria.

**Automatizacion (A1 — Motor de alertas y plazos):**
- **Trigger:** Apertura de la app + cambio de pestana + cada 60 minutos si la app esta abierta (`setInterval(60000)`).
- **Acciones automaticas:**
  - Recorrer todas las acciones formativas del catalogo.
  - Evaluar reglas de plazo:
    - Si `fechaInicio - hoy <= 2 dias habiles` Y estado != "Inicio comunicado" → Alerta ROJA: "Comunica inicio de [nombre] a FUNDAE (plazo: [fecha])"
    - Si `fechaFin` pasada Y estado != "Fin comunicado" Y estado != "Cerrada" → Alerta ROJA: "Comunica finalizacion de [nombre] a FUNDAE"
    - Si `fechaInicio - hoy <= 5 dias` Y estado == "En preparacion" → Alerta AMARILLA: "Formacion [nombre] en 5 dias, aun en preparacion"
    - Si `fechaComunicacionRLT + 15 dias habiles <= hoy` Y estadoRLT == "Enviada" → AUTO: marcar RLT como "Sin objeciones (plazo vencido)"
    - Si `creditoConsumido / creditoTotal >= 0.8` → Alerta AMARILLA: "Credito FUNDAE al [X]%"
    - Si `creditoConsumido / creditoTotal >= 0.95` → Alerta ROJA: "Credito FUNDAE casi agotado"
  - Mostrar alertas ordenadas por urgencia en: banner resumido en pestana Convocatoria ("3 alertas pendientes") + panel completo en Dashboard con acciones directas.
  - Cada alerta con boton de accion directa ("Generar XML", "Marcar como comunicado", "Ver accion").
- **Lo que queda manual:** Laura decide cuando actuar ante cada alerta. Laura sube los XMLs a FUNDAE manualmente. Laura gestiona las discrepancias con la RLT.
- **Implementacion:** JS nativo al 100%. Funcion `evaluateAlerts()` que recorre `state.catalogActions` y genera array de alertas. Se ejecuta en `onTabChange()`, `onAppLoad()` y con `setInterval(60000)`. Las alertas ya existen parcialmente en el dashboard (`dash-alerts-widget`); se reutiliza y amplia la logica. Nuevo componente: banner ligero en la pestana Convocatoria (2-3 lineas HTML).
- **Datos necesarios:** Acciones formativas del catalogo (fechas, estados, participantes), configuracion de plazos (ya existe: `diasAvisoInicio`, `diasAvisoFin`), datos de comunicacion RLT (fecha envio, estado), credito FUNDAE (ya existe en dashboard).

**Fase:** 1.
**Esfuerzo:** Bajo-Medio (3-4h — la logica de plazos FUNDAE ya existe; se amplia y se muestra fuera del dashboard).
**Impacto:** Muy alto — previene incumplimientos legales. Ahorro estimado: 30-60 min/semana.

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

**Que:** Al cargar un archivo exitosamente, check SVG animado con `stroke-dasharray`/`stroke-dashoffset`. Sin ring expansivo, sin scale.

**Por que:** La carga del Excel es el primer momento significativo de la experiencia. Stripe payment success — un gesto limpio, una sola animacion.

**Como:** Animacion SVG draw para el check con `stroke-dasharray`/`stroke-dashoffset`. Sin `scale()`, sin `box-shadow` ring.

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

**Automatizacion (A11):**
- **Trigger:** Apertura del generador XML para una accion formativa.
- **Acciones automaticas:** Buscar datos de grupo previos en localStorage por CIF de empresa pagadora. Si existen, pre-rellenar ID grupo, responsable, telefono, email responsable. Toast: "Datos del grupo pre-rellenados desde la ultima generacion". Al generar XML, guardar los datos actuales como nuevos defaults.
- **Lo que queda manual:** Laura ajusta si es necesario.
- **Implementacion:** JS nativo. Key en localStorage: `convocatoria_xmlGroupDefaults_${cif}`. Al abrir generador XML: buscar y pre-rellenar. Al generar XML: guardar datos actuales.

**Fase:** 1.
**Esfuerzo:** Bajo (1h).
**Impacto:** Medio — elimina repeticion cada vez que genera XML (1-2 min x 30-80 generaciones/ano = 1-3 horas/ano).

---

#### F1.9 — Credito FUNDAE con simulacion y alertas

**Que:** Ampliar el modulo de credito existente del dashboard con: (1) simulador que calcula el impacto de acciones planificadas, (2) alerta de infrautilizacion a partir de septiembre (credito consumido < 50%), (3) alerta de sobreconsumo, (4) proyeccion temporal con linea de tendencia.

**Por que:** Perder credito FUNDAE por infrautilizacion es un error comun y costoso. Exceder el credito tambien es problematico. Tener visibilidad predictiva (no solo retrospectiva) transforma la gestion del credito.

**Como:** Ampliar el modulo de credito del dashboard. El simulador suma costes de acciones seleccionadas. Las alertas son logica de umbrales (integradas en el motor de alertas de F1.3). El grafico reutiliza la estructura de sparklines existente.

**Fase:** 1.
**Esfuerzo:** Bajo (3-4h).
**Impacto:** Alto — previene perdida de credito FUNDAE.

---

### Fase 2: Core UX premium + compliance

**Objetivo:** Mejoras sustanciales del flujo principal que transforman la experiencia de enviar convocatorias y gestionar el ciclo formativo. Cada propuesta requiere esfuerzo medio pero resuelve pain points criticos. Se integran las propuestas de compliance y las automatizaciones de sincronizacion que refuerzan la vision amplia.

**Duracion estimada:** 8-11 dias

---

#### F2.1 — Panel persistente de calidad de datos con edicion in situ

**Que:** Al cargar el Excel, mostrar un panel colapsable (no toasts efimeros) con todos los problemas detectados: emails invalidos, NIFs duplicados, personas trabajadoras sin email. Cada problema es clickable y abre un mini-editor inline para corregir el dato. Las correcciones se aplican a los datos en memoria y se persisten en localStorage.

**Por que:** Laura pierde informacion critica porque los toasts desaparecen en 4-6 segundos. El panel transforma la incertidumbre en confianza. La edicion in situ elimina el bucle frustrante Excel -> corregir -> recargar -> perder filtros.

**Automatizacion (A13 — Panel calidad de datos):**
- **Trigger:** Carga de Excel (ya se ejecutan las validaciones; la diferencia es como se muestra el resultado).
- **Acciones automaticas:**
  - Ejecutar validaciones sobre todas las personas trabajadoras: emails invalidos, NIFs duplicados, personas sin email, NIFs con formato invalido, personas sin departamento, personas sin puesto.
  - Generar resumen de calidad: "347 personas trabajadoras cargadas, 12 sin email, 3 NIFs duplicados, 2 emails invalidos".
  - Mostrar panel colapsable PERSISTENTE (no toast): barra de resumen siempre visible ("12 avisos de calidad"), click para expandir lista detallada de problemas, cada problema clickable ("Maria Garcia (sin email)" → resaltar en tabla).
- **Lo que queda manual:** Laura decide que corregir y cuando. Laura puede editar in situ o corregir en el Excel fuente.
- **Implementacion:** JS nativo. Al completar el parseo, recopilar problemas en `state.dataQualityIssues`. Renderizar panel lateral colapsable (reutilizar estructura de `dash-alerts-widget`) con problemas agrupados por tipo. Mini-editor inline: campo editable, boton guardar, boton cancelar. Correcciones en `convocatoria_corrections` (localStorage), indexadas por NIF. Al recargar Excel, intentar reaplicar.

**Fase:** 2.
**Esfuerzo:** Medio-alto (5-6h).
**Impacto:** Muy alto — elimina el bucle de recarga mas frustrante.

---

#### F2.2 — Panel inline de readiness FUNDAE con checklist narrativo

**Que:** Panel inline dentro de la pestana XML que, al seleccionar una accion formativa, muestra un checklist narrativo con los datos faltantes: "Faltan 3 datos: NSS de 2 participantes y telefono del responsable. [Completar datos]". Sin indicador de color en la ficha del catalogo — solo aparece al ir a generar XML.

**Por que:** El peak negativo mas intenso del mapa emocional de Laura es descubrir datos incompletos al final, despues de 10 minutos de configuracion. Este panel invierte el flujo: muestra el estado ANTES de intentar generar. Texto > color. Patron Linear: el data storytelling narrativo comunica urgencia sin colores semafóricos.

**Automatizacion (A4 — Panel de readiness y validacion progresiva):**
- **Trigger:** Apertura del generador XML + seleccion de accion formativa en la pestana XML.
- **Acciones automaticas:**
  - Ejecutar `checkFundaeReadiness(action)`:
    - Verificar datos de la accion (titulo, fechas, modalidad, horas)
    - Verificar datos del centro (si presencial: nombre, direccion, CIF)
    - Verificar datos del tutor (nombre, NIF, email)
    - Verificar datos de participantes (NIF/NIE valido, NSS, grupo cotizacion, tipo documento)
    - Verificar comunicacion RLT (si aplica)
  - Generar texto narrativo: "Faltan N datos: [lista legible]. [Completar datos]"
  - Si todo completo: "Todos los datos listos para generar XML."
  - Cada item faltante es un link clickable al campo que falta (scroll + focus)
- **Lo que queda manual:** Laura completa los datos faltantes. Laura decide cuando generar el XML.
- **Implementacion:** JS nativo. Refactorizar la validacion existente del generador XML para que sea reutilizable. Devuelve objeto `{ complete, items: [{field, status, message}] }`. Nuevo componente visual: panel de texto narrativo inline en la pestana XML con lista expandible de items faltantes.

**Fase:** 2.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Muy alto — elimina 15+ minutos de frustracion por cada generacion fallida. Ahorro estimado: 5-25 horas/ano.

---

#### F2.3 — Dialogo de preview + confirmacion fusionado

**Que:** Transformar el dialogo de confirmacion actual en un dialogo de preview+confirmacion de dos secciones. Arriba: preview del email (titulo, fecha, ubicacion, lista de personas destinatarias truncada). Abajo: avisos (conflictos, FUNDAE, encuesta). Tratamiento visual premium: entrada con `scale(0.9->1)`, `backdrop-filter: blur(8px)`, borde superior de 3px en `--accent`.

**Por que:** Dos propuestas separadas (rediseno de dialogo + vista previa) se fusionan para evitar que Laura vea la misma informacion dos veces. Confirmar la convocatoria ES el pico de la experiencia (regla pico-final). Resuelve el miedo a errores: Laura ve exactamente que se va a enviar antes de confirmar.

**Como:**
- Reestructurar `#confirmDialog` con dos secciones: `.confirm-preview` y `.confirm-alerts`.
- La preview incluye: titulo del evento en negrita, fecha formateada, icono de tipo (Teams/Presencial), conteo de personas destinatarias como chip `.dash-kpi-value`, tabla truncada de primeras 5 personas destinatarias con "y N mas".
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
  - "Convocatoria 'PRL Oficinas Madrid' enviada a 24 personas destinatarias."
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

#### F2.8 — Skeleton screen para tabla de personas destinatarias

**Que:** Al iniciar la carga del Excel, mostrar skeleton (8-10 filas) que replique la estructura de la tabla con animacion `shimmer` existente.

**Por que:** El dashboard ya tiene skeletons. La tabla no. Es una incoherencia interna. Los skeleton screens reducen la percepcion de espera un 30% frente a spinners.

**Como:** Reutilizar la animacion `shimmer` existente (`.dash-skeleton`). Crear `.table-skeleton` con filas de `skeleton-cell` de anchos proporcionales a las columnas reales. Mostrar al iniciar carga, ocultar al completar parseo.

**Fase:** 2.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Alto — especialmente con Excels grandes (>1000 filas).

---

#### F2.9 — Modo compacto para formulario de acciones formativas

**Que:** Reorganizar el formulario de acciones formativas con `<details>` colapsables por grupos: "Datos basicos" (titulo, tipo, modalidad, fechas, estado — siempre visible), "Participantes y sesiones" (tabla, asistencia — expandible), "Datos FUNDAE" (area profesional, nivel, grupo, tutor, centro — colapsado por defecto). Texto en `--text-muted` en el `<summary>` de cada `<details>` indicando pendientes.

**Por que:** El formulario tiene 20+ campos. Laura se pierde entre lo operativo y lo administrativo. La divulgacion progresiva reduce la carga cognitiva un 40%. Es un pain point diario, no esporadico. Linear comunica estado en el contenido, no en el chrome.

**Como:**
- Envolver secciones del formulario en `<details>` con `<summary>` estilizado.
- "Datos basicos" tiene `open` por defecto.
- "Datos FUNDAE" colapsado por defecto; abierto automaticamente al acceder desde pestana XML.
- En el `<summary>` de cada `<details>`, texto en `--text-muted`: "2 pendientes". Nada si la seccion esta completa.

**Fase:** 2.
**Esfuerzo:** Medio (3h).
**Impacto:** Medio-alto — reduce sobrecarga cognitiva en cada interaccion con el catalogo.

---

#### F2.10 — Tracking de formacion obligatoria con caducidades

**Que:** Nueva seccion en el catalogo o sub-pestana "Formacion obligatoria" con: (1) definicion de tipos (PRL general, PRL puesto, LOPD, acoso, canal de denuncias, etc.) con periodicidad, (2) al cargar organigrama, marcar que formaciones aplican a cada puesto/departamento, (3) registrar ultima fecha de formacion por persona trabajadora, (4) tabla con columnas "Ultima formacion" y "Caduca" — fechas vencidas en `--danger` (unico color semantico ya establecido para errores, sin verde ni amarillo), (5) vista de gaps de compliance filtrable, (6) boton "Crear convocatoria" que pre-selecciona las personas trabajadoras afectadas.

**Por que:** La formacion obligatoria representa el 30-50% de las acciones formativas del departamento. Un incumplimiento en PRL puede suponer sanciones graves. Laura mantiene hoy un Excel separado con caducidades, sin conexion con el organigrama ni con el calendario. Ninguna herramienta FUNDAE del mercado integra este tracking con el organigrama.

**Automatizacion (A7 — Tracking de formacion obligatoria con caducidades):**
- **Trigger:** Apertura de la app (evaluacion de caducidades) + carga de organigrama (cruce automatico) + registro de asistencia (actualizacion automatica).
- **Acciones automaticas:**
  - Al cargar organigrama, cruzar personas trabajadoras con tipos de formacion obligatoria segun departamento/puesto.
  - Para cada par (persona trabajadora, tipo obligatorio): calcular fecha caducidad = fechaFormacion + periodicidad. Tabla con columnas "Ultima formacion" y "Caduca". Fechas vencidas en `--danger`. Single-accent principle: Stripe/Vercel usan un solo color de alerta.
  - Generar vista de compliance: tabla personas trabajadoras x tipos con fechas, filtros, resumen ("87% de la plantilla con PRL vigente").
  - Alimentar motor de alertas (F1.3) con: "5 personas trabajadoras con PRL caducada o a punto de caducar" + boton "Crear convocatoria con personas afectadas".
  - Al registrar asistencia en una formacion obligatoria: actualizar registro de la persona trabajadora, recalcular caducidad, reiniciar ciclo de alertas.
- **Lo que queda manual:** Laura define tipos de formacion obligatoria y periodicidad. Laura asocia tipos a ambitos (todos, departamento, puesto). Laura puede cargar registros historicos iniciales (importacion Excel). Laura gestiona las convocatorias de renovacion.
- **Implementacion:** JS nativo. Nuevo modelo de datos en localStorage: `state.complianceTypes` (array de tipos con periodicidad y ambito) y `state.complianceRecords` (registros por persona trabajadora y tipo con fecha de completitud). UI: sub-pestana en Catalogos "Formacion obligatoria". Integracion con motor de alertas (F1.3).

**Fase:** 2.
**Esfuerzo:** Medio-alto (8-10h).
**Impacto:** Muy alto — la formacion obligatoria es responsabilidad legal del empresario. Sanciones PRL: 2.046-40.985 EUR (graves) o 40.986-819.780 EUR (muy graves). Posiciona la herramienta como imprescindible para compliance.

---

#### F2.11 — Gestion de la comunicacion a la RLT

**Que:** Nuevo flujo "Comunicacion RLT" accesible desde el catalogo de acciones formativas: (1) seleccionar acciones, (2) generar automaticamente el documento de comunicacion con todos los datos requeridos por ley, (3) registrar fecha de envio y fecha limite de respuesta (envio + 15 dias habiles), (4) estados (Pendiente/Enviada/Plazo abierto/Sin objeciones/Con discrepancias), (5) alerta en dashboard y al abrir la app.

**Por que:** La comunicacion a la RLT es obligatoria si la empresa tiene representacion legal de los trabajadores. Su ausencia puede invalidar la bonificacion. Laura prepara hoy estos documentos manualmente en Word y controla los plazos mentalmente. Si gestiona 40+ acciones anuales, el volumen es significativo.

**Automatizacion (A3 — Generacion automatica de comunicacion RLT):**
- **Trigger:** Laura pulsa "Generar comunicacion RLT" desde el catalogo.
- **Acciones automaticas:**
  - Recopilar datos de cada accion seleccionada: denominacion/objetivos, colectivo destinatario (departamentos/puestos), numero de participantes, calendario previsto, medios pedagogicos (modalidad), criterios de seleccion, balance del ejercicio anterior (auto-calculado desde catalogo).
  - Generar documento HTML profesional: encabezado "COMUNICACION A LA REPRESENTACION LEGAL DE LOS TRABAJADORES", datos de empresa (desde configuracion), tabla con acciones formativas, balance del ejercicio anterior, pie con fecha y espacio para firma.
  - Mostrar vista previa del documento.
  - Al registrar fecha de envio: calcular `fechaLimiteRespuesta = envio + 15 dias habiles`, registrar en cada accion `rlt: { sentDate, deadline, status: 'Enviada' }`.
  - Cuando se cumplen 15 dias habiles sin objeciones: auto-transicionar estado a "Sin objeciones" (via motor de alertas F1.3).
- **Lo que queda manual:** Laura selecciona que acciones incluir. Laura envia el documento a la RLT (email, entrega en mano). Laura registra la fecha de envio. Laura gestiona discrepancias si las hay.
- **Implementacion:** JS nativo. Funcion `generateRLTDocument(selectedActions)` que genera HTML con `window.open` + `window.print()`. Funcion `calculateBusinessDays(startDate, days)` (ya existe parcialmente para plazos FUNDAE). Nuevo campo en cada accion del catalogo: `rlt: { sentDate, deadline, status }`. Integracion con `evaluateAlerts()`.

**Fase:** 2.
**Esfuerzo:** Medio (5-6h).
**Impacto:** Alto — elimina un proceso manual con consecuencias legales. Ahorro estimado: 4-8 horas/ano.

---

#### F2.12 — Auto-sincronizacion convocatoria-catalogo ampliada

**Que:** Ampliar la sincronizacion existente entre convocatoria y catalogo para que, al enviar una convocatoria, la accion formativa vinculada se actualice automaticamente con todos los datos disponibles.

**Por que:** Actualmente la sincronizacion vincula participantes pero no copia formador, ubicacion ni crea sesiones de asistencia. Laura tiene que entrar al catalogo y rellenar manualmente datos que ya estan en la convocatoria.

**Automatizacion (A8 — Sync convocatoria-catalogo++):**
- **Trigger:** Envio de convocatoria (ya parcialmente implementado).
- **Acciones automaticas (ampliacion de lo existente):**
  - Si existe accion vinculada:
    - Anadir participantes de la convocatoria a la accion (ya existe).
    - Crear sesiones de asistencia con las fechas de la convocatoria.
    - Actualizar estado de la accion: si `fechaInicio <= hoy` → "En marcha"; si solo se ha enviado convocatoria → "Convocada".
    - Si la accion no tiene tutor y la convocatoria tiene formador → copiar.
    - Si la accion no tiene centro y la convocatoria tiene ubicacion → copiar.
  - Si NO existe accion vinculada:
    - Ofrecer "Crear accion formativa desde esta convocatoria".
    - Pre-rellenar accion con datos de la convocatoria.
  - Toast de confirmacion: "Accion PRL-003 actualizada: 15 participantes, 2 sesiones".
- **Lo que queda manual:** Laura elige si vincular con accion existente o crear nueva. Laura completa los datos especificos FUNDAE que la convocatoria no tiene.
- **Implementacion:** JS nativo. Ampliar la funcion `syncConvocatoriaToAction()` existente con logica de copia de campos faltantes, creacion de filas de asistencia, y transicion de estado.

**Fase:** 2.
**Esfuerzo:** Bajo (2-3h).
**Impacto:** Medio — reduce discrepancias entre convocatoria y catalogo. Ahorro: 3-5 min x 30-80 convocatorias/ano = 2-7 horas/ano.

---

### Fase 3: Diferenciadores premium + reporting

**Objetivo:** Features que elevan la percepcion de calidad de la app, extienden la coherencia a todas las pestanas, y anadir capacidades de reporting y documentacion automatica que generan valor para Direccion y la RLT. Solo se implementan despues de que el core (Fases 0-2) este solido.

**Duracion estimada:** 11-15 dias

---

#### F3.1 — Paleta de comandos Cmd+K

**Que:** Command palette con `Cmd+K` / `Ctrl+K`. Input de busqueda grande, lista de resultados con fuzzy search, categorias de comandos, navegacion con flechas, atajos visibles.

**Por que:** La app tiene 5 pestanas con funcionalidades dispersas — y con la vision amplia, crece la superficie funcional. Cmd+K es el punto de acceso unificado que resuelve el problema de descubribilidad. Es Fase 3 porque Laura no usa atajos de teclado: es un diferenciador premium, no un pain point.

**Como:**
- Nuevo componente overlay `.cmdk-overlay` + `.cmdk-box`.
- Listener global `keydown` para `Cmd+K`.
- Fuzzy search simple sin dependencias.
- Categorias: Navegacion, Datos, Filtros, Convocatoria, Herramientas, Catalogos, Compliance.
- Acciones contextuales: si hay datos cargados, "Buscar persona: [nombre]"; si hay catalogo, "Ir a accion: [nombre]"; si hay compliance gaps, "Ver gaps de formacion obligatoria".

**Fase:** 3.
**Esfuerzo:** Alto (6-8h).
**Impacto:** Alto — hub central de navegacion.

---

#### F3.2 — Atajos de teclado globales

**Que:** Conjunto reducido de atajos que no intercepten atajos nativos del navegador. Laura probablemente usa Windows (entorno corporativo RRHH). `Ctrl+1..5`, `Ctrl+Shift+H` y `Ctrl+,` conflictan con atajos nativos de Chrome en Windows.

**Atajos definitivos:**

| Atajo | Accion | Notas |
|-------|--------|-------|
| `Ctrl/Cmd+K` | Abrir command palette | Universal, sin conflicto |
| `Ctrl/Cmd+Enter` | Enviar (abrir en Outlook) | Tab Convocatoria, con datos |
| `Ctrl/Cmd+Shift+Enter` | Anadir a cola | Tab Convocatoria, con datos |
| `Alt+1..5` | Navegar a pestana 1-5 | Evita conflicto con Ctrl+1..5 del navegador en Windows |
| `Escape` | Cerrar dialogo/panel | Ya existe parcialmente |

Los atajos de historial (`Cmd+Shift+H`) y ajustes (`Cmd+,`) se eliminan — accesibles via command palette.

**NO se interceptan:** `Cmd+F` (buscar en pagina), `Cmd+A` (seleccionar todo), `Cmd+S` (guardar). Estos son atajos nativos del navegador.

**Deteccion de OS:** La app detecta el OS con `navigator.userAgentData?.platform || navigator.platform` y muestra `Ctrl` o `Cmd` en tooltips segun corresponda.

**Revelacion progresiva:** Tooltips con atajos al hacer hover con delay 800ms. En la paleta de comandos, cada accion muestra su atajo. No mostrar tooltips de atajos hasta que el usuario ha interactuado con la app al menos 3 veces.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — transforma la percepcion de herramienta profesional.

---

#### F3.3 — Empty states contextuales unificados (todas las pestanas)

**Que:** Sistema unificado de componentes `.empty-state` con variantes por tipo y pestana. Cubre tabla de personas destinatarias, cola, historial, cada modulo del dashboard, calendario, y catalogos.

**Variantes para la tabla de personas destinatarias (simplificado):**
- **Sin datos cargados:** Icono upload, "Carga tu censo de personas trabajadoras", CTA "Cargar Excel".
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

**Que:** Nuevo boton "Exportar convocatoria" que genera un PDF via `window.open()` con: cabecera con nombre del producto ("Formación_AGORA") y paleta indigo, datos del evento, tabla de personas destinatarias con filas alternas, pie con fecha de generacion.

**Por que:** El PDF es la unica pieza de la app que personas externas ven. Su calidad comunica directamente la calidad del producto.

**Como:** Funcion `exportConvocatoriaPDF()` que abre `window.open()` con HTML inline usando estilos `@media print` + `@page`. Cabecera con borde inferior de 3px en `--accent`, titulo del evento, metadata, tabla de personas destinatarias, pie con fecha.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — extension de la identidad del producto.

---

#### F3.7 — Generacion automatica de hojas de firmas y certificados

**Que:** Aplicar branding unificado (misma cabecera "Formación_AGORA", misma paleta, misma tipografia) a la hoja de firmas y certificados. Generacion automatica de hojas de firmas por sesion y certificados de asistencia/aprovechamiento con generacion masiva y numeracion automatica.

**Por que:** Las hojas de firmas y los certificados son requisitos documentales para FUNDAE e inspeccion. Laura los crea hoy manualmente en Word/Publisher. Cada documento generado con un nivel de pulido diferente fragmenta la percepcion de calidad.

**Automatizacion (A5 — Hojas de firmas + A6 — Certificados):**

**Hojas de firmas:**
- **Trigger:** Laura pulsa "Generar hoja de firmas" en la ficha de la accion.
- **Acciones automaticas:** Para cada sesion de la accion: generar tabla HTML con encabezado (nombre formacion, fecha sesion, hora, lugar, formador), filas (una por participante con nombre, NIF, firma [espacio vacio], hora entrada, hora salida), pie (espacio para firma del formador, sello). CSS page-break entre sesiones. Participantes ordenados alfabeticamente. Abrir ventana de impresion.
- **Lo que queda manual:** Laura imprime. Los asistentes firman. Laura escanea/archiva.
- **Implementacion:** JS nativo. Funcion `generateAttendanceSheet(actionId)` que genera HTML con CSS `@media print` y abre `window.print()`.

**Certificados:**
- **Trigger:** Laura pulsa "Generar certificados" en la ficha de la accion (habilitado cuando hay asistencia registrada).
- **Acciones automaticas:** Filtrar participantes que cumplen criterio de certificacion (asistencia >= 75%, configurable). Para cada participante: generar certificado HTML con nombre, NIF, formacion, horas, fechas, modalidad, formador, fecha de emision, fecha de caducidad (si aplica), espacio para firma y sello. CSS page-break entre certificados. Dos formatos: "Certificado de asistencia" y "Certificado de aprovechamiento". Logo de empresa como data URL (configurable). Numeracion automatica. Registrar emision en datos de la accion.
- **Lo que queda manual:** Laura decide cuando generar. Laura revisa la lista de participantes certificables. Laura firma/sella y distribuye.
- **Implementacion:** JS nativo. Funcion `generateCertificates(actionId)`. Plantilla con variables. `window.print()` con opcion de guardar como PDF (nativo del navegador).

**Fase:** 3.
**Esfuerzo:** Medio (5-6h para ambos).
**Impacto:** Alto — consistencia en todos los outputs + valor para inspeccion. Ahorro: 5-30 min/sesion (hojas) + 15-30 min/formacion (certificados) = 12-70 horas/ano.

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

**Automatizacion (A9 — Informe RLT anual):**
- **Trigger:** Laura pulsa "Generar balance anual para RLT" (bajo demanda, tipicamente diciembre/enero).
- **Acciones automaticas:** Filtrar acciones del ejercicio (o ejercicio anterior). Calcular: total acciones, horas totales, participantes unicos, desglose por tipo/modalidad/departamento, presupuesto ejecutado vs. planificado, credito FUNDAE consumido vs. disponible, satisfaccion media. Generar documento HTML: titulo "BALANCE DE ACCIONES FORMATIVAS - EJERCICIO [ano]", datos de empresa, tablas con estadisticas, listado de acciones, fecha y espacio para firma. Abrir vista previa / ventana de impresion.
- **Lo que queda manual:** Laura revisa, imprime, y entrega a la RLT.
- **Implementacion:** JS nativo. Todos los datos ya estan en el catalogo y dashboard. Es reorganizarlos en formato de informe.

**Fase:** 3.
**Esfuerzo:** Bajo (3-4h).
**Impacto:** Medio — ahorra 2-4 horas cada vez. Obligatorio por ley.

---

#### F3.11 — Animacion de seleccion/deseleccion en tabla

**Que:** Al excluir una fila, transicion 200ms a `opacity: 0.4` con `text-decoration: line-through`. Al reincluir, volver a `opacity: 1` con transicion suave. Sin color de fondo.

**Por que:** Figma/Linear usan opacidad como indicador primario de estado. Sin flash de color.

**Fase:** 3.
**Esfuerzo:** Bajo (1h).
**Impacto:** Medio.

---

#### F3.12 — Exportacion .ics de calendario

**Que:** Boton en la pestana Calendario para exportar un archivo .ics con todas las formaciones visibles (respetando filtros activos).

**Por que:** Laura necesita las formaciones en su calendario de Outlook para planificar su semana. Anadir exportacion .ics hace la pestana Calendario accionable y la conecta con el ecosistema de herramientas de Laura.

**Automatizacion (A10 — Exportacion ICS):**
- **Trigger:** Laura pulsa "Exportar .ics" en la pestana Calendario.
- **Acciones automaticas:** Recopilar acciones formativas visibles (segun filtros activos). Para cada accion con fechas: crear evento VCALENDAR con SUMMARY (nombre), DTSTART/DTEND (fechas y horas), LOCATION (centro/sala), DESCRIPTION (formador, participantes count, estado), STATUS (CONFIRMED/TENTATIVE). Si accion tiene multiples sesiones: un evento por sesion. Generar archivo .ics (texto plano UTF-8). Ofrecer descarga.
- **Lo que queda manual:** Laura importa en Outlook / Google Calendar.
- **Implementacion:** JS nativo. Funcion `generateICS(actions)` que construye string VCALENDAR, crea Blob y descarga via `URL.createObjectURL`. ~30 lineas de JS.

**Fase:** 3.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Medio — reduce duplicacion de trabajo. Ahorro: 5-10 min x 2-4 veces/mes.

---

#### F3.13 — View Transitions API para cambio de pestanas

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

#### F3.14 — Blur sistematico en overlays

**Que:** Unificar `backdrop-filter: blur(8px)` en todos los overlays (dialogos, paleta de comandos, dropdowns de filtros). Actualmente los dialogos usan `blur(4px)`.

**Fase:** 3.
**Esfuerzo:** Muy bajo (30 min).
**Impacto:** Bajo-medio — contribuye al efecto compuesto de pulido.

---

#### F3.15 — Precomputacion del dashboard al cargar datos

**Que:** Al completar la carga del Excel, calcular las metricas del dashboard en un `requestIdleCallback()`. Cuando Laura navega al dashboard, renderizar instantaneamente si los datos no han cambiado.

**Fase:** 3.
**Esfuerzo:** Medio (3h).
**Impacto:** Medio-alto — el dashboard carga instantaneamente.

---

#### F3.16 — Checklist de activacion persistente

**Que:** Panel colapsable en la parte superior de la app (visible solo las primeras sesiones) con 7 pasos: (1) Cargar organigrama, (2) Enviar primera convocatoria, (3) Crear accion formativa, (4) Generar primer XML, (5) Definir formaciones obligatorias, (6) Generar primer informe, (7) Explorar el dashboard. Progreso persistido en localStorage. Se oculta al completar o al pulsar "No mostrar mas".

**Por que:** El onboarding actual tiene 3 pasos que solo describen el flujo de convocatoria. Las otras pestanas no tienen guia de entrada. Con la vision amplia, el checklist comunica activamente que la app cubre el ciclo completo de formacion.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Medio — mejora significativamente la descubribilidad y la tasa de activacion.

---

### Fase 4: Extensiones avanzadas

**Objetivo:** Features opcionales que amplian el alcance de la app. Algunas requieren infraestructura externa (Power Automate). Solo se abordan cuando Fases 0-3 estan completadas. Incluye las automatizaciones que dependen de Power Automate.

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

**Que:** Textarea donde Laura puede pegar una lista de NIFs o emails. La app hace match con el organigrama y selecciona exactamente esas personas trabajadoras.

**Fase:** 4.
**Esfuerzo:** Bajo (2-3h).
**Impacto:** Medio.

---

#### F4.3 — Recordatorios automaticos pre-formacion

**Que:** Checkbox en datos del evento: "Enviar recordatorio X dias antes" que usa el webhook de PA para programar un email de recordatorio.

**Automatizacion (A2 — Recordatorios automaticos via Power Automate):**
- **Trigger:** Laura marca checkbox "Enviar recordatorio" + selecciona dias (1, 2 o 3) + envia convocatoria.
- **Acciones automaticas:**
  - Calcular `scheduledTime = fechaFormacion - N dias, a las 09:00`.
  - Construir payload con datos del evento y lista de emails.
  - Enviar al webhook existente de PA con `type: "reminder"`.
  - PA recibe, espera hasta `scheduledTime` (accion "Delay until"), y envia email de recordatorio.
  - El email es mas corto que la convocatoria: fecha, hora, lugar, y un "nos vemos manana".
- **Lo que queda manual:** Laura decide si activar el recordatorio (checkbox). Laura elige cuantos dias antes. Laura verifica datos antes de enviar.
- **Implementacion:**
  - *En convocatoria.html:* Checkbox + select en "Datos del evento". Funcion `sendReminderEmail(event, emails, daysBeforeReminder)` que reutiliza la estructura de `sendSurveyEmail`. Payload con `type: "reminder"`.
  - *En Power Automate:* Nuevo branch en flujo existente: `if type == 'reminder'` → `Delay until` + `Send email (V2)`.

**Fase:** 4.
**Esfuerzo:** Medio (3-4h: 2h en HTML/JS + 1-2h ampliando flujo PA).
**Impacto:** Alto — los recordatorios reducen no-shows un 20-30%. Ahorro: 5-20 horas/ano.

---

#### F4.4 — Reenvio automatico de encuesta de satisfaccion

**Que:** Al enviar una encuesta de satisfaccion, programar automaticamente un reenvio 7 dias despues a todas las personas destinatarias.

**Automatizacion (A15 — Reenvio de encuesta):**
- **Trigger:** Envio de la encuesta original (automatico, vinculado al flujo existente).
- **Acciones automaticas:** Programar reenvio via PA: `type: "survey_reminder"`, mismos emails, `scheduledTime = fechaEncuestaOriginal + 7 dias`. PA espera 7 dias y envia recordatorio de encuesta.
- **Nota:** Este flujo no sabe quien ha respondido (MS Forms es externo). Envia a TODOS. Es una limitacion aceptable.
- **Implementacion:** Extension minima del flujo PA. Nuevo branch `if type == 'survey_reminder'`.

**Fase:** 4.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Medio — mejora tasa de respuesta un 15-25%.

---

#### F4.5 — Virtual scrolling en tabla de personas destinatarias

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

#### F4.8 — Perfil formativo de persona trabajadora

**Que:** Al buscar una persona trabajadora en el dashboard, mostrar perfil con: formaciones recibidas, horas acumuladas, formaciones obligatorias vigentes/caducadas, certificados emitidos, encuestas contestadas.

**Por que:** Con la vision amplia, la perspectiva de la persona trabajadora individual es tan valiosa como la perspectiva de la accion formativa. Laura necesita responder a preguntas como "¿Maria Garcia ya hizo PRL este ano?" sin buscar manualmente en el catalogo.

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

**Que:** Al cargar un nuevo Excel con datos previos en sesion, comparar por NIF y mostrar resumen: "15 nuevas incorporaciones, 2 bajas, 4 cambios de departamento." Avisar si participantes de acciones activas o personas trabajadoras con formaciones obligatorias registradas ya no estan en el nuevo organigrama.

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

**Que:** Campo opcional "Aforo maximo" en datos del evento. Si personas destinatarias seleccionadas > aforo, ofrecer crear lista de espera. Vista con confirmados vs. espera. Paso automatico al eliminar confirmado.

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
| **Gestion de competencias / Skills Matrix** | Research RRHH (seccion 12) | **Aplazada indefinidamente** | Es un modulo de gestion de talento que desborda el alcance de "gestion de formacion". La herramienta cubre el ciclo L&D, no la gestion de competencias estrategica. Si Laura necesita una skills matrix, usa un Excel aparte o un HRIS. Sin embargo, el perfil formativo de la persona trabajadora (F4.8) cubre parcialmente esta necesidad desde la perspectiva de formacion. |
| **Integracion con LMS** | Research RRHH (seccion 13) | **Fuera de alcance** | La herramienta es un fichero HTML sin backend. Integraciones con LMS (SCORM, APIs) requieren infraestructura incompatible con la arquitectura zero-deployment. |
| **PIF (Permisos Individuales de Formacion)** | Research RRHH (seccion 16) | **Aplazada indefinidamente** | Los PIF son un mecanismo distinto de la formacion programada (iniciativa del trabajador, no de la empresa). Su gestion es poco frecuente (pocas empresas los tramitan activamente) y anadirlo sin un caso de uso claro seria feature bloat. |
| **Onboarding completo (formacion de incorporacion)** | Research RRHH (seccion 11) | **Fuera de alcance** | El onboarding completo es responsabilidad compartida con RRHH general, el manager y TI. La herramienta cubre la parte formativa del onboarding a traves del tracking de formacion obligatoria (F2.10) — las formaciones de incorporacion se registran como formaciones obligatorias de tipo "inicial". |
| **Bordes laterales semanticos (F3.11-original)** | Frontend | **Descartada** | Es el patron semaforo disfrazado de barra. Linear no colorea secciones del sidebar. El estado va en el contenido. |
| **Envio directo de convocatorias via PA (F4.4-original)** | Research automatizaciones | **Descartada** | La app prepara, Outlook envia. Las convocatorias no se envian directamente. Los recordatorios y encuestas SI usan PA (mismo patron que sendSurveyEmail existente). |

---

## Integracion de propuestas del research RRHH

Las 13 propuestas del research de flujos RRHH (F1-F13 del documento original) se han evaluado contra la vision amplia de "gestion integral de formacion". A continuacion, el mapa de como cada propuesta del research se integra en el spec:

| Propuesta research | Evaluacion de coherencia | Integracion en el spec |
|--------------------|--------------------------|------------------------|
| **F1: Comunicacion RLT** | Muy alta — es un paso legal obligatorio del ciclo FUNDAE y de formacion en general | **Fase 2** (F2.11) — Core compliance, con automatizacion A3 integrada |
| **F2: Tracking formacion obligatoria** | Muy alta — 30-50% del trabajo del departamento, responsabilidad legal directa | **Fase 2** (F2.10) — Core compliance, con automatizacion A7 integrada |
| **F3: Dossier de inspeccion** | Muy alta — cierra el ciclo de documentacion; diferenciador unico | **Fase 3** (F3.8) — Tras tener datos de RLT y compliance |
| **F4: Plan anual de formacion** | Alta — cubre fase 2 del ciclo L&D, poco frecuente pero estrategico | **Fase 4** (F4.14) — Extension estrategica |
| **F5: Gestion de proveedores** | Media-Alta — amplia lo existente sin anadir complejidad | **Fase 4** (F4.15) — Refinamiento |
| **F6: Exportacion .ics calendario** | Alta — trivial de implementar, valor inmediato | **Fase 3** (F3.12) — Quick win, con automatizacion A10 integrada |
| **F7: Balance formativo RLT** | Muy alta — complemento directo de F1 (comunicacion RLT) | **Fase 3** (F3.10) — Tras implementar RLT, con automatizacion A9 integrada |
| **F8: Listas de espera** | Media — refinamiento del flujo existente, infrecuente | **Fase 4** (F4.16) — Extension |
| **F9: Mini-TNA** | Media — util 1-2 meses al ano, riesgo de feature bloat | **Fase 4** (F4.17) — Extension |
| **F10: Credito FUNDAE con simulacion** | Muy alta — amplifica modulo existente, alto impacto | **Fase 1** (F1.9) — Quick win que amplifica lo existente |
| **F11: Certificados mejorados** | Alta — parte de documentacion para inspeccion | **Fase 3** (F3.7) — Junto con branding y hojas de firmas, con automatizaciones A5/A6 integradas |
| **F12: Perfil formativo persona trabajadora** | Alta — la "otra cara" de la perspectiva centrada en acciones | **Fase 4** (F4.8) — Extension |
| **F13: Informe para Direccion** | Muy alta — genera valor visible para stakeholders | **Fase 3** (F3.9) — Reporting |

### Integracion de automatizaciones del research

Las 15 automatizaciones del research de automatizaciones deterministas (A1-A15) se han evaluado contra la vision del producto y los principios de automatizacion. Todas pasan el filtro "¿ayuda a Laura a ir mas rapido o con menos miedo a errores?" y se integran en propuestas existentes:

| Automatizacion | Decision | Integracion |
|---------------|----------|-------------|
| **A1: Motor de alertas y plazos** | Integrada en F1.3 | Enriquece las alertas proactivas con evaluacion sistematica de reglas de plazo, auto-transicion de estados RLT |
| **A2: Recordatorios via PA** | Nueva propuesta F4.3 | Depende de PA, se integra como extension del webhook existente |
| **A3: Comunicacion RLT automatica** | Integrada en F2.11 | Enriquece la gestion RLT con generacion automatica de documento, calculo de plazos, auto-transicion de estado |
| **A4: Panel readiness FUNDAE** | Integrada en F2.2 | Enriquece el panel con validacion progresiva completa y checklist narrativo accionable |
| **A5: Hojas de firmas** | Integrada en F3.7 | Se fusiona con la mejora de certificados bajo "documentacion automatica" |
| **A6: Certificados de asistencia** | Integrada en F3.7 | Se fusiona con hojas de firmas bajo "documentacion automatica" |
| **A7: Compliance/caducidades** | Integrada en F2.10 | Enriquece el tracking de formacion obligatoria con cruce automatico, fechas con --danger, alertas y pre-seleccion |
| **A8: Sync convocatoria-catalogo++** | Nueva propuesta F2.12 | Amplia la sincronizacion existente con copia de campos, creacion de sesiones y transicion de estado |
| **A9: Informe RLT anual** | Integrada en F3.10 | Enriquece el balance formativo con generacion automatica de estadisticas y documento |
| **A10: Exportacion ICS** | Integrada en F3.12 | Enriquece la exportacion de calendario con formato VCALENDAR completo |
| **A11: Auto-relleno grupo XML** | Integrada en F1.8 | Enriquece el auto-relleno con persistencia por CIF de empresa |
| **A12: Envio masivo via PA** | Descartada | La app prepara, Outlook envia. Las convocatorias no se envian directamente via PA. |
| **A13: Panel calidad de datos** | Integrada en F2.1 | Enriquece el panel con validaciones ampliadas y resumen de calidad |
| **A14: Duplicar accion** | Integrada en F1.2 | Enriquece la duplicacion con definicion precisa de campos copiados vs. limpiados |
| **A15: Reenvio encuesta** | Nueva propuesta F4.4 | Depende de PA, extension minima del flujo de encuestas |

**Una automatizacion descartada (A12 — envio masivo via PA).** Las 14 restantes pasan el filtro de coherencia: todas respetan el principio "preparar, no ejecutar" y se integran en propuestas existentes sin crear UI nueva visible por defecto. A12 se descarta porque la app prepara y Outlook envia — las convocatorias no se envian directamente via PA.

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
| **1.8** | **Nombre del producto** | Resuelto en F0.4. Se adopta "Formación_AGORA" — AGORA como espacio donde confluyen todos los flujos de formacion. El guion bajo da caracter tecnico/moderno. |

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
| **E10** | **Renombrar la app como prioridad 2 — impacto nulo para Laura** | Resuelto en F0.4 como cambio trivial. Pero con la vision amplia, el nombre SI importa: "Formación_AGORA" — AGORA como espacio donde confluyen todos los flujos de formacion. |

### Incoherencias del revisor de coherencia (6)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **C1** | **La brecha de identidad se agranda con propuestas de empatia** | Resuelto por la nueva narrativa: la app cubre el ciclo completo de formacion (no solo FUNDAE). Las propuestas que antes "desbordaban" (reporting, compliance, perfil formativo) ahora encajan naturalmente en la vision amplia. |
| **C2** | **Herramienta personal vs. plataforma departamental** | Resuelto: es una herramienta personal para Laura que genera outputs para Direccion y la RLT. Laura es la operadora; los stakeholders reciben informes generados. No es multiusuario, pero si genera valor departamental. |
| **C3** | **Terminologia inconsistente** | Resuelto por el glosario vinculante, ampliado con terminos del research RRHH (compliance, caducidad, RLT, dossier). |
| **C4** | **Disparidad de madurez entre pestanas** | La vision amplia profundiza este riesgo (mas funcionalidades = mas superficie). Mitigacion: Fase 3 iguala la calidad con empty states transversales, checklist de activacion de 7 pasos, y dashboard accionable que conecta todas las pestanas. |
| **C5** | **Tension localStorage vs. funcionalidades con backend** | Las funcionalidades con PA siguen en Fase 4. La identidad base no depende de backend. Nuevo riesgo: el volumen de datos de compliance (formaciones obligatorias por persona trabajadora) puede estresar localStorage. Mitigacion: considerar IndexedDB si el volumen supera el 70% del limite. F4.7 (backup) se vuelve mas urgente. |
| **C6** | **Onboarding se complica con cada nueva funcionalidad** | Resuelto: checklist de activacion (F3.16) ampliado a 7 pasos que cubren la vision amplia. Las funcionalidades de compliance se descubren via el checklist. |

### Nuevas incoherencias detectadas en revision 2 (3)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **N1** | **La vision amplia multiplica el riesgo de feature bloat** | Las 13 propuestas del research RRHH anaden funcionalidades sustanciales. Mitigacion: las propuestas que cubren fases del ciclo L&D poco frecuentes (TNA = 1-2 meses/ano, plan anual = 1 vez/ano, PIF = casi nunca) se clasifican como Fase 4. La regla YAGNI se aplica estrictamente: no implementar hasta que Laura lo pida. Divulgacion progresiva en TODAS las funcionalidades nuevas. |
| **N2** | **El nombre "Formación_AGORA" — justificacion** | "AGORA" como espacio donde confluyen todos los flujos de formacion. El guion bajo da caracter tecnico/moderno. La diferenciacion viene de la experiencia de uso, no del nombre. |
| **N3** | **Las funcionalidades de compliance (F2.10, F2.11) anaden peso a Fase 2** | Fase 2 pasa de "Core UX premium" a "Core UX premium + compliance". El esfuerzo total de Fase 2 sube de 5-7 dias a 7-10 dias. Esto es aceptable porque: (a) compliance es tan core como FUNDAE en la vision amplia, (b) las propuestas de compliance reutilizan patrones existentes (catalogo, plazos, alertas), (c) el impacto legal justifica la prioridad. |

### Nuevas incoherencias detectadas en revision 3 — integracion de automatizaciones (4)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **N4** | **Las automatizaciones anaden 14 flujos nuevos — riesgo de complejidad interna** | Mitigacion: las automatizaciones no crean UI nueva visible por defecto. Se integran como comportamientos automaticos (A1, A7, A8, A13), opciones en contexto (A2, A5, A6, A14), o configuracion colapsada (A15). No se crean pestanas nuevas. El motor de alertas (A1) centraliza la logica de evaluacion en una unica funcion `evaluateAlerts()`. |
| **N5** | **Las automatizaciones PA (A2, A15) crean dependencia de infraestructura externa** | Mitigacion: todas las automatizaciones PA son Fase 4 (opcionales). La herramienta funciona al 100% sin PA. Las automatizaciones PA amplian capacidades pero no son prerequisito para nada en Fases 0-3. El principio "offline-first, PA-second" se respeta estrictamente. A12 (envio masivo via PA) fue descartada. |
| **N6** | **F2.12 (sync ampliada) puede crear datos duplicados si Laura vincula mal la convocatoria con la accion** | Mitigacion: la sincronizacion siempre pregunta antes de crear una accion nueva ("¿Crear accion formativa desde esta convocatoria?"). Si la convocatoria ya esta vinculada, actualiza sin duplicar. Toast explicativo: "Accion PRL-003 actualizada: 15 participantes, 2 sesiones". |
| **N7** | **Fase 2 sube a 8-11 dias con la incorporacion de F2.12** | Aceptable. F2.12 es bajo esfuerzo (2-3h) y alto impacto en coherencia de datos. La sincronizacion convocatoria-catalogo es una de las fricciones mas frecuentes (30-80 veces/ano). |

---

## Analisis competitivo post-overhaul

Si se implementan las Fases 0-3, Formación_AGORA cubrira:

| Fase del ciclo L&D | Formación_AGORA (actual) | Formación_AGORA (post-overhaul) | Gesbon | Cezanne HR | SAP SF Learning |
|---------------------|---------------------|----------------------------|--------|------------|-----------------|
| Deteccion necesidades | No | No (Fase 4) | No | Parcial | Parcial |
| Planificacion/presupuesto | Baja | Media (simulacion credito + alertas umbral) | Parcial | Si | Si |
| Sourcing proveedores | Baja | Baja (Fase 4) | No | Si | Si |
| **Convocatoria** | **Alta** | **Muy alta** (sync auto, recordatorios) | No | Basica | Basica |
| Ejecucion/asistencia | Media | **Muy alta** (hojas firmas, certificados auto) | Parcial | Si | Si |
| Evaluacion | Media-Baja | Media-Alta (reenvio encuesta auto) | No | Si | Si |
| Reporting | Media | **Muy alta** (Direccion + RLT auto-generados) | Parcial | Si | Si |
| **Compliance FUNDAE** | **Alta** | **Muy alta** (checklist narrativo, alertas, auto-relleno XML) | **Alta** | No | No |
| **Comunicacion RLT** | No | **Si** (documento auto-generado, plazos auto) | Parcial | No | No |
| **Dossier inspeccion** | No | **Si** (hojas firmas + certificados integrados) | Parcial | No | No |
| **Formacion obligatoria** | No | **Si** (caducidades auto, alertas, pre-seleccion) | No | Parcial | Si |
| Certificados | Baja | **Alta** (generacion masiva, automatica) | Parcial | Si | Si |
| Perfil persona trabajadora | No | No (Fase 4) | No | Si | Si |
| Calendario exportable | No | **Si** (ICS automatico) | No | Si | Si |
| **Motor de alertas** | No | **Si** (plazos, caducidades, credito, RLT) | Parcial | Si | Si |
| **Automatizaciones deterministas** | Baja | **Alta** (14 flujos automaticos sin IA) | Media | Media | Alta |

**Diferenciadores unicos post-overhaul:**
1. Unica herramienta que cubre convocatoria + FUNDAE + RLT + compliance + inspeccion en un solo fichero
2. Zero-cost, zero-deployment (ningun competidor lo iguala)
3. Tracking de formacion obligatoria con caducidades integrado con el organigrama y motor de alertas
4. Velocidad de operacion (todo local, sin latencia de red)
5. Informe para Direccion y balance RLT generados automaticamente desde los datos operativos
6. 14 automatizaciones deterministas que cubren el 75% de los pasos del ciclo formativo sin intervencion manual

**Propuesta de valor actualizada:**
> "Todo lo que necesitas para gestionar la formacion de tu empresa — desde la convocatoria hasta el informe a Direccion, pasando por el compliance FUNDAE, las formaciones obligatorias y la documentacion para inspeccion — en una herramienta de escritorio que automatiza los pasos repetitivos, te avisa de los plazos criticos, y puedes abrir manana mismo sin pedir nada a TI."

---

## Principios para la implementacion

Derivados de la investigacion, el CLAUDE.md, las conclusiones de los 3 revisores, la vision amplia, y los principios de automatizacion:

1. **Todo dentro de `convocatoria.html`** — no crear archivos adicionales.
2. **Usar variables CSS existentes** — nunca hardcodear colores.
3. **Respetar `prefers-reduced-motion`** — todas las animaciones nuevas deben tener fallback en el bloque `@media (prefers-reduced-motion: reduce)` existente.
4. **Consistencia sobre novedad** — cada nuevo componente reutiliza patrones existentes (`--radius`, `--transition`, `--shadow-sm/lg`).
5. **El efecto compuesto** — la percepcion premium no viene de una sola mejora sino de la acumulacion de cientos de decisiones correctas.
6. **Laura sobre el disenador** — ante cualquier duda de priorizacion, la pregunta es: "¿Esto ayuda a Laura a hacer su trabajo mas rapido o con menos miedo a errores?"
7. **Prevencion sobre curacion** — es mas valioso evitar un error (checklist readiness FUNDAE, validacion on-blur, alerta de caducidad) que mostrar un error bonito.
8. **Informacion de cierre sobre celebracion** — Laura necesita saber que salio bien y cual es el siguiente paso, no confetti ni sonidos.
9. **Coherencia transversal** — no pulir la pestana de Convocatoria al nivel de Stripe mientras el Calendario sigue siendo un Gantt sin guia. Cada fase debe elevar todas las pestanas proporcionalmente.
10. **La deuda tecnica se paga primero** — Fase 0 existe por una razon. Implementar mejoras visuales sobre estilos inline es construir sobre arena.
11. **Compliance es core, no extension** — la gestion de formacion obligatoria, la comunicacion a la RLT y la documentacion para inspeccion son tan fundamentales como las convocatorias y el ciclo FUNDAE. No son funcionalidades "avanzadas" — son el dia a dia del departamento de formacion.
12. **Divulgacion progresiva como antidoto al feature bloat** — cada funcionalidad nueva se presenta colapsada, oculta, o accesible via Cmd+K hasta que Laura la descubre o la necesita. Nunca anadir pestanas principales. Nuevas funcionalidades se integran como sub-secciones, paneles colapsables o acciones contextuales.
13. **No crear pestanas nuevas** — Las funcionalidades de RLT y formacion obligatoria se integran como sub-secciones del catalogo. El dossier de inspeccion es un boton en la ficha de accion. Los informes son secciones del dashboard. La estructura de 5 pestanas se mantiene.
14. **Automatizar la preparacion, no la ejecucion** — las automatizaciones preparan datos, calculan plazos, generan documentos y sincronizan registros. Laura siempre decide y confirma. Cero automatizaciones silenciosas que modifiquen datos sin feedback visible.
15. **Offline-first, PA-second** — todo lo que se puede hacer en el navegador se hace en JS nativo. Power Automate solo para lo que requiere un servidor: enviar emails programados, esperar hasta una fecha futura, interactuar con APIs externas. La herramienta funciona al 100% sin PA.
