// Script para agregar un cliente de prueba
const db = require('../config/db');

// Función principal
async function addTestClient() {
  try {
    console.log('Añadiendo cliente de prueba...');
    
    // Verificar si ya existe el cliente 1
    const checkQuery = 'SELECT id_cliente FROM Clientes WHERE id_cliente = 1';
    const checkResult = await db.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('El cliente con ID 1 ya existe en la base de datos.');
      return;
    }
    
    // Insertar cliente de prueba
    const insertQuery = `
      INSERT INTO Clientes (nombre, email, telefono, direccion)
      VALUES ('Cliente de Prueba', 'test@example.com', '12345678', 'Dirección de prueba 123')
      RETURNING id_cliente, nombre, email
    `;
    
    const result = await db.query(insertQuery);
    console.log('Cliente de prueba agregado con éxito:', result.rows[0]);
    
  } catch (error) {
    console.error('Error al agregar cliente de prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la función principal
addTestClient();
