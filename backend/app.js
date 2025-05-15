const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar rutas
const adminRoutes = require('./routes/admin.routes');
const productosRoutes = require('./routes/productos.routes');
const marcasRoutes = require('./routes/marcas.routes');
const imagenesRoutes = require('./routes/imagenes.routes');

// Inicializar app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use('/api/uploads', express.static(__dirname + '/public/uploads'));
// Ruta adicional sin prefijo /api para compatibilidad
app.use('/uploads', express.static(__dirname + '/public/uploads'));
// Asegurarse de que se sirvan correctamente los archivos estáticos
app.use(express.static(__dirname + '/public'));

// Rutas
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/imagenes', imagenesRoutes);

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
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;