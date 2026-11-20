const pool = require("../db/pool");

async function listar(usuarioId) {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio::float8 AS precio,
            f.creado_en AS "agregadoEn"
       FROM favoritos f
       JOIN productos p ON p.id = f.producto_id
      WHERE f.usuario_id = $1
      ORDER BY f.creado_en DESC, p.id`,
    [usuarioId],
  );
  return rows;
}

async function agregar(usuarioId, productoId) {
  const { rows } = await pool.query(
    `INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2) RETURNING creado_en AS "agregadoEn"`,
    [usuarioId, productoId],
  );
  return rows[0];
}


async function quitar(usuarioId, productoId) {
  const { rowCount } = await pool.query(
    "DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2",
    [usuarioId, productoId],
  );
  return rowCount > 0;
}

module.exports = { listar, agregar, quitar };
