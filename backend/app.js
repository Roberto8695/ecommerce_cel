const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de ecommerce_cel funcionando correctamente' });
});



module.exports = app;