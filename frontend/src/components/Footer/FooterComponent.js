'use client';

import Link from 'next/link';

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white">
      <div className="container mx-auto px-4 py-10">
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div>
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
              {['facebook', 'twitter', 'instagram'].map((social) => (
                <Link 
                  key={social} 
                  href={`https://${social}.com`}
                  className="w-8 h-8 bg-indigo-800/60 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label={social}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg 
                    className="w-4 h-4 fill-current text-white"
                    dangerouslySetInnerHTML={{ 
                      __html: social === 'facebook' ? 
                        '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>' :
                      social === 'twitter' ?
                        '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>' :
                        '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>'
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

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Enlaces rápidos</h3>
            <ul className="space-y-2">
              {['Inicio', 'Productos', 'Marcas'].map((item) => (
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

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-indigo-200">+52 123 456 7890</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-indigo-200">contacto@ecel.com</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-indigo-200">Av. Principal 123, Ciudad de México, México</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-indigo-200">Lunes a Viernes: 9am - 6pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-indigo-800 mt-8 pt-6 text-center">
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