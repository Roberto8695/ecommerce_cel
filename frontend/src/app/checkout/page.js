'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUpload';
import { createCliente } from '@/services/clientesService';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Datos, 2: Pago, 3: Confirmación
  const [orderID, setOrderID] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 minutos en segundos
  const countdownIntervalRef = useRef(null);
  const [finalTotal, setFinalTotal] = useState(0); // Guardar el monto total para la confirmación

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    state: 'Bolivia',
    paymentMethod: 'qr'
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Estado para el comprobante de pago
  const [comprobante, setComprobante] = useState(null);
  const [comprobanteError, setComprobanteError] = useState('');
  // Calcular el envío (siempre gratis)
  const shippingCost = 0;
  
  // Calcular el total con envío
  const totalWithShipping = cartTotal;
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
    const phoneRegex = /^[0-9]{8}$/;
    const zipCodeRegex = /^[0-9]{5}$/;

    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errors.email = 'El email es obligatorio';
    else if (!emailRegex.test(formData.email)) errors.email = 'Email inválido';
    
    if (!formData.phone.trim()) errors.phone = 'El teléfono es obligatorio';
    else if (!phoneRegex.test(formData.phone)) errors.phone = 'Teléfono inválido (8 dígitos)';
    
    if (!formData.address.trim()) errors.address = 'La dirección es obligatoria';
    if (!formData.city.trim()) errors.city = 'La ciudad es obligatoria';
    
    if (!formData.zipCode.trim()) errors.zipCode = 'El código postal es obligatorio';
    else if (!zipCodeRegex.test(formData.zipCode)) errors.zipCode = 'Código postal inválido (5 dígitos)';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Ir al siguiente paso
  const goToNextStep = async () => {
    if (currentStep === 1) {
      if (!validateForm()) return;      
      setIsLoading(true);
      try {
        // Primero creamos o actualizamos el cliente
        const clienteData = {
          nombre: formData.name,
          email: formData.email,
          telefono: formData.phone,
          direccion: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.state}`
        };
        
        // Notificar al usuario
        toast.loading('Guardando datos del cliente...', {
          position: 'bottom-right',
          id: 'creating-client'
        });
        
        // Guardar los datos del cliente
        const clienteResponse = await createCliente(clienteData);
        toast.dismiss('creating-client');
        
        if (!clienteResponse.cliente) {
          throw new Error('No se pudo crear el cliente');
        }
        
        const idCliente = clienteResponse.cliente.id_cliente;
        
        // Crear el pedido en la base de datos
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Preparar los datos del pedido
        const pedidoData = {
          id_cliente: idCliente, // Usamos el ID del cliente que acabamos de crear/actualizar
          total: totalWithShipping,
          metodo_pago: formData.paymentMethod,
          productos: cartItems.map(item => ({
            id_producto: item.id,
            cantidad: item.quantity,
            precio_unitario: item.precio,
            subtotal: item.precio * item.quantity
          }))
        };
        
        console.log('Enviando datos de pedido:', JSON.stringify(pedidoData, null, 2));
        
        // Notificar al usuario
        toast.loading('Procesando pedido...', {
          position: 'bottom-right',
          id: 'creating-order'
        });
        
        // Enviar solicitud para crear el pedido
        const response = await fetch(`${API_URL}/pedidos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pedidoData)
        });
        
        toast.dismiss('creating-order');
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Error al parsear la respuesta JSON:', parseError);
          throw new Error('Error al procesar la respuesta del servidor');
        }
        
        if (!response.ok) {
          console.error('Error en la respuesta del servidor:', data);
          throw new Error(data.message || data.error || 'Error al crear el pedido');
        }
        
        // Guardar el ID del pedido
        const pedidoId = data.data.id_pedido;
        
        // Avanzar al paso de pago
        if (formData.paymentMethod === 'qr') {
          // Generar QR y mostrar cuenta regresiva
          generateQRCode(pedidoId);
          startCountdown();
          setCurrentStep(2);        } else if (formData.paymentMethod === 'tarjeta') {
          // Para tarjeta, ir directamente a la página de agradecimiento ya que se considera pagado
          setOrderID(pedidoId);
          setFinalTotal(totalWithShipping); // Guardar el total final
          
          // Preparar datos para pasar a la página de agradecimiento
          const itemsParam = encodeURIComponent(JSON.stringify(cartItems));
          
          // Limpiar carrito
          clearCart();
          
          toast.success('¡Compra realizada con éxito!');
          
          // Redireccionar a la página de agradecimiento
          router.push(`/tankyou?orderID=${pedidoId}&total=${totalWithShipping}&email=${formData.email}&items=${itemsParam}&date=${new Date().toISOString()}`);
        }else {
          // Para transferencia, mostrar los datos bancarios
          setOrderID(pedidoId);
          setCurrentStep(2);
        }
        
      } catch (error) {
        console.error('Error al crear pedido:', error);
        toast.error(`Error: ${error.message || 'No se pudo crear el pedido'}`, {
          position: 'bottom-right',
          duration: 4000
        });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 2) {
      // En el paso 2, procesamos el comprobante de pago
      completeOrder();
    }
  };
  // Generar código QR
  const generateQRCode = (pedidoId) => {
    // Usar el ID del pedido real que recibimos del backend
    setOrderID(pedidoId);
    
    // Generar QR con los datos del pedido
    const qrData = `https://ecommercecelmx.com/pago/${pedidoId}?amount=${totalWithShipping.toFixed(2)}&concept=Compra en ECommerce Cel`;
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
  const completeOrder = async () => {
    try {
      // Verificar que existe un comprobante para transferencia o para QR
      if (!comprobante && (formData.paymentMethod === 'transferencia' || formData.paymentMethod === 'qr')) {
        setComprobanteError('Por favor, suba un comprobante de pago');
        return;
      }
        // Enviar el comprobante al servidor
      if (comprobante && (formData.paymentMethod === 'transferencia' || formData.paymentMethod === 'qr')) {
        // Crear un FormData para enviar el archivo
        const formDataToSend = new FormData();
        formDataToSend.append('comprobante', comprobante);
        
        try {          
          // Obtener la URL base desde las variables de entorno o usar el valor predeterminado
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          
          console.log(`Subiendo comprobante para el pedido ${orderID}:`, comprobante.name);
          console.log(`URL de destino: ${API_URL}/pedidos/${orderID}/comprobante`);
          
          // Mostrar notificación de carga
          toast.loading('Subiendo comprobante...', {
            position: 'bottom-right',
            id: 'uploading-toast'
          });
          
          // Usar la nueva ruta de pedidos para subir el comprobante con manejo de errores mejorado
          const response = await fetch(`${API_URL}/pedidos/${orderID}/comprobante`, {
            method: 'POST',
            body: formDataToSend,
            // No incluir Content-Type para que el navegador establezca el límite correcto para FormData
          }).catch(error => {
            console.error('Error de red al subir comprobante:', error);
            throw new Error('Error de conexión al servidor. Verifica tu conexión a internet.');
          });
          
          // Cerrar notificación de carga
          toast.dismiss('uploading-toast');
          
          let data;          try {
            data = await response.json();
          } catch (parseError) {
            console.error('Error al parsear la respuesta JSON:', parseError);
            throw new Error('Error al procesar la respuesta del servidor. El servidor puede estar caído.');
          }
          
          if (!response.ok) {
            console.error('Error en la respuesta del servidor:', data);
            throw new Error(data.message || data.error || 'Error al subir el comprobante');
          }
          
          console.log('Comprobante subido con éxito:', data);
          
          // Mostrar notificación de éxito
          toast.success('Comprobante subido correctamente', {
            position: 'bottom-right',
            duration: 4000
          });
        } catch (error) {
          console.error('Error al subir el comprobante:', error);
          
          // Mostrar notificación de error
          toast.error(`Error: ${error.message || 'No se pudo subir el comprobante'}`, {
            position: 'bottom-right',
            duration: 4000
          });
          
          if (!process.env.NEXT_PUBLIC_DEMO_MODE) {
            // En una aplicación real, detenemos el proceso aquí si hay un error
            return;
          }
          // En modo demo continuamos para mostrar el flujo completo
        }
      }      // Detener cuenta regresiva
      clearInterval(countdownIntervalRef.current);
      
      // Guardar el total final para la página de confirmación
      setFinalTotal(totalWithShipping);
      
      // Preparar datos para pasar a la página de agradecimiento
      const itemsParam = encodeURIComponent(JSON.stringify(cartItems));
      
      // Limpiar carrito
      clearCart();
      
      // Mostrar notificación de éxito
      toast.success('¡Compra realizada con éxito!', {
        position: 'bottom-right',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#ffffff'
        }
      });
      
      // Redireccionar a la página de agradecimiento
      router.push(`/tankyou?orderID=${orderID}&total=${totalWithShipping}&email=${formData.email}&items=${itemsParam}&date=${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      
      toast.error('Error al procesar el pago. Inténtalo de nuevo.', {
        position: 'bottom-right',
        duration: 4000
      });
    }
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
                      className={`w-full text-black px-3 py-2 border ${formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
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
                      className={`w-full text-black px-3 py-2 border ${formErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
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
                      className={`w-full text-black px-3 py-2 border ${formErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
                      placeholder="8 dígitos"
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
                      className={`w-full text-black px-3 py-2 border ${formErrors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
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
                      className={`w-full text-black px-3 py-2 border ${formErrors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
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
                      className={`w-full text-black px-3 py-2 border ${formErrors.zipCode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-md focus:outline-none focus:ring-2`}
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
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Oruro">Oruro</option>
                      <option value="Potosi">Potosí</option>
                      <option value="Chuquisaca">Chuquisaca</option>
                      <option value="Tarija">Tarija</option>
                      <option value="Pando">Pando</option>
                      <option value="Beni">Beni</option>
                      
                    </select>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Método de pago</h3>                    <div className="space-y-4">
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
                      
                      <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            id="transferencia"
                            value="transferencia"
                            checked={formData.paymentMethod === 'transferencia'}
                            onChange={handleFormChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label htmlFor="transferencia" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                            Transferencia bancaria
                          </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 ml-7">
                          Realiza una transferencia desde tu banca en línea y sube tu comprobante de pago
                        </p>
                      </div>
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
                    <dd className="text-green-600 font-medium">
                      Gratis
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
        )}        {/* Paso 2: Pago */}
        {currentStep === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                {formData.paymentMethod === 'qr' ? 'Escanea para pagar' : 'Realiza tu transferencia'}
              </h2>
              
              {formData.paymentMethod === 'qr' && (
                <>
                  <p className="text-gray-600 mb-6 text-center">
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
                </>
              )}
              
              {formData.paymentMethod === 'transferencia' && (
                <div className="mb-6">
                  <p className="text-gray-600 mb-4 text-center">
                    Realiza una transferencia a la siguiente cuenta bancaria:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm mb-2"><span className="font-semibold">Banco:</span> BBVA</p>
                    <p className="text-sm mb-2"><span className="font-semibold">Titular:</span> Ecommerce Cel SA de CV</p>
                    <p className="text-sm mb-2"><span className="font-semibold">CLABE:</span> 0123 4567 8901 2345 67</p>
                    <p className="text-sm mb-2"><span className="font-semibold">Cuenta:</span> 01234567890</p>
                    <p className="text-sm"><span className="font-semibold">Concepto:</span> Pedido #{orderID}</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sube tu comprobante de pago
                    </label>
                    <FileUpload
                      onChange={(files) => {
                        if (files && files.length > 0) {
                          setComprobante(files[0]);
                          setComprobanteError('');
                        }
                      }}
                      maxFiles={1}
                      maxSizeMB={5}
                      allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                      multiple={false}
                      showPreviews={true}
                    />
                    {comprobanteError && (
                      <p className="mt-1 text-sm text-red-600">{comprobanteError}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <p className="text-gray-600 mb-1 text-center">Orden #: <span className="font-semibold">{orderID}</span></p>
                <p className="text-gray-600 mb-1 text-center">Total a pagar: <span className="font-semibold">{formatPrice(totalWithShipping)}</span></p>
                <p className="text-gray-600 text-center">Tiempo restante: <span className={`font-semibold ${countdown < 60 ? 'text-red-500' : ''}`}>{formatCountdown()}</span></p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <span className="font-semibold">Importante:</span> Este pago expirará en 15 minutos. Para esta demo, puedes simular que ya completaste el pago.
                </p>
              </div>
              
        {!comprobante ? (
                <button
                  onClick={() => document.getElementById('comprobante-qr').click()}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Subir comprobante de pago
                </button>
              ) : (
                <button
                  onClick={completeOrder}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Confirmar pago y finalizar
                </button>
              )}
              
              <input
                id="comprobante-qr"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setComprobante(e.target.files[0]);
                    setComprobanteError('');
                  }
                }}
              />
              
              {comprobante && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">
                        Comprobante cargado: {comprobante.name}
                      </p>
                    </div>
                    <button 
                      type="button"
                      className="ml-auto text-sm text-red-600 hover:text-red-800"
                      onClick={() => setComprobante(null)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
                {comprobanteError && (
                <p className="mt-2 text-sm text-red-600">{comprobanteError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}