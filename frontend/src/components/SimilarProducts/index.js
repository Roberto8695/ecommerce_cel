'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProductos } from '../../services/productosService';

/**
 * Componente que muestra productos similares basados en la marca o categoría
 * @param {Object} props
 * @param {Object} props.currentProduct - El producto actual
 * @param {number} props.limit - Cantidad máxima de productos a mostrar (default: 5)
 */
export default function SimilarProducts({ currentProduct, limit = 5 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!currentProduct || !currentProduct.id_producto) return;
      
      setLoading(true);
      try {
        // Obtener todos los productos
        const allProducts = await getProductos();
        
        // Filtrar productos similares (misma marca, excluyendo el producto actual)
        let similarProducts = allProducts.filter(product => 
          product.id_marca === currentProduct.id_marca && 
          product.id_producto !== currentProduct.id_producto
        );
        
        // Si no hay suficientes productos de la misma marca, añadir otros productos
        if (similarProducts.length < limit) {
          const otherProducts = allProducts
            .filter(product => 
              product.id_marca !== currentProduct.id_marca && 
              product.id_producto !== currentProduct.id_producto
            )
            .slice(0, limit - similarProducts.length);
          
          similarProducts = [...similarProducts, ...otherProducts];
        }
        
        // Limitar al número solicitado
        setProducts(similarProducts.slice(0, limit));
      } catch (error) {
        console.error('Error al cargar productos similares:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [currentProduct, limit]);
  // Navegación a detalle de producto
  const handleProductClick = (id) => {
    router.push(`/archiveproduct?id=${id}`);
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Productos similares</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Productos similares</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {products.map((product) => (
          <div 
            key={product.id_producto}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleProductClick(product.id_producto)}
          >
            <div className="relative h-40">
              {product.imagen_principal ? (
                <Image
                  src={product.imagen_principal.startsWith('/api/') || product.imagen_principal.startsWith('/uploads/') 
                    ? `http://localhost:5000${product.imagen_principal}`
                    : product.imagen_principal}
                  alt={product.modelo}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.modelo}</h3>
              <p className="text-sm font-bold text-gray-900 mt-1">${(parseFloat(product.precio) || 0).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
