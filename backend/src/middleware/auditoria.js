const { Auditoria } = require('../models');

const registrarAuditoria = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Guardar la auditoría después de la respuesta
    if (req.auditoriaData) {
      Auditoria.create({
        usuario_id: req.usuario.id,
        tabla: req.auditoriaData.tabla,
        registro_id: req.auditoriaData.registro_id || null,
        accion: req.auditoriaData.accion,
        datos_anteriores: req.auditoriaData.datos_anteriores || null,
        datos_nuevos: req.auditoriaData.datos_nuevos || null,
        ip_origen: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      }).catch(err => console.error('Error al registrar auditoría:', err));
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

module.exports = { registrarAuditoria };