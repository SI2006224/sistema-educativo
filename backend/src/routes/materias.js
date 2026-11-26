const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const { verificarToken, verificarProfesor } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', materiaController.obtenerMaterias);
router.post('/', verificarProfesor, materiaController.crearMateria);
router.put('/:id', verificarProfesor, materiaController.actualizarMateria);

module.exports = router;
