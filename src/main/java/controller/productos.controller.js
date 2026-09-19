const productosService = require("../service/productos.service");

class ProductosController {

    // GET - listar productos
    obtenerTodos = async (req, res) => {
        try {
            const productos = await productosService.listarProductos();
            res.json(productos || []);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(error.statusCode || 500).json({ 
                mensaje: error.message || "Error al obtener productos" 
            });
        }
    };

    // POST - crear producto
    crear = async (req, res) => {
        try {
            await productosService.registrarProducto(req.body);
            res.status(201).json({ mensaje: "Producto creado correctamente" });
        } catch (error) {
            console.error("Error al crear producto:", error);

            if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ mensaje: "El código de producto ya existe" });
            }

            res.status(error.statusCode || 500).json({ 
                mensaje: error.message || "Error al crear producto" 
            });
        }
    };

    // PUT - actualizar producto
    actualizar = async (req, res) => {
        try {
            const { codigo } = req.params;
            const resultado = await productosService.editarProducto(codigo, req.body);

            res.json({ mensaje: "Producto actualizado correctamente", resultado });
        } catch (error) {
            console.error("Error al actualizar producto:", error);

            if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ mensaje: "El nuevo código de producto ya está asignado a otro artículo" });
            }

            res.status(error.statusCode || 500).json({ 
                mensaje: error.message || "Error al actualizar producto" 
            });
        }
    };

    // DELETE - eliminar producto
    eliminar = async (req, res) => {
        try {
            const { codigo } = req.params;
            await productosService.eliminarProducto(codigo);

            res.json({ mensaje: "Producto eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            res.status(error.statusCode || 500).json({ 
                mensaje: error.message || "Error al eliminar producto" 
            });
        }
    };
}

module.exports = new ProductosController();