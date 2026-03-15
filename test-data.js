// =============================================================================
// TEST DATA — Pegar en la consola del navegador con convocatoria.html abierta
// Genera datos realistas en TODOS los localStorage keys de la app
// =============================================================================

(function loadTestData() {
  'use strict';

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------
  const now = Date.now();
  const iso = (d) => new Date(d).toISOString();
  const ts = (offsetDays) => now + offsetDays * 86400000;
  const dateStr = (offsetDays) => {
    const d = new Date(now + offsetDays * 86400000);
    return d.toISOString().slice(0, 10);
  };

  // ---------------------------------------------------------------------------
  // 1. EMPLOYEES (50 personas, 3 empresas, 8 departamentos)
  // ---------------------------------------------------------------------------
  const empresas = [
    { nombre: 'Industrias Levante S.A.', cif: 'A12345678' },
    { nombre: 'Grupo Novatech S.L.', cif: 'B87654321' },
    { nombre: 'Soluciones Iberia S.A.', cif: 'A11223344' }
  ];

  const departamentos = ['Recursos Humanos', 'Tecnología', 'Comercial', 'Finanzas', 'Operaciones', 'Legal', 'Marketing', 'Calidad'];
  const areas = ['Administración', 'Desarrollo', 'Ventas', 'Contabilidad', 'Logística', 'Cumplimiento', 'Digital', 'Sistemas'];
  const ubicaciones = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
  const puestos = ['Analista', 'Técnico/a', 'Responsable', 'Director/a', 'Coordinador/a', 'Especialista', 'Gestor/a', 'Consultor/a'];
  const categorias = ['Staff', 'Profesional', 'Mando intermedio', 'Ejecutivo', 'Directivo'];
  const dependeDe = ['Director General', 'Dir. RRHH', 'Dir. Tecnología', 'Dir. Comercial', 'Dir. Finanzas', 'Dir. Operaciones'];
  const sexos = ['H', 'M'];
  const catProf = ['Ingeniero/a', 'Administrativo/a', 'Técnico/a Superior', 'Oficial 1ª', 'Titulado/a Superior'];

  const nombres = [
    ['María', 'García López'], ['Carlos', 'Martínez Ruiz'], ['Ana', 'Fernández Díaz'],
    ['Javier', 'López Moreno'], ['Laura', 'Sánchez Gil'], ['Pedro', 'Rodríguez Navarro'],
    ['Elena', 'Hernández Vega'], ['Miguel', 'González Serrano'], ['Sofía', 'Pérez Blanco'],
    ['David', 'Romero Ortiz'], ['Lucía', 'Torres Medina'], ['Andrés', 'Ramírez Castillo'],
    ['Carmen', 'Flores Reyes'], ['Pablo', 'Ruiz Herrera'], ['Marta', 'Díaz Molina'],
    ['Alberto', 'Morales Jiménez'], ['Isabel', 'Ortega Vargas'], ['Fernando', 'Castro Guerrero'],
    ['Raquel', 'Muñoz Delgado'], ['Jorge', 'Álvarez Campos'], ['Natalia', 'Iglesias Ramos'],
    ['Sergio', 'Santos Vidal'], ['Patricia', 'Crespo Prieto'], ['Daniel', 'Domínguez Aguilar'],
    ['Clara', 'Rubio Peña'], ['Óscar', 'Suárez León'], ['Alicia', 'Molina Cabrera'],
    ['Manuel', 'Marín Cortés'], ['Cristina', 'Herrero Lozano'], ['Alejandro', 'Gallego Cano'],
    ['Rosa', 'Navarro Guerrero'], ['Iván', 'Pascual Esteban'], ['Beatriz', 'Carrasco Fuentes'],
    ['Víctor', 'Giménez Calvo'], ['Silvia', 'Montero Duran'], ['Enrique', 'Vega Soto'],
    ['Paula', 'Caballero Bravo'], ['Tomás', 'Cruz Benítez'], ['Inés', 'Prieto Moya'],
    ['Adrián', 'Méndez Ibáñez'], ['Teresa', 'Arias Rojas'], ['Marcos', 'Lara Pardo'],
    ['Nerea', 'Peña Rivas'], ['Rafael', 'Gutiérrez Mora'], ['Lorena', 'Velasco Núñez'],
    ['Héctor', 'Ferrer Soler'], ['Marina', 'Carmona Serra'], ['Samuel', 'Reyes Otero'],
    ['Virginia', 'Soto Márquez'], ['Luis', 'Hidalgo Blázquez']
  ];

  function nif(i) {
    const num = String(10000000 + i * 1234567 + 111).slice(0, 8);
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return num + letras[parseInt(num, 10) % 23];
  }

  function nss(i) {
    return '28' + String(1000000000 + i * 7654321).slice(0, 10) + '00';
  }

  const employees = nombres.map(([nom, ape], i) => {
    const emp = empresas[i % 3];
    return {
      'Empresa': emp.nombre,
      'Departamento': departamentos[i % 8],
      'Área': areas[i % 8],
      'Ubicación': ubicaciones[i % 5],
      'Puesto': puestos[i % 8],
      'Categoría Mercer': categorias[i % 5],
      'Depende de': dependeDe[i % 6],
      'Email trabajo': `${nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}.${ape.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}@${emp.nombre.split(' ')[0].toLowerCase()}.com`,
      'Empleado': `${nom} ${ape}`,
      'NIF': nif(i),
      'Alta/Baja': i < 47 ? '1' : '0', // 3 bajas
      '_f_Móvil trabajo (largo)': `+34 6${String(10000000 + i * 9876543).slice(0, 8)}`,
      '_f_Teléfono personal': `+34 6${String(20000000 + i * 8765432).slice(0, 8)}`,
      '_f_Nombre': nom,
      '_f_Apellidos': ape,
      '_f_Numero Seguridad Social': nss(i),
      '_f_Sexo': sexos[i % 2],
      '_f_DiscapacidadContrib': i === 15 ? 'Sí' : 'No',
      '_f_Categoría profesional': catProf[i % 5],
      '_f_Coste Salarial Hora': String(15 + (i % 20) * 2.5),
      '_f_Coste aproximado SS': String(5 + (i % 10) * 1.2),
      '_f_CIF': emp.cif,
      '_id': String(i)
    };
  });

  // ---------------------------------------------------------------------------
  // 2. PROVEEDORES (4)
  // ---------------------------------------------------------------------------
  const proveedores = [
    { cif: 'B55667788', razonSocial: 'FormaPlus Consultores S.L.', direccion: 'C/ Gran Vía 42, 3ºB', cp: '28013', localidad: 'Madrid', provincia: 'Madrid', contacto: 'Ignacio Redondo', telefono: '910234567', email: 'info@formaplus.es', responsable: 'Ignacio Redondo', especialidades: 'Liderazgo, Soft Skills, Gestión del Cambio', tarifaHora: 85 },
    { cif: 'B99887766', razonSocial: 'TechLearn Academy S.L.', direccion: 'Av. Diagonal 211', cp: '08018', localidad: 'Barcelona', provincia: 'Barcelona', contacto: 'Gemma Puig', telefono: '932345678', email: 'formacion@techlearn.es', responsable: 'Gemma Puig', especialidades: 'Ciberseguridad, Cloud, IA, Python', tarifaHora: 110 },
    { cif: 'B44556677', razonSocial: 'Prevención Global S.A.', direccion: 'C/ Colón 15', cp: '46004', localidad: 'Valencia', provincia: 'Valencia', contacto: 'Ricardo Beltrán', telefono: '963456789', email: 'contacto@prevencionglobal.es', responsable: 'Ricardo Beltrán', especialidades: 'PRL, Emergencias, Primeros Auxilios, LOTO', tarifaHora: 70 },
    { cif: 'B22334455', razonSocial: 'Idiomas Express S.L.', direccion: 'Plaza Nueva 8', cp: '41001', localidad: 'Sevilla', provincia: 'Sevilla', contacto: 'Sarah Johnson', telefono: '954567890', email: 'business@idiomasexpress.es', responsable: 'Sarah Johnson', especialidades: 'Inglés B2/C1, Francés, Alemán', tarifaHora: 55 }
  ];

  // ---------------------------------------------------------------------------
  // 3. CENTROS (3)
  // ---------------------------------------------------------------------------
  const centros = [
    { tipoDocumento: 'CIF', documento: 'B55667788', nombre: 'Centro FormaPlus Madrid', direccion: 'C/ Gran Vía 42, 3ºB', cp: '28013', localidad: 'Madrid', provincia: 'Madrid' },
    { tipoDocumento: 'CIF', documento: 'B99887766', nombre: 'Hub TechLearn Barcelona', direccion: 'Av. Diagonal 211, Planta 5', cp: '08018', localidad: 'Barcelona', provincia: 'Barcelona' },
    { tipoDocumento: 'CIF', documento: 'B44556677', nombre: 'Aula Prevención Valencia', direccion: 'C/ Colón 15, Bajo', cp: '46004', localidad: 'Valencia', provincia: 'Valencia' }
  ];

  // ---------------------------------------------------------------------------
  // 4. TUTORES (4)
  // ---------------------------------------------------------------------------
  const tutores = [
    { tipoDocumento: 'NIF', documento: '33445566R', nombre: 'Ignacio', apellido1: 'Redondo', apellido2: 'Salas', telefono: '610234567', email: 'i.redondo@formaplus.es', horasDedicacion: 40 },
    { tipoDocumento: 'NIF', documento: '77889900T', nombre: 'Gemma', apellido1: 'Puig', apellido2: 'Ferrer', telefono: '620345678', email: 'g.puig@techlearn.es', horasDedicacion: 60 },
    { tipoDocumento: 'NIF', documento: '11223344W', nombre: 'Ricardo', apellido1: 'Beltrán', apellido2: 'Aguilera', telefono: '630456789', email: 'r.beltran@prevencionglobal.es', horasDedicacion: 30 },
    { tipoDocumento: 'NIE', documento: 'X1234567L', nombre: 'Sarah', apellido1: 'Johnson', apellido2: '', telefono: '640567890', email: 's.johnson@idiomasexpress.es', horasDedicacion: 50 }
  ];

  // ---------------------------------------------------------------------------
  // 5. ACCIONES / CATÁLOGO (12 formaciones en distintos estados)
  // ---------------------------------------------------------------------------
  const acciones = [
    {
      codigo: '1', nombre: 'Liderazgo Situacional', estado: 'Terminada', modalidad: 'Presencial',
      departamento: 'Recursos Humanos', empresaPagadora: 'A12345678',
      fechaInicio: dateStr(-60), fechaFin: dateStr(-55),
      horasPresenciales: 16, horasTeleformacion: 0, presupuesto: 4800, bonificable: 'Sí',
      codigoGrupo: '001-01', areaProfesional: 'Administración y gestión', nivelFormacion: '1',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Desarrollar competencias de liderazgo adaptativo según el modelo Hersey-Blanchard.',
      contenidos: 'Estilos de liderazgo, diagnóstico de madurez del equipo, delegación efectiva, feedback constructivo.',
      proveedorVinculado: 'B55667788', centroVinculado: 'B55667788', tutorVinculado: '33445566R',
      rltEstado: 'Enviada', rltFechaEnvio: dateStr(-65),
      evaluacion: { l1: { utilidad: 4.3, calidadFormador: 4.7, materiales: 4.0, nps: 8.5, respuestas: 14 }, l2: { preTest: 45, postTest: 78 } },
      participantes: [nif(0), nif(3), nif(6), nif(9), nif(12), nif(15), nif(18), nif(21), nif(24), nif(27), nif(30), nif(33), nif(36), nif(39)],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-70), date: iso(ts(-70)), tag: 'sistema', text: 'Acción creada' },
        { id: ts(-65), date: iso(ts(-65)), tag: 'FUNDAE', text: 'Comunicada a RLT' },
        { id: ts(-55), date: iso(ts(-55)), tag: 'sistema', text: 'Formación completada' }
      ]
    },
    {
      codigo: '2', nombre: 'Ciberseguridad para usuarios', estado: 'Terminada', modalidad: 'Teleformación',
      departamento: 'Tecnología', empresaPagadora: 'B87654321',
      fechaInicio: dateStr(-45), fechaFin: dateStr(-30),
      horasPresenciales: 0, horasTeleformacion: 20, presupuesto: 3200, bonificable: 'Sí',
      codigoGrupo: '002-01', areaProfesional: 'Informática y comunicaciones', nivelFormacion: '0',
      plataformaCif: 'B99887766', plataformaRazonSocial: 'TechLearn Academy S.L.', plataformaUri: 'https://campus.techlearn.es', plataformaUsuario: 'admin_novatech', plataformaPassword: '',
      objetivos: 'Concienciar sobre amenazas digitales y buenas prácticas de seguridad.',
      contenidos: 'Phishing, ransomware, contraseñas seguras, navegación segura, BYOD.',
      proveedorVinculado: 'B99887766', centroVinculado: 'B99887766', tutorVinculado: '77889900T',
      rltEstado: 'Enviada', rltFechaEnvio: dateStr(-50),
      evaluacion: { l1: { utilidad: 4.6, calidadFormador: 4.8, materiales: 4.5, nps: 9.1, respuestas: 28 }, l2: { preTest: 35, postTest: 82 } },
      participantes: employees.filter((_, i) => i % 2 === 0).slice(0, 15).map(e => e.NIF),
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-50), date: iso(ts(-50)), tag: 'sistema', text: 'Acción creada' },
        { id: ts(-30), date: iso(ts(-30)), tag: 'interno', text: 'Excelente acogida, plantear nivel avanzado' }
      ]
    },
    {
      codigo: '3', nombre: 'PRL — Riesgos en oficina', estado: 'Terminada', modalidad: 'Presencial',
      departamento: 'Calidad', empresaPagadora: 'A12345678',
      fechaInicio: dateStr(-90), fechaFin: dateStr(-90),
      horasPresenciales: 4, horasTeleformacion: 0, presupuesto: 1400, bonificable: 'Sí',
      codigoGrupo: '003-01', areaProfesional: 'Seguridad y medio ambiente', nivelFormacion: '0',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Cumplir con la obligación legal de formación en PRL.',
      contenidos: 'Ergonomía, pantallas de visualización, evacuación, primeros auxilios básicos.',
      proveedorVinculado: 'B44556677', centroVinculado: 'B44556677', tutorVinculado: '11223344W',
      rltEstado: 'Enviada', rltFechaEnvio: dateStr(-95),
      evaluacion: { l1: { utilidad: 3.8, calidadFormador: 4.2, materiales: 3.5, nps: 7.0, respuestas: 40 }, l2: { preTest: 60, postTest: 75 } },
      participantes: employees.filter((_, i) => i < 42).map(e => e.NIF),
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: []
    },
    {
      codigo: '4', nombre: 'Inglés B2 — Grupo Directivo', estado: 'En marcha', modalidad: 'Mixta',
      departamento: 'Comercial', empresaPagadora: 'A11223344',
      fechaInicio: dateStr(-20), fechaFin: dateStr(40),
      horasPresenciales: 20, horasTeleformacion: 40, presupuesto: 6600, bonificable: 'Sí',
      codigoGrupo: '004-01', areaProfesional: 'Servicios socioculturales y a la comunidad', nivelFormacion: '1',
      plataformaCif: 'B22334455', plataformaRazonSocial: 'Idiomas Express S.L.', plataformaUri: 'https://learn.idiomasexpress.es', plataformaUsuario: 'grupo_iberia', plataformaPassword: '',
      objetivos: 'Alcanzar nivel B2 en comunicación profesional en inglés.',
      contenidos: 'Business English, presentations, negotiations, email writing, conference calls.',
      proveedorVinculado: 'B22334455', centroVinculado: 'B55667788', tutorVinculado: 'X1234567L',
      rltEstado: 'Enviada', rltFechaEnvio: dateStr(-25),
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 42, postTest: 0 } },
      participantes: [nif(4), nif(7), nif(10), nif(13), nif(16), nif(19), nif(22), nif(25)],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-20), date: iso(ts(-20)), tag: 'proveedor', text: 'Material de nivel enviado. Primer test el 25/03.' }
      ]
    },
    {
      codigo: '5', nombre: 'Excel Avanzado y Power BI', estado: 'Convocada', modalidad: 'Presencial',
      departamento: 'Finanzas', empresaPagadora: 'B87654321',
      fechaInicio: dateStr(10), fechaFin: dateStr(12),
      horasPresenciales: 16, horasTeleformacion: 0, presupuesto: 3800, bonificable: 'Sí',
      codigoGrupo: '005-01', areaProfesional: 'Informática y comunicaciones', nivelFormacion: '1',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Dominar tablas dinámicas, Power Query y dashboards en Power BI.',
      contenidos: 'Tablas dinámicas avanzadas, DAX, Power Query M, modelado de datos, publicación de informes.',
      proveedorVinculado: 'B99887766', centroVinculado: 'B99887766', tutorVinculado: '77889900T',
      rltEstado: 'Pendiente', rltFechaEnvio: '',
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [nif(1), nif(4), nif(7), nif(10), nif(13), nif(16), nif(19), nif(22), nif(25), nif(28)],
      asistencia: { registro: {} },
      confirmaciones: Object.fromEntries([nif(1), nif(4), nif(7)].map(n => [n, 'confirmado']).concat([nif(10), nif(13)].map(n => [n, 'pendiente']))),
      notas: []
    },
    {
      codigo: '6', nombre: 'Gestión del Cambio Organizacional', estado: 'En preparación', modalidad: 'Presencial',
      departamento: 'Recursos Humanos', empresaPagadora: 'A12345678',
      fechaInicio: dateStr(25), fechaFin: dateStr(27),
      horasPresenciales: 12, horasTeleformacion: 0, presupuesto: 5200, bonificable: 'Sí',
      codigoGrupo: '006-01', areaProfesional: 'Administración y gestión', nivelFormacion: '1',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Preparar a mandos intermedios para liderar procesos de cambio.',
      contenidos: 'Modelo ADKAR, resistencia al cambio, comunicación del cambio, stakeholder mapping.',
      proveedorVinculado: 'B55667788', centroVinculado: 'B55667788', tutorVinculado: '33445566R',
      rltEstado: 'Pendiente', rltFechaEnvio: '',
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-5), date: iso(ts(-5)), tag: 'interno', text: 'Pendiente de confirmar sala y catering' }
      ]
    },
    {
      codigo: '7', nombre: 'Protección de Datos (RGPD)', estado: 'Planificada', modalidad: 'Teleformación',
      departamento: 'Legal', empresaPagadora: 'A11223344',
      fechaInicio: dateStr(45), fechaFin: dateStr(60),
      horasPresenciales: 0, horasTeleformacion: 8, presupuesto: 1800, bonificable: 'Sí',
      codigoGrupo: '007-01', areaProfesional: 'Administración y gestión', nivelFormacion: '0',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Cumplir con la formación obligatoria en protección de datos.',
      contenidos: 'RGPD, LOPDGDD, derechos del interesado, evaluaciones de impacto, brechas de seguridad.',
      proveedorVinculado: '', centroVinculado: '', tutorVinculado: '',
      rltEstado: 'Pendiente', rltFechaEnvio: '',
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: []
    },
    {
      codigo: '8', nombre: 'Acoso laboral — Protocolo', estado: 'Convocada', modalidad: 'Presencial',
      departamento: 'Recursos Humanos', empresaPagadora: 'A12345678',
      fechaInicio: dateStr(5), fechaFin: dateStr(5),
      horasPresenciales: 4, horasTeleformacion: 0, presupuesto: 2000, bonificable: 'No',
      codigoGrupo: '', areaProfesional: '', nivelFormacion: '0',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Dar a conocer el protocolo interno de prevención del acoso.',
      contenidos: 'Marco legal, tipos de acoso, canal de denuncia, procedimiento de actuación, medidas cautelares.',
      proveedorVinculado: 'B55667788', centroVinculado: 'B55667788', tutorVinculado: '33445566R',
      rltEstado: 'Enviada', rltFechaEnvio: dateStr(-2),
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: employees.filter((_, i) => i < 20).map(e => e.NIF),
      asistencia: { registro: {} },
      confirmaciones: Object.fromEntries(employees.filter((_, i) => i < 20).map(e => [e.NIF, i < 12 ? 'confirmado' : 'pendiente'])),
      notas: []
    },
    {
      codigo: '9', nombre: 'Negociación Comercial Avanzada', estado: 'Buscando', modalidad: 'Presencial',
      departamento: 'Comercial', empresaPagadora: 'B87654321',
      fechaInicio: '', fechaFin: '',
      horasPresenciales: 16, horasTeleformacion: 0, presupuesto: 5500, bonificable: 'Sí',
      codigoGrupo: '', areaProfesional: 'Comercio y marketing', nivelFormacion: '1',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Mejorar la ratio de cierre comercial del equipo de ventas.',
      contenidos: 'Harvard method, BATNA, técnicas de cierre, gestión de objeciones, role-play.',
      proveedorVinculado: '', centroVinculado: '', tutorVinculado: '',
      rltEstado: 'Pendiente', rltFechaEnvio: '',
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-10), date: iso(ts(-10)), tag: 'interno', text: 'Solicitadas 3 propuestas a proveedores' },
        { id: ts(-3), date: iso(ts(-3)), tag: 'proveedor', text: 'FormaPlus envía propuesta: 5.200€ (2 días, max 15 pax)' }
      ]
    },
    {
      codigo: '10', nombre: 'Python para Análisis de Datos', estado: 'Pendiente', modalidad: 'Mixta',
      departamento: 'Tecnología', empresaPagadora: 'A11223344',
      fechaInicio: dateStr(60), fechaFin: dateStr(90),
      horasPresenciales: 8, horasTeleformacion: 32, presupuesto: 7200, bonificable: 'Sí',
      codigoGrupo: '010-01', areaProfesional: 'Informática y comunicaciones', nivelFormacion: '1',
      plataformaCif: 'B99887766', plataformaRazonSocial: 'TechLearn Academy S.L.', plataformaUri: 'https://campus.techlearn.es', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Capacitar al equipo técnico en análisis de datos con Python.',
      contenidos: 'Pandas, NumPy, Matplotlib, Jupyter, limpieza de datos, visualización, estadística básica.',
      proveedorVinculado: 'B99887766', centroVinculado: '', tutorVinculado: '77889900T',
      rltEstado: 'Pendiente', rltFechaEnvio: '',
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: []
    },
    {
      codigo: '11', nombre: 'Primeros Auxilios y DEA', estado: 'Retrasada', modalidad: 'Presencial',
      departamento: 'Calidad', empresaPagadora: 'A12345678',
      fechaInicio: dateStr(-10), fechaFin: dateStr(-10),
      horasPresenciales: 8, horasTeleformacion: 0, presupuesto: 2400, bonificable: 'Sí',
      codigoGrupo: '011-01', areaProfesional: 'Seguridad y medio ambiente', nivelFormacion: '0',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Formar a personal designado en primeros auxilios y uso de DEA.',
      contenidos: 'RCP, DEA, hemorragias, fracturas, quemaduras, protocolo PAS.',
      proveedorVinculado: 'B44556677', centroVinculado: 'B44556677', tutorVinculado: '11223344W',
      rltEstado: 'Enviada', rltFechaEnvio: dateStr(-15),
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [nif(2), nif(5), nif(8), nif(11), nif(14), nif(17), nif(20), nif(23), nif(26), nif(29)],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-12), date: iso(ts(-12)), tag: 'proveedor', text: 'Formador enfermo. Pospuesta hasta nueva fecha.' }
      ]
    },
    {
      codigo: '12', nombre: 'Onboarding — Cultura corporativa', estado: 'Anulada', modalidad: 'Presencial',
      departamento: 'Recursos Humanos', empresaPagadora: 'B87654321',
      fechaInicio: dateStr(-30), fechaFin: dateStr(-30),
      horasPresenciales: 4, horasTeleformacion: 0, presupuesto: 800, bonificable: 'No',
      codigoGrupo: '', areaProfesional: '', nivelFormacion: '0',
      plataformaCif: '', plataformaRazonSocial: '', plataformaUri: '', plataformaUsuario: '', plataformaPassword: '',
      objetivos: 'Integrar a nuevas incorporaciones en la cultura de la empresa.',
      contenidos: 'Historia, valores, estructura, políticas internas, beneficios sociales.',
      proveedorVinculado: '', centroVinculado: '', tutorVinculado: '',
      rltEstado: 'Pendiente', rltFechaEnvio: '',
      evaluacion: { l1: { utilidad: 0, calidadFormador: 0, materiales: 0, nps: 0, respuestas: 0 }, l2: { preTest: 0, postTest: 0 } },
      participantes: [],
      asistencia: { registro: {} },
      confirmaciones: {},
      notas: [
        { id: ts(-28), date: iso(ts(-28)), tag: 'interno', text: 'Anulada: se reformula el programa de onboarding completo' }
      ]
    }
  ];

  // Fill attendance for completed acciones
  [acciones[0], acciones[1], acciones[2]].forEach(a => {
    a.participantes.forEach(nifVal => {
      a.asistencia.registro[nifVal] = [Math.random() > 0.1]; // 90% attendance
    });
    a.participantes.forEach(nifVal => {
      a.confirmaciones[nifVal] = 'confirmado';
    });
  });

  // ---------------------------------------------------------------------------
  // 6. HISTORY (6 envíos pasados)
  // ---------------------------------------------------------------------------
  const history = [
    {
      id: ts(-60), timestamp: iso(ts(-60)), title: 'Liderazgo Situacional',
      eventDate: dateStr(-60), startTime: '09:00', endTime: '14:00', isTeams: false,
      location: 'Sala Picasso — Centro FormaPlus', body: 'Convocatoria de formación presencial.',
      attendeeCount: 14, emails: acciones[0].participantes.map((_, i) => employees[i * 3]?.['Email trabajo']).filter(Boolean),
      filters: { 'Categoría Mercer': ['Mando intermedio', 'Ejecutivo'] },
      status: 'completed', surveyScheduled: true, actionCode: '1'
    },
    {
      id: ts(-45), timestamp: iso(ts(-45)), title: 'Ciberseguridad para usuarios',
      eventDate: dateStr(-45), startTime: '10:00', endTime: '11:30', isTeams: true,
      location: 'Microsoft Teams', body: 'Sesión online obligatoria de ciberseguridad.',
      attendeeCount: 15, emails: employees.filter((_, i) => i % 2 === 0).slice(0, 15).map(e => e['Email trabajo']),
      filters: { 'Departamento': ['Tecnología', 'Finanzas', 'Comercial'] },
      status: 'completed', surveyScheduled: true, actionCode: '2'
    },
    {
      id: ts(-90), timestamp: iso(ts(-90)), title: 'PRL — Riesgos en oficina',
      eventDate: dateStr(-90), startTime: '09:30', endTime: '13:30', isTeams: false,
      location: 'Aula Prevención Valencia', body: 'Formación obligatoria en prevención de riesgos.',
      attendeeCount: 42, emails: employees.filter((_, i) => i < 42).map(e => e['Email trabajo']),
      filters: {},
      status: 'completed', surveyScheduled: true, actionCode: '3'
    },
    {
      id: ts(-20), timestamp: iso(ts(-20)), title: 'Inglés B2 — Sesión 1',
      eventDate: dateStr(-20), startTime: '16:00', endTime: '18:00', isTeams: false,
      location: 'Sala 4B — Industrias Levante', body: 'Primera sesión presencial del programa de inglés.',
      attendeeCount: 8, emails: [nif(4), nif(7), nif(10), nif(13), nif(16), nif(19), nif(22), nif(25)].map((_, i) => employees[4 + i * 3]?.['Email trabajo']).filter(Boolean),
      filters: { 'Categoría Mercer': ['Directivo', 'Ejecutivo'] },
      status: 'completed', surveyScheduled: false, actionCode: '4'
    },
    {
      id: ts(-5), timestamp: iso(ts(-5)), title: 'Acoso laboral — Protocolo (recordatorio)',
      eventDate: dateStr(5), startTime: '10:00', endTime: '14:00', isTeams: false,
      location: 'Salón de actos — Industrias Levante', body: 'Recordatorio: formación obligatoria sobre protocolo de acoso.',
      attendeeCount: 20, emails: employees.filter((_, i) => i < 20).map(e => e['Email trabajo']),
      filters: { 'Empresa': ['Industrias Levante S.A.'] },
      status: 'completed', surveyScheduled: false, actionCode: '8'
    },
    {
      id: ts(-2), timestamp: iso(ts(-2)), title: 'Test envío fallido',
      eventDate: dateStr(-2), startTime: '09:00', endTime: '10:00', isTeams: true,
      location: 'Teams', body: 'Prueba.',
      attendeeCount: 1, emails: ['test@example.com'],
      filters: {},
      status: 'failed', surveyScheduled: false, actionCode: ''
    }
  ];

  // ---------------------------------------------------------------------------
  // 7. QUEUE (2 envíos programados)
  // ---------------------------------------------------------------------------
  const queue = [
    {
      id: ts(0), event: {
        title: 'Excel Avanzado y Power BI — Confirmación',
        date: dateStr(8), startTime: '09:00', endTime: '17:00',
        location: 'Hub TechLearn Barcelona', isTeams: false,
        formador: 'Gemma Puig', body: 'Confirmamos tu plaza en la formación de Excel y Power BI.'
      },
      attendeeCount: 10,
      emails: [nif(1), nif(4), nif(7), nif(10), nif(13), nif(16), nif(19), nif(22), nif(25), nif(28)].map((_, i) => employees[1 + i * 3]?.['Email trabajo']).filter(Boolean),
      filters: { 'Departamento': ['Finanzas', 'Tecnología'] },
      seriesDates: [dateStr(10), dateStr(11), dateStr(12)]
    },
    {
      id: ts(1), event: {
        title: 'Acoso laboral — Protocolo',
        date: dateStr(5), startTime: '10:00', endTime: '14:00',
        location: 'Salón de actos — Industrias Levante', isTeams: false,
        formador: 'Ignacio Redondo', body: 'Te esperamos en la sesión sobre el protocolo de prevención del acoso.'
      },
      attendeeCount: 8,
      emails: employees.filter((_, i) => i >= 12 && i < 20).map(e => e['Email trabajo']),
      filters: { 'Empresa': ['Industrias Levante S.A.'] },
      seriesDates: null
    }
  ];

  // ---------------------------------------------------------------------------
  // 8. COMPLIANCE TYPES (4 tipos de formación obligatoria)
  // ---------------------------------------------------------------------------
  const complianceTypes = [
    { id: 'ct_prl', name: 'PRL — Riesgos en puesto', periodMonths: 12 },
    { id: 'ct_rgpd', name: 'Protección de Datos (RGPD)', periodMonths: 24 },
    { id: 'ct_acoso', name: 'Protocolo de Acoso', periodMonths: 24 },
    { id: 'ct_blanqueo', name: 'Prevención Blanqueo de Capitales', periodMonths: 12 }
  ];

  // ---------------------------------------------------------------------------
  // 9. COMPLIANCE RECORDS (mix de vigentes y caducados)
  // ---------------------------------------------------------------------------
  const complianceRecords = {};
  // PRL: 80% done, some expired
  employees.slice(0, 40).forEach((e, i) => {
    complianceRecords[`${e.NIF}|ct_prl`] = { date: dateStr(i < 30 ? -90 : -400) };
  });
  // RGPD: 50% done
  employees.slice(0, 25).forEach((e) => {
    complianceRecords[`${e.NIF}|ct_rgpd`] = { date: dateStr(-180) };
  });
  // Acoso: 40% done
  employees.slice(0, 20).forEach((e) => {
    complianceRecords[`${e.NIF}|ct_acoso`] = { date: dateStr(-30) };
  });

  // ---------------------------------------------------------------------------
  // 10. TNA REQUESTS (5 solicitudes de detección de necesidades)
  // ---------------------------------------------------------------------------
  const tnaRequests = [
    { id: ts(-15), area: 'Comercial', tema: 'Negociación avanzada para Key Accounts', justificacion: 'El equipo de KAM ha perdido 3 renovaciones en Q4 por falta de técnicas de cierre.', urgencia: 'alta', estado: 'aprobada', createdAt: iso(ts(-15)) },
    { id: ts(-12), area: 'Tecnología', tema: 'Certificación AWS Cloud Practitioner', justificacion: 'Migración a AWS planificada para Q3. Equipo necesita fundamentos de cloud.', urgencia: 'alta', estado: 'pendiente', createdAt: iso(ts(-12)) },
    { id: ts(-8), area: 'Recursos Humanos', tema: 'Entrevista por competencias', justificacion: 'Rotación del 18% en perfiles tech. Mejorar selección para reducir desvinculaciones en periodo de prueba.', urgencia: 'media', estado: 'convertida', createdAt: iso(ts(-8)) },
    { id: ts(-5), area: 'Finanzas', tema: 'NIIF 16 — Arrendamientos', justificacion: 'Cambio normativo que afecta al cierre contable. Obligatorio para el equipo de contabilidad.', urgencia: 'media', estado: 'pendiente', createdAt: iso(ts(-5)) },
    { id: ts(-2), area: 'Marketing', tema: 'GA4 y Google Tag Manager', justificacion: 'Migración de Universal Analytics completada pero el equipo no domina GA4.', urgencia: 'baja', estado: 'rechazada', createdAt: iso(ts(-2)) }
  ];

  // ---------------------------------------------------------------------------
  // 11. UNIFIED TEMPLATES (3 plantillas)
  // ---------------------------------------------------------------------------
  const unifiedTemplates = [
    {
      id: ts(-100), name: 'Convocatoria presencial estándar', type: 'convocatoria',
      data: {
        filters: {},
        event: {
          title: '{nombre de la formación}', isTeams: false,
          startTime: '09:00', endTime: '14:00',
          location: 'Sala por confirmar',
          body: 'Hola,\n\nTe convocamos a la formación {titulo} que tendrá lugar el {fecha} de {hora_inicio} a {hora_fin} en {ubicacion}.\n\nFormador/a: {formador}\n\nPor favor, confirma tu asistencia respondiendo a este email.\n\nSaludos,\nDpto. de Formación',
          formador: ''
        }
      },
      createdAt: iso(ts(-100))
    },
    {
      id: ts(-80), name: 'Sesión Teams — equipo técnico', type: 'convocatoria',
      data: {
        filters: { 'Departamento': ['Tecnología'] },
        event: {
          title: '', isTeams: true,
          startTime: '10:00', endTime: '11:30',
          location: 'Microsoft Teams',
          body: 'Hola,\n\nSesión online: {titulo}\nFecha: {fecha} | Hora: {hora_inicio}-{hora_fin}\n\nEl enlace de Teams se enviará 15 min antes.\n\nSaludos',
          formador: ''
        }
      },
      createdAt: iso(ts(-80))
    },
    {
      id: ts(-50), name: 'Filtro: Mandos intermedios todas las sedes', type: 'filter',
      data: {
        filters: { 'Categoría Mercer': ['Mando intermedio', 'Ejecutivo'] },
        event: { title: '', isTeams: false, startTime: '10:00', endTime: '12:00', location: '', body: '', formador: '' }
      },
      createdAt: iso(ts(-50))
    }
  ];

  // ---------------------------------------------------------------------------
  // 12. SETTINGS
  // ---------------------------------------------------------------------------
  const settings = {
    theme: 'light',
    webhookUrl: 'https://prod-XX.westeurope.logic.azure.com/workflows/DEMO_WEBHOOK',
    formsUrl: 'https://forms.office.com/Pages/ResponsePage.aspx?id=DEMO_FORM_ID',
    formsQuestionId: '',
    syncConvocatoriaAccion: true,
    proactiveAlerts: true,
    empresasGrupo: [
      { cif: 'A12345678', razonSocial: 'Industrias Levante S.A.', creditoFundae: 18500 },
      { cif: 'B87654321', razonSocial: 'Grupo Novatech S.L.', creditoFundae: 12000 },
      { cif: 'A11223344', razonSocial: 'Soluciones Iberia S.A.', creditoFundae: 9200 }
    ],
    settingsDiasAvisoInicio: 7,
    settingsDiasAvisoFin: 15
  };

  // ---------------------------------------------------------------------------
  // 13. STATE (convocatoria actual con filtros activos)
  // ---------------------------------------------------------------------------
  const state = {
    activeFilters: {
      'Empresa': ['Industrias Levante S.A.'],
      'Departamento': [],
      'Área': [],
      'Ubicación': [],
      'Puesto': [],
      'Categoría Mercer': [],
      'Depende de': []
    },
    excludedNIFs: ['47', '48', '49'], // las 3 bajas
    eventConfig: {
      title: 'Acoso laboral — Protocolo',
      date: dateStr(5),
      startTime: '10:00',
      endTime: '14:00',
      location: 'Salón de actos — Industrias Levante',
      body: 'Hola,\n\nTe convocamos a la formación sobre el protocolo de prevención del acoso laboral.\n\nFecha: {fecha}\nHorario: {hora_inicio} - {hora_fin}\nLugar: {ubicacion}\nFormador: {formador}\n\nEs una formación obligatoria. Por favor, confirma tu asistencia.\n\nSaludos,\nDpto. de Formación',
      isTeams: false,
      isSeries: false,
      sendSurvey: true,
      formador: 'Ignacio Redondo',
      capacity: '25'
    },
    timestamp: now
  };

  // ---------------------------------------------------------------------------
  // 14. CORRECTIONS (2 correcciones manuales de datos del Excel)
  // ---------------------------------------------------------------------------
  const corrections = {
    '5': { 'Empleado': 'Laura Sánchez Gil-Ortega' },        // apellido compuesto
    '23': { 'Email trabajo': 'daniel.dominguez@industrias.com' }  // email corregido
  };

  // ---------------------------------------------------------------------------
  // 15. MINOR KEYS
  // ---------------------------------------------------------------------------
  const catalogViewMode = { acciones: 'lista', proveedores: 'ficha', centros: 'ficha', tutores: 'ficha' };
  const dashCollapsed = { dashAlerts: false, dashActions: false };
  const dashMode = 'detailed';
  const kbdInteractions = { 'cmd+k': 3, 'alt+1': 5, 'alt+2': 2, 'alt+3': 1, 'alt+4': 4, 'alt+5': 1 };

  // ---------------------------------------------------------------------------
  // WRITE TO LOCALSTORAGE
  // ---------------------------------------------------------------------------
  const data = {
    'convocatoria_state': state,
    'convocatoria_employees': employees,
    'convocatoria_fileName': 'organigrama_marzo_2026.xlsx',
    'convocatoria_history': history,
    'convocatoria_queue': queue,
    'convocatoria_settings': settings,
    'convocatoria_unifiedTemplates': unifiedTemplates,
    'convocatoria_catalog_viewMode': catalogViewMode,
    'convocatoria_corrections': corrections,
    'convocatoria_compliance_types': complianceTypes,
    'convocatoria_compliance_records': complianceRecords,
    'convocatoria_tnaRequests': tnaRequests,
    'convocatoria_dashCollapsed': dashCollapsed,
    'convocatoria_dash_mode': dashMode,
    'convocatoria_onboarding_done': true,
    'convocatoria_lastBackup': iso(ts(-3)),
    'convocatoria_kbdInteractions': kbdInteractions,
    'fundae_acciones': acciones,
    'fundae_proveedores': proveedores,
    'fundae_centros': centros,
    'fundae_tutores': tutores
  };

  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, JSON.stringify(value));
    count++;
  }

  console.log(`%c[TEST DATA] ${count} claves escritas en localStorage`, 'color: #16a34a; font-weight: bold; font-size: 14px');
  console.log('%cRecarga la pagina para ver los datos.', 'color: #475569; font-size: 12px');
  console.log('');
  console.log(`  Empleados:    ${employees.length} (${employees.filter(e => e['Alta/Baja'] === '1').length} activos, ${employees.filter(e => e['Alta/Baja'] === '0').length} bajas)`);
  console.log(`  Acciones:     ${acciones.length} (${acciones.filter(a => a.estado === 'Terminada').length} terminadas, ${acciones.filter(a => ['En marcha','Convocada'].includes(a.estado)).length} activas, ${acciones.filter(a => ['Planificada','Pendiente','Buscando','En preparación'].includes(a.estado)).length} futuras)`);
  console.log(`  Proveedores:  ${proveedores.length}`);
  console.log(`  Centros:      ${centros.length}`);
  console.log(`  Tutores:      ${tutores.length}`);
  console.log(`  Historial:    ${history.length} envios`);
  console.log(`  Cola:         ${queue.length} programados`);
  console.log(`  Compliance:   ${complianceTypes.length} tipos, ${Object.keys(complianceRecords).length} registros`);
  console.log(`  TNA:          ${tnaRequests.length} solicitudes`);
  console.log(`  Templates:    ${unifiedTemplates.length}`);
  console.log(`  Empresas:     ${settings.empresasGrupo.length} (credito total: ${settings.empresasGrupo.reduce((s,e) => s+e.creditoFundae, 0).toLocaleString('es-ES')}€)`);
  console.log('');
  console.log('%cPara limpiar: Object.keys(localStorage).filter(k => k.startsWith("convocatoria_") || k.startsWith("fundae_")).forEach(k => localStorage.removeItem(k)); location.reload()', 'color: #94a3b8; font-size: 11px');

  return '✓ Datos de prueba cargados';
})();
