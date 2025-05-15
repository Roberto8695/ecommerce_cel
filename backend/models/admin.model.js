const db = require('../config/db');

/**
 * Modelo para manejar operaciones de la tabla Administradores
 */
const Admin = {
  /**
   * Busca un administrador por su email
   * @param {string} email - Email del administrador
   * @returns {Promise<Object|null>} - Datos del administrador o null si no existe
   */
  findByEmail: async (email) => {
    try {
      const result = await db.query(
        'SELECT * FROM Administradores WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar administrador por email:', error);
      throw error;
    }
  },

  /**
   * Busca un administrador por su ID
   * @param {number} id - ID del administrador
   * @returns {Promise<Object|null>} - Datos del administrador o null si no existe
   */
  findById: async (id) => {
    try {
      const result = await db.query(
        'SELECT id_admin, nombre_usuario, email, rol, creado_en FROM Administradores WHERE id_admin = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar administrador por ID:', error);
      throw error;
    }
  },

  /**
   * Lista todos los administradores
   * @returns {Promise<Array>} - Lista de administradores
   */
  findAll: async () => {
    try {
      const result = await db.query(
        'SELECT id_admin, nombre_usuario, email, rol, creado_en FROM Administradores ORDER BY id_admin'
      );
      return result.rows;
    } catch (error) {
      console.error('Error al listar administradores:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo administrador
   * @param {Object} adminData - Datos del administrador
   * @returns {Promise<Object>} - Administrador creado
   */
  create: async (adminData) => {
    const { nombre_usuario, email, contrasena, rol } = adminData;
    
    try {
      const result = await db.query(
        'INSERT INTO Administradores (nombre_usuario, email, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id_admin, nombre_usuario, email, rol, creado_en',
        [nombre_usuario, email, contrasena, rol]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear administrador:', error);
      throw error;
    }
  }
};

module.exports = Admin;
