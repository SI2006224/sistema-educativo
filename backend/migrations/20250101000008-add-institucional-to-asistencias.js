'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // SQLite no permite ALTER ENUM directamente, recrear tabla
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
  },
  down: async (queryInterface, Sequelize) => {
    // Revertir no es trivial, omitir
  }
};