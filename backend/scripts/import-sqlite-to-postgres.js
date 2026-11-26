'use strict';

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// DATABASE_IMPORT_URL permite usar temporalmente un túnel seguro desde la PC.
if (process.env.DATABASE_IMPORT_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_IMPORT_URL;
}

const sequelize = require('../src/config/database');

const tables = [
  'cursos',
  'materias',
  'usuarios',
  'estudiantes',
  'asistencias',
  'notas',
  'eventos_especiales',
  'auditoria'
];

const booleanColumns = {
  cursos: ['activo'],
  estudiantes: ['activo'],
  usuarios: ['activo'],
  eventos_especiales: ['afecta_asistencia']
};

const jsonColumns = {
  auditoria: ['datos_anteriores', 'datos_nuevos']
};

function sqliteAll(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => (error ? reject(error) : resolve(rows)));
  });
}

function quoteSqliteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function normalizeRow(table, row) {
  const normalized = { ...row };

  for (const column of booleanColumns[table] || []) {
    if (normalized[column] !== null && normalized[column] !== undefined) {
      normalized[column] = Boolean(normalized[column]);
    }
  }

  for (const column of jsonColumns[table] || []) {
    if (typeof normalized[column] === 'string' && normalized[column] !== '') {
      normalized[column] = JSON.parse(normalized[column]);
    }
  }

  return normalized;
}

async function main() {
  if (sequelize.getDialect() !== 'postgres') {
    throw new Error('Configura DATABASE_IMPORT_URL con la conexión al PostgreSQL de Railway.');
  }

  const storageSetting = process.env.DB_STORAGE || '../data/database.sqlite';
  const sqlitePath = path.resolve(__dirname, '..', storageSetting);
  if (!fs.existsSync(sqlitePath)) {
    throw new Error(`No se encontró el archivo SQLite configurado en DB_STORAGE: ${sqlitePath}`);
  }

  const sourceDb = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY);

  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    const rowsByTable = {};

    for (const table of tables) {
      await queryInterface.describeTable(table);
      const existing = await sequelize.query(`SELECT COUNT(*) AS total FROM "${table}"`, {
        type: sequelize.QueryTypes.SELECT
      });
      if (Number(existing[0].total) !== 0) {
        throw new Error(`La tabla ${table} de PostgreSQL ya tiene registros; se cancela para evitar duplicados.`);
      }

      const rows = await sqliteAll(sourceDb, `SELECT * FROM ${quoteSqliteIdentifier(table)}`);
      rowsByTable[table] = rows.map(row => normalizeRow(table, row));
    }

    await sequelize.transaction(async transaction => {
      for (const table of tables) {
        const rows = rowsByTable[table];
        if (rows.length > 0) {
          await queryInterface.bulkInsert(table, rows, { transaction });
        }

        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1), COUNT(id) > 0) FROM "${table}"`,
          { transaction }
        );
      }
    });

    console.log('Importación terminada. Registros copiados por tabla:');
    for (const table of tables) {
      console.log(`- ${table}: ${rowsByTable[table].length}`);
    }
  } finally {
    await new Promise((resolve, reject) => {
      sourceDb.close(error => (error ? reject(error) : resolve()));
    });
    await sequelize.close();
  }
}

main().catch(error => {
  console.error(`No se pudo importar la base SQLite: ${error.message}`);
  process.exitCode = 1;
});
