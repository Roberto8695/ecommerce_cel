const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const pedidosDirectController = require('../controllers/pedidos.direct');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas para pruebas - En producción deberían requerir autenticación
// Usamos las implementaciones directas para evitar problemas con tablas inexistentes
router.post('/', pedidosDirectController.createPedidoDirect);
router.post('/:id/comprobante', pedidosDirectController.uploadComprobanteDirect);

// Rutas originales como fallback
router.get('/', pedidosController.getPedidos);
router.get('/estadisticas', pedidosController.getEstadisticas);
router.get('/:id', pedidosController.getPedidoById);
router.put('/:id/estado', pedidosController.updateEstado);

module.exports = router;
