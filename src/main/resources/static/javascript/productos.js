let listaProductos = [];

// FORMATOS
function formatoDinero(valor) {
    return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

// CARGAR PRODUCTOS
async function cargarProductos() {
    try {
        const res = await fetch("/api/productos");
        if (!res.ok) throw new Error("Error al consultar API de productos");
        listaProductos = await res.json();
        return listaProductos;
    } catch (error) {
        console.error("Error al cargar productos:", error);
        listaProductos = [];
        return [];
    }
}

// MOSTRAR TABLA
function renderProductos(lista) {
    // Si la tabla no existe en la vista actual, cancelamos la ejecución
    const contenedorTabla = document.getElementById("tablaProductos");
    if (!contenedorTabla) return;

    // Apuntamos al tbody si existe, de lo contrario al contenedor principal
    let tbody = contenedorTabla.querySelector("tbody");
    if (!tbody && contenedorTabla.tagName === "TABLE") {
        tbody = document.createElement("tbody");
        contenedorTabla.appendChild(tbody);
    } else if (!tbody) {
        tbody = contenedorTabla;
    }

    tbody.innerHTML = "";

    if (!lista || !lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:20px;">
                    Sin productos registrados
                </td>
            </tr>
        `;
        actualizarResumen([]);
        return;
    }

    lista.forEach(p => {
        // Compatibilidad con variaciones de campos en base de datos
        const codigo = p.codigo || p.id || "N/A";
        const cantidad = Number(p.stock ?? p.cantidad) || 0;
        const precio = Number(p.precio) || 0;

        const estado = cantidad > 0
            ? `<span style="color:green;font-weight:bold;">Disponible</span>`
            : `<span style="color:red;font-weight:bold;">Agotado</span>`;

        const tr = document.createElement("tr");

        const codigoSafe = String(codigo).replace(/'/g, "\\'");

        tr.innerHTML = `
            <td>${codigo}</td>
            <td>${p.nombre || "Sin nombre"}</td>
            <td>${p.marca || "N/A"}</td>
            <td>${p.categoria || "N/A"}</td>
            <td>${formatoDinero(precio)}</td>
            <td>${cantidad}</td>
            <td>${estado}</td>
            <td>${formatoDinero(precio * cantidad)}</td>
            <td>
                <button onclick="editar('${codigoSafe}')" title="Editar producto"
                    style="background:#ffc107;border:none;padding:5px 8px;border-radius:5px;cursor:pointer;">
                    ✏️
                </button>
                <button onclick="eliminar('${codigoSafe}')" title="Eliminar producto"
                    style="background:#ff4d4f;border:none;padding:5px 8px;border-radius:5px;color:white;cursor:pointer;">
                    🗑
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    actualizarResumen(lista);
}

// RESUMEN
function actualizarResumen(lista) {
    const elContador = document.getElementById("contadorProductos");
    const elTotal = document.getElementById("totalInventario");

    if (elContador) {
        elContador.textContent = `${lista.length} productos`;
    }

    if (elTotal) {
        const total = lista.reduce((acc, p) => {
            const precio = Number(p.precio) || 0;
            const cantidad = Number(p.stock ?? p.cantidad) || 0;
            return acc + (precio * cantidad);
        }, 0);
        elTotal.textContent = formatoDinero(total);
    }
}

// BUSCADOR
function iniciarBuscador() {
    const input = document.getElementById("buscarProducto");
    if (!input) return; // Evita errores si el input no está en la página

    input.addEventListener("input", e => {
        const txt = e.target.value.toLowerCase().trim();

        const filtrados = listaProductos.filter(p => {
            const codigo = (p.codigo || p.id || "").toString().toLowerCase();
            const nombre = (p.nombre || "").toLowerCase();
            const marca = (p.marca || "").toLowerCase();
            const categoria = (p.categoria || "").toLowerCase();

            return codigo.includes(txt) ||
                   nombre.includes(txt) ||
                   marca.includes(txt) ||
                   categoria.includes(txt);
        });

        renderProductos(filtrados);
    });
}

// ELIMINAR
window.eliminar = async function (codigo) {
    if (!confirm(`¿Estás seguro de eliminar el producto con código "${codigo}"?`)) return;

    try {
        const res = await fetch(`/api/productos/${encodeURIComponent(codigo)}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            alert(errData.mensaje || "No se pudo eliminar el producto.");
            return;
        }

        await iniciar();
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Ocurrió un error al intentar eliminar el producto.");
    }
};

// EDITAR (localStorage)
window.editar = function (codigo) {
    const producto = listaProductos.find(p => (p.codigo || p.id || "").toString() === codigo.toString());
    if (producto) {
        localStorage.setItem("productoEditar", JSON.stringify(producto));
        window.location.href = "/html/registros.html";
    }
};

// INICIAR
async function iniciar() {
    await cargarProductos();
    renderProductos(listaProductos);
    iniciarBuscador();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}