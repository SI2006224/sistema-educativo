const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');
const { validarEstudiante, validarActualizarEstudiante } = require('../middleware/validacion');
const { registrarAuditoria } = require('../middleware/auditoria');

router.use(verificarToken);

router.get('/', estudianteController.obtenerEstudiantes);
router.get('/:id', estudianteController.obtenerEstudiante);

router.post('/', verificarProfesor, validarEstudiante, registrarAuditoria, estudianteController.crearEstudiante);
router.put('/:id', verificarProfesor, validarActualizarEstudiante, registrarAuditoria, estudianteController.actualizarEstudiante);
router.delete('/:id', verificarProfesor, registrarAuditoria, estudianteController.eliminarEstudiante);

module.exports = router;