'use client';

import { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  getPaginationRowModel
} from '@tanstack/react-table';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Componente de tabla de datos reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos a mostrar en la tabla
 * @param {Array} props.columns - Configuración de columnas
 * @param {Object} props.pagination - Configuración de paginación
 * @returns {JSX.Element} - Componente DataTable
 */
export function DataTable({ data = [], columns = [], pagination = {} }) {
  // Configuración de la tabla con tanstack/react-table
  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: pagination?.pageIndex || 0,
        pageSize: 10,
      },
    },
    manualPagination: true,
    pageCount: pagination?.pageCount || 1,
    onPaginationChange: pagination?.onPageChange ? 
      (updater) => {
        const newPageIndex = typeof updater === 'function' 
          ? updater({ pageIndex: pagination.pageIndex, pageSize: 10 }).pageIndex 
          : updater.pageIndex;
        pagination.onPageChange(newPageIndex);
      } : 
      undefined,
  });

  return (
    <div className="w-full">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="py-3 flex items-center justify-between border-t">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(Math.max(0, pagination.pageIndex - 1))}
              disabled={pagination.pageIndex === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.pageCount - 1, pagination.pageIndex + 1))}
              disabled={pagination.pageIndex === pagination.pageCount - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {pagination.pageIndex * 10 + 1}
                </span>{' '}
                a{' '}                <span className="font-medium">
                  {Math.min((pagination.pageIndex + 1) * 10, pagination.total || (Array.isArray(data) ? data.length : 0))}
                </span>{' '}
                de{' '}
                <span className="font-medium">{pagination.total || (Array.isArray(data) ? data.length : 0)}</span>{' '}
                resultados
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => pagination.onPageChange(Math.max(0, pagination.pageIndex - 1))}
                  disabled={pagination.pageIndex === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <FaChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: pagination.pageCount }, (_, i) => i).map(pageNum => {
                  // Mostrar máximo 5 números de página
                  if (
                    pageNum === 0 || 
                    pageNum === pagination.pageCount - 1 || 
                    (pageNum >= pagination.pageIndex - 1 && pageNum <= pagination.pageIndex + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => pagination.onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.pageIndex === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  }
                  
                  // Mostrar puntos suspensivos
                  if (
                    (pageNum === 1 && pagination.pageIndex > 2) ||
                    (pageNum === pagination.pageCount - 2 && pagination.pageIndex < pagination.pageCount - 3)
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => pagination.onPageChange(Math.min(pagination.pageCount - 1, pagination.pageIndex + 1))}
                  disabled={pagination.pageIndex === pagination.pageCount - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <FaChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
