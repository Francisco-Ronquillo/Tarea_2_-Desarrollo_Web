const router = require("express").Router();
const { autenticar, requiereRol } = require("../middleware/auth");
const c = require("../controllers/productos.controller");

const soloAdmin = [autenticar, requiereRol("administrador")];

router.get("/", c.listar);
router.get("/:id", c.obtener);
router.post("/", soloAdmin, c.crear);
router.put("/:id", soloAdmin, c.actualizar);
router.delete("/:id", soloAdmin, c.eliminar);

module.exports = router;
