const { EventoEspecial } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los eventos
exports.obtenerEventos = async (req, res) => {
  try {
    const eventos = await EventoEspecial.findAll({
      order: [['fecha', 'DESC']]
    });
    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

// Verificar si una fecha es evento especial
exports.verificarFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    const evento = await EventoEspecial.findOne({ where: { fecha } });
    res.json({
      fecha,
      esEvento: !!evento,
      evento: evento || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar fecha' });
  }
};

// Crear evento
exports.crearEvento = async (req, res) => {
  try {
    const { fecha, tipo, descripcion, afecta_asistencia } = req.body;
    
    if (!fecha || !tipo) {
      return res.status(400).json({ error: 'Fecha y tipo son obligatorios' });
    }

    const existente = await EventoEspecial.findOne({ where: { fecha } });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un evento para esa fecha' });
    }

    const evento = await EventoEspecial.create({
      fecha,
      tipo,
      descripcion,
      afecta_asistencia: afecta_asistencia !== false
    });

    res.status(201).json(evento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

// Actualizar evento
exports.actualizarEvento = async (req, res) => {
  try {
    const evento = await EventoEspecial.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await evento.update(req.body);
    res.json(evento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

// Eliminar evento
exports.eliminarEvento = async (req, res) => {
  try {
    const evento = await EventoEspecial.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    await evento.destroy();
    res.json({ mensaje: 'Evento eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};

// Obtener eventos en un rango de fechas
exports.obtenerEventosPorRango = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const where = {};
    if (fecha_inicio && fecha_fin) {
      where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    } else if (fecha_inicio) {
      where.fecha = { [Op.gte]: fecha_inicio };
    } else if (fecha_fin) {
      where.fecha = { [Op.lte]: fecha_fin };
    }

    const eventos = await EventoEspecial.findAll({
      where,
      order: [['fecha', 'ASC']]
    });

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};