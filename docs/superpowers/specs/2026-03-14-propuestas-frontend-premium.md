# Propuestas Frontend Premium — Convocatoria de Formaciones

**Fecha:** 14 de marzo de 2026
**Tipo:** Analisis y propuestas de mejora visual/interactiva
**Base:** Investigacion `2026-03-14-percepcion-alto-valor-research.md`
**Archivo objetivo:** `convocatoria.html` (~15.500 lineas, single-file HTML app)

---

## 0. Diagnostico del estado actual

### Lo que ya se hace bien (no tocar)

| Aspecto | Implementacion | Veredicto |
|---------|---------------|-----------|
| Design system con variables CSS | `:root` con 30+ variables, sin hardcoding | Excelente |
| Paleta restringida Indigo-600 + Slate | 1 color de marca + neutrales | Excelente |
| Tipografia unica (Inter) | `font-feature-settings`, tabular-nums, pesos 400-700 | Excelente |
| Sombras limitadas a 2 niveles | `--shadow-sm`, `--shadow-lg` | Correcto |
| Transicion estandar | `cubic-bezier(0.4, 0, 0.2, 1)` consistente | Correcto |
| Autoguardado con debounce | `saveState()` 500ms | Profesional |
| Sanitizacion XSS | `esc(s)` para todo contenido Excel | Critico y bien hecho |
| Focus visible accesible | `:focus-visible` con ring indigo | Correcto |
| Skeleton screens en dashboard | `.dash-skeleton` con shimmer animation | Muy bueno |
| Animaciones staggered en KPIs | `animation-delay` escalonado en `.dash-kpi` | Premium |

### Deficiencias detectadas

Los siguientes problemas son los que impiden que la aplicacion se perciba como "de primer nivel" a pesar de tener una base solida:

1. **Toasts genericos sin contexto** — `showToast()` es un texto plano sin icono, sin accion, sin diferenciacion visual significativa entre tipos
2. **Empty states minimos** — `.empty-state` usa un icono SVG generico identico para todas las situaciones; sin mensaje accionable
3. **Sin atajos de teclado** — Solo Escape para cerrar dialogos; no hay Cmd+K, ni atajos para operaciones frecuentes
4. **Momentos pico sin celebracion** — Confirmar convocatoria, completar cola, enviar emails: transiciones funcionales pero sin impacto emocional
5. **Sin indicador de progreso en la cola** — Al lanzar la cola, el feedback es un toast al final; no hay barra de progreso visual
6. **PDF de convocatoria inexistente** — No hay funcion de exportar la convocatoria como PDF; solo existen hojas de firmas y certificados via `window.print()`
7. **Sin sound design** — Cero feedback auditivo
8. **Dialogo de confirmacion plano** — El dialogo de confirmacion antes de enviar (`.dialog-box`) es funcional pero visualmente indistinguible de cualquier otro dialogo

---

## 1. Pulido visual

### 1.1 Toasts con icono, accion y progreso

**Que cambiar:** Funcion `showToast()` (linea ~6666) y estilos `.toast` (linea ~1457)

**Estado actual:**
```javascript
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  // ... setTimeout para eliminar
}
```

**Propuesta:**
- Anadir icono SVG inline por tipo (checkmark para success, exclamacion para warning, X para error, info para info)
- Anadir barra de progreso inferior que se agota durante `duration` — da al usuario la sensacion de control temporal (sabe cuanto queda)
- Permitir un parametro `action` opcional: `showToast('Convocatoria eliminada', 'info', 5000, { label: 'Deshacer', fn: undoDelete })` — esto transforma toasts en la red de seguridad de undo que menciona la investigacion (seccion 4.3)
- El icono debe usar una transicion `scale` al aparecer (de 0.5 a 1) para llamar la atencion

**CSS nuevo para `.toast`:**
- Layout: `display: flex; align-items: center; gap: 10px`
- Icono: `width: 18px; height: 18px; flex-shrink: 0`
- Barra de progreso: `position: absolute; bottom: 0; left: 0; height: 3px; background: rgba(255,255,255,0.4); animation: toastProgress linear forwards;` donde la duracion se inyecta como `animation-duration`
- Boton de accion: `font-weight: 600; text-decoration: underline; margin-left: auto; cursor: pointer; color: inherit;`

**Por que importa:** La investigacion (seccion 4.2) documenta que las micro-interacciones de confirmacion reducen la confusion y mejoran la fluidez. Un toast con icono + progreso + accion pasa de ser un mensaje pasivo a ser un componente interactivo premium. El patron undo-via-toast es el estandar de Gmail, Linear y Figma.

**Esfuerzo:** Bajo
**Impacto:** Alto — cada operacion de la app muestra toasts; mejorarlos tiene efecto multiplicador

---

### 1.2 Refinar la jerarquia del attendee-count

**Que cambiar:** `.attendee-count` (linea ~793) y el bloque `#summaryBar` (linea ~3096)

**Estado actual:** El numero de asistentes seleccionados es un `font-size: 32px; font-weight: 400` en indigo. Es grande pero "plano" — no tiene contexto visual.

**Propuesta:**
- Reducir a `font-size: 28px; font-weight: 700; letter-spacing: -0.02em` — mas compacto y con mas presencia tipografica
- Anadir un subtitulo debajo: "asistentes seleccionados" en `font-size: 11px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em` — estilo KPI del dashboard
- Cuando el numero cambia (al marcar/desmarcar asistentes), aplicar una animacion CSS breve: `transition: transform 0.15s; transform: scale(1.05)` que vuelve a 1. Esto da feedback visual inmediato de que la seleccion cambio
- Agrupar numero + subtitulo en un bloque que se alinea con el estilo `.dash-kpi` — consistencia interna

**Por que importa:** La investigacion (seccion 3.1) establece que la jerarquia tipografica con 4-6 niveles distintos es lo que separa el diseno amateur del profesional. El attendee-count actual es un numero flotante sin contexto; darle estructura de KPI lo integra en la experiencia premium del dashboard.

**Esfuerzo:** Bajo
**Impacto:** Medio — es una de las primeras cosas que el usuario ve al cargar datos

---

### 1.3 Bordes laterales con color semantico en las secciones del panel izquierdo

**Que cambiar:** `.section-label::before` (linea ~222)

**Estado actual:** Todas las secciones tienen un indicador de `3px × 14px` en `--accent`. Es coherente pero no comunica estado.

**Propuesta:**
- Mantener la barra, pero hacerla sensible al estado:
  - Seccion "1. Carga de datos": barra en `--success` cuando hay datos cargados, `--accent` cuando esta vacia
  - Seccion "2. Selecciona asistentes": barra en `--success` cuando hay filtros activos, `--accent` por defecto
  - Seccion "3. Datos del evento": barra en `--success` cuando titulo + fecha + hora estan rellenos, `--warning` si faltan campos obligatorios
- Esto convierte el panel izquierdo en un checklist visual que comunica progreso sin texto adicional
- Implementacion: anadir `.section-label.complete::before { background: var(--success); }` y `.section-label.incomplete::before { background: var(--warning); }`, con logica JS en `updateWorkflowStepper()` o similar

**Por que importa:** La investigacion (seccion 2.5) habla de "surfacing lo que necesitas saber". El usuario no deberia tener que leer cada seccion para saber si le falta algo — el color del borde lateral se lo dice de un vistazo.

**Esfuerzo:** Bajo
**Impacto:** Medio — refuerza la sensacion de flujo guiado

---

### 1.4 Sombra `--shadow-accent` en botones: refinar la intensidad

**Que cambiar:** Variables `--shadow-accent` y `--shadow-accent-hover` (lineas ~38-39 de `:root`)

**Estado actual:**
```css
--shadow-accent: 0 1px 3px rgba(79,70,229,0.3);
--shadow-accent-hover: 0 4px 12px rgba(79,70,229,0.25);
```

**Propuesta:**
- Reducir la opacidad de `--shadow-accent` a `rgba(79,70,229,0.2)` — la sombra actual es ligeramente agresiva en fondos claros
- Mantener `--shadow-accent-hover` como esta — el hover debe amplificar
- Anadir transicion de sombra al `.btn-primary` con `transition: all var(--transition)` — ya existe pero verificar que `box-shadow` esta incluido en `all`

**Por que importa:** La investigacion (seccion 3.3) enfatiza que las sombras deben comunicar elevacion, no llamar la atencion. Una sombra de boton ligeramente mas sutil en reposo hace que el hover se sienta mas dramatico, mejorando la sensacion de responsividad.

**Esfuerzo:** Bajo (cambiar 1 valor CSS)
**Impacto:** Bajo-medio — contribuye al efecto acumulativo de pulido

---

## 2. Micro-interacciones

### 2.1 Animacion de seleccion/deseleccion en tabla de asistentes

**Que cambiar:** `.attendee-table tr:hover td` (linea ~846) y logica de `renderTable()` / `toggleRow()`

**Estado actual:** Al hacer click en un checkbox, la fila no tiene feedback visual mas alla del cambio de estado del checkbox nativo. Las filas excluidas tienen `opacity: 0.4; text-decoration: line-through` (`.attendee-row.excluded`, linea ~2905), que es correcto pero aparece instantaneamente.

**Propuesta:**
- Al excluir una fila: transicion de 200ms a `opacity: 0.4` con `text-decoration: line-through` aplicandose despues de la transicion de opacidad (via `transition-delay`)
- Al reincluir una fila: la opacidad vuelve a 1 con un breve flash de `background: var(--success-light)` que se desvanece en 400ms
- Esto crea un feedback de "esta fila ha cambiado" que el ojo humano captura subconscientemente

**CSS propuesto:**
```css
.attendee-row.excluded td {
  opacity: 0.4;
  text-decoration: line-through;
  transition: opacity 0.2s var(--transition), text-decoration-color 0.2s;
}
@keyframes rowReinclude {
  0% { background: var(--success-light); }
  100% { background: transparent; }
}
.attendee-row.reincluded td {
  animation: rowReinclude 0.4s ease-out;
}
```

**Por que importa:** La investigacion (seccion 4.2) documenta que las transiciones de estado suaves ayudan al usuario a seguir la relacion causa-efecto. Sin transicion, excluir una fila se siente como un glitch; con transicion, se siente como una decision deliberada.

**Esfuerzo:** Bajo
**Impacto:** Medio — la tabla es donde el usuario pasa la mayor parte del tiempo

---

### 2.2 Hover mejorado en filter-select-btn

**Que cambiar:** `.filter-select-btn` y `.filter-select-btn:hover` (lineas ~1021-1041)

**Estado actual:** El hover solo cambia `border-color` y `background`. Funcional pero plano.

**Propuesta:**
- Anadir una transicion de `transform: translateY(-1px)` al hover, consistente con `.btn-primary:hover`
- Cuando un filtro tiene valores seleccionados (`.filter-select-btn.active`), mostrar el numero de valores seleccionados como un badge inline al final del texto, estilo `.filter-badge` (ya existe en linea ~2669)
- Al abrir el dropdown, la flecha (si tiene) deberia rotar 180 grados con `transition: transform var(--transition)`

**Por que importa:** Consistencia interna (seccion 9.1 de la investigacion). Si los botones primarios se elevan al hacer hover, los selectores de filtros deberian seguir el mismo patron. La inconsistencia entre componentes interactivos es uno de los anti-patrones mas visibles.

**Esfuerzo:** Bajo
**Impacto:** Medio — los filtros se usan constantemente

---

### 2.3 Transicion en el upload-zone al cargar archivo

**Que cambiar:** `.upload-zone` y la logica de carga en la seccion de drag-and-drop

**Estado actual:** Al cargar un archivo exitosamente, `.upload-zone.loaded` cambia el borde a `--success` y el fondo a `--success-light`. El cambio es instantaneo via toggle de clase.

**Propuesta:**
- Anadir una animacion de "pulso de exito" al momento de la carga exitosa:
  ```css
  @keyframes uploadSuccess {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22,163,74,0.3); }
    50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(22,163,74,0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22,163,74,0); }
  }
  .upload-zone.loaded { animation: uploadSuccess 0.5s ease-out; }
  ```
- El icono de check (SVG de tick) deberia tener un `stroke-dasharray` + `stroke-dashoffset` animation que lo "dibuja" al aparecer — efecto clasico de confirmacion premium

**Por que importa:** La carga del Excel es el primer momento significativo de la experiencia del usuario (seccion 2.4, regla pico-final). Un pulso de exito transforma un evento funcional en un momento memorable. Apple, Stripe y Airbnb usan este patron en sus flujos de "archivo subido".

**Esfuerzo:** Bajo
**Impacto:** Alto — primer momento de interaccion significativa

---

## 3. Momentos pico (Peak-End Rule)

### 3.1 Dialogo de confirmacion de convocatoria: rediseno

**Que cambiar:** `#confirmDialog` (dialog-box) y la logica en `btnOpenOutlook` click handler (linea ~8653)

**Estado actual:** El dialogo de confirmacion usa `.dialog-box` estandar: titulo h3, parrafo con resumen, dos botones. Es funcional pero indistinguible de cualquier otro dialogo de la app (ajustes, duplicado, series).

**Propuesta — hacer de este dialogo "el momento":**

1. **Resumen visual estructurado** en lugar de texto corrido:
   - Titulo del evento en negrita, fecha formateada bonita (no solo `toLocaleDateString`), icono de tipo (Teams vs Presencial)
   - Conteo de asistentes con chip circular estilo `.dash-kpi-value`
   - Si hay conflictos o avisos FUNDAE, mostrarlos como cards con icono warning, no como HTML inline concatenado

2. **Animacion de entrada diferenciada:**
   - El dialogo de confirmacion deberia entrar con un `scale` ligeramente mayor (de 0.9 a 1 en vez del actual 0.95 a 1) y un `backdrop-filter: blur(8px)` en vez del actual `blur(4px)` — separar visualmente este dialogo del resto
   - Considerar un borde superior de 3px en `--accent` para distinguirlo

3. **Boton "Enviar" con estado de carga:**
   - Al pulsar "Proceder" / "Enviar", el boton deberia mostrar un mini-spinner o una animacion de check durante 300ms antes de cerrar el dialogo
   - Esto da la sensacion de "la accion se esta procesando" aunque sea instantanea

4. **Post-confirmacion: toast de exito con resumen:**
   - En vez del toast actual `'Emails copiados al portapapeles'`, mostrar un toast mas completo: "Convocatoria enviada: [titulo] para [N] asistentes" con icono de check animado

**Por que importa:** La regla pico-final (seccion 2.4) es explicita: las personas juzgan una experiencia por el punto de mayor intensidad emocional y el momento final. Confirmar la convocatoria ES el pico de la experiencia. Invertir desproporcionadamente en este dialogo tiene el mayor ROI de percepcion de cualquier cambio.

**Esfuerzo:** Medio
**Impacto:** Muy alto — define la memoria de la experiencia

---

### 3.2 Completacion de la cola: celebracion

**Que cambiar:** Funcion `launchNext()` en el handler de `btnLaunchQueue` (linea ~8828), especificamente el caso de `index >= state.queue.length`

**Estado actual:**
```javascript
showToast('!Cola completa! ' + total + ' convocatorias enviadas', 'success', 6000);
```

**Propuesta:**
- Reemplazar el toast simple con un dialogo de exito dedicado:
  - Icono grande de check circular animado (dibujo SVG con `stroke-dasharray`)
  - Titulo: "Cola completada"
  - Subtitulo: "[N] convocatorias enviadas exitosamente"
  - Si hubo encuestas programadas: "Encuestas de satisfaccion programadas para [N] eventos"
  - Boton unico: "Cerrar" (o auto-cierre tras 4 segundos con barra de progreso)
- Opcionalmente, confetti sutil de CSS (particulas indigo que caen) — Linear hace esto al cerrar un milestone; es un patron premium reconocido

**CSS del confetti (opcional, CSS-only):**
```css
@keyframes confettiFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
/* Generar 8-12 particulas con ::before/::after + spans posicionados absolute */
```

**Por que importa:** Completar la cola es el "final" de un flujo largo. La regla pico-final dice que este momento tendra peso desproporcionado en la memoria del usuario. Un toast de 6 segundos es olvidable; un dialogo con animacion de check es memorable.

**Esfuerzo:** Medio
**Impacto:** Alto — define el "final" del flujo mas complejo de la app

---

### 3.3 Progreso visual durante el procesamiento de la cola

**Que cambiar:** La barra `#queueBar` (linea ~3112) y la logica de `launchNext()`

**Estado actual:** Durante el procesamiento de la cola, el usuario solo ve los dialogos secuenciales "Convocatoria X de Y abierta". No hay indicador global de progreso.

**Propuesta:**
- Anadir una barra de progreso encima de `#queueBar` (o dentro) que se llena proporcionalmente: `width: (index/total * 100)%`
- Mostrar el paso actual como texto: "Procesando 3 de 5..."
- Cada item procesado deberia cambiar de apariencia en `#queueList`: anadir un check verde y reducir opacidad, estilo `.attendee-row.excluded` pero en positivo
- Usar `transition: width 0.3s ease-out` en la barra para un llenado suave

**CSS propuesto:**
```css
.queue-progress {
  height: 3px;
  background: var(--bg-input);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.queue-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-lg);
  transition: width 0.3s ease-out;
}
```

**Por que importa:** La investigacion (seccion 6.4) documenta que las barras de progreso son el patron correcto para "operaciones largas con progreso medible". La cola es exactamente esto. Sin barra de progreso, cada paso se siente aislado; con ella, el usuario siente control y previsibilidad.

**Esfuerzo:** Medio
**Impacto:** Alto — transforma el procesamiento de cola de una secuencia de dialogos a un flujo coherente

---

## 4. Empty states

### 4.1 Empty state principal (tabla de asistentes)

**Que cambiar:** `#emptyState` (linea ~3131) y la clase `.empty-state` (linea ~1265)

**Estado actual:** `.empty-state` muestra un circulo con icono de documento SVG generico y texto muted. Es identico para "no hay datos cargados" y "no hay resultados de filtro" — dos situaciones completamente diferentes que requieren acciones diferentes.

**Propuesta — 3 variantes:**

**A. Sin datos cargados (estado inicial):**
- Icono: flecha de upload en circulo indigo-light
- Titulo: "Carga tu censo de empleados"
- Subtitulo: "Arrastra un archivo Excel o pulsa el boton de carga en el panel izquierdo"
- CTA: boton secundario "Cargar Excel" que dispara el click en `#uploadZone`
- Estilo: `.empty-state-upload` con tono alentador

**B. Datos cargados pero sin resultados de filtro:**
- Icono: lupa con X en circulo amber-light
- Titulo: "Sin resultados"
- Subtitulo: "Los filtros aplicados no coinciden con ningun empleado"
- CTA: link "Limpiar filtros" que dispara `clearAllFilters()`
- Estilo: `.empty-state-no-results`

**C. Datos cargados, sin filtros, todos excluidos:**
- Icono: checkbox vacio en circulo
- Titulo: "Todos los asistentes excluidos"
- Subtitulo: "Has deseleccionado a todos los empleados. Selecciona al menos uno para continuar."
- CTA: link "Seleccionar todos" que marca `#selectAll`

**CSS comun:**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
  animation: fadeUp 0.3s ease-out;
}
.empty-state-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.empty-state-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.empty-state-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.5;
  margin-bottom: 16px;
}
```

**Por que importa:** La investigacion (seccion 3.5) es contundente: "Un empty state bien disenado es informativo, accionable y alentador." Los empty states son un test de calidad — un icono generico identico para tres situaciones diferentes es exactamente el anti-patron que la investigacion documenta. Los usuarios perciben los empty states como el nivel de cuidado que la app tiene en los "casos borde", y eso define su confianza.

**Esfuerzo:** Medio
**Impacto:** Alto — el empty state es la primera impresion cuando no hay datos

---

### 4.2 Empty state de la cola

**Que cambiar:** `renderQueuePanel()` (linea ~8311) — el caso `queue.length === 0`

**Estado actual:** Cuando la cola esta vacia, `renderQueuePanel` muestra un div simple con texto muted.

**Propuesta:**
- Icono: bandeja vacia o lista con check
- Titulo: "Cola vacia"
- Subtitulo: "Configura una convocatoria y pulsa 'Anadir a cola' para programar envios en lote"
- Si hay historial reciente: mostrar un link "Ver historial" que abra el dialogo de historial

**Por que importa:** La cola es una funcionalidad avanzada. Su empty state es la oportunidad de ensenarl al usuario como funciona sin necesidad de documentacion externa (seccion 7.6 de la investigacion, onboarding contextual).

**Esfuerzo:** Bajo
**Impacto:** Medio

---

### 4.3 Empty state del historial

**Que cambiar:** `#historyEmpty` (linea ~3843)

**Estado actual:** `"No hay convocatorias en el historial"` — texto plano sin contexto.

**Propuesta:**
- Icono: reloj con circulo
- Titulo: "Sin historial"
- Subtitulo: "Las convocatorias que envies se registraran aqui automaticamente"
- Estilo coherente con los demas empty states

**Esfuerzo:** Bajo
**Impacto:** Bajo-medio

---

## 5. Manejo de errores

### 5.1 Errores contextuales en formulario de evento

**Que cambiar:** `validateEvent()` (referenciada en linea ~8654) y los campos de evento en la seccion "3. Datos del evento"

**Estado actual:** `validateEvent()` probablemente usa `showToast` para reportar campos faltantes. El usuario recibe un toast generico y tiene que buscar cual campo falta.

**Propuesta:**
- Cuando un campo obligatorio esta vacio al intentar enviar, aplicar `.input-field.error` (ya existe, linea ~1140) directamente al campo
- Anadir un label de error debajo del campo: `<span class="field-error">Este campo es obligatorio</span>` con `font-size: 11px; color: var(--danger); margin-top: 2px;`
- Hacer scroll al primer campo con error dentro del panel izquierdo
- Mantener el toast como resumen ("Completa los campos obligatorios"), pero la guia detallada esta en el formulario

**CSS nuevo:**
```css
.field-error {
  display: block;
  font-size: 11px;
  color: var(--danger);
  margin-top: 3px;
  animation: fadeUp 0.2s ease-out;
}
```

**Por que importa:** La investigacion (seccion 9.2) es explicita: "Los errores mostrados fuera del contexto del error son un anti-patron documentado." Un toast que dice "Completa la fecha" mientras el campo de fecha esta fuera de la vista del usuario es exactamente este anti-patron.

**Esfuerzo:** Medio
**Impacto:** Alto — reduce la frustracion en el flujo critico de envio

---

### 5.2 Error de carga de Excel: diagnostico accionable

**Que cambiar:** Logica de parseo del Excel (las funciones que leen el workbook via SheetJS)

**Estado actual:** Si el Excel no tiene las columnas esperadas, probablemente muestra un toast de error generico.

**Propuesta:**
- Clasificar los errores de carga en categorias:
  - **Formato incorrecto**: "El archivo no contiene una hoja con las columnas esperadas. Asegurate de que el Excel tiene columnas: Empleado, Puesto, Ubicacion, Email..."
  - **Archivo vacio**: "El archivo Excel esta vacio o no tiene filas de datos"
  - **Columnas parciales**: "Se encontraron [N] de [M] columnas esperadas. Faltan: [lista]. Los datos se cargaran parcialmente."
- Usar un dialogo (no un toast) para errores criticos de carga — los toasts son efimeros y el usuario puede perder la informacion
- El dialogo de error deberia tener un boton "Ver columnas esperadas" que muestre la lista completa

**Por que importa:** El parseo del Excel es el punto de fallo mas probable de toda la aplicacion. Un mensaje de error que ayuda al usuario a corregir su archivo es la diferencia entre "esta app no funciona" y "mi archivo necesita ajustes" (seccion 3.5, error states).

**Esfuerzo:** Medio
**Impacto:** Alto — impacta directamente en la primera impresion de la app

---

## 6. Percepcion de velocidad

### 6.1 Skeleton screen para la tabla de asistentes

**Que cambiar:** Anadir skeleton entre la carga del Excel y el renderizado de la tabla

**Estado actual:** El dashboard ya tiene `.dash-skeleton` con shimmer. La tabla de asistentes no tiene skeleton — al cargar un Excel grande, el usuario ve el empty state y luego la tabla aparece de golpe.

**Propuesta:**
- Al iniciar la carga del Excel, mostrar un skeleton que replique 8-10 filas de la tabla:
  ```html
  <div class="table-skeleton">
    <div class="skeleton-row"><div class="skeleton-cell skeleton-check"></div><div class="skeleton-cell skeleton-name"></div><div class="skeleton-cell skeleton-role"></div><div class="skeleton-cell skeleton-loc"></div><div class="skeleton-cell skeleton-email"></div></div>
    <!-- repetir 8-10 veces -->
  </div>
  ```
- Reutilizar la animacion `shimmer` existente
- Ocultar el skeleton y mostrar la tabla real al completar el parseo

**CSS:**
```css
.table-skeleton { padding: 0 16px; }
.skeleton-row {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
.skeleton-cell {
  height: 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--bg-input) 25%, var(--border) 50%, var(--bg-input) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skeleton-check { width: 15px; flex-shrink: 0; }
.skeleton-name { flex: 2; }
.skeleton-role { flex: 2; }
.skeleton-loc { flex: 1.5; }
.skeleton-email { flex: 2.5; }
```

**Por que importa:** La investigacion (seccion 6.4) documenta que los skeleton screens reducen la percepcion de espera un 30% frente a spinners. Actualmente, la carga del Excel usa un spinner CSS (`.upload-zone.loading::after`, linea ~926). Complementar con un skeleton en la tabla extiende esta percepcion de velocidad.

**Esfuerzo:** Bajo-medio
**Impacto:** Alto — especialmente con Excels grandes (>1000 filas)

---

### 6.2 Precomputacion del dashboard al cargar datos

**Que cambiar:** Logica de inicializacion tras carga de Excel y el renderizado del dashboard

**Estado actual:** El dashboard se calcula cuando el usuario navega a la pestana "Cuadro de Mando". Si los datos son pesados, hay un delay visible.

**Propuesta:**
- Al completar la carga del Excel, calcular las metricas del dashboard en un `requestIdleCallback()` (o `setTimeout(fn, 0)` como fallback):
  ```javascript
  // Despues de parsear el Excel exitosamente:
  requestIdleCallback(() => {
    precomputeDashboardMetrics();
  });
  ```
- Almacenar los resultados precomputados en una variable de estado
- Cuando el usuario navega al dashboard, verificar si los datos precomputados coinciden con el estado actual; si si, renderizar instantaneamente con los datos en cache

**Por que importa:** La investigacion (seccion 6.5, prefetching) documenta que la carga predictiva puede mejorar la percepcion de latencia drasticamente. Convocatoria.html tiene una ventaja natural: todo es local, no hay red. Precomputar es "gratis" en terminos de recursos.

**Esfuerzo:** Medio
**Impacto:** Medio-alto — el dashboard carga instantaneamente en vez de con delay

---

## 7. Paleta de comandos (Cmd+K)

### 7.1 Diseno e implementacion

**Que cambiar:** Anadir un nuevo componente overlay y un listener global de teclado

**Estado actual:** No existe ninguna paleta de comandos. El unico atajo de teclado global es Escape para cerrar dialogos (linea ~15504).

**Propuesta — Estructura completa:**

**Trigger:** `Cmd+K` (macOS) / `Ctrl+K` (otros)

**UI:**
- Overlay con `backdrop-filter: blur(8px)` centrado en pantalla
- Input de busqueda grande: `font-size: 16px; padding: 16px 20px; border: none; border-bottom: 1px solid var(--border);`
- Lista de resultados debajo del input, max-height 400px con scroll
- Cada resultado: icono + nombre de la accion + atajo de teclado (si tiene) + descripcion breve
- Navegacion con flechas arriba/abajo, Enter para ejecutar, Escape para cerrar

**Categorias de comandos:**

| Categoria | Comandos |
|-----------|----------|
| **Navegacion** | Ir a Convocatoria, Ir a Dashboard, Ir a Catalogos, Ir a Calendario, Ir a XML |
| **Datos** | Cargar Excel, Limpiar datos, Exportar seleccion |
| **Filtros** | Limpiar todos los filtros, Buscar empleado... |
| **Convocatoria** | Abrir en Outlook, Anadir a cola, Lanzar cola |
| **Herramientas** | Abrir ajustes, Ver historial, Cert. Asistencia, Cert. Aprovechamiento |
| **Catalogos** | Nuevo proveedor, Nuevo centro, Nuevo tutor, Nueva accion |

**Busqueda fuzzy simple:**
```javascript
function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}
```

**CSS:**
```css
.cmdk-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  padding-top: 20vh;
  animation: overlayIn 0.15s ease-out;
}
.cmdk-box {
  width: 560px;
  max-height: 500px;
  background: var(--bg-panel);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--border);
  overflow: hidden;
  animation: dialogIn 0.2s ease-out;
}
.cmdk-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  font-family: var(--font-body);
  border: none;
  border-bottom: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
  outline: none;
}
.cmdk-results {
  max-height: 400px;
  overflow-y: auto;
}
.cmdk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background var(--transition);
}
.cmdk-item:hover, .cmdk-item.active {
  background: var(--accent-subtle);
}
.cmdk-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}
.cmdk-item-shortcut {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-input);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-family: var(--font-body);
}
.cmdk-category {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  padding: 12px 20px 4px;
}
```

**Por que importa:** La investigacion (seccion 4.4) enumera la paleta de comandos como "patron estandar de aplicaciones premium" citando Figma, Linear, VS Code, Notion y Vercel. Es la senal de sofisticacion mas inmediatamente reconocible para usuarios avanzados. Su mera existencia eleva la percepcion de la app un escalon completo.

**Esfuerzo:** Alto
**Impacto:** Muy alto — senal definitiva de "aplicacion premium"

---

## 8. Atajos de teclado

### 8.1 Atajos propuestos

**Que cambiar:** Anadir un listener `document.addEventListener('keydown', ...)` global con logica de atajos

**Estado actual:** Solo Escape cierra dialogos.

**Atajos propuestos (compatibles con macOS):**

| Atajo | Accion | Contexto |
|-------|--------|----------|
| `Cmd+K` | Abrir paleta de comandos | Global |
| `Cmd+Enter` | Abrir en Outlook (enviar) | Tab Convocatoria, con datos cargados |
| `Cmd+Shift+Enter` | Anadir a cola | Tab Convocatoria, con datos cargados |
| `Cmd+F` | Focus en busqueda de tabla | Tab Convocatoria, con tabla visible |
| `Cmd+A` | Seleccionar/deseleccionar todos | Tab Convocatoria, con tabla visible |
| `Cmd+1..5` | Navegar a pestana 1-5 | Global |
| `Cmd+Shift+H` | Abrir historial | Global |
| `Cmd+,` | Abrir ajustes | Global |
| `Escape` | Cerrar dialogo / paleta / panel cola | Global (ya existe parcialmente) |

**Implementacion:**
```javascript
document.addEventListener('keydown', function(e) {
  const isMod = e.metaKey || e.ctrlKey;

  // Cmd+K: Command palette
  if (isMod && e.key === 'k') {
    e.preventDefault();
    toggleCommandPalette();
    return;
  }

  // Cmd+Enter: Send
  if (isMod && e.key === 'Enter' && !e.shiftKey) {
    const btn = document.getElementById('btnOpenOutlook');
    if (btn && !btn.disabled && activeTab === 'tabConvocatoria') {
      e.preventDefault();
      btn.click();
    }
    return;
  }

  // Cmd+1..5: Tab navigation
  if (isMod && e.key >= '1' && e.key <= '5') {
    e.preventDefault();
    const tabs = document.querySelectorAll('.tab-btn');
    const idx = parseInt(e.key) - 1;
    if (tabs[idx]) tabs[idx].click();
    return;
  }

  // ... etc
});
```

**Revelacion progresiva de atajos:**
- En cada boton con atajo, anadir un tooltip que muestre el atajo al hacer hover con delay de 800ms
- En la paleta de comandos, cada accion muestra su atajo a la derecha
- No mostrar atajos hasta que el usuario ha interactuado con la app al menos 3 veces (detectar via contador en sessionStorage)

**Por que importa:** La investigacion (seccion 4.4) documenta que "los atajos de teclado son una senal de calidad que comunica que la aplicacion fue disenada pensando en usuarios que la usan intensivamente". Los tooltips con atajos son el patron de revelacion progresiva (seccion 4.5) que educay al usuario sin abrumarlo.

**Esfuerzo:** Medio
**Impacto:** Alto — transforma la app de "herramienta visual" a "herramienta de productividad"

---

## 9. Sound design

### 9.1 Propuesta de audio feedback

**Que cambiar:** Anadir un modulo de sonido minimalista

**Estado actual:** Cero audio en toda la app.

**Propuesta — 4 sonidos maximos, todos con toggle en ajustes:**

| Evento | Sonido | Duracion | Descripcion |
|--------|--------|----------|-------------|
| Envio exitoso (Outlook) | Tono ascendente suave | 300ms | Nota: C5-E5 sine wave con fade-out |
| Cola completada | Acorde mayor breve | 500ms | C4-E4-G4 con reverb sutil |
| Error critico | Tono descendente | 200ms | Dos notas descendentes, suaves |
| Carga de Excel exitosa | Click suave | 100ms | Tick mecanico, frecuencia alta |

**Implementacion con Web Audio API (sin archivos externos):**
```javascript
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
  if (!state.settings?.soundEnabled) return;
  if (!audioCtx) audioCtx = new AudioCtx();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch(type) {
    case 'success':
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.linearRampToValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'complete':
      // Acorde C-E-G
      [261.63, 329.63, 392.00].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.05, now + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        o.start(now + i * 0.05);
        o.stop(now + 0.5);
      });
      break;
    // ... error, tick
  }
}
```

**Setting en ajustes:**
- Anadir checkbox en el dialogo de ajustes: "Sonidos de feedback" con toggle on/off
- Defaultear a `false` (opt-in, no opt-out) — respetar que la mayoria de usuarios corporativos trabajan en oficina
- Guardar en `convocatoria_settings` localStorage

**Por que importa:** La investigacion (seccion 4.7) documenta que "el feedback auditivo llega al cerebro 10x mas rapido que el visual" y que "los productos con diseno sonico de alta calidad se perciben como mas fiables y premium". La clave es que sea opt-in y que los sonidos sean sutiles (< 200ms, volumen bajo). Un tono de exito de 300ms al enviar una convocatoria transforma un click en un momento.

**Esfuerzo:** Medio
**Impacto:** Medio — alto impacto perceptual pero solo para usuarios que lo activen

---

## 10. Calidad del PDF exportado

### 10.1 PDF de convocatoria

**Que cambiar:** Actualmente no existe funcion de exportar la convocatoria como PDF. Anadir una.

**Estado actual:** Solo existen `printSignSheet()` y `generateCertificates()` como formatos impresos, ambos usando `window.open()` con HTML inline.

**Propuesta — Nuevo boton "Exportar convocatoria" en el menu "Mas acciones":**

**Contenido del PDF:**
1. **Cabecera:** Titulo del evento en negrita, tipo (Presencial/Teams), fecha formateada, horario
2. **Detalle:** Ubicacion/sala, formador/a, instrucciones adicionales
3. **Tabla de asistentes:** Nombre, Puesto, Ubicacion, Email — con filas alternas coloreadas
4. **Pie:** Fecha de generacion, conteo de asistentes, indicador de si hay encuesta programada

**Diseno del PDF:**
```css
/* Estilos para la ventana de impresion */
@page { size: A4; margin: 20mm; }
body { font-family: 'Inter', sans-serif; color: #0f172a; }
.pdf-header {
  border-bottom: 3px solid #4F46E5;
  padding-bottom: 20px;
  margin-bottom: 24px;
}
.pdf-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}
.pdf-meta {
  font-size: 12px;
  color: #475569;
  display: flex;
  gap: 20px;
}
.pdf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-top: 20px;
}
.pdf-table th {
  background: #f1f5f9;
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pdf-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
}
.pdf-table tr:nth-child(even) {
  background: #f8fafc;
}
.pdf-footer {
  margin-top: 40px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  font-size: 10px;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}
```

**Por que importa:** La investigacion (seccion 7.3) es directa: "La calidad de los PDF exportados (maquetacion, tipografia, logo) comunica directamente la calidad del producto." Un PDF con la misma paleta Indigo-600, la misma tipografia Inter, y un layout profesional es una extension de la identidad de la app que el usuario puede compartir externamente.

**Esfuerzo:** Medio
**Impacto:** Alto — el PDF es la unica pieza de la app que se comparte con personas que no la usan

---

### 10.2 Mejora de la hoja de firmas existente

**Que cambiar:** `printSignSheet()` (linea ~5747)

**Estado actual:** La hoja de firmas se genera con HTML inline basico via `window.open()`.

**Propuesta:**
- Aplicar la misma paleta Indigo del PDF de convocatoria
- Anadir cabecera con titulo del evento, fecha y horario
- Tabla con columnas: #, Nombre, DNI/NIF (si disponible), Firma (celda vacia ancha)
- Pie con fecha de generacion y conteo
- Mantener el mismo `@page` y `@media print` que el PDF de convocatoria para coherencia

**Esfuerzo:** Bajo (ya existe la funcion, solo pulir estilos)
**Impacto:** Medio

---

## Resumen ejecutivo — Priorizacion

### Fase 1: Quick wins (1-2 dias)

| # | Propuesta | Esfuerzo | Impacto |
|---|-----------|----------|---------|
| 1.1 | Toasts con icono + progreso + accion undo | Bajo | Alto |
| 1.3 | Bordes laterales con color semantico | Bajo | Medio |
| 1.4 | Refinar shadow-accent | Bajo | Bajo |
| 2.3 | Animacion de exito en upload-zone | Bajo | Alto |
| 4.2 | Empty state de la cola | Bajo | Medio |
| 4.3 | Empty state del historial | Bajo | Bajo |

### Fase 2: Mejoras de alto impacto (3-5 dias)

| # | Propuesta | Esfuerzo | Impacto |
|---|-----------|----------|---------|
| 3.1 | Dialogo de confirmacion rediseñado | Medio | Muy alto |
| 3.2 | Celebracion de cola completada | Medio | Alto |
| 3.3 | Barra de progreso en procesamiento de cola | Medio | Alto |
| 4.1 | Empty states contextuales (tabla) | Medio | Alto |
| 5.1 | Errores contextuales en formulario | Medio | Alto |
| 6.1 | Skeleton screen para tabla de asistentes | Bajo-medio | Alto |

### Fase 3: Diferenciadores premium (5-8 dias)

| # | Propuesta | Esfuerzo | Impacto |
|---|-----------|----------|---------|
| 7.1 | Paleta de comandos Cmd+K | Alto | Muy alto |
| 8.1 | Atajos de teclado globales | Medio | Alto |
| 10.1 | PDF de convocatoria | Medio | Alto |
| 9.1 | Sound design (opt-in) | Medio | Medio |
| 6.2 | Precomputacion del dashboard | Medio | Medio-alto |
| 5.2 | Diagnostico de errores de Excel | Medio | Alto |

### Fase 4: Pulido fino (continuo)

| # | Propuesta | Esfuerzo | Impacto |
|---|-----------|----------|---------|
| 1.2 | Refinar jerarquia attendee-count | Bajo | Medio |
| 2.1 | Animacion de seleccion/deseleccion | Bajo | Medio |
| 2.2 | Hover mejorado en filter-select | Bajo | Medio |
| 10.2 | Mejora hoja de firmas | Bajo | Medio |

---

## Principios para la implementacion

Derivados de la investigacion y del CLAUDE.md:

1. **Todo dentro de `convocatoria.html`** — no crear archivos adicionales
2. **Usar variables CSS existentes** — nunca hardcodear colores
3. **Respetar `prefers-reduced-motion`** — todas las animaciones nuevas deben tener fallback en el bloque `@media (prefers-reduced-motion: reduce)` existente (linea ~742)
4. **Consistencia sobre novedad** — cada nuevo componente debe reutilizar patrones existentes (`--radius`, `--transition`, `--shadow-sm/lg`)
5. **El efecto compuesto** — la percepcion premium no viene de una sola mejora sino de la acumulacion de cientos de decisiones correctas (seccion 8.5 de la investigacion, "el foso UX de Stripe")
