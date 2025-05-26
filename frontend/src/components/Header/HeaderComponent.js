"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/lib/CartContext';
import { buscarProductos } from '@/services/productosService';

const HeaderComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/catalogo' },
    { name: 'Marcas', href: '#marcas' },
    
  ];

  // Función para obtener la URL de la imagen correctamente
  const getImageUrl = (image) => {
    if (!image) return null;
    
    if (image.startsWith('http')) {
      return image;
    } else if (image.includes('/uploads/')) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${image}`;
    } else {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/uploads/productos/${image}`;
    }
  };

  // Manejar la búsqueda en tiempo real - usando la misma lógica que el catálogo
  useEffect(() => {
    // Función para realizar la búsqueda
    const searchProducts = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          console.log('Buscando productos con término:', searchQuery);

          // Usamos la función actualizada que aplica la misma lógica que el catálogo
          const results = await buscarProductos(searchQuery);
          console.log('Resultados obtenidos:', results);

          // Limitamos a 5 resultados para el dropdown
          setSearchResults(results.slice(0, 5));
          setShowResults(true);
        } catch (error) {
          console.error('Error al buscar productos:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    // Debounce para evitar múltiples llamadas mientras el usuario escribe
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchProducts();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Cerrar resultados cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejar envío del formulario de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  // Manejar clic en un resultado
  const handleResultClick = (productId) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(`/archiveproduct?id=${productId}`);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-md flex items-center justify-center">
              <span className="text-xl font-bold text-white">EC</span>
            </div>
            <span className="text-xl font-bold text-indigo-900 hidden sm:block">ECel</span>
          </Link>

          {/* Buscador en pantallas medianas y grandes */}
          <div ref={searchRef} className="hidden md:block flex-grow max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 text-black rounded-full border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5 text-indigo-400" />
                )}
              </button>

              {/* Dropdown de resultados de búsqueda */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                  <ul>
                    {isSearching ? (
                      <li className="p-4 text-center">
                        <div className="flex justify-center">
                          <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Buscando productos...</p>
                      </li>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map(product => (
                          <li key={product.id || product.id_producto} className="border-b border-gray-100 last:border-none">
                            <button
                              onClick={() => handleResultClick(product.id || product.id_producto)}
                              className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="relative h-12 w-12 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                {product.imagenes && product.imagenes.length > 0 ? (
                                  <Image 
                                    src={getImageUrl(product.imagenes[0])}
                                    alt={product.nombre || product.modelo || 'Producto'}
                                    fill
                                    className="object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/images/product-placeholder.png';
                                    }}
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                    <span className="text-gray-400 text-xs">Sin imagen</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-3 flex-grow">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {product.nombre || product.modelo}
                                </p>
                                <p className="text-sm text-indigo-600 font-medium">
                                  {new Intl.NumberFormat('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN',
                                  }).format(product.precio)}
                                </p>
                                {product.marca && product.marca.nombre && (
                                  <p className="text-xs text-gray-500">{product.marca.nombre}</p>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={() => handleSearch({ preventDefault: () => {} })}
                            className="w-full p-2 text-center text-indigo-600 hover:bg-indigo-50 text-sm font-medium"
                          >
                            Ver todos los resultados
                          </button>
                        </li>
                      </>
                    ) : (
                      <li className="p-4 text-center">
                        <p className="text-sm text-gray-500">No se encontraron productos</p>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </form>
          </div>

          {/* Navegación en pantallas grandes */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Iconos de usuario y carrito */}
          <div className="flex items-center space-x-4">
            
            {cartCount > 0 ? (
              <Link 
                href="/cart" 
                className="flex items-center p-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors relative group"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-1" />
                <span className="font-medium">Carrito</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
                <span className="absolute inset-0 rounded-md bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </Link>
            ) : null}

            {/* Botón de menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 lg:hidden"
              aria-label="Menú"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Buscador en móvil */}
        <div className="mt-4 md:hidden" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Dropdown de resultados de búsqueda para móvil */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                <ul>
                  {isSearching ? (
                    <li className="p-4 text-center">
                      <div className="flex justify-center">
                        <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Buscando productos...</p>
                    </li>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map(product => (
                        <li key={product.id || product.id_producto} className="border-b border-gray-100 last:border-none">
                          <button
                            onClick={() => handleResultClick(product.id || product.id_producto)}
                            className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="relative h-12 w-12 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                              {product.imagenes && product.imagenes.length > 0 ? (
                                <Image 
                                  src={getImageUrl(product.imagenes[0])}
                                  alt={product.nombre || product.modelo || 'Producto'}
                                  fill
                                  className="object-contain"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/product-placeholder.png';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                  <span className="text-gray-400 text-xs">Sin imagen</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex-grow">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.nombre || product.modelo}
                              </p>
                              <p className="text-sm text-indigo-600 font-medium">
                                {new Intl.NumberFormat('es-MX', {
                                  style: 'currency',
                                  currency: 'MXN',
                                }).format(product.precio)}
                              </p>
                              {product.marca && product.marca.nombre && (
                                <p className="text-xs text-gray-500">{product.marca.nombre}</p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={() => handleSearch({ preventDefault: () => {} })}
                          className="w-full p-2 text-center text-indigo-600 hover:bg-indigo-50 text-sm font-medium"
                        >
                          Ver todos los resultados
                        </button>
                      </li>
                    </>
                  ) : (
                    <li className="p-4 text-center">
                      <p className="text-sm text-gray-500">No se encontraron productos</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 border-t border-gray-100">
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100 transition-colors ${
                      pathname === item.href ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default HeaderComponent;