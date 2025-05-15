const productosModel = require('../models/productos.model');
const imagenesModel = require('../models/imagenes.model');

// Obtener todos los productos
const getAllProductos = async (req, res) => {
  try {
    const productos = await productosModel.getAllProductos();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un producto por ID
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productosModel.getProductoById(id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto
const createProducto = async (req, res) => {
  try {
    const { id_marca, modelo, precio, stock, descripcion, imagenes } = req.body;
    
    // Validaciones básicas
    if (!id_marca || !modelo || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
    }
    
    // Convertir precio y stock a números para asegurar el tipo correcto
    const numericPrecio = parseFloat(precio);
    const numericStock = parseInt(stock);
    
    if (isNaN(numericPrecio) || isNaN(numericStock)) {
      return res.status(400).json({ error: 'El precio y el stock deben ser valores numéricos válidos' });
    }
    
    // Crear el producto
    const producto = await productosModel.createProducto({
      id_marca,
      modelo,
      precio: numericPrecio,
      stock: numericStock,
      descripcion
    });
    
    // Si se proporcionaron imágenes, añadirlas
    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      // Almacenar promesas para procesar todas las imágenes
      const imagenesPromises = imagenes.map(async (imagen, index) => {
        // Establecer la primera imagen como principal por defecto si no hay otra marcada
        const esPrincipal = imagen.es_principal || (index === 0 && !imagenes.some(img => img.es_principal));
        
        return imagenesModel.createImagen({
          id_producto: producto.id_producto,
          url_imagen: imagen.url_imagen,
          descripcion: imagen.descripcion || null,
          es_principal: esPrincipal
        });
      });
      
      await Promise.all(imagenesPromises);
      
      // Obtener el producto con las imágenes ya adjuntadas
      const productoConImagenes = await productosModel.getProductoById(producto.id_producto);
      res.status(201).json(productoConImagenes);
    } else {
      res.status(201).json(producto);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un producto existente
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_marca, modelo, precio, stock, descripcion } = req.body;
    
    // Validaciones básicas
    if (!id_marca || !modelo || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
    }
    
    // Convertir precio y stock a números para asegurar el tipo correcto
    const numericPrecio = parseFloat(precio);
    const numericStock = parseInt(stock);
    
    if (isNaN(numericPrecio) || isNaN(numericStock)) {
      return res.status(400).json({ error: 'El precio y el stock deben ser valores numéricos válidos' });
    }
    
    const productoExistente = await productosModel.getProductoById(id);
    
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const productoActualizado = await productosModel.updateProducto(id, {
      id_marca,
      modelo,
      precio: numericPrecio,
      stock: numericStock,
      descripcion
    });
    
    // Obtener el producto actualizado con sus imágenes
    const productoConImagenes = await productosModel.getProductoById(id);
    res.status(200).json(productoConImagenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un producto
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productoExistente = await productosModel.getProductoById(id);
    
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const productoEliminado = await productosModel.deleteProducto(id);
    
    res.status(200).json({
      message: 'Producto eliminado correctamente',
      producto: productoEliminado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};
