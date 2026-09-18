const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "1234",
    database: process.env.DB_NAME || "inventario_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

/* Pool de conexión principal */
const conexion = mysql.createPool(dbConfig);

/* Función para inicializar la base de datos y tablas automáticamente si no existen */
async function inicializarBaseDeDatos() {
    let adminConn = null;
    try {
        // Conexión inicial al servidor MySQL sin especificar base de datos
        adminConn = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Crear la base de datos si no existe
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // Usar la base de datos
        await adminConn.query(`USE \`${dbConfig.database}\``);

        // Crear la tabla productos si no existe
        await adminConn.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(50) NOT NULL UNIQUE,
                nombre VARCHAR(100) NOT NULL,
                marca VARCHAR(100) DEFAULT NULL,
                categoria VARCHAR(50) DEFAULT NULL,
                precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                cantidad INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // Si la tabla está vacía, insertar productos iniciales de muestra
        const [filas] = await adminConn.query("SELECT COUNT(*) AS total FROM productos");
        if (filas[0].total === 0) {
            await adminConn.query(`
                INSERT INTO productos (codigo, nombre, marca, categoria, precio, cantidad) VALUES
                ('P001', 'Portátil HP Pavilion 15', 'HP', 'Tecnología', 3200000.00, 8),
                ('P002', 'Teclado Mecánico RGB', 'Logitech', 'Tecnología', 250000.00, 15),
                ('P003', 'Mouse Inalámbrico MX Master 3S', 'Logitech', 'Tecnología', 420000.00, 12),
                ('P004', 'Cuaderno Argollado 100 Hojas', 'Norma', 'Papelería', 12000.00, 50),
                ('P005', 'Set de Bolígrafos x10', 'Bic', 'Papelería', 18000.00, 30),
                ('P006', 'Detergente Multiusos 2L', 'LimpioMax', 'Aseo', 24000.00, 20),
                ('P007', 'Café Colombiano Especial 500g', 'Juan Valdez', 'Alimentos', 35000.00, 0)
            `);
            console.log("-> Se insertaron productos iniciales de demostración.");
        }
    } catch (err) {
        // Si no tiene permisos para crear DB o falla, continuar para intentar el pool directo
        console.warn("Aviso durante inicialización de BD:", err.message);
    } finally {
        if (adminConn) await adminConn.end();
    }
}

async function probarConexion() {
    try {
        await inicializarBaseDeDatos();
        const connection = await conexion.getConnection();
        console.log(`Conectado correctamente a MySQL [Base de datos: ${dbConfig.database}]`);
        connection.release();
    } catch (error) {
        console.error("Error de conexión a MySQL:");
        console.error(error.message);
        if (error.code === "ER_ACCESS_DENIED_ERROR") {
            console.error(`Pista: Verifica el usuario (${dbConfig.user}) y la contraseña configurada en MySQL.`);
        } else if (error.code === "ECONNREFUSED") {
            console.error(`Pista: Asegúrate de que el servicio de MySQL esté ejecutándose en el puerto ${dbConfig.port}.`);
        }
    }
}

module.exports = {
    conexion,
    probarConexion
};