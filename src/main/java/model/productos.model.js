class Producto {
    constructor(codigo, nombre, marca, categoria, precio, cantidad) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.marca = marca || null;
        this.categoria = categoria || null;
        this.precio = Number(precio) || 0;
        this.cantidad = Number(cantidad) || 0;
    }

    get valorTotal() {
        return this.precio * this.cantidad;
    }

    get estado() {
        return this.cantidad > 0 ? "Disponible" : "Agotado";
    }

    static validar(datos) {
        if (!datos || typeof datos !== "object") return false;
        const { codigo, nombre, precio, cantidad } = datos;

        // Validar que codigo y nombre no sean nulos ni cadenas vacías
        if (!codigo || !codigo.toString().trim()) return false;
        if (!nombre || !nombre.toString().trim()) return false;

        // Validar que precio y cantidad sean numéricos y no negativos
        const numPrecio = Number(precio);
        const numCantidad = Number(cantidad);

        if (isNaN(numPrecio) || numPrecio < 0) return false;
        if (isNaN(numCantidad) || numCantidad < 0) return false;

        return true;
    }
}

module.exports = Producto;