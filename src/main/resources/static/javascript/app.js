function formatoDinero(valor) {
    return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

document.addEventListener("DOMContentLoaded", () => {
    const tablaProductos = document.getElementById("tablaProductos");
    const formProducto = document.getElementById("formProducto");

    // Si existe la tabla en el HTML actual, cargamos los datos
    if (tablaProductos) {
        console.log("Vista: Productos");
        cargarProductos();
    }

    if (formProducto) {
        console.log("Vista: Registro");
    }
});

// Función para obtener y renderizar los productos desde la API
async function cargarProductos() {
    const tbody = document.querySelector("#tablaProductos tbody");
    if (!tbody) return;

    try {
        // Usa ruta relativa para que funcione tanto en local como en producción
        const respuesta = await fetch("/api/productos");
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const productos = await respuesta.json();

        // Si la base de datos no devuelve productos
        if (productos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3">No hay productos registrados.</td>
                </tr>`;
            return;
        }

        // Limpiar la tabla antes de renderizar
        tbody.innerHTML = "";

        // Insertar cada fila en la tabla
        // (Asegúrate de ajustar los nombres de las propiedades según tu base de datos)
        productos.forEach((prod) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prod.id || ""}</td>
                <td>${prod.nombre || ""}</td>
                <td>${prod.categoria || prod.descripcion || ""}</td>
                <td>${formatoDinero(prod.precio)}</td>
                <td>${prod.stock ?? prod.cantidad ?? 0}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-3">
                    Error al cargar la tabla de productos.
                </td>
            </tr>`;
    }
}