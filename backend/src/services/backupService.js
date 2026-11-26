const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class BackupService {
  constructor() {
    this.backupPath = process.env.BACKUP_PATH || path.resolve(__dirname, '../../../data/backups');
    this.dataPath = process.env.DATA_PATH || path.resolve(__dirname, '../../../data');
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 30;
    this.interval = null;
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  /**
   * Inicia el servicio de backups automáticos
   */
  iniciarBackupAutomatico() {
    const intervalMs = parseInt(process.env.BACKUP_INTERVAL) || 86400000; // 24 horas
    
    // Limpiar backups antiguos al inicio
    this.limpiarBackupsAntiguos();
    
    // Programar backup automático
    this.interval = setInterval(() => {
      this.realizarBackupManual()
        .then(() => console.log('✅ Backup automático completado'))
        .catch(error => console.error('❌ Error en backup automático:', error));
    }, intervalMs);
    
    console.log(`🔄 Backups automáticos programados cada ${intervalMs / 3600000} horas`);
  }

  /**
   * Realiza un backup manual
   */
  async realizarBackupManual() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      const backupDir = path.join(this.backupPath, backupName);
      
      // Crear directorio del backup
      fs.mkdirSync(backupDir, { recursive: true });
      
      // Copiar base de datos SQLite
      const dbPath = path.join(this.dataPath, 'database.sqlite');
      if (fs.existsSync(dbPath)) {
        const dbBackupPath = path.join(backupDir, 'database.sqlite');
        fs.copyFileSync(dbPath, dbBackupPath);
        console.log(`📄 Backup de base de datos: ${dbBackupPath}`);
      }
      
      // Copiar archivos de configuración
      const envPath = path.join(__dirname, '../../../.env');
      if (fs.existsSync(envPath)) {
        const envBackupPath = path.join(backupDir, '.env');
        fs.copyFileSync(envPath, envBackupPath);
      }
      
      // Crear archivo de metadatos
      const metadata = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        size: this._getFolderSize(backupDir),
        files: fs.readdirSync(backupDir)
      };
      
      fs.writeFileSync(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      // Limpiar backups antiguos
      this.limpiarBackupsAntiguos();
      
      return {
        success: true,
        backupPath: backupDir,
        metadata
      };
    } catch (error) {
      console.error('Error al realizar backup:', error);
      throw error;
    }
  }

  /**
   * Limpia backups antiguos (mantiene solo los últimos N)
   */
  limpiarBackupsAntiguos() {
    try {
      const backups = fs.readdirSync(this.backupPath)
        .filter(dir => dir.startsWith('backup-'))
        .map(dir => ({
          name: dir,
          path: path.join(this.backupPath, dir),
          ctime: fs.statSync(path.join(this.backupPath, dir)).ctime
        }))
        .sort((a, b) => b.ctime - a.ctime);
      
      // Eliminar backups excedentes
      const toDelete = backups.slice(this.maxBackups);
      toDelete.forEach(backup => {
        fs.rmSync(backup.path, { recursive: true, force: true });
        console.log(`🗑️ Backup eliminado: ${backup.name}`);
      });
      
      console.log(`📊 Backups actuales: ${backups.length - toDelete.length}`);
    } catch (error) {
      console.error('Error al limpiar backups:', error);
    }
  }

  /**
   * Restaura un backup
   */
  async restaurarBackup(backupName) {
    try {
      const backupDir = path.join(this.backupPath, backupName);
      
      if (!fs.existsSync(backupDir)) {
        throw new Error(`Backup ${backupName} no encontrado`);
      }
      
      // Restaurar base de datos
      const dbBackupPath = path.join(backupDir, 'database.sqlite');
      if (fs.existsSync(dbBackupPath)) {
        const dbPath = path.join(this.dataPath, 'database.sqlite');
        fs.copyFileSync(dbBackupPath, dbPath);
        console.log(`📄 Base de datos restaurada desde: ${dbBackupPath}`);
      }
      
      // Restaurar archivo .env
      const envBackupPath = path.join(backupDir, '.env');
      if (fs.existsSync(envBackupPath)) {
        const envPath = path.join(__dirname, '../../../.env');
        fs.copyFileSync(envBackupPath, envPath);
      }
      
      return {
        success: true,
        message: `Backup ${backupName} restaurado exitosamente`
      };
    } catch (error) {
      console.error('Error al restaurar backup:', error);
      throw error;
    }
  }

  /**
   * Obtiene el tamaño de una carpeta
   */
  _getFolderSize(folderPath) {
    let size = 0;
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += this._getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  }

  /**
   * Lista los backups disponibles
   */
  listarBackups() {
    try {
      const backups = fs.readdirSync(this.backupPath)
        .filter(dir => dir.startsWith('backup-'))
        .map(dir => {
          const stats = fs.statSync(path.join(this.backupPath, dir));
          const metadataPath = path.join(this.backupPath, dir, 'metadata.json');
          let metadata = null;
          
          if (fs.existsSync(metadataPath)) {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          }
          
          return {
            name: dir,
            created: stats.ctime,
            size: metadata?.size || 0,
            files: metadata?.files || []
          };
        })
        .sort((a, b) => b.created - a.created);
      
      return backups;
    } catch (error) {
      console.error('Error al listar backups:', error);
      return [];
    }
  }

  /**
   * Detiene el servicio de backups automáticos
   */
  detenerBackupAutomatico() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ Backups automáticos detenidos');
    }
  }
}

module.exports = new BackupService();