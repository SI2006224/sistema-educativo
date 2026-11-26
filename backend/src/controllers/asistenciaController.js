const { Asistencia, Estudiante, Curso, EventoEspecial } = require('../models');
const { Op } = require('sequelize');
const { esDiaDeClase, motivoNoClase } = require('../utils/feriados');

// Obtener asistencias con filtros
exports.obtenerAsistencias = async (req, res) => {
  try {
    const { estudiante_id, fecha, trimestre, curso_id } = req.query;
    const where = {};
    
    if (estudiante_id) where.estudiante_id = estudiante_id;
    if (fecha) where.fecha = fecha;
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
    
    const asistencias = await Asistencia.findAll({
      where,
      include,
      order: [['fecha', 'DESC']]
    });
    
    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

// Registrar asistencia masiva
exports.registrarAsistenciaMasiva = async (req, res) => {
  try {
    const { asistencias } = req.body;
    
    if (!asistencias || !Array.isArray(asistencias) || asistencias.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de asistencias' });
    }

    // Validar fecha de la primera asistencia (fin de semana / feriado fijo)
    const fecha = asistencias[0].fecha;
    if (fecha && !esDiaDeClase(fecha)) {
      const motivo = motivoNoClase(fecha);
      return res.status(400).json({ 
        error: `No se puede registrar asistencia el ${fecha}: es ${motivo}`,
        fecha,
        motivo
      });
    }

    // ✅ NUEVO: Verificar si la fecha es un evento especial (paro, feriado, institucional)
    if (fecha) {
      const evento = await EventoEspecial.findOne({ where: { fecha } });
      if (evento && evento.afecta_asistencia) {
        return res.status(400).json({
          error: `No se puede registrar asistencia el ${fecha}: ${evento.tipo} - ${evento.descripcion || 'sin descripción'}`,
          evento,
          fecha
        });
      }
    }
    
    const resultados = [];
    const errores = [];
    
    for (const item of asistencias) {
      try {
        const { estudiante_id, estado, fecha: fechaItem, trimestre, observaciones } = item;
        
        // Verificar si existe asistencia para ese día
        const existente = await Asistencia.findOne({
          where: {
            estudiante_id,
            fecha: fechaItem || new Date().toISOString().split('T')[0]
          }
        });
        
        let asistencia;
        
        if (existente) {
          const datosAnteriores = existente.toJSON();
          await existente.update({ estado, trimestre, observaciones });
          await existente.reload();
          asistencia = existente;
          
          req.auditoriaData = {
            tabla: 'asistencias',
            registro_id: asistencia.id,
            accion: 'editar',
            datos_anteriores: datosAnteriores,
            datos_nuevos: asistencia.toJSON()
          };
        } else {
          asistencia = await Asistencia.create({
            estudiante_id,
            estado,
            fecha: fechaItem || new Date().toISOString().split('T')[0],
            trimestre,
            observaciones
          });
          
          req.auditoriaData = {
            tabla: 'asistencias',
            registro_id: asistencia.id,
            accion: 'crear',
            datos_nuevos: asistencia.toJSON()
          };
        }
        
        resultados.push(asistencia);
      } catch (error) {
        errores.push({ item, error: error.message });
      }
    }
    
    res.json({
      mensaje: `Procesadas ${resultados.length} asistencias`,
      resultados,
      errores: errores.length > 0 ? errores : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar asistencias' });
  }
};

// Obtener resumen de asistencias por curso y trimestre
exports.resumenAsistencias = async (req, res) => {
  try {
    const { curso_id, trimestre } = req.query;
    
    if (!curso_id || !trimestre) {
      return res.status(400).json({ error: 'Se requiere curso_id y trimestre' });
    }
    
    const estudiantes = await Estudiante.findAll({
      where: { curso_id, activo: true }
    });
    
    const estudianteIds = estudiantes.map(e => e.id);
    
    const asistencias = await Asistencia.findAll({
      where: {
        estudiante_id: { [Op.in]: estudianteIds },
        trimestre
      }
    });
    
    const resumen = {
      total_estudiantes: estudiantes.length,
      total_asistencias: asistencias.length,
      por_estado: {},
      por_estudiante: []
    };
    
    asistencias.forEach(a => {
      resumen.por_estado[a.estado] = (resumen.por_estado[a.estado] || 0) + 1;
    });
    
    estudiantes.forEach(est => {
      const asistenciasEst = asistencias.filter(a => a.estudiante_id === est.id);
      const estados = {};
      asistenciasEst.forEach(a => {
        estados[a.estado] = (estados[a.estado] || 0) + 1;
      });
      
      resumen.por_estudiante.push({
        estudiante: `${est.apellidos} ${est.nombres}`,
        total: asistenciasEst.length,
        estados
      });
    });
    
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen de asistencias' });
  }
};

// Calcular asistencias por rango de fechas
exports.calcularAsistencias = async (req, res) => {
  try {
    const { curso_id, fecha_inicio, fecha_fin, trimestre } = req.query;

    if (!curso_id) {
      return res.status(400).json({ error: 'Se requiere curso_id' });
    }

    // Obtener estudiantes del curso
    const estudiantes = await Estudiante.findAll({
      where: { curso_id, activo: true },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });

    const estudianteIds = estudiantes.map(e => e.id);

    // Construir filtro de fechas para asistencias
    const where = {
      estudiante_id: { [Op.in]: estudianteIds }
    };

    if (fecha_inicio && fecha_fin) {
      where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    } else if (fecha_inicio) {
      where.fecha = { [Op.gte]: fecha_inicio };
    } else if (fecha_fin) {
      where.fecha = { [Op.lte]: fecha_fin };
    }

    if (trimestre) where.trimestre = trimestre;

    const asistencias = await Asistencia.findAll({ where });

    // ✅ NUEVO: Obtener eventos especiales en el rango
    const whereEventos = {};
    if (fecha_inicio && fecha_fin) {
      whereEventos.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    } else if (fecha_inicio) {
      whereEventos.fecha = { [Op.gte]: fecha_inicio };
    } else if (fecha_fin) {
      whereEventos.fecha = { [Op.lte]: fecha_fin };
    }

    const eventos = await EventoEspecial.findAll({
      where: whereEventos,
      order: [['fecha', 'ASC']]
    });

    // Días con evento que afecta asistencia (no cuentan como ausencia)
    const diasConEvento = eventos
      .filter(e => e.afecta_asistencia)
      .map(e => e.fecha);

    // Días computables = días únicos con asistencia - días con evento
    const diasUnicos = [...new Set(asistencias.map(a => a.fecha))];
    const diasComputables = diasUnicos.filter(f => !diasConEvento.includes(f));

    // Calcular resumen por estudiante
    const resumen = estudiantes.map(est => {
      const asisEst = asistencias.filter(a => a.estudiante_id === est.id);
      
      // Filtrar solo asistencias en días computables
      const asisComputables = asisEst.filter(a => diasComputables.includes(a.fecha));
      
      const total = asisComputables.length;
      const presentes = asisComputables.filter(a => a.estado === 'presente').length;
      const ausentes = asisComputables.filter(a => a.estado === 'ausente').length;
      const justificados = asisComputables.filter(a => a.estado === 'justificado').length;
      const tardes = asisComputables.filter(a => a.estado === 'tarde').length;
      const retiros = asisComputables.filter(a => a.estado === 'retiro').length;
      const huelgas = asisComputables.filter(a => a.estado === 'huelga').length;
      const institucionales = asisComputables.filter(a => a.estado === 'institucional').length;
      
      const porcentaje = total > 0 
        ? ((presentes + tardes) / total * 100).toFixed(1) 
        : '0.0';

      return {
        estudiante: `${est.apellidos} ${est.nombres}`,
        dni: est.dni,
        total,
        presentes,
        ausentes,
        justificados,
        tardes,
        retiros,
        huelgas,
        institucionales,
        porcentaje: parseFloat(porcentaje)
      };
    });

    res.json({
      curso_id,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      trimestre: trimestre || null,
      total_estudiantes: estudiantes.length,
      total_asistencias: asistencias.length,
      dias_computables: diasComputables.length,
      eventos: eventos.map(e => ({
        fecha: e.fecha,
        tipo: e.tipo,
        descripcion: e.descripcion,
        afecta_asistencia: e.afecta_asistencia
      })),
      resumen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular asistencias' });
  }
};
