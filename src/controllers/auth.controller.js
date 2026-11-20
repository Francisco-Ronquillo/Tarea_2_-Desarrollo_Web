const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const HttpError = require("../utils/httpError");
const { EMAIL_RE, textoNoVacio } = require("../utils/validacion");
const usuarios = require("../data/usuarios");

const HASH_FALSO = bcrypt.hashSync("contrasena-falsa", config.bcryptRounds);

async function registro(req, res) {
  const body = req.body ?? {};
  const faltantes = ["nombre", "email", "password"].filter(
    (c) => !textoNoVacio(body[c]),
  );
  if (faltantes.length) {
    throw new HttpError(400, "Faltan campos obligatorios o están vacíos", {
      campos: faltantes,
    });
  }

  const email = body.email.trim().toLowerCase();
  const errores = [];
  if (!EMAIL_RE.test(email) || email.length > 150)
    errores.push("email no tiene un formato válido");
  if (body.password.length < 8 || body.password.length > 72) {
    errores.push("password debe tener entre 8 y 72 caracteres");
  }
  if (body.nombre.trim().length > 100)
    errores.push("nombre admite como máximo 100 caracteres");
  if (errores.length)
    throw new HttpError(422, "Datos de registro inválidos", { errores });

  const passwordHash = await bcrypt.hash(body.password, config.bcryptRounds);
  try {
    
    const usuario = await usuarios.crear({
      nombre: body.nombre.trim(),
      email,
      passwordHash,
    });
    res.status(201).json({ ok: true, data: { usuario } });
  } catch (err) {
    if (err.code === "23505")
      throw new HttpError(409, "El correo ya está registrado");
    throw err;
  }
}

async function login(req, res) {
  const body = req.body ?? {};
  if (!textoNoVacio(body.email) || !textoNoVacio(body.password)) {
    throw new HttpError(400, "email y password son obligatorios");
  }

  const fila = await usuarios.buscarPorEmail(body.email.trim().toLowerCase());
  const coincide = await bcrypt.compare(
    body.password,
    fila ? fila.password_hash : HASH_FALSO,
  );
  if (!fila || !coincide) throw new HttpError(401, "Credenciales incorrectas");

  const token = jwt.sign({ rol: fila.rol }, config.jwtSecret, {
    algorithm: "HS256",
    subject: String(fila.id),
    expiresIn: config.jwtExpiresIn,
  });
  const { password_hash: _omitido, ...usuario } = fila;
  res.status(200).json({
    ok: true,
    data: { token, tipo: "Bearer", expiraEn: config.jwtExpiresIn, usuario },
  });
}

module.exports = { registro, login };
