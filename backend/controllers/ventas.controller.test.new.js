// Controlador de ventas simplificado
const Pedido = require('../models/ventas.model'); // Utilizamos el modelo corregido

// Función para crear un pedido
exports.createPedido = async (req, res) => {
  try {
    console.log('Intentando crear un pedido con datos:', req.body);
    // Validar datos requeridos
    const { id_cliente, productos, total, metodo_pago } = req.body;
    
    if (!id_cliente || !productos || !productos.length || !total) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos. Se requiere id_cliente, productos y total.'
      });
    }

    // Crear el pedido principal
    const pedido = await Pedido.createPedido({
      id_cliente,
      total,
      estado: metodo_pago === 'tarjeta' ? 'pagado' : 'pendiente', // Si es tarjeta se considera pagado, si es QR o transferencia queda pendiente
      metodo_pago
    });
    
    console.log('Pedido creado:', pedido);

    // Agregar los productos al pedido
    await Pedido.addProductosToPedido(pedido.id_pedido, productos);
    console.log('Productos añadidos al pedido');

    // Obtener el pedido completo para enviar en la respuesta
    const pedidoCompleto = await Pedido.getPedidoById(pedido.id_pedido);

    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      data: pedidoCompleto
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Función para subir comprobante
exports.uploadComprobante = async (req, res) => {
  try {
    console.log('Intentando subir comprobante para pedido ID:', req.params.id);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    // Construir la URL del comprobante
    const urlComprobante = `/uploads/comprobantes/${req.file.filename}`;
    console.log('URL del comprobante:', urlComprobante);

    // Actualizar el pedido en la base de datos
    const pedido = await Pedido.updateComprobante(req.params.id, urlComprobante);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el pedido con ID ${req.params.id}`
      });
    }

    // También actualizar el estado a 'pagado' si corresponde
    if (pedido.estado === 'pendiente') {
      await Pedido.updateEstado(req.params.id, 'pagado');
      console.log(`Estado del pedido ${req.params.id} actualizado a 'pagado'`);
    }

    res.json({
      success: true,
      message: 'Comprobante subido y pedido actualizado correctamente',
      data: {
        url_comprobante: urlComprobante,
      } 
    });
  } catch (error) {
    console.error('Error al subir comprobante:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Función para obtener pedidos
exports.getPedidos = async (req, res) => {
  try {
    // Obtener parámetros de filtrado y paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado || null;
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    
    // Preparar opciones para la consulta
    const options = {
      page,
      limit,
      estado,
      fechaInicio,
      fechaFin,
    };
    
    console.log('Obteniendo pedidos con opciones:', options);
    
    // Obtener pedidos desde el modelo
    const pedidosResult = await Pedido.getPedidos(options);
    const countResult = await Pedido.countPedidos(options);
    
    console.log('Total pedidos encontrados:', countResult.total);
    
    if (!pedidosResult.data || pedidosResult.data.length === 0) {
      console.log('No se encontraron pedidos en la base de datos');
    }
    
    // Enviar respuesta con datos y paginación
    return res.json({
      success: true,
      data: pedidosResult.data || [],
      pagination: {
        page: page,
        limit: limit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error("Error en getPedidos:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al consultar los pedidos",
      error: error.message 
    });
  }
};

// Función para obtener un pedido por ID
exports.getPedidoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`Obteniendo pedido con ID: ${id}`);
    
    // Obtener el pedido real de la base de datos
    const pedido = await Pedido.getPedidoById(id);
    
    if (pedido) {
      console.log(`Pedido encontrado en la BD:`, pedido.id_pedido);
      return res.json({
        success: true,
        data: pedido
      });
    } else {
      console.log(`No se encontró el pedido con ID ${id}`);
      return res.status(404).json({
        success: false,
        message: `No se encontró el pedido con ID ${id}`
      });
    }
  } catch (error) {
    console.error(`Error al obtener pedido ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error al consultar el pedido en la base de datos",
      error: error.message 
    });
  }
};

// Función para actualizar estado de un pedido
exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado el nuevo estado'
      });
    }
    
    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Los estados permitidos son: ${estadosValidos.join(', ')}`
      });
    }
    
    // Actualizar el estado
    const pedidoActualizado = await Pedido.updateEstado(id, estado);
    
    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el pedido con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: `Estado del pedido actualizado a '${estado}'`,
      data: pedidoActualizado
    });
  } catch (error) {
    console.error(`Error al actualizar estado:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar el estado del pedido",
      error: error.message 
    });
  }
};

// Función para obtener estadísticas
exports.getEstadisticas = async (req, res) => {
  try {
    // Obtener parámetros de filtrado
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    
    // Preparar opciones para la consulta
    const options = { fechaInicio, fechaFin };
    
    console.log('Obteniendo estadísticas con opciones:', options);
    
    // Obtener estadísticas reales de la DB
    const estadisticas = await Pedido.getEstadisticas(options);
    
    console.log('Estadísticas obtenidas de la BD:', estadisticas ? 'Éxito' : 'No hay datos');
    
    return res.json({
      success: true,
      data: estadisticas || {
        totalVentas: 0,
        totalMonto: 0,
        estadosPedidos: [],
        ventasDiarias: [],
        productosTop: []
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener estadísticas de ventas",
      error: error.message 
    });
  }
};
