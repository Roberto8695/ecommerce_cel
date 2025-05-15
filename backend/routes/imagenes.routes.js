const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imagenesController = require('../controllers/imagenes.controller');

// Configuración de multer para subida de imágenes de productos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/productos'));
  },
  filename: function (req, file, cb) {
    cb(null, 'producto-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // límite de 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Solo se permiten archivos de imagen (jpg, jpeg, png, webp)"));
  }
});

// Obtener todas las imágenes de un producto
router.get('/producto/:id_producto', imagenesController.getImagenesByProducto);

// Obtener una imagen específica por ID
router.get('/:id', imagenesController.getImagenById);

// Añadir una nueva imagen a un producto
router.post('/producto/:id_producto', upload.array('imagenes'), imagenesController.uploadImagenProducto);

// Actualizar una imagen existente
router.put('/:id', imagenesController.updateImagen);

// Establecer una imagen como principal
router.put('/:id/principal', imagenesController.setImagenPrincipal);

// Eliminar una imagen
router.delete('/:id', imagenesController.deleteImagen);

module.exports = router; 