const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Curso = sequelize.define('Curso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  año_lectivo: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  turno: {
    type: DataTypes.ENUM('M', 'T', 'N'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cursos',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['codigo', 'año_lectivo', 'turno'],
      name: 'cursos_codigo_año_turno_unique'
    }
  ]
});
// Incluir campo virtual nombre_completo en la serialización JSON
Curso.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  values.nombre_completo = `${this.codigo}-${this.año_lectivo}-${this.turno}`;
  return values;
};
module.exports = Curso;

