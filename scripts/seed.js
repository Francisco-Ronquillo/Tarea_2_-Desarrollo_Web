// Inserta productos de ejemplo (datos ficticios) solo si la tabla está vacía.
const pool = require("../src/db/pool");

const PRODUCTOS = [
  [
    "Laptop Aurora 14",
    "Portátil ligero de 14 pulgadas, 16 GB de RAM y SSD de 512 GB.",
    "Tecnología",
    749.99,
  ],
  [
    "Auriculares Brisa BT",
    "Auriculares inalámbricos con cancelación de ruido.",
    "Tecnología",
    89.5,
  ],
  [
    "Teclado Mecánico Nova",
    "Teclado mecánico compacto con retroiluminación.",
    "Tecnología",
    64.0,
  ],
  [
    "Lámpara de Escritorio Luma",
    "Lámpara LED regulable con carga inalámbrica.",
    "Hogar",
    32.9,
  ],
  [
    "Cafetera Italiana Dolce",
    "Cafetera de aluminio para 6 tazas.",
    "Hogar",
    24.75,
  ],
  [
    "Balón de Fútbol Pro",
    "Balón talla 5 para césped natural y sintético.",
    "Deportes",
    29.99,
  ],
  ["Mat de Yoga Zen", "Esterilla antideslizante de 6 mm.", "Deportes", 19.9],
  [
    'Novela "El Faro Lejano"',
    "Novela de misterio de autoría ficticia, 320 páginas.",
    "Libros",
    15.0,
  ],
  [
    "Guía de Cocina Andina",
    "Recetario ilustrado con 120 preparaciones.",
    "Libros",
    22.4,
  ],
];

(async () => {
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS n FROM productos",
    );
    if (rows[0].n > 0) {
      console.log(`Ya existen ${rows[0].n} productos; no se insertó nada.`);
      return;
    }
    for (const p of PRODUCTOS) {
      await pool.query(
        "INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES ($1, $2, $3, $4)",
        p,
      );
    }
    console.log(`Se insertaron ${PRODUCTOS.length} productos de ejemplo.`);
  } catch (err) {
    console.error("Error al sembrar datos:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
