const pool = require("../db/pool");

const COLUMNAS_PUBLICAS = "id, nombre, email, rol";

async function crear({ nombre, email, passwordHash }) {

  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, 'usuario')
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, email, passwordHash],
  );
  return rows[0];
}

async function buscarPorEmail(email) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS}, password_hash FROM usuarios WHERE email = $1`,
    [email],
  );
  return rows[0] || null;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

module.exports = { crear, buscarPorEmail, buscarPorId };
