// Ruta de API para crear pedidos - Next.js App Router
export async function POST(request) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const bodyData = await request.json();
    
    console.log('Creando pedido con datos:', bodyData);
    
    // Verificación de datos antes de enviar al backend
    if (!bodyData.id_cliente) {
      return Response.json(
        { success: false, message: 'Error: Se requiere un id_cliente' },
        { status: 400 }
      );
    }
    
    if (!bodyData.productos || !Array.isArray(bodyData.productos) || bodyData.productos.length === 0) {
      return Response.json(
        { success: false, message: 'Error: Se requiere al menos un producto en el pedido' },
        { status: 400 }
      );
    }
    
    if (!bodyData.total || isNaN(parseFloat(bodyData.total))) {
      return Response.json(
        { success: false, message: 'Error: El total del pedido es requerido y debe ser un número' },
        { status: 400 }
      );
    }
    
    // Asegurarnos de que cada producto tiene los campos necesarios
    for (const producto of bodyData.productos) {
      if (!producto.id_producto && !producto.id) {
        return Response.json(
          { success: false, message: 'Error: Cada producto debe tener un id_producto o id' },
          { status: 400 }
        );
      }
      
      if (!producto.cantidad || isNaN(parseInt(producto.cantidad))) {
        return Response.json(
          { success: false, message: 'Error: Cada producto debe tener una cantidad válida' },
          { status: 400 }
        );
      }
      
      if (!producto.precio_unitario && !producto.precio) {
        return Response.json(
          { success: false, message: 'Error: Cada producto debe tener un precio_unitario o precio' },
          { status: 400 }
        );
      }
    }
    
    // Normalizar los datos para el backend
    const normalizedData = {
      ...bodyData,
      productos: bodyData.productos.map(producto => ({
        id_producto: producto.id_producto || producto.id,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario || producto.precio
      }))
    };
    
    // Enviar la solicitud al backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${backendUrl}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedData)
    });
    
    // Obtener la respuesta del servidor
    const data = await response.json();
    
    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      console.error('Error del servidor al crear pedido:', data);
      return Response.json(
        { 
          success: false, 
          message: data.message || 'Error al crear el pedido',
          error: data.error
        },
        { status: response.status }
      );
    }
    
    // Devolver la respuesta exitosa
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Error interno al procesar la solicitud',
        error: error.message
      },
      { status: 500 }
    );
  }
}
