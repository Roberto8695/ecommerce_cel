'use client';

import { useState } from 'react';
import Image from 'next/image';
import FileUpload from '../../../components/FileUpload';
import ProductImageGallery from '../../../components/ProductImageGallery';
// Importamos la función para subir imágenes del servicio
import { uploadProductImages, getProductoById } from '../../../services/productosService';
// Importamos servicio alternativo
import { imagenesService } from '../../services/api';
// Importamos la función de recarga
import { recargarProductos } from './reload-helper';

// Modal para crear o editar un producto
export function ModalProducto({ 
  modalAbierto, 
  cerrarModal, 
  modoEdicion, 
  formData, 
  setFormData, 
  marcas, 
  handleInputChange,
  handleSubmit 
}) {
  const [newImages, setNewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Limpiar las imágenes nuevas cuando cambia el modal o el producto
  const handleCerrarModal = () => {
    setNewImages([]);
    setIsUploading(false);
    setUploadError(null);
    cerrarModal();
  };

  // Manejar la selección de archivos de imagen
  const handleFileChange = (files) => {
    setNewImages(files);
  };

  // Manejar cambios en las imágenes existentes
  const handleImageGalleryChange = (updatedImages) => {
    setFormData({
      ...formData,
      imagenes: updatedImages
    });
  };
  
  // Manejar el envío del formulario con carga de imágenes
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Primero guardamos los datos del producto
      const savedProduct = await handleSubmit(e);
      
      // Si hay nuevas imágenes para subir y el producto se guardó correctamente
      if (newImages.length > 0 && savedProduct?.id_producto) {
        setIsUploading(true);
        setUploadError(null);        try {
          // Primero intentamos con el servicio principal
          const formDataImages = new FormData();
          newImages.forEach(file => {
            formDataImages.append('imagenes', file);
          });
          
          // Subir las imágenes
          const resultadoSubida = await uploadProductImages(savedProduct.id_producto, formDataImages);
          console.log("Imágenes subidas:", resultadoSubida);
          
          // Forzar una recarga completa del producto con sus nuevas imágenes
          try {
            // Esperar un breve momento para asegurar que el servidor ha procesado las imágenes
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Obtener el producto actualizado con todas sus imágenes
            const productoActualizado = await recargarProductos(savedProduct.id_producto);
            console.log("Producto recargado después de subir imágenes:", productoActualizado);
            
            // Actualizamos el producto con las nuevas imágenes
            if (productoActualizado) {
              // Actualizamos en la memoria local antes de cerrar el modal
              savedProduct.imagenes = productoActualizado.imagenes;
              savedProduct.imagen_principal = productoActualizado.imagen_principal;
            }
          } catch (errorRecarga) {
            console.error('Error al recargar el producto con imágenes nuevas:', errorRecarga);
          }
        } catch (uploadError) {
          console.error('Error al subir imágenes:', uploadError);
          setUploadError('Error al subir las imágenes. Por favor, intenta de nuevo.');
          throw uploadError;
        }      }
      
      // Cerrar el modal
      handleCerrarModal();
    } catch (error) {
      console.error('Error al guardar producto con imágenes:', error);
      setUploadError('Error al subir las imágenes. Por favor, intenta de nuevo.');
      setIsUploading(false);
    }
  };

  return (
    modalAbierto && (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto border border-indigo-100">
          <div className="flex justify-between items-center p-6 border-b border-indigo-100 bg-indigo-50">
            <h3 className="text-lg font-semibold text-indigo-900">
              {modoEdicion ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h3>
            <button onClick={handleCerrarModal} className="text-indigo-500 hover:text-indigo-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleModalSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Marca *</label>
                <select
                  name="id_marca"
                  value={formData.id_marca}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-700 bg-indigo-50 font-medium"
                >
                  <option value="" className="text-indigo-400">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id_marca} value={marca.id_marca} className="text-indigo-700">
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Modelo *</label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  required
                  placeholder="Nombre del modelo"
                  className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                />              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Precio *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-indigo-500 sm:text-sm font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    name="precio"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    className="block w-full pl-7 pr-3 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  placeholder="0"
                  className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                />
              </div>              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del producto..."
                  className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                ></textarea>
              </div>

              {/* Sección para imágenes existentes */}
              {modoEdicion && formData.imagenes && formData.imagenes.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-indigo-800 mb-1">Imágenes actuales</label>
                  <ProductImageGallery 
                    images={formData.imagenes} 
                    productId={formData.id_producto}
                    onImageChange={handleImageGalleryChange}
                  />
                </div>
              )}              {/* Sección para subir nuevas imágenes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Subir nuevas imágenes</label>
                <FileUpload 
                  onChange={handleFileChange}
                  maxFiles={5}
                  allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxSizeMB={2}
                />                {uploadError && (
                  <p className="mt-2 text-sm font-medium text-red-600">{uploadError}</p>
                )}
              </div>
            </div>            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCerrarModal}
                className="px-5 py-2.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className={`px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

// Modal para confirmar la eliminación de un producto
export function ModalEliminar({ modalAbierto, cerrarModal, productoActual, eliminarProducto }) {
  if (!modalAbierto || !productoActual) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-red-100">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>          <h3 className="text-xl font-bold text-red-800 text-center mb-2">
            ¿Eliminar producto?
          </h3>
            <p className="text-gray-700 text-center mb-6">
            Estás a punto de eliminar <span className="font-bold text-red-700">{productoActual.modelo}</span>. Esta acción no se puede deshacer y también eliminará todas las imágenes asociadas.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={cerrarModal}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={eliminarProducto}
              className="px-5 py-2.5 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium shadow-md"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
