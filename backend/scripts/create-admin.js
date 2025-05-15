// Script para crear un administrador por defecto
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function createDefaultAdmin() {
  try {
    console.log('Creando administrador por defecto...');
    
    // Verificar si ya existe el administrador
    const checkResult = await query(
      'SELECT COUNT(*) FROM "Administradores" WHERE email = $1',
      ['admin@admin.com']
    );
    
    const adminExists = parseInt(checkResult.rows[0].count) > 0;
    
    if (adminExists) {
      console.log('El administrador ya existe, actualizando contraseña...');
      
      // Actualizar la contraseña si el admin ya existe
      await query(
        'UPDATE "Administradores" SET contrasena = $1 WHERE email = $2',
        ['pass', 'admin@admin.com']
      );
      
      console.log('Contraseña actualizada correctamente');
    } else {
      // Insertar el nuevo administrador
      await query(
        'INSERT INTO "Administradores" (nombre_usuario, email, contrasena, rol) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@admin.com', 'pass', 'superadmin']
      );
      
      console.log('Administrador creado exitosamente');
    }
    
    console.log('Email: admin@admin.com');
    console.log('Contraseña: pass');
    
  } catch (error) {
    console.error('Error al crear administrador:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
createDefaultAdmin();
