// filepath: c:\Users\rober\Desktop\ecommerce_cel\backend\controllers\admin.controller.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

/**
 * Controlador para manejar operaciones relacionadas con administradores
 */
const AdminController = {
  /**
   * Autenticación de administradores
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  login: async (req, res) => {
    try {
      console.log('Intento de login con datos:', req.body);
      
      // Permitir credenciales desde el frontend (soporta ambos formatos: password o contrasena)
      const email = req.body.email;
      const password = req.body.password || req.body.contrasena;

      console.log(`Credenciales recibidas: email=${email}, password=${password}`);

      if (!email || !password) {
        console.log('Faltan credenciales:', { email: !!email, password: !!password });
        return res.status(400).json({ 
          success: false,
          message: 'Email y contraseña son requeridos' 
        });
      }
      
      // Verificar directamente las credenciales hardcodeadas para simplificar el login
      if (email === 'admin@admin.com' && password === 'pass') {
        console.log('Credenciales hardcodeadas válidas, generando token...');
        
        // Crear token JWT
        const token = jwt.sign(
          { 
            id: 1,
            email: 'admin@admin.com',
            rol: 'superadmin' 
          },
          process.env.JWT_SECRET,
          { expiresIn: '12h' }
        );
        
        // Datos del admin hardcodeado
        const adminData = {
          id: 1,
          nombre_usuario: 'Administrador',
          email: 'admin@admin.com',
          rol: 'superadmin'
        };
        
        return res.json({
          success: true,
          message: 'Autenticación exitosa',
          token,
          admin: adminData
        });
      }
      
      // Si no son las credenciales hardcodeadas, intentamos con la base de datos
      const admin = await Admin.findByEmail(email);
      
      if (!admin) {
        console.log(`Administrador no encontrado con email: ${email}`);
        return res.status(401).json({ 
          success: false,
          message: 'Credenciales inválidas' 
        });
      }

      console.log(`Admin encontrado: ${admin.nombre_usuario}, verificando contraseña`);
      
      // Verificar contraseña (sin encriptar por ahora)
      if (admin.contrasena !== password) {
        console.log('Contraseña inválida');
        return res.status(401).json({ 
          success: false,
          message: 'Credenciales inválidas' 
        });
      }
      
      console.log('Autenticación exitosa');
      
      // Crear token JWT
      const token = jwt.sign(
        { 
          id: admin.id_admin,
          email: admin.email,
          rol: admin.rol 
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      // Datos para devolver (sin incluir la contraseña)
      const adminData = {
        id: admin.id_admin,
        nombre_usuario: admin.nombre_usuario,
        email: admin.email,
        rol: admin.rol
      };

      return res.json({
        success: true,
        message: 'Autenticación exitosa',
        token,
        admin: adminData
      });
    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud'
      });
    }
  },

  /**
   * Obtener perfil del administrador autenticado
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  getProfile: async (req, res) => {
    try {
      // El middleware de autenticación ya verificó el token y agregó la info del admin al req
      const adminId = req.user.id;
      
      // Obtener datos del admin
      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }

      res.json({
        success: true,
        admin
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud'
      });
    }
  },

  /**
   * Listar todos los administradores
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  getAllAdmins: async (req, res) => {
    try {
      const admins = await Admin.findAll();
      
      res.json({
        success: true,
        admins
      });
    } catch (error) {
      console.error('Error al listar administradores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud'
      });
    }
  }
};

module.exports = AdminController;
