'use client';

import Link from "next/link";
import Image from "next/image";
import HeroSectionComponent from "@/components/HeroSection/HeroSectionComponent";
import HeaderComponent from "@/components/Header/HeaderComponent";
import FooterComponent from "@/components/Footer/FooterComponent";
import MarcasSectionComponent from "@/components/MarcasSection/MarcasSectioncomponent";

export default function HomePage() {
  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen">
        {/* Hero Section con el nuevo componente */}
        <HeroSectionComponent />
        
        {/* Sección de marcas */}
        <MarcasSectionComponent />
        
        {/* Categorías destacadas */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-indigo-900 mb-12 text-center">Categorías Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Smartphones', 'Accesorios', 'Audio', 'Smartwatches'].map((category, index) => (
                <Link key={index} href="/categorias" className="group">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-indigo-100">
                    <div className="h-40 bg-indigo-50 flex items-center justify-center">
                      {/* Placeholder para imagen */}
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-2xl text-indigo-500">{category.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-lg text-indigo-900">{category}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600 text-white">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Buscas ofertas especiales?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Regístrate para recibir noticias sobre descuentos exclusivos y lanzamientos
            </p>
            <Link href="/registro" 
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1">
              Suscríbete ahora
            </Link>
          </div>
        </section>

        {/* Productos destacados */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-indigo-900 mb-12 text-center">Productos Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['iPhone 15', 'Samsung S24', 'Xiaomi 14', 'Google Pixel 9'].map((product, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-100/50 group">
                  <div className="h-52 bg-indigo-50 relative">
                    {/* Aquí podrías colocar imágenes reales con Next/Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-2xl text-indigo-500 font-medium">{product.split(' ')[1] || product.charAt(0)}</span>
                      </div>
                    </div>
                    {/* Badge de descuento */}
                    {index % 2 === 0 && (
                      <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -15%
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-indigo-900 group-hover:text-indigo-600 transition-colors">{product}</h3>
                    <div className="flex items-center mt-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">(120 reseñas)</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {index % 2 === 0 ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">$1,299.00</span>
                            <span className="ml-2 text-lg font-bold text-indigo-600">$1,099.00</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-indigo-600">$999.00</span>
                        )}
                      </div>
                      <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-2 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/productos" className="inline-block px-8 py-3 border border-indigo-300 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                Ver todos los productos
              </Link>
            </div>
          </div>
        </section>
      </div>
      <FooterComponent />
    </>
  );
}
