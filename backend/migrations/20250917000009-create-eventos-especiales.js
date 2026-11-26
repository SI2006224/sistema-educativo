'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('eventos_especiales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: Sequelize.DATEONLY, allowNull: false, unique: true },
      tipo: {
        type: Sequelize.ENUM('feriado', 'paro', 'institucional', 'vacaciones', 'otro'),
        allowNull: false
      },
      descripcion: { type: Sequelize.STRING(200), allowNull: true },
      afecta_asistencia: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('eventos_especiales');
  }
};