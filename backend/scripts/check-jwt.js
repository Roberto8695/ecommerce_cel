// Script para verificar la configuración de JWT_SECRET
require('dotenv').config(); // Cargar variables de entorno
const jwt = require('jsonwebtoken');

console.log('Verificando configuración de JWT_SECRET...');

// Verificar si JWT_SECRET está definido
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
  console.log('Crea un archivo .env en la raíz del proyecto backend con:');
  console.log('JWT_SECRET="tu_clave_secreta_aqui"');
  process.exit(1);
}

// Intentar firmar y verificar un token para asegurarse de que funciona
try {
  const payload = { test: 'data', iat: Math.floor(Date.now() / 1000) };
  console.log('Generando token de prueba...');
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('Token generado:', token);
  
  console.log('Verificando token...');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token verificado correctamente:', decoded);
  
  console.log('✅ JWT_SECRET está configurado correctamente');
} catch (error) {
  console.error('❌ Error al probar JWT_SECRET:', error.message);
  process.exit(1);
}
