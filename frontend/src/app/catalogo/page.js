'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCardComponent from '@/components/ProductCard/ProductCardComponent';
import FilterSidebarComponent from '@/components/FilterSidebar/FilterSidebarComponent';

export default function CatalogoPage() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('relevancia');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Obtener parámetros de la URL
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const marca = searchParams.get('marca') || '';
    
    setSearchTerm(query);
    if (marca) {
      setSelectedMarcas(marca.split(','));
    }
  }, [searchParams]);

  // Obtener productos y marcas
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener productos
        const productsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/productos`
        );

        if (!productsResponse.ok) {
          throw new Error('Error al cargar los productos');
        }

        const productsData = await productsResponse.json();
        
        // Obtener marcas
        const marcasResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/marcas`
        );

        if (!marcasResponse.ok) {
          throw new Error('Error al cargar las marcas');
        }

        const marcasData = await marcasResponse.json();
        
        // Formatear productos
        if (Array.isArray(productsData) && productsData.length > 0) {
          const productosFormateados = productsData.map(item => ({
            id: item.id_producto,
            nombre: item.modelo,
            precio: parseFloat(item.precio),
            precioAnterior: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
            descuento: item.descuento || 0,
            esNuevo: new Date(item.fecha_creacion) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            stock: item.stock,
            marca: { nombre: item.marca, id: item.id_marca },
            imagenes: [item.imagen_principal || null].filter(Boolean)
          }));
          
          setProductos(productosFormateados);
          
          // Calcular el rango de precios para el filtro
          const prices = productosFormateados.map(p => p.precio);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: minPrice, max: maxPrice });
        } 
        
        // Formatear marcas
        if (Array.isArray(marcasData)) {
          setMarcas(marcasData.map(marca => ({
            id: marca.id_marca,
            nombre: marca.nombre,
            logo: marca.logo
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('No se pudieron cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar y ordenar productos
  useEffect(() => {
    let results = [...productos];
    
    // Filtro por búsqueda
    if (searchTerm) {
      results = results.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por marcas
    if (selectedMarcas.length > 0) {
      results = results.filter(producto => 
        selectedMarcas.includes(producto.marca.id?.toString()) || 
        selectedMarcas.includes(producto.marca.nombre)
      );
    }
    
    // Filtro por precio
    results = results.filter(producto => 
      producto.precio >= priceRange.min && producto.precio <= priceRange.max
    );
    
    // Ordenar
    switch (sortBy) {
      case 'precioAsc':
        results.sort((a, b) => a.precio - b.precio);
        break;
      case 'precioDesc':
        results.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombreAsc':
        results.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombreDesc':
        results.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'recientes':
        results.sort((a, b) => (a.esNuevo === b.esNuevo) ? 0 : a.esNuevo ? -1 : 1);
        break;
      default:
        // Por defecto, ordenar por relevancia (mantener orden original)
        break;
    }
    
    setFilteredProductos(results);
  }, [productos, searchTerm, selectedMarcas, priceRange, sortBy]);  // Manejar cambios de búsqueda
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Ya no llamamos a updateUrlParams aquí
  };

  // Manejar cambios de marca
  const handleMarcaChange = (marcaId) => {
    setSelectedMarcas(prev => {
      const isSelected = prev.includes(marcaId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== marcaId)
        : [...prev, marcaId];
      return newSelection;
      // Ya no llamamos a updateUrlParams aquí
    });
  };
  
  // Efecto para sincronizar los filtros con la URL
  useEffect(() => {
    // Solo actualizamos la URL si el componente ya está montado
    // y no es la primera carga
    if (isLoading || !productos.length) return;
    
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.set('q', searchTerm);
    }
    
    if (selectedMarcas.length) {
      params.set('marca', selectedMarcas.join(','));
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    
    // Actualizamos la URL solo si ha cambiado
    if (window.location.search !== `?${params.toString()}`) {
      router.push(newUrl, { scroll: false });
    }
  }, [searchTerm, selectedMarcas, isLoading, productos.length, router]);

  // Manejar cambios de rango de precio
  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
  };

  // Manejar cambios de ordenación
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };  // Ya no necesitamos la función updateUrlParams porque
  // ahora actualizamos la URL con un useEffect// Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMarcas([]);
    setPriceRange({ min: 0, max: 100000 });
    setSortBy('relevancia');
    // La URL se actualizará automáticamente gracias al useEffect
  };

  // Calcular productos paginados
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProductos.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProductos.length / productsPerPage);

  // Componente de paginación
  const Pagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Botón anterior
    pages.push(
      <button 
        key="prev" 
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-indigo-300 disabled:opacity-50 hover:bg-indigo-50 transition-colors"
        aria-label="Página anterior"
      >
        &laquo;
      </button>
    );
    
    // Botón primera página si estamos lejos
    if (startPage > 1) {
      pages.push(
        <button 
          key="1" 
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-1">...</span>);
      }
    }
    
    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i 
              ? 'bg-indigo-600 text-white' 
              : 'hover:bg-indigo-50 transition-colors'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Botón última página si estamos lejos
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-1">...</span>);
      }
      pages.push(
        <button 
          key={totalPages} 
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
        >
          {totalPages}
        </button>
      );
    }
    
    // Botón siguiente
    pages.push(
      <button 
        key="next" 
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-indigo-300 disabled:opacity-50 hover:bg-indigo-50 transition-colors"
        aria-label="Página siguiente"
      >
        &raquo;
      </button>
    );
    
    return (
      <div className="flex flex-wrap justify-center gap-1 mt-8">
        {pages}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera del catálogo */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Catálogo de Productos</h1>
          <p className="text-lg text-indigo-100 max-w-2xl">
            Descubre nuestra colección completa de smartphones y accesorios con la mejor tecnología al mejor precio.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white shadow-md py-4 sticky top-0 z-10 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Input de búsqueda */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Buscar productos..."
                  className="w-full text-black pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Selector de orden */}
            <div className="md:w-auto w-full">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="relevancia">Ordenar por: Relevancia</option>
                <option value="precioAsc">Precio: Menor a Mayor</option>
                <option value="precioDesc">Precio: Mayor a Menor</option>
                <option value="nombreAsc">Nombre: A-Z</option>
                <option value="nombreDesc">Nombre: Z-A</option>
                <option value="recientes">Más recientes primero</option>
              </select>
            </div>

            {/* Botón para mostrar/ocultar filtros en móvil */}
            <button
              onClick={() => setFiltersOpen(prev => !prev)}
              className="lg:hidden flex items-center px-4 py-2 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros */}
          <aside className={`lg:w-1/4 lg:block ${filtersOpen ? 'block' : 'hidden'}`}>
            <FilterSidebarComponent
              marcas={marcas}
              priceRange={priceRange}
              selectedMarcas={selectedMarcas}
              onMarcaChange={handleMarcaChange}
              onPriceChange={handlePriceChange}
              onClearFilters={clearFilters}
            />
          </aside>
          
          {/* Contenido principal - Listado de productos */}
          <main className="lg:w-3/4">
            {/* Estado de carga */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                      <div className="h-6 bg-gray-300 rounded mb-4"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Estado de error
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredProductos.length > 0 ? (
              // Productos encontrados
              <div>
                {/* Información de resultados */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Mostrando <span className="font-semibold">{currentProducts.length}</span> de <span className="font-semibold">{filteredProductos.length}</span> resultados
                  </p>
                </div>
                
                {/* Grid de productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((producto, index) => (
                    <ProductCardComponent 
                      key={producto.id ? producto.id.toString() : `product-${index}`} 
                      product={producto} 
                    />
                  ))}
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && <Pagination />}
              </div>
            ) : (
              // No se encontraron productos
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl shadow-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-20 w-20 text-gray-400 mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-6">Intenta con otros términos de búsqueda o ajusta los filtros</p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}