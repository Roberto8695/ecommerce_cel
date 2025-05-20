const express = require('express');
const router = express.Router();
const simpleController = require('../controllers/simple.controller');

// Ruta de prueba
router.get('/test', simpleController.test);

// Ruta para subir comprobantes
router.post('/ventas/pedidos/:id/comprobante', simpleController.uploadComprobante);

module.exports = router;
