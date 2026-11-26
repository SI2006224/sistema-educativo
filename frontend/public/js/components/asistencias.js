// Componente de Asistencias - Con calendario personalizado centrado
const Asistencias = {
    cursos: [],
    cursoSeleccionado: null,
    trimestre: 1,
    fecha: new Date().toISOString().split('T')[0],
    estudiantes: [],
    asistencias: {},
    mesActual: new Date().getMonth(),
    anioActual: new Date().getFullYear(),

    async render(container) {
        const hoyArg = Utils.fechaISOaArg(this.fecha);
        
        container.innerHTML = `
            <div class="container">
                <h1 style="font-size:1.2rem;">Asistencias</h1>

                <div class="card" style="padding:8px;">
                    <label style="font-size:0.8rem;">Curso</label>
                    <select id="asist-curso" onchange="Asistencias.seleccionarCurso(this.value)" style="padding:6px;font-size:0.85rem;">
                        <option value="">Seleccione un curso</option>
                    </select>

                    <label style="font-size:0.8rem;margin-top:8px;">Fecha (DD/MM/YYYY)</label>
                    <div class="flex gap-8">
                        <input type="text" id="asist-fecha" value="${hoyArg}" 
                               placeholder="DD/MM/YYYY"
                               onchange="Asistencias.cambiarFechaTexto(this.value)" 
                               style="flex:1;padding:6px;font-size:0.85rem;">
                        <button class="btn btn-sm btn-secondary" onclick="Asistencias.abrirCalendario()" 
                                style="padding:6px 10px;font-size:0.85rem;">📅</button>
                    </div>

                    <label style="font-size:0.8rem;margin-top:8px;">Trimestre</label>
                    <select id="asist-trimestre" onchange="Asistencias.cambiarTrimestre(this.value)" style="padding:6px;font-size:0.85rem;">
                        <option value="1">1° Trimestre</option>
                        <option value="2">2° Trimestre</option>
                        <option value="3">3° Trimestre</option>
                    </select>
                </div>

                <div id="asist-lista"></div>

                <div id="asist-acciones" class="hidden">
                    <button class="btn btn-success btn-block mt-8" onclick="Asistencias.guardar()">
                        💾 Guardar Asistencias
                    </button>
                    <button class="btn btn-warning btn-block mt-8" onclick="Asistencias.limpiar()">
                        🧹 Limpiar Selección
                    </button>
                    <button class="btn btn-secondary btn-block mt-8" onclick="Asistencias.verResumenDia()">
                        📊 Ver Resumen del Día
                    </button>
                </div>

                <div id="asist-resumen"></div>

                <!-- Modal Calendario -->
                <div id="modal-calendario" class="modal hidden">
                    <div class="modal-content" style="max-width:340px;">
                        <div class="modal-header">
                            <button class="modal-close" onclick="Asistencias.cerrarCalendario()">×</button>
                            <h2 id="calendario-titulo" style="flex:1;text-align:center;"></h2>
                            <div style="width:24px;"></div>
                        </div>
                        <div class="modal-body">
                            <div class="flex-between mb-8">
                                <button class="btn btn-sm btn-secondary" onclick="Asistencias.mesAnterior()">◀</button>
                                <button class="btn btn-sm btn-secondary" onclick="Asistencias.mesSiguiente()">▶</button>
                            </div>
                            <div id="calendario-grid"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        try {
            this.cursos = await API.obtenerCursos();
            const select = document.getElementById('asist-curso');
            this.cursos.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.año_lectivo}-${c.codigo}-${c.turno}`;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }
    },

    abrirCalendario() {
        const [anio, mes] = this.fecha.split('-').map(Number);
        this.mesActual = mes - 1;
        this.anioActual = anio;
        this.renderCalendario();
        document.getElementById('modal-calendario').classList.remove('hidden');
    },

    cerrarCalendario() {
        document.getElementById('modal-calendario').classList.add('hidden');
    },

    renderCalendario() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

        document.getElementById('calendario-titulo').textContent = 
            `${meses[this.mesActual]} ${this.anioActual}`;

        const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay();
        const diasEnMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
        const fechaSeleccionada = this.fecha;

        let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:0.75rem;">`;

        // Días de la semana
        diasSemana.forEach(d => {
            html += `<div style="padding:4px;font-weight:600;color:#1a237e;">${d}</div>`;
        });

        // Espacios vacíos antes del primer día
        for (let i = 0; i < primerDia; i++) {
            html += `<div></div>`;
        }

        // Días del mes
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaStr = `${this.anioActual}-${String(this.mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const esSeleccionada = fechaStr === fechaSeleccionada;
            const esHoy = fechaStr === new Date().toISOString().split('T')[0];
            const d = new Date(fechaStr + 'T12:00:00');
            const esFinde = d.getDay() === 0 || d.getDay() === 6;

            let bg = 'transparent';
            let color = esFinde ? '#c62828' : '#333';
            let fontWeight = 'normal';

            if (esSeleccionada) {
                bg = '#1a237e';
                color = 'white';
                fontWeight = 'bold';
            } else if (esHoy) {
                bg = '#e8eaf6';
                color = '#1a237e';
                fontWeight = 'bold';
            }

            html += `<div style="padding:6px 2px;border-radius:6px;cursor:pointer;background:${bg};color:${color};font-weight:${fontWeight};"
                          onclick="Asistencias.seleccionarDia('${fechaStr}')">${dia}</div>`;
        }

        html += `</div>`;
        document.getElementById('calendario-grid').innerHTML = html;
    },

    seleccionarDia(fecha) {
        this.fecha = fecha;
        document.getElementById('asist-fecha').value = Utils.fechaISOaArg(fecha);
        this.cerrarCalendario();
        if (this.cursoSeleccionado) {
            this.cargarEstudiantes();
        }
    },

    mesAnterior() {
        this.mesActual--;
        if (this.mesActual < 0) {
            this.mesActual = 11;
            this.anioActual--;
        }
        this.renderCalendario();
    },

    mesSiguiente() {
        this.mesActual++;
        if (this.mesActual > 11) {
            this.mesActual = 0;
            this.anioActual++;
        }
        this.renderCalendario();
    },

    async seleccionarCurso(cursoId) {
        if (!cursoId) {
            document.getElementById('asist-lista').innerHTML = '';
            document.getElementById('asist-acciones').classList.add('hidden');
            document.getElementById('asist-resumen').innerHTML = '';
            return;
        }
        this.cursoSeleccionado = parseInt(cursoId);
        await this.cargarEstudiantes();
    },

    cambiarTrimestre(valor) {
        this.trimestre = parseInt(valor);
        if (this.cursoSeleccionado) {
            this.cargarEstudiantes();
        }
    },

    cambiarFechaTexto(valor) {
        const fechaISO = Utils.fechaArgAISO(valor);
        if (!fechaISO) {
            const partes = (valor || '').trim().split('/');
            const mensaje = partes.length === 3 && /^\d{3}$/.test(partes[2])
                ? 'Falta un número en el año. Escriba los cuatro dígitos (por ejemplo, 19/11/2026).'
                : 'Fecha incompleta o inválida. Use DD/MM/YYYY (por ejemplo, 19/11/2026).';
            Utils.toast(mensaje, 'error');
            return;
        }
        this.fecha = fechaISO;
        if (this.cursoSeleccionado) {
            this.cargarEstudiantes();
        }
    },

    async cargarEstudiantes() {
        const lista = document.getElementById('asist-lista');
        lista.innerHTML = '<div class="card"><div class="loading"><div class="spinner"></div></div></div>';

        try {
            const estudiantes = await API.obtenerEstudiantes(`?curso_id=${this.cursoSeleccionado}`);
            
            estudiantes.sort((a, b) => {
                const ap = a.apellidos || '';
                const bp = b.apellidos || '';
                if (ap !== bp) return ap.localeCompare(bp);
                const an = a.nombres || '';
                const bn = b.nombres || '';
                if (an !== bn) return an.localeCompare(bn);
                return (a.dni || '').localeCompare(b.dni || '');
            });

            this.estudiantes = estudiantes;

            if (estudiantes.length === 0) {
                lista.innerHTML = `<div class="card" style="text-align:center;padding:16px;">No hay estudiantes en este curso</div>`;
                document.getElementById('asist-acciones').classList.add('hidden');
                return;
            }

            estudiantes.forEach(e => {
                if (!this.asistencias[e.id]) this.asistencias[e.id] = 'presente';
            });

            const estados = [
                { valor: 'presente', label: 'P', color: '#2e7d32' },
                { valor: 'ausente', label: 'A', color: '#c62828' },
                { valor: 'justificado', label: 'J', color: '#f57f17' },
                { valor: 'tarde', label: 'T', color: '#ef6c00' },
                { valor: 'retiro', label: 'R', color: '#6a1b9a' },
                { valor: 'huelga', label: 'H', color: '#d50000' },
                { valor: 'institucional', label: 'I', color: '#00695c' }
            ];

            let html = `<div class="card" style="padding:4px;overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.7rem;white-space:nowrap;">
                    <thead>
                        <tr style="background:#1a237e;color:white;">
                            <th style="padding:4px;text-align:left;">Estudiante</th>
                            <th style="padding:4px;">DNI</th>`;

            estados.forEach(e => {
                html += `<th style="padding:4px;">${e.label}</th>`;
            });
            html += `</tr></thead><tbody>`;

            estudiantes.forEach(e => {
                html += `<tr style="border-bottom:1px solid #eee;">
                    <td style="padding:4px;white-space:nowrap;">${e.apellidos} ${e.nombres}</td>
                    <td style="padding:4px;text-align:center;">${e.dni}</td>`;

                estados.forEach(est => {
                    const activo = this.asistencias[e.id] === est.valor;
                    html += `<td style="padding:4px;text-align:center;">
                        <button style="border:none;border-radius:4px;padding:4px 8px;font-size:0.7rem;cursor:pointer;
                                       background:${activo ? est.color : '#e0e0e0'};color:${activo ? 'white' : '#333'};"
                                onclick="Asistencias.marcar(${e.id}, '${est.valor}')">${est.label}</button>
                    </td>`;
                });

                html += `</tr>`;
            });

            html += `</tbody></table></div>`;
            lista.innerHTML = html;

            document.getElementById('asist-acciones').classList.remove('hidden');
        } catch (error) {
            lista.innerHTML = `<div class="card"><p class="error">${error.message}</p></div>`;
        }
    },

    marcar(estudianteId, estado) {
        this.asistencias[estudianteId] = estado;
        this.cargarEstudiantes();
    },

    limpiar() {
        this.asistencias = {};
        this.cargarEstudiantes();
        Utils.toast('Selección limpiada', 'info');
    },

    async guardar() {
        const fecha = this.fecha;
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const d = new Date(fecha + 'T12:00:00');
        
        if (d.getDay() === 0 || d.getDay() === 6) {
            Utils.toast(`No se puede registrar asistencia el ${Utils.fechaISOaArg(fecha)}: es ${dias[d.getDay()]}`, 'error');
            return;
        }

        const asistenciasArray = Object.entries(this.asistencias).map(([estudianteId, estado]) => ({
            estudiante_id: parseInt(estudianteId),
            estado,
            fecha: this.fecha,
            trimestre: this.trimestre
        }));

        if (asistenciasArray.length === 0) {
            Utils.toast('No hay asistencias para guardar', 'warning');
            return;
        }

        try {
            const resultado = await API.registrarAsistencias(asistenciasArray);
            Utils.toast(resultado.mensaje || 'Asistencias guardadas', 'success');
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async verResumenDia() {
        if (!this.cursoSeleccionado) {
            Utils.toast('Seleccione un curso', 'warning');
            return;
        }

        const resumenDiv = document.getElementById('asist-resumen');
        resumenDiv.innerHTML = '<div class="card"><div class="spinner"></div></div>';

        try {
            const token = Utils.obtenerToken();
            const url = `/api/asistencias/calcular?curso_id=${this.cursoSeleccionado}&fecha_inicio=${this.fecha}&fecha_fin=${this.fecha}&trimestre=${this.trimestre}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al calcular');
            
            const data = await response.json();

            let html = `<div class="card" style="padding:4px;overflow-x:auto;">
                <h3 style="padding:4px;font-size:0.9rem;">Resumen del día: ${Utils.fechaISOaArg(data.fecha_inicio)}</h3>
                <table style="width:100%;border-collapse:collapse;font-size:0.7rem;white-space:nowrap;">
                    <thead>
                        <tr style="background:#1a237e;color:white;">
                            <th style="padding:4px;">Estudiante</th>
                            <th style="padding:4px;">DNI</th>
                            <th style="padding:4px;">P</th>
                            <th style="padding:4px;">A</th>
                            <th style="padding:4px;">J</th>
                            <th style="padding:4px;">T</th>
                            <th style="padding:4px;">R</th>
                            <th style="padding:4px;">H</th>
                            <th style="padding:4px;">I</th>
                            <th style="padding:4px;">%</th>
                        </tr>
                    </thead>
                    <tbody>`;

            data.resumen.forEach(r => {
                let color = r.porcentaje >= 80 ? '#2e7d32' : r.porcentaje >= 60 ? '#f57f17' : '#c62828';
                html += `<tr style="border-bottom:1px solid #eee;">
                    <td style="padding:4px;">${r.estudiante}</td>
                    <td style="padding:4px;text-align:center;">${r.dni}</td>
                    <td style="padding:4px;text-align:center;color:#2e7d32;">${r.presentes}</td>
                    <td style="padding:4px;text-align:center;color:#c62828;">${r.ausentes}</td>
                    <td style="padding:4px;text-align:center;color:#f57f17;">${r.justificados}</td>
                    <td style="padding:4px;text-align:center;color:#ef6c00;">${r.tardes}</td>
                    <td style="padding:4px;text-align:center;color:#6a1b9a;">${r.retiros}</td>
                    <td style="padding:4px;text-align:center;color:#d50000;">${r.huelgas}</td>
                    <td style="padding:4px;text-align:center;color:#00695c;">${r.institucionales || 0}</td>
                    <td style="padding:4px;text-align:center;font-weight:700;color:${color};">${r.porcentaje}%</td>
                </tr>`;
            });

            html += `</tbody></table></div>`;
            resumenDiv.innerHTML = html;
        } catch (error) {
            resumenDiv.innerHTML = `<div class="card"><p class="error">${error.message}</p></div>`;
        }
    }
};

window.Asistencias = Asistencias;
