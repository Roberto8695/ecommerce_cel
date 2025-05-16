'use client';

import { useState } from 'react';

const FilterSidebarComponent = ({ 
  marcas = [], 
  priceRange,
  selectedMarcas = [],
  onMarcaChange,
  onPriceChange,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-[73px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-indigo-900">Filtros</h2>
        <button 
          onClick={onClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Limpiar todo
        </button>
      </div>
      
      {/* Filtro por marcas */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Marcas</h3>
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
          {marcas.map(marca => (
            <div key={marca.id} className="flex items-center">
              <input
                type="checkbox"
                id={`marca-${marca.id}`}
                checked={selectedMarcas.includes(marca.id.toString())}
                onChange={() => onMarcaChange(marca.id.toString())}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={`marca-${marca.id}`}
                className="ml-2 block text-sm text-gray-700"
              >
                {marca.nombre}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filtro por precio */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Precio</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">
              ${priceRange.min.toLocaleString('es-MX')}
            </span>
            <span className="text-sm text-gray-500">
              ${priceRange.max.toLocaleString('es-MX')}
            </span>
          </div>
          
          {/* Slider personalizado para el rango de precios */}
          <input 
            type="range"
            min={0}
            max={100000}
            value={priceRange.max}
            onChange={(e) => onPriceChange(priceRange.min, parseInt(e.target.value))}
            className="w-full text-black h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          
          {/* Inputs numéricos para el rango de precios */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="min-price" className="sr-only">Precio mínimo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="min-price"
                  value={priceRange.min}
                  onChange={(e) => onPriceChange(parseInt(e.target.value), priceRange.max)}
                  className="pl-7 text-black  pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Min"
                />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="max-price" className="sr-only">Precio máximo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="max-price"
                  value={priceRange.max}
                  onChange={(e) => onPriceChange(priceRange.min, parseInt(e.target.value))}
                  className="pl-7 text-black  pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebarComponent;
