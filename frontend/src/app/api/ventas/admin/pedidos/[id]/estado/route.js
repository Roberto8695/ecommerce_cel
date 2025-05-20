export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  
  try {
    const response = await fetch(`http://localhost:5000/api/pedidos/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      return Response.json(
        { success: false, message: 'Error al actualizar el estado del pedido' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    return Response.json(
      { success: false, message: 'Error de servidor interno' },
      { status: 500 }
    );
  }
}
