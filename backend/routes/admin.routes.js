const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const actividadesController = require('../controllers/actividades.controller');
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

// Ruta para actividades recientes (en el dashboard)
router.get('/actividades-recientes', actividadesController.getRecentActivities);

module.exports = router;
