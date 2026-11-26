const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Estudiante = require('./Estudiante');

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('presente', 'ausente', 'justificado', 'tarde', 'retiro', 'huelga', 'institucional'),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trimestre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 3
    },
    comment: '1, 2 o 3'
  }
}, {
  tableName: 'asistencias',
  indexes: [
    { fields: ['fecha'] },
    { fields: ['estudiante_id'] },
    { fields: ['trimestre'] }
  ]
});

// Relaciones 
Asistencia.belongsTo(Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });
Estudiante.hasMany(Asistencia, { foreignKey: 'estudiante_id', as: 'asistencias' });

module.exports = Asistencia;