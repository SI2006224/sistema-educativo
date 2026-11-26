// Componente de Estudiantes
const Estudiantes = {
    cursos: [],
    cursoSeleccionado: '',

    async render(container) {
        container.innerHTML = `
            <div class="container">
                <div class="flex-between mb-16">
                    <h1 style="margin:0;">Estudiantes</h1>
                    <button class="btn btn-sm" onclick="Estudiantes.crear()">+ Nuevo</button>
                </div>

                <div class="card">
                    <label>Filtrar por curso</label>
                    <select id="filtro-curso" onchange="Estudiantes.cambiarCurso(this.value)">
                        <option value="">Todos los cursos</option>
                    </select>

                    <label>Buscar</label>
                    <input type="text" id="busqueda" placeholder="Nombre, apellido o DNI" 
                           oninput="Estudiantes.buscar(this.value)">
                </div>

                <div id="estudiantes-lista" class="card">
                    <div class="loading"><div class="spinner"></div></div>
                </div>
            </div>
        `;

        try {
            this.cursos = await API.obtenerCursos();
            const select = document.getElementById('filtro-curso');
            this.cursos.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.año_lectivo}-${c.codigo}-${c.turno}`;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }

        await this.cargarLista();
    },

    async cargarLista(filtros = {}) {
        const lista = document.getElementById('estudiantes-lista');
        try {
            let params = '';
            if (filtros.curso_id) params += `?curso_id=${filtros.curso_id}`;
            if (filtros.search) params += (params ? '&' : '?') + `search=${encodeURIComponent(filtros.search)}`;

            const estudiantes = await API.obtenerEstudiantes(params);
            
            // Ordenar por apellido, nombre y DNI
            estudiantes.sort((a, b) => {
                const ap = a.apellidos || '';
                const bp = b.apellidos || '';
                if (ap !== bp) return ap.localeCompare(bp);
                const an = a.nombres || '';
                const bn = b.nombres || '';
                if (an !== bn) return an.localeCompare(bn);
                return (a.dni || '').localeCompare(b.dni || '');
            });

            if (estudiantes.length === 0) {
                lista.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">👥</div>
                        <p>No hay estudiantes registrados</p>
                    </div>
                `;
                return;
            }

            lista.innerHTML = estudiantes.map(e => `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${e.apellidos} ${e.nombres}</div>
                        <div class="list-item-subtitle">
                            DNI: ${e.dni} | Curso: ${e.curso ? `${e.curso.año_lectivo}-${e.curso.codigo}-${e.curso.turno}` : 'N/A'}
                        </div>
                    </div>
                    <div class="flex gap-8">
                        <button class="btn btn-sm btn-secondary" onclick="Estudiantes.editar(${e.id})">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="Estudiantes.eliminar(${e.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            lista.innerHTML = `<p class="error">${error.message}</p>`;
        }
    },

    cambiarCurso(cursoId) {
        this.cursoSeleccionado = cursoId;
        this.cargarLista({ curso_id: cursoId });
    },

    buscar(texto) {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => {
            this.cargarLista({ 
                curso_id: this.cursoSeleccionado,
                search: texto 
            });
        }, 300);
    },

    async crear() {
        if (this.cursos.length === 0) {
            Utils.toast('Primero debe crear un curso', 'warning');
            return;
        }

        const dni = prompt('DNI del estudiante:');
        if (!dni) return;
        const apellidos = prompt('Apellidos:');
        if (!apellidos) return;
        const nombres = prompt('Nombres:');
        if (!nombres) return;
        const email = prompt('Correo institucional (opcional):') || '';

        const cursosTexto = this.cursos.map((c, i) => `${i + 1}. ${c.año_lectivo}-${c.codigo}-${c.turno}`).join('\n');
        const opcion = prompt(`Seleccione el curso (1-${this.cursos.length}):\n${cursosTexto}`);
        if (!opcion) return;
        const idx = parseInt(opcion) - 1;
        if (idx < 0 || idx >= this.cursos.length) {
            Utils.toast('Opción inválida', 'error');
            return;
        }

        try {
            const datos = {
                dni: dni.trim(),
                apellidos: apellidos.trim().toUpperCase(),
                nombres: nombres.trim().toUpperCase(),
                curso_id: this.cursos[idx].id
            };
            if (email.trim()) datos.email = email.trim();

            await API.crearEstudiante(datos);
            Utils.toast('Estudiante creado exitosamente', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async editar(id) {
        try {
            const e = await API.obtenerEstudiante(id);
            
            // Menú de opciones
            const opcion = prompt(
                `¿Qué desea editar del estudiante ${e.apellidos} ${e.nombres}?\n\n` +
                `1. DNI (actual: ${e.dni})\n` +
                `2. Apellidos (actual: ${e.apellidos})\n` +
                `3. Nombres (actual: ${e.nombres})\n` +
                `4. Correo institucional (actual: ${e.email || 'Sin correo'})\n` +
                `5. Curso (actual: ${e.curso ? `${e.curso.año_lectivo}-${e.curso.codigo}-${e.curso.turno}` : 'N/A'})\n` +
                `6. Editar todos los campos\n\n` +
                `Ingrese el número de opción (1-6):`
            );

            if (!opcion) return;

            const datos = {};

            if (opcion === '1') {
                const nuevo = prompt('Nuevo DNI:', e.dni);
                if (nuevo === null) return;
                datos.dni = nuevo.trim();
            } else if (opcion === '2') {
                const nuevo = prompt('Nuevos apellidos:', e.apellidos);
                if (nuevo === null) return;
                datos.apellidos = nuevo.trim().toUpperCase();
            } else if (opcion === '3') {
                const nuevo = prompt('Nuevos nombres:', e.nombres);
                if (nuevo === null) return;
                datos.nombres = nuevo.trim().toUpperCase();
            } else if (opcion === '4') {
                const nuevo = prompt('Nuevo correo institucional:', e.email || '');
                if (nuevo === null) return;
                datos.email = nuevo.trim() || null;
            } else if (opcion === '5') {
                if (this.cursos.length === 0) {
                    Utils.toast('No hay cursos disponibles', 'warning');
                    return;
                }
                const cursosTexto = this.cursos.map((c, i) => `${i + 1}. ${c.año_lectivo}-${c.codigo}-${c.turno}`).join('\n');
                const opcionCurso = prompt(`Seleccione el nuevo curso (1-${this.cursos.length}):\n${cursosTexto}`);
                if (!opcionCurso) return;
                const idx = parseInt(opcionCurso) - 1;
                if (idx < 0 || idx >= this.cursos.length) {
                    Utils.toast('Opción inválida', 'error');
                    return;
                }
                datos.curso_id = this.cursos[idx].id;
            } else if (opcion === '6') {
                const nuevoDni = prompt('DNI:', e.dni);
                if (nuevoDni === null) return;
                const nuevosApellidos = prompt('Apellidos:', e.apellidos);
                if (nuevosApellidos === null) return;
                const nuevosNombres = prompt('Nombres:', e.nombres);
                if (nuevosNombres === null) return;
                const nuevoEmail = prompt('Correo institucional:', e.email || '');
                if (nuevoEmail === null) return;
                
                datos.dni = nuevoDni.trim();
                datos.apellidos = nuevosApellidos.trim().toUpperCase();
                datos.nombres = nuevosNombres.trim().toUpperCase();
                datos.email = nuevoEmail.trim() || null;
            } else {
                Utils.toast('Opción inválida', 'error');
                return;
            }

            await API.actualizarEstudiante(id, datos);
            Utils.toast('Estudiante actualizado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async eliminar(id) {
        if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
        try {
            await API.eliminarEstudiante(id);
            Utils.toast('Estudiante eliminado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    }
};

window.Estudiantes = Estudiantes;
