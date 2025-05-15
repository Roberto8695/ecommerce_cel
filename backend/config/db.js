const { Pool } = require('pg');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Máximo número de clientes en el pool
  max: 20,
  // Tiempo de espera antes de lanzar un error de timeout
  idleTimeoutMillis: 30000,
  // Tiempo máximo que un cliente puede estar inactivo en el pool
  connectionTimeoutMillis: 2000,
});

// Evento para cuando se crea una conexión
pool.on('connect', () => {
  console.log('Base de datos PostgreSQL conectada exitosamente');
});

// Evento para errores en el pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  // Para consultas simples
  query: (text, params) => pool.query(text, params),
  
  // Para obtener un cliente del pool
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Sobreescribir la función query para agregar logs
    client.query = (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('CONSULTA SQL:', args[0]);
      }
      return query.apply(client, args);
    };
    
    // Sobreescribir la función release para no desconectar clientes múltiples veces
    client.release = () => {
      release.apply(client);
    };
    
    return client;
  }
};