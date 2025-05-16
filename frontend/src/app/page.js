'use client';

import Link from "next/link";
import Image from "next/image";
import HeroSectionComponent from "@/components/HeroSection/HeroSectionComponent";
import HeaderComponent from "@/components/Header/HeaderComponent";
import FooterComponent from "@/components/Footer/FooterComponent";
import FeaturedProductsComponent from "@/components/FeaturedProducts/FeaturedProductsComponent";
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
            
            <FeaturedProductsComponent />
            
          </div>
        </section>
      </div>
      <FooterComponent />
    </>
  );
}
