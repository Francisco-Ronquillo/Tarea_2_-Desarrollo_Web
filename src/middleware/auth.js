const jwt = require("jsonwebtoken");
const config = require("../config/env");
const HttpError = require("../utils/httpError");
const { parseId } = require("../utils/validacion");
const usuarios = require("../data/usuarios");


async function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization || "").split(" ");
  if (esquema !== "Bearer" || !token)
    throw new HttpError(401, "Se requiere autenticación");

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch (err) {
    throw new HttpError(
      401,
      err.name === "TokenExpiredError"
        ? "El token ha expirado"
        : "Token inválido",
    );
  }

  const id = parseId(payload.sub);
  const usuario = id ? await usuarios.buscarPorId(id) : null;
  if (!usuario) throw new HttpError(401, "Token inválido");

  req.usuario = { id: usuario.id, rol: usuario.rol };
  next();
}

const requiereRol = (rol) => (req, res, next) => {
  if (req.usuario.rol !== rol)
    throw new HttpError(403, "No tienes permisos para esta operación");
  next();
};

module.exports = { autenticar, requiereRol };
