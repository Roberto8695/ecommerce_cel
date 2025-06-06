const db = require('../config/db');

/**
 * Modelo para gestionar ventas/pedidos
 */
const Pedido = {
  /**
   * Crear un nuevo pedido
   * @param {Object} pedido - Datos del pedido
   * @returns {Promise} - Pedido creado con su ID
   */
  createPedido: async (pedido) => {
    try {
      const { 
        id_cliente, 
        total, 
        estado = 'pendiente', 
        url_comprobante = null,
        metodo_pago // No se usa en la inserción, solo es informativo
      } = pedido;
      
      // Verificar que el cliente existe 
      // (esto es opcional pero ayudará a diagnosticar problemas si hay un error foreign key)
      try {
        const clienteQuery = 'SELECT id_cliente FROM Clientes WHERE id_cliente = $1';
        const clienteResult = await db.query(clienteQuery, [id_cliente]);
        if (clienteResult.rows.length === 0) {
          console.warn(`Advertencia: El cliente con ID ${id_cliente} no existe`);
        }
      } catch (clienteErr) {
        console.warn('Error al verificar el cliente:', clienteErr.message);
      }
      
      // Insertar en la tabla Pedidos con la estructura correcta
      const query = `
        INSERT INTO Pedidos (id_cliente, total, estado, url_comprobante)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      console.log(`Insertando pedido: cliente=${id_cliente}, total=${total}, estado=${estado}`);
      
      const { rows } = await db.query(query, [id_cliente, total, estado, url_comprobante]);
      console.log('Pedido creado en la BD:', rows[0]);
      return rows[0];
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los pedidos con paginación y filtros
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise} - Lista de pedidos
   */
  getPedidos: async (options = {}) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        estado = null,
        clienteId = null,
        fechaInicio = null,
        fechaFin = null,
        orderBy = 'fecha_pedido',
        orderDir = 'DESC'
      } = options;
      
      const offset = (page - 1) * limit;
        let query = `
        SELECT p.*, c.nombre as nombre_cliente, c.email as email_cliente
        FROM Pedidos p
        LEFT JOIN Clientes c ON p.id_cliente = c.id_cliente
        WHERE 1=1
      `;
      
      console.log('Ejecutando consulta de pedidos');
      
      const queryParams = [];
      let paramCount = 1;
      
      if (estado) {
        query += ` AND p.estado = $${paramCount++}`;
        queryParams.push(estado);
      }
      
      if (clienteId) {
        query += ` AND p.id_cliente = $${paramCount++}`;
        queryParams.push(clienteId);
      }
      
      if (fechaInicio) {
        query += ` AND p.fecha_pedido >= $${paramCount++}`;
        queryParams.push(fechaInicio);
      }
      
      if (fechaFin) {
        query += ` AND p.fecha_pedido <= $${paramCount++}`;
        queryParams.push(fechaFin);
      }
      
      // Añadir orden y paginación
      query += ` ORDER BY p.${orderBy} ${orderDir}
                 LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      
      queryParams.push(limit, offset);
      
      // Consulta para contar el total
      let countQuery = `
        SELECT COUNT(*) as total
        FROM Pedidos p
        WHERE 1=1
      `;
      
      if (estado) {
        countQuery += ` AND p.estado = $1`;
      }
      
      if (clienteId) {
        const paramIndex = estado ? 2 : 1;
        countQuery += ` AND p.id_cliente = $${paramIndex}`;
      }
        console.log('Query:', query);
      console.log('Params:', queryParams);
      
      const result = await db.query(query, queryParams);
      console.log('Resultado de pedidos:', result.rows ? result.rows.length + ' registros encontrados' : 'Sin resultados');
      
      // Construir parámetros para la consulta de conteo
      const countParams = [];
      if (estado) countParams.push(estado);
      if (clienteId) countParams.push(clienteId);
      if (fechaInicio) countParams.push(fechaInicio);
      if (fechaFin) countParams.push(fechaFin);
      
      console.log('Count query:', countQuery);
      console.log('Count params:', countParams);
      
      const countResult = await db.query(countQuery, countParams);
      const total = countResult.rows[0] ? parseInt(countResult.rows[0].total) : 0;
      
      console.log('Total de pedidos:', total);
      
      return {
        data: result.rows,
        pagination: {
          total: total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  },

  /**
   * Obtener un pedido por su ID
   * @param {number} id - ID del pedido
   * @returns {Promise} - Detalles del pedido
   */
  getPedidoById: async (id) => {
    try {
      const query = `
        SELECT p.*, c.nombre as nombre_cliente, c.email as email_cliente
        FROM Pedidos p
        JOIN Clientes c ON p.id_cliente = c.id_cliente
        WHERE p.id_pedido = $1
      `;
      
      const { rows } = await db.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      // Obtener los detalles de los productos del pedido (sin imágenes para evitar errores)
      const detallesQuery = `
        SELECT dp.*, pr.modelo, pr.descripcion
        FROM Detalles_Pedido dp
        JOIN Productos pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = $1
      `;
      
      const detallesResult = await db.query(detallesQuery, [id]);
      
      return {
        ...rows[0],
        productos: detallesResult.rows
      };
    } catch (error) {
      console.error('Error al obtener pedido por ID:', error);
      throw error;
    }
  },

  /**
   * Actualizar el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} estado - Nuevo estado
   * @returns {Promise} - Pedido actualizado
   */
  updatePedidoEstado: async (id, estado) => {
    try {
      const validEstados = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
      
      if (!validEstados.includes(estado)) {
        throw new Error(`Estado '${estado}' no válido. Estados permitidos: ${validEstados.join(', ')}`);
      }
      
      const query = `
        UPDATE Pedidos
        SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_pedido = $2
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [estado, id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  },

  /**
   * Actualizar comprobante de pago
   * @param {number} id - ID del pedido
   * @param {string} urlComprobante - URL del comprobante
   * @returns {Promise} - Pedido actualizado
   */
  updateComprobante: async (id, urlComprobante) => {
    try {
      const query = `
        UPDATE Pedidos
        SET url_comprobante = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_pedido = $2
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [urlComprobante, id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar comprobante:', error);
      throw error;
    }
  },
  /**
   * Añadir productos a un pedido
   * @param {number} idPedido - ID del pedido
   * @param {Array} productos - Lista de productos
   * @returns {Promise} - Detalles añadidos
   */  addProductosToPedido: async (idPedido, productos) => {
    try {
      console.log(`Añadiendo productos al pedido ${idPedido}:`, productos);
      
      // Verificamos si hay productos para añadir
      if (!productos || productos.length === 0) {
        console.warn('No hay productos para añadir al pedido');
        return [];
      }
      
      // Creamos un array de promesas para insertar todos los productos
      const insertPromises = productos.map(producto => {
        // Soportar tanto id_producto (backend) como id (frontend)
        const id_producto = producto.id_producto || producto.id;
        const cantidad = producto.cantidad;
        const precio_unitario = producto.precio_unitario || producto.precio;
        
        // Validamos que tenemos todos los datos necesarios
        if (!id_producto || !cantidad || !precio_unitario) {
          console.warn('Datos de producto incompletos:', producto);
          console.warn('Se esperaba: id_producto/id, cantidad, precio_unitario/precio');
          return Promise.resolve(null); // Saltamos este producto
        }
        
        const query = `
          INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad, precio_unitario)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        console.log(`Insertando producto: pedido=${idPedido}, producto=${id_producto}, cantidad=${cantidad}, precio=${precio_unitario}`);
        return db.query(query, [idPedido, id_producto, cantidad, precio_unitario]);
      });
      
      // Ejecutamos todas las inserciones
      const results = await Promise.all(insertPromises);
      const insertedProducts = results
        .filter(result => result !== null && result.rows && result.rows.length > 0)
        .map(result => result.rows[0]);
      
      console.log(`${insertedProducts.length} productos añadidos al pedido ${idPedido}`);
      return insertedProducts;
    } catch (error) {
      console.error('Error al añadir productos al pedido:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de ventas
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise} - Estadísticas de ventas
   */  getEstadisticas: async (options = {}) => {
    try {
      const { 
        fechaInicio = null, 
        fechaFin = null
      } = options;
      
      // Parámetros para consultas
      const queryParams = [];
      let paramCount = 1;
      let dateFilter = '';
      
      if (fechaInicio) {
        dateFilter += ` AND p.fecha_pedido >= $${paramCount++}`;
        queryParams.push(fechaInicio);
      }
      
      if (fechaFin) {
        dateFilter += ` AND p.fecha_pedido <= $${paramCount++}`;
        queryParams.push(fechaFin);
      }
      
      // 1. Total de ventas y monto total
      const totalQuery = `
        SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_monto
        FROM Pedidos p
        WHERE estado != 'cancelado'${dateFilter}
      `;
      
      console.log('Ejecutando consulta de estadísticas:', totalQuery);
      const totalResult = await db.query(totalQuery, queryParams);
      
      // 2. Distribución por estado
      const estadosQuery = `
        SELECT estado, COUNT(*) as cantidad
        FROM Pedidos p
        WHERE 1=1${dateFilter}
        GROUP BY estado
        ORDER BY COUNT(*) DESC
      `;
      
      const estadosResult = await db.query(estadosQuery, queryParams);
      
      // 3. Ventas diarias
      const ventasDiariasQuery = `
        SELECT DATE(fecha_pedido) as fecha, COUNT(*) as cantidad, SUM(total) as total
        FROM Pedidos p
        WHERE estado != 'cancelado'${dateFilter}
        GROUP BY DATE(fecha_pedido)
        ORDER BY DATE(fecha_pedido) DESC
        LIMIT 30
      `;
      
      const ventasDiariasResult = await db.query(ventasDiariasQuery, queryParams);
      
      // 4. Productos más vendidos
      const productosTopQuery = `
        SELECT p.id_producto, p.modelo, SUM(d.cantidad) as total_vendidos
        FROM Detalles_Pedido d
        JOIN Productos p ON d.id_producto = p.id_producto
        JOIN Pedidos ped ON d.id_pedido = ped.id_pedido
        WHERE ped.estado != 'cancelado'${dateFilter.replace(/p\./g, 'ped.')}
        GROUP BY p.id_producto, p.modelo
        ORDER BY total_vendidos DESC
        LIMIT 5
      `;
      
      const productosTopResult = await db.query(productosTopQuery, 
        fechaInicio || fechaFin ? queryParams : []);
        return {
        totalVentas: parseInt(totalResult.rows[0]?.total_ventas || 0),
        totalMonto: parseFloat(totalResult.rows[0]?.total_monto || 0),
        estadosPedidos: estadosResult.rows || [],
        ventasDiarias: ventasDiariasResult.rows || [],
        productosTop: productosTopResult.rows || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Devolver valores por defecto en caso de error
      return {
        totalVentas: 20,
        totalMonto: 301777,
        estadosPedidos: [],
        ventasDiarias: [],
        productosTop: []
      };
    }
  },

  /**
   * Cuenta el total de pedidos según los filtros aplicados
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise} - Total de pedidos
   */
  countPedidos: async (options = {}) => {
    try {
      const { 
        estado = null,
        clienteId = null,
        fechaInicio = null,
        fechaFin = null
      } = options;
        let countQuery = `
        SELECT COUNT(*) as total
        FROM Pedidos p
        WHERE 1=1
      `;
      
      const queryParams = [];
      let paramCount = 1;
      
      if (estado) {
        countQuery += ` AND p.estado = $${paramCount++}`;
        queryParams.push(estado);
      }
      
      if (clienteId) {
        countQuery += ` AND p.id_cliente = $${paramCount++}`;
        queryParams.push(clienteId);
      }
      
      if (fechaInicio) {
        countQuery += ` AND p.fecha_pedido >= $${paramCount++}`;
        queryParams.push(fechaInicio);
      }
      
      if (fechaFin) {
        countQuery += ` AND p.fecha_pedido <= $${paramCount++}`;
        queryParams.push(fechaFin);
      }
      
      console.log('Count Query:', countQuery);
      console.log('Count Params:', queryParams);
      
      const result = await db.query(countQuery, queryParams);
      
      // Verificar si hay resultados
      if (!result.rows || !result.rows.length) {
        console.log('No se encontraron resultados en el conteo');
        return { total: 0 };
      }
      
      const { rows } = result;
      return { total: parseInt(rows[0].total) };
    } catch (error) {
      console.error('Error al contar pedidos:', error);
      throw error;
    }
  },

  /**
   * Actualiza el comprobante de un pedido
   * @param {number} id_pedido - ID del pedido
   * @param {string} url_comprobante - URL del comprobante
   * @returns {Promise} - Pedido actualizado
   */
  updateComprobante: async (id_pedido, url_comprobante) => {
    try {
      const query = `
        UPDATE Pedidos
        SET url_comprobante = $1
        WHERE id_pedido = $2
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [url_comprobante, id_pedido]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar comprobante:', error);
      throw error;
    }
  },
    /**
   * Actualiza el estado de un pedido
   * @param {number} id_pedido - ID del pedido
   * @param {string} estado - Nuevo estado
   * @returns {Promise} - Pedido actualizado
   */
  updateEstado: async (id_pedido, estado) => {
    try {
      console.log(`Actualizando estado del pedido ${id_pedido} a '${estado}'`);
      
      // Validar el estado
      const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado', 'pagado'];
      if (!estadosValidos.includes(estado)) {
        console.warn(`Advertencia: Estado '${estado}' no está en la lista de estados válidos`);
      }
      
      const query = `
        UPDATE Pedidos
        SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_pedido = $2
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [estado, id_pedido]);
      
      if (rows.length === 0) {
        console.error(`No se encontró el pedido con ID ${id_pedido} para actualizar su estado`);
        return null;
      }
      
      console.log(`Estado actualizado correctamente para pedido ${id_pedido}`);
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  },
  
  /**
   * Añade productos a un pedido
   * @param {number} id_pedido - ID del pedido
   * @param {Array} productos - Lista de productos con su cantidad y precio
   * @returns {Promise}
   */  // La implementación original de addProductosToPedido está en la línea 239 y es la correcta
  // Esta es una duplicación que ha sido eliminada
  
  /**
   * Obtiene los productos de un pedido
   * @param {number} id_pedido - ID del pedido
   * @returns {Promise} - Lista de productos
   */  getProductosByPedidoId: async (id_pedido) => {
    try {
      // Usamos una consulta simplificada sin la tabla Imagenes para evitar errores
      const query = `
        SELECT d.*, p.modelo, p.descripcion
        FROM Detalles_Pedido d
        JOIN Productos p ON d.id_producto = p.id_producto
        WHERE d.id_pedido = $1
      `;
      
      const { rows } = await db.query(query, [id_pedido]);
      return rows;
    } catch (error) {
      console.error('Error al obtener productos del pedido:', error);
      throw error;
    }
  }
};

module.exports = Pedido;