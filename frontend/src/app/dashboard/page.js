'use client';

import { useAuth } from '@/lib/AuthContext';

export default function Dashboard() {
  const { admin } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-sm text-gray-500">
          {admin ? `Bienvenido ${admin.nombre}` : 'Bienvenido al sistema de gestión'}
        </p>
      </div>

      {/* Información del usuario */}
      {admin && (
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <span className="text-xl font-bold">{admin.nombre?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-800">{admin.nombre || 'Administrador'}</h2>
              <p className="text-sm text-gray-500">Rol: {admin.rol || 'Admin'}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Activo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sección de tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm font-medium">Ventas totales</h2>
          <p className="text-2xl font-bold text-gray-800">$14,550.75</p>
          <p className="text-xs text-green-500 mt-2">↑ 12% desde el mes pasado</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm font-medium">Clientes</h2>
          <p className="text-2xl font-bold text-gray-800">354</p>
          <p className="text-xs text-green-500 mt-2">↑ 8% desde el mes pasado</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
          <h2 className="text-gray-500 text-sm font-medium">Productos</h2>
          <p className="text-2xl font-bold text-gray-800">128</p>
          <p className="text-xs text-gray-500 mt-2">Activos: 96</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <h2 className="text-gray-500 text-sm font-medium">Órdenes pendientes</h2>
          <p className="text-2xl font-bold text-gray-800">23</p>
          <p className="text-xs text-red-500 mt-2">↑ 5% desde ayer</p>
        </div>
      </div>

      {/* Sección para actividades recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Actividades recientes</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-800">
                  {index === 0 && "Nueva venta completada - Cliente: Maria García"}
                  {index === 1 && "Producto actualizado - iPhone 13 (Stock: 24)"}
                  {index === 2 && "Nuevo cliente registrado - José Lopez"}
                  {index === 3 && "Nueva categoría creada - Accesorios"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {index === 0 && "Hace 5 minutos"}
                  {index === 1 && "Hace 1 hora"}
                  {index === 2 && "Hace 3 horas"}
                  {index === 3 && "Hace 5 horas"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}