const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const sequelize = require('./src/config/database');
const backupService = require('./src/services/backupService');

// Importar rutas
const cursosRoutes = require('./src/routes/cursos');
const estudiantesRoutes = require('./src/routes/estudiantes');
const asistenciasRoutes = require('./src/routes/asistencias');
const notasRoutes = require('./src/routes/notas');
const usuariosRoutes = require('./src/routes/usuarios');
const reportesRoutes = require('./src/routes/reportes');
const materiasRoutes = require('./src/routes/materias');
const eventosRoutes = require('./src/routes/eventos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Para desarrollo
}));
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Rutas de la API
app.use('/api/cursos', cursosRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/eventos', eventosRoutes);

// Ruta principal (sirve index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Sincronizar base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    // Sincronizar modelos (en desarrollo, no forzar en producción)
    if (process.env.NODE_ENV === 'development') {
      ///await sequelize.sync({ alter: true });
	console.log('✅ Base de datos lista (migraciones aplicadas).');
    }
    
    // Iniciar servicio de backups automáticos
    backupService.iniciarBackupAutomatico();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📁 Datos almacenados en: ${process.env.DATA_PATH || '../data'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await backupService.realizarBackupManual();
  process.exit(0);
});

module.exports = app;

