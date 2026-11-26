const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const commonOptions = {
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
};

let sequelize;

if (process.env.DATABASE_URL) {
  // Railway entrega DATABASE_URL para conectar el backend con PostgreSQL.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...commonOptions,
    dialect: 'postgres'
  });
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Falta DATABASE_URL: en producción el sistema requiere PostgreSQL.');
  }

  // En desarrollo local se sigue usando la base SQLite del proyecto.
  const storagePath = path.resolve(
    __dirname,
    '../../',
    process.env.DB_STORAGE || '../data/database.sqlite'
  );

  sequelize = new Sequelize({
    ...commonOptions,
    dialect: 'sqlite',
    storage: storagePath
  });
}

module.exports = sequelize;

//éste archivo crea la comunicación entre la base de datos y el resto del sistema utilizando Sequelize
