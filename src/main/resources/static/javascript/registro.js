document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formProducto");
    if (!form) return; // Evita errores si este script se carga en otra página

    let editMode = false;
    let codigoOriginal = null;

    // CARGAR DATOS SI VIENE DESDE EDICIÓN
    const productoGuardado = localStorage.getItem("productoEditar");
    if (productoGuardado) {
        try {
            const producto = JSON.parse(productoGuardado);

            editMode = true;
            codigoOriginal = producto.codigo || producto.id;

            const elCodigo = document.getElementById("codigo");
            const elNombre = document.getElementById("nombre");
            const elMarca = document.getElementById("marca");
            const elCategoria = document.getElementById("categoria");
            const elPrecio = document.getElementById("precio");
            const elCantidad = document.getElementById("cantidad");
            const elTitulo = document.getElementById("tituloFormulario");

            if (elCodigo) elCodigo.value = producto.codigo || producto.id || "";
            if (elNombre) elNombre.value = producto.nombre || "";
            if (elMarca) elMarca.value = producto.marca || "";
            if (elCategoria) elCategoria.value = producto.categoria || "";
            if (elPrecio) elPrecio.value = producto.precio || 0;
            if (elCantidad) elCantidad.value = producto.cantidad ?? producto.stock ?? 0;

            if (elTitulo) elTitulo.textContent = "Editar producto";

            const btnSubmit = form.querySelector("button[type='submit']");
            if (btnSubmit) {
                btnSubmit.innerHTML = 'Actualizar producto <i class="bi bi-check-lg"></i>';
            }
        } catch (err) {
            console.error("Error al procesar producto a editar:", err);
        } finally {
            localStorage.removeItem("productoEditar");
        }
    }

    // GUARDAR O ACTUALIZAR
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const codigo = document.getElementById("codigo")?.value.trim();
        const nombre = document.getElementById("nombre")?.value.trim();
        const marca = document.getElementById("marca")?.value.trim() || null;
        const categoria = document.getElementById("categoria")?.value.trim() || null;
        const precio = parseFloat(document.getElementById("precio")?.value);
        const cantidad = parseInt(document.getElementById("cantidad")?.value, 10);

        if (!codigo || !nombre) {
            alert("El código y el nombre son obligatorios.");
            return;
        }

        if (isNaN(precio) || precio < 0) {
            alert("Por favor ingrese un precio válido (mayor o igual a 0).");
            return;
        }

        if (isNaN(cantidad) || cantidad < 0) {
            alert("Por favor ingrese una cantidad válida (mayor o igual a 0).");
            return;
        }

        const data = { codigo, nombre, marca, categoria, precio, cantidad };

        try {
            let url = "/api/productos";
            let method = "POST";

            if (editMode && codigoOriginal) {
                url = `/api/productos/${encodeURIComponent(codigoOriginal)}`;
                method = "PUT";
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert(editMode ? "Producto actualizado correctamente" : "Producto creado correctamente");
                window.location.href = "/html/productos.html";
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Error: ${errorData.mensaje || errorData.error || "No se pudo procesar la solicitud"}`);
            }

        } catch (error) {
            console.error("Error de red o servidor:", error);
            alert("Ocurrió un error al conectar con el servidor.");
        }
    });
});