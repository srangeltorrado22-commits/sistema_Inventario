const express = require("express");
const router = express.Router();
const productosController = require("../controller/productos.controller");

// GET /api/productos - Obtener todos los productos
router.get("/", productosController.obtenerTodos);

// POST /api/productos - Crear un nuevo producto
router.post("/", productosController.crear);

// PUT /api/productos/:codigo - Actualizar un producto por su código
router.put("/:codigo", productosController.actualizar);

// DELETE /api/productos/:codigo - Eliminar un producto por su código
router.delete("/:codigo", productosController.eliminar);

module.exports = router;