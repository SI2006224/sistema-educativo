const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');
const { registrarAuditoria } = require('../middleware/auditoria');

router.use(verificarToken);

router.get('/', asistenciaController.obtenerAsistencias);
router.get('/resumen', asistenciaController.resumenAsistencias);
router.get('/calcular', asistenciaController.calcularAsistencias);

router.post('/masiva', verificarProfesor, registrarAuditoria, asistenciaController.registrarAsistenciaMasiva);

module.exports = router;