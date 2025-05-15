'use client';

import { useState } from 'react';
import Image from 'next/image';
import { setMainImage, deleteImage } from '../../services/productosService';

/**
 * Componente para mostrar una galería de imágenes de producto con funcionalidades para:
 * - Mostrar imágenes en cuadrícula
 * - Establecer imagen principal
 * - Eliminar imágenes
 * - Ver imágenes en modo ampliado
 */
export default function ProductImageGallery({ 
  images = [], 
  productId, 
  onImageChange,
  readOnly = false
}) {
  const [activeImage, setActiveImage] = useState(images.find(img => img.es_principal) || images[0] || null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejador para establecer una imagen como principal
  const handleSetMainImage = async (image) => {
    if (readOnly || image.es_principal) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await setMainImage(productId, image.id_imagen);
      
      // Actualizar el estado local
      const updatedImages = images.map(img => ({
        ...img,
        es_principal: img.id_imagen === image.id_imagen
      }));
      
      setActiveImage(image);
      if (onImageChange) onImageChange(updatedImages);
    } catch (err) {
      console.error('Error al establecer imagen principal:', err);
      setError('No se pudo establecer como imagen principal');
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar proceso de eliminación de imagen
  const confirmDeleteImage = (image) => {
    if (readOnly) return;
    setImageToDelete(image);
    setIsConfirmingDelete(true);
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setImageToDelete(null);
    setIsConfirmingDelete(false);
  };

  // Eliminar la imagen confirmada
  const handleDeleteImage = async () => {
    if (!imageToDelete || readOnly) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteImage(imageToDelete.id_imagen);
      
      // Actualizar estado local
      const updatedImages = images.filter(img => img.id_imagen !== imageToDelete.id_imagen);
      
      // Si la imagen eliminada era la activa o principal, seleccionar otra
      if (activeImage.id_imagen === imageToDelete.id_imagen) {
        setActiveImage(updatedImages[0] || null);
      }
      
      if (onImageChange) onImageChange(updatedImages);
      setIsConfirmingDelete(false);
      setImageToDelete(null);
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      setError('No se pudo eliminar la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar el modo de zoom de imagen
  const toggleZoom = () => {
    if (activeImage) {
      setIsZoomed(!isZoomed);
    }
  };

  if (images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-md p-6 flex items-center justify-center flex-col">
        <div className="text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button 
            className="absolute top-0 right-0 px-4 py-3" 
            onClick={() => setError(null)}
          >
            <span className="sr-only">Cerrar</span>
            &times;
          </button>
        </div>
      )}
      
      {/* Imagen principal activa */}
      <div 
        onClick={toggleZoom}
        className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer mb-4 ${isLoading ? 'opacity-50' : ''}`}
        style={{ height: '300px' }}
      >        {activeImage ? (
          <Image
            src={activeImage.url_imagen.startsWith('/api/') || activeImage.url_imagen.startsWith('/uploads/') 
              ? `http://localhost:5000${activeImage.url_imagen}`
              : activeImage.url_imagen}
            alt="Imagen de producto"
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Indicador de imagen principal */}
        {activeImage?.es_principal && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Principal
          </div>
        )}
      </div>
      
      {/* Miniaturas */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((image) => (
          <div 
            key={image.id_imagen}
            onClick={() => setActiveImage(image)}
            className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer h-20 ${
              activeImage?.id_imagen === image.id_imagen ? 'ring-2 ring-blue-500' : ''
            } ${isLoading ? 'opacity-50' : ''}`}
          >            <Image
              src={image.url_imagen.startsWith('/api/') || image.url_imagen.startsWith('/uploads/') 
                ? `http://localhost:5000${image.url_imagen}`
                : image.url_imagen}
              alt="Miniatura de producto"
              fill
              className="object-cover"
              unoptimized
            />
            
            {/* Indicadores y botones de acción */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              {!readOnly && (
                <div className="opacity-0 hover:opacity-100 flex space-x-1">
                  {!image.es_principal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetMainImage(image);
                      }}
                      className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                      title="Establecer como principal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteImage(image);
                    }}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    title="Eliminar imagen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal de zoom */}
      {isZoomed && activeImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={toggleZoom}
        >
          <div className="relative w-full max-w-4xl h-full max-h-[80vh]">            <Image
              src={activeImage.url_imagen.startsWith('/api/') || activeImage.url_imagen.startsWith('/uploads/') 
                ? `http://localhost:5000${activeImage.url_imagen}`
                : activeImage.url_imagen}
              alt="Imagen ampliada"
              fill
              className="object-contain"
              unoptimized
            />
            <button 
              className="absolute top-4 right-4 bg-white rounded-full p-2"
              onClick={toggleZoom}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmar eliminación</h3>
            <p className="mb-6">¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteImage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 