import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Obtener todas las marcas
export const getMarcas = async () => {
  try {
    const response = await axios.get(`${API_URL}/marcas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    throw error;
  }
};

// Obtener una marca por ID
export const getMarcaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/marcas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener marca ${id}:`, error);
    throw error;
  }
};

// Crear una nueva marca
export const createMarca = async (marcaData) => {
  try {
    const response = await axios.post(`${API_URL}/marcas`, marcaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear marca:', error);
    throw error;
  }
};

// Actualizar una marca existente
export const updateMarca = async (id, marcaData) => {
  try {
    const response = await axios.put(`${API_URL}/marcas/${id}`, marcaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar marca ${id}:`, error);
    throw error;
  }
};

// Crear una marca con imagen
export const uploadMarcaWithImage = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/marcas/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear marca con imagen:', error);
    throw error;
  }
};

// Actualizar una marca con imagen
export const updateMarcaWithImage = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/marcas/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar marca ${id} con imagen:`, error);
    throw error;
  }
};

// Eliminar una marca
export const deleteMarca = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/marcas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar marca ${id}:`, error);
    throw error;
  }
}; 