'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('notas', 'instancia', {
      type: Sequelize.ENUM('regular', 'diciembre', 'febrero'),
      defaultValue: 'regular'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('notas', 'instancia');
  }
};