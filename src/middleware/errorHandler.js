const HttpError = require("../utils/httpError");

function noEncontrado(req, res) {
  res.status(404).json({ ok: false, error: { mensaje: "Ruta no encontrada" } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      ok: false,
      error: {
        mensaje: err.message,
        ...(err.detalles && { detalles: err.detalles }),
      },
    });
  }
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ ok: false, error: { mensaje: "JSON malformado" } });
  }
  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({
        ok: false,
        error: { mensaje: "Cuerpo de la petición demasiado grande" },
      });
  }
  console.error("[error]", err.message); // el detalle interno solo va al log
  res
    .status(500)
    .json({ ok: false, error: { mensaje: "Error interno del servidor" } });
}

module.exports = { noEncontrado, errorHandler };
