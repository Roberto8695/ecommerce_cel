"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const HeaderComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Categorías', href: '/categorias' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Aquí implementarás la lógica de búsqueda más adelante
    console.log('Buscando:', searchQuery);
  };

  return (    <header className="bg-white shadow-md sticky top-0 z-50">
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
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <MagnifyingGlassIcon className="h-5 w-5 text-indigo-400" />
              </button>
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
            <Link href="/cuenta" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <UserIcon className="h-6 w-6" />
            </Link>
            <Link 
              href="/carrito" 
              className="flex items-center p-2 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5 mr-1" />
              <span className="font-medium">Carrito</span>
            </Link>

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
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
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