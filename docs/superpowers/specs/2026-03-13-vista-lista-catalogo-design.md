# Vista Lista Editable para Catalogos

## Problema

La usuaria gestiona 4 sub-catalogos (Proveedores, Centros, Tutores, Acciones) rellenando formularios uno a uno. Para operaciones repetitivas (actualizar estados, asignar participantes, rellenar campos similares en varias acciones), el flujo ficha-a-ficha es lento y engorroso. Necesita un modo de trabajo tipo SharePoint: tabla editable, ordenable, filtrable, con operaciones masivas.

## Solucion

Anadir un **modo Lista** alternativo al modo Ficha existente en el tab Catalogos. Toggle entre ambos modos. La vista lista es una tabla HTML nativa a pantalla completa con edicion inline, sorting, filtering y operaciones bulk. Coexiste con el formulario actual sin reemplazarlo.

## Decisiones de diseno

- **Tabla HTML nativa con `contenteditable`**: sin dependencias externas, coherente con la arquitectura vanilla de la app. Valores de `contenteditable` se sanitizan con `esc()` antes de persistir, y se renderizan con `esc()` al pintar celdas.
- **Toggle Ficha/Lista**: control segmentado en la cabecera del tab. Preferencia guardada en `localStorage` por sub-catalogo.
- **Guardado por celda**: cada cambio se persiste al confirmar la celda (blur/Enter), sin boton "Guardar" global.
- **Los 4 sub-catalogos**: comparten la misma infraestructura de vista lista, solo varian las columnas via configuracion.

---

## 1. Arquitectura

### Toggle de modo

Control segmentado "Ficha / Lista" en la cabecera del tab Catalogos, junto a los sub-tabs existentes. Sigue el patron visual del toggle Resumen/Completo del dashboard. Al cambiar:

- **Modo Ficha**: muestra el layout actual (lista izquierda + formulario derecha)
- **Modo Lista**: oculta ambos paneles y muestra la tabla a pantalla completa

La preferencia se guarda en `localStorage` key `convocatoria_catalog_viewMode` como objeto `{ proveedores: 'ficha'|'lista', centros: '...', ... }`.

### Reuso de datos

La vista lista lee de `getCatalog(key)` y escribe con `upsertCatalogRecord(key, pkField, record)`. Cero duplicacion de logica de persistencia. Al volver a modo ficha, los datos reflejan los cambios hechos en lista y viceversa.

### Configuracion por catalogo

```javascript
const LIST_VIEW_CONFIG = {
  acciones: {
    pkField: 'codigo',
    columns: [
      { key: 'codigo',          label: 'Codigo',       editable: false, type: 'text',   width: '80px' },
      { key: 'nombre',          label: 'Nombre',       editable: true,  type: 'text',   width: '2fr' },
      { key: 'estado',          label: 'Estado',        editable: true,  type: 'select', width: '120px', options: () => ['Pendiente','Buscando','En preparacion','En marcha','Terminada','Anulada','Retrasada'] },
      { key: 'departamento',    label: 'Departamento',  editable: true,  type: 'text',   width: '150px' },
      { key: 'empresaPagadora', label: 'Empresa',       editable: true,  type: 'select', width: '180px', options: () => getEmpresasGrupo().map(e => e.nombre) },
      { key: 'fechaInicio',     label: 'F. inicio',     editable: true,  type: 'date',   width: '120px' },
      { key: 'fechaFin',        label: 'F. fin',        editable: true,  type: 'date',   width: '120px' },
      { key: 'presupuesto',     label: 'Presupuesto',   editable: true,  type: 'number', width: '100px', step: 100, min: 0 },
      { key: 'bonificable',     label: 'Bonif.',        editable: true,  type: 'select', width: '80px',  options: () => ['Si', 'No'] },
      { key: 'modalidad',       label: 'Modalidad',     editable: true,  type: 'select', width: '120px', options: () => ['Presencial', 'Teleformacion', 'Mixta'] },
      { key: 'horasPresenciales',  label: 'H. presenc.',  editable: true,  type: 'number', width: '90px',  step: 0.5, min: 0 },
      { key: 'horasTeleformacion', label: 'H. telef.',   editable: true,  type: 'number', width: '90px',  step: 0.5, min: 0 },
      { key: '_participantes',  label: 'Partic.',       editable: false, type: 'count',  width: '80px',  countFn: r => (r.participantes||[]).length },
      { key: '_notas',          label: 'Notas',         editable: false, type: 'count',  width: '70px',  countFn: r => (r.notas||[]).length },
    ],
    defaultSort: { key: 'fechaInicio', dir: 'desc' },
  },
  proveedores: {
    pkField: 'cif',
    columns: [
      { key: 'cif',           label: 'CIF',           editable: false, type: 'text',  width: '100px' },
      { key: 'razonSocial',   label: 'Razon social',  editable: true,  type: 'text',  width: '2fr' },
      { key: 'email',         label: 'Email',          editable: true,  type: 'text',  width: '200px' },
      { key: 'telefono',      label: 'Telefono',       editable: true,  type: 'text',  width: '120px' },
      { key: 'responsable',   label: 'Responsable',    editable: true,  type: 'text',  width: '180px' },
      { key: '_acciones',     label: 'Acciones',       editable: false, type: 'count', width: '80px',  countFn: r => getLinkedAcciones('proveedores', r.cif).length },
    ],
    defaultSort: { key: 'razonSocial', dir: 'asc' },
  },
  centros: {
    pkField: 'documento',
    columns: [
      { key: 'documento', label: 'Documento', editable: false, type: 'text',   width: '120px' },
      { key: 'nombre',    label: 'Nombre',    editable: true,  type: 'text',   width: '2fr' },
      { key: 'direccion', label: 'Direccion',  editable: true,  type: 'text',   width: '250px' },
      { key: 'provincia', label: 'Provincia',  editable: true,  type: 'text',   width: '130px' },
      { key: 'localidad', label: 'Localidad',  editable: true,  type: 'text',   width: '130px' },
      { key: '_acciones', label: 'Acciones',   editable: false, type: 'count',  width: '80px', countFn: r => getLinkedAcciones('centros', r.documento).length },
    ],
    defaultSort: { key: 'nombre', dir: 'asc' },
  },
  tutores: {
    pkField: 'documento',
    columns: [
      { key: 'documento',    label: 'Documento',      editable: false, type: 'text',  width: '120px' },
      { key: '_nombreCompleto', label: 'Nombre',       editable: false, type: 'text',  width: '2fr',  displayFn: r => [r.nombre, r.apellido1, r.apellido2].filter(Boolean).join(' ') },
      { key: 'email',        label: 'Email',           editable: true,  type: 'text',  width: '200px' },
      { key: 'telefono',     label: 'Telefono',        editable: true,  type: 'text',  width: '120px' },
      { key: 'horasDedicacion', label: 'Horas dedic.',  editable: true,  type: 'number', width: '100px', step: 0.5, min: 0 },
      { key: '_acciones',    label: 'Acciones',        editable: false, type: 'count', width: '80px', countFn: r => getLinkedAcciones('tutores', r.documento).length },
    ],
    defaultSort: { key: '_nombreCompleto', dir: 'asc' },
  },
};
```

### Transicion entre modos

- **Lista → Ficha**: doble clic en fila abre modo ficha con ese registro seleccionado.
- **Ficha → Lista**: el toggle vuelve a la lista preservando filtros, orden y posicion de scroll.
- Boton "Volver a lista" visible en modo ficha cuando se llego desde la lista.

---

## 2. Tabla y edicion inline

### Estructura HTML

```
table.catalog-list-table
  thead (sticky)
    tr.header-row        → cabeceras con indicador de orden
    tr.filter-row        → fila de filtros por columna
  tbody
    tr.data-row[data-pk] → una fila por registro
      td.cell-checkbox   → checkbox de seleccion
      td.cell-data       → celda de datos (editable o read-only)
      ...
      td.cell-actions    → boton acciones rapidas
```

### Comportamiento de edicion por tipo

| Tipo | Activacion | Control | Confirmacion | Cancelacion |
|------|-----------|---------|-------------|-------------|
| `text` | clic en celda | `contenteditable=true` | blur o Enter | Escape |
| `select` | clic en celda | `<select>` inline | change | Escape |
| `date` | clic en celda | `<input type="date">` | change | Escape |
| `number` | clic en celda | `<input type="number">` | blur o Enter | Escape |
| `count` | no editable | chip con numero | n/a | n/a |

### Navegacion por teclado

- **Tab / Shift+Tab**: avanza/retrocede entre celdas editables de la misma fila.
- **Enter**: confirma celda, baja a la misma columna en la fila siguiente.
- **Escape**: cancela edicion, restaura valor original.
- **Flechas**: no se interceptan (scroll natural del navegador).

### Guardado y validacion

- Cada celda se guarda al confirmar: `commitInlineEdit()` lee el registro completo actual de `getCatalog()`, parchea el campo modificado, y llama a `upsertCatalogRecord()` con el registro completo. Esto evita sobreescribir otros campos.
- Si la validacion falla (ej: codigo duplicado, horas requeridas), la celda se marca con borde `var(--danger)` y tooltip con el mensaje de error. El valor vuelve al original.
- Toast sutil confirma guardado exitoso (solo si hay cambio real, no en blur sin modificacion).

### Nueva fila

Boton "+ Nueva fila" debajo de la tabla. Inserta una fila editable con PK autogenerado (siguiente codigo libre para acciones). El usuario rellena los campos minimos. Al salir de la fila sin rellenar el nombre, se elimina automaticamente la fila vacia.

---

## 3. Sorting y filtering

### Sorting

- Clic en cabecera → ascendente. Segundo clic → descendente. Tercero → sin orden.
- Indicador visual: flecha unicode en la cabecera activa.
- Se ordena en memoria sobre el array filtrado; no muta el array original.
- Sort estable (mantiene orden relativo de elementos iguales).
- Para columnas con `displayFn` (como `_nombreCompleto` en tutores), `sortListView` evalua `displayFn(record)` para obtener el valor de comparacion.

### Filtering

Fila de filtros fija debajo del header. Cada columna tiene su control segun el tipo:

| Tipo columna | Control de filtro | Logica |
|-------------|------------------|--------|
| `text` | input con placeholder "Filtrar..." | contiene (case-insensitive) |
| `select` | dropdown "Todos" + opciones | igualdad exacta |
| `date` | dos inputs date (desde / hasta) | rango inclusivo |
| `number` | dos inputs (min / max) | rango inclusivo |
| `count` | no se filtra | — |

- Filtros se combinan con AND entre columnas.
- Debounce 300ms en inputs de texto.
- Boton "Limpiar filtros" alineado a la derecha.

---

## 4. Operaciones masivas (bulk)

### Seleccion

- Checkbox en cabecera: selecciona/deselecciona todas las filas **visibles** (respetando filtros activos).
- Checkbox individual por fila.
- Shift+clic: selecciona rango desde el ultimo clic.

### Toolbar bulk

Barra flotante que aparece al seleccionar >=1 fila. Se posiciona encima de la tabla (mismo patron que la action bar existente). Contenido:

- **Contador**: "N seleccionados"
- **Cambiar estado**: dropdown → aplica a todos los seleccionados
- **Cambiar empresa**: dropdown → aplica a todos
- **Cambiar departamento**: input con autocompletar → aplica a todos
- **Asignar participantes**: abre un nuevo **modal de seleccion de participantes** (checkbox list de empleados del organigrama, reutilizando la logica de `renderAccionParticipants` pero como dialog standalone). Los participantes seleccionados se anaden a todas las acciones marcadas. Nota: `renderAccionParticipants` actual renderiza inline en el formulario, no es modal — se necesita crear un modal wrapper.
- **Eliminar**: confirmacion con conteo. Antes de eliminar, comprobar si el registro tiene vinculaciones en otros catalogos (ej: proveedor vinculado a acciones) usando `getLinkedAcciones()`. Si las tiene, avisar al usuario y pedir confirmacion extra. La logica de integridad referencial no existe en `deleteCatalogRecord()` (que es un simple filter+save), asi que el bulk delete debe implementarla: limpiar las referencias en registros vinculados antes de eliminar.

Cada accion ejecuta `upsertCatalogRecord()` por registro y muestra toast con resumen.

Las acciones disponibles varian segun el sub-catalogo:
- **Acciones**: todas las acciones bulk
- **Proveedores/Centros/Tutores**: solo cambiar campos editables + eliminar (no tienen participantes ni estado)

---

## 5. Columnas por sub-catalogo

### Acciones (14 columnas)

Codigo (PK) | Nombre | Estado | Departamento | Empresa | F. inicio | F. fin | Presupuesto | Bonif. | Modalidad | H. presenc. | H. telef. | Participantes (count) | Notas (count)

### Proveedores (6 columnas)

CIF (PK) | Razon social | Email | Telefono | Responsable | Acciones vinculadas (count)

### Centros (6 columnas)

Documento (PK) | Nombre | Direccion | Provincia | Localidad | Acciones vinculadas (count)

### Tutores (6 columnas)

Documento (PK) | Nombre completo (read-only, concatenado) | Email | Telefono | Horas dedicacion | Acciones vinculadas (count)

Las columnas `count` son chips clicables que navegan al modo ficha del registro correspondiente.

---

## 6. CSS y responsive

### Estilos (variables DS existentes)

- Tabla: fondo `var(--bg-panel)`, bordes `var(--border)`, header `var(--bg-input)`
- Celda activa: borde `var(--accent)`, focus ring `0 0 0 3px rgba(79,70,229,0.15)`
- Celda con error: borde `var(--danger)`, tooltip con mensaje
- Fila seleccionada: fondo `var(--accent-subtle)`
- Fila hover: fondo `var(--accent-subtle)` con opacidad reducida
- Chips count: `.chip` existente
- Toolbar bulk: patron `.action-bar` — `var(--bg-panel)`, `var(--shadow-sm)`
- Transiciones: `var(--transition)`

### Responsive

- **>= 900px**: tabla completa. Columnas codigo + nombre sticky a la izquierda. Resto scroll horizontal.
- **< 900px**: fila de filtros colapsa en boton "Filtros" que despliega panel. Columnas se reducen a las esenciales (PK, nombre, estado para acciones).

### Accesibilidad

- `role="grid"` en la tabla
- `aria-sort="ascending|descending|none"` en headers
- `aria-selected="true"` en filas seleccionadas
- `aria-readonly="true"` en celdas no editables
- Navegacion completa por teclado (Tab, Enter, Escape)
- `prefers-reduced-motion`: desactiva transiciones de edicion

---

## 7. Funciones principales

| Funcion | Responsabilidad |
|---------|----------------|
| `renderCatalogListView(catalogKey)` | Renderiza tabla completa para el sub-catalogo activo |
| `renderListViewHeader(config)` | Genera `<thead>` con cabeceras y fila de filtros |
| `renderListViewBody(config, data)` | Genera `<tbody>` con filas de datos |
| `renderListViewCell(col, record)` | Renderiza una celda segun tipo (text/select/date/number/count) |
| `activateInlineEdit(td, col, record)` | Transforma celda a modo edicion |
| `commitInlineEdit(td, col, record)` | Valida, guarda y restaura celda a modo lectura |
| `cancelInlineEdit(td, col, record)` | Restaura valor original |
| `sortListView(config, key, dir)` | Ordena datos y re-renderiza body |
| `filterListView(config, filters)` | Filtra datos y re-renderiza body |
| `getSelectedRows()` | Devuelve array de PKs seleccionados |
| `applyBulkAction(catalogKey, pks, field, value)` | Aplica cambio masivo a N registros |
| `applyBulkDelete(catalogKey, pks)` | Elimina N registros con comprobacion de integridad referencial |
| `addNewRow(catalogKey)` | Inserta fila editable. PK autogenerado para acciones; PK editable para proveedores/centros/tutores (son identificadores reales: CIF, documento) |
| `toggleCatalogViewMode(catalogKey, mode)` | Cambia entre ficha y lista, guarda preferencia |

---

## 8. Integracion con el sistema existente

- **Datos**: lee/escribe via `getCatalog()` / `upsertCatalogRecord()` / `deleteCatalogRecord()`. Sin capa nueva.
- **Audit log**: `commitInlineEdit()` debe comparar el valor anterior con el nuevo antes de llamar a `upsertCatalogRecord()`. Si el campo cambiado es uno de los campos auditados (estado, fechaInicio, fechaFin, presupuesto, proveedorVinculado), se anade una nota automatica al array `notas` del registro con formato `"Campo: valorAnterior → valorNuevo"` y tag `sistema`, igual que `saveCatalogForm()` hace actualmente. Nota: los cambios en `participantes` count se auditan solo desde el modal de asignacion bulk, no desde inline editing (participantes no es editable inline).
- **Participantes**: la asignacion bulk requiere un nuevo modal de seleccion de participantes (dialog standalone con checkbox list de empleados). Reutiliza la logica de filtrado y busqueda de `renderAccionParticipants`, pero empaquetada en `.dialog-overlay` + `.dialog-box`.
- **Vinculaciones**: la eliminacion bulk implementa su propia comprobacion de integridad referencial usando `getLinkedAcciones()`. `deleteCatalogRecord()` es un simple filter+save sin validacion, por lo que la logica de limpieza de referencias cruzadas se implementa en `applyBulkDelete()`.
- **Import/Export Excel**: sigue funcionando igual — importa al array, la vista lista lo refleja al re-renderizar.
- **Dashboard/Calendar**: leen de `getCatalog('acciones')`, que es la misma fuente. Cambios en lista se reflejan automaticamente.

## Columnas intencionalmente excluidas de la vista lista

Estos campos existen en el modelo de datos pero se excluyen de la tabla por ser demasiado complejos para edicion inline o poco utiles en vista resumen. Se acceden via modo ficha (doble clic en fila):

- **Acciones**: codigoGrupo, areaProfesional, nivelFormacion, objetivos, contenidos, plataforma*, vinculaciones (proveedorVinculado, centroVinculado, tutorVinculado), asistencia, confirmaciones
- **Proveedores**: direccion, cp, localidad, provincia (se priorizan los campos mas usados en operativa diaria)
- **Centros**: tipoDocumento, cp
- **Tutores**: tipoDocumento, nombre/apellido1/apellido2 (se muestran concatenados como read-only)

## Fuera de alcance

- Reordenar columnas via drag & drop
- Redimensionar columnas manualmente
- Copy-paste de celdas multiples (tipo Excel)
- Undo/redo de ediciones
- Vista lista para la tabla de asistentes (tab Convocatoria) — solo afecta a Catalogos
