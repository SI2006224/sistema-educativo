const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');
const { validarNota, validarActualizarNota } = require('../middleware/validacion');
const { registrarAuditoria } = require('../middleware/auditoria');

router.use(verificarToken);

router.get('/', notaController.obtenerNotas);
router.get('/:id', notaController.obtenerNota);
router.get('/estudiante/:estudianteId', notaController.obtenerNotasPorEstudiante);
router.get('/resumen/trimestre', notaController.resumenNotasPorTrimestre);

router.post('/', verificarProfesor, validarNota, registrarAuditoria, notaController.crearNota);
router.post('/masiva', verificarProfesor, registrarAuditoria, notaController.registrarNotasMasivas);
router.put('/:id', verificarProfesor, validarActualizarNota, registrarAuditoria, notaController.actualizarNota);
router.delete('/:id', verificarProfesor, registrarAuditoria, notaController.eliminarNota);

module.exports = router;