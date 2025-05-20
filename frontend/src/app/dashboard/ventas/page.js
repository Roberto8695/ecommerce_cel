'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../../../components/DataTable/index';
import { estadoPedidoClases, formatoMoneda, formatoFecha } from '../../../utils/formato';
import { FaSearch, FaFilter, FaFileInvoiceDollar, FaEye, FaChartBar, FaBox } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function VentasPage() {
  // Estados
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalMonto: 0,
    estadosPedidos: [],
    ventasDiarias: [],
    productosTop: []
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    busqueda: ''
  });

  const [modalDetalle, setModalDetalle] = useState({
    isOpen: false,
    pedido: null
  });

  const [modalComprobante, setModalComprobante] = useState({
    isOpen: false,
    urlComprobante: ''
  });  // Cargar estadísticas (memoizado para evitar recreación en cada render)
  const cargarEstadisticas = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
        // Petición sin token para pruebas
        const response = await fetch(`/api/ventas/admin/estadisticas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setEstadisticas(data.data);
      } else {
        console.error('Formato de respuesta de estadísticas incorrecto:', data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);
    // Cargar datos
  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de consulta
        const params = new URLSearchParams({
          page: currentPage,
          limit: 10
        });
        
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
        if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
        
        console.log('Cargando pedidos con parámetros:', params.toString());
        
        // Petición sin token para pruebas
        const response = await fetch(`/api/ventas/admin/pedidos?${params.toString()}`);
          if (!response.ok) {
          throw new Error('Error al cargar pedidos');
        }
          const data = await response.json();
        console.log('Respuesta de pedidos:', data);
        
        // Verificar la estructura de la respuesta
        if (data.success) {
          // Depuración adicional para ver la estructura exacta
          console.log('Estructura de datos recibidos:', {
            tieneData: !!data.data,
            esArray: Array.isArray(data.data),
            longitud: data.data ? (Array.isArray(data.data) ? data.data.length : 'no es array') : 'sin datos',
            tienePagination: !!data.pagination,
            paginationInfo: data.pagination
          });
          
          // Analizar respuesta y normalizar estructura
          if (data.data) {
            // Si data es un array, usarlo directamente
            if (Array.isArray(data.data)) {
              setPedidos(data.data);
              // Si hay información de paginación, usarla
              if (data.pagination) {
                setTotalPages(data.pagination.pages || Math.ceil(data.pagination.total / 10));
              } else {
                setTotalPages(Math.ceil(data.data.length / 10));
              }
              console.log('Pedidos cargados (array):', data.data.length);
            } 
            // Si data no es un array pero es un objeto con datos
            else if (typeof data.data === 'object') {
              // Para el caso donde el backend devuelve {data: {data: [...], pagination: {...}}}
              if (data.data.data) {
                setPedidos(data.data.data);
                setTotalPages(data.data.pagination?.pages || Math.ceil((data.data.data.length || 0) / 10));
                console.log('Pedidos cargados (estructura anidada):', data.data.data.length);
              } 
              // Para otros casos, intentar usar data.data directamente
              else {
                setPedidos([data.data]); // Convertir a array si es un solo objeto
                setTotalPages(1);
                console.log('Pedido único cargado como array');
              }
            } else {
              console.error('Estructura de datos desconocida:', data);
              setPedidos([]);
              setTotalPages(0);
            }
          } else {
            throw new Error(data.message || 'Error al cargar pedidos');
          }
        }
        
        // Cargar estadísticas
        await cargarEstadisticas();
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    cargarPedidos();
  }, [currentPage, filtros.estado, filtros.fechaInicio, filtros.fechaFin, cargarEstadisticas]);// Cargar detalles de un pedido
  const verDetallePedido = async (id) => {
    try {
      setLoading(true);
        // Petición sin token para pruebas
        const response = await fetch(`/api/ventas/admin/pedidos/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar detalles del pedido');
      }
      
      const data = await response.json();
      
      // Asegurarse de que todos los campos necesarios estén presentes
      let pedidoData = data.success ? data.data : null;
      
      if (!pedidoData) {
        throw new Error('No se pudieron obtener los detalles del pedido');
      }
      
      // Asegurar que el array de productos esté presente
      if (!pedidoData.productos) {
        pedidoData.productos = [];
      }
      
      // Añadir URL completa para comprobantes
      if (pedidoData.url_comprobante && !pedidoData.url_comprobante_completa) {
        pedidoData.url_comprobante_completa = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${pedidoData.url_comprobante}`;
      }
      
      setModalDetalle({
        isOpen: true,
        pedido: pedidoData
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };// Cambiar estado de pedido
  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      setLoading(true);
        // Petición sin token para pruebas
        const response = await fetch(`/api/ventas/admin/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado del pedido');
      }
      
      const data = await response.json();
      
      // Actualizar pedido en la lista
      setPedidos(prevPedidos => 
        prevPedidos.map(pedido => 
          pedido.id_pedido === id 
            ? { ...pedido, estado: nuevoEstado } 
            : pedido
        )
      );
      
      // Si el modal está abierto, actualizar el pedido en el modal también
      if (modalDetalle.isOpen && modalDetalle.pedido?.id_pedido === id) {
        setModalDetalle(prev => ({
          ...prev,
          pedido: {
            ...prev.pedido,
            estado: nuevoEstado
          }
        }));
      }
      
      // Recargar estadísticas
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ver comprobante
  const verComprobante = (url) => {
    setModalComprobante({
      isOpen: true,
      urlComprobante: url
    });
  };

  // Aplicar filtros
  const aplicarFiltros = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reiniciar a la primera página
  };

  // Handle cambio de filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Columnas de la tabla de pedidos
  const columnas = [
    {
      header: 'ID',
      accessorKey: 'id_pedido',
      cell: (info) => <span className="font-medium">#{info.getValue()}</span>
    },
    {
      header: 'Cliente',
      accessorKey: 'nombre_cliente',
      cell: (info) => (
        <div className="flex flex-col">
          <span>{info.getValue()}</span>
          <span className="text-xs text-gray-500">{info.row.original.email_cliente}</span>
        </div>
      )
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha_pedido',
      cell: (info) => formatoFecha(info.getValue())
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (info) => formatoMoneda(info.getValue())
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      cell: (info) => {
        const estado = info.getValue();
        const clases = estadoPedidoClases(estado);
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${clases}`}>
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </span>
        );
      }
    },
    {
      header: 'Comprobante',
      accessorKey: 'url_comprobante',
      cell: (info) => {
        const urlComprobante = info.getValue();
        
        return urlComprobante ? (
          <button 
            onClick={() => verComprobante(info.row.original.url_comprobante_completa)} 
            className="text-blue-600 hover:text-blue-800"
          >
            <FaFileInvoiceDollar className="text-lg" />
          </button>
        ) : (
          <span className="text-gray-400 text-xs">No disponible</span>
        );
      }
    },
    {
      header: 'Acciones',
      cell: (info) => {
        const pedido = info.row.original;
        
        return (
          <div className="flex space-x-2">
            <button 
              onClick={() => verDetallePedido(pedido.id_pedido)}
              className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Ver detalles"
            >
              <FaEye />
            </button>
            
            <select 
              value={pedido.estado}
              onChange={(e) => cambiarEstadoPedido(pedido.id_pedido, e.target.value)}
              className="text-sm border border-gray-300 rounded p-1"
            >
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        );
      }
    }
  ];

  // Si está cargando
  if (loading && !pedidos.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Ventas</h1>
      
      {/* Dashboard de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaChartBar className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Ventas Totales</p>
            <p className="text-2xl font-bold">{estadisticas.totalVentas || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <FaFileInvoiceDollar className="text-green-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold">{formatoMoneda(estadisticas.totalMonto || 0)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <FaBox className="text-yellow-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Pedidos Pendientes</p>
            <p className="text-2xl font-bold">
              {estadisticas.estadosPedidos?.find(e => e.estado === 'pendiente')?.total || 0}
            </p>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <form onSubmit={aplicarFiltros} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full flex items-center justify-center"
            >
              <FaFilter className="mr-2" />
              Filtrar
            </button>
          </div>
        </form>
      </div>
      
      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <h2 className="text-lg font-semibold p-4 border-b">Listado de Pedidos</h2>
        
        {error ? (
          <div className="p-4 bg-red-50 text-red-600">{error}</div>
        ) : pedidos.length === 0 ? (
          <div className="p-4 text-gray-500">No se encontraron pedidos</div>
        ) : (
          <DataTable
            columns={columnas}
            data={pedidos}
            pagination={{
              pageIndex: currentPage - 1,
              pageCount: totalPages,
              onPageChange: (pageIndex) => setCurrentPage(pageIndex + 1),
            }}
          />
        )}
      </div>
      
      {/* Modal detalle de pedido */}
      {modalDetalle.isOpen && modalDetalle.pedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Detalle del Pedido #{modalDetalle.pedido.id_pedido}
              </h3>
              <button
                onClick={() => setModalDetalle({ isOpen: false, pedido: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                  <p><span className="text-gray-600">Nombre:</span> {modalDetalle.pedido.nombre_cliente}</p>
                  <p><span className="text-gray-600">Email:</span> {modalDetalle.pedido.email_cliente}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Pedido</h4>
                  <p><span className="text-gray-600">Fecha:</span> {formatoFecha(modalDetalle.pedido.fecha_pedido)}</p>
                  <p>
                    <span className="text-gray-600">Estado:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${estadoPedidoClases(modalDetalle.pedido.estado)}`}>
                      {modalDetalle.pedido.estado.charAt(0).toUpperCase() + modalDetalle.pedido.estado.slice(1)}
                    </span>
                  </p>
                  <p><span className="text-gray-600">Total:</span> {formatoMoneda(modalDetalle.pedido.total)}</p>
                </div>
              </div>
              
              {/* Tabla de productos */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Productos</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalDetalle.pedido.productos.map(producto => (
                        <tr key={producto.id_detalle}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">                              {(
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <Image
                                    src={producto.imagen_principal ? 
                                      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${producto.imagen_principal}` : 
                                      '/img/placeholder-product.png'
                                    }
                                    alt={producto.modelo || 'Producto'}
                                    width={40}
                                    height={40}
                                    className="object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = '/img/placeholder-product.png';
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{producto.modelo}</p>
                                <p className="text-gray-500 text-sm truncate">{producto.descripcion}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{producto.cantidad}</td>
                          <td className="px-4 py-3">{formatoMoneda(producto.precio_unitario)}</td>
                          <td className="px-4 py-3">{formatoMoneda(producto.cantidad * producto.precio_unitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Comprobante */}
              {modalDetalle.pedido.url_comprobante && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Comprobante de Pago</h4>
                  <div className="border rounded-lg p-2">
                    <button
                      onClick={() => verComprobante(modalDetalle.pedido.url_comprobante_completa)}
                      className="bg-blue-50 text-blue-600 p-2 rounded hover:bg-blue-100 flex items-center"
                    >
                      <FaFileInvoiceDollar className="mr-2" />
                      Ver Comprobante
                    </button>
                  </div>
                </div>
              )}
              
              {/* Acciones */}
              <div className="border-t pt-4 flex justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cambiar Estado:
                  </label>
                  <select 
                    value={modalDetalle.pedido.estado}
                    onChange={(e) => cambiarEstadoPedido(modalDetalle.pedido.id_pedido, e.target.value)}
                    className="border border-gray-300 rounded p-2"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="procesando">Procesando</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setModalDetalle({ isOpen: false, pedido: null })}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de comprobante */}
      {modalComprobante.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Comprobante de Pago</h3>
              <button
                onClick={() => setModalComprobante({ isOpen: false, urlComprobante: '' })}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
              <div className="p-6 flex justify-center">
              {modalComprobante.urlComprobante && (
                <div className="max-w-full max-h-[70vh] overflow-auto">
                  <Image
                    src={modalComprobante.urlComprobante}
                    alt="Comprobante de pago"
                    width={600}
                    height={800}
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      console.error('Error al cargar la imagen del comprobante');
                      e.target.src = '/img/placeholder-product.png'; // Imagen de respaldo
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <a
                href={modalComprobante.urlComprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                Ver Original
              </a>
              <button
                onClick={() => setModalComprobante({ isOpen: false, urlComprobante: '' })}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}