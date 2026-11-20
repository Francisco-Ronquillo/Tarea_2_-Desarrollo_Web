-- Esquema de la base de datos (PostgreSQL). Es idempotente.
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                CHECK (rol IN ('usuario', 'administrador')),
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150)  NOT NULL,
  descripcion TEXT          NOT NULL,
  categoria   VARCHAR(80)   NOT NULL,
  precio      NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  creado_en   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (LOWER(categoria));

-- Un favorito relaciona usuario y producto; la PK compuesta impide duplicados.
-- ON DELETE CASCADE: al eliminar un producto (o usuario) se eliminan sus favoritos.
CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  producto_id INTEGER     NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, producto_id)
);
