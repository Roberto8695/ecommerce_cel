const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');

// Ruta para obtener todos los productos
router.get('/', productosController.getAllProductos);

// Ruta para obtener un producto por ID
router.get('/:id', productosController.getProductoById);

// Ruta para crear un nuevo producto
router.post('/', productosController.createProducto);

// Ruta para actualizar un producto existente
router.put('/:id', productosController.updateProducto);

// Ruta para eliminar un producto
router.delete('/:id', productosController.deleteProducto);

module.exports = router;
