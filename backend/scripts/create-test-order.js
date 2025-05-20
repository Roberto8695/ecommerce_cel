// Script para crear un pedido de prueba
const db = require('../config/db');
const Pedido = require('../models/ventas.model');

async function createTestOrder() {
  try {
    console.log('Buscando un cliente existente...');
    
    // Obtener un cliente
    const clientQuery = 'SELECT id_cliente FROM Clientes LIMIT 1';
    const clientResult = await db.query(clientQuery);
    
    if (clientResult.rows.length === 0) {
      console.error('No se encontraron clientes. Cree primero un cliente.');
      return;
    }
    
    const clienteId = clientResult.rows[0].id_cliente;
    console.log(`Usando cliente con ID: ${clienteId}`);
    
    // Productos de prueba
    const productos = [
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
    ];
    
    const total = productos.reduce((sum, producto) => sum + (producto.cantidad * producto.precio_unitario), 0);
    
    console.log(`Creando pedido con total: ${total}`);
    
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
    try {
      await Pedido.addProductosToPedido(pedido.id_pedido, productos);
      console.log('Productos añadidos correctamente');
    } catch (productsError) {
      console.error('Error al añadir productos:', productsError.message);
      // Si falla, continuamos para ver otros errores que puedan surgir
    }
    
    // Obtener el pedido para verificar
    console.log('Verificando que el pedido se creó correctamente...');
    const pedidoVerificado = await Pedido.getPedidoById(pedido.id_pedido);
    
    if (pedidoVerificado) {
      console.log('Pedido verificado:', pedidoVerificado);
      console.log('¡Pedido creado exitosamente!');
    } else {
      console.error('No se pudo verificar el pedido creado');
    }
  } catch (error) {
    console.error('Error al crear pedido de prueba:', error);
  } finally {
    process.exit(0);
  }
}

createTestOrder();
