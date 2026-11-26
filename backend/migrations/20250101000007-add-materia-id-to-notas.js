'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('notas', 'materia_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'materias', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('notas', 'materia_id');
  }
};