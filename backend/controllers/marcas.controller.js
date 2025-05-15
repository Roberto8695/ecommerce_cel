const marcasModel = require('../models/marcas.model');

// Obtener todas las marcas
const getAllMarcas = async (req, res) => {
  try {
    const marcas = await marcasModel.getAllMarcas();
    res.status(200).json(marcas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una marca por ID
const getMarcaById = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await marcasModel.getMarcaById(id);
    
    if (!marca) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    
    res.status(200).json(marca);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva marca
const createMarca = async (req, res) => {
  try {
    const { nombre, descripcion, url_logo } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la marca es obligatorio' });
    }
    
    const marca = await marcasModel.createMarca({
      nombre,
      descripcion,
      url_logo
    });
    
    res.status(201).json(marca);
  } catch (error) {
    // Manejar error de unicidad
    if (error.message.includes('unique')) {
      return res.status(400).json({ error: 'Ya existe una marca con ese nombre' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una marca existente
const updateMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, url_logo } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la marca es obligatorio' });
    }
    
    const marcaExistente = await marcasModel.getMarcaById(id);
    
    if (!marcaExistente) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    
    const marcaActualizada = await marcasModel.updateMarca(id, {
      nombre,
      descripcion,
      url_logo
    });
    
    res.status(200).json(marcaActualizada);
  } catch (error) {
    // Manejar error de unicidad
    if (error.message.includes('unique')) {
      return res.status(400).json({ error: 'Ya existe una marca con ese nombre' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva marca con imagen
const createMarcaWithImage = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la marca es obligatorio' });
    }
      // Verificar si se subió una imagen
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha seleccionado ninguna imagen' });
    }
    
    // Construir la URL completa de la imagen (con el dominio del servidor)
    const url_logo = `/api/uploads/marcas/${req.file.filename}`;
    
    const marca = await marcasModel.createMarca({
      nombre,
      descripcion,
      url_logo
    });
    
    res.status(201).json(marca);
  } catch (error) {
    // Manejar error de unicidad
    if (error.message.includes('unique')) {
      return res.status(400).json({ error: 'Ya existe una marca con ese nombre' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una marca existente con imagen
const updateMarcaWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la marca es obligatorio' });
    }
    
    const marcaExistente = await marcasModel.getMarcaById(id);
    
    if (!marcaExistente) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
      // Verificar si se subió una imagen
    let url_logo = marcaExistente.url_logo;
    if (req.file) {
      url_logo = `/api/uploads/marcas/${req.file.filename}`;
    }
    
    const marcaActualizada = await marcasModel.updateMarca(id, {
      nombre,
      descripcion,
      url_logo
    });
    
    res.status(200).json(marcaActualizada);
  } catch (error) {
    // Manejar error de unicidad
    if (error.message.includes('unique')) {
      return res.status(400).json({ error: 'Ya existe una marca con ese nombre' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una marca
const deleteMarca = async (req, res) => {
  try {
    const { id } = req.params;
    
    const marcaExistente = await marcasModel.getMarcaById(id);
    
    if (!marcaExistente) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    
    const marcaEliminada = await marcasModel.deleteMarca(id);
    
    res.status(200).json({
      message: 'Marca eliminada correctamente',
      marca: marcaEliminada
    });
  } catch (error) {
    // Manejar error de restricción de clave foránea
    if (error.message.includes('tiene productos asociados')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMarcas,
  getMarcaById,
  createMarca,
  createMarcaWithImage,
  updateMarca,
  updateMarcaWithImage,
  deleteMarca
};
