// Script para crear un pedido de prueba (versión corregida)
const db = require('../config/db');
const Pedido = require('../models/ventas.model');

async function createTestOrder() {
  try {
    console.log('Buscando un cliente existente...');
    
    // Obtener un cliente
    const clientQuery = 'SELECT id_cliente FROM Clientes LIMIT 1';
    const clientResult = await db.query(clientQuery);
    
    if (clientResult.rows.length === 0) {
      // Si no hay clientes, crear uno de prueba
      console.log('No se encontraron clientes. Creando cliente de prueba...');
      const createClientQuery = `
        INSERT INTO Clientes (nombre, email, telefono)
        VALUES ('Cliente de Prueba', 'test@example.com', '1234567890')
        RETURNING id_cliente
      `;
      const createClientResult = await db.query(createClientQuery);
      var clienteId = createClientResult.rows[0].id_cliente;
    } else {
      var clienteId = clientResult.rows[0].id_cliente;
    }
    
    console.log(`Usando cliente con ID: ${clienteId}`);
    
    // Obtener productos existentes para realizar una compra realista
    const productosQuery = 'SELECT id_producto, precio FROM Productos LIMIT 2';
    const productosResult = await db.query(productosQuery);
    
    const productos = [];
    if (productosResult.rows.length > 0) {
      // Usar productos reales de la base de datos
      productos.push({
        id_producto: productosResult.rows[0].id_producto,
        cantidad: 2,
        precio_unitario: parseFloat(productosResult.rows[0].precio)
      });
      
      if (productosResult.rows.length > 1) {
        productos.push({
          id_producto: productosResult.rows[1].id_producto,
          cantidad: 1,
          precio_unitario: parseFloat(productosResult.rows[1].precio)
        });
      }
    } else {
      // Productos de prueba si no hay reales
      productos.push(
        {
          id_producto: 1, // Esta es solo una referencia, no validamos que exista
          cantidad: 2,
          precio_unitario: 1500
        },
        {
          id_producto: 2,
          cantidad: 1,
          precio_unitario: 2000
        }
      );
    }
    
    const total = productos.reduce((sum, producto) => sum + (producto.cantidad * producto.precio_unitario), 0);
    
    console.log(`Creando pedido con total: ${total}`);
    console.log('Productos para el pedido:', productos);
    
    // Crear el pedido utilizando el modelo
    const pedido = await Pedido.createPedido({
      id_cliente: clienteId,
      total,
      estado: 'pendiente',
      url_comprobante: null
    });
    
    console.log('Pedido creado:', pedido);
    
    // Añadir productos al pedido
    console.log('Añadiendo productos al pedido...');
    const detalles = await Pedido.addProductosToPedido(pedido.id_pedido, productos);
    
    console.log('Detalles de productos añadidos:', detalles);
    
    // Verificar que el pedido se creó correctamente
    console.log('Verificando pedido creado...');
    const pedidoCompleto = await Pedido.getPedidoById(pedido.id_pedido);
    
    console.log('Pedido completo:', pedidoCompleto);
    
    console.log('¡Pedido de prueba creado exitosamente!');
  } catch (error) {
    console.error('Error al crear pedido de prueba:', error);
  } finally {
    process.exit();
  }
}

createTestOrder();
