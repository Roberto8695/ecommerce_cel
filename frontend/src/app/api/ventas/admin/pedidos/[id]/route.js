export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const response = await fetch(`http://localhost:5000/api/pedidos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return Response.json(
        { success: false, message: 'Error al obtener el pedido' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    return Response.json(
      { success: false, message: 'Error de servidor interno' },
      { status: 500 }
    );
  }
}
