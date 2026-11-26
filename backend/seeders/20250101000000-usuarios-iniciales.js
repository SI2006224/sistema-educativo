'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPasswordPlain = process.env.INITIAL_ADMIN_PASSWORD;
    const profesorPasswordPlain = process.env.INITIAL_PROFESOR_PASSWORD;

    if (!adminPasswordPlain || !profesorPasswordPlain) {
      throw new Error(
        'Para crear los usuarios iniciales, define INITIAL_ADMIN_PASSWORD e INITIAL_PROFESOR_PASSWORD en el entorno.'
      );
    }

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash(adminPasswordPlain, salt);
    const profesorPassword = await bcrypt.hash(profesorPasswordPlain, salt);
    
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre_usuario: 'admin',
        email: 'admin@educacion.com',
        password_hash: adminPassword,
        rol: 'administrador',
        nombre_completo: 'Administrador del Sistema',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre_usuario: 'profesor',
        email: 'profesor@educacion.com',
        password_hash: profesorPassword,
        rol: 'profesor',
        nombre_completo: 'Profesor Principal',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
