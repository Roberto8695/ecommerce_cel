const express = require('express');
const router = express.Router();

// Rutas de prueba simples
router.get('/test', (req, res) => {
  res.json({ message: 'Test GET exitoso' });
});

router.post('/test', (req, res) => {
  res.json({ message: 'Test POST exitoso' });
});

module.exports = router;
