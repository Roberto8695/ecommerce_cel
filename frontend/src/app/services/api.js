// Constante para la URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Función de utilidad para realizar peticiones HTTP
 * @param {string} endpoint - Punto final de la API
 * @param {Object} options - Opciones para la petición fetch
 * @returns {Promise} - Promesa con la respuesta de la API
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Intentar obtener el mensaje de error del servidor
      let errorMessage = 'Error en la petición';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear como JSON, usar el statusText
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

/**
 * Servicios para productos
 */
export const productosService = {
  // Obtener todos los productos
  getAll: async () => {
    return await fetchAPI('/productos');
  },

  // Obtener un producto por ID
  getById: async (id) => {
    return await fetchAPI(`/productos/${id}`);
  },

  // Crear un nuevo producto
  create: async (productoData) => {
    return await fetchAPI('/productos', {
      method: 'POST',
      body: JSON.stringify(productoData),
    });
  },

  // Actualizar un producto existente
  update: async (id, productoData) => {
    return await fetchAPI(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productoData),
    });
  },

  // Eliminar un producto
  delete: async (id) => {
    return await fetchAPI(`/productos/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Servicios para marcas
 */
export const marcasService = {
  // Obtener todas las marcas
  getAll: async () => {
    return await fetchAPI('/marcas');
  },

  // Obtener una marca por ID
  getById: async (id) => {
    return await fetchAPI(`/marcas/${id}`);
  },

  // Crear una nueva marca
  create: async (marcaData) => {
    return await fetchAPI('/marcas', {
      method: 'POST',
      body: JSON.stringify(marcaData),
    });
  },

  // Actualizar una marca existente
  update: async (id, marcaData) => {
    return await fetchAPI(`/marcas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(marcaData),
    });
  },

  // Eliminar una marca
  delete: async (id) => {
    return await fetchAPI(`/marcas/${id}`, {
      method: 'DELETE',
    });
  },

  // Crear una marca con imagen (usando FormData)
  uploadWithImage: async (formData) => {
    // Para FormData necesitamos usar fetch directamente
    try {
      const url = `${API_URL}/marcas/upload`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData, // No establecemos Content-Type para que el navegador lo establezca con el boundary correcto
      });

      if (!response.ok) {
        let errorMessage = 'Error al subir imagen de marca';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear marca con imagen:', error);
      throw error;
    }
  },

  // Actualizar una marca con imagen (usando FormData)
  updateWithImage: async (id, formData) => {
    try {
      const url = `${API_URL}/marcas/${id}/upload`;
      const response = await fetch(url, {
        method: 'PUT',
        body: formData, // No establecemos Content-Type para que el navegador lo establezca con el boundary correcto
      });

      if (!response.ok) {
        let errorMessage = `Error al actualizar marca ${id} con imagen`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar marca ${id} con imagen:`, error);
      throw error;
    }
  },
};

/**
 * Servicios para imágenes de productos
 */
export const imagenesService = {
  // Obtener imágenes de un producto
  getByProducto: async (idProducto) => {
    return await fetchAPI(`/imagenes/producto/${idProducto}`);
  },

  // Añadir una imagen a un producto
  addToProducto: async (idProducto, imagenData) => {
    return await fetchAPI(`/imagenes/producto/${idProducto}`, {
      method: 'POST',
      body: JSON.stringify(imagenData),
    });
  },

  // Actualizar una imagen
  update: async (id, imagenData) => {
    return await fetchAPI(`/imagenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(imagenData),
    });
  },

  // Establecer imagen como principal
  setPrincipal: async (id) => {
    return await fetchAPI(`/imagenes/${id}/principal`, {
      method: 'PUT',
    });
  },

  // Eliminar una imagen
  delete: async (id) => {
    return await fetchAPI(`/imagenes/${id}`, {
      method: 'DELETE',
    });
  },
}; 