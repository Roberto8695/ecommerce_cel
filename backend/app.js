const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar rutas
const adminRoutes = require('./routes/admin.routes');
const productosRoutes = require('./routes/productos.routes');
const marcasRoutes = require('./routes/marcas.routes');
const imagenesRoutes = require('./routes/imagenes.routes');
const simpleRoutes = require('./routes/simple.router');
// const ventasRoutes = require('./routes/ventas.router'); // Comentado porque tiene errores

// Inicializar app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use('/api/uploads', express.static(__dirname + '/public/uploads'));
// Ruta adicional sin prefijo /api para compatibilidad
app.use('/uploads', express.static(__dirname + '/public/uploads'));
// Asegurarse de que se sirvan correctamente los archivos estáticos
app.use(express.static(__dirname + '/public'));

// Importar rutas simplificadas de ventas
const ventasSimpleRoutes = require('./routes/ventas.simple');
// Importar las nuevas rutas de pedidos
const pedidosRoutes = require('./routes/pedidos.router');
// Importar rutas de administración de ventas
const ventasAdminRoutes = require('./routes/ventas.admin');

// Rutas
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/simple', simpleRoutes);
app.use('/api/ventas', ventasSimpleRoutes);
app.use('/api/ventas', ventasAdminRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Ruta de health check para probar la conectividad de la API
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API de ECommerce Cel en funcionamiento' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado en el servidor:', err);
  
  // Manejar errores específicos para dar respuestas más informativas
  if (err.name === 'MulterError') {
    console.error('Error de Multer al procesar archivo:', err);
    return res.status(400).json({ 
      success: false,
      error: `Error al subir archivo: ${err.message}` 
    });
  }
  
  // Para errores desconocidos, dar una respuesta genérica
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;