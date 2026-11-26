const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');
const { validarEstudiante } = require('../middleware/validacion');
const { registrarAuditoria } = require('../middleware/auditoria');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/', estudianteController.obtenerEstudiantes);
router.get('/:id', estudianteController.obtenerEstudiante);

// Rutas de escritura (requieren rol profesor o admin)
router.post('/', verificarProfesor, validarEstudiante, registrarAuditoria, estudianteController.crearEstudiante);
router.put('/:id', verificarProfesor, validarEstudiante, registrarAuditoria, estudianteController.actualizarEstudiante);
router.delete('/:id', verificarProfesor, registrarAuditoria, estudianteController.eliminarEstudiante);

module.exports = router;