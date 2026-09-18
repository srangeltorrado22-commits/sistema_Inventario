const productosRepository = require("../repository/productos.repository");
const Producto = require("../model/productos.model");

class ProductosService {
    async listarProductos() {
        const productos = await productosRepository.obtenerTodos();
        return productos.map(p => ({
            ...p,
            precio: Number(p.precio) || 0,
            cantidad: Number(p.cantidad) || 0
        }));
    }

    async registrarProducto(datos) {
        if (!Producto.validar(datos)) {
            const error = new Error("Datos inválidos. El código, nombre, precio y cantidad son requeridos.");
            error.statusCode = 400;
            throw error;
        }

        const producto = new Producto(
            datos.codigo.toString().trim(),
            datos.nombre.toString().trim(),
            datos.marca ? datos.marca.toString().trim() : null,
            datos.categoria ? datos.categoria.toString().trim() : null,
            datos.precio,
            datos.cantidad
        );

        return await productosRepository.crear(producto);
    }

    async editarProducto(codigoAnterior, datos) {
        if (!codigoAnterior) {
            const error = new Error("El código del producto es requerido.");
            error.statusCode = 400;
            throw error;
        }

        if (!Producto.validar(datos)) {
            const error = new Error("Datos inválidos. El código, nombre, precio y cantidad son requeridos.");
            error.statusCode = 400;
            throw error;
        }

        const producto = new Producto(
            datos.codigo.toString().trim(),
            datos.nombre.toString().trim(),
            datos.marca ? datos.marca.toString().trim() : null,
            datos.categoria ? datos.categoria.toString().trim() : null,
            datos.precio,
            datos.cantidad
        );

        const resultado = await productosRepository.actualizar(codigoAnterior, producto);

        if (!resultado || resultado.affectedRows === 0) {
            const error = new Error("Producto no encontrado.");
            error.statusCode = 404;
            throw error;
        }

        return resultado;
    }

    async eliminarProducto(codigo) {
        if (!codigo) {
            const error = new Error("El código del producto es requerido.");
            error.statusCode = 400;
            throw error;
        }

        const resultado = await productosRepository.eliminar(codigo);

        if (!resultado || resultado.affectedRows === 0) {
            const error = new Error("Producto no encontrado.");
            error.statusCode = 404;
            throw error;
        }

        return resultado;
    }
}

module.exports = new ProductosService();