const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Auditoria = sequelize.define('Auditoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tabla: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Nombre de la tabla afectada'
  },
  registro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del registro afectado'
  },
  accion: {
    type: DataTypes.ENUM('crear', 'editar', 'eliminar'),
    allowNull: false
  },
  datos_anteriores: {
    type: DataTypes.JSON,
    allowNull: true
  },
  datos_nuevos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_origen: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'auditoria',
  indexes: [
    { fields: ['tabla'] },
    { fields: ['registro_id'] },
    { fields: ['created_at'] }
  ]
});

// Relaciones
Auditoria.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Auditoria, { foreignKey: 'usuario_id', as: 'auditoria' });

module.exports = Auditoria;