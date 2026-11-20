// Crea las tablas ejecutando sql/schema.sql (idempotente).
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

(async () => {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "..", "sql", "schema.sql"),
      "utf8",
    );
    await pool.query(sql);
    console.log("Esquema creado/verificado correctamente.");
  } catch (err) {
    console.error("Error al crear el esquema:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
