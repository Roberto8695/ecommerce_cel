import Link from "next/link";
import Image from "next/image";
import HeroSectionComponent from "@/components/HeroSection/HeroSectionComponent";
import FeaturedProductsComponent from "@/components/FeaturedProducts/FeaturedProductsComponent";

export default function HomePage() {
  return (
    <div className="min-h-screen">      {/* Hero Section con el nuevo componente */}
      <HeroSectionComponent />
      
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
        </div>      </section>      {/* Productos destacados con el nuevo componente */}
      <FeaturedProductsComponent />
    </div>
  );
}