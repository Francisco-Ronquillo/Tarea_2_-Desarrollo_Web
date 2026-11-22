# Catálogo de productos con favoritos y acceso por roles

API REST con **Node.js + Express + PostgreSQL** que gestiona un catálogo de productos y los favoritos personales de cada usuario, con autenticación **JWT** y autorización por roles.

## Integrantes
Francisco Ronquillo
## Propósito

Permitir que cualquiera consulte el catálogo, que solo el **administrador** lo modifique y que cada **usuario** autenticado administre únicamente sus propios favoritos.

## Elección de base de datos: PostgreSQL (con `pg`)

- Los datos son **relacionales** (usuarios ↔ favoritos ↔ productos) y se benefician de claves foráneas.
- Las restricciones se garantizan en la base: `UNIQUE` en el correo, `CHECK (precio > 0)`, clave primaria compuesta `(usuario_id, producto_id)` que **impide favoritos duplicados**.
- `ON DELETE CASCADE` mantiene la consistencia sin lógica extra en el código.
- Se usan **consultas parametrizadas** (`$1, $2…`) en toda la capa de datos, lo que evita inyección SQL.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 13 o superior
- Postman (o Newman, incluido como dependencia de desarrollo)

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd catalogo-api
npm install
cp .env.example .env      # y completa los valores (ver tabla)
```

Crea la base de datos vacía (una sola vez):

```bash
createdb catalogo          # o: psql -U postgres -c "CREATE DATABASE catalogo;"
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DATABASE_URL` | Cadena de conexión, p. ej. `postgresql://usuario:clave@localhost:5432/catalogo` |
| `DB_SSL` | `true` si el proveedor exige SSL |
| `JWT_SECRET` | Secreto de firma, **mínimo 32 caracteres**. Genera uno con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Vigencia del token (por defecto `1h`) |
| `BCRYPT_ROUNDS` | Costo de bcrypt (por defecto 10) |
| `ADMIN_NOMBRE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Datos del administrador (solo los usa `npm run admin:create`; contraseña de 12+ caracteres) |

## Inicialización de datos y del administrador

```bash
npm run db:init        # crea tablas (sql/schema.sql)
npm run db:seed        # inserta 9 productos ficticios (solo si la tabla está vacía)
npm run admin:create   # crea/promueve al administrador con los datos de .env
```

El rol `administrador` **solo** se obtiene con este procedimiento local. El registro público (`POST /api/auth/registro`) siempre crea usuarios con rol `usuario` e ignora cualquier campo `rol` enviado.

## Ejecución

```bash
npm start        # producción
npm run dev      # recarga automática (node --watch)
```

Comprobación: `GET http://localhost:3000/api/salud`.

## Estructura del proyecto

```
src/
  app.js, server.js        # Express y arranque
  config/env.js            # variables de entorno validadas
  db/pool.js               # pool de pg
  routes/                  # definición de rutas y middleware aplicado
  controllers/             # validación y lógica de cada endpoint
  data/                    # acceso a datos (SQL parametrizado)
  middleware/              # autenticar (JWT), requiereRol, manejo de errores
  utils/                   # validaciones y HttpError
sql/schema.sql             # script SQL del esquema
scripts/                   # initDb, seed, crearAdmin
postman/                   # colección y entorno de ejemplo
docs/tabla_pruebas.md      # plantilla de la tabla de pruebas
```

## Rutas (prefijo `/api`)

| Método y ruta | Acceso | Cuerpo | Respuestas |
|---|---|---|---|
| `POST /auth/registro` | Público | `{nombre, email, password}` | 201, 400, 409, 422 |
| `POST /auth/login` | Público | `{email, password}` | 200 (token), 400, 401 |
| `GET /productos?categoria=` | Público | — | 200 |
| `GET /productos/:id` | Público | — | 200, 400, 404 |
| `POST /productos` | Administrador | `{nombre, descripcion, categoria, precio}` | 201, 400, 401, 403, 422 |
| `PUT /productos/:id` | Administrador | igual que POST (reemplazo completo) | 200, 400, 401, 403, 404, 422 |
| `DELETE /productos/:id` | Administrador | — | 200, 400, 401, 403, 404 |
| `GET /favoritos` | Autenticado | — | 200, 401 |
| `POST /favoritos` | Autenticado | `{productoId}` | 201, 400, 401, 404, 409 |
| `DELETE /favoritos/:productoId` | Autenticado | — | 200, 400, 401, 404 |

Rutas protegidas: encabezado `Authorization: Bearer <token>`.

**Formato de respuesta.** Éxito: `{ "ok": true, "data": { ... } }`. Error: `{ "ok": false, "error": { "mensaje": "...", "detalles": { ... } } }`.

**Criterio de estados HTTP.**
- `200` consultas, actualizaciones y eliminaciones; `201` creaciones.
- `400`: falta un campo obligatorio, viene vacío, o un identificador está mal formado, o el JSON es inválido.
- `422`: el dato llega completo pero su valor no es válido (precio ≤ 0 o con más de 2 decimales, correo con formato inválido, contraseña corta, longitudes).
- `401`: sin token, token inválido o vencido, o credenciales incorrectas. `403`: autenticado pero sin el rol requerido.
- `404`: recurso inexistente (incluye quitar un favorito que no es tuyo, para no revelar datos ajenos). `409`: correo o favorito duplicado.

## Decisiones de diseño

- **Favoritos al eliminar un producto:** se eliminan en cascada (`ON DELETE CASCADE`), por lo que no quedan referencias huérfanas.
- **Identidad:** `req.usuario` se obtiene del JWT verificado (firma HS256 y expiración) y el rol se lee de la base en cada petición. Ningún endpoint acepta un `usuarioId` del cliente.
- **Propiedad:** las consultas de favoritos filtran siempre por `usuario_id = req.usuario.id`.
- **Contraseñas:** hash con bcrypt; nunca se devuelven. El login responde igual si falla el correo o la contraseña.
- **Errores internos:** el cliente solo recibe un mensaje genérico; el detalle va al log del servidor.

## Pruebas (Postman / Newman)

1. Con el servidor en marcha, importa `postman/Catalogo.postman_collection.json` y `postman/Catalogo.postman_environment.json`.
2. En el entorno completa (solo en tu equipo, no los subas): `admin_password` (el de `ADMIN_PASSWORD`) y `jwt_secret` (el `JWT_SECRET` del servidor; se usa únicamente para fabricar un token vencido en las pruebas 401).
3. Ejecuta las carpetas **1 a 7** con el Collection Runner.
4. **Reinicia Node.js** (`Ctrl+C` y `npm start`) y ejecuta la carpeta **8** para evidenciar la persistencia.

Por línea de comandos (corre las 8 carpetas seguidas):

```bash
npm run test:newman -- --env-var admin_password=TU_CLAVE_ADMIN --env-var jwt_secret=TU_JWT_SECRET
```

Las pruebas crean usuarios nuevos con correos únicos, por lo que se pueden repetir. Cubren: registro/login, duplicados, CRUD y filtro, validaciones, 401/403, favoritos (201/409/404), aislamiento entre A y B, cascada y persistencia.

Alternativa para el token vencido sin `jwt_secret`: arranca con `JWT_EXPIRES_IN=5s`, inicia sesión y espera 6 segundos antes de usar el token.

## Seguridad y exclusiones

`.gitignore` excluye `node_modules/`, `.env` y registros. No se versionan credenciales, tokens vigentes ni datos reales; todos los datos son ficticios.

## Recursos de apoyo

Documentación de Express, node-postgres (`pg`), `jsonwebtoken`, `bcryptjs` y Postman. _(Si usaron asistentes de IA u otras herramientas, cítenlas aquí y expliquen el código incorporado.)_
