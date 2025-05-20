const express = require('express');
const router = express.Router();
// Importar el controlador de ventas nuevo
const ventasController = require('../controllers/ventas.controller.test.new');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

/**
 * Rutas para gestión de pedidos/ventas
 */

// Rutas para clientes (requieren autenticación)
router.post('/pedidos', verifyToken, ventasController.createPedido);
router.post('/pedidos/:id/comprobante', verifyToken, ventasController.uploadComprobante);
router.get('/pedidos/cliente', verifyToken, ventasController.getPedidos); // Filtrado por cliente autenticado

// Rutas para administradores (requieren ser admin)
router.get('/admin/pedidos', verifyToken, isAdmin, ventasController.getPedidos);
router.get('/admin/pedidos/:id', verifyToken, isAdmin, ventasController.getPedidoById);
router.put('/admin/pedidos/:id/estado', verifyToken, isAdmin, ventasController.updateEstado);
router.get('/admin/estadisticas', verifyToken, isAdmin, ventasController.getEstadisticas);

module.exports = router;