const { Pool, Client } = require("pg");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "1234",
    database: process.env.DB_NAME || "inventario_db",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
};

/* Pool de conexión principal apuntando a la base de datos de inventario */
const conexion = new Pool(dbConfig);

/* Función para inicializar la base de datos y tablas automáticamente si no existen */
async function inicializarBaseDeDatos() {
    let adminClient = null;
    try {
        // Conexión inicial al servidor PostgreSQL conectando a la base por defecto 'postgres'
        adminClient = new Client({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: "postgres"
        });

        await adminClient.connect();

        // Verificar si la base de datos existe
        const resDb = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbConfig.database]
        );

        if (resDb.rowCount === 0) {
            // En PostgreSQL no se puede parametrizar el nombre de la BD en DDL CREATE DATABASE
            const safeDbName = dbConfig.database.replace(/"/g, '""');
            await adminClient.query(`CREATE DATABASE "${safeDbName}"`);
            console.log(`-> Base de datos '${dbConfig.database}' creada con éxito.`);
        }
    } catch (err) {
        // Si no tiene permisos para crear DB o falla, continuar para intentar conectar directamente
        console.warn("Aviso durante verificación/creación de BD:", err.message);
    } finally {
        if (adminClient) {
            try {
                await adminClient.end();
            } catch (e) {
                // ignorar error de desconexión
            }
        }
    }

    // Inicializar tabla y datos usando el pool principal
    try {
        // Crear tabla productos si no existe
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                codigo VARCHAR(50) NOT NULL UNIQUE,
                nombre VARCHAR(100) NOT NULL,
                marca VARCHAR(100) DEFAULT NULL,
                categoria VARCHAR(50) DEFAULT NULL,
                precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
                cantidad INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Si la tabla está vacía, insertar productos iniciales de muestra
        const { rows } = await conexion.query("SELECT COUNT(*) AS total FROM productos");
        if (parseInt(rows[0].total, 10) === 0) {
            await conexion.query(`
                INSERT INTO productos (codigo, nombre, marca, categoria, precio, cantidad) VALUES
                ('P001', 'Portátil HP Pavilion 15', 'HP', 'Tecnología', 3200000.00, 8),
                ('P002', 'Teclado Mecánico RGB', 'Logitech', 'Tecnología', 250000.00, 15),
                ('P003', 'Mouse Inalámbrico MX Master 3S', 'Logitech', 'Tecnología', 420000.00, 12),
                ('P004', 'Cuaderno Argollado 100 Hojas', 'Norma', 'Papelería', 12000.00, 50),
                ('P005', 'Set de Bolígrafos x10', 'Bic', 'Papelería', 18000.00, 30),
                ('P006', 'Detergente Multiusos 2L', 'LimpioMax', 'Aseo', 24000.00, 20),
                ('P007', 'Café Colombiano Especial 500g', 'Juan Valdez', 'Alimentos', 35000.00, 0)
                ON CONFLICT (codigo) DO NOTHING;
            `);
            console.log("-> Se insertaron productos iniciales de demostración.");
        }
    } catch (err) {
        console.warn("Aviso durante inicialización de tablas/datos:", err.message);
    }
}

async function probarConexion() {
    try {
        await inicializarBaseDeDatos();
        const client = await conexion.connect();
        console.log(`Conectado correctamente a PostgreSQL [Base de datos: ${dbConfig.database}]`);
        client.release();
    } catch (error) {
        console.error("Error de conexión a PostgreSQL:");
        console.error(error.message);
        if (error.code === "28P01") {
            console.error(`Pista: Error de autenticación (código 28P01). Verifica el usuario (${dbConfig.user}) y la contraseña configurada.`);
        } else if (error.code === "ECONNREFUSED") {
            console.error(`Pista: Conexión rechazada. Asegúrate de que el servicio de PostgreSQL esté ejecutándose en el puerto ${dbConfig.port}.`);
        } else if (error.code === "3D000") {
            console.error(`Pista: La base de datos '${dbConfig.database}' no existe y no se pudo crear automáticamente.`);
        }
    }
}

module.exports = {
    conexion,
    probarConexion
};