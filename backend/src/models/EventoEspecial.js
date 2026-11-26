const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventoEspecial = sequelize.define('EventoEspecial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('feriado', 'paro', 'institucional', 'vacaciones', 'otro'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  afecta_asistencia: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si es true, no se cuenta como ausencia'
  }
}, {
  tableName: 'eventos_especiales',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['fecha'] }
  ]
});

module.exports = EventoEspecial;