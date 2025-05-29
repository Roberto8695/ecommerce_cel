/**
 * Funciones utilitarias para formateo de datos
 */

/**
 * Formatea un número como moneda (CLP)
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado como moneda
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0';
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatea una fecha como texto relativo (ej: "hace 5 minutos")
 * @param {string|Date} dateValue - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'Fecha desconocida';
  
  const date = new Date(dateValue);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffMin < 1) {
    return 'Hace un momento';
  } else if (diffMin < 60) {
    return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHour < 24) {
    return `Hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  } else if (diffDay < 30) {
    return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
