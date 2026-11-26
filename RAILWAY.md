# Preparar el sistema educativo para Railway

El backend conserva SQLite para desarrollo local. Si Railway inyecta `DATABASE_URL`, usa PostgreSQL. La aplicación usa migraciones de Sequelize para crear el esquema.

## Crear servicios en Railway

1. En el proyecto de Railway, agrega un servicio PostgreSQL.
2. Conecta el repositorio de GitHub como servicio desde el directorio raíz `/`; no uses `/backend`, porque el servidor Express también necesita `frontend/public`.
3. En Variables, agrega una referencia a `DATABASE_URL` del servicio PostgreSQL, `NODE_ENV=production` y un `JWT_SECRET` aleatorio y privado de al menos 32 caracteres.
4. Configura el comando de compilación como `npm run build`, el comando previo al despliegue como `npm run migrate:prod` y el comando de inicio como `npm start`. El `package.json` raíz llama a los comandos del backend y conserva el acceso a la carpeta frontend.
5. En la configuración de red del servicio del backend, genera el dominio HTTPS público.

## Copiar los datos existentes de SQLite

La importación conserva IDs y relaciones y se detiene si las tablas destino ya contienen registros. No subas `data/database.sqlite` a GitHub.

1. Haz un respaldo privado de `data/database.sqlite`.
2. Despliega PostgreSQL y el backend en Railway primero, con las migraciones configuradas.
3. Para conectar temporalmente tu PC a PostgreSQL sin dejar la base abierta a internet, instala e inicia sesión en Railway CLI, vincula el proyecto y abre un túnel SSH para el servicio PostgreSQL:

   ```bash
   railway connect --tunnel-only
   ```

4. Deja el túnel abierto. En otra terminal, agrega la dirección local y las credenciales que Railway CLI mostró en `backend/.env` como `DATABASE_IMPORT_URL`. Ese archivo está excluido de Git.
5. Desde `backend`, ejecuta `npm run import:sqlite`. El importador solo imprime cantidades de registros, no los datos de estudiantes.
6. Al terminar, quita `DATABASE_IMPORT_URL` del archivo `.env` local y cierra el túnel. No publiques ni compartas la URL o la contraseña.
7. Abre el dominio del backend y confirma el inicio de sesión y los registros antes de usarlo con más personas.

## Usuarios iniciales

La importación traslada las cuentas existentes, así que no ejecutes el seeder encima de esa base. Si alguna vez inicializas una base vacía, configura `INITIAL_ADMIN_PASSWORD` e `INITIAL_PROFESOR_PASSWORD` como variables privadas antes de ejecutar `npm run seed`.

## Respaldos

El backup por copia de archivo del proyecto solo se activa con SQLite. Para PostgreSQL, habilita y revisa los respaldos del servicio de base de datos en Railway.
