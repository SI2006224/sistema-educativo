const { Nota, Estudiante, Curso } = require('../models');
const { Op } = require('sequelize');

// Obtener notas con filtros
exports.obtenerNotas = async (req, res) => {
  try {
    const { estudiante_id, trimestre, curso_id } = req.query;
    const where = {};
    
    if (estudiante_id) where.estudiante_id = estudiante_id;
    if (trimestre) where.trimestre = trimestre;
    
    const include = [{
      model: Estudiante,
      as: 'estudiante',
      where: { activo: true },
      include: [{ model: Curso, as: 'curso' }]
    }];
    
    if (curso_id) {
      include[0].where.curso_id = curso_id;
    }
    
    const notas = await Nota.findAll({
      where,
      include,
      order: [['fecha_entrega', 'DESC']]
    });
    
    res.json(notas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notas' });
  }
};

// Obtener nota por ID
exports.obtenerNota = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id, {
      include: [{
        model: Estudiante,
        as: 'estudiante',
        include: [{ model: Curso, as: 'curso' }]
      }]
    });
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    
    res.json(nota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la nota' });
  }
};

// Obtener notas por estudiante
exports.obtenerNotasPorEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { trimestre } = req.query;
    
    const where = { estudiante_id: estudianteId };
    if (trimestre) where.trimestre = trimestre;
    
    const notas = await Nota.findAll({
      where,
      include: [{
        model: Estudiante,
        as: 'estudiante',
        include: [{ model: Curso, as: 'curso' }]
      }],
      order: [['trimestre', 'ASC'], ['fecha_entrega', 'ASC']]
    });
    
    res.json(notas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notas del estudiante' });
  }
};

// Crear nota
exports.crearNota = async (req, res) => {
  try {
    const { estudiante_id, nombre_actividad, tipo, fecha_entrega, calificacion, trimestre } = req.body;
    
    // Verificar que el estudiante existe
    const estudiante = await Estudiante.findByPk(estudiante_id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    const nota = await Nota.create({
      estudiante_id,
      nombre_actividad,
      tipo,
      fecha_entrega,
      calificacion,
      trimestre
    });
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'notas',
      registro_id: nota.id,
      accion: 'crear',
      datos_nuevos: nota.toJSON()
    };
    
    const notaConEstudiante = await Nota.findByPk(nota.id, {
      include: [{
        model: Estudiante,
        as: 'estudiante',
        include: [{ model: Curso, as: 'curso' }]
      }]
    });
    
    res.status(201).json(notaConEstudiante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la nota' });
  }
};

// Registrar notas masivas
exports.registrarNotasMasivas = async (req, res) => {
  try {
    const { notas } = req.body;
    
    if (!notas || !Array.isArray(notas) || notas.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de notas' });
    }
    
    const resultados = [];
    const errores = [];
    
    for (const item of notas) {
      try {
        const { estudiante_id, nombre_actividad, tipo, fecha_entrega, calificacion, trimestre } = item;
        
        const nota = await Nota.create({
          estudiante_id,
          nombre_actividad,
          tipo,
          fecha_entrega,
          calificacion,
          trimestre
        });
        
        resultados.push(nota);
      } catch (error) {
        errores.push({
          item,
          error: error.message
        });
      }
    }
    
    res.json({
      mensaje: `Procesadas ${resultados.length} notas`,
      resultados,
      errores: errores.length > 0 ? errores : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar notas masivas' });
  }
};

// Actualizar nota
exports.actualizarNota = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id);
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    
    const datosAnteriores = nota.toJSON();
    await nota.update(req.body);
    await nota.reload();
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'notas',
      registro_id: nota.id,
      accion: 'editar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: nota.toJSON()
    };
    
    const notaConEstudiante = await Nota.findByPk(nota.id, {
      include: [{
        model: Estudiante,
        as: 'estudiante',
        include: [{ model: Curso, as: 'curso' }]
      }]
    });
    
    res.json(notaConEstudiante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la nota' });
  }
};

// Eliminar nota
exports.eliminarNota = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id);
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    
    const datosAnteriores = nota.toJSON();
    await nota.destroy();
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'notas',
      registro_id: req.params.id,
      accion: 'eliminar',
      datos_anteriores: datosAnteriores
    };
    
    res.json({ mensaje: 'Nota eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la nota' });
  }
};

// Resumen de notas por trimestre
exports.resumenNotasPorTrimestre = async (req, res) => {
  try {
    const { curso_id, trimestre } = req.query;
    
    if (!curso_id || !trimestre) {
      return res.status(400).json({ error: 'Se requiere curso_id y trimestre' });
    }
    
    // Obtener estudiantes del curso
    const estudiantes = await Estudiante.findAll({
      where: { curso_id, activo: true }
    });
    
    const estudianteIds = estudiantes.map(e => e.id);
    
    // Obtener notas del trimestre
    const notas = await Nota.findAll({
      where: {
        estudiante_id: { [Op.in]: estudianteIds },
        trimestre
      }
    });
    
    // Resumen
    const resumen = {
      total_estudiantes: estudiantes.length,
      total_notas: notas.length,
      promedio_general: 0,
      por_estudiante: []
    };
    
    // Calcular promedio por estudiante
    const promedios = {};
    notas.forEach(n => {
      if (!promedios[n.estudiante_id]) {
        promedios[n.estudiante_id] = { total: 0, count: 0 };
      }
      promedios[n.estudiante_id].total += n.calificacion;
      promedios[n.estudiante_id].count++;
    });
    
    estudiantes.forEach(est => {
      const p = promedios[est.id] || { total: 0, count: 0 };
      const promedio = p.count > 0 ? parseFloat((p.total / p.count).toFixed(1)) : 0;
      
      resumen.por_estudiante.push({
        estudiante: `${est.apellidos} ${est.nombres}`,
        total_actividades: p.count,
        promedio
      });
    });
    
    // Calcular promedio general
    const totalPromedios = resumen.por_estudiante.reduce((sum, e) => sum + e.promedio, 0);
    resumen.promedio_general = parseFloat((totalPromedios / resumen.por_estudiante.length).toFixed(1));
    
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen de notas' });
  }
};