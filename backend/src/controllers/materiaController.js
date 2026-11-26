const { Materia } = require('../models');

exports.obtenerMaterias = async (req, res) => {
  try {
    const materias = await Materia.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });
    res.json(materias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

exports.crearMateria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Se requiere nombre' });
    
    const existente = await Materia.findOne({ where: { nombre } });
    if (existente) return res.status(400).json({ error: 'La materia ya existe' });
    
    const materia = await Materia.create({ nombre });
    res.status(201).json(materia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear materia' });
  }
};

exports.actualizarMateria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const materia = await Materia.findByPk(req.params.id);
    if (!materia || !materia.activo) return res.status(404).json({ error: 'Materia no encontrada' });
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'Se requiere nombre' });
    const normalizado = nombre.trim();
    const existente = await Materia.findOne({ where: { nombre: normalizado } });
    if (existente && existente.id !== materia.id) return res.status(400).json({ error: 'La materia ya existe' });
    await materia.update({ nombre: normalizado });
    res.json(materia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar materia' });
  }
};
