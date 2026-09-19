const { conexion } = require("../config/database");

class ProductosRepository {

    async obtenerTodos() {
        const { rows } = await conexion.query(`
            SELECT codigo, nombre, marca, categoria, precio, cantidad 
            FROM productos 
            ORDER BY id DESC
        `);
        return rows;
    }

    async obtenerPorCodigo(codigo) {
        const { rows } = await conexion.query(
            "SELECT codigo, nombre, marca, categoria, precio, cantidad FROM productos WHERE codigo = $1 LIMIT 1",
            [codigo]
        );
        return rows[0] || null;
    }

    async crear(producto) {
        const { codigo, nombre, marca, categoria, precio, cantidad } = producto;

        const resultado = await conexion.query(
            `
            INSERT INTO productos 
            (codigo, nombre, marca, categoria, precio, cantidad)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
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

        const resultado = await conexion.query(
            `
            UPDATE productos 
            SET 
                codigo = $1,
                nombre = $2,
                marca = $3,
                categoria = $4,
                precio = $5,
                cantidad = $6
            WHERE codigo = $7
            RETURNING *
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
        const resultado = await conexion.query(
            "DELETE FROM productos WHERE codigo = $1 RETURNING *",
            [codigo]
        );

        return resultado;
    }
}

module.exports = new ProductosRepository();