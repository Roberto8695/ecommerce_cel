// Controlador para gestionar pedidos
const Pedido = require('../models/ventas.model');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración para almacenamiento de comprobantes
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

// Crear un nuevo pedido
const createPedido = async (req, res) => {  try {
    // Validar datos requeridos
    const { id_cliente, productos, total, metodo_pago } = req.body;
    
    console.log('Datos recibidos para crear pedido:', {
      id_cliente,
      total,
      metodo_pago,
      productos: productos?.length ? `${productos.length} productos` : 'No hay productos'
    });
    
    if (!id_cliente || !productos || !productos.length || !total) {
      console.error('Datos incompletos para crear pedido', {
        id_cliente: !!id_cliente,
        productos: !!productos,
        productosLength: productos?.length,
        total: !!total
      });
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos. Se requiere id_cliente, productos y total.'
      });
    }
    
    // Verificar que el cliente exista antes de crear el pedido
    try {
      const clienteQuery = 'SELECT id_cliente FROM Clientes WHERE id_cliente = $1';
      const clienteResult = await db.query(clienteQuery, [id_cliente]);
      if (clienteResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `El cliente con ID ${id_cliente} no existe`
        });
      }
    } catch (err) {
      console.warn('Error al verificar el cliente:', err.message);
      // Continuamos con la creación del pedido
    }

    // Crear el pedido principal
    const pedido = await Pedido.createPedido({
      id_cliente,
      total,
      estado: metodo_pago === 'tarjeta' ? 'pagado' : 'pendiente', // Si es tarjeta se considera pagado, si es QR o transferencia queda pendiente
      metodo_pago
    });

    console.log('Pedido creado en BD:', pedido);

    try {
      // Agregar los productos al pedido
      const detalles = await Pedido.addProductosToPedido(pedido.id_pedido, productos);
      console.log(`${detalles.length} productos agregados al pedido ${pedido.id_pedido}`);
    } catch (detallesError) {
      // Si hay un error al agregar productos, aún así devolvemos el pedido creado
      // pero incluimos un mensaje de advertencia
      console.error('Error al agregar productos al pedido:', detallesError);
      return res.status(201).json({
        success: true,
        message: 'Pedido creado, pero hubo un problema al agregar algunos productos',
        warning: detallesError.message,
        data: {
          id_pedido: pedido.id_pedido,
          ...pedido
        }
      });
    }
    
    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      data: {
        id_pedido: pedido.id_pedido,
        ...pedido
      }
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pedido',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Subir comprobante de pago para un pedido
const uploadComprobante = async (req, res) => {
  try {
    console.log('Procesando subida de comprobante...');
    const uploadMiddleware = upload.single('comprobante');
    
    uploadMiddleware(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        console.error('Error de Multer al subir archivo:', err);
        return res.status(400).json({
          success: false,
          message: `Error al subir el archivo: ${err.message}`
        });
      } else if (err) {
        console.error('Error general al subir archivo:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Si no hay archivo
      if (!req.file) {
        console.error('No se ha recibido ningún archivo en la petición');
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado un comprobante'
        });
      }
      
      console.log('Archivo recibido:', req.file);
      
      // ID del pedido
      const { id } = req.params;
      
      if (!id) {
        console.error('No se ha proporcionado ID del pedido');
        return res.status(400).json({
          success: false,
          message: 'ID del pedido no proporcionado'
        });
      }
        try {
        // Ruta del comprobante
        const url_comprobante = `/uploads/comprobantes/${req.file.filename}`;
        console.log(`Guardando comprobante para pedido ${id}: ${url_comprobante}`);
        
        // Verificar que el pedido existe usando una consulta simple
        // para evitar problemas con la tabla Imagenes
        const pedidoQuery = `
          SELECT * FROM Pedidos WHERE id_pedido = $1
        `;
        const pedidoResult = await db.query(pedidoQuery, [id]);
        
        if (pedidoResult.rows.length === 0) {
          console.error(`Pedido con ID ${id} no encontrado`);
          return res.status(404).json({
            success: false,
            message: `Pedido con ID ${id} no encontrado`
          });
        }
        
        const pedidoExistente = pedidoResult.rows[0];
        
        // Actualizar el pedido con la URL del comprobante
        const pedidoActualizado = await Pedido.updateComprobante(id, url_comprobante);
        
        if (!pedidoActualizado) {
          console.error(`No se pudo actualizar el pedido ${id} con el comprobante`);
          return res.status(404).json({
            success: false,
            message: 'No se pudo actualizar el pedido'
          });
        }
        
        console.log('Pedido actualizado con URL de comprobante:', pedidoActualizado);
        
        // Si el método de pago es QR o transferencia, actualizamos el estado a 'procesando'
        if (pedidoActualizado.metodo_pago === 'qr' || pedidoActualizado.metodo_pago === 'transferencia') {
          console.log(`Actualizando estado del pedido ${id} a 'procesando'`);
          await Pedido.updateEstado(id, 'procesando');
        }
        
        res.status(200).json({
          success: true,
          message: 'Comprobante subido correctamente',
          data: {
            url_comprobante,
            id_pedido: id
          }
        });
      } catch (error) {
        console.error('Error al actualizar el pedido con el comprobante:', error);
        res.status(500).json({
          success: false,
          message: 'Error al procesar el comprobante',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los pedidos (con filtros para cliente o admin)
const getPedidos = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, fecha_inicio, fecha_fin } = req.query;
    const clienteId = req.user && !req.user.isAdmin ? req.user.id : req.query.id_cliente;
    
    // Preparar opciones de filtrado
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      estado,
      clienteId,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin
    };
    
    // Obtener pedidos
    const result = await Pedido.getPedidos(options);
    
    // Contar total de pedidos con los mismos filtros
    const countResult = await Pedido.countPedidos(options);
    const total = countResult.total;
    
    // Preparar datos para paginación
    const totalPages = Math.ceil(total / options.limit);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

// Obtener un pedido específico por ID
const getPedidoById = async (req, res) => {  try {
    const { id } = req.params;
    
    // Validar si el usuario tiene acceso al pedido con una consulta directa
    // para evitar problemas con la tabla Imagenes
    const pedidoQuery = `
      SELECT p.*, c.nombre as nombre_cliente, c.email as email_cliente
      FROM Pedidos p
      JOIN Clientes c ON p.id_cliente = c.id_cliente
      WHERE p.id_pedido = $1
    `;
    
    const pedidoResult = await db.query(pedidoQuery, [id]);
    
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    const pedido = pedidoResult.rows[0];
    
    // Si no es admin y el pedido no le pertenece
    if (req.user && !req.user.isAdmin && pedido.id_cliente !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este pedido'
      });
    }
    
    // Obtener productos del pedido con una consulta directa
    // para evitar problemas con la tabla Imagenes
    const productosQuery = `
      SELECT dp.*, pr.modelo, pr.descripcion
      FROM Detalles_Pedido dp
      JOIN Productos pr ON dp.id_producto = pr.id_producto
      WHERE dp.id_pedido = $1
    `;
    
    const productosResult = await db.query(productosQuery, [id]);
    pedido.productos = productosResult.rows;
    
    // Si hay comprobante, añadir la URL completa
    if (pedido.url_comprobante) {
      pedido.url_comprobante_completa = `${process.env.API_URL || 'http://localhost:5000'}${pedido.url_comprobante}`;
    }
    
    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pedido',
      error: error.message
    });
  }
};

// Actualizar el estado de un pedido
const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Estado no proporcionado'
      });
    }
    
    // Validar estado
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado', 'pagado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    // Actualizar estado
    const pedidoActualizado = await Pedido.updateEstado(id, estado);
    
    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado',
      error: error.message
    });
  }
};

// Obtener estadísticas de ventas (solo para admin)
const getEstadisticas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const options = {
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin
    };
    
    // Obtener estadísticas
    const estadisticas = await Pedido.getEstadisticas(options);
    
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  createPedido,
  uploadComprobante,
  getPedidos,
  getPedidoById,
  updateEstado,
  getEstadisticas
};
