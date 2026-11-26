const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' });
    }
    
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// Verificar rol de profesor o administrador
const verificarProfesor = (req, res, next) => {
  if (!['profesor', 'administrador'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de profesor o administrador' });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin, verificarProfesor };