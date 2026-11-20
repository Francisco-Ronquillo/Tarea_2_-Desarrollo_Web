const router = require("express").Router();
const { autenticar } = require("../middleware/auth");
const c = require("../controllers/favoritos.controller");

router.use(autenticar);
router.get("/", c.listar);
router.post("/", c.agregar);
router.delete("/:productoId", c.quitar);

module.exports = router;
