const app = require('./app');
const { connectDB } = require('./config/db');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();