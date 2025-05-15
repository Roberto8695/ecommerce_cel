'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAdmin, logout, getProfile } from '@/services/authService';

// Creamos el contexto
const AuthContext = createContext(null);

/**
 * Proveedor de autenticación para la aplicación
 * Este componente debe envolver las rutas que requieran autenticación
 */
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Verificamos si hay un usuario autenticado al cargar la aplicación
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Intentamos obtener el perfil del servidor para validar el token
          const { admin: profile } = await getProfile();
          setAdmin(profile);
        } catch (err) {
          console.error('Error verificando autenticación:', err);
          // Si hay un error, es porque el token no es válido
          logout();
          setError('La sesión ha expirado. Por favor inicia sesión de nuevo.');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    logout();
    setAdmin(null);
    router.push('/login');
  };

  // El valor que será accesible desde cualquier componente
  const contextValue = {
    admin,
    isAuthenticated: !!admin,
    loading,
    error,
    setAdmin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}