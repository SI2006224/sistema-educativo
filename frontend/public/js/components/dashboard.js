// Componente de Dashboard
const Dashboard = {
    async render(container) {
        const usuario = Utils.obtenerUsuario();
        
        container.innerHTML = `
            <div class="container">
                <div class="flex-between mb-16">
                    <div>
                        <h1 style="margin:0;">Hola, ${usuario?.nombre_completo?.split(' ')[0] || 'Usuario'}</h1>
                        <p style="color:#777;font-size:0.9rem;">${usuario?.rol === 'administrador' ? 'Administrador' : 'Profesor'}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="Utils.cerrarSesion()">Salir</button>
                </div>

                <div class="grid grid-2 mb-16">
                    <div class="card" style="text-align:center;">
                        <div style="font-size:2rem;">📚</div>
                        <h3 id="stat-cursos">-</h3>
                        <p style="color:#777;font-size:0.85rem;">Cursos</p>
                    </div>
                    <div class="card" style="text-align:center;">
                        <div style="font-size:2rem;">👥</div>
                        <h3 id="stat-estudiantes">-</h3>
                        <p style="color:#777;font-size:0.85rem;">Estudiantes</p>
                    </div>
                </div>

                <div class="card" id="apariencia-panel">
                    <h2>Personalizar apariencia</h2>
                    <label class="appearance-toggle">
                        <span>Modo oscuro</span>
                        <input type="checkbox" id="apariencia-oscura" onchange="Appearance.cambiarModoOscuro(this.checked)">
                    </label>
                    <label>Color de los botones</label>
                    <div class="color-presets">
                        ${Appearance.presets.map(p => `<button type="button" class="color-preset" data-color-preset="${p.color}" title="${p.nombre}" aria-label="Color ${p.nombre}" style="--preset-color:${p.color}" onclick="Appearance.cambiarColor('${p.color}')"></button>`).join('')}
                        <label class="color-custom" title="Elegir otro color">
                            <span>Personalizado</span>
                            <input type="color" id="apariencia-color" aria-label="Elegir color personalizado" onchange="Appearance.cambiarColor(this.value)">
                        </label>
                    </div>
                    <small class="appearance-help">Los cambios se guardan automáticamente y se aplican en todas las pantallas.</small>
                </div>

                <div class="card">
                    <h2>Accesos rápidos</h2>
                    <div class="grid grid-2">
                        <button class="btn" onclick="App.navegar('asistencias')">✅ Asistencias</button>
                        <button class="btn" onclick="App.navegar('notas')">📝 Notas</button>
                        <button class="btn" onclick="App.navegar('estudiantes')">👥 Alumnos</button>
                        <button class="btn" onclick="App.navegar('reportes')">📄 Reportes</button>
                    </div>
                </div>

                <div class="card">
                    <h2>Últimos cursos</h2>
                    <div id="dashboard-cursos">Cargando...</div>
                </div>
            </div>
        `;

        Appearance.actualizarControles();

        // Cargar estadísticas
        try {
            const cursos = await API.obtenerCursos();
            document.getElementById('stat-cursos').textContent = cursos.length;
            
            const listaCursos = document.getElementById('dashboard-cursos');
            if (cursos.length === 0) {
                listaCursos.innerHTML = '<p style="color:#777;">No hay cursos creados</p>';
            } else {
                listaCursos.innerHTML = cursos.slice(0, 3).map(c => `
                    <div class="list-item" onclick="App.navegar('cursos')">
                        <div class="list-item-content">
                            <div class="list-item-title">${c.nombre_completo}</div>
                            <div class="list-item-subtitle">${c.descripcion || 'Sin descripción'}</div>
                        </div>
                    </div>
                `).join('');
            }

            // Contar estudiantes (si es admin)
            if (usuario?.rol === 'administrador') {
                const estudiantes = await API.obtenerEstudiantes();
                document.getElementById('stat-estudiantes').textContent = estudiantes.length;
            } else {
                document.getElementById('stat-estudiantes').textContent = '—';
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        }
    }
};

window.Dashboard = Dashboard;
