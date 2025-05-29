'use client';

import { useState, useEffect } from 'react';
import { getClientes, deleteCliente, searchClientes } from '../../../services/clientesService';
import { toast } from 'react-hot-toast';

export default function ClientesPage() {
  // Estados principales
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para filtrado y paginación
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  // Cargar clientes
  useEffect(() => {
    const cargarClientes = async () => {
      setCargando(true);
      setError(null);
      
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError(err.message || 'Error al cargar los clientes');
        toast.error('No se pudieron cargar los clientes');
      } finally {
        setCargando(false);
      }
    };

    cargarClientes();
  }, [refreshKey]);

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    return cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           cliente.email.toLowerCase().includes(busqueda.toLowerCase());
  });

  // Ordenar clientes
  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case 'nombre_asc':
        return a.nombre.localeCompare(b.nombre);
      case 'nombre_desc':
        return b.nombre.localeCompare(a.nombre);
      case 'email_asc':
        return a.email.localeCompare(b.email);
      case 'email_desc':
        return b.email.localeCompare(a.email);
      case 'fecha_asc':
        return new Date(a.creado_en) - new Date(b.creado_en);
      case 'fecha_desc':
      default:
        return new Date(b.creado_en) - new Date(a.creado_en);
    }
  });

  // Paginar clientes
  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const indiceFinal = indiceInicial + itemsPorPagina;
  const clientesPaginados = clientesOrdenados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(clientesOrdenados.length / itemsPorPagina);

  // Funciones para modales
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (cliente) => {
    setClienteActual(cliente);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const abrirModalEliminar = (cliente) => {
    setClienteActual(cliente);
    setModalEliminar(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalEliminar(false);
    setClienteActual(null);
  };

  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Crear, editar y eliminar clientes
  const crearCliente = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear cliente');
      }
      
      const data = await response.json();
      setClientes([data.cliente, ...clientes]);
      toast.success('Cliente creado correctamente');
      cerrarModal();
    } catch (err) {
      console.error('Error al crear cliente:', err);
      toast.error(err.message || 'Error al crear el cliente');
    }
  };

  const actualizarCliente = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/clientes/${clienteActual.id_cliente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar cliente');
      }
      
      const data = await response.json();
      setClientes(
        clientes.map((c) => (c.id_cliente === clienteActual.id_cliente ? data.cliente : c))
      );
      toast.success('Cliente actualizado correctamente');
      cerrarModal();
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
      toast.error(err.message || 'Error al actualizar el cliente');
    }
  };

  const eliminarClienteHandler = async () => {
    try {
      await deleteCliente(clienteActual.id_cliente);
      setClientes(clientes.filter((c) => c.id_cliente !== clienteActual.id_cliente));
      toast.success('Cliente eliminado correctamente');
      cerrarModal();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      toast.error(err.message || 'Error al eliminar el cliente');
    }
  };

  // Handler para determinar si se está creando o actualizando un cliente
  const handleSubmit = modoEdicion ? actualizarCliente : crearCliente;

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de añadir */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-900">Gestión de Clientes</h1>
        <button 
          onClick={abrirModalCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md shadow transition-colors font-medium">
          + Añadir Cliente
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="p-5 bg-white rounded-lg shadow-md border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar clientes por nombre o email..."
              className="w-full px-4 py-2.5 text-black border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 placeholder-indigo-300"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2.5 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-700 bg-indigo-50 font-medium"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="fecha_desc">Más recientes primero</option>
              <option value="fecha_asc">Más antiguos primero</option>
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="nombre_desc">Nombre (Z-A)</option>
              <option value="email_asc">Email (A-Z)</option>
              <option value="email_desc">Email (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estado de carga y errores */}
      {cargando && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-3 text-indigo-800 font-medium">Cargando clientes...</p>
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

      {/* Tabla de clientes */}
      {!cargando && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-indigo-100">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-3 text-indigo-500 font-medium">No se encontraron clientes</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-indigo-50"><tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Fecha de Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Acciones</th>
              </tr></thead><tbody className="bg-white divide-y divide-indigo-100">
                {clientesPaginados.map((cliente, index) => (
                  <tr key={cliente.id_cliente} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'}`}>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-indigo-900">{cliente.nombre}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-700">{cliente.email}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-700">{cliente.telefono || "—"}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-700">{formatDate(cliente.creado_en)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => abrirModalEditar(cliente)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(cliente)}
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
          {clientesFiltrados.length > 0 && (
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
                      {Math.min(indiceFinal, clientesOrdenados.length)}
                    </span>{' '}
                    de <span className="font-medium">{clientesOrdenados.length}</span> resultados
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

      {/* Modal para crear/editar cliente */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-indigo-900">
                  {modoEdicion ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre*
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección*
                    </label>
                    <textarea
                      name="direccion"
                      required
                      value={formData.direccion}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {modoEdicion ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar cliente */}
      {modalEliminar && clienteActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-600">Eliminar Cliente</h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-700">
                  ¿Estás seguro de que deseas eliminar al cliente <strong>{clienteActual.nombre}</strong>?
                </p>
                <p className="mt-2 text-sm text-red-600">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={eliminarClienteHandler}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}