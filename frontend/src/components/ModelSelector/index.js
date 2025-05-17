'use client';

import { useState } from 'react';

/**
 * Componente para seleccionar una variante o modelo de un producto
 * @param {Object} props
 * @param {Array} props.options - Opciones disponibles
 * @param {string} props.selectedOption - Opción seleccionada
 * @param {function} props.onChange - Función a llamar cuando se selecciona una opción
 * @param {string} props.label - Etiqueta del selector
 */
export default function ModelSelector({ 
  options = [],
  selectedOption = '',
  onChange,
  label = 'Seleccionar Modelo'
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (option) => {
    if (onChange) onChange(option);
    setIsOpen(false);
  };
  
  // Si no hay opciones, no mostrar nada
  if (!options || options.length === 0) return null;
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="block truncate">
            {selectedOption || 'Seleccionar...'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option, idx) => (
              <li
                key={idx}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                  selectedOption === option ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                }`}
                onClick={() => handleSelect(option)}
              >
                <span className={`block truncate ${selectedOption === option ? 'font-semibold' : 'font-normal'}`}>
                  {option}
                </span>
                {selectedOption === option && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
