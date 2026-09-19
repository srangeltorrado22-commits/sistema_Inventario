-- =======================================================
-- Script de Base de Datos para Sistema de Inventario (PostgreSQL)
-- =======================================================

-- 1. Crear la base de datos (Ejecutar conectado a la base postgres si no existe)
-- CREATE DATABASE inventario_db WITH ENCODING 'UTF8';

-- 2. Conectarse a la base de datos (en psql: \c inventario_db)

-- 3. Crear tabla productos
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

-- 4. Función y Trigger opcional para actualizar automáticamente updated_at en Postgres
CREATE OR REPLACE FUNCTION actualizar_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_productos_updated_at ON productos;
CREATE TRIGGER trigger_actualizar_productos_updated_at
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_updated_at();

-- 5. Insertar datos de prueba iniciales
INSERT INTO productos (codigo, nombre, marca, categoria, precio, cantidad) VALUES
('P001', 'Portátil HP Pavilion 15', 'HP', 'Tecnología', 3200000.00, 8),
('P002', 'Teclado Mecánico RGB', 'Logitech', 'Tecnología', 250000.00, 15),
('P003', 'Mouse Inalámbrico MX Master 3S', 'Logitech', 'Tecnología', 420000.00, 12),
('P004', 'Cuaderno Argollado 100 Hojas', 'Norma', 'Papelería', 12000.00, 50),
('P005', 'Set de Bolígrafos x10', 'Bic', 'Papelería', 18000.00, 30),
('P006', 'Detergente Multiusos 2L', 'LimpioMax', 'Aseo', 24000.00, 20),
('P007', 'Café Colombiano Especial 500g', 'Juan Valdez', 'Alimentos', 35000.00, 0)
ON CONFLICT (codigo) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    marca = EXCLUDED.marca,
    categoria = EXCLUDED.categoria,
    precio = EXCLUDED.precio,
    cantidad = EXCLUDED.cantidad,
    updated_at = CURRENT_TIMESTAMP;
