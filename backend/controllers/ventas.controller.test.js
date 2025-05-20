const Pedido = require('../models/ventas.model');

// Funciones del controlador para gestionar pedidos y ventas
const createPedido = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Pedido creado correctamente',
      data: {
        id_pedido: Math.floor(Math.random() * 1000),
        id_cliente: req.body.id_cliente || 1,
        total: req.body.total || 0,
        estado: req.body.estado || 'pendiente',
        fecha_pedido: new Date()
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadComprobante = async (req, res) => {
  try {
    // Simular subida de comprobante
    res.json({ 
      success: true, 
      message: 'Comprobante subido correctamente',
      data: {
        url_comprobante: '/uploads/comprobantes/demo-comprobante.jpg',
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPedidos = async (req, res) => {
  try {
    // Simulación de pedidos para el panel de administración
    const pedidosDemo = [];
    const total = 25; // Total de pedidos simulados
    
    // Crear datos de ejemplo
    for (let i = 1; i <= 10; i++) {
      pedidosDemo.push({
        id_pedido: i,
        id_cliente: Math.floor(Math.random() * 20) + 1,
        nombre_cliente: `Cliente Demo ${i}`,
        email_cliente: `cliente${i}@ejemplo.com`,
        total: Math.floor(Math.random() * 10000) + 5000,
        estado: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'][Math.floor(Math.random() * 5)],
        fecha_pedido: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        url_comprobante: Math.random() > 0.3 ? '/uploads/comprobantes/demo-comprobante.jpg' : null
      });
    }
    
    // Enviar respuesta con formato de paginación
    res.json({
      success: true,
      data: pedidosDemo,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        total: total,
        pages: Math.ceil(total / (parseInt(req.query.limit) || 10))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPedidoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Simular un pedido con productos
    const pedidoDemo = {
      id_pedido: id,
      id_cliente: Math.floor(Math.random() * 20) + 1,
      nombre_cliente: `Cliente Demo`,
      email_cliente: `cliente${id}@ejemplo.com`,
      total: Math.floor(Math.random() * 10000) + 5000,
      estado: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'][Math.floor(Math.random() * 5)],
      fecha_pedido: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      url_comprobante: Math.random() > 0.3 ? '/uploads/comprobantes/demo-comprobante.jpg' : null,
      productos: [
        {
          id_producto: 1,
          nombre: 'Smartphone XYZ',
          precio: 3999,
          cantidad: 1,
          subtotal: 3999
        },
        {
          id_producto: 5,
          nombre: 'Funda Protectora',
          precio: 299,
          cantidad: 1,
          subtotal: 299
        }
      ]
    };
    
    res.json({
      success: true,
      data: pedidoDemo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ success: false, message: 'El estado es requerido' });
    }
    
    // Simular actualización
    res.json({
      success: true,
      message: `Estado del pedido ${id} actualizado a ${estado}`,
      data: {
        id_pedido: parseInt(id),
        estado: estado
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEstadisticas = async (req, res) => {
  try {
    // Datos de ejemplo para estadísticas
    res.json({
      success: true,
      data: {
        totalVentas: 152,
        totalMonto: 835750,
        estadosPedidos: [
          { estado: 'pendiente', cantidad: 25 },
          { estado: 'pagado', cantidad: 45 },
          { estado: 'enviado', cantidad: 32 },
          { estado: 'entregado', cantidad: 42 },
          { estado: 'cancelado', cantidad: 8 }
        ],
        ventasDiarias: [
          { fecha: '2023-05-01', ventas: 8, monto: 42500 },
          { fecha: '2023-05-02', ventas: 12, monto: 73200 },
          { fecha: '2023-05-03', ventas: 15, monto: 89500 },
          { fecha: '2023-05-04', ventas: 7, monto: 38900 },
          { fecha: '2023-05-05', ventas: 14, monto: 85300 }
        ],
        productosTop: [
          { id_producto: 1, nombre: 'Smartphone XYZ', cantidad: 42 },
          { id_producto: 5, nombre: 'Funda Protectora', cantidad: 38 },
          { id_producto: 3, nombre: 'Audífonos Bluetooth', cantidad: 27 },
          { id_producto: 8, nombre: 'Cargador Rápido', cantidad: 22 },
          { id_producto: 12, nombre: 'Protector de Pantalla', cantidad: 19 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Exportar todas las funciones del controlador
module.exports = {
  createPedido,
  uploadComprobante,
  getPedidos,
  getPedidoById,
  updateEstado,
  getEstadisticas
};
