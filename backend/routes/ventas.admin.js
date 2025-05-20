const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller.test.new');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Función de prueba simple para depuración
const testFunction = (req, res) => {
  res.json({ message: 'Test successful' });
};

// Rutas para el dashboard de ventas
router.get('/admin/pedidos-test', testFunction);
router.get('/admin/pedidos', ventasController.getPedidos);
router.get('/admin/estadisticas', ventasController.getEstadisticas);
router.get('/admin/pedidos/:id', ventasController.getPedidoById);
router.put('/admin/pedidos/:id/estado', ventasController.updateEstado);

// El resto de rutas se añadirán una vez solucionado el problema principal

module.exports = router;
