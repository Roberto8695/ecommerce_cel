export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  try {
    const response = await fetch(`http://localhost:5000/api/pedidos/estadisticas?${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return Response.json(
        { success: false, message: 'Error al obtener las estadísticas' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error al obtener las estadísticas:', error);
    return Response.json(
      { success: false, message: 'Error de servidor interno' },
      { status: 500 }
    );
  }
}
