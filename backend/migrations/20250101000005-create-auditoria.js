'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auditoria', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      tabla: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      registro_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      accion: {
        type: Sequelize.ENUM('crear', 'editar', 'eliminar'),
        allowNull: false
      },
      datos_anteriores: {
        type: Sequelize.JSON,
        allowNull: true
      },
      datos_nuevos: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_origen: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
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
    
    await queryInterface.addIndex('auditoria', ['tabla']);
    await queryInterface.addIndex('auditoria', ['registro_id']);
    await queryInterface.addIndex('auditoria', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auditoria');
  }
};