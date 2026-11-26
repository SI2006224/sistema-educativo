const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', eventoController.obtenerEventos);
router.get('/rango', eventoController.obtenerEventosPorRango);
router.get('/verificar/:fecha', eventoController.verificarFecha);
router.post('/', verificarProfesor, eventoController.crearEvento);
router.put('/:id', verificarProfesor, eventoController.actualizarEvento);
router.delete('/:id', verificarProfesor, eventoController.eliminarEvento);

module.exports = router;