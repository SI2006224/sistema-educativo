const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');
const { validarAsistencia } = require('../middleware/validacion');
const { registrarAuditoria } = require('../middleware/auditoria');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/', asistenciaController.obtenerAsistencias);
router.get('/resumen', asistenciaController.resumenAsistencias);

// Rutas de escritura (requieren rol profesor o admin)
router.post('/masiva', verificarProfesor, registrarAuditoria, asistenciaController.registrarAsistenciaMasiva);

module.exports = router;