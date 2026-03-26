# Filtros tipo Excel + Múltiples tutores

**Fecha:** 19 de marzo de 2026

---

## Feature 1: Filtros tipo Excel en tabla de empleados

### Columnas actualizadas

| # | Columna | Tipo filtro | data-sort |
|---|---------|-------------|-----------|
| 0 | Checkbox | — | — |
| 1 | Persona trabajadora | texto libre | Empleado |
| 2 | Empresa | multi-select | Empresa |
| 3 | Departamento | multi-select | Departamento |
| 4 | Puesto | multi-select | Puesto |
| 5 | Email | texto libre | Email trabajo |

Se eliminan: filtros laterales (`filterContainer`), columna Ubicación. Los campos Área, Categoría Mercer y Depende de son buscables via la barra de búsqueda libre.

### Interacción del dropdown

- Click en icono ▼ del header → abre dropdown debajo del header
- Dropdown contiene: input búsqueda + lista de valores únicos con checkboxes + contadores
- "Seleccionar todos" / "Limpiar" links arriba de la lista
- Badge con nº de filtros activos en el header (ej: "Departamento (3)")
- Click en sort arrow → ordena (comportamiento actual preservado)
- Filtros entre columnas se combinan con AND
- Click fuera del dropdown → cierra

### CSS

Reutilizar `.filter-dropdown` existente (posición absolute, shadow-lg, max-height 220px, animación dropdownIn). Añadir `.col-filter-btn` para el icono ▼ en el header.

### Eliminación de filtros laterales

- Eliminar `#filterContainer` del HTML
- Eliminar `renderFilters()` y event handlers asociados
- Eliminar panel lateral `.left-panel` de la pestaña Convocatoria (la tabla ocupa todo el ancho)
- `state.activeFilters` se reemplaza por `state.columnFilters` (objeto `{ columna: [valores] }`)
- `filterEmployees()` se adapta para leer de `state.columnFilters`

---

## Feature 2: Múltiples tutores por acción

### Modelo de datos

```
// Antes (single tutor)
accion.tutorVinculado = "12345678A"

// Después (multiple tutors)
accion.tutoresVinculados = ["12345678A", "X1234567B"]
```

Migración automática: al cargar una acción con `tutorVinculado` y sin `tutoresVinculados`, crear `tutoresVinculados = [tutorVinculado]`.

### UI en ficha del catálogo (Datos básicos)

Reemplazar `select('Tutor vinculado', ...)` por:
- Lista de tutores vinculados: nombre completo + documento + botón ✕
- Dropdown "Seleccionar tutor" (del catálogo) + botón "Añadir"
- Máximo visual: scroll si >4 tutores

### UI en tab XML (sección Tutor)

Reemplazar dropdown único por lista de tutores de la acción:
- Cada tutor: nombre, documento, horas asignadas (input editable)
- Horas por defecto: equitativas (totalHoras / nTutores)
- Botón "+ Añadir tutor" si se quiere añadir uno más ad-hoc

### XML generación

`doGenXmlInicioGrupo`:
- Iterar `tutoresVinculados`, generar un `<Tutor>` por cada uno
- Para teleformación: añadir `<tutoria>` a cada tutor
- Las horas se leen del array editable en xmlState

### Compatibilidad

- `tutorVinculado` se mantiene como alias de lectura (primer elemento de `tutoresVinculados`)
- `getLinkedAcciones('tutores', doc)` busca en `tutoresVinculados.includes(doc)` además de `tutorVinculado === doc`
- El dropdown de tutor en el XML tab se elimina (auto-poblado desde la acción)
