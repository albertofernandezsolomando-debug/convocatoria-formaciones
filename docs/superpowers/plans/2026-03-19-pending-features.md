# Features pendientes

## Prioridad alta

### Filtros tipo Excel en tabla de empleados (Convocatoria)
- Los headers de la tabla de empleados actualmente solo ordenan
- Necesitan dropdown tipo Excel: al hacer click en el header, muestra lista de valores únicos con checkboxes para filtrar
- Similar a cómo funciona la vista lista del catálogo (que ya tiene filtros por columna)
- Combinar con la barra de búsqueda libre ya implementada

### Múltiples tutores por grupo
- FUNDAE XSD permite `maxOccurs="unbounded"` para tutores
- Actualmente: un solo `tutorVinculado` por acción
- Necesario: array de tutores, botón "+ Añadir tutor" en XML tab y ficha
- Cada tutor: documento, nombre, apellidos, teléfono, email, horas dedicación
- Para teleformación: tipo tutoría + descripción adicional

## Prioridad media

### Modelo A de datos (entidad grupo separada)
- Ver `docs/superpowers/specs/2026-03-18-grupos-formativos-design.md` sección 9
- Migrar de modelo B (parentAccion flat) a modelo A (entidad Acción + entidad Grupo)
- Cuándo: cuando la duplicación de campos compartidos cause inconsistencias reales

### Auto-sync catálogo → XML mejorado (P1 del spec)
- El botón "Generar XML" en la ficha funciona pero no muestra preview
- Añadir diálogo de confirmación con preview del XML antes de generar
- Pre-rellenar responsable/teléfono desde Settings ya implementado

### UX premium (research pendiente)
- Ver `docs/superpowers/specs/2026-03-14-estado-del-arte-ui-ux.md`
- Sound design, peak-end rule, empty states contextuales
- Section borders semánticos (color por estado de completitud)
