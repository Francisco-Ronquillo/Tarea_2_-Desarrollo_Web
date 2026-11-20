const config = require('./config/env');
const pool = require('./db/pool');
const app = require('./app');

async function iniciar() {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  }
  const servidor = app.listen(config.port, () => {
    console.log(`API escuchando en http://localhost:${config.port}/api`);
  });
  const cerrar = () => servidor.close(() => pool.end().then(() => process.exit(0)));
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

iniciar();