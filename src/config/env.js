require("dotenv").config();

const faltantes = ["DATABASE_URL", "JWT_SECRET"].filter((k) => !process.env[k]);
if (faltantes.length) {
  console.error(
    `Faltan variables de entorno: ${faltantes.join(", ")}. Revisa tu archivo .env`,
  );
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET debe tener al menos 32 caracteres.");
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  dbSsl: process.env.DB_SSL === "true",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};
