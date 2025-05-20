// Script para verificar la estructura de la tabla Pedidos
const db = require('../config/db');

async function checkPedidosTable() {
  try {
    // Consultar la estructura de la tabla
    const structureQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE table_name = 'pedidos'
      ORDER BY ordinal_position;
    `;
    
    console.log('Verificando estructura de la tabla Pedidos...');
    const structureResult = await db.query(structureQuery);
    
    console.log('Estructura de la tabla Pedidos:');
    structureResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });
    
    // Contar registros en la tabla
    const countQuery = 'SELECT COUNT(*) FROM Pedidos';
    const countResult = await db.query(countQuery);
    
    console.log(`\nTotal de registros en Pedidos: ${countResult.rows[0].count}`);
    
    // Mostrar algunos registros de ejemplo
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleQuery = 'SELECT * FROM Pedidos ORDER BY fecha_pedido DESC LIMIT 5';
      const sampleResult = await db.query(sampleQuery);
      
      console.log('\nÚltimos 5 pedidos:');
      sampleResult.rows.forEach((row, index) => {
        console.log(`[${index + 1}] ID: ${row.id_pedido}, Cliente: ${row.id_cliente}, Total: ${row.total}, Estado: ${row.estado}, Fecha: ${row.fecha_pedido}`);
      });
    }
  } catch (error) {
    console.error('Error al verificar la tabla Pedidos:', error);
  } finally {
    process.exit(0);
  }
}

checkPedidosTable();
