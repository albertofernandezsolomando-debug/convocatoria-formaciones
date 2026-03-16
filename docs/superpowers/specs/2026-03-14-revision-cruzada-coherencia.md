# Revision Cruzada: Coherencia de la Propuesta de Valor

**Fecha:** 14 de marzo de 2026
**Tipo:** Auditoria estrategica cruzada — revision de 5 documentos de diseno
**Perspectiva:** Coherencia de identidad de producto
**Documentos revisados:**
1. Auditoria de coherencia de la propuesta de valor (11 recomendaciones)
2. Propuestas frontend premium (20 propuestas)
3. Propuestas de empatia usuaria (16 propuestas)
4. Estado del arte UI/UX 2025-2026 (research)
5. Percepcion de alto valor (research)

---

## Resumen ejecutivo

Los cinco documentos contienen trabajo de alta calidad individual. Sin embargo, al leerlos como conjunto, emergen tensiones estrategicas no resueltas, terminologia contradictoria, y propuestas que, implementadas sin coordinacion, fragmentarian la identidad del producto en lugar de consolidarla. Este informe identifica esas grietas y propone una narrativa unificadora que permita ordenar la implementacion.

El hallazgo central: **los documentos diagnostican el mismo problema de identidad pero proponen soluciones que tiran en direcciones opuestas**. La auditoria pide simplificar y decidir si es herramienta operativa o plataforma analitica. Las propuestas frontend anaden capas de sofisticacion premium (sound design, Cmd+K, confetti). Las propuestas de empatia anaden funcionalidades nuevas (recordatorios, envio via PA, listas de espera). Sin un arbitro estrategico, la implementacion conjunta profundizaria exactamente el problema que la auditoria diagnostico: una aplicacion que no sabe lo que es.

---

## 1. Incoherencias detectadas

### 1.1 La brecha de identidad se agranda, no se cierra

La auditoria (R1) identifica con precision que el nombre "Convocatoria de Formaciones" describe una funcionalidad, no un producto. Propone renombrar a algo como "Gestor de Formacion FUNDAE" o "Central de Formacion".

Sin embargo, las propuestas de empatia anaden funcionalidades que desbordan incluso estos nombres mas amplios:

| Propuesta | Funcionalidad | Se ajusta al nombre propuesto? |
|-----------|---------------|-------------------------------|
| P2: Envio via Power Automate | Backend de envio de emails | Si, marginalmente |
| P7: Recordatorios automaticos | Workflow de comunicacion temporal | Amplia el alcance a "automatizacion" |
| P3b (implicita): Confirmacion de asistencia | Flujo bidireccional con empleados | Ya no es "gestion", es "comunicacion" |
| P15: Perfil formativo de empleado | Gestion de talento individual | Desborda hacia RRHH estrategico |
| P16: Informe personalizable con logo | Generacion de reporting corporativo | Desborda hacia BI |

**El problema:** Si se implementan P2, P7, P15 y P16, la herramienta ya no es un "gestor de formacion" sino una "plataforma de gestion de formacion y comunicacion con reporting". Y el titulo seguira siendo inadecuado. La recomendacion R1 de renombrar deberia ejecutarse *despues* de decidir cuales de estas propuestas se implementan, no antes.

### 1.2 Propuestas que empujan en direcciones estrategicas opuestas

La auditoria (seccion 1.3) identifica la tension central no resuelta: **herramienta personal vs. plataforma departamental**. Los otros documentos no la resuelven; la agravan:

**Direccion "herramienta personal para Laura":**
- Empatia P1: Panel de calidad de datos (orientado a la operativa individual)
- Empatia P4: Duplicar accion formativa (workflow personal)
- Empatia P5: Vista previa de convocatoria (control individual)
- Empatia P11: Busqueda flexible de hoja Excel (facilitar la carga personal)
- Frontend 9.1: Sound design (experiencia individual, opt-in)

**Direccion "plataforma departamental/directiva":**
- Empatia P15: Perfil formativo de empleado (vision de Direccion de RRHH)
- Empatia P16: Informe personalizable con logo corporativo (reporting a Direccion)
- Frontend 10.1: PDF de convocatoria profesional (documento que se comparte externamente)
- Auditoria: Los modulos de dashboard ROI, equidad, riesgo, interempresarial ya apuntan a esta direccion

**El conflicto concreto:** La auditoria dice "si es herramienta personal, los modulos analiticos avanzados son over-engineering". Pero la propuesta P16 (informe personalizable) invierte directamente en esos modulos analiticos. Y la propuesta P15 (perfil formativo) crea una funcionalidad nueva que solo tiene sentido en contexto departamental. Ninguno de los documentos resuelve la tension; solo anaden peso a ambos lados.

### 1.3 Terminologia inconsistente ENTRE documentos

La auditoria (R5) identifica correctamente el problema de "asistentes" vs. "participantes" vs. "empleados" dentro de la aplicacion. Pero los propios documentos de propuestas reproducen la inconsistencia:

| Termino | Doc. Auditoria | Doc. Frontend | Doc. Empatia |
|---------|---------------|---------------|--------------|
| Personas en formacion | "asistentes", "participantes", "personas" | "asistentes" (1.2, 3.1, 4.1, 10.1) | "asistentes" (1.2, 1.4), "participantes" (1.6, 3.1) |
| Formacion | "formacion", "accion formativa", "evento" | "convocatoria", "evento" | "formacion", "accion formativa", "convocatoria" |
| La persona que usa la app | "usuario", "gestor" | "usuario" | "Laura", "gestora", "usuaria" |
| Datos del organigrama | "datos", "Excel", "organigrama" | "datos", "Excel" | "censo de empleados", "organigrama", "Excel" |
| Lo que se envia | "convocatoria", "email" | "email de convocatoria", "convocatoria" | "convocatoria", "invitacion" |

**Problema concreto:** El documento de empatia usa "Laura" y "gestora" (feminizado), mientras que la auditoria usa "gestor" (masculino) y "usuario". El frontend habla de "attendee-count" en el codigo y "asistentes" en el texto. Si tres equipos escriben la interfaz con terminologia diferente, la app reflejara esa falta de alineacion.

Pero mas importante aun: los documentos usan "convocatoria" para referirse a tres cosas distintas:
1. **La aplicacion** ("Convocatoria de Formaciones" como nombre del producto)
2. **El acto de convocar** ("enviar una convocatoria")
3. **El email resultante** ("la convocatoria que recibe el empleado")

Esta polisemia es la raiz del problema de identidad. Si el producto se llama igual que la accion que realiza, el usuario nunca percibira que hace mas cosas.

### 1.4 La disparidad de madurez se profundiza

La auditoria (seccion 2.1) mapea la madurez por funcionalidad: Convocatoria y Catalogos en "Alta", Calendario en "Media", Dashboard avanzado en "Baja".

Las propuestas de mejora concentran la inversion en las areas que YA estan maduras:

| Area | Propuestas que recibe | Madurez actual |
|------|----------------------|----------------|
| Flujo de Convocatoria | Frontend: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1. Empatia: P1, P2, P5, P6, P7, P11, P13 | Alta |
| Catalogos FUNDAE | Empatia: P3, P4, P14 | Alta |
| Generacion XML | Empatia: P3, P10 | Media-Alta |
| Calendario | Empatia: P8 (solo exportacion .ics) | Media |
| Dashboard | Auditoria: R3, R4, R8. Empatia: P9, P15, P16 | Baja a Media |

**21 propuestas para el flujo de convocatoria. 1 propuesta para el calendario.**

Esto sigue la logica natural de "mejorar lo que mas se usa", pero viola el principio de coherencia de producto: si una pestana tiene animaciones celebratorias con confetti y sound design, y otra pestana es un Gantt read-only sin guia, la percepcion de calidad se degrada globalmente. La investigacion de percepcion de alto valor (hallazgo 5) lo dice explicitamente: "Las inconsistencias visuales (incluso pequenas) generan desconfianza desproporcionada."

### 1.5 Tension localStorage vs. funcionalidades que requieren backend

La auditoria identifica la fragilidad de localStorage (R11). Las propuestas de empatia anaden dependencias que profundizan la tension:

- **P2 (envio via PA)** requiere ampliar el flujo de Power Automate, crear un backend de facto
- **P7 (recordatorios)** requiere programacion temporal fuera del navegador
- **P3b (confirmacion de asistencia)** requiere recibir respuestas, lo que implica un flujo bidireccional
- **P9 (alertas proactivas)** funciona con localStorage, pero su valor real seria como notificacion push

Estas propuestas transforman silenciosamente la arquitectura de "single-file sin servidor" a "cliente ligero con backend Power Automate". Ninguno de los documentos explicita esta transicion ni sus implicaciones:
- Si Power Automate se cae, la app pierde funcionalidades clave
- La configuracion del webhook ya se identifica como "intimidante" (empatia, 1.10c)
- Cada nueva funcionalidad via PA aumenta la complejidad de la primera configuracion

### 1.6 El onboarding se complica en lugar de simplificarse

La auditoria (R2) pide reescribir el onboarding para cubrir las 5 pestanas. Pero las propuestas de empatia anaden workflows que harian el onboarding aun mas complejo:

- Con P2 (envio via PA), el onboarding deberia explicar dos modos de envio
- Con P7 (recordatorios), el onboarding deberia explicar la programacion de recordatorios
- Con P9 (alertas proactivas), hay un banner nuevo en Convocatoria que necesita explicacion
- Con P3 (semaforo FUNDAE), hay un nuevo sistema de indicadores visuales

El research de estado del arte (seccion 5.1) es claro: "El progressive onboarding ha ganado al tour completo. La regla de los 45 segundos: limitar los tours a 45 segundos como maximo." Si se implementan todas las propuestas, explicar la app en 45 segundos es imposible.

---

## 2. Oportunidades perdidas

### 2.1 Design system como columna vertebral de identidad

El research de estado del arte (seccion 11) documenta extensamente como los design systems maduros son la base de la identidad de producto en 2025-2026. La auditoria reconoce que el design system actual es "ejemplar en su restriccion" pero tiene un talon de Aquiles: los estilos inline en JS.

**Oportunidad no detectada:** La propuesta R6 (migrar estilos inline a CSS) se clasifica como "impacto medio, esfuerzo alto" y queda en ultima posicion. Pero es el prerequisito tecnico para que TODAS las mejoras visuales del documento frontend sean mantenibles. Sin R6:
- Los toasts mejorados (1.1) se implementaran con mas estilos inline
- Los empty states (4.1-4.3) se implementaran con mas estilos inline
- El dialogo de confirmacion (3.1) se implementara con mas estilos inline
- Cada mejora visual aumenta la deuda tecnica que R6 deberia resolver

La propuesta R6 deberia ser Fase 0, no Fase 4. Es la infraestructura que hace posible todo lo demas sin degradar la mantenibilidad.

### 2.2 Sinergia Cmd+K + divulgacion progresiva + identidad

Tres propuestas de distintos documentos, combinadas, resolverian simultaneamente multiples problemas de identidad:

1. **Cmd+K** (Frontend 7.1) — Punto de acceso unificado
2. **Divulgacion progresiva del dashboard** (Auditoria R3) — Reducir sobrecarga
3. **Modo compacto para acciones formativas** (Empatia P14) — Reducir complejidad de formularios

Si se implementan juntas como un sistema coherente de "complejidad bajo demanda":
- La paleta de comandos seria el punto de entrada a CUALQUIER funcionalidad, resolviendo el problema de descubribilidad (seccion 4.3 de la auditoria)
- El dashboard mostraria solo los modulos que el usuario ha activado via Cmd+K o via configuracion
- Los formularios mostrarian solo los campos operativos, con los campos FUNDAE accesibles via Cmd+K ("Mostrar campos FUNDAE") o via un toggle

Esta combinacion resolveria la brecha de identidad porque comunicaria: "la app es simple por defecto, pero tan potente como la necesites". En lugar de que el usuario vea 15+ modulos y se abrume, veria 5 modulos que eligio y una paleta de comandos que le recuerda que hay mas.

**Ninguno de los documentos conecta estas tres propuestas como un sistema.** Se presentan como mejoras independientes.

### 2.3 El research de UI/UX sobre branding que no se aprovecha

El research de estado del arte (seccion 7) documenta tendencias visuales directamente aplicables al problema de identidad que la auditoria detecta, pero que ninguna propuesta aborda:

- **Bento Grid Layouts (7.1):** El dashboard actual renderiza modulos secuencialmente (scroll vertical). Un bento grid permitiria un layout mas visual y personalizable que ademas comunicaria identidad de producto moderna. Ninguna propuesta lo menciona.

- **Dark mode como estandar (7.4):** La auditoria (5.3) menciona la ausencia de dark mode como debilidad competitiva. El research lo documenta como expectativa baseline en 2025. Ninguna propuesta lo incluye. Y la propuesta R6 (migrar inline styles) es prerequisito para dark mode, lo que refuerza que R6 deberia ser prioritaria.

- **Variable fonts y tipografia fluida (7.3):** Inter ya soporta variable font. Usarla con `clamp()` mejoraria la experiencia responsive sin anadir complejidad. Ninguna propuesta lo menciona.

### 2.4 Percepcion de alto valor que aborda identidad directamente

El research de percepcion de alto valor contiene hallazgos que apuntan directamente a los problemas de identidad, pero que las propuestas no aprovechan suficientemente:

- **Hallazgo 5 (consistencia = credibilidad):** "Un 75% de los juicios de credibilidad se basan en la coherencia del diseno." Esto no solo aplica a lo visual. Aplica a la coherencia terminologica, a la coherencia de flujos entre pestanas, y a la coherencia del nivel de pulido entre modulos. Las propuestas frontend invierten en pulir la pestana Convocatoria pero ignoran las otras 4, creando una disparidad de pulido que este mismo hallazgo predice que sera danina.

- **Hallazgo 10 (el foso UX de Stripe):** "La percepcion de calidad se construye con consistencia implacable." Implementar confetti y sound design en el flujo de convocatoria mientras el calendario sigue siendo un Gantt read-only sin guia es lo opuesto a consistencia implacable. Es consistencia selectiva, que es peor que ausencia de polish porque establece un estandar que el resto de la app no cumple.

- **Seccion 7.3 (calidad de exportacion):** "La calidad de los PDF exportados comunica directamente la calidad del producto." La propuesta 10.1 (PDF de convocatoria) es correcta pero incompleta. El PDF es la unica pieza visible para personas EXTERNAS a la app. Deberia llevar un branding consistente (nombre del producto, paleta, tipografia) que refuerce la identidad. Ninguna propuesta conecta el PDF con la identidad del producto.

### 2.5 Checklist de activacion como solucion al onboarding

El research de estado del arte (seccion 5.4) documenta que "las empresas que usan checklists de onboarding ven tasas de activacion del 40%+". La auditoria (R2) propone reescribir el onboarding, y la empatia detecta que "Laura no sabe por donde empezar" en Catalogos.

**Oportunidad no detectada:** Un checklist de activacion persistente (no un tour de 3 pasos que se ve una vez) resolveria multiples problemas simultaneamente:
- Guiaria a Laura por las 5 pestanas en orden logico
- Mostraria progreso ("3 de 7 pasos completados")
- Serviria como indicador de que la app hace mas que enviar convocatorias
- Aprovecharia el efecto Zeigarnik para motivar la exploracion

Esto es cualitativamente diferente del onboarding actual (3 pasos puntuales) y del propuesto (4 pasos). Es un sistema de guia persistente que refuerza la identidad de "plataforma integral".

---

## 3. Propuestas de mejora

### 3.1 Narrativa unificadora

Antes de implementar cualquier propuesta, la herramienta necesita una definicion de identidad en una frase. Basandome en el analisis cruzado de los cinco documentos:

> **"La herramienta de escritorio para gestoras de formacion que cubre el ciclo completo FUNDAE — desde la convocatoria hasta la justificacion — sin necesitar nada de TI."**

Esta definicion:
- Reconoce que es una herramienta de escritorio (no una plataforma SaaS)
- Identifica a la usuaria principal (gestora de formacion, no directora de RRHH)
- Define el alcance (ciclo completo FUNDAE, no gestion de talento ni BI)
- Explicita la ventaja clave (sin TI = zero-deployment)
- Excluye implicitamente lo que NO es (no es analitica directiva, no es gestion de RRHH)

Esta narrativa implica decisiones:
- Los modulos analiticos avanzados (ROI, equidad, interempresarial) quedan fuera del core. Pueden existir como funcionalidades avanzadas ocultas por defecto.
- Las propuestas que requieren backend (P2, P7, P3b) son extensiones opcionales, no parte de la identidad base.
- El nombre deberia reflejar "ciclo FUNDAE": algo como **"Formaciones FUNDAE"** o **"Ciclo FUNDAE"**.

### 3.2 Ordenacion por fases de identidad

Las propuestas deben implementarse en un orden que construya identidad progresivamente, no que la fragmente. Propongo cuatro fases:

**Fase 0 — Infraestructura de coherencia** (antes de cualquier mejora visible)
1. R6 parcial: Migrar los estilos inline de los componentes que se van a tocar (toasts, empty states, dialogos) a clases CSS
2. R5: Unificar terminologia en toda la app
3. R7: Resolver ambiguedad de sombras
4. Definir y documentar el glosario de terminos (ver seccion 3.4)

**Fase 1 — Identidad basica** (la app sabe lo que es)
1. R1: Renombrar la aplicacion (con el nombre decidido por la narrativa)
2. R2 ampliado: Onboarding como checklist de activacion persistente
3. Empatia P11: Busqueda flexible de hoja Excel (primera impresion)
4. Frontend 5.2: Diagnostico de errores de Excel (primera impresion)
5. Empatia P1: Panel persistente de calidad de datos (primera impresion)
6. R8: Empty states accionables en TODAS las pestanas (no solo dashboard)

**Fase 2 — Flujo core premium** (la pestana principal es excelente)
1. Frontend 1.1: Toasts con icono + progreso + undo
2. Frontend 3.1: Dialogo de confirmacion rediseñado
3. Frontend 4.1: Empty states contextuales de la tabla
4. Frontend 5.1: Errores contextuales en formulario
5. Empatia P5: Vista previa de convocatoria
6. Empatia P4: Duplicar accion formativa
7. Frontend 2.3: Animacion de exito en upload
8. R9: Momento final del flujo (resumen post-envio)

**Fase 3 — Coherencia transversal** (todas las pestanas al mismo nivel)
1. R3: Divulgacion progresiva en dashboard (modulos colapsables/seleccionables)
2. R4: Dashboard accionable (links a acciones correctivas)
3. Empatia P3: Semaforo readiness FUNDAE (conecta Catalogos con XML)
4. Empatia P14: Modo compacto para acciones formativas
5. Empatia P9: Alertas proactivas fuera del dashboard
6. Empatia P8: Exportacion .ics desde calendario
7. Frontend 7.1 + 8.1: Paleta de comandos + atajos de teclado
8. Frontend 10.1: PDF de convocatoria con branding

**Fase 4 — Extensiones opcionales** (funcionalidades avanzadas para usuarios maduros)
1. Empatia P2: Envio via Power Automate
2. Empatia P7: Recordatorios automaticos
3. Empatia P6: Seleccion por lista de NIFs
4. R11: Backup automatico de datos
5. Frontend 6.2: Precomputacion del dashboard
6. Frontend 9.1: Sound design (opt-in)
7. Empatia P10: Auto-relleno grupo XML
8. Empatia P15: Perfil formativo de empleado
9. Empatia P16: Informe personalizable

**Logica de la secuencia:** Cada fase construye sobre la anterior. La Fase 0 crea las condiciones tecnicas. La Fase 1 establece la identidad. La Fase 2 hace excelente el flujo principal. La Fase 3 iguala el nivel de calidad en toda la app. La Fase 4 anade sofisticacion sin comprometer la coherencia basica.

### 3.3 Propuestas que faltan para cerrar brechas de coherencia

Los documentos existentes dejan huecos especificos en la coherencia:

**H1. Guia contextual para Catalogos FUNDAE.** Es la segunda pestana mas importante y no tiene onboarding, guia de inicio, ni indicacion de flujo. Falta una propuesta equivalente al flujo de 3 pasos de Convocatoria: "1. Crea tu primera accion formativa. 2. Anade participantes. 3. Registra asistencia." El checklist de activacion (seccion 2.5) resolveria esto parcialmente, pero la pestana necesita guia especifica.

**H2. Guia contextual para XML FUNDAE.** El flujo XML es el mas complejo y el menos guiado. Falta una propuesta de "wizard de generacion XML" que lleve a Laura paso a paso: seleccionar accion -> verificar readiness -> completar datos de grupo -> generar. El semaforo de readiness (P3) es un componente de esto, pero no el flujo completo.

**H3. Calendario con sentido propio.** El calendario es la pestana mas huerfana. Solo recibe una propuesta (P8, exportacion .ics). Falta una vision de que quiere ser el calendario: si es una vista de consulta pasiva, deberia ser un widget del dashboard (no una pestana propia). Si es una herramienta de planificacion, necesita acciones (crear, editar, mover formaciones). La auditoria lo diagnostica pero no propone solucion.

**H4. Pagina "Acerca de" o identidad visible.** Ningun documento propone que la app tenga un lugar donde declare que es, quien la hizo, y que version tiene. Para una herramienta de archivo unico sin sitio web, la propia app es el unico canal de comunicacion de identidad. Un footer minimo con nombre, version y link a documentacion reforzaria la percepcion de producto serio.

**H5. Consistencia de los certificados e impresos.** La auditoria clasifica "Certificados/hoja de firmas" como madurez "Baja". La propuesta 10.2 mejora la hoja de firmas. Pero falta una propuesta que unifique TODOS los documentos generados (PDF convocatoria, hoja de firmas, certificado de asistencia, certificado de aprovechamiento, XML FUNDAE, informe del dashboard) bajo un branding visual comun: misma cabecera, misma paleta, misma tipografia. Sin esto, cada documento generado tiene un nivel de pulido diferente y la percepcion de fragmentacion se extiende fuera de la app.

### 3.4 Propuesta de glosario de terminos unificado

Basandome en el analisis terminologico cruzado (seccion 1.3), propongo el siguiente glosario vinculante para la interfaz:

| Concepto | Termino en la UI | NO usar | Razon |
|----------|-----------------|---------|-------|
| La aplicacion | [nombre a decidir, ej. "Formaciones FUNDAE"] | "Convocatoria de Formaciones" | Confunde producto con funcionalidad |
| Persona del organigrama Excel | **Empleado/a** | "Trabajador/a" | Es el termino del campo Excel |
| Empleado seleccionado para una convocatoria | **Destinatario/a** | "Asistente", "Participante" | "Asistente" confunde con "asistio"; "Participante" es termino FUNDAE para otro contexto |
| Empleado registrado en accion FUNDAE | **Participante** | "Asistente" | Es el termino oficial FUNDAE |
| Acto de enviar invitaciones | **Convocar** / **Convocatoria** | "Enviar", "Invitar" | Mantiene el verbo del dominio |
| Email que recibe el empleado | **Invitacion** | "Convocatoria" (cuando se refiere al email) | Distingue el email del acto |
| Registro del catalogo | **Accion formativa** | "Formacion" (cuando hay ambiguedad), "Curso" | Es el termino FUNDAE oficial |
| Evento con fecha y hora | **Sesion** | "Evento" (cuando hay ambiguedad) | Distingue la sesion puntual de la accion formativa completa |
| Persona que usa la app | **Gestora** (en documentacion), referencia neutra en la UI | "Usuario", "Admin" | Humaniza sin asumir genero en la interfaz |
| Datos del organigrama | **Censo** / **Organigrama** | "Datos", "Excel" (cuando se refiere al contenido) | "Datos" es demasiado generico |
| Proveedor de formacion | **Proveedor** | "Empresa formadora" | Consistencia |
| Persona que imparte la formacion | **Formador/a** | "Tutor/a" (en la UI), "Profesor/a" | FUNDAE usa "tutor", pero la UI puede ser mas natural; mantener "tutor" solo en contexto XML |

**Nota critica:** El termino mas problematico es la distincion entre "Destinatario" (seleccionado para recibir convocatoria) y "Participante" (registrado en accion FUNDAE). Propongo "Destinatario" porque es preciso: son los destinatarios del email. Una vez que asisten y se registran en el catalogo, pasan a ser "Participantes". Esta transicion semantica refleja la transicion funcional real (Convocatoria -> Catalogo).

---

## 4. Priorizacion revisada: Top 10 para coherencia

De todas las propuestas (originales + las que faltan), las 10 mas impactantes para la COHERENCIA del producto como identidad unica:

| # | Propuesta | Origen | Por que es critica para coherencia |
|---|-----------|--------|-----------------------------------|
| 1 | **Unificar terminologia** (R5 + glosario 3.4) | Auditoria | La terminologia inconsistente es la fractura de identidad mas visible. Cada termino diferente para el mismo concepto dice "esto lo hicieron personas distintas que no se hablan". Esfuerzo bajo, impacto transversal en toda la app. |
| 2 | **Migrar estilos inline a CSS** (R6 parcial — componentes tocados) | Auditoria | Prerequisito tecnico para que cualquier mejora visual sea consistente y mantenible. Sin esto, cada mejora visual es deuda tecnica nueva. |
| 3 | **Renombrar la aplicacion** (R1) | Auditoria | El nombre define la expectativa. Mientras se llame "Convocatoria de Formaciones", el 80% de la app parecera fuera de lugar. El nuevo nombre debe reflejar la narrativa unificadora (seccion 3.1). |
| 4 | **Checklist de activacion persistente** (R2 ampliado + H1 + H2) | Auditoria + propuesta nueva | Sustituye el onboarding puntual por una guia que cubre las 5 pestanas y persiste hasta completarse. Comunica activamente que la app es una plataforma integral, no una herramienta de envio. |
| 5 | **Empty states accionables en TODAS las pestanas** (R8 ampliado) | Auditoria | Los empty states son la primera impresion de cada pestana. Si el dashboard dice "Sin datos disponibles" y el calendario dice "Calendario vacio" con mensajes genericos, cada pestana parece un producto diferente. Unificar el patron (icono + titulo + subtitulo + CTA) en las 5 pestanas crea consistencia de producto. |
| 6 | **Divulgacion progresiva del dashboard** (R3) | Auditoria | Resuelve el problema mas visible de feature bloat. Un dashboard con 5 modulos elegidos se percibe como "potente pero controlado"; uno con 15+ modulos se percibe como "no saben que quitar". La divulgacion progresiva alinea el dashboard con la identidad de "herramienta que Laura necesita", no de "demo de todo lo que se puede hacer". |
| 7 | **Semaforo readiness FUNDAE** (Empatia P3) | Empatia | Conecta las pestanas Catalogos, XML y Dashboard en un flujo coherente. Crea un lenguaje visual transversal (rojo/amarillo/verde) que se entiende sin explicacion. Refuerza la identidad de "herramienta FUNDAE nativa" que es la ventaja competitiva real. |
| 8 | **Dashboard accionable** (R4) | Auditoria | Transforma el dashboard de "coleccion de graficos" a "centro de operaciones". Cada alerta que enlaza a una accion convierte el dashboard en parte del flujo, no en un apendice. Esto cierra la brecha entre "el dashboard muestra datos" y "el dashboard es util". |
| 9 | **Branding unificado en documentos generados** (H5) | Propuesta nueva | Los PDF, hojas de firmas, certificados y XMLs son las piezas de la app que personas externas ven. Si cada uno tiene un nivel de pulido diferente, la percepcion externa es de fragmentacion. Una cabecera comun (nombre de producto, paleta indigo, tipografia Inter) en todos los documentos generados extiende la identidad fuera de la app. |
| 10 | **Cmd+K como punto de acceso unificado** (Frontend 7.1) | Frontend | La paleta de comandos no es solo una mejora de productividad. Es la respuesta a "esta app tiene demasiadas funciones en demasiados sitios". Cmd+K unifica la experiencia: no importa en que pestana estes, puedes llegar a cualquier funcionalidad. Esto transforma el problema de "5 pestanas desconectadas" en "una app con un cerebro central". |

**Observacion sobre la priorizacion:** Las propuestas excluidas del top 10 (sound design, confetti, animaciones de seleccion, hover mejorados) no son malas propuestas. Son propuestas de *pulido* que deberian implementarse DESPUES de que la coherencia basica este resuelta. Implementar confetti en la cola completada mientras el calendario no tiene guia es decorar el salon mientras el tejado tiene goteras.

---

## 5. Conclusion

Los cinco documentos analizados contienen diagnosticos precisos y propuestas bien fundamentadas. El problema no es la calidad individual de cada propuesta sino la ausencia de un arbitro estrategico que las ordene. Sin ese arbitraje:

1. **Las mejoras visuales del frontend** convertiran la pestana Convocatoria en un producto de nivel Stripe mientras las otras 4 pestanas siguen pareciendo un MVP.
2. **Las propuestas de empatia** anadiran funcionalidades valiosas para Laura pero expandiran el alcance de la app sin actualizar su identidad.
3. **Las recomendaciones de la auditoria** quedaran como "cosas que hacer despues" cuando son prerequisitos de todo lo demas.

La ruta propuesta en este informe es:
1. **Decidir la identidad** (narrativa, nombre, glosario) antes de implementar nada.
2. **Crear la infraestructura de coherencia** (R6 parcial, terminologia unificada, empty states consistentes).
3. **Hacer excelente el flujo principal** con las propuestas frontend y de empatia.
4. **Igualar el nivel de calidad** en el resto de pestanas.
5. **Entonces** anadir sofisticacion (sound design, Cmd+K, funcionalidades via PA).

La coherencia no se consigue sumando mejoras. Se consigue restando las que no encajan y alineando las que si.
