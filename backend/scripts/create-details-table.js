// Script para crear la tabla Detalles_Pedido
const db = require('../config/db');

async function createDetallesPedidoTable() {
  try {
    // Verificar si la tabla existe
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'detalles_pedido'
      );
    `;
    
    const tableCheckResult = await db.query(tableCheckQuery);
    
    if (!tableCheckResult.rows[0].exists) {
      console.log('La tabla Detalles_Pedido no existe. Creando tabla...');
      
      // Crear tabla Detalles_Pedido
      const createTableQuery = `
        CREATE TABLE Detalles_Pedido (
          id_detalle SERIAL PRIMARY KEY,
          id_pedido INTEGER NOT NULL,
          id_producto INTEGER NOT NULL,
          cantidad INTEGER NOT NULL CHECK (cantidad > 0),
          precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
          subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
          FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
          FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE RESTRICT
        );
      `;
      
      await db.query(createTableQuery);      console.log('Tabla Detalles_Pedido creada exitosamente.');
    } else {
      console.log('La tabla Detalles_Pedido ya existe.');
      
      // Mostrar la estructura de la tabla
      const structureQuery = `
        SELECT column_name, data_type, character_maximum_length
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = 'detalles_pedido'
        ORDER BY ordinal_position;
      `;
      
      const structureResult = await db.query(structureQuery);
      
      console.log('Estructura de la tabla Detalles_Pedido:');
      structureResult.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
      });
    }
      // Verificar si hay registros en la tabla Pedidos sin detalles
    console.log('\nVerificando pedidos sin detalles...');
    
    const missingDetailsQuery = `
      SELECT p.id_pedido, p.total, p.fecha_pedido, p.estado
      FROM Pedidos p
      LEFT JOIN Detalles_Pedido d ON p.id_pedido = d.id_pedido
      WHERE d.id_detalle IS NULL;
    `;
    
    const missingDetailsResult = await db.query(missingDetailsQuery);
    
    if (missingDetailsResult.rows.length > 0) {
      console.log(`Se encontraron ${missingDetailsResult.rows.length} pedidos sin detalles:`);
      missingDetailsResult.rows.forEach((row, index) => {
        console.log(`[${index + 1}] ID: ${row.id_pedido}, Total: ${row.total}, Estado: ${row.estado}, Fecha: ${row.fecha_pedido}`);
      });
    } else {
      console.log('No se encontraron pedidos sin detalles.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createDetallesPedidoTable();
