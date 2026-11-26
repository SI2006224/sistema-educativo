const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/asistencias', reporteController.reporteAsistencias);
router.get('/notas', reporteController.reporteNotas);
router.get('/consolidado', reporteController.reporteConsolidado);
router.get('/exportar/csv', reporteController.exportarCSV);

module.exports = router;