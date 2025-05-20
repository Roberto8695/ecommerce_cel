// Router de ventas simplificado
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.simple');

// Rutas públicas para pruebas (sin middleware de autenticación)
router.get('/admin/pedidos', ventasController.getPedidos);
router.get('/admin/pedidos/:id', ventasController.getPedidoById);
router.put('/admin/pedidos/:id/estado', ventasController.updateEstado);
router.get('/admin/estadisticas', ventasController.getEstadisticas);

// Rutas para subir comprobantes
router.post('/pedidos', ventasController.createPedido);
router.post('/pedidos/:id/comprobante', ventasController.uploadComprobante);

module.exports = router;
