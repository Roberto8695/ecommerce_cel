const db = require('../config/db');

// Obtener todas las marcas
const getAllMarcas = async () => {
  try {
    const result = await db.query(
      'SELECT * FROM Marcas ORDER BY nombre'
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener marcas: ${error.message}`);
  }
};

// Obtener una marca por ID
const getMarcaById = async (id) => {
  try {
    const result = await db.query(
      'SELECT * FROM Marcas WHERE id_marca = $1',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener marca: ${error.message}`);
  }
};

// Crear una nueva marca
const createMarca = async (marca) => {
  try {
    const { nombre, descripcion, url_logo } = marca;
    const result = await db.query(
      `INSERT INTO Marcas (nombre, descripcion, url_logo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion, url_logo]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear marca: ${error.message}`);
  }
};

// Actualizar una marca
const updateMarca = async (id, marca) => {
  try {
    const { nombre, descripcion, url_logo } = marca;
    const result = await db.query(
      `UPDATE Marcas 
       SET nombre = $1, descripcion = $2, url_logo = $3
       WHERE id_marca = $4
       RETURNING *`,
      [nombre, descripcion, url_logo, id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar marca: ${error.message}`);
  }
};

// Eliminar una marca
const deleteMarca = async (id) => {
  try {
    // Verificar si hay productos asociados a esta marca
    const productosResult = await db.query(
      'SELECT COUNT(*) FROM Productos WHERE id_marca = $1',
      [id]
    );
    
    if (parseInt(productosResult.rows[0].count) > 0) {
      throw new Error('No se puede eliminar la marca porque tiene productos asociados');
    }
    
    const result = await db.query(
      'DELETE FROM Marcas WHERE id_marca = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar marca: ${error.message}`);
  }
};

module.exports = {
  getAllMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca
};
