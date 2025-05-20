const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/comprobantes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `comprobante-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif) y PDF'));
  }
});

// Simple controlador con los métodos necesarios
const simpleController = {
  test: (req, res) => {
    res.json({ message: 'Prueba exitosa' });
  },
  
  uploadComprobante: async (req, res) => {
    const uploadMiddleware = upload.single('comprobante');
    
    uploadMiddleware(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Error al subir el archivo: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Si no hay archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }
      
      try {
        const { id } = req.params;
        
        // URL relativa del comprobante
        const urlComprobante = `/uploads/comprobantes/${req.file.filename}`;
        
        // En una aplicación real, aquí guardaríamos la URL en la base de datos
        // asociada al pedido con ID 'id'
        
        res.json({
          success: true,
          message: 'Comprobante subido exitosamente',
          data: {
            id_pedido: id,
            url_comprobante: urlComprobante,
            url_comprobante_completa: `${req.protocol}://${req.get('host')}${urlComprobante}`
          }
        });
      } catch (error) {
        // Eliminar archivo subido en caso de error
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error('Error al procesar comprobante:', error);
        res.status(500).json({
          success: false,
          message: 'Error al procesar la solicitud',
          error: error.message
        });
      }
    });
  }
};

module.exports = simpleController;
