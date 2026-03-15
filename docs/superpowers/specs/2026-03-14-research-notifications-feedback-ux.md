# Sistemas de Notificacion No Invasivos y Feedback Sutil (2024-2026)

> Investigacion UX profunda sobre patrones de notificacion, feedback sutil y alertas controladas por el usuario en aplicaciones web modernas.
>
> Fecha: 2026-03-14
> Tipo: Research / UX Patterns
> Contexto: El usuario ha reportado que las alertas proactivas de la aplicacion son "invasivas y hacen que la herramienta sea desagradable de usar."

---

## Indice

1. [Principios Fundamentales](#1-principios-fundamentales)
2. [Notification Center (Centro de Notificaciones)](#2-notification-center-centro-de-notificaciones)
3. [Toast / Snackbar: Mejores Practicas](#3-toast--snackbar-mejores-practicas)
4. [Framework de Severidad: Cuando Usar Cada Tipo](#4-framework-de-severidad-cuando-usar-cada-tipo)
5. [Preferencias de Notificacion Controladas por el Usuario](#5-preferencias-de-notificacion-controladas-por-el-usuario)
6. [Badges de Notificacion: Punto vs Contador](#6-badges-de-notificacion-punto-vs-contador)
7. [Inbox / Activity Feed](#7-inbox--activity-feed)
8. [Do Not Disturb / Horas Silenciosas](#8-do-not-disturb--horas-silenciosas)
9. [Notificaciones Diferidas: Digest vs Real-Time](#9-notificaciones-diferidas-digest-vs-real-time)
10. [Revelacion Progresiva de Notificaciones](#10-revelacion-progresiva-de-notificaciones)
11. [Informar Sin Interrumpir: Indicadores Ambientales](#11-informar-sin-interrumpir-indicadores-ambientales)
12. [Animacion y Movimiento](#12-animacion-y-movimiento)
13. [Persistencia de Notificaciones](#13-persistencia-de-notificaciones)
14. [Feedback de Exito: Minimal vs Detallado](#14-feedback-de-exito-minimal-vs-detallado)
15. [Estado Vacio de Notificaciones](#15-estado-vacio-de-notificaciones)
16. [Accesibilidad para Notificaciones](#16-accesibilidad-para-notificaciones)
17. [Codificacion Cromatica Semantica](#17-codificacion-cromatica-semantica)
18. [Recomendaciones de Implementacion para Nuestra App](#18-recomendaciones-de-implementacion-para-nuestra-app)

---

## 1. Principios Fundamentales

### El problema: fatiga de notificaciones

La alta frecuencia de notificaciones genera disrupciones y eventualmente **fatiga de notificaciones**, un estado donde cualquier mensaje emergente es descartado instantaneamente. Un estudio de Facebook demostro que **enviar menos notificaciones mejoro la satisfaccion del usuario y el uso a largo plazo del producto**, con el trafico recuperandose gradualmente con el tiempo.

### Principios rectores

| Principio | Descripcion |
|---|---|
| **Relevancia** | Cada notificacion debe ser relevante, aportar valor al usuario y ayudarle a lograr un objetivo |
| **Minima interrupcion** | Las notificaciones deben ser lo menos disruptivas posible para el flujo de trabajo actual |
| **Control del usuario** | Dar al usuario poder para apagar cosas mantiene esas cosas encendidas |
| **Fuerza de senal** | Las interacciones potencialmente destructivas necesitan notificaciones "mas fuertes"; las no-destructivas necesitan notificaciones "mas silenciosas" |
| **Calidad sobre cantidad** | Menos notificaciones = mayor satisfaccion. No notificar por notificar |
| **Personalizacion temporal** | Cada mensaje debe aparecer en el momento correcto del recorrido del usuario |

### Tres niveles de atencion

Las notificaciones se clasifican en tres niveles de severidad:

- **Alta atencion**: Alertas criticas, errores, acciones destructivas. Requieren accion inmediata.
- **Media atencion**: Warnings, confirmaciones, actualizaciones importantes. Merecen atencion pero no urgen.
- **Baja atencion**: Informativos, exitos, status updates. Conocimiento pasivo, sin accion requerida.

---

## 2. Notification Center (Centro de Notificaciones)

### Que es el patron

Un centro de notificaciones es un hub centralizado donde el usuario puede revisar todas las comunicaciones relacionadas con el producto. Tipicamente se compone de tres capas:

1. **Icono campana** con badge (punto o contador) en la barra de navegacion
2. **Dropdown / Popover** con las notificaciones mas recientes
3. **Pagina completa** con historial filtrable y buscable

### Que herramientas lo usan

| Herramienta | Implementacion |
|---|---|
| **GitHub** | Icono campana -> dropdown con filtros por razon (mention, review-requested, subscribed) -> Inbox completo con agrupacion por repositorio/fecha, hasta 15 filtros custom, acciones Done/Read/Unread |
| **Linear** | Icono campana -> panel lateral con notificaciones agrupadas por proyecto, marcado como leido al hacer clic |
| **Notion** | Icono campana -> dropdown con actualizaciones de paginas, menciones, comentarios. Permite filtrar "All" vs "Mentions" |
| **Slack** | Canal de actividad con hilos, menciones, reacciones. Sidebar con badges por canal |
| **Intercom** | Panel de conversaciones minimalista, estetica limpia con lineas limpias, espacio en blanco amplio, gradientes sutiles |

### Por que funciona

- **Modelo mental claro**: El usuario sabe exactamente donde ir para ver "que se ha perdido"
- **Patron pull vs push**: El usuario elige cuando revisar, en vez de ser interrumpido
- **Reduccion de ansiedad**: Ver "0 notificaciones" o "estas al dia" es una micro-recompensa
- **Consolidacion**: Un solo lugar vs multiples fuentes de interrupcion

### Guia de implementacion

```html
<!-- Estructura basica del Notification Center -->
<div class="notification-bell-container" role="navigation" aria-label="Notificaciones">
  <button
    class="notification-bell"
    aria-expanded="false"
    aria-haspopup="true"
    aria-label="Notificaciones (3 sin leer)"
  >
    <svg><!-- icono campana --></svg>
    <span class="notification-badge" aria-hidden="true">3</span>
  </button>

  <div
    class="notification-dropdown"
    role="menu"
    aria-label="Panel de notificaciones"
    hidden
  >
    <header class="notification-header">
      <h2>Notificaciones</h2>
      <button>Marcar todas como leidas</button>
    </header>

    <div class="notification-filters" role="tablist">
      <button role="tab" aria-selected="true">Todas</button>
      <button role="tab">Menciones</button>
      <button role="tab">Asignadas</button>
    </div>

    <ul class="notification-list" role="list">
      <li class="notification-item unread" role="listitem">
        <img class="notification-avatar" src="..." alt="Usuario" />
        <div class="notification-content">
          <p class="notification-text">
            <strong>Maria Garcia</strong> te menciono en
            <a href="#">Formacion Excel Avanzado</a>
          </p>
          <time class="notification-time" datetime="2026-03-14T10:30:00">
            hace 2 horas
          </time>
        </div>
        <button class="notification-dismiss" aria-label="Marcar como leida">
          <span class="dot"></span>
        </button>
      </li>
    </ul>

    <footer class="notification-footer">
      <a href="/notifications">Ver todas las notificaciones</a>
    </footer>
  </div>
</div>
```

```css
.notification-bell-container {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-danger);
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 400px;
  max-height: 480px;
  overflow-y: auto;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  transition: background 150ms ease;
}

.notification-item:hover {
  background: var(--bg-hover);
}

.notification-item.unread {
  background: var(--bg-accent-subtle);
}
```

---

## 3. Toast / Snackbar: Mejores Practicas

### Que es el patron

Un toast (o snackbar) es un mensaje breve y transitorio que aparece en una esquina de la pantalla para mostrar actualizaciones no interruptivas. Desaparece automaticamente despues de unos segundos.

### Que herramientas lo usan

| Herramienta | Implementacion |
|---|---|
| **Vercel (Geist)** | Toast minimalista en esquina inferior derecha, con variantes de estado (success, error, warning). Componente `<Toast>` en el Geist Design System |
| **Linear** | Toast en esquina inferior izquierda, extremadamente sutil, fondo oscuro, texto conciso ("Issue created", "Copied to clipboard") |
| **GitHub** | Flash messages en la parte superior de la pagina, persistentes hasta cerrar |
| **Notion** | Toast inferior central para confirmaciones rapidas ("Page moved to...") |
| **Figma** | Snackbar en la parte inferior central, a menudo con boton "Undo" |

### Duracion recomendada

| Tipo de mensaje | Duracion | Ejemplo |
|---|---|---|
| Confirmacion trivial | 1.5-3 s | "Guardado", "Copiado" |
| Informativo simple | 3-5 s | "Formacion creada con exito" |
| Mensaje con detalles | 5-10 s | "3 participantes inscritos en Excel Avanzado" |
| Con boton de accion | Hasta que el usuario actue o cierre | "Encuesta eliminada. [Deshacer]" |

### Posicionamiento

| Plataforma | Posicion recomendada | Justificacion |
|---|---|---|
| **Desktop** | Esquina inferior derecha o inferior izquierda | No interfiere con navegacion superior ni contenido principal |
| **Mobile** | Parte inferior, centrado | Accesible al pulgar, no bloquea navegacion |
| **Alternativa** | Superior derecha | Visible pero fuera del area de trabajo (GitHub, AWS) |

### Reglas de stacking

- **Recomendado**: Nuevos toasts reemplazan al anterior, o se apilan verticalmente con el mas nuevo arriba
- **Evitar**: Cola de mas de 3 toasts simultaneos
- **Estrategia de colision**: Colapsar mensajes similares en uno solo (ej: "3 elementos guardados" en vez de 3 toasts separados)
- **Cada toast debe tener boton de cierre** para permitir descarte manual

### Por que funciona

- **No bloquea el flujo**: El usuario puede seguir trabajando mientras aparece y desaparece
- **Confirma sin exigir**: Proporciona certeza de que la accion se completo sin pedir nada a cambio
- **Reversibilidad percibida**: Cuando incluye "Deshacer", reduce la ansiedad de acciones destructivas

### Guia de implementacion

```html
<!-- Contenedor de toasts (siempre presente en el DOM) -->
<div
  class="toast-container"
  role="region"
  aria-label="Notificaciones"
  aria-live="polite"
>
  <!-- Los toasts se insertan dinamicamente -->
</div>

<!-- Template de un toast individual -->
<output class="toast" role="status" data-type="success">
  <div class="toast-icon" aria-hidden="true">
    <svg><!-- check icon --></svg>
  </div>
  <div class="toast-content">
    <p class="toast-message">Formacion guardada correctamente</p>
  </div>
  <button class="toast-close" aria-label="Cerrar notificacion">
    <svg><!-- X icon --></svg>
  </button>
</output>

<!-- Toast con accion (Undo) -->
<output class="toast" role="status" data-type="info" data-persistent="true">
  <div class="toast-content">
    <p class="toast-message">Encuesta eliminada</p>
  </div>
  <button class="toast-action">Deshacer</button>
  <button class="toast-close" aria-label="Cerrar notificacion">
    <svg><!-- X icon --></svg>
  </button>
</output>
```

```css
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-width: 300px;
  max-width: 420px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: auto;

  /* Animacion de entrada */
  animation: toast-enter 300ms ease-out;
}

.toast[data-exiting] {
  animation: toast-exit 200ms ease-in forwards;
}

/* Variantes de color semantico */
.toast[data-type="success"] {
  border-left: 3px solid var(--color-success);
}
.toast[data-type="error"] {
  border-left: 3px solid var(--color-danger);
}
.toast[data-type="warning"] {
  border-left: 3px solid var(--color-warning);
}
.toast[data-type="info"] {
  border-left: 3px solid var(--color-info);
}

@keyframes toast-enter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-exit {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive: en movil, centrado abajo */
@media (max-width: 640px) {
  .toast-container {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }

  .toast {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }

  @keyframes toast-enter {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

/* Respetar preferencia de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation-duration: 0ms;
  }
  .toast[data-exiting] {
    animation-duration: 0ms;
  }
}
```

```javascript
// Sistema de Toasts minimal - usa DOM API segura (sin innerHTML)
class ToastManager {
  constructor(containerSelector = '.toast-container') {
    this.container = document.querySelector(containerSelector);
    this.queue = [];
    this.maxVisible = 3;
  }

  show({ message, type = 'info', duration = 4000, action = null }) {
    const toast = this._createToast({ message, type, action });
    this.container.appendChild(toast);

    // Colapsar si hay demasiados
    this._enforceMaxVisible();

    // Auto-dismiss (excepto si tiene accion o es error)
    if (!action && type !== 'error') {
      this._scheduleRemoval(toast, duration);
    }

    return toast;
  }

  _createToast({ message, type, action }) {
    const toast = document.createElement('output');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.dataset.type = type;

    // Contenido del mensaje (usando DOM API segura)
    const content = document.createElement('div');
    content.className = 'toast-content';
    const p = document.createElement('p');
    p.className = 'toast-message';
    p.textContent = message;
    content.appendChild(p);
    toast.appendChild(content);

    // Boton de accion (si aplica)
    if (action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action';
      actionBtn.textContent = action.label;
      actionBtn.addEventListener('click', () => {
        action.callback();
        this._remove(toast);
      });
      toast.appendChild(actionBtn);
      toast.dataset.persistent = 'true';
    }

    // Boton de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Cerrar notificacion');
    closeBtn.textContent = '\u00D7'; // multiplication sign as X
    closeBtn.addEventListener('click', () => this._remove(toast));
    toast.appendChild(closeBtn);

    return toast;
  }

  _scheduleRemoval(toast, duration) {
    setTimeout(() => this._remove(toast), duration);
  }

  _remove(toast) {
    toast.dataset.exiting = 'true';
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  _enforceMaxVisible() {
    const toasts = this.container.querySelectorAll('.toast:not([data-exiting])');
    if (toasts.length > this.maxVisible) {
      // Remover los mas antiguos
      for (let i = 0; i < toasts.length - this.maxVisible; i++) {
        this._remove(toasts[i]);
      }
    }
  }
}

// Uso:
const toasts = new ToastManager();

toasts.show({
  message: 'Formacion guardada correctamente',
  type: 'success',
  duration: 3000
});

toasts.show({
  message: 'Encuesta eliminada',
  type: 'warning',
  action: {
    label: 'Deshacer',
    callback: () => restoreEncuesta()
  }
});
```

---

## 4. Framework de Severidad: Cuando Usar Cada Tipo

### La matriz de decision

Este framework ayuda a decidir que tipo de notificacion usar segun la urgencia y la accion requerida:

```
                    REQUIERE ACCION
                    Si                No
                +-----------------+-----------------+
    URGENTE     |                 |                 |
      Si        |     MODAL       |     BANNER      |
                |  (interrupcion) |  (persistente)  |
                +-----------------+-----------------+
    URGENTE     |                 |                 |
      No        |  INLINE ALERT   |     TOAST       |
                |  (contextual)   |  (efimero)      |
                +-----------------+-----------------+
```

### Detalle de cada tipo

#### Modal (alta severidad, requiere accion)

| Aspecto | Detalle |
|---|---|
| **Cuando usar** | Acciones destructivas irreversibles, confirmacion de operaciones criticas, errores que no se pueden resolver en la pagina actual |
| **Ejemplo** | "Vas a eliminar la formacion 'Excel Avanzado' y todas sus 47 encuestas asociadas. Esta accion no se puede deshacer." |
| **Quien lo usa** | GitHub (eliminar repositorio), Slack (eliminar workspace), Notion (eliminar permanentemente) |
| **Regla de oro** | Si la accion NO es destructiva, NO uses modal. El modal es el "ultimo recurso" |
| **Anti-patron** | Usar modales para confirmaciones triviales ("Seguro que quieres guardar?") entrena al usuario a cerrar modales sin leer |

#### Banner (alta severidad, no requiere accion inmediata)

| Aspecto | Detalle |
|---|---|
| **Cuando usar** | Mensajes globales del sistema, mantenimiento planificado, degradacion de servicio, cambios de politicas |
| **Ejemplo** | "Mantenimiento programado: El sistema estara no disponible el domingo 16 de marzo de 02:00 a 04:00" |
| **Quien lo usa** | GitHub (estado del sistema), Vercel (alertas de billing), Notion (actualizaciones de plan) |
| **Posicion** | Parte superior de la pagina, ancho completo, por encima del contenido principal |
| **Persistencia** | Permanece visible hasta que el usuario lo cierra o la condicion se resuelve |

#### Inline Alert (media severidad, requiere accion contextual)

| Aspecto | Detalle |
|---|---|
| **Cuando usar** | Errores de validacion de formulario, advertencias contextuales, informacion necesaria para completar una tarea |
| **Ejemplo** | "La fecha de inicio de la formacion no puede ser anterior a hoy" |
| **Quien lo usa** | GitHub (errores de PR), Linear (campos requeridos), Supabase (validacion de queries) |
| **Posicion** | Inmediatamente adyacente al elemento que requiere atencion |
| **Regla de oro** | El mensaje debe estar visualmente conectado al campo/seccion relevante, no flotando en otro lugar |

#### Toast (baja severidad, informativo)

| Aspecto | Detalle |
|---|---|
| **Cuando usar** | Confirmacion de acciones completadas, actualizaciones de estado, informacion que no requiere accion |
| **Ejemplo** | "Encuesta de satisfaccion enviada a 23 participantes" |
| **Quien lo usa** | Vercel, Linear, Figma, Notion |
| **Regla de oro** | Si el usuario necesita hacer algo con esta informacion, NO uses un toast. Usa inline alert o modal |

### Contraste visual por severidad

Los estilos de **alto contraste** son mas visualmente disruptivos y deben usarse para notificaciones urgentes o criticas. Los estilos de **bajo contraste** son mejores para mensajeria suplementaria o casos de baja prioridad.

| Severidad | Estilo visual | Contraste |
|---|---|---|
| Critico / Error | Fondo rojo solido o borde rojo prominente | Alto |
| Warning | Fondo ambar/naranja sutil o borde ambar | Medio-alto |
| Informativo | Fondo azul sutil o borde azul | Medio |
| Exito | Fondo verde sutil o borde verde | Bajo |

---

## 5. Preferencias de Notificacion Controladas por el Usuario

### Que es el patron

Un panel de configuracion donde el usuario puede ajustar que notificaciones recibe, como las recibe, y cuando las recibe. El principio clave: **dar al usuario el poder de apagar cosas mantiene esas cosas encendidas**.

### Que herramientas lo usan

| Herramienta | Nivel de granularidad |
|---|---|
| **Slack** | Per-canal, per-tipo (mensajes directos, menciones, keywords), per-dispositivo, horarios DND |
| **GitHub** | Per-repositorio, per-tipo de actividad (issues, PRs, releases), per-canal (web, email) |
| **Notion** | Per-tipo de evento (comentarios, menciones, ediciones), toggle per-categoria |
| **Linear** | Per-proyecto, per-tipo de cambio (asignaciones, status changes) |
| **Figma** | Per-archivo, per-tipo (comentarios, invitaciones, ediciones) |

### Modelo de preferencias "3 modos" (patron Basecamp)

En lugar de abrumar al usuario con opciones granulares, ofrecer presets predefinidos:

| Modo | Frecuencia | Descripcion |
|---|---|---|
| **Modo Calma** | Baja | Solo menciones directas y asignaciones. Digest diario para el resto |
| **Modo Regular** | Media | Menciones, asignaciones, cambios en items que sigo. Updates en tiempo real |
| **Modo Power User** | Alta | Todo en tiempo real. Incluye actividad de equipo y cambios de sistema |

Basecamp introdujo las opciones "Always On" y "Work Can Wait" durante el onboarding, permitiendo al usuario elegir si recibir notificaciones en tiempo real o seleccionar rangos horarios y dias especificos.

### Consecuencia de no ofrecer control

Cuando no se da la opcion de configurar las preferencias de notificacion a un nivel granular, **los usuarios recurren a medidas extremas**: marcan emails como spam, desactivan notificaciones moviles por completo, o abandonan el canal. Es una espiral que termina en **perdida total de contacto en ese canal**.

### Guia de implementacion

```html
<!-- Panel de Preferencias de Notificaciones -->
<section class="notification-preferences" aria-labelledby="notif-prefs-heading">
  <h2 id="notif-prefs-heading">Preferencias de Notificaciones</h2>

  <!-- Selector de modo rapido -->
  <fieldset class="notification-mode-selector">
    <legend>Modo de notificaciones</legend>

    <label class="mode-option">
      <input type="radio" name="notification-mode" value="calm" />
      <div class="mode-card">
        <strong>Modo Calma</strong>
        <p>Solo menciones directas y asignaciones. Digest diario.</p>
      </div>
    </label>

    <label class="mode-option">
      <input type="radio" name="notification-mode" value="regular" checked />
      <div class="mode-card">
        <strong>Modo Regular</strong>
        <p>Menciones, asignaciones y cambios en tus formaciones.</p>
      </div>
    </label>

    <label class="mode-option">
      <input type="radio" name="notification-mode" value="power" />
      <div class="mode-card">
        <strong>Todo</strong>
        <p>Todas las notificaciones en tiempo real.</p>
      </div>
    </label>
  </fieldset>

  <!-- Control granular (expandible) -->
  <details class="notification-advanced">
    <summary>Configuracion avanzada</summary>

    <table class="notification-matrix">
      <thead>
        <tr>
          <th>Tipo de notificacion</th>
          <th>En la app</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Menciones directas (@tu_nombre)</td>
          <td><input type="checkbox" checked disabled /></td>
          <td><input type="checkbox" checked /></td>
        </tr>
        <tr>
          <td>Asignacion de formaciones</td>
          <td><input type="checkbox" checked /></td>
          <td><input type="checkbox" checked /></td>
        </tr>
        <tr>
          <td>Nuevas respuestas a encuestas</td>
          <td><input type="checkbox" checked /></td>
          <td><input type="checkbox" /></td>
        </tr>
        <tr>
          <td>Cambios de estado en formaciones</td>
          <td><input type="checkbox" checked /></td>
          <td><input type="checkbox" /></td>
        </tr>
        <tr>
          <td>Actividad del equipo</td>
          <td><input type="checkbox" /></td>
          <td><input type="checkbox" /></td>
        </tr>
      </tbody>
    </table>
  </details>
</section>
```

---

## 6. Badges de Notificacion: Punto vs Contador

### Que es el patron

Un badge es un indicador visual superpuesto sobre un icono o elemento para indicar estado, novedad o cantidad. Se divide en dos variantes principales:

### Dot badge (punto)

- **Que comunica**: "Hay algo nuevo" (estado binario: hay/no hay)
- **Cuando usar**: Cuando el numero exacto de notificaciones es irrelevante o desconocido
- **Ejemplo**: Un punto rojo en el icono de campana para indicar actividad nueva
- **Ventaja**: Extremadamente sutil, no genera ansiedad numerica
- **Quien lo usa**: Linear, Figma, Slack (indicador de estado de usuario)

### Count badge (contador)

- **Que comunica**: "Tienes N cosas pendientes" (cantidad especifica)
- **Cuando usar**: Cuando la cantidad aporta informacion util (emails no leidos, items en carrito, tareas pendientes)
- **Ejemplo**: "7" en el icono de campana, "23" en la bandeja de entrada
- **Ventaja**: Da contexto cuantitativo, ayuda a priorizar
- **Quien lo usa**: GitHub, Slack (conteo de menciones), Notion

### Guia de decision

```
El usuario necesita saber CUANTAS notificaciones tiene?
  +-- Si -> Count badge (ej: 7)
  |     +-- El conteo supera 99?
  |           +-- Si -> Mostrar "99+" (no numeros enormes)
  +-- No -> Dot badge (punto rojo/azul)
        +-- Solo necesita saber que hay algo nuevo
```

### Principios de diseno de badges

| Principio | Detalle |
|---|---|
| **Posicion** | Siempre en el borde superior derecho del icono |
| **Ubicaciones validas** | Barras de navegacion, tabs, iconos de sidebar |
| **Desaparicion** | El badge desaparece cuando el usuario interactua con el elemento, manteniendo la interfaz limpia |
| **Color** | Rojo para urgentes/sin leer, azul/gris para informativos |
| **Tamano** | Lo suficientemente grande para ser visible, lo suficientemente pequeno para no tapar el icono |

### Guia de implementacion

```css
/* Dot badge */
.badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  border: 2px solid var(--bg-primary); /* halo para separar del icono */
}

/* Count badge */
.badge-count {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-danger);
  color: white;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  border: 2px solid var(--bg-primary);
}

/* Animacion sutil de aparicion */
.badge-dot, .badge-count {
  animation: badge-appear 300ms ease-out;
}

@keyframes badge-appear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .badge-dot, .badge-count {
    animation: none;
  }
}
```

---

## 7. Inbox / Activity Feed

### Que es el patron

Un registro persistente y navegable de todas las notificaciones y actividad relevante, organizado cronologicamente y opcionalmente agrupable y filtrable. A diferencia de los toasts efimeros, el inbox permite al usuario revisar informacion historica.

### Que herramientas lo usan y como

#### GitHub Notifications Inbox
- Notificaciones en orden cronologico inverso
- Agrupacion por repositorio o por fecha
- Filtros avanzados con sintaxis de query (is:unread, reason:mention, org:company)
- Hasta 15 filtros personalizados guardados
- Acciones bulk: Done, Mark as read/unread
- Razon de recepcion como label (mention, subscribed, review-requested)

#### Slack Activity Feed
- Hilo de actividad con menciones, reacciones, replies
- Sidebar con badges por canal
- Agrupacion inteligente de notificaciones en hilos
- Busqueda global con filtros por canal, persona, fecha

#### Notion Updates
- Feed de actualizaciones por pagina
- Separacion entre "Todas" y "Menciones"
- Avatares de usuario + descripcion de cambio + timestamp

#### Linear Inbox
- Notificaciones agrupadas por proyecto
- Cada notificacion linkeada al issue especifico
- Interfaz minimal sin chrome innecesario

### Por que funciona

- **Memoria exteriorizada**: El usuario no necesita recordar que se perdio
- **Triaje eficiente**: Permite procesar notificaciones en lote, no una por una como interrupciones
- **Patron email-like**: El usuario ya sabe como funciona una bandeja de entrada
- **Reduce FOMO**: Saber que "todo esta ahi" reduce la ansiedad de perderse algo

### Elementos clave del diseno

| Elemento | Implementacion |
|---|---|
| **Orden** | Cronologico inverso (mas reciente arriba) |
| **Agrupacion** | Por origen (repositorio, proyecto, formacion) o por fecha (hoy, ayer, esta semana) |
| **Filtros** | Por tipo (mencion, asignacion, cambio de estado), por leido/no leido, por fecha |
| **Acciones** | Marcar como leido, archivar, eliminar, marcar todas como leidas |
| **Avatar** | Foto del usuario que genero la notificacion + texto descriptivo |
| **Timestamp** | Relativo ("hace 2h") para recientes, absoluto para antiguos |
| **Link directo** | Cada notificacion es un enlace al recurso original |
| **Empty state** | Mensaje positivo cuando no hay notificaciones pendientes |

---

## 8. Do Not Disturb / Horas Silenciosas

### Que es el patron

Ventanas temporales definidas por el usuario durante las cuales las notificaciones no criticas se suprimen, acumulan, y se entregan cuando el periodo DND termina.

### Que herramientas lo usan

| Herramienta | Implementacion |
|---|---|
| **Slack** | Horarios DND personalizables, pausar notificaciones por duracion (20 min, 1h, 2h, hasta manana), notificaciones de hilos seguidos se mantienen |
| **Basecamp** | "Work Can Wait" en onboarding: elegir rangos horarios y dias para recibir notificaciones |
| **GitHub** | Configuracion de horarios para notificaciones de email |

### Modelo de implementacion

```
El usuario activa DND:
  +-- Notificaciones criticas (errores del sistema) -> Se entregan igual
  +-- Notificaciones importantes (menciones directas) -> Se acumulan, badge silencioso
  +-- Notificaciones informativas -> Se acumulan en inbox, entrega batch al salir de DND
```

### Tipos de DND

| Tipo | Descripcion | Ejemplo |
|---|---|---|
| **Manual temporal** | El usuario pausa por un periodo especifico | "Pausar 2 horas" |
| **Horario recurrente** | Ventana definida que se repite | "Lunes-Viernes, 21:00-08:00" |
| **Modo focus** | Activado durante tareas de concentracion | "Estoy en modo focus" |
| **Por dispositivo** | DND solo en movil, activo en desktop | Slack detecta dispositivo activo |

### Inteligencia contextual (patron Slack)

Slack usa un sistema de prioridad basado en actividad y estado del dispositivo:
1. El cliente de escritorio recibe prioridad cuando esta activo
2. El movil recibe cuando el escritorio esta inactivo
3. El sistema previene notificaciones duplicadas verificando actividad en tiempo real antes de enviar

---

## 9. Notificaciones Diferidas: Digest vs Real-Time

### Que es el patron

En vez de enviar cada notificacion individualmente en tiempo real, agrupar multiples notificaciones en un unico mensaje consolidado (digest) que se entrega en intervalos definidos.

### Estrategias de entrega

| Estrategia | Descripcion | Cuando usar |
|---|---|---|
| **Inmediata** | Se envia en el momento | Menciones directas, errores criticos, acciones requeridas |
| **Batch (agrupada)** | Se acumulan y envian cada N minutos | Actividad de equipo, cambios de estado no urgentes |
| **Digest programado** | Resumen diario o semanal | Metricas, actividad general, actualizaciones informativas |
| **Inteligente** | El sistema decide segun urgencia y contexto | Slack: adapta frecuencia cuando la actividad aumenta |

### Implementacion tecnica del batching

Principios clave del batching de notificaciones:
- **Ventana de tiempo**: Agrupar notificaciones recibidas dentro de una ventana (ej: 15 minutos)
- **Conteo maximo**: Cuando se acumulan N notificaciones del mismo tipo, enviar batch
- **Colapsado**: Combinar notificaciones similares ("Maria, Juan y 3 mas comentaron en tu formacion")
- **Prioridad override**: Las notificaciones criticas rompen el batch y se envian inmediatamente

### Patron de preferencias de frecuencia (recomendado)

Ofrecer al usuario tres opciones claras:

| Opcion | Comportamiento |
|---|---|
| **Tiempo real** | Cada notificacion se entrega al instante |
| **Digest diario** | Un resumen al final del dia (o por la manana del siguiente) |
| **Digest semanal** | Resumen cada lunes con la actividad de la semana anterior |

### Ejemplo: Slack adapta frecuencia

Conforme la actividad se vuelve mas frecuente, Slack recomienda reducir el nivel de notificacion para que los usuarios solo sean notificados cuando son mencionados directamente. Esto evita que canales de alta actividad inunden al usuario.

---

## 10. Revelacion Progresiva de Notificaciones

### Que es el patron

Tecnica que va revelando capas de informacion incrementalmente, empezando por la minima senal y permitiendo al usuario profundizar si lo desea. Aplicado a notificaciones: un indicador sutil conduce a un resumen, que conduce al detalle completo.

### Las tres capas

```
Capa 1: INDICADOR SUTIL
  Badge (punto/numero) en icono de campana
  No interrumpe, no distrae, solo "esta ahi"
      |
      v (clic en campana)
Capa 2: RESUMEN (dropdown/popover)
  Lista de notificaciones recientes con titulo corto + timestamp
  Permite triaje rapido: marcar leido, archivar, clic para ir
      |
      v (clic en "Ver todas" o en una notificacion)
Capa 3: DETALLE COMPLETO
  Pagina de inbox con filtros, agrupacion, busqueda
  O el recurso especifico al que se refiere la notificacion
```

### Por que funciona (psicologia/UX)

- **Carga cognitiva reducida**: Revelar informacion gradualmente previene la sobrecarga
- **Curiosidad controlada**: El badge genera micro-curiosidad, pero no demanda atencion inmediata
- **Agencia del usuario**: El usuario decide cuanto profundizar y cuando
- **Mas de dos niveles degrada la experiencia**: Mantener maximo 2-3 capas de profundidad

### Patrones relacionados

| Patron | Aplicacion a notificaciones |
|---|---|
| **Tooltip/Popover** | Hover sobre badge muestra "3 notificaciones sin leer" sin abrir dropdown |
| **Accordion** | En el inbox, agrupar notificaciones por proyecto/tipo, expandir para ver detalle |
| **Sidebar ocultable** | Panel de notificaciones como sidebar que el usuario abre/cierra |
| **Preview card** | Al hacer hover en una notificacion del dropdown, mostrar preview del contenido |

---

## 11. Informar Sin Interrumpir: Indicadores Ambientales

### Que es el patron

Mecanismos para transmitir informacion de estado o cambios sin interrumpir el flujo de trabajo del usuario. El usuario puede captar la informacion de forma periferica sin desviar su atencion principal.

### Ejemplos de productos

#### Figma: Cursores de presencia
- Muestra cursores y selecciones de todos los participantes activos en un archivo
- Cada persona tiene un color unico y su cursor refleja exactamente donde esta en el canvas
- La sensacion de presencia (ver cursores de colegas moviendose, resaltando objetos) crea conexion, especialmente vital para equipos remotos
- Informacion ambiental: "alguien esta trabajando aqui" sin ningun popup ni alerta

#### Vercel: Status Dot
- Componente Status Dot del Geist Design System para indicar estado de deployment
- Punto de color (verde = live, amarillo = building, rojo = error) junto al nombre del deployment
- Informacion glanceable: el estado se comunica sin texto, sin interrupciones

#### Slack: Indicadores de canal
- Canal en negrita = hay mensajes no leidos
- Canal gris/atenuado = muteado
- Punto verde junto al avatar = usuario online
- Informacion contextual integrada en la UI existente, no superpuesta

#### GitHub: Status checks
- Iconos de estado junto a cada commit en un PR (check verde, X roja, circulo amarillo)
- El CI status se comunica sin alertas ni popups: esta integrado en la interfaz del PR

### Tipos de indicadores ambientales

| Tipo | Ejemplo | Nivel de interrupcion |
|---|---|---|
| **Favicon badge** | Numero en el favicon del tab del navegador | Nulo (periferico) |
| **Title change** | "(3) Mi App - Formaciones" en el titulo del tab | Nulo (periferico) |
| **Status dot** | Punto de color junto a un elemento | Muy bajo |
| **Sidebar badge** | Numero o punto en item de navegacion lateral | Bajo |
| **Progress bar** | Barra de progreso en la parte superior (YouTube, GitHub) | Bajo |
| **Inline status text** | "Guardado automaticamente hace 2 min" en gris claro | Bajo |
| **Cursor de presencia** | Cursor con nombre de usuario (Figma, Google Docs) | Bajo |
| **Borde/highlight** | Borde coloreado en una fila de tabla para indicar estado | Bajo |

### Guia de implementacion

```html
<!-- Favicon con badge (via JavaScript) -->
<link rel="icon" id="favicon" href="/favicon.svg">

<!-- Status dot inline -->
<span class="status-indicator" data-status="active">
  <span class="status-dot" aria-hidden="true"></span>
  <span class="status-label">Activa</span>
</span>

<!-- Auto-save indicator -->
<div class="autosave-indicator" role="status" aria-live="polite">
  <span class="autosave-text">Guardado automaticamente</span>
  <time class="autosave-time" datetime="2026-03-14T10:30:00">hace 2 min</time>
</div>

<!-- Barra de progreso ambiental (estilo YouTube/GitHub) -->
<div class="progress-bar-ambient" role="progressbar"
     aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"
     aria-label="Procesando importacion">
  <div class="progress-bar-fill" style="width: 45%"></div>
</div>
```

```css
/* Status dot con colores semanticos */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

[data-status="active"] .status-dot { background: var(--color-success); }
[data-status="pending"] .status-dot { background: var(--color-warning); }
[data-status="error"] .status-dot { background: var(--color-danger); }
[data-status="inactive"] .status-dot { background: var(--color-muted); }

/* Autosave indicator - extremadamente sutil */
.autosave-indicator {
  color: var(--text-tertiary);
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 300ms ease;
}

.autosave-indicator:hover {
  opacity: 1;
}

/* Progress bar ambiental (estilo nprogress / YouTube) */
.progress-bar-ambient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 9999;
  background: transparent;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 300ms ease;
}
```

```javascript
// Favicon badge dinamico
function updateFaviconBadge(count) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const favicon = document.getElementById('favicon');
  const img = new Image();

  canvas.width = 32;
  canvas.height = 32;

  img.onload = () => {
    ctx.drawImage(img, 0, 0, 32, 32);

    if (count > 0) {
      // Dibujar circulo rojo
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#e53e3e';
      ctx.fill();

      // Dibujar numero
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count > 9 ? '9+' : String(count), 24, 8);
    }

    favicon.href = canvas.toDataURL('image/png');
  };

  img.src = '/favicon-base.svg';
}

// Titulo del tab con conteo
function updateTitleBadge(count) {
  const baseTitle = 'Convocatoria Formaciones';
  document.title = count > 0 ? '(' + count + ') ' + baseTitle : baseTitle;
}
```

---

## 12. Animacion y Movimiento

### Principios de animacion para notificaciones

| Principio | Detalle |
|---|---|
| **Proposito claro** | No animar solo por animar. La animacion debe hacer una intencion clara |
| **Sutileza** | Pocas animaciones bien colocadas > muchas animaciones por doquier |
| **Velocidad** | 300-500ms maximo. Mas lento se siente perezoso |
| **Performance** | Usar `transform` y `opacity` (GPU-accelerated), nunca `margin`, `top`, `left` |
| **Accesibilidad** | Siempre respetar `prefers-reduced-motion` |

### Timing por tipo de animacion

| Animacion | Duracion | Easing |
|---|---|---|
| Toast entrada | 250-350ms | `ease-out` (decelera al llegar) |
| Toast salida | 150-200ms | `ease-in` (acelera al irse) |
| Badge aparicion | 200-300ms | `ease-out` con `scale(0 -> 1)` |
| Dropdown apertura | 150-250ms | `ease-out` |
| Dropdown cierre | 100-200ms | `ease-in` |
| Progress bar | Continua | `linear` |
| Highlight flash | 1500-2000ms | `ease-in-out` (fade in, mantener, fade out) |

### Patron de animacion de entrada para toasts

```css
/* Entrada desde la derecha con micro-bounce */
@keyframes toast-slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  70% {
    transform: translateX(-3%);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Salida suave */
@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Reduccion de movimiento */
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none !important;
    transition: opacity 0ms !important;
  }
}
```

### Patron FLIP para reordenar toasts

Cuando se anade un nuevo toast al stack, los existentes se mueven. El patron FLIP (First, Last, Invert, Play) calcula la diferencia de posicion del contenedor antes y despues del nuevo toast, y anima desde donde estaba hacia donde esta ahora.

```javascript
// Ejemplo simplificado del patron FLIP
function addToastWithFLIP(container, newToast) {
  // FIRST: posiciones actuales
  const existing = [...container.children];
  const firstPositions = existing.map(el => el.getBoundingClientRect());

  // Insertar nuevo toast
  container.prepend(newToast);

  // LAST: nuevas posiciones
  existing.forEach((el, i) => {
    const last = el.getBoundingClientRect();
    const first = firstPositions[i];

    // INVERT: calcular delta
    const deltaY = first.top - last.top;

    // PLAY: animar desde posicion antigua a nueva
    el.animate([
      { transform: 'translateY(' + deltaY + 'px)' },
      { transform: 'translateY(0)' }
    ], {
      duration: 200,
      easing: 'ease-out'
    });
  });
}
```

---

## 13. Persistencia de Notificaciones

### Matriz de persistencia

| Tipo | Persistencia | Donde vive | Ejemplo |
|---|---|---|---|
| **Toast de exito** | Efimero (3-5s) | Solo pantalla, desaparece | "Guardado" |
| **Toast con accion** | Semi-persistente (hasta dismiss) | Pantalla + recordatorio | "Eliminado [Deshacer]" |
| **Inline alert** | Contextual (mientras condicion existe) | Junto al campo/seccion | "La fecha no es valida" |
| **Banner** | Persistente (hasta dismiss o resolucion) | Top de pagina | "Mantenimiento planificado" |
| **Notification center** | Permanente (en inbox) | Centro de notificaciones | Historial de actividad |
| **Modal** | Bloqueante (hasta accion) | Overlay | "Confirmar eliminacion" |

### Principio de complementariedad

Los toasts y el inbox trabajan juntos:
- **Toasts** proporcionan awareness inmediato ("esto acaba de pasar")
- **Inbox** proporciona contexto historico ("esto paso mientras no estabas")

A diferencia de los mensajes efimeros, las notificaciones almacenadas en un centro de notificaciones son persistentes, permitiendo al usuario revisitar informacion cuando la necesite, incluso si no vio el toast original o descarto un push.

### Regla practica

> Si un usuario podria necesitar esta informacion en 5 minutos, deberia estar en el inbox.
> Si es solo confirmacion de "tu accion funciono", un toast efimero es suficiente.

---

## 14. Feedback de Exito: Minimal vs Detallado

### El espectro del feedback de exito

```
SILENCIOSO <-----------------------------------------------> EXPLICITO

Cambio visual  ->  Micro-animacion  ->  Toast breve  ->  Toast detallado  ->  Pagina de exito
(checkbox v)      (icono pulsa)       ("Guardado")     ("3 inscritos")      (resumen + next steps)
```

### Cuando usar cada nivel

#### Nivel 1: Cambio visual puro (sin texto)

**Cuando**: Acciones simples, reversibles, de baja importancia (toggle, checkbox, sort, filter, autosave).

**Ejemplo**: Un checkbox se marca con una micro-animacion. Un toggle cambia de color. El boton de favorito se rellena.

**Por que**: Estas acciones no necesitan lenguaje, solo evidencia de que el sistema respondio.

**Implementacion**: Transicion CSS en el propio elemento (color, scale, opacity).

#### Nivel 2: Toast breve (1-3 palabras)

**Cuando**: Confirmacion de acciones cotidianas exitosas (guardar, copiar, mover).

**Ejemplo**: "Guardado", "Copiado al portapapeles", "Movido a Archivo".

**Por que**: Refuerza la accion sin exigir lectura. Se procesa en <1 segundo.

**Duracion**: 1.5-3 segundos. Desaparece solo.

#### Nivel 3: Toast detallado (oracion corta)

**Cuando**: Acciones con efecto sobre otros usuarios o multiples elementos.

**Ejemplo**: "Encuesta enviada a 23 participantes", "3 formaciones archivadas".

**Por que**: El usuario necesita saber el alcance del efecto, pero no necesita actuar.

**Duracion**: 4-6 segundos.

#### Nivel 4: Toast con accion

**Cuando**: Acciones destructivas reversibles o que el usuario podria querer deshacer.

**Ejemplo**: "Formacion eliminada. [Deshacer]", "Participante removido. [Deshacer]".

**Por que**: Reduce ansiedad, proporciona red de seguridad.

**Duracion**: Hasta dismiss manual o timeout largo (8-10s).

#### Nivel 5: Pagina/modal de confirmacion

**Cuando**: Acciones con permanencia, sensibilidad, o que requieren next steps.

**Ejemplo**: Pagina de exito tras completar un wizard de creacion de formacion con resumen y botones "Ver formacion" / "Crear otra".

**Por que**: La accion fue significativa y el usuario necesita orientacion sobre que hacer despues.

### Anti-patron: sobre-confirmar

> Sobre-confirmar diluye el feedback y entrena al usuario a ignorar los mensajes. Si cada clic genera un mensaje, los usuarios empiezan a escanear por encima. Cuando surge un problema real, la alerta se pierde. Cada dialogo adicional impone un coste temporal, aumentando la carga cognitiva y alargando el tiempo de completar la tarea.

**Regla**: El punto del buen diseno no es maximizar la informacion, sino **minimizar la incertidumbre**.

---

## 15. Estado Vacio de Notificaciones

### Que es el patron

La pantalla que se muestra cuando el inbox o centro de notificaciones no tiene elementos pendientes. Transforma un momento potencialmente frustrante ("no hay nada aqui") en una experiencia positiva.

### Por que importa

Sin un estado vacio bien disenado, los usuarios se topan con una pantalla en blanco que puede frustrar, generar confusion ("esta roto?"), o reducir el engagement.

### Elementos del diseno

| Elemento | Proposito | Ejemplo |
|---|---|---|
| **Ilustracion** | Humanizar el momento, generar conexion emocional | Icono de check, ilustracion celebratoria |
| **Titulo positivo** | Refuerzo positivo, sensacion de logro | "Estas al dia!" |
| **Subtexto** | Contexto adicional, reducir incertidumbre | "No tienes notificaciones nuevas" |
| **CTA opcional** | Orientar al usuario hacia siguiente accion | "Revisar formaciones activas" |

### Ejemplos de productos

| Producto | Mensaje | Estilo |
|---|---|---|
| **Gmail** | "Ya leiste todo" + icono de sol | Celebratorio minimalista |
| **GitHub** | "All caught up!" + icono de check | Limpio, directo |
| **Slack** | "You're all caught up" + ilustracion relajante | Amigable, informal |
| **Linear** | Panel vacio limpio con texto sutil | Ultra-minimal |

### Guia de implementacion

```html
<div class="empty-state" role="status">
  <div class="empty-state-illustration" aria-hidden="true">
    <svg><!-- ilustracion simple: check en circulo --></svg>
  </div>
  <h3 class="empty-state-title">Estas al dia</h3>
  <p class="empty-state-description">
    No tienes notificaciones pendientes. Buen trabajo.
  </p>
  <a href="/formaciones" class="empty-state-cta">
    Ver formaciones activas
  </a>
</div>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state-illustration {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.empty-state-description {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.empty-state-cta {
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
}

.empty-state-cta:hover {
  text-decoration: underline;
}
```

---

## 16. Accesibilidad para Notificaciones

### WCAG 4.1.3: Status Messages (Nivel AA)

Los mensajes de estado deben poder ser determinados programaticamente a traves de roles o propiedades, de forma que puedan ser presentados al usuario por tecnologias asistivas **sin recibir foco**.

### ARIA Live Regions

Las live regions son regiones de una pagina web que anuncian actualizaciones dinamicas a su contenido cuando la atencion del usuario y el foco del sistema estan en otro lugar.

#### Niveles de cortesia

| Nivel | Atributo | Comportamiento | Cuando usar |
|---|---|---|---|
| **Polite** | `aria-live="polite"` | Se anuncia cuando el screen reader termina la frase actual o el usuario pausa de escribir | **La mayoria del tiempo**. Toasts informativos, confirmaciones de exito |
| **Assertive** | `aria-live="assertive"` | Interrumpe inmediatamente el anuncio actual | **Solo para criticos/urgentes**. Errores de sesion, timeouts, perdida de datos |
| **Off** | `aria-live="off"` | No se anuncia | Contenido que cambia frecuentemente y no necesita anuncio |

#### role="status" vs role="alert"

| Role | aria-live implicito | Uso |
|---|---|---|
| `role="status"` | `polite` | Toasts de exito, actualizaciones de estado, confirmaciones |
| `role="alert"` | `assertive` | Errores criticos, warnings urgentes |

### Implementacion correcta

```html
<!-- CORRECTO: Contenedor vacio en el DOM, se llena dinamicamente -->
<div aria-live="polite" class="sr-toast-region">
  <!-- Se inserta el mensaje aqui cuando aparece un toast -->
</div>

<!-- CORRECTO: Usar <output> para toasts -->
<output role="status" class="toast">
  Formacion guardada correctamente
</output>

<!-- CORRECTO: Alert para errores criticos -->
<div role="alert" class="inline-alert error">
  Error: No se pudo guardar. Verifica tu conexion.
</div>

<!-- INCORRECTO: No usar aria-live="assertive" para todo -->
<!-- INCORRECTO: No usar toasts con elementos interactivos complejos -->
```

### Problemas de accesibilidad con toasts interactivos

Los toasts que contienen elementos interactivos son problematicos porque generan problemas de usabilidad y accesibilidad para usuarios de screen reader. Razones:
- El toast no recibe foco, asi que los botones dentro de el no son accesibles via teclado
- El toast desaparece antes de que el usuario pueda navegar hasta el
- Si se mueve el foco al toast, se interrumpe el flujo de trabajo del usuario

**Solucion**: Si un toast tiene acciones (como "Deshacer"), asegurar que:
1. El toast NO desaparezca automaticamente mientras tiene foco
2. El boton de accion sea alcanzable via Tab
3. La accion tambien este disponible en otro lugar (ej: en el inbox)

### ariaNotify() API (emergente, 2025-2026)

Nueva API imperativa propuesta como alternativa a las ARIA live regions:

```javascript
// Nuevo API (actualmente en origin trial en Edge)
element.ariaNotify('Formacion guardada', {
  priority: 'none'    // equivale a aria-live="polite"
});

element.ariaNotify('Error critico: sesion expirada', {
  priority: 'important'  // equivale a aria-live="assertive"
});
```

**Ventaja sobre live regions**: Las live regions solo pueden hacer anuncios tras cambios al DOM, mientras que `ariaNotify()` puede hacer anuncios en cualquier momento, sin necesidad de un elemento en el DOM.

**Estado actual**: Solo soportado como origin trial en Microsoft Edge. Probado exitosamente con NVDA y JAWS.

### Gestion de foco

| Situacion | Comportamiento de foco |
|---|---|
| Toast informativo | NO mover foco. Solo anunciar via live region |
| Modal de confirmacion | Mover foco al modal. Trampa de foco activa. Al cerrar, devolver foco al elemento que lo abrio |
| Inline alert de error | Mover foco al primer campo con error, o al mensaje de error |
| Banner | NO mover foco. Anunciar via live region. El banner debe ser alcanzable via Tab |

### Checklist de accesibilidad para notificaciones

- [ ] Todos los toasts usan `role="status"` o estan dentro de un `aria-live="polite"` region
- [ ] Los errores criticos usan `role="alert"` (aria-live="assertive")
- [ ] Los toasts con acciones no desaparecen si tienen foco
- [ ] Los modales implementan trampa de foco y devolucion de foco al cerrar
- [ ] Se respeta `prefers-reduced-motion` para todas las animaciones
- [ ] Los badges tienen texto alternativo (aria-label en el boton padre)
- [ ] Los iconos decorativos usan `aria-hidden="true"`
- [ ] El boton de cerrar del toast tiene `aria-label="Cerrar notificacion"`
- [ ] El empty state tiene `role="status"` para anunciar cuando se alcanza
- [ ] Los colores de severidad NO son el unico indicador (usar iconos + texto ademas)

---

## 17. Codificacion Cromatica Semantica

### Sistema estandar de colores para notificaciones

Los colores semanticos etiquetan colores basados en su funcion (ej: "error", "exito", "warning") en lugar de su nombre visual ("rojo", "verde"). Esto proporciona consistencia y escalabilidad.

| Color | Semantica | Token CSS | Uso en notificaciones |
|---|---|---|---|
| **Rojo** | Peligro / Error / Critico | `--color-danger` | Errores, acciones destructivas, alertas criticas |
| **Ambar/Naranja** | Advertencia / Precaucion | `--color-warning` | Warnings, degradacion de servicio, acciones con riesgo |
| **Verde** | Exito / Positivo / Resuelto | `--color-success` | Confirmaciones de exito, estados resueltos, completados |
| **Azul** | Informativo / Neutral | `--color-info` | Mensajes informativos, tips, actualizaciones neutrales |
| **Gris** | Inactivo / Deshabilitado | `--color-muted` | Notificaciones leidas, estados inactivos |

### Regla critica de accesibilidad

> Los colores **nunca deben ser el unico canal** de comunicacion. Siempre combinar color + icono + texto. Un usuario daltonico debe poder distinguir un error de un exito sin ver color.

### Implementacion con tokens CSS

```css
:root {
  /* Colores semanticos para notificaciones */
  --color-danger: #e53e3e;
  --color-danger-bg: #fff5f5;
  --color-danger-border: #fc8181;

  --color-warning: #dd6b20;
  --color-warning-bg: #fffaf0;
  --color-warning-border: #fbd38d;

  --color-success: #38a169;
  --color-success-bg: #f0fff4;
  --color-success-border: #9ae6b4;

  --color-info: #3182ce;
  --color-info-bg: #ebf8ff;
  --color-info-border: #90cdf4;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  :root {
    --color-danger: #fc8181;
    --color-danger-bg: #1a0000;
    --color-danger-border: #e53e3e;

    --color-warning: #fbd38d;
    --color-warning-bg: #1a0f00;
    --color-warning-border: #dd6b20;

    --color-success: #9ae6b4;
    --color-success-bg: #001a0a;
    --color-success-border: #38a169;

    --color-info: #90cdf4;
    --color-info-bg: #001a33;
    --color-info-border: #3182ce;
  }
}
```

---

## 18. Recomendaciones de Implementacion para Nuestra App

### Diagnostico del problema

El usuario ha reportado que las alertas proactivas son "invasivas y hacen que la herramienta sea desagradable de usar." Esto indica probablemente una combinacion de:
1. **Sobre-notificacion**: Se notifica demasiado, sin filtro de relevancia
2. **Tipo incorrecto**: Se usan modales o banners para cosas que deberian ser toasts o indicadores silenciosos
3. **Sin control del usuario**: El usuario no puede ajustar que recibe ni como
4. **Sin gradacion de severidad**: Todo tiene el mismo nivel de urgencia visual

### Plan de accion recomendado

#### Fase 1: Reducir la invasividad inmediata

| Accion | Impacto | Esfuerzo |
|---|---|---|
| Reemplazar modales de confirmacion trivial por toasts efimeros | Alto | Bajo |
| Reducir duracion de toasts de exito a 2-3 segundos | Alto | Bajo |
| Implementar `prefers-reduced-motion` en todas las animaciones | Medio | Bajo |
| Eliminar sonidos de notificacion si existen | Alto | Bajo |
| Mover toasts a esquina inferior (fuera del area de trabajo) | Medio | Bajo |

#### Fase 2: Implementar feedback gradual

| Accion | Impacto | Esfuerzo |
|---|---|---|
| Clasificar todas las notificaciones existentes por severidad (alta/media/baja) | Alto | Medio |
| Implementar 4 tipos: inline alert, toast, banner, modal (con decision framework) | Alto | Medio |
| Reemplazar confirmaciones de "guardado" por indicador ambiental ("Guardado automaticamente") | Alto | Bajo |
| Anadir indicadores de estado inline (status dots) en tablas y listas | Medio | Medio |

#### Fase 3: Notification Center

| Accion | Impacto | Esfuerzo |
|---|---|---|
| Implementar icono campana con badge (dot para v1) | Alto | Medio |
| Crear dropdown de notificaciones con lista cronologica | Alto | Alto |
| Implementar "Marcar como leido" y "Marcar todo como leido" | Medio | Medio |
| Empty state: "Estas al dia" con ilustracion | Bajo | Bajo |

#### Fase 4: Control del usuario

| Accion | Impacto | Esfuerzo |
|---|---|---|
| Implementar panel de preferencias con 3 modos (Calma / Regular / Todo) | Alto | Medio |
| Anadir configuracion avanzada per-tipo per-canal | Medio | Alto |
| Implementar "Pausar notificaciones" con timer | Medio | Medio |

### Principio rector

> **Cada notificacion que le mostramos al usuario tiene un coste de atencion. Si no aporta valor al usuario en ESE momento, nos esta costando confianza. Menos es mas. El silencio tambien comunica.**

---

## Fuentes

### Articulos y guias
- [Design Guidelines For Better Notifications UX - Smashing Magazine](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/)
- [Notification Pattern - Carbon Design System](https://carbondesignsystem.com/patterns/notification-pattern/)
- [A Comprehensive Guide to Notification Design - Toptal](https://www.toptal.com/designers/ux/notification-design)
- [What is a toast notification? Best practices for UX - LogRocket](https://blog.logrocket.com/ux-design/toast-notifications/)
- [Best Practices for Notifications UI Design - SetProduct](https://www.setproduct.com/blog/notifications-ui-design)
- [Notification UX: How To Design For A Better Experience - UserPilot](https://userpilot.com/blog/notification-ux/)
- [Notification design: Practical dos and don'ts - Webflow](https://webflow.com/blog/notification-ux)
- [The 3 Types of Alerts and How to Use Them - UX Movement](https://uxmovement.com/forms/the-3-types-of-alerts-and-how-to-use-them-correctly/)
- [Alert Design Guidelines - PatternFly](https://www.patternfly.org/components/alert/design-guidelines/)
- [Alert Guidelines - Red Hat Design System](https://ux.redhat.com/elements/alert/guidelines/)
- [Success Message UX - Pencil & Paper](https://www.pencilandpaper.io/articles/success-ux)
- [Success States: Confirmation Patterns - Design Systems Collective](https://www.designsystemscollective.com/designing-success-part-2-dos-don-ts-and-use-cases-of-confirmation-patterns-6e760ccd1708)

### Design Systems
- [Geist Design System (Vercel) - Toast](https://vercel.com/geist/toast)
- [Geist Design System (Vercel) - Status Dot](https://vercel.com/geist/status-dot)
- [Carbon Design System - Notification Usage](https://carbondesignsystem.com/components/notification/usage/)
- [Toast - Radix Primitives](https://www.radix-ui.com/primitives/docs/components/toast)
- [Toast - GitLab Pajamas Design System](https://design.gitlab.com/components/toast/)
- [Toast - Fluent 2 Design System (Microsoft)](https://fluent2.microsoft.design/components/web/react/core/toast/usage)
- [Building a Toast Component - web.dev](https://web.dev/articles/building/a-toast-component)

### Accesibilidad
- [Accessible Notifications with ARIA Live Regions (Part 1) - Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)
- [Accessible Notifications with ARIA Live Regions (Part 2) - Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/)
- [ARIA22: Using role=status - W3C/WAI](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22)
- [ARIA Notify API - WICG](https://wicg.github.io/aom/notification-api.html)
- [Element.ariaNotify() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaNotify)
- [Design Accessible Animation - Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)

### Sistemas de notificacion y arquitectura
- [Notification System Design: Architecture & Best Practices - MagicBell](https://www.magicbell.com/blog/notification-system-design)
- [How Slack Builds Smart Notification Systems - Courier](https://www.courier.com/blog/how-slack-builds-smart-notification-systems-users-want)
- [Batching & Digest Best Practices - SuprSend](https://docs.suprsend.com/docs/best-practices-for-batching-digest)
- [The Ultimate Guide to Notification Preferences - SuprSend](https://www.suprsend.com/post/the-ultimate-guide-to-perfecting-notification-preferences-putting-your-users-in-control)
- [How to Build a Notification Center - Courier](https://www.courier.com/blog/how-to-build-a-notification-center-for-web-and-mobile-apps)

### Patrones de productos especificos
- [GitHub Notifications - Managing from Inbox](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox)
- [GitHub Notifications - Inbox Filters](https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters)
- [Slack Notification Settings - Complete Guide](https://thread-patrol.com/blog/complete-guide-slack-notification-settings)
- [Figma Notification Preferences](https://help.figma.com/hc/en-us/articles/360039813234-Manage-your-notification-preferences)
- [Figma Multiplayer Editing](https://www.figma.com/blog/multiplayer-editing-in-figma/)
- [Linear Design: The SaaS Design Trend - LogRocket](https://blog.logrocket.com/ux-design/linear-design/)
- [Intercom Smart Notifications - Medium](https://medium.com/@intercom/designing-smart-notifications-36336b9c58fb)

### Badges y estados vacios
- [Badge UI Design - SetProduct](https://www.setproduct.com/blog/badge-ui-design)
- [Badge UI Design - Cieden](https://cieden.com/book/atoms/badge/badge-ui-design)
- [Empty State UI Pattern - Mobbin](https://mobbin.com/glossary/empty-state)
- [Semantic Colors in UI/UX Design - Medium](https://medium.com/@zaimasri92/semantic-colors-in-ui-ux-design-a-beginners-guide-to-functional-color-systems-cc51cf79ac5a)
- [Status System - Astro UXDS](https://www.astrouxds.com/patterns/status-system/)

### Animacion y movimiento
- [Motion Design and Micro-Interactions 2025 - Seven Koncepts](https://sevenkoncepts.com/blog/motion-design-and-micro-interactions/)
- [CSS Transitions Interactive Guide - Josh W. Comeau](https://www.joshwcomeau.com/animation/css-transitions/)
- [Create CSS Toast Notifications - Frontend Hero](https://frontend-hero.com/how-to-create-toast-notification)
