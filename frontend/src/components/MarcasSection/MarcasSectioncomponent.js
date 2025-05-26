'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMarcas } from '@/services/marcasService';

const MarcasSectionComponent = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const [hoveredMarca, setHoveredMarca] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [productCounts, setProductCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // URL base para las imágenes del backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Función para manejar errores de carga de imágenes
  const handleImageError = (marcaId) => {
    setImgErrors(prev => ({
      ...prev,
      [marcaId]: true
    }));
  };

  // Simulamos conteo de productos por marca (esto debería venir del backend)
  const mockProductCounts = {
    1: 24,
    2: 18,
    3: 32,
    4: 15,
    5: 27
  };
    useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const data = await getMarcas();
        // Tomar solo las primeras 5 marcas o todas si hay menos
        const marcasConRutasCorregidas = data.slice(0, 5).map(marca => {
          if (marca.url_logo) {
            // Verificar si la URL ya incluye http:// o https://
            if (!marca.url_logo.startsWith('http://') && !marca.url_logo.startsWith('https://')) {
              // Si la URL es relativa, añadir la URL base
              return {
                ...marca,
                url_logo: `${API_BASE_URL}${marca.url_logo.startsWith('/') ? '' : '/'}${marca.url_logo}`
              };
            }
          }
          return marca;
        });
        
        setMarcas(marcasConRutasCorregidas);
        setProductCounts(mockProductCounts); // En un escenario real, esto vendría de una llamada a la API
        setLoading(false);
        // Agregamos un pequeño retardo para la animación de entrada
        setTimeout(() => {
          setAnimateIn(true);
        }, 300);
      } catch (err) {
        console.error('Error cargando marcas:', err);
        setError('No se pudieron cargar las marcas');
        setLoading(false);
      }
    };
    
    fetchMarcas();
  }, [API_BASE_URL, mockProductCounts]);

  // Auto-avanzar el carrusel cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (marcas.length > 0) {
        setActiveIndex((current) => (current + 1) % marcas.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [marcas.length]);

  // Manejar click en los indicadores
  const handleIndicatorClick = (index) => {
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="w-16 h-16 mx-auto border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600">Cargando marcas...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section  className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id='marcas' className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-indigo-300/20 rounded-full blur-2xl"></div>
        <div className="hidden md:block absolute top-20 left-20 w-16 h-16 border-8 border-indigo-300/20 rounded-full"></div>
        <div className="hidden md:block absolute bottom-20 right-40 w-10 h-10 border-4 border-indigo-200/30 rounded-lg rotate-12"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-indigo-900 mb-4">Nuestras Marcas</h2>
          <div className="w-24 h-1 bg-indigo-500 mx-auto"></div>
          <p className="mt-4 text-indigo-700 max-w-2xl mx-auto">
            Trabajamos con las marcas más reconocidas del mercado para ofrecerte la mejor calidad y tecnología en smartphones
          </p>
        </div>

        {/* Sección principal de marcas - Vista para dispositivos grandes */}
        <div className="hidden md:block">          <div className="grid grid-cols-5 gap-6">
            {marcas.map((marca, index) => (
              <Link 
                href={`/catalogo?marca=${marca.id_marca}`} 
                key={marca.id_marca}
                className="group"
              ><div 
                  className={`bg-white rounded-xl shadow-md overflow-hidden p-6
                            relative group/marca before:absolute before:inset-0 before:bg-gradient-to-tr 
                            before:from-indigo-500/0 before:to-indigo-600/0 before:opacity-0 hover:before:opacity-10
                            before:transition-all before:duration-500 before:rounded-xl
                            transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-200/50
                            ${activeIndex === index ? 'ring-2 ring-indigo-500 scale-105' : ''}`}
                >
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full 
                                blur-2xl opacity-0 group-hover/marca:opacity-100 transition-all duration-700"></div>
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full 
                                blur-2xl opacity-0 group-hover/marca:opacity-100 transition-all duration-700 delay-100"></div>
                                
                  <div className="h-32 flex items-center justify-center mb-4 relative z-10 
                               transition-transform duration-500 group-hover/marca:transform group-hover/marca:scale-110">
                    {marca.url_logo && !imgErrors[marca.id_marca] ? (
                      <div className="relative w-full h-full overflow-hidden filter group-hover/marca:brightness-110">
                        <Image 
                          src={marca.url_logo} 
                          alt={marca.nombre}
                          fill
                          className="object-contain transform transition-transform duration-700 group-hover/marca:rotate-3"
                          sizes="(max-width: 768px) 100vw, 200px"
                          unoptimized={true}
                          onError={() => handleImageError(marca.id_marca)}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-500">
                          {marca.nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-indigo-900 group-hover:text-indigo-600 transition-colors">
                      {marca.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {marca.descripcion || 'Smartphones y accesorios de calidad'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Carrusel para dispositivos móviles */}
        <div className="md:hidden">
          <div className="relative">
            {marcas.map((marca, index) => (
              <div 
                key={marca.id_marca}
                className={`transition-opacity duration-500 absolute inset-0 
                          ${activeIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}                style={{ display: activeIndex === index ? 'block' : 'none' }}
              >
                <Link href={`/catalogo?marca=${marca.id_marca}`}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">                    <div className="h-48 flex items-center justify-center mb-4">
                      {marca.url_logo ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={marca.url_logo} 
                            alt={marca.nombre}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 200px"
                            unoptimized={true}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-indigo-500">
                            {marca.nombre.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-indigo-900">
                        {marca.nombre}
                      </h3>
                      <p className="text-gray-500 mt-2">
                        {marca.descripcion || 'Smartphones y accesorios de calidad'}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Indicadores del carrusel */}
          <div className="flex justify-center mt-6 space-x-2">
            {marcas.map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300
                         ${activeIndex === index ? 'bg-indigo-600 w-6' : 'bg-indigo-300'}`}
                aria-label={`Ir a marca ${index + 1}`}
              ></button>
            ))}
          </div>

          {/* Flechas de navegación */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-4">
            <button
              onClick={() => setActiveIndex((current) => (current - 1 + marcas.length) % marcas.length)}
              className="bg-white p-2 rounded-full shadow-md hover:bg-indigo-50"
              aria-label="Anterior marca"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex((current) => (current + 1) % marcas.length)}
              className="bg-white p-2 rounded-full shadow-md hover:bg-indigo-50"
              aria-label="Siguiente marca"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>        {/* Enlace a todas las marcas */}
        <div className="mt-12 text-center">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center px-6 py-3 border border-indigo-300 text-indigo-700 bg-white rounded-lg hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            Ver todas las marcas
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Lista de badges / características */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { text: "Garantía oficial", icon: "🔰" },
            { text: "Productos originales", icon: "✅" },
            { text: "Soporte técnico", icon: "🛠️" },
            { text: "Envío rápido", icon: "🚚" }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-center bg-white/70 backdrop-blur-sm py-3 px-4 rounded-lg shadow-sm border border-indigo-100"
            >
              <span className="text-xl mr-2">{item.icon}</span>
              <span className="text-sm font-medium text-indigo-800">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarcasSectionComponent;