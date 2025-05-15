const db = require('../config/db');

// Obtener todos los productos con su imagen principal
const getAllProductos = async () => {
  try {
    const result = await db.query(
      `SELECT p.*, m.nombre as marca, 
        (SELECT ip.url_imagen 
         FROM Imagenes_Producto ip 
         WHERE ip.id_producto = p.id_producto AND ip.es_principal = true 
         LIMIT 1) as imagen_principal
       FROM Productos p 
       JOIN Marcas m ON p.id_marca = m.id_marca 
       ORDER BY p.fecha_creacion DESC`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
};

// Obtener un producto por ID con todas sus imágenes
const getProductoById = async (id) => {
  try {
    // Obtener el producto con su marca
    const productResult = await db.query(
      `SELECT p.*, m.nombre as marca 
       FROM Productos p 
       JOIN Marcas m ON p.id_marca = m.id_marca 
       WHERE p.id_producto = $1`,
      [id]
    );
    
    if (productResult.rows.length === 0) {
      return null;
    }
    
    const producto = productResult.rows[0];
    
    // Obtener las imágenes del producto
    const imagenesResult = await db.query(
      `SELECT * FROM Imagenes_Producto 
       WHERE id_producto = $1 
       ORDER BY es_principal DESC, id_imagen`,
      [id]
    );
    
    // Añadir las imágenes al producto
    producto.imagenes = imagenesResult.rows;
    
    return producto;
  } catch (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);
  }
};

// Crear un nuevo producto
const createProducto = async (producto) => {
  try {
    const { id_marca, modelo, precio, stock, descripcion } = producto;
    const result = await db.query(
      `INSERT INTO Productos (id_marca, modelo, precio, stock, descripcion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_marca, modelo, precio, stock, descripcion]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear producto: ${error.message}`);
  }
};

// Actualizar un producto
const updateProducto = async (id, producto) => {
  try {
    const { id_marca, modelo, precio, stock, descripcion } = producto;
    const result = await db.query(
      `UPDATE Productos 
       SET id_marca = $1, modelo = $2, precio = $3, stock = $4, descripcion = $5
       WHERE id_producto = $6
       RETURNING *`,
      [id_marca, modelo, precio, stock, descripcion, id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar producto: ${error.message}`);
  }
};

// Eliminar un producto
const deleteProducto = async (id) => {
  try {
    // Las imágenes se borrarán automáticamente por la restricción ON DELETE CASCADE
    const result = await db.query(
      'DELETE FROM Productos WHERE id_producto = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};
