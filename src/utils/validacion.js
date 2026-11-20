const HttpError = require("./httpError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const textoNoVacio = (v) => typeof v === "string" && v.trim().length > 0;


function parseId(valor) {
  const s = String(valor ?? "");
  if (!/^[1-9]\d{0,9}$/.test(s)) return null;
  const n = Number(s);
  return n <= 2147483647 ? n : null;
}


function validarProducto(body) {
  const faltantes = ["nombre", "descripcion", "categoria"].filter(
    (c) => !textoNoVacio(body[c]),
  );
  if (body.precio === undefined || body.precio === null || body.precio === "")
    faltantes.push("precio");
  if (faltantes.length) {
    throw new HttpError(400, "Faltan campos obligatorios o están vacíos", {
      campos: faltantes,
    });
  }

  const errores = [];
  const { precio } = body;
  if (typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0) {
    errores.push("precio debe ser un número mayor que cero");
  } else if (Math.abs(precio * 100 - Math.round(precio * 100)) > 1e-6) {
    errores.push("precio admite como máximo 2 decimales");
  } else if (precio >= 1e8) {
    errores.push("precio excede el máximo permitido");
  }
  if (body.nombre.trim().length > 150)
    errores.push("nombre admite como máximo 150 caracteres");
  if (body.categoria.trim().length > 80)
    errores.push("categoria admite como máximo 80 caracteres");
  if (errores.length)
    throw new HttpError(422, "Datos de producto inválidos", { errores });

  return {
    nombre: body.nombre.trim(),
    descripcion: body.descripcion.trim(),
    categoria: body.categoria.trim(),
    precio,
  };
}

module.exports = { EMAIL_RE, textoNoVacio, parseId, validarProducto };
