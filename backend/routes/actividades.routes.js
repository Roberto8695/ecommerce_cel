const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividades.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Ruta para obtener actividades recientes para el dashboard
router.get('/actividades-recientes', actividadesController.getRecentActivities);

module.exports = router;
