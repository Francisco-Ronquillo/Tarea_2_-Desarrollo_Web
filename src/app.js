const express = require("express");
const { noEncontrado, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

app.get("/api/salud", (req, res) =>
  res.status(200).json({ ok: true, data: { estado: "activo" } }),
);
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/favoritos", require("./routes/favoritos.routes"));

app.use(noEncontrado);
app.use(errorHandler);

module.exports = app;
