const Pedido = require('../models/ventas.model');
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

// Funciones del controlador
exports.createPedido = async (req, res) => {
  try {
    const requiredFields = ['id_cliente', 'total', 'productos'];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `El campo ${field} es obligatorio`
        });
      }
    }
    
    const { id_cliente, total, estado = 'pendiente', productos } = req.body;
    
    // Crear pedido
    const pedido = await Pedido.createPedido({
      id_cliente,
      total,
      estado
    });
    
    // Agregar productos al pedido
    await Pedido.addProductosToPedido(pedido.id_pedido, productos);
    
    // Obtener el pedido completo con sus productos
    const pedidoCompleto = await Pedido.getPedidoById(pedido.id_pedido);
    
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: pedidoCompleto
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

exports.uploadComprobante = async (req, res) => {
  try {
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
        
        // Obtener el pedido para verificar
        const pedidoExistente = await Pedido.getPedidoById(id);
        
        if (!pedidoExistente) {
          // Eliminar archivo subido
          fs.unlinkSync(req.file.path);
          
          return res.status(404).json({
            success: false,
            message: `El pedido con ID ${id} no existe`
          });
        }
        
        // URL relativa del comprobante
        const urlComprobante = `/uploads/comprobantes/${req.file.filename}`;
        
        // Actualizar en la base de datos
        const pedidoActualizado = await Pedido.updateComprobante(id, urlComprobante);
        
        res.json({
          success: true,
          message: 'Comprobante subido exitosamente',
          data: {
            ...pedidoActualizado,
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
  } catch (error) {
    console.error('Error al subir comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

exports.getPedidos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      estado,
      cliente_id: clienteId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      orden = 'fecha_pedido',
      direccion = 'DESC'
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      estado,
      clienteId,
      fechaInicio,
      fechaFin,
      orderBy: orden,
      orderDir: direccion.toUpperCase()
    };
    
    const resultado = await Pedido.getPedidos(options);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

exports.getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.getPedidoById(id);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: `El pedido con ID ${id} no existe`
      });
    }
    
    // Si hay comprobante, agregar URL completa
    if (pedido.url_comprobante) {
      pedido.url_comprobante_completa = `${req.protocol}://${req.get('host')}${pedido.url_comprobante}`;
    }
    
    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El campo estado es obligatorio'
      });
    }
    
    // Validar los estados permitidos
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Los estados permitidos son: ${estadosValidos.join(', ')}`
      });
    }
    
    const pedidoActualizado = await Pedido.updatePedidoEstado(id, estado);
    
    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: `El pedido con ID ${id} no existe`
      });
    }
    
    res.json({
      success: true,
      message: `Estado del pedido actualizado a: ${estado}`,
      data: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

exports.getEstadisticas = async (req, res) => {
  try {
    const {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    } = req.query;
    
    const estadisticas = await Pedido.getEstadisticas({
      fechaInicio,
      fechaFin,
    });
    
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};
