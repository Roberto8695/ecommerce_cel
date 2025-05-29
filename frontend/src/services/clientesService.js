/**
 * Servicio para gestionar los clientes
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Obtiene todos los clientes
 * @returns {Promise<Array>} Lista de clientes
 */
export async function getClientes() {
  try {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
}

/**
 * Obtiene un cliente por su ID
 * @param {number} id - ID del cliente
 * @returns {Promise<Object>} Datos del cliente
 */
export async function getClienteById(id) {
  try {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener cliente con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo cliente
 * @param {Object} clienteData - Datos del cliente
 * @returns {Promise<Object>} Cliente creado
 */
export async function createCliente(clienteData) {
  try {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clienteData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
}

/**
 * Actualiza un cliente existente
 * @param {number} id - ID del cliente
 * @param {Object} clienteData - Nuevos datos del cliente
 * @returns {Promise<Object>} Cliente actualizado
 */
export async function updateCliente(id, clienteData) {
  try {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(clienteData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al actualizar cliente con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un cliente
 * @param {number} id - ID del cliente a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteCliente(id) {
  try {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al eliminar cliente con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Busca clientes por término
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Lista de clientes que coinciden
 */
export async function searchClientes(searchTerm) {
  try {
    const response = await fetch(`${API_URL}/clientes/search?term=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al buscar clientes con término "${searchTerm}":`, error);
    throw error;
  }
}
