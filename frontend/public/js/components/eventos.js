// Componente de Eventos Especiales
const Eventos = {
    eventos: [],

    async render(container) {
        const usuario = Utils.obtenerUsuario();
        const esProfesor = usuario?.rol === 'profesor' || usuario?.rol === 'administrador';

        container.innerHTML = `
            <div class="container">
                <div class="flex-between mb-16">
                    <h1 style="margin:0;">Eventos Especiales</h1>
                    ${esProfesor ? '<button class="btn btn-sm" onclick="Eventos.crear()">+ Nuevo</button>' : ''}
                </div>

                <div class="card" style="padding:8px;">
                    <p style="font-size:0.8rem;color:#777;">
                        Los eventos afectan el cálculo de asistencias. Los días marcados como "afecta asistencia" no cuentan como ausencia.
                    </p>
                </div>

                <div id="eventos-lista" class="card">
                    <div class="loading"><div class="spinner"></div></div>
                </div>
            </div>
        `;

        await this.cargarLista();
    },

    async cargarLista() {
        const lista = document.getElementById('eventos-lista');
        try {
            const eventos = await API.obtenerEventos();
            this.eventos = eventos;

            if (eventos.length === 0) {
                lista.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">📅</div>
                        <p>No hay eventos registrados</p>
                    </div>
                `;
                return;
            }

            const tipoIcono = {
                'feriado': '🎉',
                'paro': '✊',
                'institucional': '🏫',
                'vacaciones': '🏖️',
                'otro': '📌'
            };

            lista.innerHTML = eventos.map(e => `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${tipoIcono[e.tipo] || '📌'} ${Utils.fechaISOaArg(e.fecha)} — ${e.tipo}</div>
                        <div class="list-item-subtitle">
                            ${e.descripcion || 'Sin descripción'}
                            ${e.afecta_asistencia ? ' ✅ Afecta asistencia' : ' ❌ No afecta'}
                        </div>
                    </div>
                    <div class="flex gap-8">
                        <button class="btn btn-sm btn-secondary" onclick="Eventos.editar(${e.id})">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="Eventos.eliminar(${e.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            lista.innerHTML = `<p class="error">${error.message}</p>`;
        }
    },

    async crear() {
        const fecha = prompt('Fecha (DD/MM/YYYY):', Utils.fechaISOaArg(new Date().toISOString().split('T')[0]));
        if (!fecha) return;
        const fechaISO = Utils.fechaArgAISO(fecha);
        if (!fechaISO) {
            Utils.toast('Formato de fecha inválido', 'error');
            return;
        }

        const tipo = prompt('Tipo (feriado/paro/institucional/vacaciones/otro):', 'feriado');
        if (!tipo) return;
        if (!['feriado', 'paro', 'institucional', 'vacaciones', 'otro'].includes(tipo)) {
            Utils.toast('Tipo inválido', 'error');
            return;
        }

        const descripcion = prompt('Descripción (opcional):') || '';
        const afecta = confirm('¿Afecta la asistencia? (Aceptar = Sí, Cancelar = No)');

        try {
            await API.crearEvento({
                fecha: fechaISO,
                tipo,
                descripcion: descripcion.trim(),
                afecta_asistencia: afecta
            });
            Utils.toast('Evento creado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async editar(id) {
        try {
            const e = this.eventos.find(ev => ev.id === id);
            if (!e) return;

            const nuevaFecha = prompt('Fecha (DD/MM/YYYY):', Utils.fechaISOaArg(e.fecha));
            if (nuevaFecha === null) return;
            const nuevaFechaISO = Utils.fechaArgAISO(nuevaFecha);
            if (!nuevaFechaISO) {
                Utils.toast('Formato de fecha inválido', 'error');
                return;
            }

            const nuevoTipo = prompt('Tipo (feriado/paro/institucional/vacaciones/otro):', e.tipo);
            if (nuevoTipo === null) return;
            const nuevaDesc = prompt('Descripción:', e.descripcion || '');
            if (nuevaDesc === null) return;
            const nuevaAfecta = confirm('¿Afecta la asistencia?');

            await API.actualizarEvento(id, {
                fecha: nuevaFechaISO,
                tipo: nuevoTipo,
                descripcion: nuevaDesc.trim(),
                afecta_asistencia: nuevaAfecta
            });
            Utils.toast('Evento actualizado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    async eliminar(id) {
        if (!confirm('¿Está seguro de eliminar este evento?')) return;
        try {
            await API.eliminarEvento(id);
            Utils.toast('Evento eliminado', 'success');
            await this.cargarLista();
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    }
};

window.Eventos = Eventos;