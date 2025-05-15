const db = require('../config/db');

async function checkMarcas() {
  try {
    // Primero listamos todas las tablas para encontrar la de marcas
    console.log('Listando todas las tablas disponibles:');
    const tablesResult = await db.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `);
    
    console.log('Tablas disponibles:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.tablename}`);
    });
    console.log('==========================');
    
    // Buscar la tabla de marcas con un nombre más genérico
    let marcasTable = '';
    for (const row of tablesResult.rows) {
      if (row.tablename.toLowerCase().includes('marca')) {
        marcasTable = row.tablename;
        break;
      }
    }
    
    if (!marcasTable) {
      console.log('No se encontró ninguna tabla de marcas');
      return;
    }
    
    console.log(`Usando tabla: "${marcasTable}"`);
    
    // Consultar las marcas
    const result = await db.query(`SELECT * FROM "${marcasTable}"`);
    
    console.log('Marcas en la base de datos:');
    console.log('==========================');
    
    result.rows.forEach(marca => {
      console.log(`ID: ${marca.id_marca || marca.id}, Nombre: ${marca.nombre}, URL Logo: ${marca.url_logo}`);
    });
    
  } catch (error) {
    console.error('Error al consultar marcas:', error);
  }
}

checkMarcas();
