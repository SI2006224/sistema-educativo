const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login
exports.login = async (req, res) => {
  try {
    const { nombre_usuario, password } = req.body;
    
    if (!nombre_usuario || !password) {
      return res.status(400).json({ error: 'Se requiere usuario y contraseña' });
    }
    
    const usuario = await Usuario.findOne({
      where: { nombre_usuario, activo: true }
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    const passwordValido = await usuario.verificarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });
    
    // Generar token
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Obtener perfil
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Actualizar perfil
exports.actualizarPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    const { nombre_completo, email } = req.body;
    
    await usuario.update({ nombre_completo, email });
    await usuario.reload();
    
    const { password_hash, ...usuarioSinPassword } = usuario.toJSON();
    res.json(usuarioSinPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Cambiar password
exports.cambiarPassword = async (req, res) => {
  try {
    const { password_actual, password_nuevo } = req.body;
    
    const usuario = await Usuario.findByPk(req.usuario.id);
    
    const passwordValido = await usuario.verificarPassword(password_actual);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    await usuario.update({ password_hash: password_nuevo });
    
    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

// Obtener usuarios (admin)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear usuario (admin)
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre_usuario, email, password, rol, nombre_completo } = req.body;
    
    // Verificar duplicados
    const existente = await Usuario.findOne({
      where: { [Op.or]: [{ nombre_usuario }, { email }] }
    });
    
    if (existente) {
      return res.status(400).json({ error: 'Usuario o email ya existen' });
    }
    
    const usuario = await Usuario.create({
      nombre_usuario,
      email,
      password_hash: password,
      rol,
      nombre_completo
    });
    
    req.auditoriaData = {
      tabla: 'usuarios',
      registro_id: usuario.id,
      accion: 'crear',
      datos_nuevos: usuario.toJSON()
    };
    
    const { password_hash, ...usuarioSinPassword } = usuario.toJSON();
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario (admin)
exports.actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const datosAnteriores = usuario.toJSON();
    await usuario.update(req.body);
    await usuario.reload();
    
    req.auditoriaData = {
      tabla: 'usuarios',
      registro_id: usuario.id,
      accion: 'editar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: usuario.toJSON()
    };
    
    const { password_hash, ...usuarioSinPassword } = usuario.toJSON();
    res.json(usuarioSinPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario (admin)
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const datosAnteriores = usuario.toJSON();
    await usuario.update({ activo: false });
    
    req.auditoriaData = {
      tabla: 'usuarios',
      registro_id: usuario.id,
      accion: 'eliminar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: usuario.toJSON()
    };
    
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};