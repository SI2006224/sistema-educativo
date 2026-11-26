// Componente de Autenticación
const Auth = {
    render(container, onLoginSuccess) {
        container.innerHTML = `
            <div class="container">
                <div style="text-align:center;margin:40px 0 24px;">
                    <h1 style="font-size:2rem;">📚</h1>
                    <h1>Sistema Educativo</h1>
                    <p style="color:#777;">Gestión de Asistencias y Notas</p>
                </div>

                <div class="card">
                    <h2>Iniciar Sesión</h2>
                    <form id="login-form">
                        <label>Usuario</label>
                        <input type="text" id="nombre_usuario" required autocomplete="username" placeholder="admin">
                        
                        <label>Contraseña</label>
                        <input type="password" id="password" required autocomplete="current-password" placeholder="••••••••">
                        
                        <button type="submit" class="btn btn-block">Ingresar</button>
                    </form>
                    <div id="login-error" class="error"></div>
                </div>

                <div class="card" style="background:#e8eaf6;">
                    <p style="font-size:0.85rem;color:#555;">
                        <strong>Credenciales de prueba:</strong><br>
                        Usuario: <code>admin</code> / Contraseña: <code>admin123</code><br>
                        Usuario: <code>profesor</code> / Contraseña: <code>profesor123</code>
                    </p>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('login-error');
            errorDiv.textContent = '';

            const usuario = document.getElementById('nombre_usuario').value.trim();
            const password = document.getElementById('password').value;

            if (!usuario || !password) {
                errorDiv.textContent = 'Complete todos los campos';
                return;
            }

            try {
                const res = await API.login(usuario, password);
                Utils.guardarToken(res.token);
                Utils.guardarUsuario(res.usuario);
                Utils.toast('Bienvenido ' + res.usuario.nombre_completo, 'success');
                if (onLoginSuccess) onLoginSuccess();
            } catch (error) {
                errorDiv.textContent = error.message;
            }
        });
    }
};

window.Auth = Auth;