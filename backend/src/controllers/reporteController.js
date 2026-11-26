const { Asistencia, Nota, Estudiante, Curso } = require('../models');
const { Op } = require('sequelize');
const pdfService = require('../services/pdfService');
const excelService = require('../services/excelService');
const path = require('path');
const fs = require('fs');

// Reporte de asistencias
exports.reporteAsistencias = async (req, res) => {
  try {
    const { curso_id, trimestre, estudiante_id } = req.query;
    
    if (!curso_id) {
      return res.status(400).json({ error: 'Se requiere curso_id' });
    }
    
    // Obtener estudiantes del curso
    const whereEstudiante = { curso_id, activo: true };
    if (estudiante_id) {
      whereEstudiante.id = estudiante_id;
    }
    
    const estudiantes = await Estudiante.findAll({
      where: whereEstudiante,
      include: [{ model: Curso, as: 'curso' }]
    });
    
    // Obtener asistencias
    const whereAsistencia = {};
    if (trimestre) whereAsistencia.trimestre = trimestre;
    if (estudiante_id) whereAsistencia.estudiante_id = estudiante_id;
    
    const asistencias = await Asistencia.findAll({
      where: whereAsistencia,
      include: [{
        model: Estudiante,
        as: 'estudiante',
        where: { curso_id, activo: true },
        include: [{ model: Curso, as: 'curso' }]
      }],
      order: [['estudiante_id', 'ASC'], ['fecha', 'ASC']]
    });
    
    // Calcular resumen
    const resumen = {
      'Total estudiantes': estudiantes.length,
      'Total asistencias': asistencias.length,
      'Presentes': asistencias.filter(a => a.estado === 'presente').length,
      'Ausentes': asistencias.filter(a => a.estado === 'ausente').length,
      'Justificados': asistencias.filter(a => a.estado === 'justificado').length,
      'Tardes': asistencias.filter(a => a.estado === 'tarde').length,
      'Retiros': asistencias.filter(a => a.estado === 'retiro').length,
      'Huelgas': asistencias.filter(a => a.estado === 'huelga').length
    };
    
    // Generar PDF
    const curso = await Curso.findByPk(curso_id);
    const pdfPath = path.join(__dirname, '../../../data/exports', `reporte-asistencias-${Date.now()}.pdf`);
    
    // Crear directorio si no existe
    const dir = path.dirname(pdfPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await pdfService.generarReporteAsistencias({
      asistencias,
      resumen,
      curso: curso ? curso.nombre_completo : 'N/A',
      trimestre: trimestre || 'Todos',
      año: curso?.año_lectivo || 'N/A'
    }, pdfPath);
    
    res.download(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de asistencias' });
  }
};

// Reporte de notas
exports.reporteNotas = async (req, res) => {
  try {
    const { curso_id, trimestre, estudiante_id, materia } = req.query;
    
    if (!curso_id) {
      return res.status(400).json({ error: 'Se requiere curso_id' });
    }
    
    // Obtener estudiantes del curso
    const whereEstudiante = { curso_id, activo: true };
    if (estudiante_id) {
      whereEstudiante.id = estudiante_id;
    }
    
    const estudiantes = await Estudiante.findAll({
      where: whereEstudiante,
      include: [{ model: Curso, as: 'curso' }]
    });
    
    // Obtener notas
    const whereNota = {};
    if (trimestre) whereNota.trimestre = trimestre;
    if (estudiante_id) whereNota.estudiante_id = estudiante_id;
    
    const notas = await Nota.findAll({
      where: whereNota,
      include: [{
        model: Estudiante,
        as: 'estudiante',
        where: { curso_id, activo: true },
        include: [{ model: Curso, as: 'curso' }]
      }],
      order: [['estudiante_id', 'ASC'], ['fecha_entrega', 'ASC']]
    });
    const notasFiltradas = materia
      ? notas.filter(n => n.nombre_actividad === materia || n.nombre_actividad.startsWith(`${materia} -`))
      : notas;
    
    // Calcular promedio por estudiante para gráfico
    const promedios = {};
    notasFiltradas.forEach(n => {
      const key = n.estudiante_id;
      if (!promedios[key]) {
        promedios[key] = { total: 0, count: 0, nombre: `${n.estudiante.apellidos} ${n.estudiante.nombres}` };
      }
      promedios[key].total += n.calificacion;
      promedios[key].count++;
    });
    
    const grafico = {
      etiquetas: [],
      valores: []
    };
    
    Object.values(promedios).forEach(p => {
      grafico.etiquetas.push(p.nombre);
      grafico.valores.push(parseFloat((p.total / p.count).toFixed(1)));
    });
    
    // Generar PDF
    const curso = await Curso.findByPk(curso_id);
    const pdfPath = path.join(__dirname, '../../../data/exports', `reporte-notas-${Date.now()}.pdf`);
    
    const dir = path.dirname(pdfPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await pdfService.generarReporteNotas({
      notas: notasFiltradas,
      grafico,
      curso: curso ? curso.nombre_completo : 'N/A',
      trimestre: trimestre || 'Todos',
      materia: materia || 'Todas las materias',
      año: curso?.año_lectivo || 'N/A'
    }, pdfPath);
    
    res.download(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de notas' });
  }
};

// Reporte consolidado
exports.reporteConsolidado = async (req, res) => {
  try {
    const { curso_id, trimestre } = req.query;
    
    if (!curso_id) {
      return res.status(400).json({ error: 'Se requiere curso_id' });
    }
    
    // Obtener estudiantes con sus asistencias y notas
    const estudiantes = await Estudiante.findAll({
      where: { curso_id, activo: true },
      include: [
        { model: Curso, as: 'curso' },
        {
          model: Asistencia,
          as: 'asistencias',
          where: trimestre ? { trimestre } : {},
          required: false
        },
        {
          model: Nota,
          as: 'notas',
          where: trimestre ? { trimestre } : {},
          required: false
        }
      ]
    });
    
    // Consolidar datos
    const consolidado = estudiantes.map(est => {
      const asistencias = est.asistencias || [];
      const notas = est.notas || [];
      const promedioNotas = notas.length > 0 
        ? notas.reduce((sum, n) => sum + n.calificacion, 0) / notas.length 
        : 0;
      
      return {
        estudiante: `${est.apellidos} ${est.nombres}`,
        dni: est.dni,
        asistencias: asistencias.length,
        presentes: asistencias.filter(a => a.estado === 'presente').length,
        ausentes: asistencias.filter(a => a.estado === 'ausente').length,
        justificados: asistencias.filter(a => a.estado === 'justificado').length,
        promedio_notas: parseFloat(promedioNotas.toFixed(1)),
        total_actividades: notas.length
      };
    });
    
    // Exportar a CSV
    const csvPath = path.join(__dirname, '../../../data/exports', `consolidado-${Date.now()}.csv`);
    await excelService.exportarCSV(consolidado, csvPath);
    
    res.download(csvPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte consolidado' });
  }
};

// Exportar CSV
exports.exportarCSV = async (req, res) => {
  try {
    const { tabla, curso_id, trimestre, estudiante_id } = req.query;
    
    let data = [];
    let filename = '';
    let headers = [];
    
    if (tabla === 'estudiantes' && curso_id) {
      const estudiantes = await Estudiante.findAll({
        where: { curso_id, activo: true, ...(estudiante_id ? { id: estudiante_id } : {}) },
        include: [{ model: Curso, as: 'curso' }]
      });
      
      // Aplanar datos
      data = estudiantes.map(e => ({
        id: e.id,
        dni: e.dni,
        apellidos: e.apellidos,
        nombres: e.nombres,
        email: e.email || '',
        telefono: e.telefono || '',
        curso: e.curso ? `${e.curso.codigo}-${e.curso.año_lectivo}-${e.curso.turno}` : '',
        activo: e.activo ? 'Sí' : 'No'
      }));
      filename = `estudiantes-${Date.now()}.csv`;
      
    } else if (tabla === 'asistencias' && curso_id) {
      const where = estudiante_id ? { estudiante_id } : {};
      if (trimestre) where.trimestre = trimestre;
      
      const asistencias = await Asistencia.findAll({
        where,
        include: [{
          model: Estudiante,
          as: 'estudiante',
          where: { curso_id, activo: true },
          include: [{ model: Curso, as: 'curso' }]
        }]
      });
      
      // Aplanar datos
      data = asistencias.map(a => ({
        id: a.id,
        estudiante: a.estudiante ? `${a.estudiante.apellidos} ${a.estudiante.nombres}` : '',
        dni: a.estudiante ? a.estudiante.dni : '',
        curso: a.estudiante && a.estudiante.curso ? `${a.estudiante.curso.codigo}-${a.estudiante.curso.año_lectivo}-${a.estudiante.curso.turno}` : '',
        fecha: a.fecha,
        estado: a.estado,
        trimestre: a.trimestre,
        observaciones: a.observaciones || ''
      }));
      filename = `asistencias-${Date.now()}.csv`;
      
    } else if (tabla === 'notas' && curso_id) {
      const where = estudiante_id ? { estudiante_id } : {};
      if (trimestre) where.trimestre = trimestre;
      
      const notas = await Nota.findAll({
        where,
        include: [{
          model: Estudiante,
          as: 'estudiante',
          where: { curso_id, activo: true },
          include: [{ model: Curso, as: 'curso' }]
        }]
      });
      
      // Aplanar datos
      data = notas.map(n => ({
        id: n.id,
        estudiante: n.estudiante ? `${n.estudiante.apellidos} ${n.estudiante.nombres}` : '',
        dni: n.estudiante ? n.estudiante.dni : '',
        curso: n.estudiante && n.estudiante.curso ? `${n.estudiante.curso.codigo}-${n.estudiante.curso.año_lectivo}-${n.estudiante.curso.turno}` : '',
        nombre_actividad: n.nombre_actividad,
        tipo: n.tipo,
        fecha_entrega: n.fecha_entrega,
        calificacion: n.calificacion,
        trimestre: n.trimestre
      }));
      filename = `notas-${Date.now()}.csv`;
      
    } else {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    
    // Si no hay datos, devolver mensaje claro
    if (data.length === 0) {
      return res.status(404).json({ 
        error: 'No hay datos para exportar',
        mensaje: `No se encontraron registros de ${tabla} para el curso seleccionado`
      });
    }
    
    // Crear directorio si no existe
    const exportDir = path.join(__dirname, '../../../data/exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const csvPath = path.join(exportDir, filename);
    await excelService.exportarCSV(data, csvPath);
    
    // Enviar archivo
    res.download(csvPath, filename, (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
      }
      // Eliminar archivo temporal después de enviarlo
      setTimeout(() => {
        if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
      }, 5000);
    });
    
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({ error: 'Error al exportar CSV', detalle: error.message });
  }

};
