'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { toast } from 'react-hot-toast';

const ProductCardComponent = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Obtener la URL de la imagen principal del producto o una imagen por defecto
  let imageUrl = '/img/placeholder-product.png';
  
  if (product?.imagenes && product.imagenes.length > 0) {
    const imagen = product.imagenes[0];
    
    // Si la imagen ya empieza con http, es una URL completa
    if (imagen.startsWith('http')) {
      imageUrl = imagen;
    } 
    // Si la imagen ya contiene la ruta /uploads/, solo necesitamos la base URL
    else if (imagen.includes('/uploads/')) {
      imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${imagen}`;
    }
    // Si es solo el nombre del archivo
    else {
      imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/uploads/productos/${imagen}`;
    }
  }
  
  // Formatear el precio
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product?.precio || 0);
    // Manejar click en el producto
  const handleProductClick = () => {
    router.push(`/archiveproduct?id=${product.id}`);
  };
  
  // Manejar click en añadir al carrito
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evitar navegación al producto
    
    // Mostrar animación de carga
    setIsAddingToCart(true);
    
    // Simulamos una pequeña demora para mostrar la animación
    setTimeout(() => {
      // Añadir el producto al carrito
      addToCart(product);
      
      // Mostrar notificación de éxito
      toast.success(`${product.nombre} añadido al carrito`, {
        position: 'bottom-right',
        duration: 2000,
        style: {
          background: '#4338ca',
          color: '#ffffff'
        }
      });
      
      // Quitar la animación de carga
      setIsAddingToCart(false);
    }, 400);
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Badge de descuento o novedad */}
      {product?.esNuevo && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Nuevo
          </div>
        </div>
      )}
      {product?.descuento > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            -{product.descuento}%
          </div>
        </div>
      )}
      
      {/* Contenedor de la imagen */}
      <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
        {/* Overlay de degradado */}
        <div className={`absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}></div>
        
        {/* Imagen del producto */}
        <div className={`relative h-full w-full transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          <Image
            src={imageUrl}
            alt={product?.nombre || 'Producto'}
            fill
            className={`object-contain transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* Placeholder mientras carga la imagen */}
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Fallback si hay error en la imagen */}
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-xs text-gray-500">Imagen no disponible</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Información del producto */}
      <div className="p-4">
        {/* Marca */}
        <p className="text-xs text-indigo-600 font-medium mb-1">
          {product?.marca?.nombre || 'Marca no disponible'}
        </p>
        
        {/* Nombre del producto */}
        <h3 className="text-gray-900 font-semibold text-lg mb-2 line-clamp-2 h-6">
          {product?.nombre || 'Nombre del producto'}
        </h3>
        
        {/* Precio */}
        <div className="flex items-baseline mb-4">
          {product?.precioAnterior && product.precioAnterior > product.precio ? (
            <>
              <span className="text-lg font-bold text-gray-900 mr-2">{formattedPrice}</span>
              <span className="text-sm text-gray-500 line-through">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(product.precioAnterior)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
          )}
        </div>
          {/* Botón de añadir al carrito */}
        <button
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product?.stock === 0}
        >
          {isAddingToCart ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="relative z-10">Añadiendo...</span>
            </>
          ) : (
            <>
              <span className="relative z-10">Añadir al carrito</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </>
          )}
          
          {/* Efecto de ondulación al hacer click */}
          <span className="absolute inset-0 h-full w-full bg-white/20 scale-0 rounded-full group-hover:scale-100 transition-transform duration-500 origin-center"></span>
        </button>
      </div>
      
      {/* Indicador de stock */}
      {(product?.stock <= 5 && product?.stock > 0) && (
        <div className="absolute bottom-0 left-0 right-0 bg-amber-100 text-amber-800 text-xs text-center py-1">
          ¡Solo quedan {product.stock} unidades!
        </div>
      )}
      {product?.stock === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-800 text-xs text-center py-1">
          Agotado
        </div>
      )}
    </div>
  );
};

export default ProductCardComponent;