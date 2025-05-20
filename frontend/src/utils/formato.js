/**
 * Formatea un valor monetario
 * @param {number|string} valor - Valor a formatear
 * @param {boolean} conSimbolo - Si se debe incluir el símbolo de moneda
 * @returns {string} - Valor formateado
 */
export const formatoMoneda = (valor, conSimbolo = true) => {
  if (valor === null || valor === undefined) return conSimbolo ? '$0.00' : '0.00';
  
  const numeroFormateado = Number(valor).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return conSimbolo ? `$${numeroFormateado}` : numeroFormateado;
};

/**
 * Formatea una fecha
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatoFecha = (fecha) => {
  if (!fecha) return '';
  
  const date = new Date(fecha);
  
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Devuelve las clases CSS para un estado de pedido
 * @param {string} estado - Estado del pedido
 * @returns {string} - Clases CSS
 */
export const estadoPedidoClases = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'procesando':
      return 'bg-blue-100 text-blue-800';
    case 'enviado':
      return 'bg-indigo-100 text-indigo-800';
    case 'entregado':
      return 'bg-green-100 text-green-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} texto - Texto a truncar
 * @param {number} maxLongitud - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncarTexto = (texto, maxLongitud = 50) => {
  if (!texto) return '';
  if (texto.length <= maxLongitud) return texto;
  
  return texto.substring(0, maxLongitud) + '...';
};
