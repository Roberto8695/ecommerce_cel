'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Datos, 2: Pago, 3: Confirmación
  const [orderID, setOrderID] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 minutos en segundos
  const countdownIntervalRef = useRef(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    state: 'Ciudad de México',
    paymentMethod: 'qr'
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Calcular el envío (gratis por encima de $10,000, de lo contrario $150)
  const shippingCost = cartTotal > 10000 ? 0 : 150;
  
  // Calcular el total con envío
  const totalWithShipping = cartTotal + shippingCost;
  // Verificar si hay productos en el carrito
  useEffect(() => {
    if (cartItems.length === 0 && !orderID) {
      router.push('/catalogo');
      toast.error('No hay productos en el carrito. Añade productos antes de continuar.', {
        position: 'bottom-right',
        duration: 4000
      });
    }
    
    setIsLoading(false);
  }, [cartItems.length, router, orderID]);

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const zipCodeRegex = /^[0-9]{5}$/;

    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errors.email = 'El email es obligatorio';
    else if (!emailRegex.test(formData.email)) errors.email = 'Email inválido';
    
    if (!formData.phone.trim()) errors.phone = 'El teléfono es obligatorio';
    else if (!phoneRegex.test(formData.phone)) errors.phone = 'Teléfono inválido (10 dígitos)';
    
    if (!formData.address.trim()) errors.address = 'La dirección es obligatoria';
    if (!formData.city.trim()) errors.city = 'La ciudad es obligatoria';
    
    if (!formData.zipCode.trim()) errors.zipCode = 'El código postal es obligatorio';
    else if (!zipCodeRegex.test(formData.zipCode)) errors.zipCode = 'Código postal inválido (5 dígitos)';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ir al siguiente paso
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!validateForm()) return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      if (currentStep === 1) {
        // Generar QR de pago ficticio para el paso de pago
        generateQRCode();
        startCountdown();
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Simular confirmación de pago
        completeOrder();
      }
    }, 1000);
  };

  // Generar código QR
  const generateQRCode = () => {
    // Simulación: generamos un ID de orden aleatorio para el QR
    const newOrderID = `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    setOrderID(newOrderID);
    
    // En un caso real, aquí integrarías con la pasarela de pagos para generar el QR
    // Por ahora usaremos un servicio gratuito para generar QRs
    const qrData = `https://ecommercecelmx.com/pago/${newOrderID}?amount=${totalWithShipping.toFixed(2)}&concept=Compra en ECommerce Cel`;
    setQrImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
  };

  // Iniciar cuenta regresiva
  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Formatear la cuenta regresiva
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  // Completar la orden
  const completeOrder = () => {
    // Simulación: completar la orden después de confirmar pago
    clearInterval(countdownIntervalRef.current);
    setCurrentStep(3);
    
    // Limpiar carrito
    clearCart();
    
    // Mostrar notificación de éxito
    toast.success('¡Compra realizada con éxito!', {
      position: 'bottom-right',
      duration: 4000,
      style: {
        background: '#10B981',
        color: '#ffffff'
      }
    });
  };

  // Limpiar intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            {currentStep < 3 && (
              <Link 
                href={currentStep === 1 ? '/cart' : '#'}
                onClick={e => {
                  if (currentStep === 2) {
                    e.preventDefault();
                    setCurrentStep(1);
                    clearInterval(countdownIntervalRef.current);
                  }
                }}
                className="mr-4 text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStep === 1 && 'Finalizar Compra'}
              {currentStep === 2 && 'Realizar Pago'}
              {currentStep === 3 && '¡Compra Completada!'}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Paso 1: Formulario de datos */}
        {currentStep === 1 && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Formulario */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de Envío</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="Nombre completo"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="correo@ejemplo.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${formErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="10 dígitos"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="Calle, número, colonia"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${formErrors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="Ciudad"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${formErrors.zipCode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="5 dígitos"
                    />
                    {formErrors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      name="state"
                      id="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Ciudad de México">Ciudad de México</option>
                      <option value="Aguascalientes">Aguascalientes</option>
                      <option value="Baja California">Baja California</option>
                      <option value="Baja California Sur">Baja California Sur</option>
                      <option value="Campeche">Campeche</option>
                      <option value="Chiapas">Chiapas</option>
                      <option value="Chihuahua">Chihuahua</option>
                      <option value="Coahuila">Coahuila</option>
                      <option value="Colima">Colima</option>
                      <option value="Durango">Durango</option>
                      <option value="Estado de México">Estado de México</option>
                      <option value="Guanajuato">Guanajuato</option>
                      <option value="Guerrero">Guerrero</option>
                      <option value="Hidalgo">Hidalgo</option>
                      <option value="Jalisco">Jalisco</option>
                      <option value="Michoacán">Michoacán</option>
                      <option value="Morelos">Morelos</option>
                      <option value="Nayarit">Nayarit</option>
                      <option value="Nuevo León">Nuevo León</option>
                      <option value="Oaxaca">Oaxaca</option>
                      <option value="Puebla">Puebla</option>
                      <option value="Querétaro">Querétaro</option>
                      <option value="Quintana Roo">Quintana Roo</option>
                      <option value="San Luis Potosí">San Luis Potosí</option>
                      <option value="Sinaloa">Sinaloa</option>
                      <option value="Sonora">Sonora</option>
                      <option value="Tabasco">Tabasco</option>
                      <option value="Tamaulipas">Tamaulipas</option>
                      <option value="Tlaxcala">Tlaxcala</option>
                      <option value="Veracruz">Veracruz</option>
                      <option value="Yucatán">Yucatán</option>
                      <option value="Zacatecas">Zacatecas</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Método de pago</h3>
                    <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="qr"
                          value="qr"
                          checked={formData.paymentMethod === 'qr'}
                          onChange={handleFormChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="qr" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                          Pago con QR
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 ml-7">
                        Paga utilizando un código QR que podrás escanear con la app de tu banco
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen de compra</h2>
                
                <div className="mb-6">
                  <p className="font-medium text-gray-900 mb-2">Productos ({cartItems.length}):</p>
                  <ul className="space-y-2 text-sm">
                    {cartItems.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.quantity}x {item.nombre}
                        </span>
                        <span className="text-gray-900 font-medium">{formatPrice(item.precio * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="text-gray-900 font-medium">{formatPrice(cartTotal)}</dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Envío</dt>
                    <dd className="text-gray-900 font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </dd>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <dt className="text-lg font-semibold text-gray-900">Total</dt>
                    <dd className="text-lg font-semibold text-indigo-600">{formatPrice(totalWithShipping)}</dd>
                  </div>
                </dl>
                
                <button
                  onClick={goToNextStep}
                  className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Continuar a pago
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Pago con QR */}
        {currentStep === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Escanea para pagar</h2>
              <p className="text-gray-600 mb-6">
                Usa la app de tu banco para escanear el código QR y completar tu pago
              </p>
              
              {qrImage && (
                <div className="mb-6 flex justify-center">
                  <div className="border-4 border-indigo-100 p-4 rounded-lg">
                    <Image 
                      src={qrImage}
                      alt="Código QR para pago" 
                      width={200} 
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <p className="text-gray-600 mb-1">Orden #: <span className="font-semibold">{orderID}</span></p>
                <p className="text-gray-600 mb-1">Total a pagar: <span className="font-semibold">{formatPrice(totalWithShipping)}</span></p>
                <p className="text-gray-600">Tiempo restante: <span className={`font-semibold ${countdown < 60 ? 'text-red-500' : ''}`}>{formatCountdown()}</span></p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <span className="font-semibold">Importante:</span> Este QR expirará en 15 minutos. Para esta demo, puedes simular que ya completaste el pago.
                </p>
              </div>
              
              <button
                onClick={goToNextStep}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Ya realicé mi pago
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación de compra */}
        {currentStep === 3 && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="rounded-full bg-green-100 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">¡Gracias por tu compra!</h2>
              <p className="text-gray-600 mb-6">
                Tu pedido ha sido recibido y está siendo procesado.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-gray-600 mb-1">Número de orden: <span className="font-semibold">{orderID}</span></p>
                <p className="text-gray-600 mb-1">Total pagado: <span className="font-semibold">{formatPrice(totalWithShipping)}</span></p>
                <p className="text-gray-600">Fecha: <span className="font-semibold">{new Date().toLocaleDateString('es-MX')}</span></p>
              </div>
              
              <p className="text-gray-600 mb-8">
                Recibirás un email con los detalles de tu compra en: <span className="font-semibold">{formData.email}</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  Volver a la tienda
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}