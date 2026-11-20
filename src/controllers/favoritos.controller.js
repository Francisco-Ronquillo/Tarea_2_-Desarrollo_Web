const HttpError = require("../utils/httpError");
const { parseId } = require("../utils/validacion");
const productos = require("../data/productos");
const favoritos = require("../data/favoritos");

async function listar(req, res) {
  
  const lista = await favoritos.listar(req.usuario.id);
  res
    .status(200)
    .json({ ok: true, data: { total: lista.length, favoritos: lista } });
}

async function agregar(req, res) {
  const productoId = parseId((req.body ?? {}).productoId);
  if (!productoId)
    throw new HttpError(
      400,
      "productoId es obligatorio y debe ser un identificador válido",
    );

  const producto = await productos.obtener(productoId);
  if (!producto) throw new HttpError(404, "Producto no encontrado");

  try {
    const { agregadoEn } = await favoritos.agregar(req.usuario.id, productoId);
    res
      .status(201)
      .json({ ok: true, data: { favorito: { ...producto, agregadoEn } } });
  } catch (err) {
    if (err.code === "23505")
      throw new HttpError(409, "El producto ya está en tus favoritos");
    if (err.code === "23503")
      throw new HttpError(404, "Producto no encontrado"); // borrado en paralelo
    throw err;
  }
}

async function quitar(req, res) {
  const productoId = parseId(req.params.productoId);
  if (!productoId)
    throw new HttpError(400, "El identificador del producto no es válido");

  const quitado = await favoritos.quitar(req.usuario.id, productoId);
  if (!quitado)
    throw new HttpError(404, "El producto no está en tus favoritos");
  res
    .status(200)
    .json({ ok: true, data: { productoId, mensaje: "Favorito eliminado" } });
}

module.exports = { listar, agregar, quitar };
