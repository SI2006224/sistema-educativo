const sequelize = require('../config/database');
const Curso = require('./Curso');
const Estudiante = require('./Estudiante');
const Asistencia = require('./Asistencia');
const Nota = require('./Nota');
const Usuario = require('./Usuario');
const Auditoria = require('./Auditoria');
const Materia = require('./Materia');
const EventoEspecial = require('./EventoEspecial');
// Sincronizar relaciones
// Las relaciones ya están definidas en cada modelo

module.exports = {
  sequelize,
  Curso,
  Estudiante,
  Asistencia,
  Nota,
  Usuario,
  Auditoria,
  Materia,
  EventoEspecial
};