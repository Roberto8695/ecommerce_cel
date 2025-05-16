'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ModalProducto, ModalEliminar } from './modales';
import { 
  getProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from '../../../services/productosService';
import { getMarcas } from '../../../services/marcasService';
// Importamos servicios alternativos como respaldo
import { productosService, marcasService } from '../../services/api';

export default function ProductosPage() {
  // Estados principales  
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Agregamos una clave de actualización

  // Estados para filtrado y paginación
  const [busqueda, setBusqueda] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para formulario
  const [formData, setFormData] = useState({
    id_marca: '',
    modelo: '',
    precio: '',
    stock: '',
    descripcion: '',
    imagenes: []
  });  // Cargar productos y marcas  
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError(null);
      
      try {
        // Cargar productos con estrategia de respaldo
        let productosData;
        try {
          // Intentar primero con el servicio principal
          productosData = await getProductos();
          console.log("Productos cargados con servicio principal:", productosData);
        } catch (primaryError) {
          console.error("Error con servicio principal de productos:", primaryError);
          // Si falla, usar el servicio alternativo
          productosData = await productosService.getAll();
          console.log("Productos cargados con servicio alternativo:", productosData);
        }
        setProductos(productosData);
        
        // Cargar marcas con estrategia de respaldo
        let marcasData;
        try {
          // Intentar primero con el servicio principal
          marcasData = await getMarcas();
          console.log("Marcas cargadas con servicio principal:", marcasData);
        } catch (primaryError) {
          console.error("Error con servicio principal de marcas:", primaryError);
          // Si falla, usar el servicio alternativo
          marcasData = await marcasService.getAll();
          console.log("Marcas cargadas con servicio alternativo:", marcasData);
        }
        setMarcas(marcasData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setCargando(false);
      }    };

    cargarDatos();
  }, [refreshKey]); // Añadimos refreshKey como dependencia para forzar recarga

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.modelo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideMarca = filtroMarca ? producto.id_marca.toString() === filtroMarca : true;
    return coincideBusqueda && coincideMarca;
  });

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case 'precio_asc':
        return a.precio - b.precio;
      case 'precio_desc':
        return b.precio - a.precio;
      case 'stock_asc':
        return a.stock - b.stock;
      case 'stock_desc':
        return b.stock - a.stock;
      case 'nombre_asc':
        return a.modelo.localeCompare(b.modelo);
      case 'nombre_desc':
        return b.modelo.localeCompare(a.modelo);
      case 'fecha_asc':
        return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
      case 'fecha_desc':
      default:
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
    }
  });

  // Paginar productos
  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const indiceFinal = indiceInicial + itemsPorPagina;
  const productosPaginados = productosOrdenados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(productosOrdenados.length / itemsPorPagina);

  // Funciones para modales
  const abrirModalCrear = () => {
    setFormData({
      id_marca: marcas.length > 0 ? marcas[0].id_marca : '',
      modelo: '',
      precio: '',
      stock: '',
      descripcion: '',
      imagenes: []
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoActual(producto);
    setFormData({
      id_marca: producto.id_marca,
      modelo: producto.modelo,
      precio: producto.precio,
      stock: producto.stock,
      descripcion: producto.descripcion || '',
      imagenes: producto.imagenes || []
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const abrirModalEliminar = (producto) => {
    setProductoActual(producto);
    setModalEliminar(true);
  };  const cerrarModal = async () => {
    setModalAbierto(false);
    setModalEliminar(false);
    
    // Recargar productos para asegurarnos de tener las imágenes actualizadas
    try {
      // Incrementar la clave de actualización para forzar la recarga
      setRefreshKey(prevKey => prevKey + 1);
      
      // Importar la función de recarga dinámicamente
      const { recargarProductos } = await import('./reload-helper');
      
      // Obtener productos actualizados
      const productosData = await recargarProductos();
      setProductos(productosData);
      
      console.log("Productos recargados después de cerrar el modal:", productosData);
    } catch (err) {
      console.error('Error al recargar productos:', err);
    } finally {
      // Siempre limpiar el producto actual al final para evitar problemas
      setProductoActual(null);
    }
  };
  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'precio' ? parseFloat(value) || 0 : 
              name === 'stock' ? parseInt(value) || 0 : 
              value
    });
  };
  // Crear, editar y eliminar productos usando los servicios API con estrategia de respaldo
  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      let nuevoProducto;
      
      try {
        // Intentar primero con el servicio principal
        nuevoProducto = await createProducto(formData);
        console.log("Producto creado con servicio principal:", nuevoProducto);
      } catch (primaryError) {
        console.error("Error con servicio principal al crear:", primaryError);
        // Si falla, usar el servicio alternativo
        nuevoProducto = await productosService.create(formData);
        console.log("Producto creado con servicio alternativo:", nuevoProducto);
      }
      
      setProductos([nuevoProducto, ...productos]);
      cerrarModal();
      return nuevoProducto; // Retornar el producto para uso en subir imágenes
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError(err.message || 'Error al crear el producto');
      throw err;
    }
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();
    try {
      let productoActualizado;
      
      try {
        // Intentar primero con el servicio principal
        productoActualizado = await updateProducto(productoActual.id_producto, formData);
        console.log("Producto actualizado con servicio principal:", productoActualizado);
      } catch (primaryError) {
        console.error("Error con servicio principal al actualizar:", primaryError);
        // Si falla, usar el servicio alternativo
        productoActualizado = await productosService.update(productoActual.id_producto, formData);
        console.log("Producto actualizado con servicio alternativo:", productoActualizado);
      }
      
      setProductos(
        productos.map((p) => (p.id_producto === productoActual.id_producto ? productoActualizado : p))
      );
      cerrarModal();
      return productoActualizado; // Retornar el producto para uso en subir imágenes
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setError(err.message || 'Error al actualizar el producto');
      throw err;
    }
  };

  const eliminarProducto = async () => {
    try {
      try {
        // Intentar primero con el servicio principal
        await deleteProducto(productoActual.id_producto);
        console.log("Producto eliminado con servicio principal");
      } catch (primaryError) {
        console.error("Error con servicio principal al eliminar:", primaryError);
        // Si falla, usar el servicio alternativo
        await productosService.delete(productoActual.id_producto);
        console.log("Producto eliminado con servicio alternativo");
      }
      
      setProductos(productos.filter((p) => p.id_producto !== productoActual.id_producto));
      cerrarModal();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err.message || 'Error al eliminar el producto');
    }
  };

  // Handler para determinar si se está creando o actualizando un producto
  const handleSubmit = modoEdicion ? actualizarProducto : crearProducto;

  return (
    <div className="space-y-6">      {/* Cabecera y botón de añadir */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-900">Gestión de Productos</h1>
        <button 
          onClick={abrirModalCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md shadow transition-colors font-medium">
          + Añadir Producto
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="p-5 bg-white rounded-lg shadow-md border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full px-4 py-2.5 text-black border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 placeholder-indigo-300"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2.5 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-700 bg-indigo-50 font-medium"
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
            >
              <option value="">Todas las marcas</option>
              {marcas.map((marca) => (
                <option key={marca.id_marca} value={marca.id_marca}>
                  {marca.nombre}
                </option>
              ))}
            </select>
            <select 
              className="px-4 py-2.5 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-700 bg-indigo-50 font-medium"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="fecha_desc">Más recientes primero</option>
              <option value="fecha_asc">Más antiguos primero</option>
              <option value="precio_asc">Precio (menor a mayor)</option>
              <option value="precio_desc">Precio (mayor a menor)</option>
              <option value="stock_asc">Stock (menor a mayor)</option>
              <option value="stock_desc">Stock (mayor a menor)</option>
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="nombre_desc">Nombre (Z-A)</option>
            </select>
          </div>
        </div>
      </div>      {/* Estado de carga y errores */}
      {cargando && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-3 text-indigo-800 font-medium">Cargando productos...</p>
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-md shadow-md" role="alert">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <strong className="font-bold">Error:</strong>
            <span className="ml-2"> {error}</span>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      {!cargando && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-indigo-100">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="mt-3 text-indigo-500 font-medium">No se encontraron productos en stock</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Imagen</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Marca</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>              <tbody className="bg-white divide-y divide-indigo-100">
                {productosPaginados.map((producto, index) => (
                  <tr key={producto.id_producto} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'}`}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="h-12 w-12 relative rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200 shadow-sm">
                        {producto.imagen_principal ? (
                          <Image
                            src={producto.imagen_principal.startsWith('/api/') || producto.imagen_principal.startsWith('/uploads/') 
                              ? `http://localhost:5000${producto.imagen_principal}`
                              : producto.imagen_principal}
                            alt={producto.modelo}
                            width={48}
                            height={48}
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-indigo-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-indigo-900">{producto.modelo}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-700">{producto.marca}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-900 font-medium">
                      ${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : Number(producto.precio).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        Number(producto.stock) > 20 ? 'bg-green-100 text-green-800' : 
                        Number(producto.stock) > 10 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {typeof producto.stock === 'number' ? producto.stock : Number(producto.stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => abrirModalEditar(producto)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Editar
                        </button>
                        <button 
                          onClick={() => abrirModalEliminar(producto)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {productosFiltrados.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button 
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className={`ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indiceInicial + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(indiceFinal, productosOrdenados.length)}
                    </span>{' '}
                    de <span className="font-medium">{productosOrdenados.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                      disabled={paginaActual === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      Anterior
                    </button>
                    {[...Array(totalPaginas)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPaginaActual(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          paginaActual === i + 1
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                      disabled={paginaActual === totalPaginas}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales importados del componente externo */}
      <ModalProducto 
        modalAbierto={modalAbierto}
        cerrarModal={cerrarModal}
        modoEdicion={modoEdicion}
        formData={formData}
        setFormData={setFormData}
        marcas={marcas}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      <ModalEliminar 
        modalAbierto={modalEliminar}
        cerrarModal={cerrarModal}
        productoActual={productoActual}
        eliminarProducto={eliminarProducto}
      />
    </div>
  );
}