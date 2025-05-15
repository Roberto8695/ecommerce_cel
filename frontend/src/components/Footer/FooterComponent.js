'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const FooterComponent = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí implementarás la lógica para suscribir al newsletter
    console.log('Email suscrito:', email);
    setEmail('');
    // Mostrar mensaje de éxito o implementar toast notification
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white">
      {/* Separador con onda */}
      <div className="w-full overflow-hidden leading-0 transform rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                opacity=".25" fill="white" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                opacity=".5" fill="white" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
                fill="white" />
        </svg>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Sección principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-2">
                <span className="text-xl font-bold text-indigo-900">EC</span>
              </div>
              <span className="text-xl font-bold text-white">ECel</span>
            </div>
            <p className="text-indigo-200 mb-6">
              La mejor tienda de smartphones y accesorios con los precios más competitivos del mercado. Calidad y servicio garantizado.
            </p>
            {/* Redes sociales */}
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <Link 
                  key={social} 
                  href={`https://${social}.com`}
                  className="w-10 h-10 bg-indigo-800/60 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label={social}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg 
                    className="w-5 h-5 fill-current text-white"
                    dangerouslySetInnerHTML={{ 
                      __html: social === 'facebook' ? 
                        '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>' :
                      social === 'twitter' ?
                        '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>' :
                      social === 'instagram' ?
                        '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>' :
                        '<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>'
                    }}
                    viewBox="0 0 24 24"
                    strokeWidth="0"
                    stroke="currentColor"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Enlaces principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-indigo-700 pb-2">Enlaces rápidos</h3>
            <ul className="space-y-2">
              {['Inicio', 'Productos', 'Categorías', 'Ofertas', 'Novedades'].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === 'Inicio' ? '/' : `/${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} 
                    className="text-indigo-200 hover:text-white transition-colors duration-300 flex items-center"
                  >
                    <svg className="w-3 h-3 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces de soporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-indigo-700 pb-2">Soporte</h3>
            <ul className="space-y-2">
              {['Contacto', 'Preguntas frecuentes', 'Devoluciones', 'Términos y Condiciones', 'Privacidad'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`}
                    className="text-indigo-200 hover:text-white transition-colors duration-300 flex items-center"
                  >
                    <svg className="w-3 h-3 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-indigo-700 pb-2">Newsletter</h3>
            <p className="text-indigo-200 mb-4">Suscríbete para recibir ofertas exclusivas y novedades.</p>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="w-full pl-4 pr-10 py-2 bg-indigo-800/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-300 backdrop-blur-sm"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white"
                  aria-label="Suscribirse"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-indigo-300">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2 h-4 w-4 accent-indigo-500" required />
                  <span>Acepto recibir comunicaciones comerciales</span>
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Sección de información de contacto */}
        <div className="border-t border-indigo-800 pt-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-center md:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-indigo-200">+52 123 456 7890</span>
            </div>
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-indigo-200">contacto@ecel.com</span>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-indigo-200">Av. Principal 123, Ciudad</span>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="mt-8 mb-6">
          <div className="flex flex-wrap justify-center gap-4">
            {['visa', 'mastercard', 'paypal', 'apple-pay', 'google-pay', 'oxxo'].map((payment) => (
              <div key={payment} className="w-12 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-xs font-medium text-indigo-900">
                  {payment.charAt(0).toUpperCase() + payment.slice(1).replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-indigo-800 mt-6 pt-6 text-center">
          <p className="text-indigo-300 text-sm">
            © {currentYear} ECel. Todos los derechos reservados. Diseñado con 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mx-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            por ECel Team
          </p>
        </div>
      </div>

      {/* Botón de regreso arriba */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:scale-110"
        aria-label="Ir arriba"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </footer>
  );
};

export default FooterComponent;