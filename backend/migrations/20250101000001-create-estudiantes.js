'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('estudiantes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      curso_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cursos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      dni: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      apellidos: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    
    await queryInterface.addIndex('estudiantes', ['dni']);
    await queryInterface.addIndex('estudiantes', ['apellidos', 'nombres']);
    await queryInterface.addIndex('estudiantes', ['dni', 'curso_id'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('estudiantes');
  }
};