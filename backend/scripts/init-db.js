// Script para inicializar la base de datos
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configurar conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDatabase() {
  try {
    console.log('Inicializando la base de datos...');
    
    // Leer el script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    
    // Ejecutar el script SQL
    await pool.query(sqlScript);
    
    console.log('Base de datos inicializada correctamente');
    
    // Ahora vamos a crear el administrador por defecto
    console.log('Creando administrador por defecto...');
    
    // Verificar si ya existe el administrador
    const checkResult = await pool.query(
      'SELECT COUNT(*) FROM "Administradores" WHERE email = $1',
      ['admin@admin.com']
    );
    
    const adminExists = parseInt(checkResult.rows[0].count) > 0;
    
    if (adminExists) {
      console.log('El administrador ya existe, actualizando contraseña...');
      
      // Actualizar la contraseña si el admin ya existe
      await pool.query(
        'UPDATE "Administradores" SET contrasena = $1 WHERE email = $2',
        ['pass', 'admin@admin.com']
      );
      
      console.log('Contraseña actualizada correctamente');
    } else {
      // Insertar el nuevo administrador
      await pool.query(
        'INSERT INTO "Administradores" (nombre_usuario, email, contrasena, rol) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@admin.com', 'pass', 'superadmin']
      );
      
      console.log('Administrador creado exitosamente');
    }
    
    console.log('Credenciales de acceso:');
    console.log('Email: admin@admin.com');
    console.log('Contraseña: pass');
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await pool.end();
    process.exit();
  }
}

// Ejecutar la función
initDatabase();
