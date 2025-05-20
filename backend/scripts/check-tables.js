// Script para verificar que las tablas necesarias existan
const db = require('../config/db');

// Lista de tablas que deberían existir
const expectedTables = [
  'clientes',
  'pedidos',
  'detalles_pedido',
  'productos',
  'marcas'
];

// Función para verificar si una tabla existe
async function tableExists(tableName) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
      )
    `;
    
    const result = await db.query(query, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error al verificar la tabla ${tableName}:`, error);
    return false;
  }
}

// Función principal
async function checkTables() {
  console.log('Verificando tablas en la base de datos...');
  
  for (const table of expectedTables) {
    const exists = await tableExists(table);
    console.log(`Tabla ${table}: ${exists ? 'EXISTE ✓' : 'NO EXISTE ✗'}`);
  }
  
  // Verificar si existe la tabla Imagenes
  const imagenesExists = await tableExists('imagenes');
  console.log(`Tabla imagenes: ${imagenesExists ? 'EXISTE (podría causar conflictos)' : 'NO EXISTE (esto es lo esperado)'}`);
  
  // Verificar si existe la tabla Imagenes_Producto
  const imagenesProductoExists = await tableExists('imagenes_producto');
  console.log(`Tabla imagenes_producto: ${imagenesProductoExists ? 'EXISTE ✓' : 'NO EXISTE ✗ (podría ser necesaria)'}`);
  
  process.exit(0);
}

// Ejecutar la función principal
checkTables();
