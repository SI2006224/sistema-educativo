// Preferencias visuales persistentes
const Appearance = {
    key: 'preferenciasVisuales',
    presets: [
        { nombre: 'Azul', color: '#1a237e' },
        { nombre: 'Verde', color: '#2e7d32' },
        { nombre: 'Violeta', color: '#6a1b9a' },
        { nombre: 'Turquesa', color: '#00695c' },
        { nombre: 'Bordó', color: '#ad1457' }
    ],
    preferencias: { oscuro: false, colorBotones: '#1a237e' },

    init() {
        try {
            const guardadas = JSON.parse(localStorage.getItem(this.key) || '{}');
            this.preferencias = { ...this.preferencias, ...guardadas };
        } catch (error) { /* Continúa con los valores predeterminados. */ }
        this.aplicar();
    },

    guardar() {
        localStorage.setItem(this.key, JSON.stringify(this.preferencias));
        this.aplicar();
    },

    aplicar() {
        document.documentElement.dataset.theme = this.preferencias.oscuro ? 'dark' : 'light';
        document.documentElement.style.setProperty('--button-color', this.preferencias.colorBotones);
        document.documentElement.style.setProperty('--button-hover-color', this.oscurecer(this.preferencias.colorBotones));
    },

    oscurecer(hex) {
        const n = parseInt((hex || '#1a237e').replace('#', ''), 16);
        const r = Math.max(0, (n >> 16) - 24), g = Math.max(0, ((n >> 8) & 255) - 24), b = Math.max(0, (n & 255) - 24);
        return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    },

    cambiarModoOscuro(oscuro) {
        this.preferencias.oscuro = Boolean(oscuro);
        this.guardar();
    },

    cambiarColor(color) {
        if (!/^#[0-9a-f]{6}$/i.test(color)) return;
        this.preferencias.colorBotones = color;
        this.guardar();
        this.actualizarControles();
    },

    actualizarControles() {
        const toggle = document.getElementById('apariencia-oscura');
        const color = document.getElementById('apariencia-color');
        if (toggle) toggle.checked = this.preferencias.oscuro;
        if (color) color.value = this.preferencias.colorBotones;
        document.querySelectorAll('[data-color-preset]').forEach(b => {
            b.classList.toggle('color-preset-activo', b.dataset.colorPreset === this.preferencias.colorBotones);
        });
    }
};

// Aplicación principal - Enrutador SPA
const App = {
    currentView: null,

    init() {
        console.log('App iniciada');
        Appearance.init();
        
        // Configurar listeners de navegación
        this.configurarNavegacion();

        // Determinar vista inicial
        if (Utils.estaAutenticado()) {
            this.navegar('dashboard');
        } else {
            this.mostrarLogin();
        }
    },

    configurarNavegacion() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                if (view) this.navegar(view);
            });
        });
    },

    mostrarLogin() {
        // Ocultar navegación
        document.getElementById('bottom-nav').classList.add('hidden');
        
        const app = document.getElementById('main-content');
        app.innerHTML = '';
        
        // Renderizar login
        Auth.render(app, () => this.navegar('dashboard'));
    },

    async navegar(view) {
        // Verificar autenticación
        if (!Utils.estaAutenticado()) {
            this.mostrarLogin();
            return;
        }

        // Actualizar pestaña activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Mostrar navegación
        document.getElementById('bottom-nav').classList.remove('hidden');

        const app = document.getElementById('main-content');
        app.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando...</p></div>';

        try {
            switch (view) {
                case 'dashboard':
                    await Dashboard.render(app);
                    break;
                case 'cursos':
                    await Cursos.render(app);
                    break;
                case 'estudiantes':
                    await Estudiantes.render(app);
                    break;
                case 'asistencias':
                    await Asistencias.render(app);
                    break;
                case 'notas':
                    await Notas.render(app);
                    break;
                case 'reportes':
                    await Reportes.render(app);
                    break;
                default:
                    app.innerHTML = '<div class="container"><p>Vista no encontrada</p></div>';
                case 'eventos':
                    await Eventos.render(app);
                    break;
            }
            this.currentView = view;
        } catch (error) {
            console.error('Error al navegar:', error);
            app.innerHTML = `<div class="container"><p class="error">Error: ${error.message}</p></div>`;
        }
    }
    
};

// Iniciar app cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
window.Appearance = Appearance;
