// Controlador de ventas ultra simple

// Función para obtener pedidos
const getPedidos = (req, res) => {
  // Datos de ejemplo
  const pedidos = [];
  
  for (let i = 1; i <= 10; i++) {
    pedidos.push({
      id_pedido: i,
      nombre_cliente: `Cliente ${i}`,
      total: i * 1000,
      estado: 'pendiente',
      fecha_pedido: new Date()
    });
  }
  
  // Respuesta con paginación simulada
  res.json({
    success: true,
    data: pedidos,
    pagination: {
      page: 1,
      limit: 10,
      total: 25,
      pages: 3
    }
  });
};

// Función para obtener un pedido por ID
const getPedidoById = (req, res) => {
  // Pedido de ejemplo
  const pedido = {
    id_pedido: req.params.id,
    nombre_cliente: 'Cliente Ejemplo',
    total: 5000,
    estado: 'pendiente',
    fecha_pedido: new Date(),
    productos: [
      { nombre: 'Producto 1', cantidad: 1, precio: 3000 },
      { nombre: 'Producto 2', cantidad: 2, precio: 1000 }
    ]
  };
  
  res.json({
    success: true,
    data: pedido
  });
};

// Función para actualizar estado
const updateEstado = (req, res) => {
  res.json({
    success: true,
    message: 'Estado actualizado',
    data: {
      id_pedido: req.params.id,
      estado: req.body.estado || 'procesando'
    }
  });
};

// Función para estadísticas
const getEstadisticas = (req, res) => {
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
};

// Función para crear pedido (para completar CRUD)
const createPedido = (req, res) => {
  res.json({
    success: true,
    message: 'Pedido creado',
    data: {
      id_pedido: Math.floor(Math.random() * 1000),
      ...req.body
    }
  });
};

// Función para subir comprobante
const uploadComprobante = (req, res) => {
  res.json({
    success: true,
    message: 'Comprobante subido',
    data: {
      url_comprobante: '/uploads/comprobantes/ejemplo.jpg'
    }
  });
};

module.exports = {
  getPedidos,
  getPedidoById,
  updateEstado,
  getEstadisticas,
  createPedido,
  uploadComprobante
};
