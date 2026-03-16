# Patrones UI/UX en SaaS de Gestion de Formacion y RRHH (2024-2026)

> Investigacion profunda sobre patrones de interfaz y experiencia de usuario en plataformas SaaS de gestion de formacion, Learning Management Systems (LMS) y software de Recursos Humanos. Periodo analizado: 2024-2026.

---

## Indice

1. [Catalogo de Formacion y Gestion de Cursos](#1-catalogo-de-formacion-y-gestion-de-cursos)
2. [Perfil de Formacion del Empleado](#2-perfil-de-formacion-del-empleado)
3. [Creacion de Planes de Formacion y Vistas de Calendario](#3-creacion-de-planes-de-formacion-y-vistas-de-calendario)
4. [Gestion de Proveedores / Vendors](#4-gestion-de-proveedores--vendors)
5. [Flujo de Solicitud de Analisis de Necesidades Formativas (TNA)](#5-flujo-de-solicitud-de-analisis-de-necesidades-formativas-tna)
6. [Gestion de Inscripciones y Lista de Espera](#6-gestion-de-inscripciones-y-lista-de-espera)
7. [Operaciones Masivas (Bulk Operations)](#7-operaciones-masivas-bulk-operations)
8. [Patrones Especificos FUNDAE / Compliance en Software HR Espanol](#8-patrones-especificos-fundae--compliance-en-software-hr-espanol)
9. [Patrones Transversales de Navegacion y Layout](#9-patrones-transversales-de-navegacion-y-layout)
10. [Dashboard y Metricas de Formacion](#10-dashboard-y-metricas-de-formacion)
11. [Componentes UI Recurrentes](#11-componentes-ui-recurrentes)

---

## 1. Catalogo de Formacion y Gestion de Cursos

### 1.1 Patron: Catalogo en Grid de Cards con Modos de Vista Intercambiables

**Que es:**
La vista principal del catalogo de formacion se presenta como un grid responsive de tarjetas (cards) que muestran la informacion esencial de cada curso. Los usuarios pueden alternar entre multiples modos de visualizacion: Card/Grid, List, Stream y Calendar.

**Quien lo usa:**
- **Docebo**: Ofrece cinco modos de display para catalogos: Default, Stream, Card, List y Calendar. Cuando se muestra un unico catalogo, el administrador elige el modo de presentacion. El modo Default permite ademas preseleccionar filtros de "Tipo" y "Precio".
- **TalentLMS**: En su rediseno de julio 2024, introdujo una homepage con widgets arrastrables por rol (administrador, instructor, learner). El catalogo utiliza tarjetas con thumbnails configurables.
- **Workday Learning**: Organiza su tab "Discover" en secciones semanticas: "Most Popular", "Recently Added", "Recommended for You" y "Based on Your Interests", cada una con tarjetas de contenido ampliadas.
- **Cornerstone OnDemand**: Presenta resultados de catalogo en tabla con ordenacion por titulo (defecto), con filtros laterales facetados.

**Por que funciona:**
- Las tarjetas (cards) explotan el reconocimiento visual frente al recuerdo: el thumbnail, titulo y badge de estado conforman un patron escaneble en menos de 2 segundos.
- Multiples modos de vista permiten a distintos perfiles trabajar segun su preferencia: HR managers prefieren la vista de lista para analisis comparativo; learners prefieren cards para descubrimiento exploratorio.
- La segmentacion semantica ("Recomendados", "Populares") reduce la sobrecarga cognitiva al preorganizar el contenido por intencion de uso.

**Guia de implementacion:**

```html
<!-- Contenedor del catalogo con switch de vista -->
<div class="catalog-header">
  <div class="catalog-filters">
    <input type="search" placeholder="Buscar formacion..." />
    <select name="type">...</select>
    <select name="modality">...</select>
  </div>
  <div class="view-switcher">
    <button data-view="grid" class="active" aria-label="Vista grid">
      <svg><!-- grid icon --></svg>
    </button>
    <button data-view="list" aria-label="Vista lista">
      <svg><!-- list icon --></svg>
    </button>
    <button data-view="calendar" aria-label="Vista calendario">
      <svg><!-- calendar icon --></svg>
    </button>
  </div>
</div>

<!-- Grid de tarjetas -->
<div class="catalog-grid" role="list">
  <article class="course-card" role="listitem">
    <div class="course-card__thumbnail">
      <img src="..." alt="" />
      <span class="badge badge--modality">Presencial</span>
    </div>
    <div class="course-card__body">
      <span class="tag tag--category">Liderazgo</span>
      <h3 class="course-card__title">Gestion de Equipos</h3>
      <p class="course-card__meta">8h | Proveedor: IESE</p>
      <div class="course-card__footer">
        <span class="status-pill status-pill--open">Plazas disponibles</span>
        <button class="btn btn--primary btn--sm">Inscribirse</button>
      </div>
    </div>
  </article>
</div>
```

```css
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
}

/* Vista lista: cambia a una sola columna */
.catalog-grid[data-view="list"] {
  grid-template-columns: 1fr;
}

.catalog-grid[data-view="list"] .course-card {
  flex-direction: row;
  align-items: center;
}

.course-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-primary);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.course-card__thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.course-card__thumbnail .badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
}
```

```javascript
// Logica de cambio de vista
document.querySelectorAll('.view-switcher button').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelector('.catalog-grid').dataset.view = view;
    document.querySelectorAll('.view-switcher button')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
```

### 1.2 Patron: Busqueda Facetada con Filtros Laterales

**Que es:**
Un panel lateral (sidebar) de filtros que permite refinar resultados del catalogo por multiples facetas simultaneas, mostrando el conteo de resultados junto a cada opcion de filtro.

**Quien lo usa:**
- **Cornerstone OnDemand**: Filtros laterales en el lado izquierdo de la pagina de busqueda de Learning. Cada opcion muestra el numero de resultados entre parentesis. Soporta filtros por Unidad Organizativa (OU), campos personalizados, proveedor, idioma, tipo de formacion y duracion.
- **Docebo**: Filtros de catalogo por tipo de contenido, estado de inscripcion, proveedor, y campos personalizados.
- **SAP SuccessFactors**: Filtros avanzados por area profesional, modalidad, nivel de formacion y estado de compliance.

**Por que funciona:**
- Los contadores junto a cada filtro (e.g., "Presencial (23)") eliminan el estado de incertidumbre del usuario: sabe cuantos resultados obtendra antes de filtrar.
- La colocacion lateral mantiene los filtros visibles mientras se escanean los resultados, evitando la carga cognitiva de recordar criterios de busqueda.
- El patron de filtro progresivo (refinar paso a paso) sigue el modelo mental del usuario que va acotando desde lo general a lo especifico.

**Guia de implementacion:**

```html
<aside class="filter-sidebar" role="complementary" aria-label="Filtros">
  <div class="filter-group">
    <h4 class="filter-group__title">Modalidad</h4>
    <label class="filter-option">
      <input type="checkbox" name="modality" value="presencial" />
      <span>Presencial</span>
      <span class="filter-count">(14)</span>
    </label>
    <label class="filter-option">
      <input type="checkbox" name="modality" value="online" />
      <span>Online</span>
      <span class="filter-count">(28)</span>
    </label>
    <label class="filter-option">
      <input type="checkbox" name="modality" value="mixta" />
      <span>Mixta</span>
      <span class="filter-count">(7)</span>
    </label>
  </div>

  <div class="filter-group">
    <h4 class="filter-group__title">Estado</h4>
    <label class="filter-option">
      <input type="checkbox" name="status" value="abierta" />
      <span>Inscripcion abierta</span>
      <span class="filter-count">(32)</span>
    </label>
    <!-- Mas filtros... -->
  </div>

  <div class="filter-actions">
    <button class="btn btn--ghost">Limpiar filtros</button>
    <span class="results-count">49 formaciones encontradas</span>
  </div>
</aside>
```

```css
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-subtle);
  padding: 1.5rem;
  position: sticky;
  top: 64px; /* altura del header */
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.filter-group__title {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  cursor: pointer;
  font-size: 0.875rem;
}

.filter-count {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  margin-left: auto;
}
```

### 1.3 Patron: Secciones Semanticas de Descubrimiento

**Que es:**
En lugar de un catalogo plano, el contenido se organiza en secciones horizontales con significado contextual para el usuario: "Recomendado para ti", "Mas populares", "Anadidos recientemente", "Basado en tus intereses", "Formacion obligatoria pendiente".

**Quien lo usa:**
- **Workday Learning**: Organiza la tab "Discover" exactamente con estas secciones semanticas, alimentadas por modelos de IA de Workday Skills Cloud que usan NLP para analizar descripciones de puesto, reviews de desempeno e interacciones del usuario.
- **Docebo**: Utiliza IA para etiquetar automaticamente contenido formativo con skills relevantes, reduciendo la carga administrativa de gestion de contenido. Los learners ven dashboards personalizados con widgets de "Mis cursos" y planes de aprendizaje filtrados por estado.
- **Cornerstone**: Su Skills Graph categoriza automaticamente mas de 50.000 competencias unicas y recomienda contenido basado en el perfil del empleado y las brechas de skills detectadas.

**Por que funciona:**
- Replica el patron de plataformas de consumo (Netflix, Spotify) que los usuarios ya conocen, reduciendo la curva de aprendizaje.
- Las recomendaciones personalizadas por IA aumentan la relevancia percibida del contenido y reducen el "information overload".
- Las secciones priorizadas ("Obligatorio pendiente" arriba) guian al usuario hacia acciones criticas sin enterrarlas en el catalogo general.

**Guia de implementacion:**

```html
<section class="discovery-section">
  <div class="section-header">
    <h2 class="section-title">Formacion obligatoria pendiente</h2>
    <span class="section-badge section-badge--urgent">3 pendientes</span>
    <a href="#" class="section-link">Ver todas</a>
  </div>
  <div class="horizontal-scroll" role="list">
    <!-- Course cards en scroll horizontal -->
  </div>
</section>

<section class="discovery-section">
  <div class="section-header">
    <h2 class="section-title">Recomendado para ti</h2>
    <span class="section-subtitle">Basado en tu perfil y objetivos</span>
  </div>
  <div class="horizontal-scroll" role="list">
    <!-- Course cards -->
  </div>
</section>
```

```css
.discovery-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.section-badge--urgent {
  background: var(--color-error-subtle);
  color: var(--color-error);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.horizontal-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.horizontal-scroll .course-card {
  scroll-snap-align: start;
  flex: 0 0 280px;
}
```

---

## 2. Perfil de Formacion del Empleado

### 2.1 Patron: Vista de Perfil con Tabs de Historial, Certificaciones y Compliance

**Que es:**
El perfil formativo del empleado se estructura en un layout de tabs/pestanas que separa historial de formacion, certificaciones activas/expiradas, estado de compliance y planes de desarrollo.

**Quien lo usa:**
- **Docebo**: El perfil del learner muestra un widget de "Activity overview" con estadisticas de actividad (cursos inscritos, completados, en progreso, no iniciados) representadas con un grafico circular (pie chart). La pagina "My courses and learning plans" lista cada curso con una tarjeta que muestra progreso, estado de inscripcion, duracion y tipo de contenido.
- **BambooHR**: En su actualizacion UI 2024, movio la navegacion a la izquierda e introdujo tabs unificadas para Profile y Personal Settings. El "Employee Snapshot" muestra informacion clave del empleado en una vista consolidada.
- **Lattice Grow**: Muestra el track y nivel del empleado con competency matrices que definen skills por rol. El perfil incluye Individual Development Plans (IDPs) con objetivos a corto y largo plazo.
- **Kenjo**: Ofrece un "digital personnel file" centralizado donde se gestionan todas las cualificaciones, con alertas automaticas de renovacion antes de que una cualificacion expire.
- **Factorial**: El empleado accede desde su perfil a toda su informacion personal, documentos, ausencias y formaciones. Incluye alertas cuando las certificaciones estan proximas a caducar para auditorias, inspecciones de trabajo y normativas ISO.

**Por que funciona:**
- Las tabs reducen la sobrecarga visual al mostrar solo la informacion relevante para la tarea actual del usuario.
- El grafico de progreso (pie chart / donut chart) ofrece una evaluacion instantanea del estado general sin necesidad de leer datos tabulares.
- Las alertas de expiracion integradas en el perfil convierten una consulta pasiva en un disparador de accion.

**Guia de implementacion:**

```html
<div class="employee-training-profile">
  <!-- Header del perfil -->
  <header class="profile-header">
    <div class="profile-summary">
      <div class="avatar avatar--lg">AF</div>
      <div>
        <h1 class="profile-name">Ana Fernandez</h1>
        <p class="profile-role">Marketing Manager | Dept. Comunicacion</p>
      </div>
    </div>
    <div class="profile-stats">
      <div class="stat-card">
        <span class="stat-value">12</span>
        <span class="stat-label">Completadas</span>
      </div>
      <div class="stat-card stat-card--warning">
        <span class="stat-value">2</span>
        <span class="stat-label">Pendientes</span>
      </div>
      <div class="stat-card stat-card--danger">
        <span class="stat-value">1</span>
        <span class="stat-label">Cert. por expirar</span>
      </div>
    </div>
  </header>

  <!-- Tabs de navegacion -->
  <nav class="tabs" role="tablist">
    <button role="tab" aria-selected="true" class="tab active">
      Historial
    </button>
    <button role="tab" aria-selected="false" class="tab">
      Certificaciones
    </button>
    <button role="tab" aria-selected="false" class="tab">
      Compliance
      <span class="tab-badge tab-badge--warning">2</span>
    </button>
    <button role="tab" aria-selected="false" class="tab">
      Plan de Desarrollo
    </button>
  </nav>

  <!-- Panel de contenido del tab activo -->
  <div role="tabpanel" class="tab-panel">
    <!-- Contenido del historial -->
  </div>
</div>
```

```css
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--surface-secondary);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
}

.stat-card--warning {
  border-color: var(--color-warning);
  background: var(--color-warning-subtle);
}

.stat-card--danger {
  border-color: var(--color-error);
  background: var(--color-error-subtle);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border-subtle);
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab.active {
  color: var(--color-primary);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
}

.tab-badge--warning {
  background: var(--color-warning);
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  font-weight: 600;
}
```

### 2.2 Patron: Semaforo de Compliance con Alertas Escalonadas

**Que es:**
Un sistema de indicadores visuales tipo semaforo (verde/amarillo/rojo) que muestra el estado de compliance formativo del empleado, combinado con alertas automaticas escalonadas segun la proximidad de la fecha de expiracion.

**Quien lo usa:**
- **SAP SuccessFactors**: Asigna formacion obligatoria automaticamente basandose en roles, promociones o requisitos de compliance. La seccion de formacion requerida asignada se prioriza por fecha de vencimiento.
- **Factorial**: Envia alertas cuando los plazos se acercan o las certificaciones estan a punto de expirar, y permite definir fechas de renovacion con avisos automaticos.
- **Kenjo**: Proporciona alertas automaticas de renovacion antes de que expire una cualificacion.
- **Personio**: Integra con herramientas de seguimiento de expiracion que permiten configurar secuencias de recordatorio escalonadas (e.g., aviso a 90 dias, 30 dias, 7 dias).

**Por que funciona:**
- El sistema de semaforo es universalmente comprendido sin explicacion: verde = OK, amarillo = atencion, rojo = accion urgente.
- Las alertas escalonadas evitan el efecto "notification fatigue" al dosificar la urgencia de manera progresiva.
- Multiples stakeholders (empleado + manager + HR) reciben las alertas criticas, creando responsabilidad compartida.

**Guia de implementacion:**

```css
/* Sistema de semaforo para compliance */
.compliance-status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.compliance-status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.compliance-status--compliant {
  background: var(--color-success-subtle);
  color: var(--color-success-dark);
}
.compliance-status--compliant::before {
  background: var(--color-success);
}

.compliance-status--warning {
  background: var(--color-warning-subtle);
  color: var(--color-warning-dark);
}
.compliance-status--warning::before {
  background: var(--color-warning);
  animation: pulse 2s infinite;
}

.compliance-status--expired {
  background: var(--color-error-subtle);
  color: var(--color-error-dark);
}
.compliance-status--expired::before {
  background: var(--color-error);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### 2.3 Patron: Skills Matrix / Competency Matrix

**Que es:**
Una matriz visual que cruza roles (filas) con competencias (columnas), mostrando el nivel actual vs. el nivel esperado del empleado en cada competencia, con indicacion visual de gap.

**Quien lo usa:**
- **Cornerstone OnDemand**: Su Skills Matrix es una herramienta analitica que permite a usuarios, managers y administradores ver el estado de cualificacion de uno o mas usuarios para uno o mas roles. Identifica las competencias requeridas por un rol, las competencias individuales del empleado y cualquier gap entre ambas.
- **Lattice Grow**: Sus Competency Matrices definen skills y comportamientos requeridos para cada rol. Cada template incluye 4-6 niveles de puesto y 9-12 competencias organizadas en secciones: Impact, Behavior, Management y Functional Skills.
- **Docebo**: Ofrece dashboards de skills para learners y managers que permiten ver los niveles de competencia en cada skill seleccionada, creando una especie de training matrix.

**Por que funciona:**
- La visualizacion matricial permite comparacion instantanea entre estado actual y deseado.
- Los gaps visuales dirigen la atencion hacia areas que requieren formacion, facilitando la priorizacion.
- La estructura de roles x competencias conecta directamente la formacion con la carrera profesional del empleado.

**Guia de implementacion:**

```html
<table class="skills-matrix" role="grid">
  <thead>
    <tr>
      <th scope="col">Competencia</th>
      <th scope="col">Nivel actual</th>
      <th scope="col">Nivel esperado</th>
      <th scope="col">Gap</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Liderazgo de equipos</td>
      <td>
        <div class="skill-level" data-level="3" data-max="5">
          <div class="skill-level__bar" style="width: 60%"></div>
        </div>
      </td>
      <td>
        <div class="skill-level skill-level--target" data-level="4" data-max="5">
          <div class="skill-level__bar" style="width: 80%"></div>
        </div>
      </td>
      <td>
        <span class="gap-indicator gap-indicator--needs-work">-1</span>
      </td>
    </tr>
  </tbody>
</table>
```

```css
.skill-level {
  width: 120px;
  height: 8px;
  background: var(--surface-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.skill-level__bar {
  height: 100%;
  border-radius: 4px;
  background: var(--color-primary);
  transition: width 0.4s ease;
}

.skill-level--target .skill-level__bar {
  background: var(--color-primary-light);
  opacity: 0.5;
}

.gap-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
}

.gap-indicator--on-track {
  background: var(--color-success-subtle);
  color: var(--color-success);
}

.gap-indicator--needs-work {
  background: var(--color-warning-subtle);
  color: var(--color-warning-dark);
}

.gap-indicator--critical {
  background: var(--color-error-subtle);
  color: var(--color-error);
}
```

---

## 3. Creacion de Planes de Formacion y Vistas de Calendario

### 3.1 Patron: Wizard Multi-Step para Creacion de Planes Formativos

**Que es:**
Un formulario guiado en pasos secuenciales (stepper/wizard) que divide la creacion de un plan de formacion en fases logicas: datos generales, seleccion de cursos, asignacion de participantes, configuracion de calendario y revision final.

**Quien lo usa:**
- **Docebo**: La creacion de learning plans se realiza desde un menu dedicado accesible desde el icono de engranaje (Admin menu > E-learning > Learning plans). El flujo incluye: crear plan > configurar propiedades (tab Properties) > asignar cursos (tab Courses, indicando cuales son obligatorios) > inscribir usuarios.
- **SAP SuccessFactors**: Utiliza un flujo de creacion que incluye definicion de la accion formativa (codificacion, denominacion, objetivos, contenidos, modalidad, nivel) y posterior comunicacion del grupo formativo.
- **TalentLMS**: El flujo de creacion de ILT incluye pasos para definir nombre, descripcion, instructor asignado, horario y capacidad maxima.

**Por que funciona:**
- Reduce la carga cognitiva al dividir un proceso de 15-20 campos en 4-5 pasos con 3-5 campos cada uno.
- La barra de progreso del stepper genera efecto de compromiso (commitment bias): el usuario ve cuanto ha avanzado y es menos probable que abandone.
- La validacion por paso evita que el usuario llegue al final con errores acumulados.

**Guia de implementacion:**

```html
<div class="wizard">
  <!-- Stepper de progreso -->
  <nav class="wizard__stepper" aria-label="Progreso">
    <ol class="stepper">
      <li class="stepper__step stepper__step--completed" aria-current="false">
        <span class="stepper__indicator">
          <svg><!-- check icon --></svg>
        </span>
        <span class="stepper__label">Datos generales</span>
      </li>
      <li class="stepper__step stepper__step--active" aria-current="step">
        <span class="stepper__indicator">2</span>
        <span class="stepper__label">Seleccion de cursos</span>
      </li>
      <li class="stepper__step" aria-current="false">
        <span class="stepper__indicator">3</span>
        <span class="stepper__label">Participantes</span>
      </li>
      <li class="stepper__step" aria-current="false">
        <span class="stepper__indicator">4</span>
        <span class="stepper__label">Calendario</span>
      </li>
      <li class="stepper__step" aria-current="false">
        <span class="stepper__indicator">5</span>
        <span class="stepper__label">Revision</span>
      </li>
    </ol>
  </nav>

  <!-- Contenido del paso actual -->
  <div class="wizard__content">
    <h2>Seleccion de cursos para el plan</h2>
    <!-- Formulario del paso -->
  </div>

  <!-- Navegacion del wizard -->
  <footer class="wizard__footer">
    <button class="btn btn--ghost">Anterior</button>
    <div class="wizard__footer-right">
      <button class="btn btn--ghost">Guardar borrador</button>
      <button class="btn btn--primary">Siguiente</button>
    </div>
  </footer>
</div>
```

```css
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  list-style: none;
  margin: 0;
  position: relative;
}

/* Linea conectora entre pasos */
.stepper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 3rem;
  right: 3rem;
  height: 2px;
  background: var(--border-subtle);
  transform: translateY(-50%);
  z-index: 0;
}

.stepper__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
  position: relative;
}

.stepper__indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--surface-primary);
  border: 2px solid var(--border-subtle);
  color: var(--text-secondary);
}

.stepper__step--active .stepper__indicator {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.stepper__step--completed .stepper__indicator {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.stepper__label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.stepper__step--active .stepper__label {
  color: var(--color-primary);
  font-weight: 600;
}

.wizard__footer {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-subtle);
  margin-top: 2rem;
}

.wizard__footer-right {
  display: flex;
  gap: 0.75rem;
}
```

### 3.2 Patron: Vista de Calendario para Sesiones ILT

**Que es:**
Un calendario interactivo (semanal, mensual o agenda) que muestra sesiones de formacion instructor-led con codificacion por color, indicadores de capacidad y acciones contextuales.

**Quien lo usa:**
- **Training Orchestra**: Ofrece vistas de timeline en tiempo real y calendario con codificacion por color para identificar el estado de cada sesion (completamente agendada, en borrador, con conflictos). La asignacion de instructores se hace con un clic desde la vista de asignacion.
- **Docebo**: Soporta modo Calendar como uno de los cinco modos de display del catalogo, integrando sesiones ILT directamente en la vista.
- **TalentLMS**: Los calendarios ILT automatizados estan integrados con Google y Microsoft Outlook, incluyendo invitaciones, actualizaciones, notificaciones configurables y cancelaciones.
- **CYPHER Learning**: Ofrece la alternativa de alternar entre vistas semanal, anual o agenda para ver eventos especificos como conferencias web y deadlines.

**Por que funciona:**
- El calendario es el modelo mental natural para actividades con fecha y hora.
- La codificacion por color permite distinguir instantaneamente entre tipos de formacion, estados y disponibilidad.
- La integracion con calendarios externos (Google, Outlook) elimina la duplicacion de esfuerzo del usuario.

**Guia de implementacion:**

```css
/* Evento de calendario de formacion */
.calendar-event {
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1.3;
  cursor: pointer;
  border-left: 3px solid;
  margin-bottom: 2px;
}

.calendar-event--presencial {
  background: var(--color-primary-subtle);
  border-left-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.calendar-event--online {
  background: var(--color-info-subtle);
  border-left-color: var(--color-info);
  color: var(--color-info-dark);
}

.calendar-event--full {
  opacity: 0.6;
}

.calendar-event__capacity {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.calendar-event__capacity--almost-full {
  color: var(--color-warning);
}
```

---

## 4. Gestion de Proveedores / Vendors

### 4.1 Patron: Directorio de Proveedores con Vista Master-Detail

**Que es:**
Un listado principal de proveedores de formacion (master) que, al seleccionar uno, despliega un panel lateral (drawer/side panel) o vista de detalle con informacion completa del proveedor: datos de contacto, catalogo de cursos ofrecidos, historico de contrataciones, evaluaciones y contratos.

**Quien lo usa:**
- **Training Orchestra**: Gestiona contratos, tarifas, disponibilidad y cualificaciones de instructores, simplificando la asignacion entre formadores y sesiones. Incluye portales de colaboracion con dashboards que monitorizan carga de trabajo, feedback de clases, tasas de utilizacion y horas impartidas.
- **Cornerstone OnDemand**: Integra proveedores externos (edX, Udemy) con sincronizacion automatica de catalogo, manteniendo un registro centralizado de cada proveedor.
- **SAP SuccessFactors**: Se integra con SAP Fieldglass (gestion de proveedores) y SAP Ariba (procurement), habilitando un flujo de informacion continuo entre gestion de formacion y contratacion.

**Por que funciona:**
- El patron master-detail permite explorar proveedores sin perder el contexto del listado general.
- El drawer lateral mantiene la tabla de proveedores visible, facilitando la comparacion rapida.
- La centralizacion de datos del proveedor (catalogo + contratos + evaluaciones) elimina la fragmentacion de informacion entre diferentes sistemas.

**Guia de implementacion:**

```html
<div class="master-detail-layout">
  <!-- Panel master: listado de proveedores -->
  <div class="master-panel">
    <div class="master-panel__header">
      <h2>Proveedores de formacion</h2>
      <button class="btn btn--primary btn--sm">+ Nuevo proveedor</button>
    </div>
    <div class="master-panel__search">
      <input type="search" placeholder="Buscar proveedor..." />
    </div>
    <ul class="provider-list" role="listbox">
      <li class="provider-item provider-item--selected" role="option">
        <div class="provider-item__name">IESE Business School</div>
        <div class="provider-item__meta">12 cursos | Liderazgo, Estrategia</div>
        <span class="provider-item__badge">Activo</span>
      </li>
      <!-- Mas proveedores -->
    </ul>
  </div>

  <!-- Panel detail: informacion del proveedor seleccionado -->
  <aside class="detail-panel" aria-label="Detalle del proveedor">
    <header class="detail-panel__header">
      <h3>IESE Business School</h3>
      <button class="btn-icon" aria-label="Cerrar detalle">
        <svg><!-- close icon --></svg>
      </button>
    </header>
    <div class="detail-panel__content">
      <div class="detail-section">
        <h4>Informacion de contacto</h4>
        <!-- Datos del proveedor -->
      </div>
      <div class="detail-section">
        <h4>Catalogo de cursos</h4>
        <!-- Cursos ofrecidos -->
      </div>
      <div class="detail-section">
        <h4>Historico de contrataciones</h4>
        <!-- Tabla con historico -->
      </div>
    </div>
  </aside>
</div>
```

```css
.master-detail-layout {
  display: flex;
  height: calc(100vh - 64px);
  overflow: hidden;
}

.master-panel {
  width: 380px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.detail-panel {
  flex: 1;
  overflow-y: auto;
  background: var(--surface-primary);
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.provider-item {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 0.15s ease;
}

.provider-item:hover {
  background: var(--surface-hover);
}

.provider-item--selected {
  background: var(--color-primary-subtle);
  border-left: 3px solid var(--color-primary);
}
```

---

## 5. Flujo de Solicitud de Analisis de Necesidades Formativas (TNA)

### 5.1 Patron: Formulario de Solicitud con Workflow de Aprobacion

**Que es:**
Un flujo digital donde el empleado o manager solicita una formacion especifica a traves de un formulario estructurado. La solicitud pasa por un workflow de aprobacion (manager directo -> HR -> responsable de presupuesto) con estados visibles y notificaciones en cada transicion.

**Quien lo usa:**
- **Personio**: Permite configurar workflows de solicitud de formacion con aprobacion del manager directo y HR, tracking de costes vinculado al perfil del empleado y actualizacion automatica de la informacion de formacion tras la aprobacion.
- **SAP SuccessFactors**: Implementa reglas de asignacion de aprendizaje a traves de business rules, permitiendo asignaciones automaticas y manuales con workflows de aprobacion configurables.
- **Factorial**: Vincula cursos con evaluaciones de desempeno, procesos de onboarding y planes de carrera, creando un flujo natural desde la deteccion de necesidad hasta la asignacion de formacion.
- **Cognota**: Ofrece una herramienta centralizada para gestionar el proceso completo de intake de formacion, incluyendo formularios de solicitud de formacion que permiten realizar un TNA desde el primer contacto.

**Por que funciona:**
- El workflow visible reduce la ansiedad del solicitante: sabe exactamente donde esta su solicitud y quien debe aprobarla.
- Las reglas automaticas (e.g., "si el coste es < X EUR, aprobacion directa del manager; si > X EUR, requiere aprobacion de HR") agilizan solicitudes rutinarias.
- La vinculacion con evaluaciones de desempeno proporciona contexto al aprobador, facilitando decisiones informadas.

**Guia de implementacion:**

```html
<!-- Timeline de aprobacion -->
<div class="approval-workflow" role="list">
  <div class="workflow-step workflow-step--completed" role="listitem">
    <div class="workflow-step__connector"></div>
    <div class="workflow-step__icon">
      <svg><!-- check icon --></svg>
    </div>
    <div class="workflow-step__content">
      <span class="workflow-step__title">Solicitud enviada</span>
      <span class="workflow-step__meta">Ana Fernandez | 12 mar 2026</span>
    </div>
  </div>

  <div class="workflow-step workflow-step--active" role="listitem">
    <div class="workflow-step__connector"></div>
    <div class="workflow-step__icon">
      <div class="pulse-dot"></div>
    </div>
    <div class="workflow-step__content">
      <span class="workflow-step__title">Pendiente aprobacion manager</span>
      <span class="workflow-step__meta">Carlos Lopez | Asignado hace 2 dias</span>
      <div class="workflow-step__actions">
        <button class="btn btn--success btn--sm">Aprobar</button>
        <button class="btn btn--danger-ghost btn--sm">Rechazar</button>
      </div>
    </div>
  </div>

  <div class="workflow-step workflow-step--pending" role="listitem">
    <div class="workflow-step__connector"></div>
    <div class="workflow-step__icon">
      <span>3</span>
    </div>
    <div class="workflow-step__content">
      <span class="workflow-step__title">Revision RRHH</span>
      <span class="workflow-step__meta">Departamento de Formacion</span>
    </div>
  </div>
</div>
```

```css
.approval-workflow {
  padding: 1rem 0;
}

.workflow-step {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  position: relative;
}

/* Conector vertical entre pasos */
.workflow-step__connector {
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-subtle);
}

.workflow-step:first-child .workflow-step__connector {
  top: 50%;
}

.workflow-step:last-child .workflow-step__connector {
  bottom: 50%;
}

.workflow-step__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--surface-primary);
  border: 2px solid var(--border-subtle);
  color: var(--text-secondary);
}

.workflow-step--completed .workflow-step__icon {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.workflow-step--active .workflow-step__icon {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.workflow-step__title {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
}

.workflow-step__meta {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.workflow-step__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
```

### 5.2 Patron: Formulario de TNA con Campos Condicionales

**Que es:**
Un formulario de evaluacion de necesidades formativas donde los campos que se muestran al usuario dependen de sus respuestas anteriores. Por ejemplo, si el tipo de formacion es "Tecnica", aparecen campos de certificacion; si es "Soft skills", aparecen campos de competencias comportamentales.

**Quien lo usa:**
- **HR Cloud**: Ofrece un constructor de formularios personalizable con modo wizard, donde los administradores pueden ocultar columnas irrelevantes segun el tipo de solicitud y los usuarios pueden pausar y retomar el formulario.
- **Jotform (HR workflows)**: Proporciona flujos de aprobacion para RRHH con formularios condicionales y routing automatico.
- **OCM Solution**: Ofrece toolkits de TNA que incluyen templates con campos adaptativos a nivel organizacional, de grupo/rol y a nivel individual.

**Por que funciona:**
- Los campos condicionales reducen la longitud percibida del formulario, aumentando la tasa de completado.
- La relevancia contextual de cada campo mejora la calidad de los datos recogidos.
- La capacidad de guardar y retomar ("save and resume") acomoda a usuarios con agendas ocupadas.

---

## 6. Gestion de Inscripciones y Lista de Espera

### 6.1 Patron: Inscripcion con Indicadores de Capacidad y Waitlist Automatica

**Que es:**
Un sistema donde cada sesion formativa muestra visualmente su capacidad (plazas totales, ocupadas, disponibles), y al llenarse, habilita automaticamente una lista de espera con posicion del usuario y estimacion de probabilidad de plaza.

**Quien lo usa:**
- **360Learning**: En 2024 anadio waitlist para sesiones de paths con auto-inscripcion. Los instructores y administradores pueden limitar el numero de plazas de auto-registro, y cuando se alcanzan, los learners ven la opcion de unirse a la lista de espera.
- **Docebo**: Gestiona inscripciones de cursos y sesiones con estados diferenciados (No iniciado, En progreso, Completado). Los usuarios pueden filtrar por estado de inscripcion, tipo de contenido, deadline y prioridad (obligatorio, requerido, recomendado, opcional). Soporta ordenacion por fecha de inscripcion y fecha de expiracion.
- **Training Orchestra**: Permite verificar instantaneamente si un curso esta completo o abierto para inscripcion desde la vista de calendario, con codificacion por color de ubicaciones.
- **SAP SuccessFactors**: Asigna automaticamente formacion basada en reglas de negocio (enrollment rules) que operan sobre e-learning, ILT y learning plans.

**Por que funciona:**
- La visualizacion de capacidad (e.g., "12/15 plazas") crea urgencia social (social proof + scarcity).
- La transicion fluida de "Inscribirse" a "Unirse a lista de espera" evita el dead-end frustrante de "curso completo".
- La posicion en la lista de espera proporciona transparencia y reduce la ansiedad de incertidumbre.

**Guia de implementacion:**

```html
<div class="enrollment-card">
  <div class="enrollment-card__header">
    <h3>Gestion Agil de Proyectos</h3>
    <span class="session-date">25 abr 2026 | 09:00-17:00</span>
  </div>

  <!-- Barra de capacidad -->
  <div class="capacity-bar">
    <div class="capacity-bar__fill" style="width: 80%"></div>
    <span class="capacity-bar__label">12 / 15 plazas</span>
  </div>

  <!-- Estados de accion -->
  <div class="enrollment-actions">
    <!-- Estado: plazas disponibles -->
    <button class="btn btn--primary">Inscribirse</button>

    <!-- Estado: casi lleno (se muestra cuando > 80%) -->
    <!-- <button class="btn btn--primary">
      Inscribirse
      <span class="btn__hint">Ultimas 3 plazas</span>
    </button> -->

    <!-- Estado: completo, con waitlist -->
    <!-- <button class="btn btn--secondary">
      Unirse a lista de espera
    </button>
    <p class="waitlist-info">Posicion estimada: #3</p> -->
  </div>
</div>
```

```css
.capacity-bar {
  position: relative;
  height: 8px;
  background: var(--surface-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin: 0.75rem 0;
}

.capacity-bar__fill {
  height: 100%;
  border-radius: 4px;
  background: var(--color-primary);
  transition: width 0.4s ease;
}

/* Indicador de "casi lleno" */
.capacity-bar__fill[style*="width: 8"],
.capacity-bar__fill[style*="width: 9"],
.capacity-bar__fill[style*="width: 100"] {
  background: var(--color-warning);
}

.capacity-bar__label {
  position: absolute;
  right: 0;
  top: -1.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.waitlist-info {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn__hint {
  display: block;
  font-size: 0.6875rem;
  font-weight: 400;
  opacity: 0.8;
}
```

### 6.2 Patron: Filtrado y Ordenacion de Inscripciones por Prioridad

**Que es:**
Las inscripciones del usuario se pueden filtrar y ordenar segun multiples criterios jerarquicos: estado de inscripcion, tipo de contenido, deadline, prioridad (obligatorio > requerido > recomendado > opcional) y fecha.

**Quien lo usa:**
- **Docebo**: Soporta filtros por estado de inscripcion (No iniciado, En progreso, Completado), tipo de contenido (E-Learning, ILT, Learning Plan), deadline de contenido y prioridad de inscripcion (obligatorio, requerido, recomendado, opcional). Permite ordenar por nombre A-Z, nombre Z-A, inscripcion mas reciente/antigua, y fecha de expiracion mas cercana/lejana.
- **SAP SuccessFactors**: La formacion requerida asignada se prioriza por defecto por fecha de vencimiento.

**Por que funciona:**
- La priorizacion automatica (obligatorio primero) guia al usuario hacia las acciones mas importantes sin esfuerzo de busqueda.
- Los multiples criterios de ordenacion acomodan distintos flujos de trabajo: HR busca por prioridad; el empleado busca por fecha.

---

## 7. Operaciones Masivas (Bulk Operations)

### 7.1 Patron: Barra de Acciones Masivas Flotante con Seleccion por Checkbox

**Que es:**
Un toolbar contextual que aparece (sticky o floating) cuando el usuario selecciona uno o mas items mediante checkboxes en una tabla o lista. El toolbar muestra el contador de elementos seleccionados y las acciones disponibles, y desaparece al deseleccionar.

**Quien lo usa:**
- **Cornerstone OnDemand**: Permite seleccionar multiples usuarios para inscripcion masiva desde las reglas de enrollment.
- **Docebo**: Soporta enrollment rules que operan sobre grupos y branches, permitiendo asignacion masiva a cursos, ILT y learning plans.
- **Factorial**: Permite asignar cursos a multiples empleados simultaneamente desde la vista de gestion de formacion.
- **Patron general SaaS**: Google Workspace, Notion, Linear y la mayoria de plataformas B2B usan este patron estandarizado.

**Por que funciona:**
- La aparicion contextual del toolbar reduce el ruido visual: las acciones solo se muestran cuando son relevantes.
- El contador de seleccion proporciona feedback inmediato de "cuantos items estoy a punto de afectar", previniendo acciones no intencionadas.
- La persistencia del bar durante el scroll evita perder el contexto de seleccion al navegar listas largas.

**Guia de implementacion:**

```html
<!-- Tabla con seleccion multiple -->
<table class="data-table" role="grid">
  <thead>
    <tr>
      <th class="col-select">
        <input type="checkbox"
               class="select-all"
               aria-label="Seleccionar todos"
               indeterminate />
      </th>
      <th>Empleado</th>
      <th>Departamento</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr class="row-selected">
      <td><input type="checkbox" checked /></td>
      <td>Ana Fernandez</td>
      <td>Marketing</td>
      <td><span class="status-pill status-pill--pending">Pendiente</span></td>
      <td>...</td>
    </tr>
    <!-- Mas filas -->
  </tbody>
</table>

<!-- Barra de acciones masivas (aparece con seleccion) -->
<div class="bulk-action-bar" role="toolbar" aria-label="Acciones masivas">
  <div class="bulk-action-bar__info">
    <input type="checkbox" checked aria-hidden="true" />
    <span class="bulk-action-bar__count">3 seleccionados</span>
    <button class="btn-link">Seleccionar los 47 empleados</button>
  </div>
  <div class="bulk-action-bar__actions">
    <button class="btn btn--primary btn--sm">
      <svg><!-- enroll icon --></svg>
      Inscribir en formacion
    </button>
    <button class="btn btn--ghost btn--sm">
      <svg><!-- email icon --></svg>
      Enviar notificacion
    </button>
    <button class="btn-icon btn--ghost" aria-label="Mas acciones">
      <svg><!-- more icon --></svg>
    </button>
  </div>
</div>
```

```css
.bulk-action-bar {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-inverse);
  color: var(--text-inverse);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  min-width: 600px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  z-index: 1000;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.bulk-action-bar__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.bulk-action-bar__count {
  font-weight: 600;
}

.bulk-action-bar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Fila seleccionada en la tabla */
.row-selected {
  background: var(--color-primary-subtle);
}

/* Cuando hay seleccion, el toolbar de tabla se oculta */
.data-table[data-has-selection="true"] .table-toolbar {
  display: none;
}
```

```javascript
// Logica basica de seleccion masiva
class BulkActionManager {
  constructor(tableEl, barEl) {
    this.table = tableEl;
    this.bar = barEl;
    this.selectedIds = new Set();
    this.init();
  }

  init() {
    // Listener para checkboxes individuales
    this.table.querySelectorAll('tbody input[type="checkbox"]')
      .forEach(cb => {
        cb.addEventListener('change', (e) => {
          const id = e.target.closest('tr').dataset.id;
          if (e.target.checked) {
            this.selectedIds.add(id);
            e.target.closest('tr').classList.add('row-selected');
          } else {
            this.selectedIds.delete(id);
            e.target.closest('tr').classList.remove('row-selected');
          }
          this.updateBar();
        });
      });

    // Listener para "seleccionar todos"
    this.table.querySelector('.select-all')
      .addEventListener('change', (e) => {
        this.table.querySelectorAll('tbody input[type="checkbox"]')
          .forEach(cb => {
            cb.checked = e.target.checked;
            cb.dispatchEvent(new Event('change'));
          });
      });
  }

  updateBar() {
    const count = this.selectedIds.size;
    if (count > 0) {
      this.bar.style.display = 'flex';
      this.bar.querySelector('.bulk-action-bar__count')
        .textContent = `${count} seleccionado${count > 1 ? 's' : ''}`;
    } else {
      this.bar.style.display = 'none';
    }
    this.table.dataset.hasSelection = count > 0;
  }
}
```

### 7.2 Patron: Comunicaciones Masivas con Preview y Personalizacion

**Que es:**
Un flujo que permite enviar notificaciones/emails a multiples empleados con plantillas predefinidas, variables de personalizacion (nombre, curso, fecha) y preview antes del envio.

**Quien lo usa:**
- **TalentLMS**: Permite guardar templates de comunicacion en la plataforma para reutilizarlos cada vez que se quiera informar a los learners sobre una nueva sesion formativa, con notificaciones configurables para instructores y learners.
- **360Learning**: Soporta notificaciones automatizadas de inscripcion y tracking de compliance con enrollment automatizado.
- **SAP SuccessFactors**: Automatiza el envio de recordatorios y asignaciones de formacion obligatoria a traves de business rules.

**Por que funciona:**
- Las variables de personalizacion (e.g., "{nombre}, tu curso de {titulo_curso} empieza el {fecha}") mejoran drasticamente las tasas de apertura respecto a comunicaciones genericas.
- El preview antes del envio masivo previene errores costosos y da confianza al emisor.
- Las plantillas reutilizables eliminan el esfuerzo repetitivo y garantizan consistencia en la comunicacion.

**Guia de implementacion:**

```html
<div class="mass-comm-composer">
  <div class="composer-sidebar">
    <h3>Plantillas</h3>
    <ul class="template-list">
      <li class="template-item template-item--active">
        Convocatoria de formacion
      </li>
      <li class="template-item">Recordatorio de inscripcion</li>
      <li class="template-item">Confirmacion de plaza</li>
    </ul>

    <h3>Variables disponibles</h3>
    <div class="variable-chips">
      <button class="chip" data-var="nombre">{nombre}</button>
      <button class="chip" data-var="curso">{curso}</button>
      <button class="chip" data-var="fecha">{fecha}</button>
      <button class="chip" data-var="ubicacion">{ubicacion}</button>
    </div>
  </div>

  <div class="composer-main">
    <div class="composer-field">
      <label>Asunto</label>
      <input type="text"
             value="Convocatoria: {curso} - {fecha}" />
    </div>
    <div class="composer-field">
      <label>Destinatarios</label>
      <div class="recipient-display">
        <span class="recipient-count">47 empleados seleccionados</span>
        <button class="btn-link">Ver listado</button>
      </div>
    </div>
    <div class="composer-field">
      <label>Mensaje</label>
      <div class="rich-editor" contenteditable="true">
        Estimado/a {nombre},<br><br>
        Te informamos de que has sido convocado/a...
      </div>
    </div>
    <div class="composer-footer">
      <button class="btn btn--ghost">Vista previa</button>
      <button class="btn btn--primary">Enviar a 47 empleados</button>
    </div>
  </div>

  <!-- Panel de preview -->
  <div class="composer-preview">
    <h4>Vista previa (Ana Fernandez)</h4>
    <div class="email-preview">
      Estimado/a Ana Fernandez,<br><br>
      Te informamos de que has sido convocado/a...
    </div>
    <div class="preview-nav">
      <button>&larr; Anterior</button>
      <span>1 / 47</span>
      <button>Siguiente &rarr;</button>
    </div>
  </div>
</div>
```

---

## 8. Patrones Especificos FUNDAE / Compliance en Software HR Espanol

### 8.1 Patron: Estructura de Datos FUNDAE (Empresa > Acciones > Grupos > Participantes > Costes)

**Que es:**
La interfaz del aplicativo FUNDAE de Formacion Programada por las Empresas sigue una jerarquia estricta de 5 niveles que todo software espanol de gestion de formacion bonificada debe reflejar:
1. **Empresa** (datos de la entidad bonificada)
2. **Acciones Formativas** (codificacion, denominacion, objetivos, contenidos, modalidad, nivel, clasificacion, area profesional)
3. **Grupos** (comunicacion de inicio, horarios, ubicacion)
4. **Participantes** (datos del trabajador via NIF, con carga masiva XML)
5. **Costes** (cuota de formacion, credito disponible, bonificaciones)

**Quien lo usa:**
- **Aplicativo FUNDAE**: La aplicacion oficial tiene tres perfiles de acceso (Empresa Bonificada, Grupo de Empresas, Entidad Organizadora) y cuatro tipos de usuario (Administrador, Gestor, Grabador, Consultor). La navegacion sigue la jerarquia descrita con pestanas.
- **Gesbon**: Software ERP para formacion bonificada que replica la estructura de FUNDAE pero con automatizacion. Permite trabajar el dia a dia en Gesbon y trasportar los datos a FUNDAE via XML. Implementa los tres perfiles (organizadora, bonificada, grupo de empresas) y gestiona firma digitalizada con datos biometricos.
- **Factorial**: Vincula la gestion de formacion con FUNDAE, permitiendo calcular rapidamente las subvenciones para cada formacion y garantizando el control documental para el cumplimiento normativo.

**Por que funciona:**
- Reflejar la estructura de FUNDAE reduce la carga cognitiva para gestores que ya conocen el aplicativo oficial.
- La carga masiva via XML (NIF de participantes) elimina la entrada manual de datos repetitivos.
- Los tres perfiles de acceso (organizadora, bonificada, grupo) mapean directamente a los roles del ecosistema FUNDAE, evitando confusion de permisos.

**Guia de implementacion:**

```html
<!-- Navegacion tipo breadcrumb que refleja la jerarquia FUNDAE -->
<nav class="fundae-breadcrumb" aria-label="Jerarquia FUNDAE">
  <ol>
    <li><a href="#">Empresa: Acme Corp</a></li>
    <li><a href="#">AF-001: Prevencion de Riesgos</a></li>
    <li><a href="#">Grupo 1 (15 ene - 28 feb)</a></li>
    <li aria-current="page">Participantes (18)</li>
  </ol>
</nav>

<!-- Tabs que reflejan las secciones del aplicativo FUNDAE -->
<nav class="fundae-tabs" role="tablist">
  <button role="tab" class="tab active">
    Datos Empresa
    <span class="tab-status tab-status--ok"></span>
  </button>
  <button role="tab" class="tab">
    Acciones Formativas
    <span class="tab-count">3</span>
  </button>
  <button role="tab" class="tab">
    Grupos
    <span class="tab-count">5</span>
  </button>
  <button role="tab" class="tab">
    Participantes
    <span class="tab-count">47</span>
  </button>
  <button role="tab" class="tab">
    Costes
    <span class="tab-status tab-status--pending"></span>
  </button>
</nav>
```

```css
.fundae-breadcrumb ol {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0.75rem 1rem;
  background: var(--surface-secondary);
  border-radius: 8px;
  font-size: 0.8125rem;
}

.fundae-breadcrumb li:not(:last-child)::after {
  content: '>';
  margin-left: 0.5rem;
  color: var(--text-tertiary);
}

.fundae-breadcrumb li:last-child {
  color: var(--text-primary);
  font-weight: 600;
}

.tab-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 0.375rem;
}

.tab-status--ok {
  background: var(--color-success);
}

.tab-status--pending {
  background: var(--color-warning);
  animation: pulse 2s infinite;
}

.tab-status--error {
  background: var(--color-error);
}

.tab-count {
  background: var(--surface-tertiary);
  padding: 0.0625rem 0.375rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  margin-left: 0.25rem;
}
```

### 8.2 Patron: Cuadro de Mando de Credito Formativo

**Que es:**
Un dashboard visual que muestra en tiempo real el credito de formacion disponible para la empresa, el credito consumido, el credito comprometido (en formaciones en curso) y el credito restante, con indicadores de alerta cuando se acerca al limite.

**Quien lo usa:**
- **Gesbon**: Centraliza la gestion de costes con informacion de la cuota de formacion profesional y plantilla de las empresas (datos validados por la TGSS).
- **Factorial**: Garantiza el control de costes y la inversion de cada curso, con calculo rapido de subvenciones.
- **Aplicativo FUNDAE**: Muestra credito disponible resultante de aplicar el porcentaje de bonificacion (segun tamano de empresa) al total cotizado por Formacion Profesional del ano anterior.

**Por que funciona:**
- La visualizacion del credito como "barra de consumo" con umbrales (verde < 60%, amarillo 60-80%, rojo > 80%) permite toma de decisiones rapida sobre si aprobar mas formaciones.
- Los estados "validado" y "pendiente de validacion" (TGSS) dan transparencia sobre la fiabilidad del dato.

**Guia de implementacion:**

```html
<div class="credit-dashboard">
  <div class="credit-card">
    <h3 class="credit-card__title">Credito Formativo 2026</h3>
    <div class="credit-card__amount">
      <span class="credit-card__value">&euro;4.200</span>
      <span class="credit-card__label">Credito total disponible</span>
    </div>

    <!-- Barra de consumo segmentada -->
    <div class="credit-bar">
      <div class="credit-bar__segment credit-bar__consumed"
           style="width: 45%" title="Consumido: 1.890 EUR">
      </div>
      <div class="credit-bar__segment credit-bar__committed"
           style="width: 20%" title="Comprometido: 840 EUR">
      </div>
    </div>

    <div class="credit-legend">
      <span class="legend-item">
        <span class="legend-dot legend-dot--consumed"></span>
        Consumido: &euro;1.890
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--committed"></span>
        Comprometido: &euro;840
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--available"></span>
        Disponible: &euro;1.470
      </span>
    </div>

    <div class="credit-card__footer">
      <span class="validation-status">
        <svg><!-- info icon --></svg>
        Datos TGSS: pendiente de validacion definitiva
      </span>
    </div>
  </div>
</div>
```

```css
.credit-dashboard {
  max-width: 480px;
}

.credit-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.5rem;
}

.credit-card__value {
  font-size: 2rem;
  font-weight: 700;
  display: block;
  line-height: 1;
}

.credit-card__label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.credit-bar {
  display: flex;
  height: 12px;
  background: var(--surface-tertiary);
  border-radius: 6px;
  overflow: hidden;
  margin: 1.25rem 0 1rem;
}

.credit-bar__consumed {
  background: var(--color-primary);
}

.credit-bar__committed {
  background: var(--color-warning);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(255,255,255,0.2) 4px,
    rgba(255,255,255,0.2) 8px
  );
}

.credit-legend {
  display: flex;
  gap: 1.25rem;
  font-size: 0.8125rem;
  flex-wrap: wrap;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.25rem;
}

.legend-dot--consumed { background: var(--color-primary); }
.legend-dot--committed { background: var(--color-warning); }
.legend-dot--available { background: var(--surface-tertiary); }

.validation-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: 1rem;
}
```

### 8.3 Patron: Firma Digital y Documentacion Automatizada

**Que es:**
Generacion automatica de documentacion requerida por FUNDAE (controles de asistencia, declaraciones responsables, diplomas) con firma digital integrada, captura biometrica y flujo de validacion.

**Quien lo usa:**
- **Gesbon**: Permite firma electronica de responsables de formacion, personal de imparticion y asistentes mediante captura de firma digitalizada o con datos biometricos. Los documentos firmables incluyen: control de asistencia, declaracion responsable, recibi de diploma y evaluacion. En 2025 gestiono con firma digitalizada mas de 350 empresas con plantilla de mas de 50.000 personas.
- **Aplicativo FUNDAE (2025)**: Incluye firma digital como novedad importante del ejercicio 2025.
- **Docebo**: Soporta QR code attendance tracking para eventos ILT en su app movil (version 6.8.0).

**Por que funciona:**
- La firma digital elimina la logistica de documentos impresos, reduciendo errores y tiempos de gestion.
- La captura biometrica proporciona mayor seguridad juridica que la firma manuscrita escaneada.
- La generacion automatica a partir de plantillas garantiza la uniformidad documental requerida por la normativa.

---

## 9. Patrones Transversales de Navegacion y Layout

### 9.1 Patron: Sidebar de Navegacion Vertical con Iconos

**Que es:**
La navegacion principal de la aplicacion se ubica en un panel lateral izquierdo con iconos + texto, colapsable a solo iconos para maximizar el area de contenido. Incluye secciones jerarquicas agrupadas por modulo funcional.

**Quien lo usa:**
- **BambooHR (2024)**: Movio su navegacion a la izquierda en la actualizacion UI 2024, argumentando que "los barras de navegacion laterales se han vuelto cada vez mas comunes en la web moderna, y el diseno vertical con foco en iconografia se alinea mejor con el uso diario de la plataforma".
- **TalentLMS (2024)**: En su rediseno de julio 2024, mantuvo el menu principal en el lado izquierdo con un boton "Menu" para ocultarlo y ganar espacio de pantalla.
- **Personio**: Utiliza un panel lateral izquierdo modular con breadcrumbs y vistas multi-tab dentro de cada modulo.
- **Workday Learning**: Introdujo un sidebar menu para alternar entre Learning Home, My Learning y Discover.
- **Lattice**: Usa una barra de navegacion izquierda con homepage como punto de entrada, con controles desplazados al lado izquierdo en su Analytics Explorer para mejorar la accesibilidad.

**Por que funciona:**
- La navegacion lateral acomoda mas items que una barra horizontal sin requerir menus desplegables profundos.
- La posicion izquierda sigue el patron natural de lectura occidental (izquierda a derecha).
- El colapso a iconos proporciona un compromiso entre navegabilidad y espacio de contenido.
- Los iconos + texto reducen la ambiguedad frente a solo iconos.

**Guia de implementacion:**

```html
<nav class="sidebar" aria-label="Navegacion principal">
  <div class="sidebar__header">
    <img src="logo.svg" alt="Logo" class="sidebar__logo" />
    <button class="sidebar__toggle" aria-label="Colapsar menu">
      <svg><!-- chevron icon --></svg>
    </button>
  </div>

  <ul class="sidebar__menu">
    <li class="sidebar__group">
      <span class="sidebar__group-label">Formacion</span>
      <ul>
        <li class="sidebar__item sidebar__item--active">
          <a href="#">
            <svg class="sidebar__icon"><!-- catalog icon --></svg>
            <span class="sidebar__text">Catalogo</span>
          </a>
        </li>
        <li class="sidebar__item">
          <a href="#">
            <svg class="sidebar__icon"><!-- calendar icon --></svg>
            <span class="sidebar__text">Calendario</span>
          </a>
        </li>
        <li class="sidebar__item">
          <a href="#">
            <svg class="sidebar__icon"><!-- people icon --></svg>
            <span class="sidebar__text">Inscripciones</span>
            <span class="sidebar__badge">3</span>
          </a>
        </li>
      </ul>
    </li>

    <li class="sidebar__group">
      <span class="sidebar__group-label">FUNDAE</span>
      <ul>
        <li class="sidebar__item">
          <a href="#">
            <svg class="sidebar__icon"><!-- document icon --></svg>
            <span class="sidebar__text">Acciones Formativas</span>
          </a>
        </li>
        <li class="sidebar__item">
          <a href="#">
            <svg class="sidebar__icon"><!-- euro icon --></svg>
            <span class="sidebar__text">Credito Formativo</span>
          </a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

```css
.sidebar {
  width: 260px;
  height: 100vh;
  background: var(--surface-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.2s ease;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar--collapsed .sidebar__text,
.sidebar--collapsed .sidebar__group-label,
.sidebar--collapsed .sidebar__badge {
  display: none;
}

.sidebar__item a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 0.15s ease, color 0.15s ease;
  margin: 0 0.5rem;
  min-height: 40px;
}

.sidebar__item a:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.sidebar__item--active a {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 500;
}

.sidebar__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar__group-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  padding: 1.25rem 1.5rem 0.5rem;
}

.sidebar__badge {
  margin-left: auto;
  background: var(--color-error);
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  font-weight: 600;
}

/* Responsive: sidebar como overlay en mobile */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }
}
```

### 9.2 Patron: Drawer / Side Panel para Detalle Contextual

**Que es:**
Un panel lateral que se desliza desde la derecha al hacer clic en un elemento de una lista o tabla, mostrando informacion detallada sin abandonar la vista principal. Diferente del modal en que no bloquea la interaccion con el fondo.

**Quien lo usa:**
- **Lattice**: Utiliza sidebar previews en la pagina de roles personalizados y en la vista de Analytics Explorer.
- **BambooHR**: El "Employee Snapshot" muestra informacion clave del empleado en una vista consolidada accesible desde el perfil.
- **Personio**: Usa vistas multi-tab dentro de modulos con breadcrumbs de navegacion.
- **Patron general SaaS (2024-2025)**: El drawer lateral se ha convertido en el patron dominante para la vista de detalle en aplicaciones de productividad, reemplazando progresivamente a los modales full-screen.

**Por que funciona:**
- Mantiene el contexto de la lista visible, permitiendo comparacion y navegacion rapida entre items.
- La animacion de deslizamiento (slide-in) es mas suave que la aparicion abrupta de un modal.
- En mobile, el drawer se comporta naturalmente como un bottom sheet, un patron que los usuarios moviles ya dominan.

**Guia de implementacion:**

```css
.detail-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 90vw;
  height: 100vh;
  background: var(--surface-primary);
  border-left: 1px solid var(--border-subtle);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 200;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-drawer--open {
  transform: translateX(0);
}

.detail-drawer__header {
  position: sticky;
  top: 0;
  background: var(--surface-primary);
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}

.detail-drawer__content {
  padding: 1.5rem;
}

/* En mobile, se convierte en bottom sheet */
@media (max-width: 768px) {
  .detail-drawer {
    width: 100%;
    top: auto;
    bottom: 0;
    height: 85vh;
    border-radius: 16px 16px 0 0;
    transform: translateY(100%);
    border-left: none;
  }

  .detail-drawer--open {
    transform: translateY(0);
  }
}
```

---

## 10. Dashboard y Metricas de Formacion

### 10.1 Patron: Dashboard con KPI Cards + Graficos de Tendencia

**Que es:**
Un dashboard de gestion de formacion organizado en tres capas visuales: (1) KPI cards en la parte superior con metricas headline, (2) graficos de tendencia y comparacion en el centro, y (3) tablas de detalle/accion en la parte inferior.

**Quien lo usa:**
- **Factorial**: Visualiza en tiempo real los resultados de las formaciones con metricas y analisis dentro de la plataforma, permite identificar areas de mejora y generar informes sobre la efectividad de las formaciones.
- **Docebo**: El widget "Activity overview" muestra estadisticas del usuario con graficos circulares (pie chart) para distribucion de estados (completados, en progreso, no iniciados).
- **Lattice**: Su Analytics Explorer rediseado en 2024 mueve controles al lado izquierdo y permite cambiar el eje X a cualquier campo para visualizaciones personalizables.
- **Training Orchestra**: Dashboards para instructores que monitorizan carga de trabajo, feedback de clases, tasas de utilizacion y horas impartidas.

**Por que funciona:**
- La estructura en tres capas (resumen > tendencia > detalle) sigue el principio de "overview first, zoom and filter, then details on demand" de Shneiderman.
- Los KPI cards proporcionan la respuesta a "como estamos" en menos de 5 segundos.
- Los graficos de tendencia responden a "hacia donde vamos" sin requerir analisis numerico.
- 5-8 indicadores bien elegidos proporcionan una vision completa sin saturacion.

**Metricas clave recomendadas (2024-2026):**
- **Time-to-skill**: Tiempo promedio para que un empleado alcance un nivel definido de autonomia.
- **Overall engagement rate**: Combina colaboracion, interacciones y consistencia en el aprendizaje.
- **Training-job adequacy index**: Correlacion entre el contenido formativo completado y las competencias realmente movilizadas.
- **Coste por participante**: Inversion total dividida entre participantes unicos.
- **Tasa de completion**: Porcentaje de formaciones completadas vs. asignadas.
- **Credito FUNDAE consumido**: Porcentaje del credito anual utilizado.

**Guia de implementacion:**

```html
<div class="training-dashboard">
  <!-- Capa 1: KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-card__icon">
        <svg><!-- graduation cap --></svg>
      </div>
      <div class="kpi-card__data">
        <span class="kpi-card__value">847</span>
        <span class="kpi-card__label">Formaciones completadas</span>
      </div>
      <div class="kpi-card__trend kpi-card__trend--up">
        <svg><!-- arrow up --></svg>
        +12% vs Q anterior
      </div>
    </div>

    <div class="kpi-card">
      <div class="kpi-card__icon">
        <svg><!-- clock --></svg>
      </div>
      <div class="kpi-card__data">
        <span class="kpi-card__value">23 dias</span>
        <span class="kpi-card__label">Time-to-skill medio</span>
      </div>
      <div class="kpi-card__trend kpi-card__trend--down">
        <svg><!-- arrow down --></svg>
        -3 dias vs Q anterior
      </div>
    </div>

    <div class="kpi-card kpi-card--highlight">
      <div class="kpi-card__icon">
        <svg><!-- euro --></svg>
      </div>
      <div class="kpi-card__data">
        <span class="kpi-card__value">67%</span>
        <span class="kpi-card__label">Credito FUNDAE consumido</span>
      </div>
      <div class="kpi-card__progress">
        <div class="kpi-card__progress-bar" style="width: 67%"></div>
      </div>
    </div>

    <div class="kpi-card">
      <div class="kpi-card__data">
        <span class="kpi-card__value">92%</span>
        <span class="kpi-card__label">Tasa de compliance</span>
      </div>
      <div class="kpi-card__trend kpi-card__trend--up">
        <svg><!-- arrow up --></svg>
        +5pp vs Q anterior
      </div>
    </div>
  </div>

  <!-- Capa 2: Graficos -->
  <div class="charts-grid">
    <div class="chart-card">
      <h3>Formaciones por mes</h3>
      <canvas id="monthly-chart"></canvas>
    </div>
    <div class="chart-card">
      <h3>Distribucion por modalidad</h3>
      <canvas id="modality-chart"></canvas>
    </div>
  </div>

  <!-- Capa 3: Tabla de accion -->
  <div class="action-table-card">
    <h3>Formaciones con atencion requerida</h3>
    <table class="data-table">
      <!-- Tabla con items que requieren accion -->
    </table>
  </div>
</div>
```

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kpi-card--highlight {
  border-color: var(--color-primary);
  border-width: 2px;
}

.kpi-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.kpi-card__label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.kpi-card__trend {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.kpi-card__trend--up {
  color: var(--color-success);
}

.kpi-card__trend--down {
  color: var(--color-error);
}

.kpi-card__progress {
  height: 6px;
  background: var(--surface-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.kpi-card__progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.25rem;
}

.chart-card h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 11. Componentes UI Recurrentes

### 11.1 Patron: Status Badges / Pills con Semantica de Color

**Que es:**
Pequenos indicadores visuales (badges o pills) que muestran el estado de un item usando color y texto. Usados extensivamente en tablas, cards y listas para comunicar estados de formacion (inscrito, en progreso, completado, cancelado, lista de espera).

**Quien lo usa:**
Todas las plataformas analizadas utilizan variantes de este patron. La convencion es universal en SaaS B2B.

**Convencion de colores estandar:**

| Estado | Color | Uso |
|--------|-------|-----|
| Completado / Conforme | Verde | Formacion finalizada, certificacion vigente |
| En progreso / Activo | Azul | Formacion en curso, inscripcion activa |
| Pendiente / Borrador | Amarillo/Ambar | Requiere accion, pendiente de aprobacion |
| Cancelado / Expirado | Rojo | Formacion cancelada, certificacion caducada |
| Lista de espera | Gris / Purpura | En cola de espera |
| Obligatorio | Rojo outline | Formacion mandatoria |
| Recomendado | Azul claro | Sugerencia no obligatoria |

**Guia de implementacion:**

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.1875rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
}

.status-pill::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Variantes */
.status-pill--completed {
  background: #ecfdf5;
  color: #065f46;
}
.status-pill--completed::before { background: #10b981; }

.status-pill--in-progress {
  background: #eff6ff;
  color: #1e40af;
}
.status-pill--in-progress::before { background: #3b82f6; }

.status-pill--pending {
  background: #fffbeb;
  color: #92400e;
}
.status-pill--pending::before { background: #f59e0b; }

.status-pill--cancelled {
  background: #fef2f2;
  color: #991b1b;
}
.status-pill--cancelled::before { background: #ef4444; }

.status-pill--waitlist {
  background: #f5f3ff;
  color: #5b21b6;
}
.status-pill--waitlist::before { background: #8b5cf6; }

.status-pill--mandatory {
  background: transparent;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
.status-pill--mandatory::before { background: #ef4444; }
```

### 11.2 Patron: Empty States Educativos

**Que es:**
Pantallas que se muestran cuando una seccion no tiene contenido todavia (first-time use), no hay resultados de busqueda, o el usuario ha completado todas las tareas pendientes. Combinan ilustracion, texto explicativo y CTA claro.

**Quien lo usa:**
- Patron universal en SaaS moderno, con implementaciones destacadas en **Linear**, **Notion** y **TalentLMS** (que usa empty states en su catalogo de cursos y dashboard del learner).

**Tipos de empty state en formacion:**
1. **First-time use**: "Aun no tienes formaciones asignadas. Explora el catalogo para inscribirte."
2. **Sin resultados de busqueda**: "No encontramos formaciones con esos filtros. Prueba a ampliar los criterios."
3. **Completado (celebratorio)**: "Todas tus formaciones obligatorias estan al dia. Buen trabajo."
4. **Educativo de funcionalidad**: "Desde aqui podras gestionar las acciones formativas de tu empresa. Empieza creando tu primera accion."

**Por que funciona:**
- Convierte un momento potencialmente frustrante en una oportunidad de onboarding.
- El CTA claro elimina la pregunta "y ahora que hago".
- Las ilustraciones suaves (monochrome, brand-aligned) anaden calidez sin distraer.

**Guia de implementacion:**

```html
<div class="empty-state" role="status">
  <div class="empty-state__illustration">
    <svg viewBox="0 0 200 160">
      <!-- Ilustracion simple y monocromatica -->
    </svg>
  </div>
  <h3 class="empty-state__title">
    Sin formaciones asignadas todavia
  </h3>
  <p class="empty-state__description">
    Explora el catalogo para encontrar formaciones relevantes
    para tu perfil y desarrollo profesional.
  </p>
  <div class="empty-state__actions">
    <button class="btn btn--primary">Explorar catalogo</button>
    <button class="btn btn--ghost">Solicitar formacion</button>
  </div>
</div>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  max-width: 420px;
  margin: 0 auto;
}

.empty-state__illustration {
  width: 160px;
  height: 120px;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-state__illustration svg {
  width: 100%;
  height: 100%;
}

.empty-state__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.empty-state__actions {
  display: flex;
  gap: 0.75rem;
}
```

### 11.3 Patron: Tablas de Datos con Acciones Inline y Paginacion

**Que es:**
Tablas de datos donde cada fila tiene acciones contextuales visibles on-hover o en un menu de overflow (tres puntos), con paginacion en la parte inferior, ordenacion por columna y texto alineado a la izquierda / numeros a la derecha.

**Quien lo usa:**
- **Cornerstone**: Resultados de busqueda en tabla con ordenacion por titulo (defecto), drop-down de opciones de ordenacion.
- **Docebo**: Gestiona learning plans desde una tabla con columna "Mandatory" configurable para cada curso.
- **Todos los SaaS HR/LMS analizados**: Es el patron base para la gestion de datos en back-office.

**Mejores practicas convergentes (2024-2026):**
- Alinear texto a la izquierda y numeros a la derecha.
- Congelar header row y, opcionalmente, la primera columna.
- Mostrar no mas de 2 botones de accion inline; el resto en overflow menu.
- Paginacion con selector de items por pagina (10, 25, 50, 100).
- Ordenacion visible: chevron pequeno junto a la cabecera de columna.
- La ordenacion por defecto muestra las entradas mas recientes primero o las que mas requieren accion.

**Guia de implementacion:**

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border-subtle);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  background: var(--surface-primary);
  z-index: 1;
}

.data-table thead th[data-sort]::after {
  content: '';
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 0.375rem;
  vertical-align: middle;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--text-tertiary);
}

.data-table thead th[data-sort="asc"]::after {
  border-top: none;
  border-bottom: 4px solid var(--color-primary);
}

.data-table thead th[data-sort="desc"]::after {
  border-top: 4px solid var(--color-primary);
}

.data-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

/* Numeros alineados a la derecha */
.data-table td.col-numeric,
.data-table th.col-numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.data-table tbody tr:hover {
  background: var(--surface-hover);
}

/* Acciones de fila: visibles on hover */
.row-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
  display: flex;
  gap: 0.25rem;
}

.data-table tbody tr:hover .row-actions {
  opacity: 1;
}

/* Paginacion */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination__page {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.8125rem;
}

.pagination__page--active {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.pagination__per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

### 11.4 Patron: Homepage Personalizable con Widgets Arrastrables

**Que es:**
Una pagina de inicio configurable por cada usuario, compuesta por widgets (bloques de contenido) que se pueden reorganizar, activar, desactivar y (en algunos casos) redimensionar mediante drag-and-drop.

**Quien lo usa:**
- **TalentLMS (2024)**: Administradores e instructores acceden a una homepage con widgets de rol que pueden arrastrarse, reordenarse, desactivarse o restaurarse a la configuracion por defecto. Los learners ven widgets de cursos visitados recientemente, eventos agendados, overview general y notas.
- **Docebo**: Lista de widgets disponibles para paginas personalizadas que incluyen Activity overview, My courses and learning plans, Course list, entre otros.
- **Lattice**: Analytics Explorer con controles movidos al lado izquierdo y capacidad de cambiar ejes de visualizacion.

**Por que funciona:**
- La personalizacion empodera al usuario, aumentando la satisfaccion y el sentido de ownership sobre su herramienta.
- Los widgets preconfigurados por rol reducen el esfuerzo de setup inicial, ofreciendo un "good enough" desde el primer dia.
- El drag-and-drop es un paradigma de interaccion universal que no requiere instruccion.

---

## Apendice: Tabla Comparativa de Patrones por Herramienta

| Patron | BambooHR | Workday | SAP SF | Cornerstone | TalentLMS | Docebo | 360Learning | Lattice | Factorial | Kenjo | Personio |
|--------|----------|---------|--------|-------------|-----------|--------|-------------|---------|-----------|-------|----------|
| Grid de cards catalogo | - | Partial | Partial | Table | Partial | 5 modos | Cards | - | Cards | - | - |
| Busqueda facetada | - | Tags | Custom | Sidebar | Basic | Filters | Basic | - | Basic | - | - |
| Sidebar nav izquierda | 2024 | 2025 | Legacy | Legacy | 2024 | Yes | Yes | Yes | Yes | Yes | Yes |
| Wizard multi-step | - | - | Yes | - | ILT | LP creation | Path | - | - | - | Workflow |
| Vista calendario | - | - | Yes | - | ILT | Calendar mode | Sessions | - | - | - | - |
| Skills matrix | - | Skills Cloud | - | Skills Matrix | - | Skills dash | - | Grow | - | - | - |
| Waitlist automatica | - | - | - | - | - | - | 2024 | - | - | - | - |
| Bulk actions bar | - | - | Rules | Enrollment | - | Rules | Auto-enroll | - | Multi-assign | - | - |
| Compliance semaforo | - | - | Yes | Yes | - | Cert mgmt | Compliance | - | Alerts | Alerts | Alerts |
| FUNDAE / Bonificada | - | - | - | - | - | - | - | - | FUNDAE | - | Spain |
| Widgets arrastrables | - | - | Banners | - | 2024 | Widgets | - | Analytics | - | - | - |
| Drawer/side panel | - | - | - | - | - | - | - | Previews | - | - | Multi-tab |

---

## Fuentes y Referencias

### Plataformas HR / LMS
- [BambooHR - Behind the Scenes UI 2024](https://www.bamboohr.com/resources/ebooks/behind-the-scenes-ui-2024)
- [BambooHR - New User Interface](https://www.bamboohr.com/product-updates/new-user-interface)
- [TalentLMS - New Interface 2024](https://www.talentlms.com/blog/talentlms-update-2024/)
- [TalentLMS - Exploring the New Interface](https://help.talentlms.com/hc/en-us/articles/13389256517148-Exploring-the-new-TalentLMS-interface)
- [TalentLMS - The New Face 2025](https://www.talentlms.com/blog/the-new-face-of-talentlms-2025/)
- [Docebo - My Courses and Learning Plans](https://help.docebo.com/hc/en-us/articles/11337884216210-Navigating-the-My-courses-and-learning-plans-page)
- [Docebo - Embedded Learning Widgets](https://help.docebo.com/hc/en-us/articles/7432111766802-Embedded-learning-building-blocks-My-courses-and-learning-plans-widget)
- [Docebo - Creating and Managing Learning Plans](https://help.docebo.com/hc/en-us/articles/360020083980-Creating-and-managing-learning-plans)
- [Docebo - Enrollment Rules](https://help.docebo.com/hc/en-us/articles/360020128579-Activating-and-managing-the-Enrollment-rules-app)
- [Workday Learning LMS](https://www.workday.com/en-us/products/talent-management/learning.html)
- [Workday Learning Guide - eduMe](https://www.edume.com/blog/workday-learning-guide)
- [Workday Learning Guide 2025 - Samawds](https://samawds.com/insightblog/the-ultimate-guide-to-workday-learning-management-system-features-implementation-and-optimization-for-2025/)
- [SAP SuccessFactors - H1 2024 Release](https://community.sap.com/t5/human-capital-management-blog-posts-by-members/the-1h-2024-release-of-sap-successfactors-learning-release-highlights/ba-p/13673859)
- [SAP SuccessFactors - H2 2024 Release](https://community.sap.com/t5/human-capital-management-blog-posts-by-members/the-2h-2024-release-of-sap-successfactors-learning-key-highlights/ba-p/13887338)
- [SAP SuccessFactors - Automatic Processes](https://help.sap.com/docs/successfactors-learning/managing-sap-successfactors-learning-for-administrators/sap-successfactors-learning-automatic-processes)
- [Cornerstone - Course Catalog Search](https://help.csod.com/help/csod_0/Content/Catalog/Course_Catalog/Course_Catalog_-_Search_-_New.htm)
- [Cornerstone - Skills Matrix](https://help.csod.com/help/csod_0/Content/User/Performance/Skills_Matrix/Skills_Matrix_Overview.htm)
- [Cornerstone - Skills Graph](https://www.cornerstoneondemand.com/platform/skills-graph/)
- [360Learning - Web Release Notes 2024](https://support.360learning.com/hc/en-us/articles/33757739248020-Web-Release-Notes-2024)
- [360Learning LMS](https://360learning.com/product/learning-management-system/)
- [Lattice - May 2024 Product Updates](https://lattice.com/blog/may-2024-product-updates-new-lattice-ai-features-talent-reviews-enhancements-and-the-next-generation-analytics-explorer)
- [Lattice - Grow Platform](https://lattice.com/platform/grow)
- [Lattice - Spring 2024 Releases](https://lattice.com/whatsnew/spring-2024)
- [Training Orchestra - Scheduling System](https://trainingorchestra.com/training-scheduling-system/)
- [Training Orchestra - Instructor Management](https://trainingorchestra.com/training-management-system/instructor-management/)

### Software HR Espanol / FUNDAE
- [Factorial - Gestion de Formacion](https://factorial.es/gestion-de-formacion)
- [Factorial - Guia FUNDAE](https://factorial.es/blog/guia-completa-de-cursos-fundae/)
- [Factorial - Training Dashboard](https://factorialhr.com/blog/training-dashboard/)
- [Factorial - Training Tracking Software](https://factorialhr.com/blog/employee-training-tracking-software/)
- [Kenjo - Training Tracker](https://www.kenjo.io/product/training-tracker)
- [Kenjo - Employee Profiles](https://www.kenjo.io/product/employee-profiles)
- [Personio - Compliance Training](https://www.personio.com/hr-lexicon/compliance-training/)
- [Personio - Training Request Workflow (Community)](https://community.personio.com/performance-development-89/how-to-set-up-a-workflow-for-employee-training-requests-and-approvals-4649)
- [Gesbon - ERP Formacion Bonificada](https://www.gesbon.es/)
- [FUNDAE - Aplicacion 2025](https://www.fundae.es/actualidad/noticias/2024/12/10/ejercicio-2025--aplicaci%C3%B3n-de-formaci%C3%B3n-programada-por-las-empresas)
- [FUNDAE - Acciones Formativas](https://empresas.fundae.es/Lanzadera)
- [Aplicativo FUNDAE - Guia](https://formacionprogramada.net/aplicativo-de-fundae-para-los-cursos-de-formacion-programada/)

### Patrones UX Generales
- [Bulk Action UX - 8 Guidelines (Eleken)](https://www.eleken.co/blog-posts/bulk-actions-ux)
- [SaaS Bulk Actions Examples (SaaS Interface)](https://saasinterface.com/components/bulk-actions/)
- [PatternFly - Bulk Selection](https://www.patternfly.org/patterns/bulk-selection/)
- [Data Table UX Patterns (Pencil & Paper)](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)
- [Empty State UX (Eleken)](https://www.eleken.co/blog-posts/empty-state-ux)
- [Empty State in SaaS (Userpilot)](https://userpilot.com/blog/empty-state-saas/)
- [Badges vs Pills vs Chips vs Tags (Smart Interface Design)](https://smart-interface-design-patterns.com/articles/badges-chips-tags-pills/)
- [SaaS Navigation Menu Design (Lollypop)](https://lollypop.design/blog/2025/december/saas-navigation-menu-design/)
- [Filter UX for SaaS (Eleken)](https://www.eleken.co/blog-posts/filter-ux-and-ui-for-saas)
- [Stepper UI Examples (Eleken)](https://www.eleken.co/blog-posts/stepper-ui-examples)
- [Multi-Step Form Wizard - React (Medium)](https://medium.com/@vandanpatel29122001/react-building-a-multi-step-form-with-wizard-pattern-85edec21f793)
- [SaaS UI Workflow Patterns (GitHub Gist)](https://gist.github.com/mpaiva-cc/d4ef3a652872cb5a91aa529db98d62dd)
- [How to Design an HR System (SPDLoad)](https://spdload.com/blog/how-to-design-an-hr-app-from-scratch/)
- [L&D KPIs and Metrics (AIHR)](https://www.aihr.com/blog/learning-and-development-kpis/)
- [Training KPI 2026 (Didask)](https://www.didask.com/en/post/kpi-formation)
- [LMS Dashboard Examples (Educate-me)](https://www.educate-me.co/blog/lms-dashboard)
