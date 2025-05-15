import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Obtener todos los productos
export const getProductos = async () => {
  try {
    const response = await axios.get(`${API_URL}/productos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
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