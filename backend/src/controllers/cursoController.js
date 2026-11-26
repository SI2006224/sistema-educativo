const { Curso, Estudiante } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los cursos
exports.obtenerCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      where: { activo: true },
      order: [['año_lectivo', 'DESC'], ['codigo', 'ASC']]
    });
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

// Obtener curso por ID
exports.obtenerCurso = async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id, {
      include: [{
        model: Estudiante,
        as: 'estudiantes',
        where: { activo: true },
        required: false
      }]
    });
    
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    res.json(curso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el curso' });
  }
};

// Crear curso
exports.crearCurso = async (req, res) => {
  try {
    const { codigo, año_lectivo, turno, descripcion } = req.body;
    
    // Verificar duplicado
    const existente = await Curso.findOne({
      where: { codigo, año_lectivo, turno }
    });
    
    if (existente) {
      return res.status(400).json({ error: 'El curso ya existe' });
    }
    
    const curso = await Curso.create({
      codigo,
      año_lectivo,
      turno,
      descripcion
    });
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'cursos',
      registro_id: curso.id,
      accion: 'crear',
      datos_nuevos: curso.toJSON()
    };
    
    res.status(201).json(curso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el curso' });
  }
};

// Actualizar curso
exports.actualizarCurso = async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id);
    
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    const datosAnteriores = curso.toJSON();
    await curso.update(req.body);
    await curso.reload();
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'cursos',
      registro_id: curso.id,
      accion: 'editar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: curso.toJSON()
    };
    
    res.json(curso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

// Eliminar curso (soft delete)
exports.eliminarCurso = async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id);
    
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    const datosAnteriores = curso.toJSON();
    
    // Verificar si tiene estudiantes activos
    const estudiantes = await Estudiante.count({
      where: { curso_id: curso.id, activo: true }
    });
    
    if (estudiantes > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el curso porque tiene estudiantes activos' });
    }
    
    await curso.update({ activo: false });
    await curso.reload();
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'cursos',
      registro_id: curso.id,
      accion: 'eliminar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: curso.toJSON()
    };
    
    res.json({ mensaje: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el curso' });
  }
};

// Obtener cursos por año
exports.obtenerCursosPorAño = async (req, res) => {
  try {
    const { año } = req.params;
    const cursos = await Curso.findAll({
      where: { año_lectivo: año, activo: true },
      order: [['codigo', 'ASC']]
    });
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cursos por año' });
  }
};