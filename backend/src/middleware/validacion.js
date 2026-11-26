const { body, validationResult } = require('express-validator');

// Validar errores
const validarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validaciones para curso
const validarCurso = [
  body('codigo').notEmpty().withMessage('El código es obligatorio'),
  body('año_lectivo').isLength({ min: 4, max: 4 }).withMessage('Año lectivo debe tener 4 dígitos'),
  body('turno').isIn(['M', 'T', 'N']).withMessage('Turno debe ser M, T o N'),
  validarErrores
];

// Validaciones para estudiante (crear)
const validarEstudiante = [
  body('dni').notEmpty().withMessage('DNI es obligatorio'),
  body('apellidos').notEmpty().withMessage('Apellidos son obligatorios'),
  body('nombres').notEmpty().withMessage('Nombres son obligatorios'),
  body('curso_id').isInt().withMessage('Curso ID debe ser un número entero'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  validarErrores
];

// Validaciones para actualizar estudiante (campos opcionales)
const validarActualizarEstudiante = [
  body('dni').optional().notEmpty().withMessage('DNI no puede estar vacío'),
  body('apellidos').optional().notEmpty().withMessage('Apellidos no pueden estar vacíos'),
  body('nombres').optional().notEmpty().withMessage('Nombres no pueden estar vacíos'),
  body('curso_id').optional().isInt().withMessage('Curso ID debe ser un número entero'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Email inválido'),
  validarErrores
];

// Validaciones para asistencia
const validarAsistencia = [
  body('estudiante_id').isInt().withMessage('Estudiante ID debe ser un número entero'),
  body('estado').isIn(['presente', 'ausente', 'justificado', 'tarde', 'retiro', 'huelga', 'institucional'])
    .withMessage('Estado inválido'),
  body('trimestre').isInt({ min: 1, max: 3 }).withMessage('Trimestre debe ser 1, 2 o 3'),
  body('fecha').optional().isDate().withMessage('Fecha inválida'),
  validarErrores
];

// Validaciones para nota
const validarNota = [
  body('estudiante_id').isInt().withMessage('Estudiante ID debe ser un número entero'),
  body('nombre_actividad').notEmpty().withMessage('Nombre de actividad es obligatorio'),
  body('tipo').isIn(['examen', 'tarea', 'proyecto', 'participacion']).withMessage('Tipo inválido'),
  body('fecha_entrega').isDate().withMessage('Fecha de entrega inválida'),
  body('calificacion').isFloat({ min: 0, max: 10 }).withMessage('Calificación debe ser entre 0 y 10'),
  body('trimestre').isInt({ min: 1, max: 3 }).withMessage('Trimestre debe ser 1, 2 o 3'),
  validarErrores
];

// Validaciones para actualizar nota (campos opcionales)
const validarActualizarNota = [
  body('nombre_actividad').optional().notEmpty().withMessage('Nombre de actividad no puede estar vacío'),
  body('tipo').optional().isIn(['examen', 'tarea', 'proyecto', 'participacion']).withMessage('Tipo inválido'),
  body('fecha_entrega').optional().isDate().withMessage('Fecha de entrega inválida'),
  body('calificacion').optional().isFloat({ min: 0, max: 10 }).withMessage('Calificación debe ser entre 0 y 10'),
  body('instancia').optional().isIn(['regular', 'diciembre', 'febrero']).withMessage('Instancia inválida'),
  validarErrores
];

// Validaciones para actualizar curso (campos opcionales)
const validarActualizarCurso = [
  body('codigo').optional().notEmpty().withMessage('El código no puede estar vacío'),
  body('año_lectivo').optional().isLength({ min: 4, max: 4 }).withMessage('Año lectivo debe tener 4 dígitos'),
  body('turno').optional().isIn(['M', 'T', 'N']).withMessage('Turno debe ser M, T o N'),
  validarErrores
];

module.exports = {
  validarErrores,
  validarCurso,
  validarActualizarCurso,
  validarEstudiante,
  validarActualizarEstudiante,
  validarAsistencia,
  validarNota,
  validarActualizarNota
};