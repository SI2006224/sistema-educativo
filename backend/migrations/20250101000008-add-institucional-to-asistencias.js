'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      // El enum se creó en la migración inicial; PostgreSQL agrega el valor aquí.
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_asistencias_estado" ADD VALUE IF NOT EXISTS 'institucional';`
      );
      return;
    }

    if (dialect !== 'sqlite') {
      throw new Error(`Dialecto no compatible con esta migración: ${dialect}`);
    }

    // SQLite no permite ALTER ENUM directamente, así que se recrea la tabla.
    await queryInterface.sequelize.query(`
      CREATE TABLE asistencias_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estudiante_id INTEGER NOT NULL,
        fecha DATE NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK(estado IN ('presente', 'ausente', 'justificado', 'tarde', 'retiro', 'huelga', 'institucional')),
        observaciones TEXT,
        trimestre INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
      );
    `);
    await queryInterface.sequelize.query(`
      INSERT INTO asistencias_new SELECT * FROM asistencias;
    `);
    await queryInterface.sequelize.query(`DROP TABLE asistencias;`);
    await queryInterface.sequelize.query(`ALTER TABLE asistencias_new RENAME TO asistencias;`);
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS asistencias_fecha ON asistencias(fecha);'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS asistencias_estudiante_id ON asistencias(estudiante_id);'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS asistencias_trimestre ON asistencias(trimestre);'
    );
  },
  down: async (queryInterface, Sequelize) => {
    // Revertir no es trivial, omitir
  }
};
