# Encuesta de satisfacción automática — Design Spec

**Fecha**: 2026-03-12
**Estado**: Aprobado
**Archivo objetivo**: `convocatoria.html` (self-contained, single file)

---

## 1. Objetivo

Enviar automáticamente una encuesta de satisfacción a los participantes de una formación en el momento exacto en que esta finaliza, sin intervención manual post-formación. La encuesta se programa al crear la convocatoria y se entrega mediante Power Automate + Microsoft Forms.

## 2. Arquitectura

Tres piezas:

| Pieza | Descripción |
|-------|-------------|
| **Panel de ajustes global** | Dialog con configuración persistente (URLs) |
| **Integración en Tab 1** | Checkbox + lógica de envío al procesar la cola |
| **Power Automate (externo)** | Flujo que recibe el POST y envía el email programado |

### Dependencias externas

- **Microsoft Forms** — Formulario reutilizable (ya disponible con licencia M365)
- **Power Automate** — Flujo HTTP trigger → delay → send email (ya disponible con licencia M365)

## 3. Panel de ajustes global

### 3.1 Acceso

Icono ⚙ en la barra superior de la aplicación, junto al nombre. Abre un dialog (`dialog-overlay` + `dialog-box`).

### 3.2 Campos

| Campo | Tipo | Validación |
|-------|------|-----------|
| URL webhook Power Automate | Input texto | Requerido, debe empezar por `https://` |
| URL formulario Microsoft Forms | Input texto | Requerido, debe empezar por `https://` |

### 3.3 Persistencia

- `localStorage` clave `convocatoria_settings`
- Estructura: `{ webhookUrl: "https://...", formsUrl: "https://..." }`
- Se guarda al pulsar "Guardar" con validación previa

### 3.4 Comportamiento

- Si la usuaria activa el checkbox de encuesta en Tab 1 pero no ha configurado los ajustes → toast de advertencia con enlace directo al panel de ajustes
- Botón "Ver instrucciones de configuración" dentro del panel → abre un dialog con los pasos para crear el flujo de Power Automate (incluido el esquema JSON del trigger)

## 4. Integración en Tab 1 (Convocatoria)

### 4.1 UI

En la sección "3. Datos del evento" del panel izquierdo, nuevo checkbox al final:

> ☐ Enviar encuesta de satisfacción al finalizar

- Activado por defecto
- Se guarda en `convocatoria_state` como campo `sendSurvey` (booleano)
- **Migración**: si `convocatoria_state` existe en localStorage pero no contiene el campo `sendSurvey`, se asume `true` (activado por defecto, coherente con el comportamiento para usuarios nuevos)

### 4.2 Flujo al procesar la cola

1. Se genera la convocatoria Outlook (como hasta ahora, sin cambios)
2. Si el checkbox está activo:
   a. Validar que `convocatoria_settings` tiene ambas URLs configuradas
   b. Construir el payload JSON (ver §4.3)
   c. `fetch()` POST al webhook con `Content-Type: application/json`
   d. Si el `fetch()` resuelve (no lanza excepción) → toast de confirmación: "Encuesta programada para las HH:MM". Nota: con `mode: 'no-cors'` la respuesta es opaca, por lo que no se puede verificar el status HTTP. Se asume éxito si la promesa resuelve (fire-and-forget)
   e. Si el `fetch()` rechaza (excepción de red: host unreachable, sin conexión) → toast de error: "No se pudo conectar con Power Automate. Verifica tu conexión y la URL del webhook". La convocatoria ya se procesó; solo falla la encuesta

### 4.3 Payload JSON

```json
{
  "to": ["email1@empresa.com", "email2@empresa.com"],
  "subject": "Tu opinión sobre la formación «Liderazgo»",
  "body": "<html>...cuerpo del email en HTML...</html>",
  "scheduledTime": "2026-03-15T13:30:00.000Z"
}
```

- `to`: array de emails de los asistentes seleccionados
- `subject`: "Tu opinión sobre la formación «{nombre del evento}»"
- `body`: HTML del email (ver §5)
- `scheduledTime`: fecha del evento + hora de fin de la sesión, formato ISO 8601 en UTC. Se construye con `new Date(fechaEvento + 'T' + horaFin).toISOString()` (genera `2026-03-15T13:30:00.000Z`). Power Automate interpreta correctamente timestamps UTC

### 4.4 Cálculo de `scheduledTime`

La hora de fin se obtiene del campo "Hora fin" ya existente en la sección "3. Datos del evento" de Tab 1. Si el evento tiene múltiples sesiones en la cola, cada sesión genera su propio POST con su propia `scheduledTime` correspondiente a la hora de fin de esa sesión concreta.

Zona horaria: `new Date(fechaEvento + 'T' + horaFin)` parsea la cadena como hora local del navegador; `.toISOString()` la convierte a UTC automáticamente.

## 5. Contenido del email

### 5.1 Asunto

> Tu opinión sobre la formación «{nombre del evento}»

### 5.2 Cuerpo

> Hola,
>
> Has participado en la formación **{nombre del evento}**, impartida por **{formador}** el **{fecha}** (formato: "15 de marzo de 2026").
>
> Nos gustaría conocer tu valoración. Son solo 6 preguntas (menos de 2 minutos):
>
> **[Completar encuesta]** ← enlace al Forms con parámetros de contexto
>
> Gracias por tu tiempo.

### 5.3 Parámetros del enlace Forms

La URL del formulario se complementa con query params para pre-rellenar campos de contexto:

```
{formsUrl}?accion={encodeURIComponent(nombre del evento)}&fecha={encodeURIComponent(fecha)}&formador={encodeURIComponent(formador)}
```

Estos campos aparecen como ocultos o de solo lectura en el formulario, permitiendo filtrar las respuestas por acción formativa.

## 6. Encuesta de satisfacción (Microsoft Forms)

### 6.1 Instrucción de escala

> Valora de 1 (muy insatisfecho) a 10 (excelente)

### 6.2 Preguntas

| # | Pregunta | Tipo | Escala |
|---|----------|------|--------|
| 1 | Valoración general de la formación recibida | Valoración | 1-10 |
| 2 | Aplicabilidad de los contenidos a tu puesto de trabajo | Valoración | 1-10 |
| 3 | Valoración del formador o formadora | Valoración | 1-10 |
| 4 | Calidad de los materiales y contenidos | Valoración | 1-10 |
| 5 | Organización y logística de la formación | Valoración | 1-10 |
| 6 | Comentarios o sugerencias de mejora | Texto libre | — |

### 6.3 Campos de contexto (pre-rellenados vía URL)

| Campo | Origen |
|-------|--------|
| Nombre de la acción formativa | Datos del evento (Tab 1) o catálogo (Tab 2) |
| Fecha | Datos del evento |
| Formador | Datos del evento |

## 7. Flujo Power Automate

### 7.1 Configuración (una sola vez)

1. **Trigger:** "Cuando se recibe una solicitud HTTP" (POST)
2. **Esquema JSON del trigger:**
   ```json
   {
     "type": "object",
     "properties": {
       "to": { "type": "array", "items": { "type": "string" } },
       "subject": { "type": "string" },
       "body": { "type": "string" },
       "scheduledTime": { "type": "string" }
     }
   }
   ```
3. **Acción:** "Retrasar hasta" → `scheduledTime`
4. **Acción:** "Enviar un correo electrónico (V2)" → `to`, `subject`, `body` (HTML activado)

### 7.2 Instrucciones integradas

La herramienta incluye un botón "Ver instrucciones de configuración" en el panel de ajustes que muestra un dialog (`dialog-overlay` + `dialog-box`, scrollable) con:

**Contenido del dialog de instrucciones:**

1. **Título:** "Configurar flujo de Power Automate"
2. **Paso 1:** "Abre Power Automate (make.powerautomate.com) e inicia sesión con tu cuenta corporativa"
3. **Paso 2:** "Crea un nuevo flujo → Flujo de nube automatizado → En blanco"
4. **Paso 3:** "Añade el trigger «Cuando se recibe una solicitud HTTP». En el campo «Esquema JSON del cuerpo de la solicitud», pega el siguiente esquema:" + bloque `<pre><code>` con el JSON de §7.1 + botón "Copiar" que ejecuta `navigator.clipboard.writeText()`
5. **Paso 4:** "Añade la acción «Retrasar hasta». En el campo «Marca de tiempo», selecciona el campo dinámico `scheduledTime`"
6. **Paso 5:** "Añade la acción «Enviar un correo electrónico (V2)». En «Para», selecciona el campo dinámico `to`. En «Asunto», selecciona `subject`. En «Cuerpo», selecciona `body` y activa la vista HTML"
7. **Paso 6:** "Guarda el flujo. Copia la URL del trigger HTTP que aparece en el paso 1 del flujo y pégala en el campo «URL webhook» de esta pantalla"
8. **Botón "Cerrar"**

## 8. Restricciones técnicas

- Todo en un solo fichero `convocatoria.html`
- Design system: Indigo-600 + Slate + Inter, variables CSS
- `localStorage` para persistencia de ajustes
- `fetch()` para POST al webhook (navegador moderno, sin polyfills). Usar `mode: 'no-cors'` ya que los webhooks HTTP de Power Automate no devuelven cabeceras CORS para orígenes arbitrarios. En modo `no-cors`, la respuesta es opaca (no se puede leer el status), por lo que se asume éxito si el `fetch()` no lanza excepción. El flujo de Power Automate es fire-and-forget desde el punto de vista de la herramienta
- Sin cambios en el estado existente de convocatoria (snapshot, queue, presets) salvo añadir el campo del checkbox
- `esc()` para sanitizar valores en HTML del email (prevención XSS)
- `dialog-overlay` + `dialog-box` para modales (nunca `alert`/`prompt`/`confirm`)
- `showToast()` para notificaciones
- Nueva clave `localStorage`: `convocatoria_settings` (ya añadida a CLAUDE.md)
