'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notas', {
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
      nombre_actividad: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('examen', 'tarea', 'proyecto', 'participacion'),
        allowNull: false
      },
      fecha_entrega: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      calificacion: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 10
        }
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
    
    await queryInterface.addIndex('notas', ['estudiante_id']);
    await queryInterface.addIndex('notas', ['trimestre']);
    await queryInterface.addIndex('notas', ['fecha_entrega']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notas');
  }
};