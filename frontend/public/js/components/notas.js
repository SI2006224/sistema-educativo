// Componente de Notas - Con edición, filtros, instancias, promedios y buscador de materias
const Notas = {
    cursos: [],
    cursoSeleccionado: null,
    materiaSeleccionada: null,
    instanciaSeleccionada: null,
    trimestre: 1,
    notas: [],
    estudiantes: [],
    materias: [],
    materiasPersonalizadas: [],
    notaEditando: null,

    async render(container) {
        container.innerHTML = `
            <div class="container">
                <div class="flex-between mb-8">
                    <h1 style="margin:0;font-size:1.2rem;">Notas</h1>
                    <button class="btn btn-sm" onclick="Notas.abrirModalCrear()">+ Nota</button>
                </div>

                <div class="card" style="padding:8px;">
                    <div class="flex gap-8">
                        <select id="notas-curso" onchange="Notas.cambiarCurso(this.value)" style="flex:2;margin:0;padding:6px;font-size:0.85rem;">
                            <option value="">Todos los cursos</option>
                        </select>
                        <select id="notas-trimestre" onchange="Notas.cambiarTrimestre(this.value)" style="flex:1;margin:0;padding:6px;font-size:0.85rem;">
                            <option value="1">1°T</option>
                            <option value="2">2°T</option>
                            <option value="3">3°T</option>
                        </select>
                    </div>
                    <div class="flex gap-8 mt-8">
                        <select id="notas-materia" onchange="Notas.cambiarMateria(this.value)" style="flex:1;margin:0;padding:6px;font-size:0.85rem;">
                            <option value="">Todas las materias</option>
                        </select>
                        <select id="notas-instancia" onchange="Notas.cambiarInstancia(this.value)" style="flex:1;margin:0;padding:6px;font-size:0.85rem;">
                            <option value="">Todas las instancias</option>
                            <option value="regular">Regular</option>
                            <option value="diciembre">Diciembre</option>
                            <option value="febrero">Febrero</option>
                        </select>
                    </div>
                </div>

                <div id="notas-lista"></div>

                <!-- Modal para crear nota -->
                <div id="modal-nota" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modal-titulo">Nueva Nota</h2>
                            <button class="modal-close" onclick="Notas.cerrarModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <label>Curso</label>
                            <select id="modal-curso" onchange="Notas.cargarEstudiantesModal()">
                                <option value="">Seleccione curso...</option>
                            </select>

                            <label>Estudiante</label>
                            <select id="modal-estudiante">
                                <option value="">Seleccione estudiante...</option>
                            </select>

                            <label>Materia</label>
                            <input type="text" id="modal-materia-buscar" placeholder="🔍 Buscar materia..." 
                                   oninput="Notas.filtrarMaterias(this.value)" 
                                   style="margin-bottom:4px;padding:6px;font-size:0.85rem;">
                            <select id="modal-materia" size="5" style="height:auto;max-height:150px;overflow-y:auto;">
                                <option value="">Seleccione materia...</option>
                            </select>
                            <div class="flex gap-8 mt-8"><button class="btn btn-sm btn-secondary" onclick="Notas.agregarMateriaBuscada()">+ Agregar materia</button><button class="btn btn-sm btn-secondary" onclick="Notas.editarMateriaSeleccionada()">✏️ Editar agregada</button></div>

                            <label>Actividad</label>
                            <input type="text" id="modal-actividad" placeholder="Ej: Examen 1, TP 2">

                            <label>Tipo</label>
                            <select id="modal-tipo">
                                <option value="examen">Examen</option>
                                <option value="tarea">Tarea</option>
                                <option value="proyecto">Proyecto</option>
                                <option value="participacion">Participación</option>
                            </select>

                            <label>Instancia</label>
                            <select id="modal-instancia">
                                <option value="regular">Regular</option>
                                <option value="diciembre">Diciembre</option>
                                <option value="febrero">Febrero</option>
                            </select>

                            <label>Fecha de entrega</label>
                            <input type="date" id="modal-fecha" value="${new Date().toISOString().split('T')[0]}">

                            <label>Calificación (0-10)</label>
                            <input type="number" id="modal-calificacion" min="0" max="10" step="0.1" placeholder="8.5">

                            <div id="modal-error" class="error"></div>
                            <div id="modal-advertencia" class="warning hidden">
                                ⚠️ Está cargando una nota a futuro.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="Notas.cerrarModal()">Cancelar</button>
                            <button class="btn btn-success" onclick="Notas.guardarNota()">Guardar</button>
                        </div>
                    </div>
                </div>

                <!-- Modal para editar nota -->
                <div id="modal-editar-nota" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Editar Nota</h2>
                            <button class="modal-close" onclick="Notas.cerrarModalEditar()">×</button>
                        </div>
                        <div class="modal-body">
                            <label>Estudiante</label>
                            <input type="text" id="edit-estudiante" disabled style="background:#f5f5f5;">

                            <label>Materia</label>
                            <input type="text" id="edit-materia-buscar" placeholder="🔍 Buscar materia..." 
                                   oninput="Notas.filtrarMateriasEditar(this.value)" 
                                   style="margin-bottom:4px;padding:6px;font-size:0.85rem;">
                            <select id="edit-materia" size="5" style="height:auto;max-height:150px;overflow-y:auto;">
                                <option value="">Seleccione materia...</option>
                            </select>
                            <div class="flex gap-8 mt-8"><button class="btn btn-sm btn-secondary" onclick="Notas.agregarMateriaBuscada(true)">+ Agregar materia</button><button class="btn btn-sm btn-secondary" onclick="Notas.editarMateriaSeleccionada(true)">✏️ Editar agregada</button></div>

                            <label>Actividad</label>
                            <input type="text" id="edit-actividad" placeholder="Ej: Examen 1, TP 2">

                            <label>Tipo</label>
                            <select id="edit-tipo">
                                <option value="examen">Examen</option>
                                <option value="tarea">Tarea</option>
                                <option value="proyecto">Proyecto</option>
                                <option value="participacion">Participación</option>
                            </select>

                            <label>Instancia</label>
                            <select id="edit-instancia">
                                <option value="regular">Regular</option>
                                <option value="diciembre">Diciembre</option>
                                <option value="febrero">Febrero</option>
                            </select>

                            <label>Fecha de entrega</label>
                            <input type="date" id="edit-fecha">

                            <label>Calificación (0-10)</label>
                            <input type="number" id="edit-calificacion" min="0" max="10" step="0.1">

                            <div id="edit-error" class="error"></div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="Notas.cerrarModalEditar()">Cancelar</button>
                            <button class="btn btn-success" onclick="Notas.guardarEdicion()">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Cargar cursos en los selectores
        try {
            this.cursos = await API.obtenerCursos();
            const select = document.getElementById('notas-curso');
            const selectModal = document.getElementById('modal-curso');
            this.cursos.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.año_lectivo}-${c.codigo}-${c.turno}`;
                select.appendChild(opt);
                selectModal.appendChild(opt.cloneNode(true));
            });

            // Cargar materias en el filtro, modal crear y modal editar
            const selectMateria = document.getElementById('notas-materia');
            const selectMateriaModal = document.getElementById('modal-materia');
            const selectMateriaEditar = document.getElementById('edit-materia');
            const registros = await API.obtenerMaterias();
            this.materiasPersonalizadas = registros.filter(m => !MATERIAS_UNICAS.some(base => this.normalizar(base) === this.normalizar(m.nombre)));
            this.materias = [...new Set([...MATERIAS_UNICAS, ...registros.map(m => m.nombre)])];
            this.materias.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = `${m}${this.esPersonalizada(m) ? ' · Agregada' : ''}`;
                selectMateria.appendChild(opt);
                selectMateriaModal.appendChild(opt.cloneNode(true));
                selectMateriaEditar.appendChild(opt.cloneNode(true));
            });
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }

        await this.cargarLista();
    },

    async cargarLista() {
        const lista = document.getElementById('notas-lista');
        try {
            let params = `?trimestre=${this.trimestre}`;
            if (this.cursoSeleccionado) params += `&curso_id=${this.cursoSeleccionado}`;

            const notas = await API.obtenerNotas(params);
            this.notas = notas;

            // Filtrar por materia
            let notasFiltradas = notas;
            if (this.materiaSeleccionada) {
                notasFiltradas = notas.filter(n => n.nombre_actividad.startsWith(this.materiaSeleccionada + ' - '));
            }

            // Filtrar por instancia
            if (this.instanciaSeleccionada) {
                notasFiltradas = notasFiltradas.filter(n => n.instancia === this.instanciaSeleccionada);
            }

            if (notasFiltradas.length === 0) {
                lista.innerHTML = `<div class="card" style="padding:16px;text-align:center;">No hay notas registradas</div>`;
                return;
            }

            // Agrupar por estudiante
            const porEstudiante = {};
            notasFiltradas.forEach(n => {
                const key = n.estudiante_id;
                if (!porEstudiante[key]) {
                    porEstudiante[key] = { estudiante: n.estudiante, notas: [] };
                }
                porEstudiante[key].notas.push(n);
            });

            // Ordenar por apellido, nombre y DNI
            const items = Object.values(porEstudiante).sort((a, b) => {
                const ap = a.estudiante.apellidos || '';
                const bp = b.estudiante.apellidos || '';
                if (ap !== bp) return ap.localeCompare(bp);
                const an = a.estudiante.nombres || '';
                const bn = b.estudiante.nombres || '';
                if (an !== bn) return an.localeCompare(bn);
                return (a.estudiante.dni || '').localeCompare(b.estudiante.dni || '');
            });

            const materias = [...new Set(notasFiltradas.map(n => n.nombre_actividad.split(' - ')[0] || n.nombre_actividad))];

            let html = `<div class="card" style="padding:4px;overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.7rem;white-space:nowrap;">
                    <thead>
                        <tr style="background:#1a237e;color:white;">
                            <th style="padding:4px;text-align:left;">Estudiante</th>
                            <th style="padding:4px;">DNI</th>
                            <th style="padding:4px;">Prom.</th>`;

            materias.forEach(mat => {
                html += `<th style="padding:4px;">${mat}</th>`;
            });
            html += `<th style="padding:4px;">Acciones</th></tr></thead><tbody>`;

            items.forEach(item => {
                const est = item.estudiante;
                const promedio = item.notas.reduce((s, n) => s + n.calificacion, 0) / item.notas.length;
                let colorProm = promedio >= 8 ? '#2e7d32' : promedio >= 6 ? '#f57f17' : '#c62828';

                html += `<tr style="border-bottom:1px solid #eee;">
                    <td style="padding:4px;white-space:nowrap;">${est.apellidos} ${est.nombres}</td>
                    <td style="padding:4px;text-align:center;">${est.dni}</td>
                    <td style="padding:4px;text-align:center;font-weight:700;color:${colorProm};">${promedio.toFixed(1)}</td>`;

                materias.forEach(mat => {
                    const notasMateria = item.notas.filter(n => n.nombre_actividad.split(' - ')[0] === mat);
                    if (notasMateria.length > 0) {
                        const promedioMat = notasMateria.reduce((s, n) => s + n.calificacion, 0) / notasMateria.length;
                        let color = promedioMat >= 8 ? '#2e7d32' : promedioMat >= 6 ? '#f57f17' : '#c62828';
                        html += `<td style="padding:4px;text-align:center;color:${color};font-weight:600;">${promedioMat.toFixed(1)}</td>`;
                    } else {
                        html += `<td style="padding:4px;text-align:center;color:#ccc;">-</td>`;
                    }
                });

                html += `<td style="padding:4px;text-align:center;">
                    <button class="btn btn-sm btn-secondary" onclick="Notas.editarEstudiante(${est.id})" style="padding:2px 6px;font-size:0.7rem;">✏️</button>
                </td></tr>`;
            });

            html += `</tbody></table></div>`;
            lista.innerHTML = html;
        } catch (error) {
            lista.innerHTML = `<div class="card"><p class="error">${error.message}</p></div>`;
        }
    },

    cambiarCurso(cursoId) {
        this.cursoSeleccionado = cursoId || null;
        this.cargarLista();
    },

    cambiarMateria(materia) {
        this.materiaSeleccionada = materia || null;
        this.cargarLista();
    },

    cambiarInstancia(instancia) {
        this.instanciaSeleccionada = instancia || null;
        this.cargarLista();
    },

    cambiarTrimestre(valor) {
        this.trimestre = parseInt(valor);
        this.cargarLista();
    },

    // ============================================
    // BUSCADOR DE MATERIAS
    // ============================================
    normalizar(texto) { return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim(); },
    esPersonalizada(nombre) { return this.materiasPersonalizadas.some(m => m.nombre === nombre); },
    distanciaTexto(a, b) {
        const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) { let diagonal = prev[0]; prev[0] = i; for (let j = 1; j <= b.length; j++) { const arriba = prev[j]; prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)); diagonal = arriba; } }
        return prev[b.length];
    },
    buscarCoincidencias(texto) {
        const q = this.normalizar(texto);
        if (!q) return this.materias;
        return this.materias.filter(m => { const n = this.normalizar(m); return n.includes(q) || (q.length >= 4 && this.distanciaTexto(q, n) <= 1); });
    },
    actualizarOpcionesMateria(select, texto) {
        const actual = select.value;
        select.innerHTML = '<option value="">Seleccione materia...</option>';
        const coincidenciaExacta = this.materias.find(m => this.normalizar(m) === this.normalizar(texto));
        const sugerencias = this.buscarCoincidencias(texto);
        const sugerida = coincidenciaExacta || (sugerencias.length === 1 ? sugerencias[0] : null);
        sugerencias.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = `${m}${this.esPersonalizada(m) ? ' · Materia agregada' : ''}`; if (m === actual || (!actual && m === sugerida)) o.selected = true; select.appendChild(o); });
    },
    filtrarMaterias(texto) {
        const select = document.getElementById('modal-materia');
        this.actualizarOpcionesMateria(select, texto);
    },

    filtrarMateriasEditar(texto) {
        const select = document.getElementById('edit-materia');
        this.actualizarOpcionesMateria(select, texto);
    },

    async agregarMateriaBuscada(edicion = false) {
        const prefijo = edicion ? 'edit' : 'modal';
        const texto = document.getElementById(`${prefijo}-materia-buscar`).value.trim();
        if (!texto) { Utils.toast('Escriba el nombre de la materia que desea agregar', 'warning'); return; }
        const coincidencias = this.buscarCoincidencias(texto);
        const coincidencia = this.materias.find(m => this.normalizar(m) === this.normalizar(texto)) || (coincidencias.length === 1 ? coincidencias[0] : null);
        if (coincidencia) { document.getElementById(`${prefijo}-materia`).value = coincidencia; Utils.toast(`La materia ya existe: ${coincidencia}`, 'info'); return; }
        try {
            const nueva = await API.crearMateria({ nombre: texto });
            this.materiasPersonalizadas.push(nueva); this.materias.push(nueva.nombre);
            this.materiasPersonalizadas = [...new Map(this.materiasPersonalizadas.map(m => [m.id, m])).values()];
            if (edicion) { this.filtrarMateriasEditar(texto); document.getElementById('edit-materia').value = nueva.nombre; }
            else { this.filtrarMaterias(texto); document.getElementById('modal-materia').value = nueva.nombre; }
            Utils.toast('Materia agregada al listado', 'success');
        } catch (error) { Utils.toast(error.message, 'error'); }
    },

    async editarMateriaSeleccionada(edicion = false) {
        const select = document.getElementById(edicion ? 'edit-materia' : 'modal-materia');
        const materia = this.materiasPersonalizadas.find(m => m.nombre === select.value);
        if (!materia) { Utils.toast('Seleccione una materia marcada como agregada', 'warning'); return; }
        const nombre = prompt('Nuevo nombre para la materia agregada:', materia.nombre);
        if (nombre === null || !nombre.trim()) return;
        try {
            const actualizada = await API.actualizarMateria(materia.id, { nombre: nombre.trim() });
            this.materias = this.materias.map(m => m === materia.nombre ? actualizada.nombre : m);
            materia.nombre = actualizada.nombre;
            if (edicion) this.filtrarMateriasEditar(actualizada.nombre); else this.filtrarMaterias(actualizada.nombre);
            select.value = actualizada.nombre;
            Utils.toast('Materia actualizada', 'success');
        } catch (error) { Utils.toast(error.message, 'error'); }
    },

    // ============================================
    // MODAL CREAR
    // ============================================
    abrirModalCrear() {
        document.getElementById('modal-titulo').textContent = 'Nueva Nota';
        document.getElementById('modal-nota').classList.remove('hidden');
        document.getElementById('modal-error').textContent = '';
        document.getElementById('modal-advertencia').classList.add('hidden');
        document.getElementById('modal-curso').value = '';
        document.getElementById('modal-estudiante').innerHTML = '<option value="">Seleccione estudiante...</option>';
        document.getElementById('modal-materia').value = '';
        document.getElementById('modal-materia-buscar').value = '';
        document.getElementById('modal-actividad').value = '';
        document.getElementById('modal-tipo').value = 'examen';
        document.getElementById('modal-instancia').value = 'regular';
        document.getElementById('modal-fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('modal-calificacion').value = '';
        this.notaEditando = null;
        this.filtrarMaterias('');
    },

    cerrarModal() {
        document.getElementById('modal-nota').classList.add('hidden');
    },

    async cargarEstudiantesModal() {
        const cursoId = document.getElementById('modal-curso').value;
        const selectEst = document.getElementById('modal-estudiante');
        selectEst.innerHTML = '<option value="">Cargando...</option>';

        if (!cursoId) {
            selectEst.innerHTML = '<option value="">Seleccione estudiante...</option>';
            return;
        }

        try {
            const estudiantes = await API.obtenerEstudiantes(`?curso_id=${cursoId}`);
            estudiantes.sort((a, b) => {
                const ap = a.apellidos || '';
                const bp = b.apellidos || '';
                if (ap !== bp) return ap.localeCompare(bp);
                return (a.nombres || '').localeCompare(b.nombres || '');
            });

            selectEst.innerHTML = '<option value="">Seleccione estudiante...</option>';
            estudiantes.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = `${e.apellidos} ${e.nombres} (${e.dni})`;
                selectEst.appendChild(opt);
            });
        } catch (error) {
            selectEst.innerHTML = '<option value="">Error al cargar</option>';
        }
    },

    async guardarNota() {
        const errorDiv = document.getElementById('modal-error');
        const advertenciaDiv = document.getElementById('modal-advertencia');
        errorDiv.textContent = '';

        const cursoId = document.getElementById('modal-curso').value;
        const estudianteId = document.getElementById('modal-estudiante').value;
        const materia = document.getElementById('modal-materia').value;
        const actividad = document.getElementById('modal-actividad').value.trim();
        const tipo = document.getElementById('modal-tipo').value;
        const instancia = document.getElementById('modal-instancia').value;
        const fecha = document.getElementById('modal-fecha').value;
        const calificacion = parseFloat(document.getElementById('modal-calificacion').value);

        if (!cursoId || !estudianteId || !materia || !actividad || !fecha || isNaN(calificacion)) {
            errorDiv.textContent = 'Complete todos los campos';
            return;
        }

        if (calificacion < 0 || calificacion > 10) {
            errorDiv.textContent = 'La calificación debe ser entre 0 y 10';
            return;
        }

        const hoy = new Date().toISOString().split('T')[0];
        if (fecha > hoy) {
            advertenciaDiv.classList.remove('hidden');
            if (!this.confirmoFuturo) {
                this.confirmoFuturo = true;
                return;
            }
        }

        try {
            if (this.notaEditando) {
                await API.actualizarNota(this.notaEditando, {
                    nombre_actividad: `${materia} - ${actividad}`,
                    tipo,
                    instancia,
                    fecha_entrega: fecha,
                    calificacion
                });
                Utils.toast('Nota actualizada', 'success');
            } else {
                await API.crearNota({
                    estudiante_id: parseInt(estudianteId),
                    nombre_actividad: `${materia} - ${actividad}`,
                    tipo,
                    instancia,
                    fecha_entrega: fecha,
                    calificacion,
                    trimestre: this.trimestre
                });
                Utils.toast('Nota creada exitosamente', 'success');
            }

            this.confirmoFuturo = false;
            this.notaEditando = null;
            this.cerrarModal();
            await this.cargarLista();
        } catch (error) {
            errorDiv.textContent = error.message;
        }
    },

    // ============================================
    // MODAL EDITAR
    // ============================================
    async editarEstudiante(estudianteId) {
        const notasEst = this.notas.filter(n => n.estudiante_id === estudianteId);
        if (notasEst.length === 0) {
            Utils.toast('No hay notas para editar', 'warning');
            return;
        }

        const listaNotas = notasEst.map((n, i) => 
            `${i + 1}. ${n.nombre_actividad} — ${n.calificacion.toFixed(1)} (${n.fecha_entrega})`
        ).join('\n');

        const opcion = prompt(
            `Seleccione la nota a editar:\n\n${listaNotas}\n\nIngrese el número:`
        );
        if (!opcion) return;
        const idx = parseInt(opcion) - 1;
        if (idx < 0 || idx >= notasEst.length) {
            Utils.toast('Opción inválida', 'error');
            return;
        }

        const nota = notasEst[idx];
        this.notaEditando = nota.id;

        const est = nota.estudiante;
        document.getElementById('edit-estudiante').value = `${est.apellidos} ${est.nombres} (${est.dni})`;

        const partes = nota.nombre_actividad.split(' - ');
        const materia = partes[0];
        const actividad = partes.slice(1).join(' - ');

        document.getElementById('edit-materia').value = materia;
        document.getElementById('edit-materia-buscar').value = '';
        this.filtrarMateriasEditar('');
        document.getElementById('edit-materia').value = materia;
        document.getElementById('edit-actividad').value = actividad;
        document.getElementById('edit-tipo').value = nota.tipo;
        document.getElementById('edit-instancia').value = nota.instancia || 'regular';
        document.getElementById('edit-fecha').value = nota.fecha_entrega;
        document.getElementById('edit-calificacion').value = nota.calificacion;
        document.getElementById('edit-error').textContent = '';

        document.getElementById('modal-editar-nota').classList.remove('hidden');
    },

    cerrarModalEditar() {
        document.getElementById('modal-editar-nota').classList.add('hidden');
        this.notaEditando = null;
    },

    async guardarEdicion() {
        const errorDiv = document.getElementById('edit-error');
        errorDiv.textContent = '';

        const materia = document.getElementById('edit-materia').value;
        const actividad = document.getElementById('edit-actividad').value.trim();
        const tipo = document.getElementById('edit-tipo').value;
        const instancia = document.getElementById('edit-instancia').value;
        const fecha = document.getElementById('edit-fecha').value;
        const calificacion = parseFloat(document.getElementById('edit-calificacion').value);

        if (!materia || !actividad || !fecha || isNaN(calificacion)) {
            errorDiv.textContent = 'Complete todos los campos';
            return;
        }

        if (calificacion < 0 || calificacion > 10) {
            errorDiv.textContent = 'La calificación debe ser entre 0 y 10';
            return;
        }

        try {
            await API.actualizarNota(this.notaEditando, {
                nombre_actividad: `${materia} - ${actividad}`,
                tipo,
                instancia,
                fecha_entrega: fecha,
                calificacion
            });
            Utils.toast('Nota actualizada exitosamente', 'success');
            this.cerrarModalEditar();
            await this.cargarLista();
        } catch (error) {
            errorDiv.textContent = error.message;
        }
    }
};

window.Notas = Notas;