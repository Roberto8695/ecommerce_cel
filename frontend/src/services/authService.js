/**
 * Servicios de autenticación para comunicarse con el backend
 */
import { setCookie, eraseCookie } from '@/utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Iniciar sesión como administrador
 * @param {string} email Email del administrador
 * @param {string} contrasena Contraseña del administrador
 * @returns {Promise} Respuesta con el token y datos del administrador
 */
export const loginAdmin = async (email, contrasena) => {
  console.log(`Intentando login con: email=${email}, password=${contrasena}`);
  
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password: contrasena }), // El backend acepta 'password'
  });

  if (!response.ok) {
    // Si la respuesta no es exitosa, parseamos el error
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al iniciar sesión');
  }

  return response.json();
};

/**
 * Obtiene el perfil del administrador autenticado
 * @returns {Promise} Datos del administrador
 */
export const getProfile = async () => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/admin/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si recibimos un error 401 o 403, limpiamos la sesión
      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('No autorizado. Token inválido o expirado');
      }
      
      // Para otros errores, intentamos parsear el mensaje
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el perfil');
    }

    return response.json();
  } catch (error) {
    console.error('Error en getProfile:', error);
    
    // Si es un error de red, personalizar el mensaje
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
    }
    
    throw error;
  }
};

/**
 * Verifica si el token en localStorage es válido
 * @returns {boolean} true si hay un token válido
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  // Verificación básica de token JWT (que tenga formato válido)
  try {
    // Dividir el token en sus partes
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Verificar que la segunda parte (payload) es un JSON válido
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar si el token ha expirado
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expirado, eliminarlo
      logout();
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error al verificar token:', e);
    return false;
  }
};

/**
 * Guarda el token y la información del usuario en localStorage y cookies
 * @param {Object} data Objeto con token y admin
 */
export const setAuthData = (data) => {
  // Guardamos en localStorage para acceso desde JavaScript
  localStorage.setItem('token', data.token);
  localStorage.setItem('admin', JSON.stringify(data.admin));
  
  // Guardamos también en cookies para que el middleware pueda acceder
  setCookie('token', data.token);
};

/**
 * Elimina los datos de autenticación
 */
export const logout = () => {
  // Eliminamos de localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  
  // Eliminamos también de cookies
  eraseCookie('token');
};

/**
 * Obtiene el token de autenticación
 * @returns {string|null} Token de autenticación
 */
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Obtiene los datos del administrador
 * @returns {Object|null} Datos del administrador
 */
export const getAdmin = () => {
  if (typeof window === 'undefined') return null;
  const adminStr = localStorage.getItem('admin');
  return adminStr ? JSON.parse(adminStr) : null;
};