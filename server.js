const express = require("express");
const path = require("path");

// Archivos de configuración y rutas
const { probarConexion } = require("./src/main/java/config/database");
const productosRutes = require("./src/main/java/rutes/productos.rutes");

const app = express();

// Usar el puerto que asigna el servidor de hosting en producción, o el 3000 por defecto en local
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON en las peticiones
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "src/main/resources/static")));

// Servir la librería Bootstrap
app.use("/bootstrap", express.static(path.join(__dirname, "bootstrap")));

// Inicializar la conexión a MySQL
probarConexion();

// Endpoints / Rutas API
app.use("/api/productos", productosRutes);

// Servir index.html para la raíz y para /index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Ruta de fallback para páginas (compatible con Express 5, sin usar '*')
app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ mensaje: "Ruta API no encontrada" });
    }
    res.sendFile(path.join(__dirname, "index.html"));
});

// Middleware de manejo global de errores
app.use((err, req, res, next) => {
    console.error("Error no controlado:", err);
    res.status(500).json({ mensaje: "Error interno del servidor", error: err.message });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado correctamente en http://localhost:${PORT}`);
});

module.exports = app;