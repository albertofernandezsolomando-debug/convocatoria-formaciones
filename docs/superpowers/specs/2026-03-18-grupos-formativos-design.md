# Grupos Formativos: Agrupación Visual + Automatización

**Fecha**: 2026-03-18
**Estado**: Aprobado para implementación
**Enfoque**: B (agrupación UI sobre modelo plano) — ver nota sobre modelo A al final

---

## 1. Contexto

La usuaria trabaja por **grupos formativos**, no por acciones formativas. Cada acción (programa de formación) puede tener múltiples grupos (ediciones), cada uno con su propio tutor, centro, participantes, fechas y asistencia. Actualmente la app trata cada grupo como un registro de acción independiente sin relación explícita con otros grupos de la misma acción.

El modelo FUNDAE distingue:
- **Acción formativa** (`codAccion`): define el contenido (nombre, modalidad, horas, objetivos, contenidos)
- **Grupo** (`codGrupoAccion`): ejecución concreta con participantes, tutor, centro, fechas

La app ya usa `duplicateAction()` para crear grupos, pero sin vínculo padre-hijo ni UI de agrupación.

---

## 2. Modelo de datos

### 2.1 Nuevo campo: `parentAccion`

```
parentAccion: string | null
```

- `null` → acción independiente o raíz de un grupo de acciones
- `"26095"` → este registro pertenece al grupo de la acción 26095

**Reglas:**
- Cada registro sigue siendo completo e independiente (funciona sin padre)
- Si `parentAccion` apunta a un código inexistente, se trata como acción independiente
- La acción padre también puede tener participantes, fechas, etc. (es el grupo 1)
- **Solo 2 niveles**: `parentAccion` no puede apuntar a un registro que ya tenga `parentAccion` seteado. Si se intenta, se usa el `parentAccion` del target (apunta al abuelo real).

### 2.2 Cambio en `duplicateAction()`

```javascript
copy.parentAccion = original.parentAccion || original.codigo;
```

El original se convierte implícitamente en padre (otros registros apuntan a él). El registro original NO se modifica.

### 2.3 Cambio en `generateGroupCode()`

**Pivota de búsqueda por prefijo a búsqueda por `parentAccion`:**

```javascript
function generateGroupCode(parentCodigo) {
  var existing = getCatalog('acciones');
  var siblings = existing.filter(function(r) {
    return r.parentAccion === parentCodigo || r.codigo === parentCodigo;
  });
  var maxGroup = 0;
  siblings.forEach(function(r) {
    if (r.codigoGrupo) {
      var g = parseInt(r.codigoGrupo.split('-')[1], 10);
      if (!isNaN(g) && g > maxGroup) maxGroup = g;
    }
  });
  // NNN = sequential part from parent's codigo
  var parentCode = existing.find(function(r) { return r.codigo === parentCodigo; });
  var seqPart = parentCode ? parentCode.codigo.slice(2).padStart(3, '0') : '000';
  return seqPart + '-' + String(maxGroup + 1).padStart(2, '0');
}
```

Esto elimina el riesgo de colisión entre acciones no relacionadas que comparten prefijo.

### 2.4 Campos eliminados

- `rltEstado` — eliminado. FUNDAE solo pide `informaRLT` (S/N), que se asume siempre "S"
- `rltFechaEnvio` — eliminado

**Código a eliminar:**
- Sección "Comunicación RLT" en `getCatalogFormHtml` (con input fecha, botones, estado)
- Event listener de `cf_rltSentDate` en `bindCatalogFormEvents`
- Línea de RLT en `buildInspectionChecklist()` (reemplazada por checklist FUNDAE P5)
- Regla 3 de `evaluateAlerts()` (auto-transición `rltEstado` a 15 días)
- Preserves de `rltEstado`/`rltFechaEnvio` en `saveCatalogForm()`
- Se mantiene `informaRLT` (S/N) en el selector del formulario XML — valor por defecto "S"

### 2.5 Herencia padre → grupo (P3)

Al crear un grupo nuevo (duplicar), se heredan automáticamente:
- `nombre` (sin prefijo "Copia de", con sufijo " (Gr. N)")
- `modalidad`, `horasPresenciales`, `horasTeleformacion`
- `areaProfesional`, `nivelFormacion`
- `objetivos`, `contenidos`
- `proveedorVinculado`, `centroVinculado`, `tutorVinculado`
- `plataformaCif`, `plataformaRazonSocial`, `plataformaUri`, `plataformaUsuario`, `plataformaPassword`
- `bonificable`, `empresaPagadora`, `departamento`

Se limpian (son del grupo nuevo):
- `participantes`, `asistencia`, `confirmaciones`
- `fechaInicio`, `fechaFin`
- `codigoGrupo` (auto-generado vía `generateGroupCode`)
- `estado` → "En preparación"
- `comunicacionInicioEnviada`, `comunicacionFinEnviada` → false

**Nota**: Los nombres NO se sincronizan tras la creación. Si se edita el nombre del padre después, los hijos conservan el nombre que tenían al crearse. Esto es comportamiento esperado en modelo B.

### 2.6 Eliminación de padre con hijos

Al intentar eliminar una acción que tiene registros hijos (`parentAccion` apuntando a ella):
- **Los hijos se huerfanizan**: `parentAccion = null` (se convierten en acciones independientes)
- Se muestra confirmación: "Esta acción tiene N grupos vinculados. Al eliminarla, los grupos se convertirán en acciones independientes. ¿Continuar?"

---

## 3. Catálogo — Vista lista agrupada

### 3.1 Comportamiento

Las acciones con `parentAccion` se agrupan visualmente bajo su padre en `renderCatalogListView()`:

```
┌──────┬────────────────────────────────┬──────────┬───────────┐
│ Cód. │ Nombre                         │ Estado   │ F.inicio  │
├──────┼────────────────────────────────┼──────────┼───────────┤
│26094 │ Excel Avanzado                  │ En marcha│ 12/03     │
├──────┼────────────────────────────────┼──────────┼───────────┤
│▼26095│ Curso IA Copilot Fundae    3 gr │          │           │
│  ├ 01│   Gr.1 · Tutor: Pérez · 5 part│ En marcha│ 17/03     │
│  ├ 02│   Gr.2 · Tutor: López · 8 part│ En prep. │ 24/03     │
│  └ 03│   Gr.3 · Tutor: García · 12 p │ Planif.  │ 07/04     │
├──────┼────────────────────────────────┼──────────┼───────────┤
│26098 │ Power BI                        │ Pendiente│           │
└──────┴────────────────────────────────┴──────────┴───────────┘
```

### 3.2 Reglas UI

- **Fila padre**: nombre + badge `N gr`, chevron ▼/▶ para expand/collapse
- **Filas hijo**: indentadas, muestran Gr.N, tutor, nº participantes, estado, fechas
- **Acción sin grupos**: fila normal sin chevron (sin cambios)
- **Click fila padre**: expand/collapse los hijos
- **Click fila hijo**: abre ficha completa del grupo (formulario normal, mismo `catalogFormPanel`)
- **Click nombre padre**: abre la ficha del registro padre (es el grupo 1 — formulario normal, no una vista especial)
- **Colapsado por defecto**, estado recordado en `catalogState` (memoria, no localStorage — se pierde al recargar, aceptable)

### 3.3 Botón "Duplicar" renombrado

- Si la acción no tiene hijos → label "Crear grupo"
- Si ya tiene hijos → label "Nuevo grupo"

---

## 4. Calendario — Agrupación por acción formativa

### 4.1 Nueva opción de agrupación

Se añade "Por acción formativa" al selector de agrupación existente (departamento, modalidad, etc.).

```
─── Curso IA Copilot Fundae (3 grupos) ──────────────────────
    |████ Gr.1 Pérez ████|
                    |████ Gr.2 López ████|
                                    |████ Gr.3 García ████|
```

### 4.2 Implementación

- El item del calendario (construido en la función de mapeo) debe incluir `parentAccion` como campo adicional
- Cuando `groupBy === 'accionFormativa'`, la clave de agrupación es `item.parentAccion || item.codigo`
- El label del grupo se resuelve buscando el registro padre por código para obtener su nombre
- Acciones sin grupos: grupo de una sola barra (sin sufijo)
- Las demás agrupaciones siguen funcionando igual (usan campo directo del item)

### 4.3 Panel de detalle

Si el registro tiene `parentAccion`: mostrar línea contextual `"Grupo 2 de 3 · Acción: Curso IA Copilot Fundae"` encima del título.

---

## 5. Automatizaciones

### 5.1 Auto-sync catálogo → XML (P1)

**Problema**: Centro, tutor, fechas, participantes se introducen en el catálogo y se re-introducen en el tab XML.

**Solución**: Botón "Generar XML FUNDAE" directamente en la ficha del grupo. Al pulsarlo:
1. Lee todos los datos del registro (catálogo = fuente de verdad)
2. Auto-rellena campos XML (centro, tutor, fechas, participantes)
3. Muestra diálogo de confirmación con preview de lo que se va a generar
4. Genera el XML sin necesidad de navegar al tab XML

**Distinción InicioGrupo vs Finalización**:
- Si `comunicacionInicioEnviada === false` → ofrece "Generar XML Inicio de Grupo" → al generar, setea flag a `true`
- Si `comunicacionInicioEnviada === true && comunicacionFinEnviada === false` → ofrece "Generar XML Finalización" → al generar, setea flag a `true`
- Si ambos flags son `true` → ofrece ambas opciones (por si necesita regenerar)
- Siempre disponible "Generar XML Acción Formativa" (datos del programa, no del grupo)

Para casos avanzados (edición manual de campos XML), el tab XML sigue disponible.

### 5.2 Auto-estados (P2)

Transiciones automáticas. Se ejecutan en dos momentos:
1. **Al cargar la app** (`checkAccionesAutoTransitions()`) — transiciones basadas en fechas
2. **Al realizar acciones** (enviar convocatoria, generar XML) — transiciones inmediatas

| Condición | Nuevo estado | Momento |
|---|---|---|
| `fechaInicio ≤ hoy` y estado ∈ {Planificada, En preparación, Convocada} | → En marcha | Al cargar |
| `fechaFin < hoy` y asistencia registrada (≥1 sesión con ≥1 presente) | → Terminada | Al cargar |
| Envío de convocatoria (email) | → Convocada | Inmediato |
| Generación XML InicioGrupo | `comunicacionInicioEnviada = true` | Inmediato |
| Generación XML Finalización | `comunicacionFinEnviada = true` | Inmediato |

No se auto-transiciona a "Anulada" ni "Retrasada" (decisiones humanas).

**Nota sobre `_autoTransitionRan` flag**: Se mantiene para las transiciones "al cargar" (evita múltiples ejecuciones). Las transiciones inmediatas (envío, generación XML) no dependen de este flag — se ejecutan inline en el handler del evento.

**Cambio breaking**: La transición a "Terminada" ahora requiere asistencia registrada (antes solo requería `fechaFin < hoy`). Esto es intencional — no debe cerrarse una acción sin prueba de ejecución.

### 5.3 Sesiones por rango (P4)

**Problema**: Crear N sesiones = N clicks con re-render del formulario cada vez.

**Solución**: Selector de rango + días de la semana:
```
De: [____] A: [____]  Días: ☑L ☑M ☐X ☑J ☑V ☐S ☐D  [Generar sesiones]
```

Genera todas las sesiones de golpe. Un solo re-render al final. El selector de rango se muestra como alternativa al input de fecha individual existente (que se mantiene para añadir fechas sueltas).

### 5.4 Checklist FUNDAE informativo (P5)

En la ficha del grupo, indicador visual de readiness FUNDAE. **No bloqueante** — solo informativo.

Campos verificados:
- `nombre` no vacío
- `modalidad` definida
- `horasPresenciales` o `horasTeleformacion` > 0 (según modalidad)
- `objetivos` no vacío
- `contenidos` no vacío
- `participantes.length > 0`
- `fechaInicio` y `fechaFin` definidas
- `centroVinculado` definido (si presencial/mixta)
- `tutorVinculado` definido
- `codigoGrupo` formato NNN-NN

Presentado como lista compacta: `✓ 8/10 campos FUNDAE · Faltan: centro, tutor`

Reemplaza la línea de RLT que existía en `buildInspectionChecklist()`.

---

## 6. Impacto en otros subsistemas

| Subsistema | Cambio |
|---|---|
| Convocatoria | Sin cambios — ya opera a nivel de registro individual |
| XML FUNDAE tab | Sin cambios — sigue disponible para edición avanzada |
| Import firmas PDF | Sin cambios — opera sobre registro individual |
| Dashboard KPIs | Sin cambios — suma sobre todos los registros |
| Plan anual | Sin cambios — cada registro en su trimestre |
| Personas | Sin cambios — perfil por NIF |
| Cmd+K | Añadir contexto de grupo al resultado si tiene `parentAccion` |

---

## 7. Migración

- **Datos existentes**: No requieren migración. `parentAccion` ausente = acción independiente.
- **Agrupación retroactiva**: Si la usuaria quiere vincular acciones existentes, puede hacerlo desde la ficha. Selector "Vincular a acción padre" muestra solo acciones sin `parentAccion` (raíces o independientes). Validación: no permite crear ciclos ni árboles > 2 niveles.
- **Campos eliminados**: `rltEstado` y `rltFechaEnvio` se ignoran si existen en registros antiguos (no se borran de localStorage, simplemente no se leen ni se muestran).

---

## 8. Orden de implementación recomendado

1. **Modelo de datos**: `parentAccion` en `duplicateAction` + `generateGroupCode` pivotado
2. **Eliminación RLT**: Quitar sección RLT del formulario y código asociado
3. **Herencia padre → grupo** (P3): Campos heredados al duplicar
4. **UI agrupada catálogo**: Lista expandible + botón "Crear/Nuevo grupo"
5. **Calendario**: Nueva agrupación "Por acción formativa"
6. **Sesiones por rango** (P4): Independiente, puede ir en paralelo
7. **Auto-estados** (P2): Transiciones automáticas
8. **Auto-sync XML** (P1): Botón "Generar XML" en ficha
9. **Checklist FUNDAE** (P5): Indicador informativo

---

## 9. Nota futura: Modelo A (entidad grupo separada)

> **Decisión 2026-03-18**: Se implementa modelo B (agrupación UI sobre modelo plano) por pragmatismo. El modelo correcto desde el punto de vista de datos sería A: una entidad `Acción` separada de una entidad `Grupo`, donde la acción define el contenido y cada grupo es una ejecución con sus propios participantes, fechas, tutor, centro y asistencia.
>
> **Razones para posponer A**:
> - Requiere migración de todos los registros existentes
> - Afecta a todos los subsistemas (calendario, dashboard, XML, etc.)
> - El modelo B es retrocompatible y funcional
>
> **Cuándo migrar a A**: Cuando la app necesite queries tipo "¿cuántas acciones únicas tenemos?" vs "¿cuántos grupos?", o cuando la duplicación de campos compartidos (nombre, objetivos, contenidos) entre grupos cause inconsistencias reales.
