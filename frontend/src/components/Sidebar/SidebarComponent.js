"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

// Iconos importados de Heroicons (necesitarás instalar @heroicons/react)
import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SidebarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, admin } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <HomeIcon className="w-6 h-6" />
    },
    {
      title: 'Ventas',
      path: '/dashboard/ventas',
      icon: <ShoppingCartIcon className="w-6 h-6" />
    },
    {
      title: 'Clientes',
      path: '/dashboard/clientes',
      icon: <UsersIcon className="w-6 h-6" />
    },
    {
      title: 'Productos',
      path: '/dashboard/productos',
      icon: <CubeIcon className="w-6 h-6" />
    },
    {
      title: 'Marcas',
      path: '/dashboard/marcas',
      icon: <TagIcon className="w-6 h-6" />
    },
    
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <>      {/* Botón de hamburguesa móvil */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2.5 bg-indigo-600 text-white rounded-lg shadow-lg lg:hidden hover:bg-indigo-700 transition-colors"
        aria-label="Menú"
      >
        {isOpen ? 
          <XMarkIcon className="w-6 h-6 animate-pulse" /> : 
          <Bars3Icon className="w-6 h-6 hover:rotate-12 transition-transform duration-300" />
        }
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden backdrop-blur-sm transition-all duration-300"
          onClick={toggleSidebar}
        ></div>
      )}{/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-gradient-to-br from-indigo-800 to-indigo-950 text-white w-72 shadow-xl flex flex-col`}
      >
        {/* Logo y nombre de la empresa */}
        <div className="p-6 border-b border-indigo-700/60">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-white text-indigo-800 rounded-md">
              <ShoppingCartIcon className="w-5 h-5" />
            </span>
            ECommerce Cel
          </h1>          <p className="text-sm text-indigo-200 mt-1">Panel de Administración</p>
          {/* Información del usuario - Manejando de forma segura */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {admin && admin.nombre && typeof admin.nombre === 'string' && admin.nombre.length > 0 
                  ? admin.nombre.charAt(0).toUpperCase() 
                  : 'A'}
              </span>
            </div>
            <p className="text-sm font-medium text-indigo-100">
              Hola, {admin && admin.nombre && typeof admin.nombre === 'string' && admin.nombre.length > 0 
                ? admin.nombre 
                : 'Admin'}
            </p>
          </div>
        </div>        {/* Menú principal */}
        <nav className="flex-grow overflow-y-auto py-5">
          <div className="px-4 mb-3">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-2">Menú principal</p>
          </div>
          <ul className="space-y-1.5 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <span
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      pathname === item.path
                        ? 'bg-indigo-700/80 text-white font-medium shadow-md'
                        : 'text-indigo-100 hover:bg-indigo-700/40 hover:translate-x-1'
                    }`}
                  >
                    <span className={`${pathname === item.path ? 'text-white' : 'text-indigo-300'}`}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                    {pathname === item.path && (
                      <span className="ml-auto w-1.5 h-5 bg-white rounded-full"></span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>        {/* Pie del sidebar */}
        <div className="p-4 border-t border-indigo-700/40 mt-auto bg-indigo-900/40">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-700/60 transition-all duration-200 group"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="group-hover:translate-x-1 transition-transform duration-200">Cerrar sesión</span>
          </button>
        </div>
      </aside>      {/* Espaciador para empujar el contenido (solo para escritorio) */}
      <div className="hidden lg:block w-72"></div>
    </>
  );
};

export default SidebarComponent;