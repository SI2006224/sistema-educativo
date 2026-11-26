// Cliente API
const API = {
    baseURL: '/api',

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                if (window.location.pathname !== '/') {
                    window.location.reload();
                }
                throw new Error('Sesión expirada');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error en la petición');
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Métodos HTTP básicos
    get: (endpoint) => API.request(endpoint),
    post: (endpoint, data) => API.request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => API.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => API.request(endpoint, { method: 'DELETE' }),

    // ========== AUTENTICACIÓN ==========
    login: (nombre_usuario, password) => API.post('/usuarios/login', { nombre_usuario, password }),
    perfil: () => API.get('/usuarios/perfil'),

    // ========== CURSOS ==========
    obtenerCursos: () => API.get('/cursos'),
    obtenerCurso: (id) => API.get(`/cursos/${id}`),
    crearCurso: (data) => API.post('/cursos', data),
    actualizarCurso: (id, data) => API.put(`/cursos/${id}`, data),
    eliminarCurso: (id) => API.delete(`/cursos/${id}`),

    // ========== ESTUDIANTES ==========
    obtenerEstudiantes: (params = '') => API.get(`/estudiantes${params}`),
    obtenerEstudiante: (id) => API.get(`/estudiantes/${id}`),
    crearEstudiante: (data) => API.post('/estudiantes', data),
    actualizarEstudiante: (id, data) => API.put(`/estudiantes/${id}`, data),
    eliminarEstudiante: (id) => API.delete(`/estudiantes/${id}`),

    // ========== ASISTENCIAS ==========
    obtenerAsistencias: (params = '') => API.get(`/asistencias${params}`),
    registrarAsistencias: (asistencias) => API.post('/asistencias/masiva', { asistencias }),
    resumenAsistencias: (curso_id, trimestre) => API.get(`/asistencias/resumen?curso_id=${curso_id}&trimestre=${trimestre}`),
    calcularAsistencias: (curso_id, fecha_inicio, fecha_fin, trimestre) => {
    const params = new URLSearchParams();
    if (curso_id) params.append('curso_id', curso_id);
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
    if (fecha_fin) params.append('fecha_fin', fecha_fin);
    if (trimestre) params.append('trimestre', trimestre);
    return API.get(`/asistencias/calcular?${params.toString()}`);
},

    // ========== NOTAS ==========
    obtenerNotas: (params = '') => API.get(`/notas${params}`),
    obtenerNota: (id) => API.get(`/notas/${id}`),
    obtenerNotasPorEstudiante: (estudianteId) => API.get(`/notas/estudiante/${estudianteId}`),
    crearNota: (data) => API.post('/notas', data),
    registrarNotasMasivas: (notas) => API.post('/notas/masiva', { notas }),
    actualizarNota: (id, data) => API.put(`/notas/${id}`, data),
    eliminarNota: (id) => API.delete(`/notas/${id}`),
    resumenNotas: (curso_id, trimestre) => API.get(`/notas/resumen/trimestre?curso_id=${curso_id}&trimestre=${trimestre}`),

    // ========== MATERIAS ==========
    obtenerMaterias: () => API.get('/materias'),
    crearMateria: (data) => API.post('/materias', data),
    actualizarMateria: (id, data) => API.put(`/materias/${id}`, data),

    // ========== REPORTES ==========
    reporteAsistencias: (curso_id, trimestre) => API.get(`/reportes/asistencias?curso_id=${curso_id}&trimestre=${trimestre}`),
    reporteNotas: (curso_id, trimestre) => API.get(`/reportes/notas?curso_id=${curso_id}&trimestre=${trimestre}`),
    reporteConsolidado: (curso_id, trimestre) => API.get(`/reportes/consolidado?curso_id=${curso_id}&trimestre=${trimestre}`),

    // ========== USUARIOS ==========
    obtenerUsuarios: () => API.get('/usuarios'),
    crearUsuario: (data) => API.post('/usuarios', data),
    actualizarUsuario: (id, data) => API.put(`/usuarios/${id}`, data),
    eliminarUsuario: (id) => API.delete(`/usuarios/${id}`),
    cambiarPassword: (password_actual, password_nuevo) => API.put('/usuarios/perfil/password', { password_actual, password_nuevo }),

    // ========== EVENTOS ==========
    obtenerEventos: () => API.get('/eventos'),
    obtenerEventosPorRango: (fecha_inicio, fecha_fin) => API.get(`/eventos/rango?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`),
    verificarEvento: (fecha) => API.get(`/eventos/verificar/${fecha}`),
    crearEvento: (data) => API.post('/eventos', data),
    actualizarEvento: (id, data) => API.put(`/eventos/${id}`, data),
    eliminarEvento: (id) => API.delete(`/eventos/${id}`),
};

window.API = API;
