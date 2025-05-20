// Controlador de pedidos con consultas directas a la base de datos
// para evitar problemas con tablas inexistentes
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

// Crear un nuevo pedido con consultas directas a la base de datos
const createPedidoDirect = async (req, res) => {
  const client = await db.getClient();
  
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    
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
    
    // Verificar que el cliente exista
    const clienteQuery = 'SELECT id_cliente FROM Clientes WHERE id_cliente = $1';
    const clienteResult = await client.query(clienteQuery, [id_cliente]);
    
    if (clienteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: `El cliente con ID ${id_cliente} no existe`
      });
    }
    
    // Crear el pedido principal
    const estado = metodo_pago === 'tarjeta' ? 'pagado' : 'pendiente';
    const pedidoQuery = `
      INSERT INTO Pedidos (id_cliente, total, estado, metodo_pago)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const pedidoResult = await client.query(pedidoQuery, [id_cliente, total, estado, metodo_pago]);
    const pedido = pedidoResult.rows[0];
    console.log('Pedido creado en BD:', pedido);
    
    // Insertar los productos del pedido
    let detallesInsertados = 0;
    for (const producto of productos) {
      // Extraer los datos del producto
      const id_producto = producto.id_producto || producto.id;
      const cantidad = producto.cantidad;
      const precio_unitario = producto.precio_unitario || producto.precio;
      
      if (!id_producto || !cantidad || !precio_unitario) {
        console.warn('Datos de producto incompletos, se omite:', producto);
        continue;
      }
      
      // Verificar que el producto exista
      const productoExisteQuery = 'SELECT id_producto FROM Productos WHERE id_producto = $1';
      const productoExisteResult = await client.query(productoExisteQuery, [id_producto]);
      
      if (productoExisteResult.rows.length === 0) {
        console.warn(`Producto con ID ${id_producto} no existe, se omite`);
        continue;
      }
      
      // Insertar el detalle del pedido
      const detalleQuery = `
        INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      try {
        const detalleResult = await client.query(detalleQuery, [pedido.id_pedido, id_producto, cantidad, precio_unitario]);
        if (detalleResult.rows.length > 0) {
          detallesInsertados++;
        }
      } catch (detalleError) {
        console.error(`Error al añadir producto ${id_producto} al pedido:`, detalleError);
      }
    }
    
    // Confirmar la transacción
    await client.query('COMMIT');
    
    console.log(`Pedido ${pedido.id_pedido} creado con ${detallesInsertados} productos`);
    
    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      data: {
        id_pedido: pedido.id_pedido,
        ...pedido,
        productos_agregados: detallesInsertados
      }
    });
    
  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pedido',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Liberar el cliente de la transacción
    client.release();
  }
};

// Subir comprobante de pago para un pedido con consulta directa
const uploadComprobanteDirect = async (req, res) => {
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
        
        // Verificar que el pedido existe con consulta directa
        const pedidoQuery = 'SELECT * FROM Pedidos WHERE id_pedido = $1';
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
        const updateQuery = `
          UPDATE Pedidos
          SET url_comprobante = $1, fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_pedido = $2
          RETURNING *
        `;
        
        const updateResult = await db.query(updateQuery, [url_comprobante, id]);
        
        if (updateResult.rows.length === 0) {
          console.error(`No se pudo actualizar el pedido ${id} con el comprobante`);
          return res.status(500).json({
            success: false,
            message: 'No se pudo actualizar el pedido'
          });
        }
        
        const pedidoActualizado = updateResult.rows[0];
        console.log('Pedido actualizado con URL de comprobante:', pedidoActualizado);
        
        // Si el método de pago es QR o transferencia, actualizamos el estado a 'procesando'
        if (pedidoActualizado.metodo_pago === 'qr' || pedidoActualizado.metodo_pago === 'transferencia') {
          console.log(`Actualizando estado del pedido ${id} a 'procesando'`);
          const estadoQuery = `
            UPDATE Pedidos
            SET estado = 'procesando', fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_pedido = $1
            RETURNING *
          `;
          
          await db.query(estadoQuery, [id]);
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
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Exportar las funciones
module.exports = {
  createPedidoDirect,
  uploadComprobanteDirect
};
