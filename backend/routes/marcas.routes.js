const express = require('express');
const router = express.Router();
const marcasController = require('../controllers/marcas.controller');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/marcas'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'marca-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten JPG, PNG, WEBP y SVG.'));
    }
  }
});

// Ruta para obtener todas las marcas
router.get('/', marcasController.getAllMarcas);

// Ruta para obtener una marca por ID
router.get('/:id', marcasController.getMarcaById);

// Ruta para crear una nueva marca
router.post('/', marcasController.createMarca);

// Ruta para crear marca con imagen
router.post('/upload', upload.single('logoFile'), marcasController.createMarcaWithImage);

// Ruta para actualizar una marca existente
router.put('/:id', marcasController.updateMarca);

// Ruta para actualizar marca con imagen
router.put('/:id/upload', upload.single('logoFile'), marcasController.updateMarcaWithImage);

// Ruta para eliminar una marca
router.delete('/:id', marcasController.deleteMarca);

module.exports = router;
