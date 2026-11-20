const HttpError = require("../utils/httpError");
const { parseId, validarProducto } = require("../utils/validacion");
const productos = require("../data/productos");

function idDeRuta(req) {
  const id = parseId(req.params.id);
  if (!id)
    throw new HttpError(400, "El identificador del producto no es válido");
  return id;
}

async function listar(req, res) {
  const categoria =
    typeof req.query.categoria === "string" && req.query.categoria.trim()
      ? req.query.categoria.trim()
      : null;
  const lista = await productos.listar(categoria);
  res
    .status(200)
    .json({ ok: true, data: { total: lista.length, productos: lista } });
}

async function obtener(req, res) {
  const producto = await productos.obtener(idDeRuta(req));
  if (!producto) throw new HttpError(404, "Producto no encontrado");
  res.status(200).json({ ok: true, data: { producto } });
}

async function crear(req, res) {
  const datos = validarProducto(req.body ?? {});
  const producto = await productos.crear(datos);
  res.status(201).json({ ok: true, data: { producto } });
}

async function actualizar(req, res) {
  const id = idDeRuta(req);
  const datos = validarProducto(req.body ?? {});
  const producto = await productos.actualizar(id, datos);
  if (!producto) throw new HttpError(404, "Producto no encontrado");
  res.status(200).json({ ok: true, data: { producto } });
}

async function eliminar(req, res) {
  const id = idDeRuta(req);
  // Sus favoritos se eliminan en cascada (ON DELETE CASCADE en la tabla favoritos).
  const eliminado = await productos.eliminar(id);
  if (!eliminado) throw new HttpError(404, "Producto no encontrado");
  res
    .status(200)
    .json({ ok: true, data: { id, mensaje: "Producto eliminado" } });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
