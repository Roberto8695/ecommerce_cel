-- Script para crear las tablas necesarias para el sistema de ventas

-- Crear tabla de Clientes si no existe
CREATE TABLE IF NOT EXISTS Clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    telefono VARCHAR(20),
    direccion TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Pedidos si no existe
CREATE TABLE IF NOT EXISTS Pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES Clientes(id_cliente),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente, procesando, enviado, entregado, cancelado, pagado
    total NUMERIC(10, 2) NOT NULL,
    url_comprobante VARCHAR(255),
    metodo_pago VARCHAR(50)
);

-- Crear tabla de Detalles_Pedido si no existe
CREATE TABLE IF NOT EXISTS Detalles_Pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES Pedidos(id_pedido),
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0)
);

-- Insertar algunos datos de prueba para Clientes
INSERT INTO Clientes (nombre, email, telefono, direccion)
VALUES 
('Usuario de Prueba', 'test@example.com', '12345678', 'Calle de Prueba #123')
ON CONFLICT DO NOTHING;
