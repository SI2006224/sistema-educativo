const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const { validarCurso, validarActualizarCurso } = require('../middleware/validacion');
const { registrarAuditoria } = require('../middleware/auditoria');

router.get('/', verificarToken, cursoController.obtenerCursos);
router.get('/:id', verificarToken, cursoController.obtenerCurso);
router.get('/año/:año', verificarToken, cursoController.obtenerCursosPorAño);

router.post('/', verificarToken, verificarAdmin, validarCurso, registrarAuditoria, cursoController.crearCurso);
router.put('/:id', verificarToken, verificarAdmin, validarActualizarCurso, registrarAuditoria, cursoController.actualizarCurso);
router.delete('/:id', verificarToken, verificarAdmin, registrarAuditoria, cursoController.eliminarCurso);

module.exports = router;