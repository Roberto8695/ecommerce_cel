'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCardComponent from '@/components/ProductCard/ProductCardComponent';
import { useRouter } from 'next/navigation';

const FeaturedProductsComponent = () => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);
  const router = useRouter();

  // Obtener productos desde la API
  useEffect(() => {
    const fetchProductos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/productos`
        );

        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }

        const data = await response.json();        try {
          // Verificamos que data sea un array y tenga elementos
          if (Array.isArray(data) && data.length > 0) {            // Adaptamos los datos al formato que espera nuestro componente
            const productosFormateados = data.map(item => ({
              id: item.id_producto,
              nombre: item.modelo,
              precio: parseFloat(item.precio),
              precioAnterior: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
              descuento: item.descuento || 0,
              esNuevo: new Date(item.fecha_creacion) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Nuevo si es de los últimos 7 días
              stock: item.stock,
              marca: { nombre: item.marca },
              imagenes: [item.imagen_principal || null].filter(Boolean)
            }));
            // Limitamos a 5 productos para la sección de destacados
            setProductos(productosFormateados.slice(0, 5));
          } else if (data.productos && Array.isArray(data.productos) && data.productos.length > 0) {            // Mismo mapeo pero para el caso de que venga como objeto
            const productosFormateados = data.productos.map(item => ({
              id: item.id_producto,
              nombre: item.modelo,
              precio: parseFloat(item.precio),
              precioAnterior: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
              descuento: item.descuento || 0,
              esNuevo: new Date(item.fecha_creacion) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              stock: item.stock,
              marca: { nombre: item.marca },
              imagenes: [item.imagen_principal || null].filter(Boolean)
            }));
            
            setProductos(productosFormateados.slice(0, 5));
          } else {
            // Si no hay productos, usamos los datos de ejemplo
            throw new Error('No se encontraron productos');
          }
        } catch (processingError) {
          console.error('Error procesando datos de productos:', processingError);
          // Caemos en los datos de ejemplo
          throw new Error('Error en formato de datos');
        }      } catch (error) {
        console.error('Error fetching productos:', error);
        setError('No se pudieron cargar los productos');
        // Productos de ejemplo en caso de error
        const productosEjemplo = [
          { 
            id: 1, 
            nombre: 'iPhone 15 Pro', 
            precio: 24999, 
            precioAnterior: 26999, 
            descuento: 7, 
            esNuevo: true,
            stock: 10,
            marca: { nombre: 'Apple' }, 
            imagenes: ['/uploads/productos/producto-1747250785141-656384037.jpg']
          },
          { 
            id: 2, 
            nombre: 'Samsung Galaxy S24 Ultra', 
            precio: 22999, 
            precioAnterior: 25999, 
            descuento: 12, 
            stock: 15,
            marca: { nombre: 'Samsung' }, 
            imagenes: ['producto-1747249953117-847269223.png']
          },
          { 
            id: 3, 
            nombre: 'Xiaomi 14 Pro', 
            precio: 15999, 
            esNuevo: true,
            stock: 8,
            marca: { nombre: 'Xiaomi' }, 
            imagenes: ['producto-1747341635094-639685737.png']
          },
          { 
            id: 4, 
            nombre: 'Google Pixel 8', 
            precio: 18999, 
            precioAnterior: 20999, 
            descuento: 10, 
            stock: 5,
            marca: { nombre: 'Google' }, 
            imagenes: ['producto-1747341674881-10453153.webp']
          },
          { 
            id: 5, 
            nombre: 'Nothing Phone 2', 
            precio: 14999, 
            esNuevo: true,
            stock: 20,
            marca: { nombre: 'Nothing' }, 
            imagenes: ['producto-1747341705942-477179749.png']
          }
        ];
        
        console.log("Usando productos de ejemplo:", productosEjemplo);
        setProductos(productosEjemplo);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductos();
  }, [retries]); // Ejecutar cuando cambie el número de reintentos
  // Ver todos los productos
  const handleVerCatalogo = () => {
    router.push('/catalogo');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-900">Productos Destacados</h2>
          <div className="hidden md:block">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <div className="w-3 h-3 rounded-full bg-indigo-700"></div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          // Estado de carga
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Estado de error
          <div className="text-center py-12">
            <div className="text-red-500 text-xl">{error}</div>
            <button 
              onClick={() => setRetries(prev => prev + 1)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (          // Productos cargados correctamente
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {productos.map((producto, index) => (
              <ProductCardComponent 
                key={producto.id ? producto.id.toString() : `product-${index}`} 
                product={producto} 
              />
            ))}
          </div>
        )}

        {/* Botón "Ver catálogo completo" */}
        <div className="mt-12 text-center">
          <button 
            onClick={handleVerCatalogo}
            className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 gap-2"
          >
            Ver catálogo completo
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsComponent;
