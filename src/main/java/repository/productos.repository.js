const { conexion } = require("../config/database");

class ProductosRepository {

    async obtenerTodos() {
        const [productos] = await conexion.execute(`
            SELECT codigo, nombre, marca, categoria, precio, cantidad 
            FROM productos 
            ORDER BY id DESC
        `);
        return productos;
    }

    async obtenerPorCodigo(codigo) {
        const [productos] = await conexion.execute(
            "SELECT codigo, nombre, marca, categoria, precio, cantidad FROM productos WHERE codigo = ? LIMIT 1",
            [codigo]
        );
        return productos[0] || null;
    }

    async crear(producto) {
        const { codigo, nombre, marca, categoria, precio, cantidad } = producto;

        const [resultado] = await conexion.execute(
            `
            INSERT INTO productos 
            (codigo, nombre, marca, categoria, precio, cantidad)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                codigo,
                nombre,
                marca !== undefined && marca !== null ? marca : null,
                categoria !== undefined && categoria !== null ? categoria : null,
                Number(precio) || 0,
                Number(cantidad) || 0
            ]
        );

        return resultado;
    }

    async actualizar(codigoAnterior, producto) {
        const { codigo, nombre, marca, categoria, precio, cantidad } = producto;

        const [resultado] = await conexion.execute(
            `
            UPDATE productos 
            SET 
                codigo = ?,
                nombre = ?,
                marca = ?,
                categoria = ?,
                precio = ?,
                cantidad = ?
            WHERE codigo = ?
            `,
            [
                codigo,
                nombre,
                marca !== undefined && marca !== null ? marca : null,
                categoria !== undefined && categoria !== null ? categoria : null,
                Number(precio) || 0,
                Number(cantidad) || 0,
                codigoAnterior
            ]
        );

        return resultado;
    }

    async eliminar(codigo) {
        const [resultado] = await conexion.execute(
            "DELETE FROM productos WHERE codigo = ?",
            [codigo]
        );

        return resultado;
    }
}

module.exports = new ProductosRepository();