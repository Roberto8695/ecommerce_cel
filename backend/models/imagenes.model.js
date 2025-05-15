const db = require('../config/db');

// Obtener todas las imágenes de un producto
const getImagenesByProductoId = async (id_producto) => {
  try {
    const result = await db.query(
      'SELECT * FROM Imagenes_Producto WHERE id_producto = $1 ORDER BY es_principal DESC, id_imagen',
      [id_producto]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener imágenes del producto: ${error.message}`);
  }
};

// Obtener una imagen por ID
const getImagenById = async (id_imagen) => {
  try {
    const result = await db.query(
      'SELECT * FROM Imagenes_Producto WHERE id_imagen = $1',
      [id_imagen]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener imagen: ${error.message}`);
  }
};

// Obtener la imagen principal de un producto
const getImagenPrincipal = async (id_producto) => {
  try {
    const result = await db.query(
      'SELECT * FROM Imagenes_Producto WHERE id_producto = $1 AND es_principal = true',
      [id_producto]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener imagen principal: ${error.message}`);
  }
};

// Añadir una nueva imagen al producto
const createImagen = async (imagen) => {
  try {
    const { id_producto, url_imagen, descripcion, es_principal } = imagen;
    
    // Si la imagen es principal, actualizar para que ninguna otra sea principal
    if (es_principal) {
      await db.query(
        'UPDATE Imagenes_Producto SET es_principal = false WHERE id_producto = $1',
        [id_producto]
      );
    }
    
    const result = await db.query(
      `INSERT INTO Imagenes_Producto (id_producto, url_imagen, descripcion, es_principal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_producto, url_imagen, descripcion, es_principal]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear imagen: ${error.message}`);
  }
};

// Actualizar una imagen
const updateImagen = async (id_imagen, imagen) => {
  try {
    const { url_imagen, descripcion, es_principal } = imagen;
    
    // Obtener el id_producto de la imagen actual
    const imagenActual = await getImagenById(id_imagen);
    if (!imagenActual) {
      throw new Error('Imagen no encontrada');
    }
    
    // Si la imagen se marca como principal, actualizar las demás imágenes del producto
    if (es_principal) {
      await db.query(
        'UPDATE Imagenes_Producto SET es_principal = false WHERE id_producto = $1',
        [imagenActual.id_producto]
      );
    }
    
    const result = await db.query(
      `UPDATE Imagenes_Producto 
       SET url_imagen = $1, descripcion = $2, es_principal = $3
       WHERE id_imagen = $4
       RETURNING *`,
      [url_imagen, descripcion, es_principal, id_imagen]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar imagen: ${error.message}`);
  }
};

// Eliminar una imagen
const deleteImagen = async (id_imagen) => {
  try {
    const imagen = await getImagenById(id_imagen);
    if (!imagen) {
      throw new Error('Imagen no encontrada');
    }
    
    const result = await db.query(
      'DELETE FROM Imagenes_Producto WHERE id_imagen = $1 RETURNING *',
      [id_imagen]
    );
    
    // Si la imagen eliminada era principal y hay otras imágenes, establecer la primera como principal
    if (imagen.es_principal) {
      const otrasImagenes = await db.query(
        'SELECT id_imagen FROM Imagenes_Producto WHERE id_producto = $1 LIMIT 1',
        [imagen.id_producto]
      );
      
      if (otrasImagenes.rows.length > 0) {
        await db.query(
          'UPDATE Imagenes_Producto SET es_principal = true WHERE id_imagen = $1',
          [otrasImagenes.rows[0].id_imagen]
        );
      }
    }
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
};

module.exports = {
  getImagenesByProductoId,
  getImagenById,
  getImagenPrincipal,
  createImagen,
  updateImagen,
  deleteImagen
}; 