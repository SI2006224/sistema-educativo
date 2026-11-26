const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  /**
   * Genera un reporte de asistencias en PDF
   */
  async generarReporteAsistencias(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Reporte de Asistencias',
            Author: 'Sistema Educativo',
            Subject: 'Asistencias de estudiantes'
          }
        });

        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Encabezado
        this._agregarEncabezado(doc, 'Reporte de Asistencias', data);

        // Tabla de asistencias
        this._agregarTablaAsistencias(doc, data.asistencias);

        // Resumen estadístico
        this._agregarResumen(doc, data.resumen);

        // Pie de página
        this._agregarPiePagina(doc);

        doc.end();

        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un reporte de notas en PDF
   */
  async generarReporteNotas(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Reporte de Calificaciones',
            Author: 'Sistema Educativo',
            Subject: 'Notas de estudiantes'
          }
        });

        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Encabezado
        this._agregarEncabezado(doc, 'Reporte de Calificaciones', data);

        // Tabla de notas
        this._agregarTablaNotas(doc, data.notas);

        // Gráfico de rendimiento (barras)
        this._agregarGraficoRendimiento(doc, data.grafico);

        // Pie de página
        this._agregarPiePagina(doc);

        doc.end();

        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Agrega encabezado al PDF
   */
  _agregarEncabezado(doc, titulo, data) {
    // Logo (si existe)
    const logoPath = path.join(__dirname, '../../../frontend/public/assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 80 });
    }

    // Título
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#1a237e')
      .text(titulo, { align: 'center' })
      .moveDown(0.5);

    // Información del reporte
    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text(`Año Lectivo: ${data.año || 'N/A'}`, { align: 'center' })
      .text(`Curso: ${data.curso || 'N/A'}`, { align: 'center' })
      .text(`Trimestre: ${data.trimestre || 'N/A'}`, { align: 'center' })
      .text(data.materia ? `Materia: ${data.materia}` : '', { align: 'center' })
      .text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1);

    // Línea separadora
    doc
      .strokeColor('#1a237e')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1);
  }

  /**
   * Agrega tabla de asistencias
   */
  _agregarTablaAsistencias(doc, asistencias) {
    if (!asistencias || asistencias.length === 0) {
      doc.text('No hay datos de asistencias disponibles', { align: 'center' });
      return;
    }

    const tableTop = doc.y;
    const columns = ['#', 'Estudiante', 'Fecha', 'Estado', 'Observaciones'];
    const widths = [30, 150, 100, 100, 150];
    const xPositions = [50, 80, 230, 330, 430];

    // Cabecera
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff');

    // Fondo de cabecera
    doc
      .rect(50, tableTop, 495, 20)
      .fill('#1a237e');

    // Texto de cabecera
    columns.forEach((col, i) => {
      doc
        .fillColor('#ffffff')
        .text(col, xPositions[i], tableTop + 5, { width: widths[i] });
    });

    // Filas
    let rowY = tableTop + 25;
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#333333');

    asistencias.forEach((asis, index) => {
      // Alternar colores de fila
      if (index % 2 === 0) {
        doc
          .rect(50, rowY - 2, 495, 20)
          .fill('#f5f5f5');
      }

      // Color según estado
      let colorEstado = '#333333';
      switch (asis.estado) {
        case 'presente': colorEstado = '#2e7d32'; break;
        case 'ausente': colorEstado = '#c62828'; break;
        case 'justificado': colorEstado = '#f57f17'; break;
        case 'tarde': colorEstado = '#ef6c00'; break;
        case 'retiro': colorEstado = '#6a1b9a'; break;
        case 'huelga': colorEstado = '#d50000'; break;
        default: colorEstado = '#333333';
      }

      const estudiante = asis.estudiante || {};
      const nombreCompleto = `${estudiante.apellidos || ''} ${estudiante.nombres || ''}`.trim();

      doc
        .fillColor('#333333')
        .text(index + 1, xPositions[0], rowY, { width: widths[0] })
        .text(nombreCompleto || 'N/A', xPositions[1], rowY, { width: widths[1] })
        .text(asis.fecha || 'N/A', xPositions[2], rowY, { width: widths[2] })
        .fillColor(colorEstado)
        .text(asis.estado || 'N/A', xPositions[3], rowY, { width: widths[3] })
        .fillColor('#333333')
        .text(asis.observaciones || '', xPositions[4], rowY, { width: widths[4] });

      rowY += 20;

      // Nueva página si es necesario
      if (rowY > 750) {
        doc.addPage();
        rowY = 50;
        // Reimprimir cabecera
        this._agregarCabeceraTabla(doc);
      }
    });
  }

  /**
   * Agrega tabla de notas
   */
  _agregarTablaNotas(doc, notas) {
    if (!notas || notas.length === 0) {
      doc.text('No hay datos de notas disponibles', { align: 'center' });
      return;
    }

    const tableTop = doc.y;
    const columns = ['#', 'Estudiante', 'Actividad', 'Tipo', 'Fecha', 'Calif.'];
    const widths = [25, 120, 100, 70, 80, 50];
    const xPositions = [50, 75, 195, 295, 365, 445];

    // Cabecera
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff');

    doc
      .rect(50, tableTop, 495, 20)
      .fill('#1a237e');

    columns.forEach((col, i) => {
      doc
        .fillColor('#ffffff')
        .text(col, xPositions[i], tableTop + 5, { width: widths[i] });
    });

    let rowY = tableTop + 25;
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#333333');

    notas.forEach((nota, index) => {
      if (index % 2 === 0) {
        doc
          .rect(50, rowY - 2, 495, 20)
          .fill('#f5f5f5');
      }

      const estudiante = nota.estudiante || {};
      const nombreCompleto = `${estudiante.apellidos || ''} ${estudiante.nombres || ''}`.trim();
      const calificacion = nota.calificacion || 0;

      // Color según calificación
      let colorCalif = '#333333';
      if (calificacion >= 8) colorCalif = '#2e7d32';
      else if (calificacion >= 6) colorCalif = '#f57f17';
      else colorCalif = '#c62828';

      doc
        .fillColor('#333333')
        .text(index + 1, xPositions[0], rowY, { width: widths[0] })
        .text(nombreCompleto || 'N/A', xPositions[1], rowY, { width: widths[1] })
        .text(nota.nombre_actividad || 'N/A', xPositions[2], rowY, { width: widths[2] })
        .text(nota.tipo || 'N/A', xPositions[3], rowY, { width: widths[3] })
        .text(nota.fecha_entrega || 'N/A', xPositions[4], rowY, { width: widths[4] })
        .fillColor(colorCalif)
        .text(calificacion.toFixed(1), xPositions[5], rowY, { width: widths[5] });

      rowY += 20;
    });
  }

  /**
   * Agrega resumen estadístico
   */
  _agregarResumen(doc, resumen) {
    if (!resumen) return;

    doc
      .moveDown(1)
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1a237e')
      .text('Resumen Estadístico')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#333333');

    const yStart = doc.y;
    const col1 = 50;
    const col2 = 300;

    Object.entries(resumen).forEach(([key, value], index) => {
      const y = yStart + index * 18;
      doc
        .text(key, col1, y, { width: 230 })
        .text(value.toString(), col2, y, { width: 230 });
    });

    doc.moveDown(2);
  }

  /**
   * Agrega gráfico de rendimiento (barras simples)
   */
  _agregarGraficoRendimiento(doc, data) {
    if (!data || !data.etiquetas || data.etiquetas.length === 0) return;

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1a237e')
      .text('Gráfico de Rendimiento')
      .moveDown(0.5);

    const graphWidth = 400;
    const graphHeight = 150;
    const startX = (doc.page.width - graphWidth) / 2;
    const startY = doc.y + 10;
    const barWidth = graphWidth / data.etiquetas.length * 0.6;
    const maxValue = Math.max(...data.valores) * 1.2;

    // Dibujar barras
    data.etiquetas.forEach((label, i) => {
      const x = startX + (graphWidth / data.etiquetas.length) * i + (graphWidth / data.etiquetas.length - barWidth) / 2;
      const barHeight = (data.valores[i] / maxValue) * graphHeight;
      const y = startY + graphHeight - barHeight;

      // Color según valor
      let color = '#2196f3';
      const value = data.valores[i];
      if (value >= 8) color = '#2e7d32';
      else if (value >= 6) color = '#f57f17';
      else color = '#c62828';

      doc
        .fillColor(color)
        .rect(x, y, barWidth, barHeight)
        .fill();

      // Etiqueta
      doc
        .fontSize(8)
        .fillColor('#333333')
        .text(label, x + barWidth / 2 - 10, startY + graphHeight + 5);
    });

    doc.moveDown(4);
  }

  /**
   * Agrega cabecera de tabla en nueva página
   */
  _agregarCabeceraTabla(doc) {
    // Similar al método _agregarTablaAsistencias pero solo la cabecera
    const columns = ['#', 'Estudiante', 'Fecha', 'Estado', 'Observaciones'];
    const widths = [30, 150, 100, 100, 150];
    const xPositions = [50, 80, 230, 330, 430];

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .rect(50, doc.y, 495, 20)
      .fill('#1a237e');

    columns.forEach((col, i) => {
      doc
        .fillColor('#ffffff')
        .text(col, xPositions[i], doc.y + 5, { width: widths[i] });
    });

    doc.moveDown(1);
  }

  /**
   * Agrega pie de página
   */
  _agregarPiePagina(doc) {
    const pageCount = doc.bufferedPageRange().count;
    const page = doc.page;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `Página ${i + 1} de ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }
  }
}

module.exports = new PDFService();
