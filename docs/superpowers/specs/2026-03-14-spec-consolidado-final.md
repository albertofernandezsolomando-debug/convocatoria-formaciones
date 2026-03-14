# Spec Consolidado — Overhaul UX Premium

**Fecha:** 14 de marzo de 2026
**Tipo:** Spec de implementacion consolidado y reconciliado
**Fuentes:** 3 specs originales + 2 research + 3 revisiones cruzadas
**Archivo objetivo:** `convocatoria.html` (~15.500 lineas, single-file HTML app)

---

## Narrativa del producto

### Identidad en una frase

> **"La herramienta de escritorio para gestoras de formacion que cubre el ciclo completo FUNDAE — desde la convocatoria hasta la justificacion — sin necesitar nada de TI."**

### Desglose

- **Herramienta de escritorio:** No es un SaaS ni una plataforma departamental. Es un fichero HTML que funciona abriendo en el navegador. Sin servidores, sin licencias, sin TI.
- **Gestoras de formacion:** La usuaria principal es Laura, 38 anos, responsable de formacion en un grupo empresarial con 4-6 sociedades y 500-2.000 empleados. No es directora de RRHH ni desarrolladora.
- **Ciclo completo FUNDAE:** Convocatoria + Catalogos + XML + Calendario + Dashboard. Cada pestana cubre una fase del ciclo de vida de la formacion bonificada.
- **Sin necesitar nada de TI:** Zero-deployment, zero-cost, datos en localStorage. La autonomia es la ventaja competitiva principal.

### Lo que la herramienta NO es

- No es una plataforma de analitica directiva (los modulos de ROI, equidad e interempresarial son funcionalidades avanzadas, no el core).
- No es un sistema de gestion de talento ni de RRHH.
- No es una herramienta colaborativa multi-usuario.

### Publico objetivo

Laura evalua la app cada dia por una sola pregunta: "¿Hoy he podido hacer mi trabajo mas rapido y con menos miedo a equivocarme?" Sus tres ejes vitales son:

1. **Velocidad operativa** — Cuantas convocatorias puede preparar antes de la reunion de las 12.
2. **Seguridad ante errores** — Certeza de que no se deja nada (plazos FUNDAE, datos incompletos, asistentes que faltan).
3. **Reduccion de tareas repetitivas** — No quiere copiar la misma informacion en tres sitios.

Cualquier propuesta que no conecte con al menos uno de estos ejes se clasifica como pulido, no como prioridad.

---

## Glosario de terminos vinculantes

Toda la interfaz debe usar estos terminos de forma consistente. La inconsistencia terminologica ("asistentes" vs. "participantes" vs. "empleados") se ha identificado como una fractura de identidad visible.

| Concepto | Termino en la UI | NO usar | Razon |
|----------|-----------------|---------|-------|
| La aplicacion | **Formaciones FUNDAE** | "Convocatoria de Formaciones" | El nombre actual describe una funcionalidad, no un producto. El nuevo nombre refleja el alcance real (ciclo completo FUNDAE). |
| Persona del organigrama Excel | **Empleado/a** | "Trabajador/a" | Es el termino del campo Excel, familiar para Laura. |
| Empleado/a seleccionado/a para una convocatoria | **Destinatario/a** | "Asistente" | "Asistente" se confunde con "asistio" (estado de asistencia real). "Destinatario" es preciso: son los destinatarios del email. |
| Empleado/a registrado/a en accion FUNDAE | **Participante** | "Asistente" en contexto FUNDAE | Es el termino oficial FUNDAE. Se usa exclusivamente en catalogos, XML y dashboard. |
| Acto de enviar invitaciones | **Convocar** / **Convocatoria** | — | Se mantiene el verbo del dominio. |
| Email que recibe el empleado | **Invitacion** | "Convocatoria" cuando se refiere al email | Distingue el email del acto de convocar. |
| Registro del catalogo FUNDAE | **Accion formativa** | "Formacion" (cuando hay ambiguedad), "Curso" | Termino oficial FUNDAE. |
| Evento con fecha y hora | **Sesion** | "Evento" (cuando hay ambiguedad) | Distingue la sesion puntual de la accion formativa completa. |
| Datos del organigrama | **Censo** / **Organigrama** | "Datos", "Excel" (cuando se refiere al contenido) | "Datos" es demasiado generico. |
| Proveedor de formacion | **Proveedor** | "Empresa formadora" | Consistencia. |
| Persona que imparte la formacion | **Formador/a** | "Tutor/a" en la UI general | FUNDAE usa "tutor/a", pero la UI puede ser mas natural. Mantener "tutor/a" solo en contexto XML. |

**Regla de transicion semantica:** Un empleado se convierte en destinatario al seleccionarlo para una convocatoria. Se convierte en participante al registrarlo en una accion formativa del catalogo FUNDAE. Esta transicion refleja la transicion funcional real: Convocatoria -> Catalogo.

---

## Fases de implementacion

### Fase 0: Infraestructura de coherencia

**Objetivo:** Crear las condiciones tecnicas y terminologicas para que todas las mejoras posteriores sean consistentes y mantenibles. Sin esta fase, cada mejora visual aumenta la deuda tecnica.

**Duracion estimada:** 2-3 dias

---

#### F0.1 — Migrar estilos inline criticos a clases CSS

**Que:** Extraer los estilos `style="..."` de las funciones de renderizado JS mas tocadas (toasts, empty states, dialogos, cards del dashboard) a clases CSS en el bloque `<style>`.

**Por que:** Los estilos inline en JS son el bloqueador principal de cualquier evolucion visual. Dark mode, temas, responsive refinado y auditoria de consistencia quedan bloqueados mientras haya miles de lineas de `style="font-size:12px;color:var(--text-muted)"` en funciones de renderizado. Los 3 revisores convergen en que esto es prerequisito, no tarea final.

**Como:** Estrategia incremental — no migrar todo de golpe. Empezar por los componentes que se van a tocar en Fases 1-2: toasts (`showToast`), empty states (`renderEmptyState`), dialogos de confirmacion, cards del dashboard que se colapsaran. Crear clases CSS con nombres semanticos (`.toast-icon`, `.empty-state-cta`, `.confirm-summary`, etc.) y reemplazar los `style="..."` por `className`.

**Fase:** 0 (prerequisito).
**Esfuerzo:** Medio-alto (6-8h por los componentes criticos, no todo el codebase).
**Impacto:** No visible para Laura directamente, pero habilita todo lo que sigue.

---

#### F0.2 — Unificar terminologia en toda la app

**Que:** Reemplazar todas las ocurrencias de terminologia inconsistente segun el glosario anterior.

**Por que:** La aplicacion usa "asistentes" en el flujo de convocatoria, "participantes" en catalogos, y "empleados" en la tabla. Para Laura, son la misma persona. La inconsistencia genera confusion sutil pero acumulativa. Los 3 revisores convergen en que esto es la fractura de identidad mas visible.

**Como:** Buscar y reemplazar en todo el fichero:
- "asistentes seleccionados" -> "destinatarios seleccionados"
- "No hay asistentes" -> "No hay destinatarios"
- Labels de botones, tooltips, textos de empty states, toasts
- Mantener "Participante" solo en contexto FUNDAE (catalogos, XML)
- Mantener "Empleado" solo al referirse al censo Excel

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

**Que:** Cambiar "Convocatoria de Formaciones" por "Formaciones FUNDAE" en `<title>` (linea 6), `.app-header-title` y cualquier referencia visible.

**Por que:** El nombre actual describe una funcionalidad (enviar convocatorias), no un producto (gestionar el ciclo completo FUNDAE). Laura no se vera afectada negativamente (ya conoce la app), pero un nuevo usuario formara una expectativa correcta desde el primer instante. Los revisores de coherencia y frontend convergen; el revisor de empatia lo considera bajo impacto para Laura pero no se opone.

**Como:** Cambiar el texto en `<title>`, el texto visible en el header, y la referencia en el onboarding.

**Fase:** 0.
**Esfuerzo:** Muy bajo (15 min).
**Impacto:** Medio — redefine la expectativa del producto.

**Nota:** El revisor de empatia cuestiona la prioridad de esto. Se incluye en Fase 0 porque es cambio trivial y acompana la unificacion terminologica. No se invierte tiempo en deliberar el nombre: se usa "Formaciones FUNDAE" y se avanza.

---

### Fase 1: Quick wins de alto impacto

**Objetivo:** Resolver los pain points mas agudos de Laura con cambios de bajo-medio esfuerzo. Cada propuesta aqui tiene impacto directo en velocidad operativa, seguridad ante errores, o reduccion de repeticion.

**Duracion estimada:** 3-4 dias

---

#### F1.1 — Busqueda flexible de hoja en el Excel

**Que:** Si la hoja "ORGANIGRAMA" no existe, buscar hojas con nombres similares (organigrama, Organigrama, PLANTILLA, etc.) y preguntar cual usar. Si solo hay una hoja, usarla directamente.

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

**Que:** Si hay plazos FUNDAE pendientes en las proximas 48 horas, mostrar un dialog no-bloqueante al abrir la app con los plazos pendientes. Banner discreto en la pestana de Convocatoria con "N plazos FUNDAE proximos" enlazable al dashboard.

**Por que:** Laura no abre el dashboard cada dia. Los plazos FUNDAE son criticos y tienen sanciones asociadas. Las alertas deben ir a Laura, no esperar a que ella las busque.

**Como:** Al iniciar la app (despues de restaurar sesion), ejecutar la logica de alertas del dashboard y, si hay plazos criticos, mostrar un mini-dialogo con lista de plazos + botones para ir al dashboard o cerrar. Ademas, un chip en la barra de pestanas del tipo "2 alertas" con color `--warning`.

**Fase:** 1.
**Esfuerzo:** Bajo (1-2h) — los datos ya se calculan.
**Impacto:** Alto — previene incumplimiento de plazos con potencial sancion.

---

#### F1.4 — Toasts con icono, progreso, accion undo y aria-live

**Que:** Redisenar `showToast()` con: icono SVG por tipo (check, warning, error, info), barra de progreso inferior que se agota durante `duration`, parametro `action` opcional para undo, y `aria-live="polite"` en el contenedor.

**Por que:** Los toasts son el componente de feedback mas usado en toda la app. Mejorarlos tiene efecto multiplicador. La barra de progreso da al usuario sensacion de control temporal. La accion undo transforma toasts en red de seguridad. El `aria-live` alinea con WCAG 2.2.

**Como:**
- Modificar `showToast()` (linea ~6666) para aceptar parametro `action: { label, fn }`.
- Anadir icono SVG inline por tipo como primer hijo del toast.
- Anadir `<div class="toast-progress">` con animacion CSS cuya `animation-duration` se inyecta como variable CSS.
- Pausar la desaparicion al hacer hover sobre el toast.
- Anadir `role="status" aria-live="polite"` al contenedor `#toastContainer`.

**Fase:** 1.
**Esfuerzo:** Bajo (2-3h).
**Impacto:** Alto — cada operacion de la app pasa por toasts.

---

#### F1.5 — Animacion de exito en upload-zone

**Que:** Al cargar un archivo exitosamente, aplicar un "pulso de exito" CSS (scale breve + ring que se expande y desvanece). El icono de check se "dibuja" con animacion `stroke-dasharray`/`stroke-dashoffset`.

**Por que:** La carga del Excel es el primer momento significativo de la experiencia. Un pulso de exito transforma un evento funcional en un momento memorable. Apple, Stripe y Airbnb usan este patron.

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

**Por que:** El autoguardado ya funciona, pero Laura no sabe que funciona. No hay confirmacion visible de que los datos se han guardado. La ansiedad de "¿se habra guardado?" es real y no tiene coste tecnico resolver.

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

### Fase 2: Core UX premium

**Objetivo:** Mejoras sustanciales del flujo principal que transforman la experiencia de enviar convocatorias y gestionar el ciclo FUNDAE. Cada propuesta requiere esfuerzo medio pero resuelve pain points criticos.

**Duracion estimada:** 5-7 dias

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

**Por que:** Dos propuestas separadas (rediseno de dialogo + vista previa) se fusionan para evitar que Laura vea la misma informacion dos veces. Confirmar la convocatoria ES el pico de la experiencia (regla pico-final). Fusionar maximiza el impacto de ese momento con un unico componente premium. Resuelve el miedo a errores: Laura ve exactamente que se va a enviar antes de confirmar.

**Como:**
- Restructurar `#confirmDialog` con dos secciones: `.confirm-preview` y `.confirm-alerts`.
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

**Por que:** Laura termina su flujo con un toast de 6 segundos. No tiene certeza de que todo salio bien ni conexion con el siguiente paso. Los revisores de empatia y coherencia convergen: Laura necesita informacion de cierre, no animacion. El resumen transforma "alivio" en "control".

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

**Por que:** El formulario tiene 20+ campos. Laura se pierde entre lo operativo y lo administrativo. La divulgacion progresiva reduce la carga cognitiva un 40%. El revisor de empatia lo sube de nice-to-have a should-have: es un pain point diario, no esporadico.

**Como:**
- Envolver secciones del formulario en `<details>` con `<summary>` estilizado.
- "Datos basicos" tiene `open` por defecto.
- "Datos FUNDAE" colapsado por defecto; abierto automaticamente al acceder desde pestana XML.
- Semaforo en cada `<summary>`: punto verde/amarillo/rojo segun completitud de campos internos.

**Fase:** 2.
**Esfuerzo:** Medio (3h).
**Impacto:** Medio-alto — reduce sobrecarga cognitiva en cada interaccion con el catalogo.

---

### Fase 3: Diferenciadores premium

**Objetivo:** Features que elevan la percepcion de calidad de la app y extienden la coherencia a todas las pestanas. Solo se implementan despues de que el core (Fases 0-2) este solido.

**Duracion estimada:** 7-10 dias

---

#### F3.1 — Paleta de comandos Cmd+K

**Que:** Command palette con `Cmd+K` / `Ctrl+K`. Input de busqueda grande, lista de resultados con fuzzy search, categorias de comandos, navegacion con flechas, atajos visibles.

**Por que:** La app tiene 5 pestanas con funcionalidades dispersas. Cmd+K es el punto de acceso unificado que resuelve el problema de descubribilidad. Es el patron estandar de aplicaciones modernas (Linear, Notion, GitHub, VS Code). Pero se clasifica como Fase 3, no Fase 1, porque Laura no usa atajos de teclado: es un diferenciador premium, no un pain point.

**Como:**
- Nuevo componente overlay `.cmdk-overlay` + `.cmdk-box`.
- Listener global `keydown` para `Cmd+K`.
- Fuzzy search simple sin dependencias.
- Categorias: Navegacion, Datos, Filtros, Convocatoria, Herramientas, Catalogos.
- Acciones contextuales: si hay datos cargados, "Buscar empleado: [nombre]"; si hay catalogo, "Ir a accion: [nombre]"; si hay filtros activos, "Limpiar filtros".
- Cada accion muestra su atajo a la derecha.

**Fase:** 3.
**Esfuerzo:** Alto (6-8h).
**Impacto:** Alto — senal de sofisticacion y hub central de navegacion.

---

#### F3.2 — Atajos de teclado globales

**Que:** Conjunto reducido de atajos que no intercepten atajos nativos del navegador.

**Atajos definitivos (tras resolver conflictos entre documentos):**

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

**Variantes para la tabla de destinatarios (simplificado respecto a la propuesta original):**
- **Sin datos cargados:** Icono upload, "Carga tu censo de empleados", CTA "Cargar Excel".
- **Sin resultados de filtro:** Icono lupa, "Sin resultados", CTA "Limpiar filtros".
- (La tercera variante "todos excluidos" se resuelve con un toast, no con empty state elaborado — ajuste del revisor de empatia.)

**Variantes para dashboard (critico):** Cada `renderEmptyState()` del dashboard explica: (1) que datos necesita el modulo, (2) donde se introducen, (3) si el modulo es avanzado y se puede ignorar. Enlace a la pestana/seccion correspondiente.

**Variante para cola:** Icono bandeja vacia, "Cola vacia", subtitulo explicativo de como funciona.

**Variante para historial:** Icono reloj, "Sin historial", subtitulo "Las convocatorias que envies se registraran aqui".

**Variante para calendario:** Icono calendario, "Calendario vacio", subtitulo "Las acciones formativas con fechas aparecen aqui automaticamente. [Ir a Catalogos]".

**Por que:** Los empty states son tests de calidad. Un patron unificado (icono + titulo + subtitulo + CTA) en todas las pestanas crea consistencia de producto. Los empty states del dashboard son especialmente criticos: muchos usuarios nunca tendran datos para los modulos avanzados.

**Nota sobre datos de ejemplo:** El estado del arte propone un boton "Ver con datos de ejemplo" en el dashboard. Esta idea es valiosa pero queda para Fase 4 por su complejidad (requiere generar dataset sintetico coherente).

**Fase:** 3.
**Esfuerzo:** Medio (4-5h — muchas variantes pero patron reutilizable).
**Impacto:** Alto — consistencia transversal de producto.

---

#### F3.4 — Divulgacion progresiva en dashboard

**Que:** Los modulos avanzados del dashboard (ROI, equidad, interempresarial, riesgo, gestor, formacion cruzada) se colapsan por defecto. Solo se muestran los modulos operativos (KPIs, alertas, plazos FUNDAE, credito, estado, completitud). El usuario expande lo que le interesa. La seleccion se persiste en localStorage.

**Por que:** Con 15+ modulos, la carga cognitiva es maxima. Laura no consulta ROI ni indice Gini — consulta alertas y plazos. La divulgacion progresiva reduce la carga cognitiva un 40%.

**Como:**
- Envolver modulos avanzados en `<details>` con `<summary>` estilizado.
- Los modulos operativos (KPIs, alertas, plazos, credito, estado, completitud) se muestran siempre.
- Guardar el estado abierto/cerrado de cada modulo en `convocatoria_settings`.
- Si el usuario ha expandido un modulo alguna vez, recordar esa preferencia.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — resuelve el problema de feature bloat mas visible.

---

#### F3.5 — Dashboard accionable

**Que:** Cada alerta y KPI del dashboard enlaza a la accion correctiva. "3 grupos sin participantes" -> abre catalogo filtrado. "Credito al 85%" -> abre vista de credito. "2 formaciones sin confirmacion" -> abre lista de formaciones.

**Por que:** El dashboard actual presenta datos pero rara vez conecta con acciones. Un dashboard accionable transforma "coleccion de graficos" en "centro de operaciones".

**Como:** Anadir handlers `onclick` a los elementos de alerta/KPI que invocan la navegacion a la pestana correspondiente con filtros preaplicados.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — cierra la brecha entre ver datos y actuar.

---

#### F3.6 — PDF de convocatoria con branding

**Que:** Nuevo boton "Exportar convocatoria" en el menu de acciones que genera un PDF via `window.open()` con: cabecera con nombre del producto y paleta indigo, datos del evento, tabla de destinatarios con filas alternas, pie con fecha de generacion.

**Por que:** El PDF es la unica pieza de la app que personas externas ven. Su calidad comunica directamente la calidad del producto. Branding consistente (nombre del producto, paleta, tipografia Inter) extiende la identidad fuera de la app.

**Como:** Funcion `exportConvocatoriaPDF()` que abre `window.open()` con HTML inline usando estilos `@media print` + `@page`. Cabecera con borde inferior de 3px en `--accent`, titulo del evento, metadata, tabla de destinatarios, pie con fecha.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — el PDF es la extension de la identidad del producto.

---

#### F3.7 — Mejora de hoja de firmas y certificados

**Que:** Aplicar branding unificado (misma cabecera, misma paleta, misma tipografia) a la hoja de firmas y certificados existentes.

**Por que:** Cada documento generado con un nivel de pulido diferente fragmenta la percepcion de calidad. Unificar el branding visual en todos los documentos generados extiende la identidad de forma coherente.

**Como:** Actualizar `printSignSheet()` y las funciones de certificados para usar la misma cabecera y estilos `@page` que el PDF de convocatoria.

**Fase:** 3.
**Esfuerzo:** Bajo (2h).
**Impacto:** Medio — consistencia en todos los outputs de la app.

---

#### F3.8 — Bordes laterales con color semantico en secciones del panel izquierdo

**Que:** La barra indicadora de cada seccion del panel izquierdo cambia de color segun estado: `--success` cuando la seccion esta completa, `--accent` por defecto, `--warning` si faltan campos obligatorios.

**Por que:** Convierte el panel izquierdo en un checklist visual que comunica progreso sin texto adicional.

**Como:** Clases CSS `.section-label.complete::before`, `.section-label.incomplete::before`. Logica JS en `updateWorkflowStepper()` que evalua la completitud de cada seccion.

**Fase:** 3.
**Esfuerzo:** Bajo (1-2h).
**Impacto:** Medio — refuerza la sensacion de flujo guiado.

---

#### F3.9 — Animacion de seleccion/deseleccion en tabla

**Que:** Al excluir una fila, transicion suave de 200ms a `opacity: 0.4` con `text-decoration: line-through`. Al reincluir, flash breve de `background: var(--success-light)` que se desvanece.

**Por que:** La tabla es donde Laura pasa la mayor parte del tiempo. Sin transicion, excluir una fila se siente como un glitch; con transicion, se siente como una decision deliberada.

**Fase:** 3.
**Esfuerzo:** Bajo (1h).
**Impacto:** Medio.

---

#### F3.10 — Exportacion .ics de calendario

**Que:** Boton en la pestana Calendario para exportar un archivo .ics con todas las formaciones visibles.

**Por que:** Laura necesita las formaciones en su calendario de Outlook para planificar su semana.

**Como:** Generar texto plano .ics con `VCALENDAR` + `VEVENT` por cada accion con fechas. Descargar como archivo via `URL.createObjectURL`.

**Fase:** 3.
**Esfuerzo:** Bajo (2h).
**Impacto:** Medio — reduce duplicacion de trabajo.

---

#### F3.11 — View Transitions API para cambio de pestanas

**Que:** Al cambiar de pestana, usar `document.startViewTransition()` para un cross-fade de 150ms. Degradacion elegante en navegadores sin soporte.

**Por que:** El cambio de pestana actual es instantaneo (toggle de `display: none`). Una transicion suave eleva la percepcion de pulido sin complejidad significativa.

**Como:**
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

#### F3.12 — Blur sistematico en overlays

**Que:** Unificar `backdrop-filter: blur(8px)` en todos los overlays (dialogos, paleta de comandos, dropdowns de filtros). Actualmente los dialogos usan `blur(4px)`.

**Por que:** Crear profundidad y jerarquia visual consistente en todos los componentes superpuestos.

**Fase:** 3.
**Esfuerzo:** Muy bajo (30 min).
**Impacto:** Bajo-medio — contribuye al efecto compuesto de pulido.

---

#### F3.13 — Precomputacion del dashboard al cargar datos

**Que:** Al completar la carga del Excel, calcular las metricas del dashboard en un `requestIdleCallback()`. Cuando Laura navega al dashboard, renderizar instantaneamente si los datos no han cambiado.

**Por que:** El dashboard se calcula al navegar a la pestana. Con datos pesados, hay delay visible. Precomputar es "gratis" porque todo es local.

**Fase:** 3.
**Esfuerzo:** Medio (3h).
**Impacto:** Medio-alto — el dashboard carga instantaneamente.

---

#### F3.14 — Checklist de activacion persistente

**Que:** Panel colapsable en la parte superior de la app (visible solo las primeras sesiones) con 5-7 pasos: (1) Cargar organigrama, (2) Enviar primera convocatoria, (3) Crear accion formativa, (4) Generar primer XML, (5) Explorar el dashboard. Progreso persistido en localStorage. Se oculta al completar o al pulsar "No mostrar mas".

**Por que:** El onboarding actual tiene 3 pasos que solo describen el flujo de convocatoria. Las otras 4 pestanas no tienen guia de entrada. El checklist comunica activamente que la app es una plataforma integral. El efecto Zeigarnik (necesidad de completar tareas inacabadas) motiva la exploracion.

**Como:** Componente `.activation-checklist` posicionado encima del contenido principal. Cada paso tiene un icono, titulo, y estado (pendiente/completado). Se detecta la completacion automaticamente (primer Excel cargado -> paso 1 completado; primer envio -> paso 2; etc.). Se persiste en `convocatoria_settings.activationChecklist`.

**Fase:** 3.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Medio — mejora significativamente la descubribilidad y la tasa de activacion.

---

### Fase 4: Extensiones avanzadas

**Objetivo:** Features opcionales de largo plazo que amplian el alcance de la app. Algunas requieren infraestructura externa (Power Automate). Solo se abordan cuando Fases 0-3 estan completadas.

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

**Por que:** Laura recibe listas de "estos 15 tienen que ir" por email. Convertir eso en filtros es torpe.

**Fase:** 4.
**Esfuerzo:** Bajo (2-3h).
**Impacto:** Medio.

---

#### F4.3 — Recordatorios automaticos

**Que:** Checkbox en datos del evento: "Enviar recordatorio X dias antes" que usa el webhook de PA para programar un email de recordatorio.

**Por que:** Es la tarea manual mas frecuente que Laura hace fuera de la app. Cada recordatorio manual cuesta 5-10 minutos.

**Fase:** 4.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — pero depende de Power Automate.

---

#### F4.4 — Envio via Power Automate (sin deeplink)

**Que:** Nuevo modo de envio que usa el webhook existente para enviar convocatorias directamente via PA/Graph API, sin abrir pestanas de Outlook.

**Por que:** El deeplink de Outlook es el mayor pain point para >50 destinatarios y series largas. Elimina pop-up blockers y procesos manuales.

**Fase:** 4.
**Esfuerzo:** Alto (8-12h). Requiere ampliar el flujo de Power Automate.
**Impacto:** Muy alto — pero transforma la arquitectura.

---

#### F4.5 — Virtual scrolling en tabla de destinatarios

**Que:** Para datasets >500 filas, renderizar solo las filas visibles + 20 de buffer. Implementacion con IntersectionObserver o calculo de viewport sin dependencias externas.

**Por que:** Con 2.000 empleados, 2.000 nodos `<tr>` en el DOM afectan scroll smoothness y memoria.

**Fase:** 4.
**Esfuerzo:** Medio-alto (5-6h).
**Impacto:** Alto para datasets grandes.

---

#### F4.6 — Dark mode

**Que:** Definir tokens dark bajo `[data-theme="dark"]` en `:root`. Toggle en ajustes con 3 opciones: Claro, Oscuro, Sistema.

**Por que:** Los 4 referentes premium (Stripe, Linear, Figma, Vercel) lo ofrecen. Su ausencia es una senal de que la app no esta pensada para sesiones largas.

**Fase:** 4 — depende de que F0.1 (migracion de estilos inline) este significativamente avanzada.
**Esfuerzo:** Alto (8-10h).
**Impacto:** Alto — pero bloqueado por estilos inline.

---

#### F4.7 — Backup automatico de datos

**Que:** Boton "Exportar/Importar datos" que serializa todo el estado a fichero JSON. Recordatorio periodico ("Hace 7 dias que no exportas").

**Por que:** La dependencia de localStorage sin backup es el mayor riesgo de la app. Un gestor que pierde meses de historial por limpieza de cache experimenta una quiebra de confianza irrecuperable.

**Fase:** 4.
**Esfuerzo:** Bajo-medio (3h).
**Impacto:** Critico para resiliencia — pero no urgente para el flujo diario.

---

#### F4.8 — Perfil formativo de empleado

**Que:** Al buscar un empleado en el dashboard, mostrar perfil con: formaciones recibidas, horas acumuladas, encuestas contestadas, certificados, historial de asistencia.

**Fase:** 4.
**Esfuerzo:** Medio (4-5h).
**Impacto:** Medio — util para informes individuales.

---

#### F4.9 — Informe personalizable

**Que:** En el dashboard, permitir seleccionar que secciones incluir en la exportacion, anadir header con logo de empresa, opcion de exportar a PDF.

**Fase:** 4.
**Esfuerzo:** Alto (6-8h).
**Impacto:** Medio.

---

#### F4.10 — Resumen de cambios al recargar organigrama

**Que:** Al cargar un nuevo Excel con datos previos en sesion, comparar por NIF y mostrar resumen: "15 nuevas incorporaciones, 2 bajas, 4 cambios de departamento." Avisar si participantes de acciones activas ya no estan en el nuevo organigrama.

**Fase:** 4.
**Esfuerzo:** Medio (3-4h).
**Impacto:** Alto — previene descubrimiento tardio de cambios.

---

#### F4.11 — Datos de ejemplo en dashboard

**Que:** Boton "Ver con datos de ejemplo" en el empty state del dashboard que carga dataset sintetico de 3-5 acciones formativas. Marca visual clara ("Datos de ejemplo") con boton "Borrar datos de ejemplo".

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

## Propuestas descartadas o aplazadas

| Propuesta | Origen | Decision | Justificacion |
|-----------|--------|----------|---------------|
| **Sound design (4 sonidos Web Audio)** | Frontend 9.1 | **Descartada** | Laura trabaja en una oficina compartida de RRHH. El feedback auditivo no aporta valor en ese contexto; genera incomodidad social. Laura silenciaria el navegador. Los 3 revisores convergen en que es la propuesta con peor encaje al contexto real. Si se implementa alguna vez, limitarlo a un solo sonido (envio exitoso), opt-in con default OFF, y como ultima prioridad. |
| **Confetti CSS al completar cola** | Frontend 3.2 | **Descartada** | Trivializa el trabajo de Laura. Enviar 3 convocatorias de PRL no es un milestone — es martes. El estado del arte advierte: "Las mejores animaciones de exito celebran logros reales, no acciones triviales." Sustituido por resumen post-envio accionable (F2.5) con check animado sutil. |
| **Refinar opacidad de shadow-accent (0.3->0.2)** | Frontend 1.4 | **Absorbida en F0.3** | El cambio de opacidad se aplica como parte de la resolucion de ambiguedad de sombras en Fase 0. No merece propuesta propia — es cambiar un numero. |
| **Hover mejorado en filter-select-btn** | Frontend 2.2 | **Aplazada indefinidamente** | No resuelve ningun pain point documentado de Laura. La diferencia entre un hover con `translateY(-1px)` y sin el es imperceptible para la gestora. Si se implementa, sera como parte de un pase de pulido general, no como tarea priorizada. |
| **Refinar jerarquia del attendee-count** | Frontend 1.2 | **Aplazada a pulido general** | El rediseno del numero de destinatarios como KPI con subtitulo es correcto pero no urgente. Se puede hacer en un pase de pulido junto con otros ajustes tipograficos menores. |
| **PDF de convocatoria como prioridad alta** | Frontend 10.1 | **Movida a Fase 3** (F3.6) | Laura envia por Outlook, no por PDF. El PDF es un nice-to-have real. Se mantiene porque es la unica pieza visible para personas externas, pero no es critico para el flujo diario. |
| **Renombrar la app como prioridad 2** | Coherencia R1 | **Movida a Fase 0** (F0.4) como cambio trivial | El revisor de empatia cuestiona el impacto. Se resuelve: es un cambio de una linea, se hace en Fase 0 junto a la unificacion terminologica, y no se invierte mas tiempo deliberando. |
| **Filtros avanzados AND/OR** | Frontend revision (2.10) | **Aplazada indefinidamente** | Complejidad UI alta para un caso de uso infrecuente. El sistema actual (AND implicito con multi-select dentro de cada filtro) cubre el 95% de los escenarios de Laura. |
| **Bento Grid para dashboard** | Frontend revision (2.6) | **Aplazada indefinidamente** | El layout bento grid requiere un rediseno completo del dashboard. Es una mejora visual significativa pero el esfuerzo es desproporcionado respecto al impacto para Laura. La divulgacion progresiva (F3.4) resuelve el problema de sobrecarga sin rehacer el layout. |
| **Personalizacion de columnas en tabla** | Frontend revision (2.3) | **Aplazada a Fase 4+** | La tabla tiene pocas columnas fijas (checkbox, nombre, puesto, ubicacion, email). La personalizacion tiene sentido para tablas de 10+ columnas, no para 5. |

---

## Registro de resolucion de incoherencias

### Incoherencias del revisor de frontend (8)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **1.1** | **Inter: elogio como "Excelente" vs. estado del arte que la identifica como "segura"** | Mantener Inter — es la fuente correcta para productividad. Pero modernizar la carga: cargar como variable font (`wght@300..700`) y usar `clamp()` para tipografia fluida (F4.12). No es prioridad: el impacto para Laura es nulo, pero se incluye como pulido futuro. |
| **1.2** | **Sombras: 2 niveles documentados vs. 4 reales en CSS** | Resuelto en F0.3. Las sombras accent no son un "nivel" de elevacion — son una variante de color. Se redefinira la documentacion: 2 niveles de elevacion + 1 variante cromatica. Se ajusta opacidad de `--shadow-accent` a 0.2. |
| **1.3** | **Toasts: mejora incremental (frontend) vs. panel persistente (empatia) vs. centro de notificaciones (estado del arte)** | Tres capas complementarias: (1) Toasts mejorados con icono/progreso/undo/aria-live (F1.4). (2) Panel persistente de calidad de datos para problemas del Excel (F2.1). (3) No se implementa centro de notificaciones completo — excesivo para app single-user. Si se anade un historial basico accesible desde icono en el header como mejora futura. |
| **1.4** | **Empty states: tabla (frontend) vs. dashboard (coherencia) vs. datos de ejemplo (estado del arte)** | Unificados en F3.3 bajo sistema de componentes `.empty-state` con variantes por tipo y pestana. Se simplifica la tabla a 2 variantes (en vez de 3). Los datos de ejemplo para dashboard se aplazan a F4.11. |
| **1.5** | **Atajos de teclado: `Cmd+F`/`Cmd+A` (frontend) vs. `Ctrl+E` (empatia) — conflicto con nativos del navegador** | No interceptar atajos nativos del navegador. Conjunto definitivo en F3.2: `Cmd+K`, `Cmd+Enter`, `Cmd+Shift+Enter`, `Cmd+1..5`, `Cmd+Shift+H`, `Cmd+,`, `Escape`. Convenciones unificadas con `isMod = e.metaKey || e.ctrlKey`. |
| **1.6** | **Dialogo de confirmacion rediseñado (frontend) vs. vista previa del email (empatia) — solapamiento funcional** | Fusionados en F2.3. Un solo dialogo de preview+confirmacion de dos secciones. Preview arriba (lo que se va a enviar), avisos abajo (conflictos, FUNDAE). Tratamiento visual premium de la propuesta frontend. Resuelve ambas necesidades sin duplicacion. |
| **1.7** | **Confetti al completar cola (frontend) vs. selectividad de celebraciones (estado del arte)** | Confetti descartado completamente. Sustituido por F2.5 (resumen post-envio accionable con check animado sutil). El estado del arte advierte contra celebrar acciones que para Laura son rutina. |
| **1.8** | **Nombre del producto: "Convocatoria de Formaciones" vs. alternativas** | Resuelto en F0.4. Se adopta "Formaciones FUNDAE". Se implementa en Fase 0 como cambio trivial junto a la unificacion terminologica. |

### Incoherencias del revisor de empatia (10)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **E1** | **Sound design no encaja con el contexto de oficina de Laura** | Descartado de la priorizacion activa. Si se implementa, sera lo ultimo, opt-in con default OFF, y un solo sonido. Ver seccion "Propuestas descartadas". |
| **E2** | **Confetti trivializa el trabajo de Laura** | Descartado. Sustituido por resumen accionable (F2.5). |
| **E3** | **Cmd+K clasificado como "Muy alto impacto" pero Laura no usa atajos** | Reclasificado como impacto alto pero Fase 3 (no Fase 1). Es un diferenciador premium, no un pain point. Se prioriza despues de las propuestas funcionales (semaforo FUNDAE, panel de calidad de datos, etc.). |
| **E4** | **Atencion excesiva al primer contacto visual vs. uso continuado** | Redirigida la inversion: F1.7 (indicador de guardado y estado de sesion) mejora el "momento de retorno" de Laura. Los empty states de la tabla (F3.3) se simplifican a 2 variantes. El esfuerzo se concentra en el estado "cargado con problemas" (F2.1, panel de calidad de datos). |
| **E5** | **Migrar estilos inline priorizado como "esfuerzo alto" — impacto cero para Laura** | Reclasificado: se implementa parcialmente en F0.1 como prerequisito tecnico (no como propuesta de valor para Laura). Solo se migran los componentes que se van a tocar en Fases 1-2. No se comunica como mejora de producto. |
| **E6** | **Empty states asumen usuario nuevo — Laura nunca los ve** | Resuelto invirtiendo proporciones: 80% del esfuerzo en panel de calidad de datos (F2.1, estado "cargado con problemas") y 20% en empty states (F3.3, 2 variantes simples para la tabla). El empty state de la cola y del dashboard si tienen valor recurrente. |
| **E7** | **Flujo de lotes por ubicacion ausente de todos los docs excepto empatia** | Incorporado como F4.1 (convocatoria por lotes). Se clasifica como Fase 4 por su complejidad de UI, pero se reconoce como la propuesta con mayor ratio de ahorro de tiempo potencial. |
| **E8** | **Duplicacion funcional de templates — 3 tipos sin solucion propuesta** | Incorporado como F4.13 (unificacion de templates). Se aplaza por la complejidad de migrar plantillas existentes de los usuarios, pero el objetivo es un unico concepto de "plantilla". |
| **E9** | **Sombras, attendee-count y hover de filtros priorizados por encima de pain points reales** | Resuelto: sombras absorbidas en F0.3 (trivial), attendee-count y hover aplazados a pulido general. Las prioridades de Fases 1-2 se alinean con los pain points de Laura (busqueda flexible, duplicar accion, semaforo FUNDAE, panel de calidad de datos). |
| **E10** | **Renombrar la app como prioridad 2 — impacto nulo para Laura** | Resuelto: se ejecuta en F0.4 como cambio trivial (15 min) sin deliberacion adicional. No se prioriza como tarea independiente; se hace junto a la unificacion terminologica. |

### Incoherencias del revisor de coherencia (6)

| # | Incoherencia | Resolucion |
|---|-------------|------------|
| **C1** | **La brecha de identidad se agranda con las propuestas de empatia (P2, P7, P15, P16)** | Resuelto por la narrativa del producto (seccion 1): la app es una herramienta de escritorio para el ciclo FUNDAE. Las propuestas que desbordan este alcance (P15 perfil formativo, P16 informe personalizable) se mueven a Fase 4 como extensiones. Las que requieren backend (P2, P7) se clasifican como extensiones opcionales. |
| **C2** | **Propuestas empujan en direcciones opuestas: herramienta personal vs. plataforma departamental** | Resuelto por la narrativa: es una herramienta personal para gestoras. Los modulos analiticos avanzados (ROI, equidad, interempresarial) son funcionalidades avanzadas ocultas por defecto (F3.4, divulgacion progresiva). No se eliminan, pero no definen la identidad. |
| **C3** | **Terminologia inconsistente ENTRE los propios documentos de propuestas** | Resuelto por el glosario vinculante (seccion 2). El glosario se aplica retroactivamente a la implementacion. "Asistentes" -> "Destinatarios" en el flujo de convocatoria. "Participantes" solo en FUNDAE. "Empleados" solo al referirse al censo. |
| **C4** | **Disparidad de madurez se profundiza: 21 propuestas para Convocatoria, 1 para Calendario** | Resuelto con la estructura de fases: Fase 2 se centra en el flujo principal (convocatoria), Fase 3 iguala la calidad en todas las pestanas (empty states transversales, dashboard accionable, checklist de activacion que guia por las 5 pestanas). |
| **C5** | **Tension localStorage vs. funcionalidades que requieren backend (P2, P7)** | Resuelto clasificando las funcionalidades que dependen de PA como Fase 4 (extensiones). La identidad base de la app no depende de backend. Las extensiones via PA son opcionales y no se incluyen en el onboarding ni en la narrativa del producto. |
| **C6** | **Onboarding se complica con cada nueva funcionalidad anadida** | Resuelto con el checklist de activacion (F3.14) que reemplaza el onboarding puntual de 3 pasos. El checklist es persistente, cubre las 5 pestanas, y se puede cerrar. Las funcionalidades nuevas no requieren explicacion en el onboarding — se descubren via el checklist y via Cmd+K. |

---

## Principios para la implementacion

Derivados de la investigacion, el CLAUDE.md y las conclusiones de los 3 revisores:

1. **Todo dentro de `convocatoria.html`** — no crear archivos adicionales.
2. **Usar variables CSS existentes** — nunca hardcodear colores.
3. **Respetar `prefers-reduced-motion`** — todas las animaciones nuevas deben tener fallback en el bloque `@media (prefers-reduced-motion: reduce)` existente.
4. **Consistencia sobre novedad** — cada nuevo componente reutiliza patrones existentes (`--radius`, `--transition`, `--shadow-sm/lg`).
5. **El efecto compuesto** — la percepcion premium no viene de una sola mejora sino de la acumulacion de cientos de decisiones correctas.
6. **Laura sobre el disenador** — ante cualquier duda de priorizacion, la pregunta es: "¿Esto ayuda a Laura a hacer su trabajo mas rapido o con menos miedo a errores?"
7. **Prevencion sobre curacion** — es mas valioso evitar un error (semaforo FUNDAE, validacion on-blur) que mostrar un error bonito.
8. **Informacion de cierre sobre celebracion** — Laura necesita saber que salio bien y cual es el siguiente paso, no confetti ni sonidos.
9. **Coherencia transversal** — no pulir la pestana de Convocatoria al nivel de Stripe mientras el Calendario sigue siendo un Gantt sin guia. Cada fase debe elevar todas las pestanas proporcionalmente.
10. **La deuda tecnica se paga primero** — Fase 0 existe por una razon. Implementar mejoras visuales sobre estilos inline es construir sobre arena.
