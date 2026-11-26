const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const { registrarAuditoria } = require('../middleware/auditoria');

router.post('/login', usuarioController.login);

router.use(verificarToken);

router.get('/perfil', usuarioController.obtenerPerfil);
router.put('/perfil', usuarioController.actualizarPerfil);
router.put('/perfil/password', usuarioController.cambiarPassword);

router.get('/', verificarAdmin, usuarioController.obtenerUsuarios);
router.post('/', verificarAdmin, registrarAuditoria, usuarioController.crearUsuario);
router.put('/:id', verificarAdmin, registrarAuditoria, usuarioController.actualizarUsuario);
router.delete('/:id', verificarAdmin, registrarAuditoria, usuarioController.eliminarUsuario);

module.exports = router;