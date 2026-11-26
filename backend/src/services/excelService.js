const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-writer');

class ExcelService {
  /**
   * Exporta datos a CSV
   */
  async exportarCSV(data, outputPath) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar');
      }
      
      // Crear directorio si no existe
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Obtener cabeceras de la primera fila
      const headers = Object.keys(data[0]);
      
      const csvWriter = csv.createObjectCsvWriter({
        path: outputPath,
        header: headers.map(h => ({ id: h, title: h }))
      });
      
      await csvWriter.writeRecords(data);
      return outputPath;
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      throw error;
    }
  }
  
  /**
   * Exporta datos a Excel (XLSX)
   */
  async exportarExcel(data, outputPath, sheetName = 'Datos') {
    try {
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar');
      }
      
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);
      
      // Agregar cabeceras
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // Estilizar cabeceras
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1a237e' }
      };
      headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      // Agregar datos
      data.forEach(row => {
        const values = headers.map(h => row[h] || '');
        worksheet.addRow(values);
      });
      
      // Autoajustar columnas
      worksheet.columns.forEach(column => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, cell => {
          const value = cell.value ? cell.value.toString() : '';
          if (value.length > maxLength) {
            maxLength = value.length;
          }
        });
        column.width = Math.min(maxLength + 5, 40);
      });
      
      await workbook.xlsx.writeFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      throw error;
    }
  }
  
  /**
   * Importa datos desde Excel
   */
  async importarExcel(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No se encontró la hoja de trabajo');
      }
      
      const data = [];
      const headers = [];
      
      // Leer cabeceras (primera fila)
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value;
      });
      
      // Leer datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltar cabeceras
        
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            rowData[header] = cell.value;
          }
        });
        
        // Verificar que la fila no está vacía
        if (Object.values(rowData).some(v => v !== null && v !== undefined && v !== '')) {
          data.push(rowData);
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error al importar Excel:', error);
      throw error;
    }
  }
}

module.exports = new ExcelService();