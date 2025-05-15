'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeroSectionComponent = () => {
  // Estado para el efecto de "typing" en el título
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = "Encuentra tu smartphone ideal";

  // Estado para animación de desplazamiento
  const [scrolled, setScrolled] = useState(false);

  // Efecto para animación de escritura
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText + fullText[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 100); // Velocidad de escritura

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="relative h-screen bg-black overflow-hidden">
      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-700/30 rounded-full blur-2xl"></div>
        
        {/* Patrones geométricos */}
        <div className="hidden md:block absolute top-20 right-20 w-40 h-40 border-8 border-indigo-500/20 rounded-full"></div>
        <div className="hidden md:block absolute bottom-20 left-40 w-20 h-20 border-4 border-indigo-400/30 rounded-lg rotate-12"></div>
        <div className="absolute top-1/3 left-1/4 w-10 h-10 bg-white/10 rounded-lg rotate-45"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Columna de texto */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
                  {displayText}
                </span>
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-indigo-200 mb-8 max-w-lg mx-auto lg:mx-0">
              Descubre nuestra selección premium de smartphones con las últimas tecnologías, 
              las mejores marcas y precios increíbles.
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/productos" className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-1">
                Ver catálogo
              </Link>
              <Link href="/productos/destacados" className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-indigo-400/30 font-medium rounded-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                Ofertas especiales
              </Link>
            </div>
            
            {/* Badges */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center bg-indigo-900/70 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-indigo-200 text-sm">Envío gratis</span>
              </div>
              
              <div className="flex items-center bg-indigo-900/70 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-indigo-200 text-sm">Garantía 1 año</span>
              </div>
              
              <div className="flex items-center bg-indigo-900/70 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-indigo-200 text-sm">Soporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Columna de imagen */}
          <div className="lg:w-1/2 relative">
            <div className="relative w-full h-[600px] md:h-[600px] z-10">
              {/* Cambiar la ruta por la imagen de un smartphone que tengas o añade una */}
              <Image 
                src="/img/samsung.avif"
                alt="Smartphone Premium"
                fill
                className=" object-contain drop-shadow-2xl"
                style={{ 
                  transform: scrolled ? 'scale(1.05) rotate(-2deg)' : 'scale(1) rotate(0)',
                  transition: 'transform 0.5s ease-out' 
                }}
                priority
              />
              
              {/* Círculos decorativos detrás del teléfono */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/30 rounded-full blur-md -z-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-700/20 rounded-full blur-md -z-20"></div>
            </div>
            
            {/* Distintivos flotantes */}
            <div className="absolute top-10 right-0 bg-white py-2 px-4 rounded-lg shadow-lg animate-bounce-slow">
              <span className="text-indigo-900 font-bold">¡Nuevo!</span>
            </div>
            
            <div className="absolute bottom-10 left-10 bg-indigo-600 py-2 px-4 rounded-full shadow-lg">
              <span className="text-white font-bold">-15% Descuento</span>
            </div>
          </div>
        </div>
      </div>
      
     
    </section>
  );
};

export default HeroSectionComponent;

// Custom animation
const styles = `
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-bounce-slow {
    animation: bounce-slow 3s infinite;
  }
`;

// Inyectar estilos personalizados
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}