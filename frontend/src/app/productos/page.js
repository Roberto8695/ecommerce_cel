'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductos } from '../../services/productosService';
import { getMarcas } from '../../services/marcasService';

export default function CatalogoProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtrado y paginación
  const [busqueda, setBusqueda] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 12;

  // Cargar productos y marcas
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError(null);
      
      try {
        // Cargar productos
        const productosData = await getProductos();
        setProductos(productosData);
        
        // Cargar marcas
        const marcasData = await getMarcas();
        setMarcas(marcasData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);
  // Navegar a la página de detalle del producto
  const irADetalleProducto = (id) => {
    router.push(`/archiveproduct?id=${id}`);
  };

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    // Filtro por búsqueda
    const coincideBusqueda = producto.modelo.toLowerCase().includes(busqueda.toLowerCase()) || 
                           (producto.marca && producto.marca.toLowerCase().includes(busqueda.toLowerCase()));
    
    // Filtro por marca
    const coincideMarca = filtroMarca ? producto.id_marca.toString() === filtroMarca : true;
    
    // Filtro por precio
    const coincidePrecioMin = precioMin ? producto.precio >= parseFloat(precioMin) : true;
    const coincidePrecioMax = precioMax ? producto.precio <= parseFloat(precioMax) : true;
    
    return coincideBusqueda && coincideMarca && coincidePrecioMin && coincidePrecioMax;
  });

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case 'precio_asc':
        return a.precio - b.precio;
      case 'precio_desc':
        return b.precio - a.precio;
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

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroMarca, precioMin, precioMax, ordenarPor]);

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroMarca('');
    setPrecioMin('');
    setPrecioMax('');
    setOrdenarPor('fecha_desc');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de Productos</h1>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por modelo o marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((marca) => (
                <option key={marca.id_marca} value={marca.id_marca}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fecha_desc">Más recientes</option>
              <option value="fecha_asc">Más antiguos</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre_asc">Nombre: A-Z</option>
              <option value="nombre_desc">Nombre: Z-A</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio mínimo</label>
            <input
              type="number"
              placeholder="Mín."
              min="0"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
            <input
              type="number"
              placeholder="Máx."
              min="0"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={limpiarFiltros}
              className="ml-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Mensaje de carga o error */}
      {cargando && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Grid de productos */}
      {!cargando && !error && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              {productosOrdenados.length} productos encontrados
            </p>
          </div>

          {productosOrdenados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productosPaginados.map((producto) => (
                <div 
                  key={producto.id_producto} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => irADetalleProducto(producto.id_producto)}
                >
                  <div className="relative h-48 bg-gray-100">
                    {producto.imagen_principal ? (
                      <Image
                        src={producto.imagen_principal}
                        alt={producto.modelo}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-1">
                      <span className="text-xs font-medium text-blue-600">
                        {producto.marca}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {producto.modelo}
                    </h2>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-gray-900">
                        ${(parseFloat(producto.precio) || 0).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        producto.stock > 10 ? 'bg-green-100 text-green-800' : 
                        producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {producto.stock > 10 ? 'En stock' : 
                        producto.stock > 0 ? `${producto.stock} unidades` : 
                        'Agotado'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg py-12 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron productos</h3>
              <p className="text-gray-500">Prueba con otros filtros o consulta más tarde</p>
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPaginaActual(paginaActual > 1 ? paginaActual - 1 : 1)}
                  disabled={paginaActual === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                    paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  <span className="sr-only">Anterior</span>
                  &laquo;
                </button>
                {[...Array(totalPaginas).keys()].map((pagina) => (
                  <button
                    key={pagina + 1}
                    onClick={() => setPaginaActual(pagina + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      paginaActual === pagina + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pagina + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPaginaActual(paginaActual < totalPaginas ? paginaActual + 1 : totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                    paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  <span className="sr-only">Siguiente</span>
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 