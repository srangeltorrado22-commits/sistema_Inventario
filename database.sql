-- =======================================================
-- Script de Base de Datos para Sistema de Inventario (Bottega)
-- =======================================================

-- 1. Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS inventario_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Usar la base de datos
USE inventario_db;

-- 3. Crear tabla productos
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

-- 4. Insertar datos de prueba iniciales
INSERT INTO productos (codigo, nombre, marca, categoria, precio, cantidad) VALUES
('P001', 'Portátil HP Pavilion 15', 'HP', 'Tecnología', 3200000.00, 8),
('P002', 'Teclado Mecánico RGB', 'Logitech', 'Tecnología', 250000.00, 15),
('P003', 'Mouse Inalámbrico MX Master 3S', 'Logitech', 'Tecnología', 420000.00, 12),
('P004', 'Cuaderno Argollado 100 Hojas', 'Norma', 'Papelería', 12000.00, 50),
('P005', 'Set de Bolígrafos x10', 'Bic', 'Papelería', 18000.00, 30),
('P006', 'Detergente Multiusos 2L', 'LimpioMax', 'Aseo', 24000.00, 20),
('P007', 'Café Colombiano Especial 500g', 'Juan Valdez', 'Alimentos', 35000.00, 0)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    marca = VALUES(marca),
    categoria = VALUES(categoria),
    precio = VALUES(precio),
    cantidad = VALUES(cantidad);
