// Crea (o promueve) el administrador usando ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD del .env.
// Es el ÚNICO camino para obtener el rol administrador; el registro público no lo permite.
const bcrypt = require("bcryptjs");
const config = require("../src/config/env");
const pool = require("../src/db/pool");
const { EMAIL_RE } = require("../src/utils/validacion");

(async () => {
  try {
    const nombre = (process.env.ADMIN_NOMBRE || "Administrador").trim();
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";

    if (!EMAIL_RE.test(email))
      throw new Error("ADMIN_EMAIL no es válido o no está definido en .env");
    if (password.length < 12)
      throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres");

    const hash = await bcrypt.hash(password, config.bcryptRounds);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, 'administrador')
       ON CONFLICT (email) DO UPDATE
         SET nombre = EXCLUDED.nombre, password_hash = EXCLUDED.password_hash, rol = 'administrador'`,
      [nombre, email, hash],
    );
    console.log(`Administrador listo: ${email}`);
  } catch (err) {
    console.error("Error al crear el administrador:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
