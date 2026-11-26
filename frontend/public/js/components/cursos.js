// Componente de Cursos - Versión compacta con buscador, contador y porcentaje
const Cursos = {
    cursos: [],
    filtro: '',

    async render(container) {
        const usuario = Utils.obtenerUsuario();
        const esAdmin = usuario?.rol === 'administrador';

        container.innerHTML = `
            <div class="container">
                <div class="flex-between mb-8">
                    <h1 style="margin:0;font-size:1.2rem;">Cursos</h1>
                    ${esAdmin ? '<button class="btn btn-sm" onclick="Cursos.crear()">+ Nuevo</button>' : ''}
                </div>

                <div class="card" style="padding:8px;">
                    <input type="text" id="busqueda-curso" placeholder="🔍 Buscar curso..." 
                           oninput="Cursos.buscar(this.value)" 
                           style="margin:0;padding:6px;font-size:0.85rem;">
                </div>

                <div id="cursos-lista" class="card" style="padding:4px;">
                    <div class="loading"><div class="spinner"></div></div>
                </div>
            </div>
        `;

        await this.cargarLista();
    },

    async cargarLista() {
        const lista = document.getElementById('cursos-lista');
        try {
            this.cursos = await API.obtenerCursos();

            // Para cada curso, calcular cantidad de estudiantes y porcentaje de asistencia
            const cursosConDatos = await Promise.all(
                this.cursos.map(async (c) => {
                    try {
                        // Obtener estudiantes
                        const estudiantes = await API.obtenerEstudiantes(`?curso_id=${c.id}`);
                        const cantidad = estudiantes.length;

                        // Obtener asistencias del curso (sin rango de fechas = todas)
                        let porcentaje = 0;
                        if (cantidad > 0) {
                            try {
                                const resumen = await API.calcularAsistencias(c.id, null, null, null);
                                // Promedio de porcentajes de todos los estudiantes
                                if (resumen.resumen && resumen.resumen.length > 0) {
                                    const suma = resumen.resumen.reduce((s, r) => s + r.porcentaje, 0);
                                    porcentaje = (suma / resumen.resumen.length).toFixed(1);
                                }
                            } catch (e) {
                                porcentaje = 0;
                            }
                        }

                        return { 
                            ...c, 
                            cantidad_estudiantes: cantidad,
                            porcentaje_asistencia: porcentaje
                        };
                    } catch (error) {
                        return { 
                            ...c, 
                            cantidad_estudiantes: 0,
                            porcentaje_asistencia: 0
                        };
                    }
                })
            );

            this.cursos = cursosConDatos;
            this.renderLista();
        } catch (error) {
            lista.innerHTML = `<p class="error">${error.message}</p>`;
        }
    },

renderLista() {
    const lista = document.getElementById('cursos-lista');
    const usuario = Utils.obtenerUsuario();
    const esAdmin = usuario?.rol === 'administrador';

    const filtro = this.filtro.toLowerCase();
    const cursosFiltrados = this.cursos.filter(c => {
        const nombre = `${c.año_lectivo}-${c.codigo}-${c.turno}`.toLowerCase();
        return nombre.includes(filtro);
    });

    if (cursosFiltrados.length === 0) {
        lista.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📚</div>
                <p>${this.filtro ? 'No se encontraron cursos' : 'No hay cursos creados'}</p>
            </div>
        `;
        return;
    }

    let html = `
        <table style="width:100%;border-collapse:collapse;font-size:0.75rem;white-space:nowrap;">
            <thead>
                <tr style="background:#1a237e;color:white;">
                    <th style="padding:6px;text-align:left;">Curso</th>
                    <th style="padding:6px;text-align:center;">Alumnos</th>
                    <th style="padding:6px;text-align:center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    cursosFiltrados.forEach(c => {
        const nombre = `${c.año_lectivo}-${c.codigo}-${c.turno}`;
        const porcentaje = parseFloat(c.porcentaje_asistencia) || 0;
        let colorPorc = '#c62828';
        if (porcentaje >= 80) colorPorc = '#2e7d32';
        else if (porcentaje >= 60) colorPorc = '#f57f17';

        html += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:6px;">
                    <div style="font-weight:600;">${nombre}</div>
                    <div style="font-size:0.65rem;color:${colorPorc};font-weight:600;">
                        Asistencia: ${porcentaje}%
                    </div>
                </td>
                <td style="padding:6px;text-align:center;">
                    <span class="badge" style="background:#1a237e;color:white;">${c.cantidad_estudiantes || 0}</span>
                </td>
                <td style="padding:6px;text-align:center;">
                    <div class="flex gap-8" style="justify-content:center;">
                        ${esAdmin ? `
                            <button class="btn btn-sm btn-secondary" onclick="Cursos.editar(${c.id})" style="padding:2px 6px;font-size:0.7rem;">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="Cursos.eliminar(${c.id})" style="padding:2px 6px;font-size:0.7rem;">🗑️</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    lista.innerHTML = html;
},

    buscar(texto) {
        this.filtro = texto;
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => {
            this.renderLista();
        }, 200);
    },

    async crear() {
        const asignatura = prompt('Asignatura (ej. 71CO):');
        if (!asignatura) return;
        const año = prompt('Año lectivo (ej. 2026):');
        if (!año) return;
        const turno = prompt('Turno (M/T/N):');
        if (!turno) return;

        try {
            await API.crearCurso({
                codigo: asignatura.trim().toUpperCase(),
                año_lectivo: año.trim(),
                turno: turno.trim().toUpperCase(),
            });
            Utils.toast('Curso creado exitosamente', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async editar(id) {
        try {
            const curso = await API.obtenerCurso(id);
            
            const opcion = prompt(
                `¿Qué desea editar del curso ${curso.año_lectivo}-${curso.codigo}-${curso.turno}?\n\n` +
                `1. Asignatura (actual: ${curso.codigo})\n` +
                `2. Año lectivo (actual: ${curso.año_lectivo})\n` +
                `3. Turno (actual: ${curso.turno})\n` +
                `4. Editar todos los campos\n\n` +
                `Ingrese el número de opción (1-5):`
            );

            if (!opcion) return;

            const datos = {};

            if (opcion === '1') {
                const nuevo = prompt('Nueva asignatura:', curso.codigo);
                if (nuevo === null) return;
                datos.codigo = nuevo.trim().toUpperCase();
            } else if (opcion === '2') {
                const nuevo = prompt('Nuevo año lectivo:', curso.año_lectivo);
                if (nuevo === null) return;
                datos.año_lectivo = nuevo.trim();
            } else if (opcion === '3') {
                const nuevo = prompt('Nuevo turno (M/T/N):', curso.turno);
                if (nuevo === null) return;
                datos.turno = nuevo.trim().toUpperCase();
            } else if (opcion === '4') {
                const nuevaAsignatura = prompt('Asignatura:', curso.codigo);
                if (nuevaAsignatura === null) return;
                const nuevoAño = prompt('Año lectivo:', curso.año_lectivo);
                if (nuevoAño === null) return;
                const nuevoTurno = prompt('Turno (M/T/N):', curso.turno);
                if (nuevoTurno === null) return;
                const nuevaDesc = prompt('Descripción:', curso.descripcion || '');
                if (nuevaDesc === null) return;
                
                datos.codigo = nuevaAsignatura.trim().toUpperCase();
                datos.año_lectivo = nuevoAño.trim();
                datos.turno = nuevoTurno.trim().toUpperCase();
                datos.descripcion = nuevaDesc.trim();
            } else {
                Utils.toast('Opción inválida', 'error');
                return;
            }

            await API.actualizarCurso(id, datos);
            Utils.toast('Curso actualizado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async eliminar(id) {
        if (!confirm('¿Está seguro de eliminar este curso?')) return;
        try {
            await API.eliminarCurso(id);
            Utils.toast('Curso eliminado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async ver(id) {
        try {
            const curso = await API.obtenerCurso(id);
            const estudiantes = curso.estudiantes || [];
            const nombre = `${curso.año_lectivo}-${curso.codigo}-${curso.turno}`;
            
            alert(`Curso: ${nombre}\nAsignatura: ${curso.codigo}\nEstudiantes: ${estudiantes.length}`);
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    }
};

window.Cursos = Cursos;