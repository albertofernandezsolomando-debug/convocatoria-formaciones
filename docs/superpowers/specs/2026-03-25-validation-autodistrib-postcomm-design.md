# Validación XML + Auto-distribución + Detección post-comunicación

**Fecha**: 2026-03-25

---

## Feature A: Validación de XML basada en reglas

Antes de descargar cualquier XML, ejecutar validaciones contra reglas derivadas del XSD. Mostrar errores en un diálogo con lista clara.

### Reglas por tipo de XML

**Acción Formativa:**
- codAccion obligatorio, numérico 1-8 dígitos
- nombreAccion obligatorio, max 255 chars
- codGrupoAccion formato NNN-NN
- Modalidad debe tener horas > 0 correspondientes
- Si teleformación: plataforma (CIF, URI) obligatoria
- objetivos y contenidos obligatorios, no vacíos
- Participantes: NIF/NIE formato válido, tipoDocumento en (10,20,60)

**Inicio de Grupo (todo lo anterior +):**
- idGrupo numérico obligatorio
- responsable y telefonoContacto obligatorios (desde Settings)
- Centro: documento, nombre, dirección, CP, localidad obligatorios
- Tutor: al menos 1, cada uno con documento, nombre, apellido1, teléfono, email, horas > 0
- Fechas: inicio <= fin, formato YYYY-MM-DD
- informaRLT en (S, N)

**Finalización:**
- Participantes con NIF válido
- Costes numéricos >= 0

### UI

Diálogo modal con lista de errores (icono rojo, bloqueantes) y warnings (icono naranja, no bloqueantes). Botón "Descargar de todos modos" para warnings, deshabilitado si hay errores.

### Integración

En genXmlAccionFormativa(), genXmlInicioGrupo(), genXmlFinalizacion() — antes de llamar a doGen*, ejecutar validación. Si hay errores, mostrar diálogo en vez de descargar. La función validateXmlData() ya existe (~línea 17090) — extenderla con las reglas adicionales.

---

## Feature B: Auto-distribución por ubicación

Botón en la ficha de una acción padre que distribuye los participantes en grupos por Ubicación del organigrama.

### Flujo

1. Usuaria en ficha de acción con participantes asignados
2. Pulsa "Auto-distribuir por ubicación"
3. App lee participantes y agrupa por emp.Ubicación
4. Si NO hay grupos hijos: crea un grupo por Ubicación (parentAccion, codigoGrupo auto, nombre "Acción (Gr. N - Ubicación)")
5. Si YA hay grupos: diálogo preguntando "Redistribuir en existentes o crear nuevos"
6. Asigna participantes al grupo correspondiente
7. Toast resumen

### Integración

Botón en sección Participantes de la ficha del catálogo (junto a "Asignar participantes"). Requiere state.employees cargado. Usa generateActionCodes() y generateGroupCode() existentes.

---

## Feature C: Detección de cambios post-comunicación

### Modelo de datos

Al generar XML de inicio (doGenXmlInicioGrupo), guardar snapshot:
- record.comunicacionInicioEnviada = true (ya existe)
- record.participantesAlComunicar = [...record.participantes] (NUEVO)

### Banner en ficha

Si comunicacionInicioEnviada === true, comparar participantes actual vs participantesAlComunicar. Si difieren: banner warning con botón "Generar XML actualizado".

### Toast al modificar

Al añadir/quitar participante (picker o import firmas), si comunicacionInicioEnviada === true: toast warning.

### Reset

Al generar nuevo XML de inicio: actualizar snapshot con participantes actuales.
