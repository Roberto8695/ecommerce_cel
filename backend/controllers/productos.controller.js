const productosModel = require('../models/productos.model');
const imagenesModel = require('../models/imagenes.model');

// Obtener todos los productos
const getAllProductos = async (req, res) => {
  try {
    // Verificar si hay parámetros de búsqueda
    const { q, marca, minPrice, maxPrice } = req.query;
    
    let productos;
    if (q || marca || minPrice || maxPrice) {
      // Si hay parámetros de búsqueda, filtrar los productos
      productos = await productosModel.getAllProductos();
      
      // Filtrar por término de búsqueda
      if (q) {
        const searchTerm = q.toLowerCase();
        productos = productos.filter(p => 
          p.nombre.toLowerCase().includes(searchTerm) || 
          (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm))
        );
      }
      
      // Filtrar por marca
      if (marca) {
        const marcaId = parseInt(marca);
        productos = productos.filter(p => p.marca_id === marcaId);
      }
      
      // Filtrar por precio mínimo
      if (minPrice) {
        const min = parseFloat(minPrice);
        productos = productos.filter(p => p.precio >= min);
      }
      
      // Filtrar por precio máximo
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        productos = productos.filter(p => p.precio <= max);
      }
    } else {
      // Si no hay parámetros, obtener todos los productos
      productos = await productosModel.getAllProductos();
    }
    
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

// Buscar productos por término
const buscarProductos = async (req, res) => {
  console.log('🔍 Petición de búsqueda recibida:', req.query);
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      console.log('❌ Término de búsqueda demasiado corto:', q);
      return res.status(400).json({ error: 'Se requiere un término de búsqueda de al menos 2 caracteres' });
    }
    
    console.log('✅ Buscando productos con término:', q);
    
    // Obtener todos los productos
    const productos = await productosModel.getAllProductos();
    console.log(`📊 Total de productos recuperados: ${productos.length}`);
    
    // Verificar estructura de los productos
    if (productos.length > 0) {
      console.log('Estructura del primer producto:', Object.keys(productos[0]));
    }
    
    const searchTerm = q.toLowerCase();
    
    // Filtrar productos que coincidan con el término de búsqueda
    // Utilizando un enfoque más seguro y defensivo
    const productosEncontrados = productos.filter(p => {
      try {
        // Obtener todos los valores como strings para búsqueda
        const modelo = String(p.modelo || '').toLowerCase();
        const descripcion = String(p.descripcion || '').toLowerCase();
        
        // Si el producto tiene campos directos
        if (modelo.includes(searchTerm) || descripcion.includes(searchTerm)) {
          return true;
        }
        
        // Buscar en marca si existe
        if (p.marca) {
          const marcaNombre = String(p.marca).toLowerCase();
          if (marcaNombre.includes(searchTerm)) {
            return true;
          }
        }
        
        // Intentar búsqueda en nombre si existe
        if (p.nombre) {
          const nombre = String(p.nombre).toLowerCase();
          if (nombre.includes(searchTerm)) {
            return true;
          }
        }
        
        return false;
      } catch (err) {
        console.error('Error al filtrar producto:', err);
        return false;
      }
    });
    
    console.log(`🎯 Productos encontrados: ${productosEncontrados.length}`);
    
    // Formatear los productos para que tengan la misma estructura que espera el frontend
    const productosFormateados = productosEncontrados.map(p => {
      return {
        id: p.id_producto,
        nombre: p.modelo || p.nombre || 'Producto sin nombre',
        precio: parseFloat(p.precio || 0),
        descripcion: p.descripcion || '',
        marca: {
          nombre: p.marca || 'Sin marca',
          id: p.id_marca || 0
        },
        imagenes: p.imagen_principal ? [p.imagen_principal] : []
      };
    });
    
    res.status(200).json(productosFormateados);
  } catch (error) {
    console.error('❌ Error en la búsqueda de productos:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  buscarProductos
};
