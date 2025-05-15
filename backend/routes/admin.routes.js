const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Rutas para administradores
 */

// Ruta para login (pública)
router.post('/login', adminController.login);

// Rutas protegidas
// Solo accesibles con token válido
router.get('/profile', authMiddleware, adminController.getProfile);
router.get('/all', authMiddleware, adminController.getAllAdmins);

module.exports = router; 
