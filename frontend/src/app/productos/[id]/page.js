'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductoById } from '../../../services/productosService';
import ProductImageGallery from '../../../components/ProductImageGallery';

import ModelSelector from '../../../components/ModelSelector';
import SimilarProducts from '../../../components/SimilarProducts';
import { useCart } from '../../../lib/CartContext';

export default function DetalleProductoPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [selectedModel, setSelectedModel] = useState('');

  // Datos ficticios para la demo usando useMemo para evitar recreaciones
  const modeloVariantes = useMemo(() => ['64GB', '128GB', '256GB', '512GB'], []);
  const productRating = 3.5;
  const productReviews = 4;
  useEffect(() => {
    const cargarProducto = async () => {
      if (!params.id) return;
      
      setCargando(true);
      setError(null);
      
      try {
        const data = await getProductoById(params.id);
        setProducto(data);
        // Seleccionar el primer modelo por defecto
        if (modeloVariantes.length > 0) {
          setSelectedModel(modeloVariantes[0]);
        }
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('No se pudo cargar la información del producto');
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [params.id, modeloVariantes]);

  const handleVolver = () => {
    router.back();
  };

  const handleAddToCart = () => {
    if (!producto) return;
    
    const variantText = selectedModel ? ` - ${selectedModel}` : '';
    
    addToCart({
      id: producto.id_producto,
      nombre: `${producto.modelo}${variantText}`,
      precio: producto.precio,
      quantity: cantidad,
      imagenes: producto.imagenes && producto.imagenes.length > 0 
        ? [producto.imagenes.find(img => img.es_principal)?.url_imagen || producto.imagenes[0].url_imagen] 
        : [],
      marca: { nombre: producto.marca }
    });
    
    // Mostrar alguna notificación de éxito si lo deseas
  };

  const incrementarCantidad = () => {
    if (cantidad < producto.stock) {
      setCantidad(prev => prev + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  if (cargando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'No se encontró el producto solicitado'}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleVolver} 
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="mb-6">
        <button 
          onClick={handleVolver}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Galería de imágenes */}
          <div className="md:col-span-1">
            {producto.imagenes && producto.imagenes.length > 0 ? (
              <ProductImageGallery 
                images={producto.imagenes} 
                productId={producto.id_producto}
                readOnly={true}
              />
            ) : (
              <div className="bg-gray-100 rounded-md p-20 flex items-center justify-center">
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="md:col-span-1 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{producto.modelo}</h1>
            
            
            
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {producto.marca}
              </span>
            </div>
            
            <div className="text-3xl font-bold text-gray-900 mb-4">
              ${(parseFloat(producto.precio) || 0).toFixed(2)}
            </div>
            
            {/* Selector de modelo/variante */}
            <div className="mb-6">
              <ModelSelector 
                options={modeloVariantes} 
                selectedOption={selectedModel} 
                onChange={setSelectedModel} 
                label="Seleccionar Modelo"
              />
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Disponibilidad</h3>
              <p className={`flex items-center text-sm ${
                producto.stock > 10 ? 'text-green-600' : 
                producto.stock > 0 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {producto.stock > 10 ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    En stock ({producto.stock} unidades)
                  </>
                ) : producto.stock > 0 ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Pocas unidades disponibles ({producto.stock})
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Agotado
                  </>
                )}
              </p>
            </div>
            
            {/* Cantidad */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Cantidad</h3>
              <div className="flex items-center border border-gray-300 rounded-md w-32">
                <button 
                  type="button" 
                  onClick={decrementarCantidad}
                  disabled={cantidad <= 1}
                  className={`px-3 py-1 ${cantidad <= 1 ? 'text-gray-400' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  -
                </button>
                <span className="flex-1 text-center">{cantidad}</span>
                <button 
                  type="button" 
                  onClick={incrementarCantidad}
                  disabled={cantidad >= producto.stock}
                  className={`px-3 py-1 ${cantidad >= producto.stock ? 'text-gray-400' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  +
                </button>
              </div>
            </div>
            
            {producto.descripcion && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
                <div className="prose prose-sm text-gray-600 max-w-none">
                  <p>{producto.descripcion}</p>
                </div>
              </div>
            )}
            
            <div className="mt-auto space-y-3">
              <button 
                disabled={producto.stock <= 0}
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 ${
                  producto.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {producto.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
              </button>
              
              <button className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Añadir a favoritos
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Información adicional</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">ID de producto</p>
                  <p className="font-medium text-gray-900">{producto.id_producto}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha de registro</p>
                  <p className="font-medium text-gray-900">
                    {new Date(producto.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Productos similares */}
      <SimilarProducts currentProduct={producto} limit={5} />
    </div>
  );
}