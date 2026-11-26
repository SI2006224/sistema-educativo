const { Estudiante, Curso, Asistencia, Nota } = require('../models');
const { Op } = require('sequelize');

// Obtener estudiantes (con filtros)
exports.obtenerEstudiantes = async (req, res) => {
  try {
    const { curso_id, search } = req.query;
    const where = { activo: true };
    
    if (curso_id) {
      where.curso_id = curso_id;
    }
    
    if (search) {
      where[Op.or] = [
        { apellidos: { [Op.like]: `%${search}%` } },
        { nombres: { [Op.like]: `%${search}%` } },
        { dni: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const estudiantes = await Estudiante.findAll({
      where,
      include: [{
        model: Curso,
        as: 'curso',
        where: { activo: true },
        required: true
      }],
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
    
    res.json(estudiantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

// Obtener estudiante por ID
exports.obtenerEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id, {
      include: [{
        model: Curso,
        as: 'curso'
      }]
    });
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    res.json(estudiante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el estudiante' });
  }
};

/// Crear estudiante
exports.crearEstudiante = async (req, res) => {
  try {
    const { dni, apellidos, nombres, curso_id, email, telefono } = req.body;
    
    // Buscar si existe un estudiante con ese DNI en ese curso (activo o inactivo)
    const existente = await Estudiante.findOne({
      where: { dni, curso_id }
    });
    
    if (existente) {
      // Si existe pero está inactivo, reactivarlo y actualizar datos
      if (!existente.activo) {
        const datosAnteriores = existente.toJSON();
        await existente.update({
          apellidos,
          nombres,
          email,
          telefono,
          activo: true
        });
        await existente.reload();
        
        // Registrar auditoría
        req.auditoriaData = {
          tabla: 'estudiantes',
          registro_id: existente.id,
          accion: 'editar',
          datos_anteriores: datosAnteriores,
          datos_nuevos: existente.toJSON()
        };
        
        const estudianteConCurso = await Estudiante.findByPk(existente.id, {
          include: [{ model: Curso, as: 'curso' }]
        });
        
        return res.status(200).json(estudianteConCurso);
      }
      
      // Si existe y está activo, es un duplicado real
      return res.status(400).json({ error: 'El estudiante ya existe en este curso' });
    }
    
    // Crear nuevo estudiante
    const estudiante = await Estudiante.create({
      dni,
      apellidos,
      nombres,
      curso_id,
      email,
      telefono
    });
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'estudiantes',
      registro_id: estudiante.id,
      accion: 'crear',
      datos_nuevos: estudiante.toJSON()
    };
    
    const estudianteConCurso = await Estudiante.findByPk(estudiante.id, {
      include: [{ model: Curso, as: 'curso' }]
    });
    
    res.status(201).json(estudianteConCurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el estudiante' });
  }
};
// Actualizar estudiante
exports.actualizarEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    const datosAnteriores = estudiante.toJSON();
    const { apellidos, nombres, email, telefono, activo } = req.body;
    
    const datosActualizar = {};
    if (apellidos) datosActualizar.apellidos = apellidos;
    if (nombres) datosActualizar.nombres = nombres;
    if (email !== undefined) datosActualizar.email = email || null;
    if (telefono !== undefined) datosActualizar.telefono = telefono || null;
    if (activo !== undefined) datosActualizar.activo = activo;
    
    await estudiante.update(datosActualizar);
    await estudiante.reload();
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'estudiantes',
      registro_id: estudiante.id,
      accion: 'editar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: estudiante.toJSON()
    };
    
    const estudianteConCurso = await Estudiante.findByPk(estudiante.id, {
      include: [{ model: Curso, as: 'curso' }]
    });
    
    res.json(estudianteConCurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estudiante' });
  }
};

// Eliminar estudiante (soft delete)
exports.eliminarEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    const datosAnteriores = estudiante.toJSON();
    
    await estudiante.update({ activo: false });
    await estudiante.reload();
    
    // Registrar auditoría
    req.auditoriaData = {
      tabla: 'estudiantes',
      registro_id: estudiante.id,
      accion: 'eliminar',
      datos_anteriores: datosAnteriores,
      datos_nuevos: estudiante.toJSON()
    };
    
    res.json({ mensaje: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el estudiante' });
  }
};