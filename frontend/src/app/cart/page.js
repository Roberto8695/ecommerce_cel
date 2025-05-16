'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { toast } from 'react-hot-toast';
import { TrashIcon, MinusIcon, PlusIcon, ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  // Calcular subtotal
  const subtotal = cartTotal;
  const envio = cartItems.length > 0 ? 99 : 0;
  const total = subtotal + envio;
  // Proceder al checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    
    // Mostrar indicador de carga
    setIsLoading(true);
    
    // Redireccionar al checkout después de un breve momento
    setTimeout(() => {
      router.push('/checkout');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">Tu Carrito</h1>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Link 
              href="/" 
              className="hover:text-indigo-600 transition-colors flex items-center"
            >
              Inicio
            </Link>
            <span className="mx-2">›</span>
            <span className="text-indigo-600 font-medium">Carrito</span>
          </div>
        </div>

        {isLoading ? (
          // Estado de carga
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex py-6 border-b border-gray-200 mb-4">
                <div className="h-24 w-24 rounded bg-gray-200 flex-shrink-0"></div>
                <div className="ml-6 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="w-32">
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
            <div className="mt-8 flex justify-between">
              <div className="w-1/2">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="w-1/3">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          // Carrito vacío
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center">
              <ShoppingBagIcon className="h-24 w-24 text-gray-300" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-800">Tu carrito está vacío</h2>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Parece que aún no has añadido ningún producto a tu carrito. Explora nuestro catálogo para encontrar lo que necesitas.
            </p>
            <Link 
              href="/catalogo"
              className="mt-8 inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Ir al catálogo
            </Link>
          </div>
        ) : (
          // Carrito con productos
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lista de productos */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Productos ({cartItems.length})</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex py-6 px-6">
                      {/* Imagen del producto */}
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 relative">
                        <Image
                          src={item.imagenes && item.imagenes.length > 0 ? 
                            (item.imagenes[0].startsWith('http') 
                              ? item.imagenes[0] 
                              : item.imagenes[0].includes('/uploads/') 
                                ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${item.imagenes[0]}` 
                                : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/uploads/productos/${item.imagenes[0]}`)
                            : '/img/placeholder-product.png'
                          }
                          alt={item.nombre}
                          fill
                          sizes="100px"
                          className="object-contain object-center"
                        />
                      </div>

                      {/* Detalles del producto */}
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-800">
                            <h3>
                              <Link href={`/productos/${item.id}`} className="hover:text-indigo-600">
                                {item.nombre}
                              </Link>
                            </h3>
                            <p className="ml-4">{formatPrice(item.precio * item.quantity)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.marca && item.marca.nombre ? item.marca.nombre : 'Sin marca'}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          {/* Control de cantidad */}
                          <div className="flex items-center border border-gray-200 rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2 py-1 text-gray-600 hover:text-indigo-700 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-1 border-x border-gray-200 min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:text-indigo-700 transition-colors"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      clearCart();
                      toast.success('Carrito vaciado correctamente');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen de la orden */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-20">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Resumen de orden</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="text-gray-900 font-medium">{formatPrice(subtotal)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Envío</p>
                      <p className="text-gray-900 font-medium">{formatPrice(envio)}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <p className="text-lg font-semibold text-gray-900">Total</p>
                      <p className="text-lg font-bold text-indigo-700">{formatPrice(total)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="mt-8 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    Proceder al pago
                  </button>

                  <div className="mt-6 text-center">
                    <Link 
                      href="/catalogo"
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center transition-colors"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" />
                      Seguir comprando
                    </Link>
                  </div>
                </div>                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative h-8 w-12">
                      <Image src="/img/visa.svg" alt="Visa" fill className="object-contain" />
                    </div>
                    <div className="relative h-8 w-12">
                      <Image src="/img/mastercard.svg" alt="MasterCard" fill className="object-contain" />
                    </div>
                    <div className="relative h-8 w-12">
                      <Image src="/img/paypal.svg" alt="PayPal" fill className="object-contain" />
                    </div>
                    <div className="relative h-8 w-12">
                      <Image src="/img/mercadopago.svg" alt="Mercado Pago" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}