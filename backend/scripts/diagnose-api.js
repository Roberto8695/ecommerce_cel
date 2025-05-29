/**
 * Script de diagnóstico para verificar la conectividad con el backend
 * Ejecutar: node diagnose-api.js
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const ENDPOINTS = [
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'Estadísticas de Pedidos', path: '/pedidos/estadisticas', method: 'GET' },
  { name: 'Conteo de Clientes', path: '/clientes/count', method: 'GET' },
  { name: 'Estadísticas de Productos', path: '/productos/stats', method: 'GET' }
];

// Directorio para los logs
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Archivo de log
const logFile = path.join(logDir, `api-diagnostic-${new Date().toISOString().replace(/:/g, '-')}.log`);

/**
 * Escribe un mensaje en el log
 * @param {string} message 
 * @param {boolean} logToConsole 
 */
function log(message, logToConsole = true) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  
  if (logToConsole) {
    console.log(message);
  }
}

/**
 * Prueba un endpoint específico
 * @param {Object} endpoint 
 */
async function testEndpoint(endpoint) {
  const url = `${API_URL}${endpoint.path}`;
  log(`\nProbando ${endpoint.name}: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await axios({
      method: endpoint.method,
      url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    const endTime = Date.now();
    
    log(`✅ Status: ${response.status}`);
    log(`⏱️ Tiempo de respuesta: ${endTime - startTime}ms`);
    
    if (response.data) {
      log(`📄 Datos: ${JSON.stringify(response.data, null, 2)}`);
    }
    
    return { success: true, data: response.data, time: endTime - startTime };
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    
    if (error.response) {
      log(`📄 Status: ${error.response.status}`);
      log(`📄 Datos: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Prueba todos los endpoints y genera un informe
 */
async function runDiagnostic() {
  log('=== INICIANDO DIAGNÓSTICO DE API ===');
  log(`API URL: ${API_URL}`);
  log(`Fecha y hora: ${new Date().toISOString()}`);
  log('===============================');
  
  const results = {};
  
  for (const endpoint of ENDPOINTS) {
    results[endpoint.name] = await testEndpoint(endpoint);
  }
  
  log('\n=== RESUMEN DE DIAGNÓSTICO ===');
  
  for (const [name, result] of Object.entries(results)) {
    if (result.success) {
      log(`✅ ${name}: OK (${result.time}ms)`);
    } else {
      log(`❌ ${name}: Error - ${result.error}`);
    }
  }
  
  log('\n=== CONCLUSIÓN ===');
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = ENDPOINTS.length;
  
  if (successCount === totalCount) {
    log('✅ Todos los endpoints están funcionando correctamente.');
  } else {
    log(`❌ ${successCount}/${totalCount} endpoints están funcionando. Hay problemas que requieren atención.`);
    
    // Sugerencias basadas en los resultados
    if (!results['Health Check'].success) {
      log('⚠️ El health check falló. Posibles causas:');
      log('   - El servidor backend no está ejecutándose');
      log('   - Hay un problema de red o firewall');
      log('   - La URL del API es incorrecta');
    } else if (!results['Estadísticas de Pedidos'].success) {
      log('⚠️ Falló la obtención de estadísticas. Posibles causas:');
      log('   - Problemas con la conexión a la base de datos');
      log('   - Error en la consulta SQL');
      log('   - Problemas de CORS');
    }
  }
  
  log(`\nEl registro completo está disponible en: ${logFile}`);
}

// Ejecutar el diagnóstico
runDiagnostic().catch(error => {
  log(`Error al ejecutar el diagnóstico: ${error.message}`);
});
