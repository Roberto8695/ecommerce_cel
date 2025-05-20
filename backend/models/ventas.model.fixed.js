// Modelo para gestionar ventas/pedidos
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
      
      // Modificado para adaptarse a la estructura real de la tabla
      const query = `
        INSERT INTO Pedidos (id_cliente, total, estado, url_comprobante)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      console.log(`Creando pedido: cliente=${id_cliente}, total=${total}, estado=${estado}`);
      
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
      
      console.log('Query:', query);
      console.log('Params:', queryParams);
      
      const result = await db.query(query, queryParams);
      console.log('Resultado de pedidos:', result.rows ? result.rows.length + ' registros encontrados' : 'Sin resultados');
      
      // Consulta para contar el total
      let countQuery = `
        SELECT COUNT(*) as total
        FROM Pedidos p
        WHERE 1=1
      `;
      
      // Construir parámetros para la consulta de conteo
      const countParams = [];
      let countParamIndex = 1;
      
      if (estado) {
        countQuery += ` AND p.estado = $${countParamIndex++}`;
        countParams.push(estado);
      }
      
      if (clienteId) {
        countQuery += ` AND p.id_cliente = $${countParamIndex++}`;
        countParams.push(clienteId);
      }
      
      if (fechaInicio) {
        countQuery += ` AND p.fecha_pedido >= $${countParamIndex++}`;
        countParams.push(fechaInicio);
      }
      
      if (fechaFin) {
        countQuery += ` AND p.fecha_pedido <= $${countParamIndex++}`;
        countParams.push(fechaFin);
      }
      
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
        LEFT JOIN Clientes c ON p.id_cliente = c.id_cliente
        WHERE p.id_pedido = $1
      `;
      
      const { rows } = await db.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      // Obtener los detalles de los productos del pedido
      const detallesQuery = `
        SELECT dp.*, pr.modelo, pr.descripcion, 
               i.url_imagen as imagen_principal
        FROM Detalles_Pedido dp
        JOIN Productos pr ON dp.id_producto = pr.id_producto
        LEFT JOIN (
          SELECT id_producto, MIN(url_imagen) as url_imagen
          FROM Imagenes
          WHERE es_principal = true
          GROUP BY id_producto
        ) i ON pr.id_producto = i.id_producto
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
   * Añadir productos a un pedido
   * @param {number} idPedido - ID del pedido
   * @param {Array} productos - Lista de productos
   * @returns {Promise} - Detalles añadidos
   */
  addProductosToPedido: async (idPedido, productos) => {
    try {
      console.log(`Añadiendo productos al pedido ${idPedido}:`, productos);
      
      // Verificamos si hay productos para añadir
      if (!productos || productos.length === 0) {
        console.warn('No hay productos para añadir al pedido');
        return [];
      }
      
      // Creamos un array de promesas para insertar todos los productos
      const insertPromises = productos.map(producto => {
        const { id_producto, cantidad, precio_unitario } = producto;
        
        // Validamos que tenemos todos los datos necesarios
        if (!id_producto || !cantidad || !precio_unitario) {
          console.warn('Datos de producto incompletos:', producto);
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
   */
  getEstadisticas: async (options = {}) => {
    try {
      const { 
        fechaInicio = null,
        fechaFin = null,
      } = options;
      
      // Consulta para ventas por estado
      let estadosQuery = `
        SELECT estado, COUNT(*) as total, SUM(total) as monto_total
        FROM Pedidos
        WHERE 1=1
      `;
      
      const queryParams = [];
      let paramCount = 1;
      
      if (fechaInicio) {
        estadosQuery += ` AND fecha_pedido >= $${paramCount++}`;
        queryParams.push(fechaInicio);
      }
      
      if (fechaFin) {
        estadosQuery += ` AND fecha_pedido <= $${paramCount++}`;
        queryParams.push(fechaFin);
      }
      
      estadosQuery += ` GROUP BY estado`;
      
      // Consulta para ventas por día (últimos 30 días)
      let ventasDiariasQuery = `
        SELECT DATE(fecha_pedido) as fecha, 
               COUNT(*) as total_pedidos, 
               SUM(total) as monto_total
        FROM Pedidos
        WHERE fecha_pedido >= NOW() - INTERVAL '30 day'
        GROUP BY DATE(fecha_pedido)
        ORDER BY fecha DESC
      `;
      
      // Ejecutar consultas
      const estadosResult = await db.query(estadosQuery, queryParams);
      const ventasDiariasResult = await db.query(ventasDiariasQuery);
      
      // Consulta para productos más vendidos
      const productosTopQuery = `
        SELECT p.id_producto, p.modelo, m.nombre as marca, 
               SUM(dp.cantidad) as total_vendido,
               SUM(dp.cantidad * dp.precio_unitario) as monto_total
        FROM Detalles_Pedido dp
        JOIN Productos p ON dp.id_producto = p.id_producto
        JOIN Marcas m ON p.id_marca = m.id_marca
        JOIN Pedidos pe ON dp.id_pedido = pe.id_pedido
        WHERE pe.estado != 'cancelado'
        GROUP BY p.id_producto, p.modelo, m.nombre
        ORDER BY total_vendido DESC
        LIMIT 5
      `;
      
      const productosTopResult = await db.query(productosTopQuery);
      
      return {
        estadosPedidos: estadosResult.rows,
        ventasDiarias: ventasDiariasResult.rows,
        productosTop: productosTopResult.rows,
        totalVentas: estadosResult.rows.reduce((acc, row) => acc + parseInt(row.total), 0),
        totalMonto: estadosResult.rows.reduce((acc, row) => acc + parseFloat(row.monto_total || 0), 0),
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
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
      
      return { total: parseInt(result.rows[0].total) };
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
      const query = `
        UPDATE Pedidos
        SET estado = $1
        WHERE id_pedido = $2
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [estado, id_pedido]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene los productos de un pedido
   * @param {number} id_pedido - ID del pedido
   * @returns {Promise} - Lista de productos
   */
  getProductosByPedidoId: async (id_pedido) => {
    try {
      const query = `
        SELECT d.*, p.modelo, p.descripcion, i.url_imagen as imagen_principal
        FROM Detalles_Pedido d
        JOIN Productos p ON d.id_producto = p.id_producto
        LEFT JOIN (
          SELECT id_producto, MIN(url_imagen) as url_imagen
          FROM Imagenes
          WHERE es_principal = true
          GROUP BY id_producto
        ) i ON p.id_producto = i.id_producto
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
