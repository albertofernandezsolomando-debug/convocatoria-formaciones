# Catálogos FUNDAE + Generación XML — Design Spec

**Fecha**: 2026-03-12
**Estado**: Draft
**Archivo objetivo**: `convocatoria.html` (self-contained, single file)

---

## 1. Objetivo

Eliminar la entrada manual de datos FUNDAE añadiendo:
- Catálogos persistentes (proveedores, centros, tutores, acciones formativas) alimentados por Excel
- Generación de XML combinando catálogos + datos de participantes del organigrama
- Vinculación de participantes a acciones formativas para simplificar convocatorias y XMLs

## 2. Arquitectura: 3 pestañas

| Tab | Contenido |
|-----|-----------|
| **Convocatoria** (existente) | Carga organigrama, filtros, selección asistentes, datos evento, invitaciones Outlook, cola |
| **Catálogos FUNDAE** (nuevo) | Gestión de proveedores, centros, tutores, acciones formativas |
| **Generar XML FUNDAE** (nuevo) | Selecciona acción + grupo + participantes → genera 3 XMLs conformes a XSD |

## 3. Catálogos FUNDAE (Tab 2)

### 3.1 Layout

Split panel (igual que Tab 1):
- **Panel izquierdo**: lista del catálogo seleccionado con buscador
- **Panel derecho**: formulario de edición/creación del registro seleccionado
- **Selector superior**: 4 botones/tabs para cambiar entre catálogos

### 3.2 Catálogo de Proveedores

Campos:
- CIF (clave primaria)
- Razón social
- Dirección, CP, Localidad, Provincia
- Teléfono contacto
- Email contacto
- Responsable formación

### 3.3 Catálogo de Centros

Campos:
- Tipo documento centro (CIF/NIF)
- Documento centro (clave primaria)
- Nombre centro
- Dirección, CP, Localidad, Provincia
- **Acciones formativas vinculadas** (solo lectura, lista derivada de las acciones que referencian este centro)

### 3.4 Catálogo de Tutores

Campos:
- Tipo documento tutor (NIF/NIE/Pasaporte)
- Documento tutor (clave primaria)
- Nombre, Apellido 1, Apellido 2
- Teléfono, Email
- Horas dedicación (por defecto)
- **Acciones formativas vinculadas** (solo lectura, lista derivada de las acciones que referencian este tutor)

### 3.5 Catálogo de Acciones Formativas

Campos:
- Código acción (1-5 dígitos, clave primaria)
- Nombre acción (max 255 chars)
- Código grupo acción (formato NNN-NN numérico, e.g. "087-06")
- Área profesional (desplegable con ~100 códigos FUNDAE)
- Modalidad: Presencial | Teleformación | Mixta
- Horas presenciales, Horas teleformación (según modalidad)
- Nivel formación: Básico (0) | Superior (1)
- Objetivos (texto libre)
- Contenidos (texto libre)
- Datos plataforma (si teleformación/mixta): CIF, razón social, URI, usuario, password (nota: password en texto plano en localStorage — riesgo aceptado por ser herramienta local, requerido por el XSD)
- Centro vinculado (desplegable del catálogo de centros)
- Tutor vinculado (desplegable del catálogo de tutores)
- **Participantes vinculados** (array de NIFs del organigrama)

### 3.6 Ingesta por Excel

Cada catálogo tiene:
- **Botón "Descargar plantilla"**: genera .xlsx con cabeceras correctas y validaciones
- **Botón "Importar Excel"**: lee .xlsx, valida, y hace merge (upsert por clave primaria)
- Merge: registros existentes se actualizan, nuevos se añaden, ninguno se borra
- **Validación**: filas válidas se importan, filas con errores se muestran en un resumen indicando fila y campo con error. Ningún registro existente se modifica si la fila que lo actualiza tiene errores

### 3.7 Persistencia

- `localStorage` con claves: `fundae_proveedores`, `fundae_centros`, `fundae_tutores`, `fundae_acciones`
- Exportar/importar JSON completo (backup de todos los catálogos en un solo fichero)
- Integridad referencial: al borrar un centro o tutor, avisar si está referenciado por alguna acción formativa. Al borrar una acción formativa, sus referencias a centro/tutor se eliminan automáticamente

## 4. Columnas ampliadas del organigrama

Añadir columnas en un nuevo array `FUNDAE_COLUMNS` (separado de `RELEVANT_COLUMNS`). Estas columnas son **opcionales**: si faltan en el organigrama, se ignoran sin error (a diferencia de `RELEVANT_COLUMNS` que son obligatorias). Los datos simplemente quedan vacíos y se completan manualmente en Tab 3.

```javascript
const FUNDAE_COLUMNS = [
  'Móvil trabajo (largo)', 'Teléfono personal',
  'Nombre', 'Apellidos',
  'Numero Seguridad Social', 'Sexo',
  'DiscapacidadContrib',
  'Categoría profesional',  // ← contiene nivel estudios (columnas cruzadas)
  'Titulación',             // ← contiene categoría profesional (columnas cruzadas)
  'Grupo Cotización',
  'Coste Salarial Hora', 'Coste aproximado SS',
  'CIF'
];
```

`Nombre` [65] y `Apellidos` [66] existen como columnas separadas en el organigrama (verificado).

**Constantes de alias** para evitar confusión con las columnas cruzadas:

```javascript
const COL_NIVEL_ESTUDIOS = 'Categoría profesional';   // nombre real en el Excel
const COL_CATEGORIA_PROF = 'Titulación';               // nombre real en el Excel
```

## 5. Mapeo Organigrama → campos FUNDAE

### 5.1 Campos directos

| Campo FUNDAE XML | Columna Organigrama | Transformación |
|------------------|---------------------|----------------|
| `nif` | `NIF` | Directa |
| `N_TIPO_DOCUMENTO` | `NIF` | Si empieza por X/Y/Z → 60 (NIE), si no → 10 (NIF) |
| `email` | `Email trabajo` | Directa |
| `telefono` | `Móvil trabajo (largo)` | Directa (fallback: `Teléfono personal`) |
| `Grupo Cotización` | `Grupo Cotización` | Directa (ya numérico 1-11) |
| `discapacidad` | `DiscapacidadContrib` | Booleano |
| `Coste Salarial Hora` | `Coste Salarial Hora` | Directa |
| `Coste SS` | `Coste aproximado SS` | Directa |
| `CIF empresa` | `CIF` | Directa |

### 5.2 Campos mapeados

**"Titulación" del organigrama → `categoriaprofesional` FUNDAE (1-5):**

| Valor organigrama | Código FUNDAE |
|---|---|
| Directivo | 1 |
| Mando Intermedio | 2 |
| Técnico | 3 |
| Trabajador Cualificado | 4 |
| Trabajador NO cualificado | 5 |

**"Categoría profesional" del organigrama → `nivelestudios` FUNDAE (1-10):**

Valores presentes actualmente en el organigrama (verificado con datos reales):

| Valor organigrama | Código FUNDAE |
|---|---|
| Segunda etapa de Educación Secundaria (Bachillerato, FP de grado medio, BUP, FPI y FPII) | 4 |
| Técnico Superior / FP grado superior y equivalentes | 6 |
| E. Universitarios 1º Ciclo (Diplomatura y grados) | 7 |

Si en futuro aparecen nuevos valores, el mapeo soporta los 10 niveles FUNDAE:

| Código | Descripción |
|---|---|
| 1 | Menos que primaria |
| 2 | Educación primaria |
| 3 | Primera etapa de educación secundaria (ESO, EGB) |
| 4 | Segunda etapa de educación secundaria (Bachillerato, FP medio) |
| 5 | Educación postsecundaria no superior (Cert. Profesionalidad niv.3) |
| 6 | Técnico Superior / FP grado superior |
| 7 | E. universitarios 1º ciclo (Diplomatura, Grados) |
| 8 | E. universitarios 2º ciclo (Licenciatura, Máster) |
| 9 | E. universitarios 3º ciclo (Doctorado) |
| 10 | Otras titulaciones |

**Fallback**: si un valor del organigrama no tiene match en la tabla, el campo queda vacío y se marca en rojo en Tab 3 para resolución manual.

### 5.3 Campos manuales

| Campo FUNDAE | Origen |
|---|---|
| `DiplomaAcreditativo` (S/N) | Manual en Tab 3, por participante o masivo |

### 5.4 Prioridad de valores

El valor mapeado automáticamente del organigrama es el **default**. La edición manual en la tabla de Tab 3 **prevalece**. Los valores editados se mantienen por participante (no globalmente).

## 6. Pestaña Generar XML FUNDAE (Tab 3)

### 6.1 Flujo de uso

1. Seleccionar Acción Formativa → desplegable del catálogo
2. Asignar número de Grupo → auto-incremental o manual
3. Participantes pre-cargados de la acción (si vinculados) o seleccionar de Tab 1
4. Tabla editable de participantes con todos los campos FUNDAE
5. Completar datos faltantes (marcados en rojo si no mapeados)
6. Generar XML → 3 botones (Acciones Formativas, Inicio Grupo, Finalización)

### 6.2 Tabla de participantes

| Columna | Origen | Editable |
|---------|--------|----------|
| Empleado | Organigrama | No |
| NIF | Organigrama | No |
| Tipo Doc | Auto (NIF/NIE) | Sí |
| Email | Organigrama | Sí |
| Teléfono | Organigrama | Sí |
| Cat. Profesional (1-5) | Mapeado de "Titulación" | Sí |
| Nivel Estudios (1-10) | Mapeado de "Categoría profesional" | Sí |
| Grupo Cotización (1-11) | Organigrama directo | Sí |
| Diploma (S/N) | Manual | Sí |
| Coste Hora | Organigrama | Sí |
| Discapacidad | Organigrama | Sí |

### 6.3 Cabecera del grupo

Datos pre-rellenados del catálogo de la acción seleccionada (centro y tutor vinculados son **defaults** que se pueden sobreescribir aquí):
- Centro de impartición (desplegable centros, pre-selecciona el vinculado a la acción)
- Tutor (desplegable tutores, pre-selecciona el vinculado a la acción)
- Fechas inicio/fin, horario, calendario (campos manuales o de convocatoria Tab 1)

### 6.4 XMLs generados

Los 3 XMLs conformes a XSD 2025 (ya implementados, se alimentan con datos nuevos):
- `AccionesFormativas` → AAFF_Inicio.xsd
- `InicioGrupos` → InicioGrupos_Bonificada.xsd
- `FinalizacionGrupo` → FinalizacionGrupo_Bonificada.xsd

## 7. Vinculación participantes ↔ acciones formativas

### 7.1 En Tab 2 (Catálogos)

Al editar una Acción Formativa, sección "Participantes":
- Botón "Asignar participantes" → selector con empleados activos del organigrama
- Filtros rápidos (empresa, departamento, área)
- Se guardan como array de NIFs en la acción: `participantes: ["NIF1", "NIF2", ...]`
- Requiere organigrama cargado en Tab 1; si no, muestra aviso
- Si un NIF vinculado no existe en el organigrama actual → se mantiene en la lista con icono de advertencia ("participante no encontrado en organigrama")

### 7.2 En Tab 3 (Generar XML)

- Al seleccionar una acción con participantes vinculados → tabla pre-cargada
- Se pueden añadir/quitar participantes puntualmente

### 7.3 En Tab 1 (Convocatoria)

- Nuevo botón "Cargar desde Acción Formativa" → desplegable de acciones del catálogo
- Pre-selecciona los participantes vinculados en la tabla de asistentes
- Permite convocar sesiones de formación directamente desde el catálogo

## 8. Persistencia y exportación

- **Primario**: `localStorage` (4 claves de catálogos)
- **Backup**: botón JSON export/import (un solo fichero con los 4 catálogos)
- **Integridad referencial**: avisos al borrar registros vinculados
- **Sin cambios** en el estado existente de convocatoria (snapshot, queue, presets)
- **Volumetría estimada**: 50 acciones formativas × 2KB cada una + 20 proveedores + 30 centros + 50 tutores + participantes vinculados ≈ 200-300KB. Muy dentro de los ~5MB de localStorage. Se añade try/catch en escritura con showToast de error si se excede
- **Interacciones de usuario** (crear, renombrar, confirmar borrado): usar modales (`dialog-overlay` + `dialog-box`), nunca `prompt()` ni `confirm()`

## 8b. Migración desde implementación actual

La sección "4. Datos FUNDAE" del panel izquierdo de Tab 1 (campos fCIF, fCodAccion, etc.) **se elimina**. El XML se genera exclusivamente desde Tab 3.

**Datos existentes en `convocatoria_state.fundae`**:
- Se ignoran (no se migran a los catálogos). Los catálogos empiezan vacíos.
- `restoreFundaeData()` y `getFundaeData()` se eliminan.
- `saveState()` deja de serializar datos FUNDAE en el snapshot de convocatoria.

**Funciones XML existentes** (`generateAccionFormativaXML`, `generateInicioGrupoXML`, `generateFinalizacionXML`):
- Se mantienen y adaptan para recibir datos de Tab 3 (catálogos + organigrama) en vez de los campos del formulario eliminado.

## 9. Restricciones técnicas

- Todo en un solo fichero `convocatoria.html` (CSS + HTML + JS inline)
- SheetJS (XLSX) via CDN (ya cargado)
- Design system: Indigo-600 (#4F46E5) + Slate + Inter
- No frameworks, no build tools
- `localStorage` como única persistencia

## 10. Esquemas XSD de referencia

Los XSD oficiales FUNDAE 2025 están incluidos en el repositorio en `docs/xsd/`:

- `docs/xsd/AAFF_Inicio.xsd` — AccionesFormativas (carga masiva)
- `docs/xsd/InicioGrupos_Bonificada.xsd` — Inicio de grupos bonificada
- `docs/xsd/FinalizacionGrupo_Bonificada.xsd` — Finalización de grupos

Reglas XML:
- Sin namespace XML (los XSD no definen uno)
- Fechas en formato DD/MM/YYYY
- Días como LMXJVSD (iniciales españolas)
- El código actual (líneas ~2754-2986 de convocatoria.html) ya genera XML conforme a estos XSD
