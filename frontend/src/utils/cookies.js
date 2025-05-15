/**
 * Utilidades para trabajar con cookies en el cliente
 */

/**
 * Establece una cookie con un valor especificado
 * @param {string} name Nombre de la cookie
 * @param {string} value Valor de la cookie
 * @param {number} days Días de expiración
 */
export function setCookie(name, value, days = 7) {
  if (typeof window === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/";
}

/**
 * Obtiene el valor de una cookie por su nombre
 * @param {string} name Nombre de la cookie
 * @returns {string|null} Valor de la cookie o null si no existe
 */
export function getCookie(name) {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Elimina una cookie por su nombre
 * @param {string} name Nombre de la cookie
 */
export function eraseCookie(name) {
  if (typeof window === 'undefined') return;
  
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
