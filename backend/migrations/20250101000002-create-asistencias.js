'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asistencias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      estudiante_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estudiantes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      estado: {
        type: Sequelize.ENUM('presente', 'ausente', 'justificado', 'tarde', 'retiro', 'huelga'),
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      trimestre: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 3
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    
    await queryInterface.addIndex('asistencias', ['fecha']);
    await queryInterface.addIndex('asistencias', ['estudiante_id']);
    await queryInterface.addIndex('asistencias', ['trimestre']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('asistencias');
  }
};