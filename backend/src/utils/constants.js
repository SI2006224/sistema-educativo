// Estados de asistencia
const ESTADOS_ASISTENCIA = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente',
  JUSTIFICADO: 'justificado',
  TARDE: 'tarde',
  RETIRO: 'retiro',
  HUELGA: 'huelga'
};

// Tipos de notas
const TIPOS_NOTA = {
  EXAMEN: 'examen',
  TAREA: 'tarea',
  PROYECTO: 'proyecto',
  PARTICIPACION: 'participacion'
};

// Roles de usuario
const ROLES = {
  PROFESOR: 'profesor',
  ADMINISTRADOR: 'administrador'
};

// Turnos
const TURNOS = {
  MAÑANA: 'M',
  TARDE: 'T',
  NOCHE: 'N'
};

// Trimestres
const TRIMESTRES = [1, 2, 3];

// Límite de actividades por trimestre
const MAX_ACTIVIDADES_POR_TRIMESTRE = 10;

module.exports = {
  ESTADOS_ASISTENCIA,
  TIPOS_NOTA,
  ROLES,
  TURNOS,
  TRIMESTRES,
  MAX_ACTIVIDADES_POR_TRIMESTRE
};