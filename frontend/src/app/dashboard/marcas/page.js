'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ModalMarca, ModalEliminar } from './modales';
import * as marcasService from '@/services/marcasService';
// Importamos la versión alternativa de los servicios como respaldo
import { marcasService as marcasServiceAlt } from '../../services/api';

export default function MarcasPage() {
  // Estados principales
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState(null);

  // Estados para filtrado y paginación
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre_asc');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [marcaActual, setMarcaActual] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    url_logo: ''
  });
  // Cargar marcas
  useEffect(() => {
    const cargarMarcas = async () => {
      setCargando(true);
      setError(null);
      
      try {
        let data;
        
        // Primero intentamos con el servicio directo
        try {
          data = await marcasService.getMarcas();
          console.log("Marcas cargadas con marcasService:", data);
        } catch (primaryError) {
          console.error("Error con servicio primario:", primaryError);
          // Si falla, intentamos con el servicio alternativo
          data = await marcasServiceAlt.getAll();
          console.log("Marcas cargadas con marcasServiceAlt:", data);
        }
        
        setMarcas(data);
      } catch (err) {
        console.error('Error al cargar marcas:', err);
        setError(err.message || "Error al cargar marcas");
      } finally {
        setCargando(false);
      }
    };

    cargarMarcas();
  }, []);

  // Filtrar marcas por nombre
  const marcasFiltradas = marcas.filter((marca) => 
    marca.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ordenar marcas
  const marcasOrdenadas = [...marcasFiltradas].sort((a, b) => {
    switch (ordenarPor) {
      case 'nombre_asc':
        return a.nombre.localeCompare(b.nombre);
      case 'nombre_desc':
        return b.nombre.localeCompare(a.nombre);
      default:
        return a.nombre.localeCompare(b.nombre);
    }
  });

  // Paginar marcas
  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const indiceFinal = indiceInicial + itemsPorPagina;
  const marcasPaginadas = marcasOrdenadas.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(marcasOrdenadas.length / itemsPorPagina);

  // Funciones para modales
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      url_logo: ''
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (marca) => {
    setMarcaActual(marca);
    setFormData({
      nombre: marca.nombre,
      descripcion: marca.descripcion || '',
      url_logo: marca.url_logo || ''
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const abrirModalEliminar = (marca) => {
    setMarcaActual(marca);
    setErrorEliminar(null);
    setModalEliminar(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalEliminar(false);
    setMarcaActual(null);
    setErrorEliminar(null);
  };

  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };  // Crear, editar y eliminar marcas usando los servicios API
  const crearMarca = async (e, formDataWithFile) => {
    e.preventDefault();
    try {
      let nuevaMarca;
      
      // Verificamos si hay un archivo en el FormData
      if (formDataWithFile instanceof FormData) {
        try {
          nuevaMarca = await marcasService.uploadMarcaWithImage(formDataWithFile);
          console.log("Marca creada con archivo usando marcasService:", nuevaMarca);
        } catch (primaryError) {
          console.error("Error con servicio primario para subir imagen:", primaryError);
          // Si falla, intentamos con el servicio alternativo
          nuevaMarca = await marcasServiceAlt.uploadWithImage(formDataWithFile);
          console.log("Marca creada con archivo usando marcasServiceAlt:", nuevaMarca);
        }
      } else {
        // Si no hay archivo, usamos el método original
        try {
          nuevaMarca = await marcasService.createMarca(formData);
          console.log("Marca creada con marcasService:", nuevaMarca);
        } catch (primaryError) {
          console.error("Error con servicio primario:", primaryError);
          // Si falla, intentamos con el servicio alternativo
          nuevaMarca = await marcasServiceAlt.create(formData);
          console.log("Marca creada con marcasServiceAlt:", nuevaMarca);
        }
      }
      
      setMarcas([...marcas, nuevaMarca]);
      cerrarModal();
    } catch (err) {
      console.error('Error al crear marca:', err);
      setError(err.message || "Error al crear marca");
    }
  };
  const actualizarMarca = async (e, formDataWithFile) => {
    e.preventDefault();
    try {
      let marcaActualizada;
      
      // Verificamos si hay un archivo en el FormData
      if (formDataWithFile instanceof FormData) {
        try {
          // Asegurarnos de que el FormData incluye el ID de la marca
          formDataWithFile.append('id_marca', marcaActual.id_marca);
          marcaActualizada = await marcasService.updateMarcaWithImage(marcaActual.id_marca, formDataWithFile);
          console.log("Marca actualizada con archivo usando marcasService:", marcaActualizada);
        } catch (primaryError) {
          console.error("Error con servicio primario para actualizar con imagen:", primaryError);
          // Si falla, intentamos con el servicio alternativo
          marcaActualizada = await marcasServiceAlt.updateWithImage(marcaActual.id_marca, formDataWithFile);
          console.log("Marca actualizada con archivo usando marcasServiceAlt:", marcaActualizada);
        }
      } else {
        // Si no hay archivo, usamos el método original
        try {
          marcaActualizada = await marcasService.updateMarca(marcaActual.id_marca, formData);
          console.log("Marca actualizada con marcasService:", marcaActualizada);
        } catch (primaryError) {
          console.error("Error con servicio primario:", primaryError);
          // Si falla, intentamos con el servicio alternativo
          marcaActualizada = await marcasServiceAlt.update(marcaActual.id_marca, formData);
          console.log("Marca actualizada con marcasServiceAlt:", marcaActualizada);
        }
      }
      
      setMarcas(
        marcas.map((m) => (m.id_marca === marcaActual.id_marca ? marcaActualizada : m))
      );
      cerrarModal();
    } catch (err) {
      console.error('Error al actualizar marca:', err);
      setError(err.message || "Error al actualizar marca");
    }
  };

  const eliminarMarca = async () => {
    try {
      // Primero intentamos con el servicio directo
      try {
        await marcasService.deleteMarca(marcaActual.id_marca);
        console.log("Marca eliminada con marcasService");
      } catch (primaryError) {
        console.error("Error con servicio primario:", primaryError);
        // Si falla, intentamos con el servicio alternativo
        await marcasServiceAlt.delete(marcaActual.id_marca);
        console.log("Marca eliminada con marcasServiceAlt");
      }
      
      setMarcas(marcas.filter((m) => m.id_marca !== marcaActual.id_marca));
      cerrarModal();
    } catch (err) {
      console.error('Error al eliminar marca:', err);
      setErrorEliminar(err.message);
      // No cerramos el modal para mostrar el error
    }
  };

  // Handler para determinar si se está creando o actualizando una marca
  const handleSubmit = modoEdicion ? actualizarMarca : crearMarca;
  return (
    <div className="space-y-6">
      {/* Cabecera y botón de añadir */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-900">Gestión de Marcas</h1>
        <button 
          onClick={abrirModalCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md shadow-md transition-colors font-medium">
          + Añadir Marca
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="p-5 bg-white rounded-lg shadow-md border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar marcas..."
              className="w-full px-4 py-2.5 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 placeholder-indigo-300"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="px-4 py-2.5 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 text-indigo-700 bg-indigo-50 font-medium"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="nombre_desc">Nombre (Z-A)</option>
            </select>
          </div>
        </div>
      </div>      {/* Estado de carga y errores */}
      {cargando && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-3 text-indigo-800 font-medium">Cargando marcas...</p>
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

      {/* Tabla de marcas */}
      {!cargando && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-indigo-100">
          {marcasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 3.5H5.5C4.4 3.5 3.5 4.4 3.5 5.5V9.5C3.5 10.6 4.4 11.5 5.5 11.5H9.5C10.6 11.5 11.5 10.6 11.5 9.5V5.5C11.5 4.4 10.6 3.5 9.5 3.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.5 3.5H14.5C13.4 3.5 12.5 4.4 12.5 5.5V9.5C12.5 10.6 13.4 11.5 14.5 11.5H18.5C19.6 11.5 20.5 10.6 20.5 9.5V5.5C20.5 4.4 19.6 3.5 18.5 3.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 12.5H5.5C4.4 12.5 3.5 13.4 3.5 14.5V18.5C3.5 19.6 4.4 20.5 5.5 20.5H9.5C10.6 20.5 11.5 19.6 11.5 18.5V14.5C11.5 13.4 10.6 12.5 9.5 12.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 12.5V16.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 14.5H12.5" />
              </svg>
              <p className="mt-3 text-indigo-500 font-medium">No se encontraron marcas</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marcasPaginadas.map((marca) => (
                  <tr key={marca.id_marca} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 relative rounded overflow-hidden bg-gray-100">                        {marca.url_logo ? (
                          <div>
                            <Image
                              src={`http://localhost:5000${marca.url_logo}`}
                              alt={marca.nombre}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{marca.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {marca.descripcion ? (
                        <span className="line-clamp-2">{marca.descripcion}</span>
                      ) : (
                        <span className="text-gray-400 italic">Sin descripción</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => abrirModalEditar(marca)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Editar
                        </button>
                        <button 
                          onClick={() => abrirModalEliminar(marca)}
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
          {marcasFiltradas.length > 0 && (
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
                      {Math.min(indiceFinal, marcasOrdenadas.length)}
                    </span>{' '}
                    de <span className="font-medium">{marcasOrdenadas.length}</span> resultados
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
      <ModalMarca 
        modalAbierto={modalAbierto}
        cerrarModal={cerrarModal}
        modoEdicion={modoEdicion}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      <ModalEliminar 
        modalAbierto={modalEliminar}
        cerrarModal={cerrarModal}
        marcaActual={marcaActual}
        eliminarMarca={eliminarMarca}
        error={errorEliminar}
      />
    </div>
  );
}
