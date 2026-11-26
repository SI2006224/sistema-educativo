const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// La ruta se resuelve desde backend/ (dos niveles arriba de src/config/)
const storagePath = path.resolve(
  __dirname,
  '../../',
  process.env.DB_STORAGE || '../data/database.sqlite'
);

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: storagePath,
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;

//éste archivo crea la comunicación entre la base de datos y el resto del sistema utilizando Sequelize