'use client';

import { useState } from 'react';
import Image from 'next/image';
import FileUpload from '../../../components/FileUpload';

// Modal para crear o editar una marca
export function ModalMarca({ 
  modalAbierto, 
  cerrarModal, 
  modoEdicion, 
  formData, 
  setFormData, 
  handleInputChange,
  handleSubmit 
}) {
  // Estado para previsualizar la imagen del logo
  const [previsualizacion, setPrevisualizacion] = useState(modoEdicion && formData.url_logo ? formData.url_logo : '');
  const [logoFile, setLogoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Manejar la selección de archivos de imagen
  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      setLogoFile(files[0]);
      
      // Crear una URL temporal para la previsualización
      const previewUrl = URL.createObjectURL(files[0]);
      setPrevisualizacion(previewUrl);
      
      // Actualizar el formData
      setFormData({
        ...formData,
        logoFile: files[0],
        // Mantenemos url_logo para compatibilidad, pero será reemplazado en el backend
        url_logo: previewUrl
      });
    }
  };

  // Actualizar previsualización cuando cambie la URL del logo (para compatibilidad)
  const handleLogoChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    setPrevisualizacion(value);
  };

  return (
    modalAbierto && (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto border border-indigo-100">
          <div className="flex justify-between items-center p-6 border-b border-indigo-100 bg-indigo-50">
            <h3 className="text-lg font-semibold text-indigo-900">
              {modoEdicion ? 'Editar Marca' : 'Añadir Nueva Marca'}
            </h3>
            <button onClick={cerrarModal} className="text-indigo-500 hover:text-indigo-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>          <form onSubmit={(e) => {
            e.preventDefault();
            // Crear un FormData si hay un archivo
            if (formData.logoFile) {
              const formDataToSend = new FormData();
              formDataToSend.append('logoFile', formData.logoFile);
              formDataToSend.append('nombre', formData.nombre);
              formDataToSend.append('descripcion', formData.descripcion || '');
              // Si no hay archivo, mantener la URL
              if (!formData.logoFile && formData.url_logo) {
                formDataToSend.append('url_logo', formData.url_logo);
              }
              handleSubmit(e, formDataToSend);
            } else {
              // Si no hay archivo, usar el formulario normal
              handleSubmit(e);
            }
          }} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Nombre de la marca"
                  className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                />              </div>              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Logo de la Marca</label>
                <div className="mt-1 flex flex-col space-y-2">
                  {/* Mantener la opción de URL para compatibilidad */}
                  <div>
                    <label className="block text-xs font-medium text-indigo-600 mb-1">URL (opcional)</label>
                    <input
                      type="url"
                      name="url_logo"
                      value={formData.url_logo || ''}
                      onChange={handleLogoChange}
                      placeholder="https://ejemplo.com/logo.png"
                      className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                    />
                  </div>
                  
                  {/* Nuevo selector de archivo */}
                  <div>
                    <label className="block text-xs font-medium text-indigo-600 mb-1">O sube un archivo (recomendado)</label>
                    <FileUpload 
                      onChange={handleFileChange}
                      maxFiles={1}
                      multiple={false}
                      allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']}
                      maxSizeMB={2}
                      showPreviews={false}
                    />
                  </div>
                </div>
              </div>              {/* Previsualización del logo */}
              {previsualizacion && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-indigo-800 mb-2">Previsualización:</p>                  <div className="h-48 w-48 relative mx-auto border-2 border-indigo-200 rounded-lg overflow-hidden bg-indigo-50 shadow-sm p-2">
                    {previsualizacion.startsWith('/api/') || previsualizacion.startsWith('/uploads/') ? (
                      <Image
                        src={`http://localhost:5000${previsualizacion}`}
                        alt="Logo de la marca"
                        fill
                        className="object-contain p-2"
                        onError={() => setPrevisualizacion('')}
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={previsualizacion}
                        alt="Logo de la marca"
                        fill
                        className="object-contain p-2"
                        onError={() => setPrevisualizacion('')}
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              )}              
              {uploadError && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-600">{uploadError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-indigo-800 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion || ''}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada de la marca..."
                  className="block w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-800 placeholder-indigo-300"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-5 py-2.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {modoEdicion ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

// Modal de confirmación para eliminar una marca
export function ModalEliminar({ modalAbierto, cerrarModal, marcaActual, eliminarMarca, error }) {
  return (
    modalAbierto && (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto border border-red-100">
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-medium text-center text-gray-900">
              ¿Estás seguro de eliminar esta marca?
            </h3>
            <p className="mt-2 text-center text-gray-500">
              Esta acción no se puede deshacer. Se eliminará permanentemente {marcaActual?.nombre} de la base de datos.
            </p>
            
            {/* Mensaje de advertencia sobre productos asociados */}
            <p className="mt-2 text-center text-amber-600 text-sm">
              Nota: No podrás eliminar esta marca si tiene productos asociados.
            </p>
            
            {/* Mostrar error si existe */}
            {error && (
              <div className="mt-3 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminarMarca}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
