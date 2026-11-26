/**
 * Formatea una fecha a formato local
 */
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-AR');
};

/**
 * Valida un DNI argentino
 */
const validarDNI = (dni) => {
  return /^\d{7,8}$/.test(dni);
};

/**
 * Genera un identificador único para estudiante
 */
const generarIdentificadorEstudiante = (estudiante) => {
  if (!estudiante || !estudiante.curso) return '';
  const curso = estudiante.curso;
  return `${curso.año_lectivo} ${curso.codigo}-${curso.turno} ${estudiante.dni} ${estudiante.apellidos} ${estudiante.nombres}`;
};

/**
 * Calcula el promedio de notas
 */
const calcularPromedio = (notas) => {
  if (!notas || notas.length === 0) return 0;
  const total = notas.reduce((sum, n) => sum + n.calificacion, 0);
  return parseFloat((total / notas.length).toFixed(1));
};

/**
 * Obtiene el estado de asistencia en español
 */
const estadoAsistenciaToSpanish = (estado) => {
  const map = {
    'presente': 'Presente',
    'ausente': 'Ausente',
    'justificado': 'Justificado',
    'tarde': 'Tarde',
    'retiro': 'Retiro',
    'huelga': 'Huelga'
  };
  return map[estado] || estado;
};

/**
 * Obtiene el tipo de nota en español
 */
const tipoNotaToSpanish = (tipo) => {
  const map = {
    'examen': 'Examen',
    'tarea': 'Tarea',
    'proyecto': 'Proyecto',
    'participacion': 'Participación'
  };
  return map[tipo] || tipo;
};

module.exports = {
  formatearFecha,
  validarDNI,
  generarIdentificadorEstudiante,
  calcularPromedio,
  estadoAsistenciaToSpanish,
  tipoNotaToSpanish
};
