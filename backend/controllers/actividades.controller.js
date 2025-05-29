const db = require('../config/db');

/**
 * Obtiene las actividades recientes para el dashboard
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getRecentActivities = async (req, res) => {
  try {
    // Actividades de fallback en caso de error
    const actividadesFallback = [
      {
        tipo: 'pedido',
        id: 1,
        descripcion: 'Nuevo pedido - Cliente: Maria García',
        monto: 12500,
        estado: 'completado',
        fecha: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        timestamp: Date.now() - 5 * 60 * 1000
      },
      {
        tipo: 'producto',
        id: 2,
        descripcion: 'Producto: iPhone 13 (Apple)',
        precio: 799.99,
        stock: 24,
        fecha: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        timestamp: Date.now() - 60 * 60 * 1000
      },
      {
        tipo: 'cliente',
        id: 3,
        descripcion: 'Nuevo cliente: José López',
        email: 'jose.lopez@example.com',
        fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        timestamp: Date.now() - 3 * 60 * 60 * 1000
      },
      {
        tipo: 'producto',
        id: 4,
        descripcion: 'Nueva categoría: Accesorios',
        fecha: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        timestamp: Date.now() - 5 * 60 * 60 * 1000
      }
    ];
    
    try {
      // Consulta para obtener pedidos recientes
      const pedidosQuery = `
        SELECT p.id_pedido, p.total, p.estado, p.fecha_pedido,
               c.nombre as nombre_cliente, c.email as email_cliente
        FROM Pedidos p
        JOIN Clientes c ON p.id_cliente = c.id_cliente
        ORDER BY p.fecha_pedido DESC
        LIMIT 5
      `;
      
      // Consulta para obtener productos recientemente actualizados
      const productosQuery = `
        SELECT p.id_producto, p.modelo, p.precio, p.stock, p.fecha_creacion,
               m.nombre as marca_nombre
        FROM Productos p
        JOIN Marcas m ON p.id_marca = m.id_marca
        ORDER BY p.fecha_creacion DESC
        LIMIT 5
      `;
      
      // Consulta para obtener clientes recientes
      const clientesQuery = `
        SELECT id_cliente, nombre, email, creado_en
        FROM Clientes
        ORDER BY creado_en DESC
        LIMIT 5
      `;
      
      // Ejecutar consultas
      const pedidosResult = await db.query(pedidosQuery);
      const productosResult = await db.query(productosQuery);
      const clientesResult = await db.query(clientesQuery);
      
      // Formatear los resultados como actividades
      const actividades = [];
      
      // Añadir actividades de pedidos
      pedidosResult.rows.forEach(pedido => {
        actividades.push({
          tipo: 'pedido',
          id: pedido.id_pedido,
          descripcion: `Nuevo pedido - Cliente: ${pedido.nombre_cliente}`,
          monto: pedido.total,
          estado: pedido.estado,
          fecha: pedido.fecha_pedido,
          timestamp: new Date(pedido.fecha_pedido).getTime()
        });
      });
      
      // Añadir actividades de productos
      productosResult.rows.forEach(producto => {
        actividades.push({
          tipo: 'producto',
          id: producto.id_producto,
          descripcion: `Producto: ${producto.modelo} (${producto.marca_nombre})`,
          precio: producto.precio,
          stock: producto.stock,
          fecha: producto.fecha_creacion,
          timestamp: new Date(producto.fecha_creacion).getTime()
        });
      });
      
      // Añadir actividades de clientes
      clientesResult.rows.forEach(cliente => {
        actividades.push({
          tipo: 'cliente',
          id: cliente.id_cliente,
          descripcion: `Nuevo cliente: ${cliente.nombre}`,
          email: cliente.email,
          fecha: cliente.creado_en,
          timestamp: new Date(cliente.creado_en).getTime()
        });
      });
      
      // Ordenar por fecha (más reciente primero)
      actividades.sort((a, b) => b.timestamp - a.timestamp);
      
      // Tomar las 10 actividades más recientes
      const actividadesRecientes = actividades.slice(0, 10);
      
      res.status(200).json({
        success: true,
        data: actividadesRecientes
      });
    } catch (error) {
      console.error('Error al consultar actividades de la base de datos:', error);
      res.status(200).json({
        success: true,
        data: actividadesFallback,
        message: 'Usando datos de ejemplo debido a un error en la base de datos'
      });
    }
  } catch (error) {
    console.error('Error al obtener actividades recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades recientes',
      error: error.message
    });
  }
};

module.exports = {
  getRecentActivities
};
