// Feriados de Argentina
const FERIADOS = [
    // 2026
    '2026-01-01', // Año Nuevo
    '2026-02-16', // Carnaval
    '2026-02-17', // Carnaval
    '2026-03-24', // Día de la Memoria
    '2026-04-02', // Día del Veterano
    '2026-04-03', // Viernes Santo
    '2026-05-01', // Día del Trabajador
    '2026-05-25', // Revolución de Mayo
    '2026-06-15', // Paso a la Inmortalidad de Güemes
    '2026-06-20', // Día de la Bandera
    '2026-07-09', // Día de la Independencia
    '2026-08-17', // Paso a la Inmortalidad de San Martín
    '2026-10-12', // Día del Respeto a la Diversidad Cultural
    '2026-11-23', // Día de la Soberanía Nacional
    '2026-12-08', // Inmaculada Concepción
    '2026-12-25', // Navidad
    // 2025
    '2025-01-01', '2025-03-03', '2025-03-04', '2025-03-24', '2025-04-02', '2025-04-18',
    '2025-05-01', '2025-05-25', '2025-06-16', '2025-06-20', '2025-07-09', '2025-08-18',
    '2025-10-13', '2025-11-24', '2025-12-08', '2025-12-25'
];

/**
 * Verifica si una fecha es fin de semana
 */
const esFinDeSemana = (fecha) => {
    const d = new Date(fecha + 'T12:00:00');
    const dia = d.getDay();
    return dia === 0 || dia === 6;
};

/**
 * Verifica si una fecha es feriado
 */
const esFeriado = (fecha) => {
    return FERIADOS.includes(fecha);
};

/**
 * Verifica si una fecha es válida para clases
 */
const esDiaDeClase = (fecha) => {
    return !esFinDeSemana(fecha) && !esFeriado(fecha);
};

/**
 * Obtiene el motivo por el cual no es día de clase
 */
const motivoNoClase = (fecha) => {
    if (esFinDeSemana(fecha)) return 'fin de semana';
    if (esFeriado(fecha)) return 'feriado';
    return null;
};

module.exports = {
    FERIADOS,
    esFinDeSemana,
    esFeriado,
    esDiaDeClase,
    motivoNoClase
};