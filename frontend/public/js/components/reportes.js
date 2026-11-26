// Componente de Reportes
const Reportes = {
    cursos: [],
    materias: [],

    async render(container) {
        container.innerHTML = `
            <div class="container">
                <h1>Reportes</h1>

                <div class="card">
                    <h2>📄 Reporte de Asistencias</h2>
                    <label>Curso</label>
                    <select id="rep-curso-asist">
                        <option value="">Seleccione un curso</option>
                    </select>
                    <label>Estudiante (opcional)</label>
                    <select id="rep-alumno-asist"><option value="">Todo el curso</option></select>
                    <label>Trimestre</label>
                    <select id="rep-trimestre-asist">
                        <option value="1">1° Trimestre</option>
                        <option value="2">2° Trimestre</option>
                        <option value="3">3° Trimestre</option>
                    </select>
                    <button class="btn btn-block mt-8" onclick="Reportes.generarAsistencias()">
                        📥 Descargar PDF de Asistencias
                    </button>
                </div>

                <div class="card">
                    <h2>📝 Reporte de Notas</h2>
                    <label>Curso</label>
                    <select id="rep-curso-notas">
                        <option value="">Seleccione un curso</option>
                    </select>
                    <label>Trimestre</label>
                    <select id="rep-trimestre-notas">
                        <option value="1">1° Trimestre</option>
                        <option value="2">2° Trimestre</option>
                        <option value="3">3° Trimestre</option>
                    </select>
                    <label>Buscar materia</label>
                    <input type="text" id="rep-materia-buscar" placeholder="🔍 Buscar materia..." oninput="Reportes.filtrarMaterias(this.value)" style="margin-bottom:4px;padding:6px;font-size:0.85rem;">
                    <select id="rep-materia-notas" size="5" style="height:auto;max-height:150px;overflow-y:auto;" onchange="Reportes.seleccionarMateria(this.value)">
                        <option value="">Todas las materias</option>
                    </select>
                    <label>Estudiante (opcional)</label>
                    <select id="rep-alumno-notas"><option value="">Todo el curso</option></select>
                    <button class="btn btn-block mt-8" onclick="Reportes.generarNotas()">
                        📥 Descargar PDF de Notas
                    </button>
                </div>

                <div class="card">
                    <h2>📊 Exportar CSV</h2>
                    <label>Curso</label>
                    <select id="rep-csv-curso"><option value="">Seleccione un curso</option></select>
                    <label>Estudiante (opcional)</label>
                    <select id="rep-csv-alumno"><option value="">Todo el curso</option></select>
                    <label>Trimestre (asistencias y notas)</label>
                    <select id="rep-csv-trimestre"><option value="">Todos</option><option value="1">1° Trimestre</option><option value="2">2° Trimestre</option><option value="3">3° Trimestre</option></select>
                    <button class="btn btn-block mt-8 btn-secondary" onclick="Reportes.exportarCSV('estudiantes')">
                        👥 Exportar Estudiantes
                    </button>
                    <button class="btn btn-block mt-8 btn-secondary" onclick="Reportes.exportarCSV('asistencias')">
                        ✅ Exportar Asistencias
                    </button>
                    <button class="btn btn-block mt-8 btn-secondary" onclick="Reportes.exportarCSV('notas')">
                        📝 Exportar Notas
                    </button>
                </div>
            </div>
        `;

        // Cargar cursos
        try {
            this.cursos = await API.obtenerCursos();
            ['rep-curso-asist', 'rep-curso-notas', 'rep-csv-curso'].forEach(id => {
                const select = document.getElementById(id);
                this.cursos.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.nombre_completo;
                    select.appendChild(opt);
                });
            });
            for (const [cursoId, alumnoId] of [['rep-curso-asist','rep-alumno-asist'], ['rep-curso-notas','rep-alumno-notas'], ['rep-csv-curso','rep-csv-alumno']]) {
                document.getElementById(cursoId).addEventListener('change', () => this.cargarAlumnos(cursoId, alumnoId));
            }
            const materiasDB = await API.obtenerMaterias();
            const materiasBase = typeof MATERIAS_UNICAS !== 'undefined' ? MATERIAS_UNICAS : [];
            this.materias = [...new Set([...materiasBase, ...materiasDB.map(m => m.nombre)])].sort((a, b) => a.localeCompare(b, 'es'));
            this.filtrarMaterias('');
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }
    },

    normalizarMateria(texto) {
        return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
    },

    distanciaMateria(a, b) {
        const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            let diagonal = fila[0]; fila[0] = i;
            for (let j = 1; j <= b.length; j++) {
                const arriba = fila[j];
                fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
                diagonal = arriba;
            }
        }
        return fila[b.length];
    },

    filtrarMaterias(texto) {
        const select = document.getElementById('rep-materia-notas');
        if (!select) return;
        const valorActual = select.value;
        const busqueda = this.normalizarMateria(texto);
        const resultados = !busqueda ? this.materias : this.materias.filter(nombre => {
            const normalizada = this.normalizarMateria(nombre);
            return normalizada.includes(busqueda) || (busqueda.length >= 4 && this.distanciaMateria(busqueda, normalizada) <= 1);
        });
        select.innerHTML = '<option value="">Todas las materias</option>';
        resultados.forEach(nombre => {
            const opcion = document.createElement('option');
            opcion.value = nombre;
            opcion.textContent = nombre;
            if (nombre === valorActual) opcion.selected = true;
            select.appendChild(opcion);
        });
        const exacta = this.materias.find(nombre => this.normalizarMateria(nombre) === busqueda);
        const sugerida = exacta || (resultados.length === 1 ? resultados[0] : null);
        if (busqueda && sugerida && (!valorActual || !resultados.includes(valorActual))) select.value = sugerida;
    },

    seleccionarMateria(nombre) {
        if (nombre) document.getElementById('rep-materia-buscar').value = nombre;
        else document.getElementById('rep-materia-buscar').value = '';
    },

    async cargarAlumnos(cursoSelectId, alumnoSelectId) {
        const select = document.getElementById(alumnoSelectId);
        select.innerHTML = '<option value="">Todo el curso</option>';
        const cursoId = document.getElementById(cursoSelectId).value;
        if (!cursoId) return;
        try {
            const alumnos = await API.obtenerEstudiantes(`?curso_id=${encodeURIComponent(cursoId)}`);
            alumnos.sort((a,b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es'));
            alumnos.forEach(a => { const o = document.createElement('option'); o.value = a.id; o.textContent = `${a.apellidos} ${a.nombres} (${a.dni})`; select.appendChild(o); });
        } catch (e) { Utils.toast('No se pudo cargar el listado de estudiantes', 'error'); }
    },

    async generarAsistencias() {
        const curso_id = document.getElementById('rep-curso-asist').value;
        const trimestre = document.getElementById('rep-trimestre-asist').value;
        const estudiante = document.getElementById('rep-alumno-asist').value;

        if (!curso_id) {
            Utils.toast('Seleccione un curso', 'warning');
            return;
        }

        try {
            Utils.toast('Generando PDF...', 'info');
            const token = Utils.obtenerToken();
            const url = `/api/reportes/asistencias?curso_id=${encodeURIComponent(curso_id)}&trimestre=${trimestre}${estudiante ? `&estudiante_id=${encodeURIComponent(estudiante)}` : ''}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al generar PDF');
            
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `reporte-asistencias-${Date.now()}.pdf`;
            link.click();
            
            Utils.toast('PDF generado exitosamente', 'success');
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async generarNotas() {
        const curso_id = document.getElementById('rep-curso-notas').value;
        const trimestre = document.getElementById('rep-trimestre-notas').value;
        const estudiante = document.getElementById('rep-alumno-notas').value;
        const materia = document.getElementById('rep-materia-notas').value;

        if (!curso_id) {
            Utils.toast('Seleccione un curso', 'warning');
            return;
        }

        try {
            Utils.toast('Generando PDF...', 'info');
            const token = Utils.obtenerToken();
            const params = new URLSearchParams({ curso_id, trimestre });
            if (estudiante) params.set('estudiante_id', estudiante);
            if (materia) params.set('materia', materia);
            const url = `/api/reportes/notas?${params}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al generar PDF');
            
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `reporte-notas-${Date.now()}.pdf`;
            link.click();
            
            Utils.toast('PDF generado exitosamente', 'success');
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async exportarCSV(tipo) {
        try {
            const cursoId = document.getElementById('rep-csv-curso').value;
            if (!cursoId) { Utils.toast('Seleccione un curso', 'warning'); return; }
            const token = Utils.obtenerToken();
            const alumnoId = document.getElementById('rep-csv-alumno').value;
            const trimestre = document.getElementById('rep-csv-trimestre').value;
            const params = new URLSearchParams({ tabla: tipo, curso_id: cursoId });
            if (alumnoId) params.set('estudiante_id', alumnoId);
            if (trimestre && tipo !== 'estudiantes') params.set('trimestre', trimestre);
            const url = `/api/reportes/exportar/csv?${params}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al exportar CSV');
            
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${tipo}-${Date.now()}.csv`;
            link.click();
            
            Utils.toast('CSV exportado', 'success');
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    }
};

window.Reportes = Reportes;