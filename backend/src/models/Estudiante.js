const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Curso = require('./Curso');

const Estudiante = sequelize.define('Estudiante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.apellidos} ${this.nombres}`;
    }
  },
  identificador_unico: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.curso?.año_lectivo || ''} ${this.curso?.codigo || ''}-${this.curso?.turno || ''} ${this.dni} ${this.apellidos} ${this.nombres}`;
    }
  },
  email: {
  type: DataTypes.STRING(100),
  allowNull: true,
  validate: {
    isEmail: true
  }

  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'estudiantes',
  indexes: [
    { fields: ['dni'] },
    { fields: ['apellidos', 'nombres'] },
    { unique: true, fields: ['dni', 'curso_id'] }
  ]
});

// Relaciones
Estudiante.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });
Curso.hasMany(Estudiante, { foreignKey: 'curso_id', as: 'estudiantes' });

module.exports = Estudiante;