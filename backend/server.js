const app = require('./app');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}`);
});