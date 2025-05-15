'use client';

import { getProductos } from '../../../services/productosService';

/**
 * Función para recargar productos y obtener la información actualizada
 * incluyendo las imágenes más recientes tras una edición
 */
export const recargarProductos = async (id_producto = null) => {
  try {
    // Obtener todos los productos actualizados
    const productosActualizados = await getProductos();
    
    // Si se proporcionó un ID de producto específico, devolver ese producto
    if (id_producto) {
      const productoEspecifico = productosActualizados.find(
        p => p.id_producto === id_producto
      );
      return productoEspecifico;
    }
    
    return productosActualizados;
  } catch (error) {
    console.error('Error al recargar productos:', error);
    throw error;
  }
}; 
