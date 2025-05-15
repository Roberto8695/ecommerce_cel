const imagenesModel = require('../models/imagenes.model');
const productosModel = require('../models/productos.model');

// Obtener todas las imágenes de un producto
const getImagenesByProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;
    
    // Verificar que el producto existe
    const producto = await productosModel.getProductoById(id_producto);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const imagenes = await imagenesModel.getImagenesByProductoId(id_producto);
    res.status(200).json(imagenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una imagen específica por ID
const getImagenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const imagen = await imagenesModel.getImagenById(id);
    if (!imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    res.status(200).json(imagen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Añadir una nueva imagen a un producto
const createImagen = async (req, res) => {
  try {
    const { id_producto } = req.params;
    const { url_imagen, descripcion, es_principal } = req.body;
    
    // Verificar que el producto existe
    const producto = await productosModel.getProductoById(id_producto);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Validaciones básicas
    if (!url_imagen) {
      return res.status(400).json({ error: 'La URL de la imagen es obligatoria' });
    }
    
    const nuevaImagen = await imagenesModel.createImagen({
      id_producto,
      url_imagen,
      descripcion,
      es_principal: es_principal || false
    });
    
    res.status(201).json(nuevaImagen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una imagen existente
const updateImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_imagen, descripcion, es_principal } = req.body;
    
    // Verificar que la imagen existe
    const imagenExistente = await imagenesModel.getImagenById(id);
    if (!imagenExistente) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Validaciones básicas
    if (!url_imagen) {
      return res.status(400).json({ error: 'La URL de la imagen es obligatoria' });
    }
    
    const imagenActualizada = await imagenesModel.updateImagen(id, {
      url_imagen,
      descripcion,
      es_principal: es_principal || false
    });
    
    res.status(200).json(imagenActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una imagen
const deleteImagen = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la imagen existe
    const imagenExistente = await imagenesModel.getImagenById(id);
    if (!imagenExistente) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    const imagenEliminada = await imagenesModel.deleteImagen(id);
    
    res.status(200).json({
      message: 'Imagen eliminada correctamente',
      imagen: imagenEliminada
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Establecer una imagen como principal
const setImagenPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la imagen existe
    const imagenExistente = await imagenesModel.getImagenById(id);
    if (!imagenExistente) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    const imagenActualizada = await imagenesModel.updateImagen(id, {
      url_imagen: imagenExistente.url_imagen,
      descripcion: imagenExistente.descripcion,
      es_principal: true
    });
    
    res.status(200).json(imagenActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Subir múltiples imágenes para un producto usando multer
const uploadImagenProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;
    
    // Verificar que el producto existe
    const producto = await productosModel.getProductoById(id_producto);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Si no hay archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se han proporcionado imágenes' });
    }
    
    const imagenesSubidas = [];
    
    // Procesar cada imagen subida
    for (const file of req.files) {
      const url_imagen = `/api/uploads/productos/${file.filename}`;
      
      // Determinar si es la primera imagen (y por tanto principal)
      const es_primera = imagenesSubidas.length === 0 && 
                        !(await imagenesModel.getImagenesByProductoId(id_producto)).length;
      
      const nuevaImagen = await imagenesModel.createImagen({
        id_producto,
        url_imagen,
        descripcion: file.originalname,
        es_principal: es_primera // La primera imagen será la principal si no hay otras
      });
      
      imagenesSubidas.push(nuevaImagen);
    }
    
    res.status(201).json({
      message: `${imagenesSubidas.length} imágenes subidas correctamente`,
      imagenes: imagenesSubidas
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getImagenesByProducto,
  getImagenById,
  createImagen,
  updateImagen,
  deleteImagen,
  setImagenPrincipal,
  uploadImagenProducto
};