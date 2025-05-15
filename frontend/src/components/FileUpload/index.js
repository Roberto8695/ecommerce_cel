'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

/**
 * Componente reutilizable para subir archivos con vista previa de imágenes
 */
export default function FileUpload({
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  multiple = true,
  existingFiles = [],
  showPreviews = true,
  className = '',
  previewSize = 'medium', // small, medium, large
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Tamaños de previsualización
  const sizeClasses = {
    small: 'h-16 w-16',
    medium: 'h-24 w-24',
    large: 'h-32 w-32',
  };

  // Procesar archivos seleccionados
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setErrors([]);
    
    // Validar cantidad de archivos
    if (files.length + selectedFiles.length > maxFiles) {
      setErrors([`No puedes subir más de ${maxFiles} archivos.`]);
      return;
    }
    
    // Validar cada archivo
    const validFiles = [];
    const newErrors = [];
    const newPreviews = [];
    
    files.forEach(file => {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        newErrors.push(`El archivo "${file.name}" no es un tipo permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
        return;
      }
      
      // Validar tamaño de archivo
      if (file.size > maxSizeMB * 1024 * 1024) {
        newErrors.push(`El archivo "${file.name}" excede el tamaño máximo de ${maxSizeMB}MB.`);
        return;
      }
      
      // Crear vista previa
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            id: `preview-${Date.now()}-${validFiles.length}`,
            url: e.target.result,
            name: file.name
          });
          
          // Actualizar previews cuando todas las lecturas estén completas
          if (newPreviews.length === validFiles.length) {
            setPreviews([...previews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
      
      validFiles.push(file);
    });
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
    
    if (validFiles.length > 0) {
      const updatedSelectedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedSelectedFiles);
      if (onChange) {
        onChange(updatedSelectedFiles);
      }
    }
    
    // Limpiar input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Eliminar archivo
  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles];
    const updatedPreviews = [...previews];
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    if (onChange) {
      onChange(updatedFiles);
    }
  };
  
  // Desencadenar click en input file
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Errores */}
      {errors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {errors.map((error, index) => (
            <div key={index} className="text-sm">• {error}</div>
          ))}
        </div>
      )}
      
      {/* Input file oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={allowedTypes.join(',')}
        className="hidden"
      />
      
      {/* Área de drop y botón */}
      <div 
        onClick={triggerFileInput}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-600 mb-1">
          {selectedFiles.length > 0 
            ? `${selectedFiles.length} archivos seleccionados` 
            : 'Haz clic o arrastra archivos aquí'}
        </p>
        <p className="text-xs text-gray-500">
          {allowedTypes.join(', ')} (máx. {maxSizeMB}MB)
        </p>
      </div>
      
      {/* Previsualizaciones */}
      {showPreviews && previews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {previews.map((preview, index) => (
              <div key={preview.id} className="relative group">
                <div className={`relative ${sizeClasses[previewSize]} bg-gray-100 rounded-md overflow-hidden`}>                  <Image
                    src={preview.url}
                    alt={preview.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar archivo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs truncate mt-1">{preview.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Archivos existentes */}
      {existingFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Archivos existentes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {existingFiles.map((file, index) => (
              <div key={file.id || index} className="relative group">
                <div className={`relative ${sizeClasses[previewSize]} bg-gray-100 rounded-md overflow-hidden`}>                  <Image
                    src={file.url.startsWith('/api/') || file.url.startsWith('/uploads/') 
                      ? `http://localhost:5000${file.url}`
                      : file.url}
                    alt={file.name || `Archivo ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-xs truncate mt-1">{file.name || `Archivo ${index + 1}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 