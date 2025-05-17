import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Obtener todos los productos
export const getProductos = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/productos`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Buscar productos por término de búsqueda
export const buscarProductos = async (query) => {
  try {
    console.log('🔍 Frontend: Buscando productos con término:', query);
    
    // Validar que el término de búsqueda tenga al menos 2 caracteres
    if (!query || query.trim().length < 2) {
      console.log('⚠️ Término de búsqueda demasiado corto');
      return [];
    }
    
    // Usar el enfoque del catálogo: obtener todos los productos y filtrar en el cliente
    console.log('ℹ️ Usando enfoque del catálogo: obtener todos los productos y filtrar');
    const response = await axios.get(`${API_URL}/productos`);
    
    // Filtrar los productos por el término de búsqueda, igual que en la página de catálogo
    if (response.data && Array.isArray(response.data)) {
      const searchTerm = query.toLowerCase();
      
      // Aplicar el mismo filtro que se usa en la página de catálogo
      const filteredData = response.data.filter(p => 
        (p.modelo && p.modelo.toLowerCase().includes(searchTerm)) ||
        (p.marca && p.marca.toLowerCase().includes(searchTerm))
      );
      
      console.log(`✅ Productos encontrados: ${filteredData.length}`);
      
      // Formatear los productos de la misma manera que en la página de catálogo
      return filteredData.map(p => ({
        id: p.id_producto,
        nombre: p.modelo,
        precio: parseFloat(p.precio || 0),
        precioAnterior: p.precio_anterior ? parseFloat(p.precio_anterior) : null,
        descuento: p.descuento || 0,
        stock: p.stock,
        marca: { 
          nombre: p.marca || 'Sin marca',
          id: p.id_marca || 0
        },
        imagenes: [p.imagen_principal || null].filter(Boolean)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error al buscar productos:', error);
    
    // Mostrar error más detallado en consola
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Código de error:', error.response.status);
      console.error('Datos de error:', error.response.data);
    } else if (error.request) {
      // La petición se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Error en la configuración de la petición
      console.error('Error en la petición:', error.message);
    }
    
    // En caso de error, devolver un array vacío para no romper la UI
    return [];
  }
};

// Obtener un producto por ID
export const getProductoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo producto
export const createProducto = async (productoData) => {
  try {
    const response = await axios.post(`${API_URL}/productos`, productoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

// Actualizar un producto existente
export const updateProducto = async (id, productoData) => {
  try {
    const response = await axios.put(`${API_URL}/productos/${id}`, productoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar producto ${id}:`, error);
    throw error;
  }
};

// Eliminar un producto
export const deleteProducto = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar producto ${id}:`, error);
    throw error;
  }
};

// Subir imágenes para un producto
export const uploadProductImages = async (id, formData) => {
  try {
    const response = await axios.post(`${API_URL}/imagenes/producto/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al subir imágenes para producto ${id}:`, error);
    throw error;
  }
};

// Establecer imagen principal
export const setMainImage = async (idProducto, idImagen) => {
  try {
    const response = await axios.put(`${API_URL}/imagenes/${idImagen}/principal`);
    return response.data;
  } catch (error) {
    console.error(`Error al establecer imagen principal:`, error);
    throw error;
  }
};

// Eliminar una imagen
export const deleteImage = async (idImagen) => {
  try {
    const response = await axios.delete(`${API_URL}/imagenes/${idImagen}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar imagen:`, error);
    throw error;
  }
}; 