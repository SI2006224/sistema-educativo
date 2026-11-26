const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Estudiante = require('./Estudiante');

const Nota = sequelize.define('Nota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_actividad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('examen', 'tarea', 'proyecto', 'participacion'),
    allowNull: false
  },
  fecha_entrega: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  calificacion: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 10
    }
    
  },
  trimestre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 3
    },
    comment: '1, 2 o 3'
  },
  instancia: {
    type: DataTypes.ENUM('regular', 'diciembre', 'febrero'),
    defaultValue: 'regular'
  },
}, {
  tableName: 'notas',
  indexes: [
    { fields: ['estudiante_id'] },
    { fields: ['trimestre'] },
    { fields: ['fecha_entrega'] }
  ]
  
});


// Relaciones
Nota.belongsTo(Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });
Estudiante.hasMany(Nota, { foreignKey: 'estudiante_id', as: 'notas' });

module.exports = Nota;