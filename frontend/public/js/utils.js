// Utilidades generales
const Utils = {
    // ========== TOAST ==========
    toast: (mensaje, tipo = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = mensaje;
        if (tipo === 'error') toast.style.background = '#c62828';
        if (tipo === 'success') toast.style.background = '#2e7d32';
        if (tipo === 'warning') toast.style.background = '#f57f17';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // ========== FECHAS ==========
    formatearFecha: (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-AR');
    },

    formatearFechaHora: (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-AR');
    },

    // Formatear fecha a DD/MM/YYYY
    formatearFechaArg: (fecha) => {
        if (!fecha) return 'N/A';
        const d = new Date(fecha + 'T12:00:00');
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}/${mes}/${anio}`;
    },

    // Convertir DD/MM/YYYY a YYYY-MM-DD
    fechaArgAISO: (fechaArg) => {
        if (!fechaArg) return '';
        const partes = fechaArg.trim().split('/');
        if (partes.length !== 3 || !/^\d{2}$/.test(partes[0]) || !/^\d{2}$/.test(partes[1]) || !/^\d{4}$/.test(partes[2])) return '';
        const dia = Number(partes[0]), mes = Number(partes[1]), anio = Number(partes[2]);
        const fecha = new Date(anio, mes - 1, dia);
        if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return '';
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    },

    // Convertir YYYY-MM-DD a DD/MM/YYYY
    fechaISOaArg: (fechaISO) => {
        if (!fechaISO) return '';
        const partes = fechaISO.split('-');
        if (partes.length !== 3) return '';
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    },

    // ========== TOKEN ==========
    guardarToken: (token) => {
        localStorage.setItem('token', token);
    },

    obtenerToken: () => {
        return localStorage.getItem('token');
    },

    eliminarToken: () => {
        localStorage.removeItem('token');
    },

    // ========== USUARIO ==========
    guardarUsuario: (usuario) => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    },

    obtenerUsuario: () => {
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u) : null;
    },

    eliminarUsuario: () => {
        localStorage.removeItem('usuario');
    },

    // ========== AUTENTICACIÓN ==========
    estaAutenticado: () => {
        return !!localStorage.getItem('token');
    },

    cerrarSesion: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.reload();
    },

    // ========== VALIDACIONES ==========
    validarEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validarDNI: (dni) => {
        return /^\d{7,8}$/.test(dni);
    },

    // ========== FORMATEO ==========
    capitalizar: (texto) => {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    },

    // ========== ESTADOS ==========
    estadoAsistenciaTexto: (estado) => {
        const map = {
            'presente': 'Presente',
            'ausente': 'Ausente',
            'justificado': 'Justificado',
            'tarde': 'Tarde',
            'retiro': 'Retiro',
            'huelga': 'Huelga'
        };
        return map[estado] || estado;
    },

    tipoNotaTexto: (tipo) => {
        const map = {
            'examen': 'Examen',
            'tarea': 'Tarea',
            'proyecto': 'Proyecto',
            'participacion': 'Participación'
        };
        return map[tipo] || tipo;
    },

    // ========== UTILIDADES ==========
    confirmar: (mensaje) => {
        return window.confirm(mensaje);
    },

    // ========== EXPORTAR ==========
    exportarCSV: (datos, nombreArchivo) => {
        if (!datos || datos.length === 0) {
            Utils.toast('No hay datos para exportar', 'warning');
            return;
        }

        const headers = Object.keys(datos[0]);
        const csvContent = [
            headers.join(','),
            ...datos.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo || `exportacion-${Date.now()}.csv`;
        link.click();
    }
};

// Hacer disponible globalmente
window.Utils = Utils;
