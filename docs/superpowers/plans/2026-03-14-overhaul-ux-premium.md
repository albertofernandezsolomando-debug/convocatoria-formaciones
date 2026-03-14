# Overhaul UX Premium — Plan de Implementacion Consolidado

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `convocatoria.html` de una herramienta funcional a una aplicacion percibida como premium, consolidando 59 propuestas de 5 informes de investigacion en 4 fases ejecutables.

**Architecture:** Todas las modificaciones se realizan dentro del fichero unico `convocatoria.html` (~15.517 lineas). Los cambios se organizan en 3 zonas: CSS (lineas 11-1480), HTML (lineas 2900-4200), JS (lineas 6500-15500). Se respeta el design system existente: variables CSS en `:root` (lineas 13-55), paleta Indigo-600 + Slate, fuente Inter unica, 2 sombras (`--shadow-sm`, `--shadow-lg`), 3 radii (`--radius-sm`, `--radius`, `--radius-lg`), transicion estandar `--transition`.

**Tech Stack:** HTML/CSS/JS vanilla, Web Audio API (sonido), SheetJS (Excel), localStorage. Sin dependencias adicionales.

**Nota de seguridad:** En este plan, todo contenido dinamico procedente del Excel del usuario DEBE sanitizarse con `esc()` (linea 6662) antes de insertarlo en el DOM. Para contenido estatico generado por la app (iconos, labels fijos), se usan DOM methods (createElement, textContent, appendChild). Los snippets de este plan siguen esta convencion.

**Origen de las propuestas — Mapa de trazabilidad:**

| Codigo | Informe origen | Referencia |
|--------|---------------|------------|
| FP-X.X | `propuestas-frontend-premium.md` | 20 propuestas |
| EU-PX | `propuestas-empatia-usuaria.md` | 16 propuestas |
| AC-RX | `auditoria-coherencia-propuesta-valor.md` | 11 recomendaciones |
| EA-X.X | `estado-del-arte-ui-ux.md` | 12 areas de investigacion |
| PV-X | `percepcion-alto-valor-research.md` | 10 hallazgos |

**Deduplicacion:** Multiples propuestas se solapan entre informes. Este plan las consolida en tareas unicas con referencia cruzada a todas las fuentes. Ejemplo: "Paleta de comandos" aparece en FP-7.1, AC-R10 y EA-1.2 — se implementa una sola vez en la Tarea 17.

---

## Estructura del fichero — Zonas de modificacion

```
convocatoria.html (15.517 lineas)
+-- <style> (lineas 11-1480)
|   +-- :root variables .................. lineas 13-55
|   +-- .section-label::before ........... linea 222
|   +-- @media prefers-reduced-motion .... lineas 742-770
|   +-- .attendee-count .................. linea 793
|   +-- .filter-select-btn ............... lineas 1021-1041
|   +-- .empty-state ..................... lineas 1265-1288
|   +-- .toast ........................... lineas 1457-1480
|   +-- [NUEVO] Bloques CSS para: toasts mejorados, empty states,
|         cmd-k, skeleton tabla, queue progress, celebracion,
|         field-error, upload-success, PDF print styles
|
+-- <body> HTML (lineas 2900-4200)
|   +-- #summaryBar ...................... linea 3096
|   +-- #queueBar ........................ linea 3112
|   +-- #emptyState ...................... linea 3131
|   +-- #selectAll ....................... linea 3135
|   +-- #confirmDialog ................... linea 3823
|   +-- #historyEmpty .................... linea 3843
|   +-- [NUEVO] Elementos HTML para: cmd-k overlay, data quality
|         panel, skeleton tabla, queue progress bar, celebracion
|         dialog, FUNDAE readiness badge
|
+-- <script> JS (lineas 6500-15517)
|   +-- esc() ............................ linea 6662
|   +-- showToast() ...................... linea 6666
|   +-- state ............................ linea 6682
|   +-- loadSettings() ................... linea 6709
|   +-- printSignSheet() ................. linea 5747
|   +-- updateWorkflowStepper() .......... linea 8041
|   +-- renderQueuePanel() ............... linea 8311
|   +-- checkFundaeReadiness() ........... linea 8546
|   +-- validateEvent() .................. linea 8639
|   +-- btnOpenOutlook handler ........... linea 8653
|   +-- launchNext() ..................... linea 8828
|   +-- ORGANIGRAMA sheet lookup ......... linea 6501
|   +-- Escape keydown handler ........... linea ~15504
|
+-- Design system (CLAUDE.md constraints)
    +-- Colores: SOLO variables CSS, nunca hardcoded
    +-- Fuente: SOLO Inter via var(--font-body)
    +-- Sombras: --shadow-sm y --shadow-lg (+ --shadow-accent para botones)
    +-- Radii: --radius-sm (4px), --radius (8px), --radius-lg (9999px)
    +-- Sanitizacion: esc() para TODO valor del Excel
```

---

## Fase 1: Quick Wins (1-2 dias)

Cambios de bajo esfuerzo y alto impacto perceptual. Cada tarea es independiente.

---

### Task 1: Toasts con icono, barra de progreso y accion undo

**Fuentes:** FP-1.1, EA-4.1, EA-4.2, PV-6, EU-1.1c

**Files:**
- Modify: `convocatoria.html:1457-1480` (CSS `.toast`)
- Modify: `convocatoria.html:6666-6676` (JS `showToast()`)

**Descripcion:** Redisenar `showToast()` para incluir: icono SVG por tipo, barra de progreso que se agota durante `duration`, y parametro `action` opcional para undo. Patron Gmail/Linear/Figma.

- [ ] **Step 1: Anadir CSS para toasts mejorados**

Despues de `.toast-info` (linea ~1471): layout flex con gap 10px, icono 18x18 con animacion pop (scale 0.5 a 1), span para mensaje, boton de accion con underline y auto margin-left, barra de progreso absoluta inferior (height 3px, rgba blanco 0.4) con keyframe `toastProgress` (width 100% a 0%).

- [ ] **Step 2: Reescribir la funcion showToast()**

Reemplazar lineas 6666-6676. Nueva firma: `showToast(message, type, duration, action)`. Construir el toast con DOM methods: createElement para div, crear SVG icon element segun tipo (check/X/triangulo/info-circle), span.textContent = message, boton de accion opcional, div de progreso con style.animationDuration. La firma es retrocompatible.

- [ ] **Step 3: Verificar retrocompatibilidad de todas las llamadas existentes**
- [ ] **Step 4: Anadir `role="alert"` y `aria-live="polite"` al toast container**
- [ ] **Step 5: Regla en `@media (prefers-reduced-motion: reduce)` (linea ~742)**
- [ ] **Step 6: Commit**

```bash
git add convocatoria.html
git commit -m "feat: toasts con icono, barra de progreso y soporte de accion undo"
```

---

### Task 2: Bordes laterales con color semantico en secciones

**Fuentes:** FP-1.3, PV-5, EA-2.2

**Files:**
- Modify: `convocatoria.html:222-229` (CSS `.section-label::before`)
- Modify: `convocatoria.html:8041` (JS `updateWorkflowStepper()`)

- [ ] **Step 1: Clases `.section-complete::before` (--success) y `.section-incomplete::before` (--warning)**
- [ ] **Step 2: Logica en updateWorkflowStepper() para evaluar estado por seccion**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: bordes laterales con color semantico por estado de seccion"
```

---

### Task 3: Animacion de exito en upload-zone

**Fuentes:** FP-2.3, PV-2.4

**Files:**
- Modify: `convocatoria.html` (CSS ~900, JS handler de carga)

- [ ] **Step 1: Keyframes uploadSuccess (scale+ring verde) y checkDraw (stroke-dashoffset)**
- [ ] **Step 2: Clase temporal `load-success` en handler JS**
- [ ] **Step 3: Reducir motion**
- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: animacion de pulso y checkmark al cargar Excel"
```

---

### Task 4: Refinar shadow-accent

**Fuentes:** FP-1.4, PV-3.3

**Files:**
- Modify: `convocatoria.html:38`

- [ ] **Step 1: Cambiar opacidad 0.3 a 0.2 en --shadow-accent**
- [ ] **Step 2: Commit**

```bash
git add convocatoria.html
git commit -m "fix: reducir intensidad de shadow-accent en reposo"
```

---

### Task 5: Empty states contextuales — Cola e Historial

**Fuentes:** FP-4.2, FP-4.3, PV-8, AC-R8

**Files:**
- Modify: `convocatoria.html:3843` (HTML `#historyEmpty`)
- Modify: `convocatoria.html:8311` (JS `renderQueuePanel()`)

- [ ] **Step 1: CSS `.empty-state-icon`, `.empty-state-title`, `.empty-state-subtitle`**
- [ ] **Step 2: Historial: icono reloj, titulo, subtitulo (DOM methods)**
- [ ] **Step 3: Cola vacia: icono bandeja, titulo, subtitulo (DOM methods)**
- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: empty states contextuales para cola e historial"
```

---

### Task 6: Busqueda flexible de hoja en el Excel

**Fuentes:** EU-P11, EU-1.1a

**Files:**
- Modify: `convocatoria.html:6501-6510`

- [ ] **Step 1: Fuzzy match de nombres + fallback a hoja unica**
- [ ] **Step 2: Toast informativo cuando se usa alternativa**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: busqueda flexible de hoja en Excel"
```

---

### Task 7: Alertas FUNDAE proactivas fuera del dashboard

**Fuentes:** EU-P9, EU-1.7b

**Files:**
- Modify: `convocatoria.html` (HTML ~3096, JS init)

- [ ] **Step 1: HTML banner #fundaeAlertBanner**
- [ ] **Step 2: CSS .fundae-alert-banner**
- [ ] **Step 3: Calcular plazos y mostrar banner**
- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: banner de alertas FUNDAE proactivas en pestana Convocatoria"
```

---

### Task 8: Auto-relleno datos grupo XML

**Fuentes:** EU-P10, EU-1.8b

**Files:**
- Modify: `convocatoria.html` (JS zona XML ~9500+)

- [ ] **Step 1: Guardar defaults por CIF en localStorage**
- [ ] **Step 2: Pre-rellenar cuando hay defaults**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: auto-relleno de datos del grupo XML por empresa"
```

---

## Fase 2: Core UX (3-5 dias)

---

### Task 9: Empty states tabla principal — 3 variantes

**Fuentes:** FP-4.1, PV-8, AC-R8, EA-3.5

**Files:**
- Modify: `convocatoria.html:1265-1288` (CSS)
- Modify: `convocatoria.html:3131` (HTML)
- Modify: `convocatoria.html` (JS renderizado tabla)

**Descripcion:** A) Sin datos (upload + CTA), B) Sin resultados filtro (lupa + "Limpiar filtros"), C) Todos excluidos (checkbox + "Seleccionar todos"). Todo con DOM methods.

- [ ] **Step 1: Eliminar ::before generico, reutilizar clases de Task 5**
- [ ] **Step 2: Funcion renderEmptyStateVariant(type) con createElement/textContent**
- [ ] **Step 3: Determinar variante en logica de renderizado**
- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: 3 variantes de empty state contextual para tabla"
```

---

### Task 10: Dialogo de confirmacion — Rediseno premium

**Fuentes:** FP-3.1, PV-2.4, AC-R9, EU-P5

**Files:**
- Modify: `convocatoria.html:3823` (HTML)
- Modify: `convocatoria.html:8653-8690` (JS)

**Descripcion:** Resumen visual estructurado, borde accent, backdrop blur 8px, boton con estado de carga. Todo valor usuario sanitizado con `esc()`.

- [ ] **Step 1: CSS .confirm-summary-row, .confirm-attendee-chip, .btn-sending**
- [ ] **Step 2: Refactorizar resumen con filas semanticas (DOM methods + esc())**
- [ ] **Step 3: Estado de carga 300ms en boton confirmar**
- [ ] **Step 4: Toast post-confirmacion mejorado**
- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: rediseno premium del dialogo de confirmacion"
```

---

### Task 11: Progreso de cola + Celebracion

**Fuentes:** FP-3.2, FP-3.3, EU-P13, PV-2.4, EA-4.5

**Files:**
- Modify: `convocatoria.html:3112` (HTML)
- Modify: `convocatoria.html:8822-8870` (JS)

- [ ] **Step 1: CSS .queue-progress, .celebration-dialog, .celebration-check**
- [ ] **Step 2: HTML barra progreso en #queueBar**
- [ ] **Step 3: Actualizar launchNext() con progreso visual**
- [ ] **Step 4: Dialogo celebracion con check SVG animado al completar**
- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: barra de progreso en cola + celebracion al completar"
```

---

### Task 12: Errores inline en formulario

**Fuentes:** FP-5.1, EA-2.3, EA-4.4, PV-3.5

**Files:**
- Modify: `convocatoria.html:8639-8651` (JS)

- [ ] **Step 1: CSS .field-error**
- [ ] **Step 2: Refactorizar validateEvent() con DOM methods (createElement para span.field-error, .textContent para mensaje), scroll al primer error**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: errores de validacion inline con scroll al primer error"
```

---

### Task 13: Skeleton screen para tabla

**Fuentes:** FP-6.1, PV-4, EA-9.1

**Files:**
- Modify: `convocatoria.html` (HTML ~3131, CSS, JS)

- [ ] **Step 1: CSS .table-skeleton, .skeleton-row, .skeleton-cell con shimmer**
- [ ] **Step 2: showTableSkeleton() / hideTableSkeleton() con DOM methods**
- [ ] **Step 3: Invocar al iniciar/terminar carga Excel**
- [ ] **Step 4: Reducir motion**
- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: skeleton screen durante carga de Excel"
```

---

### Task 14: Panel persistente de calidad de datos

**Fuentes:** EU-P1, EU-1.1c, AC-R8

**Files:**
- Modify: `convocatoria.html` (HTML ~3096, CSS, JS)

**Descripcion:** Panel colapsable persistente con problemas del Excel (no toasts efimeros). Items clickables. Todo con DOM methods.

- [ ] **Step 1: HTML #dataQualityPanel despues de #summaryBar**
- [ ] **Step 2: CSS .data-quality-panel, .data-quality-item**
- [ ] **Step 3: Poblar panel en post-carga con DOM methods (createElement, textContent)**
- [ ] **Step 4: Boton cerrar**
- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: panel persistente de calidad de datos"
```

---

### Task 15: Semaforo readiness FUNDAE

**Fuentes:** EU-P3, EU-1.8d

**Files:**
- Modify: `convocatoria.html:8546` (JS)
- Modify: `convocatoria.html` (HTML catalogos, JS formulario)

- [ ] **Step 1: Funcion calcFundaeReadinessLevel(accion) -> { level, issues, score }**
- [ ] **Step 2: Badge en ficha de accion del catalogo**
- [ ] **Step 3: Semaforo en pestana XML antes de generar**
- [ ] **Step 4: CSS .readiness-badge variantes green/yellow/red**
- [ ] **Step 5: Commit**

```bash
git add convocatoria.html
git commit -m "feat: semaforo de readiness FUNDAE"
```

---

### Task 16: Duplicar accion formativa

**Fuentes:** EU-P4, EU-1.6e

**Files:**
- Modify: `convocatoria.html` (JS CRUD catalogos, HTML ficha)

- [ ] **Step 1: Boton "Duplicar" en header de ficha**
- [ ] **Step 2: duplicateAction(id) — deep copy sin participantes/fechas/estado**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: duplicar accion formativa con un click"
```

---

## Fase 3: Diferenciadores Premium (5-8 dias)

---

### Task 17: Paleta de comandos (Cmd+K)

**Fuentes:** FP-7.1, AC-R10, EA-1.2, PV-4.4

**Files:**
- Modify: `convocatoria.html` (CSS, HTML, JS)

**Descripcion:** Overlay blur, input busqueda, resultados con categorias (Navegacion, Datos, Convocatoria, Herramientas), navegacion flechas, busqueda fuzzy, Enter ejecuta.

- [ ] **Step 1: HTML #cmdkOverlay con role="dialog"**
- [ ] **Step 2: CSS .cmdk-overlay (blur 8px, z-index 2000), .cmdk-box (560px, shadow-lg), .cmdk-input (16px), .cmdk-item, .cmdk-category, .cmdk-item-shortcut**
- [ ] **Step 3: fuzzyMatch(query, text) — recorrido caracter a caracter**
- [ ] **Step 4: Array CMD_COMMANDS con categorias y acciones**
- [ ] **Step 5: toggleCommandPalette(), renderCmdkResults(), manejo ArrowUp/Down/Enter/Escape**
- [ ] **Step 6: Listener global Cmd+K / Ctrl+K con preventDefault**
- [ ] **Step 7: Commit**

```bash
git add convocatoria.html
git commit -m "feat: paleta de comandos (Cmd+K) con busqueda fuzzy"
```

---

### Task 18: Atajos de teclado globales

**Fuentes:** FP-8.1, EU-P12, PV-4.4

**Files:**
- Modify: `convocatoria.html` (JS ~15504)

- [ ] **Step 1: Cmd+1-5 (tabs), Cmd+Enter (enviar), Cmd+, (ajustes)**
- [ ] **Step 2: Atributos title con atajo en botones**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: atajos de teclado globales"
```

---

### Task 19: PDF de convocatoria

**Fuentes:** FP-10.1, PV-7.3

**Files:**
- Modify: `convocatoria.html` (JS nueva funcion)

**Descripcion:** Exportar via window.open() + print (patron de printSignSheet() linea 5747). Cabecera Indigo, tabla filas alternas, pie metadata. Valores sanitizados con esc().

- [ ] **Step 1: Funcion exportConvocatoriaPDF() siguiendo patron existente**
- [ ] **Step 2: Boton "Exportar PDF" en action bar**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: exportar convocatoria como PDF"
```

---

### Task 20: Mejora hoja de firmas

**Fuentes:** FP-10.2

**Files:**
- Modify: `convocatoria.html:5747`

- [ ] **Step 1: Aplicar paleta Indigo y tipografia Inter a printSignSheet()**
- [ ] **Step 2: Commit**

```bash
git add convocatoria.html
git commit -m "feat: hoja de firmas con diseno Indigo coherente"
```

---

### Task 21: Sound design opt-in

**Fuentes:** FP-9.1, PV-4.7

**Files:**
- Modify: `convocatoria.html` (JS, Settings)

- [ ] **Step 1: playSound(type) con Web Audio API — 4 sonidos (success, complete, error, tick)**
- [ ] **Step 2: Checkbox en ajustes, default false**
- [ ] **Step 3: Llamadas en carga, envio, cola, error**
- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: sound design opt-in con Web Audio API"
```

---

### Task 22: Precomputacion dashboard

**Fuentes:** FP-6.2, PV-6.1

**Files:**
- Modify: `convocatoria.html` (JS)

- [ ] **Step 1: dashboardCache con hash y metricas**
- [ ] **Step 2: requestIdleCallback tras carga Excel**
- [ ] **Step 3: Usar cache en renderDashboard() si hash coincide**
- [ ] **Step 4: Commit**

```bash
git add convocatoria.html
git commit -m "feat: precomputacion del dashboard"
```

---

### Task 23: Diagnostico errores Excel

**Fuentes:** FP-5.2, EU-1.1a, PV-3.5

**Files:**
- Modify: `convocatoria.html` (JS ~6500-6550)

- [ ] **Step 1: Clasificar errores con mensajes accionables**
- [ ] **Step 2: Dialogo para errores criticos (no toast)**
- [ ] **Step 3: Commit**

```bash
git add convocatoria.html
git commit -m "feat: diagnostico accionable de errores de Excel"
```

---

## Fase 4: Pulido fino y coherencia (continuo)

---

### Task 24: Unificar terminologia

**Fuentes:** AC-R5, AC-4.4
- [ ] **Step 1: Auditar textos visibles**
- [ ] **Step 2: Sustituir: "Participantes" (FUNDAE), "Seleccionados" (convocatoria), "Empleados" (organigrama)**
- [ ] **Step 3: Commit**

### Task 25: Renombrar la aplicacion

**Fuentes:** AC-R1
- [ ] **Step 1: title -> "Gestor de Formacion"**
- [ ] **Step 2: header visible**
- [ ] **Step 3: Commit**

### Task 26: Refinar attendee-count

**Fuentes:** FP-1.2, PV-3.1
- [ ] **Step 1: CSS 28px/700, letter-spacing, transicion scale**
- [ ] **Step 2: Subtitulo "seleccionados"**
- [ ] **Step 3: Clase .pulse temporal**
- [ ] **Step 4: Commit**

### Task 27: Animacion seleccion/deseleccion tabla

**Fuentes:** FP-2.1, PV-4.2
- [ ] **Step 1: Transicion opacity 200ms + rowReinclude flash verde**
- [ ] **Step 2: Clase temporal .reincluded**
- [ ] **Step 3: Commit**

### Task 28: Hover mejorado filter-select-btn

**Fuentes:** FP-2.2, PV-5
- [ ] **Step 1: translateY(-1px) al hover**
- [ ] **Step 2: Commit**

### Task 29: Divulgacion progresiva dashboard

**Fuentes:** AC-R3, PV-9, AC-2.3
- [ ] **Step 1: Clasificar modulos operativo/avanzado**
- [ ] **Step 2: Toggle expansion con persistencia localStorage**
- [ ] **Step 3: Commit**

### Task 30: Backup datos JSON

**Fuentes:** AC-R11, AC-5.3
- [ ] **Step 1: exportAllData() a fichero JSON descargable**
- [ ] **Step 2: importAllData() con confirmacion**
- [ ] **Step 3: Botones en ajustes**
- [ ] **Step 4: Recordatorio 7 dias**
- [ ] **Step 5: Commit**

### Task 31: Seleccion por lista NIFs/emails

**Fuentes:** EU-P6, EU-1.2c
- [ ] **Step 1: Link "Seleccionar por lista" en filtros**
- [ ] **Step 2: Dialogo textarea + matching por NIF/email**
- [ ] **Step 3: Commit**

### Task 32: Exportacion .ics calendario

**Fuentes:** EU-P8, EU-1.9b
- [ ] **Step 1: generateICS() formato iCalendar**
- [ ] **Step 2: Boton en Calendario**
- [ ] **Step 3: Commit**

### Task 33: Modo compacto formulario acciones

**Fuentes:** EU-P14, AC-R3, EU-1.6a
- [ ] **Step 1: Campos FUNDAE en details/summary colapsables**
- [ ] **Step 2: Campos operativos siempre visibles**
- [ ] **Step 3: Commit**

### Task 34: Dashboard accionable

**Fuentes:** AC-R4, AC-2.2, PV-5.4
- [ ] **Step 1: Alertas con onclick -> navegar a pestana+filtro**
- [ ] **Step 2: KPIs clickables**
- [ ] **Step 3: Commit**

### Task 35: Onboarding 5 pestanas

**Fuentes:** AC-R2, AC-4.2, PV-7
- [ ] **Step 1: Localizar onboarding actual (3 pasos)**
- [ ] **Step 2: Paso 4 "Mas que convocatorias" con iconos de pestanas**
- [ ] **Step 3: Commit**

---

## Dependencias entre tareas

```
Fase 1 (Tasks 1-8): Todas independientes. Ejecutar en paralelo.

Fase 2 (Tasks 9-16):
  Task 9 depende de Task 5 (CSS compartido empty states)
  Task 10 depende de Task 1 (toasts mejorados)
  Task 11 depende de Task 1 (toasts mejorados)
  Tasks 12-16: independientes

Fase 3 (Tasks 17-23):
  Task 18 depende de Task 17 (paleta de comandos)
  Task 21 depende de Task 11 (celebracion)
  Tasks 19, 20, 22, 23: independientes

Fase 4 (Tasks 24-35): Todas independientes.
```

## Esfuerzo estimado

| Fase | Tasks | Esfuerzo | Impacto |
|------|-------|----------|---------|
| 1. Quick Wins | 1-8 | 8-12h | Alto |
| 2. Core UX | 9-16 | 16-24h | Muy alto |
| 3. Premium | 17-23 | 20-30h | Alto |
| 4. Pulido | 24-35 | 16-24h | Medio-alto |
| **Total** | **35 tasks** | **60-90h** | **Transformacion completa** |

## Principios transversales (checklist por tarea)

- [ ] SOLO variables CSS del design system (nunca hardcodear colores)
- [ ] Fuente: SOLO `var(--font-body)` (Inter)
- [ ] Sombras: SOLO `--shadow-sm` y `--shadow-lg` (+ `--shadow-accent` para botones)
- [ ] Radii: SOLO `--radius-sm`, `--radius`, `--radius-lg`
- [ ] Transiciones: SOLO `var(--transition)`
- [ ] Sanitizar con `esc()` TODO valor del Excel antes de insertar en DOM
- [ ] Preferir DOM methods (createElement, textContent, appendChild) sobre insercion directa
- [ ] Regla en `@media (prefers-reduced-motion: reduce)` para toda animacion nueva
- [ ] Texto visible: espanol. Variables/funciones: ingles
- [ ] Testear con 0, 1, 50 y 2000+ empleados
- [ ] No crear ficheros adicionales — todo en `convocatoria.html`
