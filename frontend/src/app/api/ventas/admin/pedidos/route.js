export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  try {
    const response = await fetch(`http://localhost:5000/api/pedidos?${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return Response.json(
        { success: false, message: 'Error al obtener los pedidos' },
        { status: response.status }
      );
    }
      const data = await response.json();
    
    // Asegurémonos de que los datos tengan la estructura correcta para el frontend
    if (data.success && data.data && !Array.isArray(data.data)) {
      // La API del backend devuelve un objeto con data y pagination
      console.log('Transformando estructura de respuesta para el dashboard');
      return Response.json({
        success: true,
        data: data.data.data || [],
        pagination: data.pagination || data.data.pagination || {
          total: data.data.data?.length || 0,
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '10'),
          pages: Math.ceil((data.data.data?.length || 0) / parseInt(searchParams.get('limit') || '10'))
        }
      });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return Response.json(
      { success: false, message: 'Error de servidor interno' },
      { status: 500 }
    );
  }
}
