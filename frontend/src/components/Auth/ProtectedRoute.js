'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Solo verificamos cuando el contexto de autenticación ha terminado de cargar
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-600"></div>
          <div className="mt-4 text-blue-600">Cargando...</div>
        </div>
      </div>
    );
  }

  return children;
}
