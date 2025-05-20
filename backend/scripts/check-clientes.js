// Script para verificar la estructura y contenido de la tabla Clientes
const db = require('../config/db');

async function checkClientesTable() {
  try {
    // Verificar si la tabla existe
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'clientes'
      );
    `;
    
    const tableCheckResult = await db.query(tableCheckQuery);
    
    if (!tableCheckResult.rows[0].exists) {
      console.log('La tabla Clientes no existe. Creando tabla...');
      
      // Crear tabla Clientes si no existe
      const createTableQuery = `
        CREATE TABLE Clientes (
          id_cliente SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          telefono VARCHAR(20),
          direccion TEXT,
          fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await db.query(createTableQuery);
      console.log('Tabla Clientes creada exitosamente.');
      
      // Insertar algunos clientes de ejemplo
      const insertClientsQuery = `
        INSERT INTO Clientes (nombre, email, telefono, direccion) VALUES
        ('Cliente Demo 1', 'cliente1@ejemplo.com', '5551234567', 'Dirección de ejemplo 1'),
        ('Cliente Demo 2', 'cliente2@ejemplo.com', '5552345678', 'Dirección de ejemplo 2'),
        ('Cliente Demo 3', 'cliente3@ejemplo.com', '5553456789', 'Dirección de ejemplo 3')
        RETURNING *;
      `;
      
      const insertedClients = await db.query(insertClientsQuery);
      console.log('Clientes de ejemplo insertados:', insertedClients.rows.length);
    } else {
      console.log('La tabla Clientes existe.');
      
      // Consultar la estructura de la tabla
      const structureQuery = `
        SELECT column_name, data_type, character_maximum_length
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = 'clientes'
        ORDER BY ordinal_position;
      `;
      
      const structureResult = await db.query(structureQuery);
      
      console.log('Estructura de la tabla Clientes:');
      structureResult.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
      });
      
      // Contar clientes
      const countQuery = 'SELECT COUNT(*) FROM Clientes';
      const countResult = await db.query(countQuery);
      
      console.log(`\nTotal de clientes: ${countResult.rows[0].count}`);
      
      // Si no hay clientes, insertar algunos de ejemplo
      if (parseInt(countResult.rows[0].count) === 0) {
        console.log('No hay clientes en la base de datos. Agregando clientes de ejemplo...');
        
        const insertClientsQuery = `
          INSERT INTO Clientes (nombre, email, telefono, direccion) VALUES
          ('Cliente Demo 1', 'cliente1@ejemplo.com', '5551234567', 'Dirección de ejemplo 1'),
          ('Cliente Demo 2', 'cliente2@ejemplo.com', '5552345678', 'Dirección de ejemplo 2'),
          ('Cliente Demo 3', 'cliente3@ejemplo.com', '5553456789', 'Dirección de ejemplo 3')
          RETURNING *;
        `;
        
        const insertedClients = await db.query(insertClientsQuery);
        console.log('Clientes de ejemplo insertados:', insertedClients.rows.length);
      } else if (parseInt(countResult.rows[0].count) < 5) {
        // Mostrar los clientes existentes
        const sampleQuery = 'SELECT * FROM Clientes LIMIT 10';
        const sampleResult = await db.query(sampleQuery);
        
        console.log('\nClientes disponibles:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`[${index + 1}] ID: ${row.id_cliente}, Nombre: ${row.nombre}, Email: ${row.email}`);
        });
      }
    }
  } catch (error) {
    console.error('Error al verificar la tabla Clientes:', error);
  } finally {
    process.exit(0);
  }
}

checkClientesTable();
