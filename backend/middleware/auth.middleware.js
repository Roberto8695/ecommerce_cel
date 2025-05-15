const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado'
      });
    }

    // Extraer el token sin la parte "Bearer "
    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al request para uso en otros controladores
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Token inválido o expirado'
    });
  }
};

module.exports = authMiddleware; 
