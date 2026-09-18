let graficaInventario = null;

// Formato de moneda reutilizable
function formatoDinero(valor) {
    return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

async function cargarProductos() {
    try {
        const respuesta = await fetch("/api/productos");
        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos.");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        return [];
    }
}

function pintarMetricas(lista) {
    const totalProductos = lista.length;
    
    // Evaluamos tanto p.stock como p.cantidad por si la propiedad cambia
    const unidades = lista.reduce((acc, p) => acc + (Number(p.stock ?? p.cantidad) || 0), 0);
    const agotados = lista.filter(p => (Number(p.stock ?? p.cantidad) || 0) === 0).length;
    const valorTotal = lista.reduce(
        (acc, p) => acc + ((Number(p.precio) || 0) * (Number(p.stock ?? p.cantidad) || 0)),
        0
    );

    const elProductos = document.getElementById("metricProductos");
    const elDisponibles = document.getElementById("metricDisponibles");
    const elAgotados = document.getElementById("metricAgotados");
    const elValor = document.getElementById("metricValor");

    if (elProductos) elProductos.textContent = totalProductos;
    if (elDisponibles) elDisponibles.textContent = unidades;
    if (elAgotados) elAgotados.textContent = agotados;
    if (elValor) elValor.textContent = formatoDinero(valorTotal);
}

function pintarGrafica(lista) {
    const canvas = document.getElementById("graficaInventario");
    if (!canvas || !window.Chart) return;

    // Asignar "Sin Categoría" si el campo viene vacío o null
    const categorias = [...new Set(lista.map(p => p.categoria || "Sin Categoría"))];
    
    const valores = categorias.map(cat =>
        lista
            .filter(p => (p.categoria || "Sin Categoría") === cat)
            .reduce((acc, p) => acc + ((Number(p.precio) || 0) * (Number(p.stock ?? p.cantidad) || 0)), 0)
    );

    if (graficaInventario) {
        graficaInventario.destroy();
    }

    graficaInventario = new Chart(canvas, {
        type: "bar",
        data: {
            labels: categorias,
            datasets: [{
                label: "Valor por categoría",
                data: valores,
                backgroundColor: [
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                    "rgba(255, 159, 64, 0.7)"
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function inicializarInicio() {
    const productos = await cargarProductos();
    pintarMetricas(productos);
    pintarGrafica(productos);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarInicio);
} else {
    inicializarInicio();
}