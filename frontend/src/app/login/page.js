"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';
import './modal.css'; // Importamos los estilos del modal
import { loginAdmin, setAuthData } from '@/services/authService';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successUser, setSuccessUser] = useState('');
  const router = useRouter();
  const { setAdmin, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  // Verificar si hay algún mensaje desde la redirección
  useEffect(() => {
    const from = searchParams.get('from');
    const expired = searchParams.get('expired') === 'true';

    if (expired) {
      setError('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
    } else if (from) {
      setMessage('Por favor inicia sesión para acceder a esa página.');
    }

    // Si el usuario ya está autenticado, redirigir al dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [searchParams, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Realizamos la petición al servidor con el servicio de autenticación
      const data = await loginAdmin(email, password);
      
      // Guardamos los datos en localStorage
      setAuthData(data);
      
      // Actualizamos el estado global
      setAdmin(data.admin);
      
      // Mostramos el modal de éxito antes de redirigir
      setSuccessUser(data.admin?.nombre || email);
      setShowSuccessModal(true);
      
      // Esperamos 2 segundos antes de redirigir
      setTimeout(() => {
        // Redirigimos al dashboard o a la página anterior
        const from = searchParams.get('from') || '/dashboard';
        router.push(from);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Por favor intenta de nuevo.');
      console.error('Error de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${styles.loginContainer}`}>
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0  z-10"></div>
        <Image 
          src="/img/bg-l.jpg" 
          alt="Background" 
          fill 
          priority
          className="object-cover"
          style={{ filter: 'brightness(0.7)' }}
        />
      </div>

      {/* Tarjeta de login con efecto backdrop blur */}
      <div className={`w-full max-w-md z-20 bg-white/20 rounded-2xl p-8 border border-white/20 ${styles.loginCard} ${styles.blurBackground}`}>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 text-white p-4 rounded-xl inline-block shadow-lg">
            <span className="text-2xl font-bold">EC</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
          <p className="text-blue-100 mt-2">
            Accede al panel de administración
          </p>
        </div>
        
        {/* Mensaje de redirección */}
        {message && (
          <div className="mb-6 p-4 bg-blue-500/30 backdrop-blur-sm border border-blue-400 text-white rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/30 backdrop-blur-sm border border-red-400 text-white rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="mb-2 flex items-center">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Correo electrónico
              </label>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20 text-white placeholder-blue-100/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Contraseña
              </label>
              <Link href="#" className="text-xs text-blue-100 hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20 text-white placeholder-blue-100/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
              Mantener sesión iniciada
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-100">
            <Link href="/" className="text-blue-100 hover:text-white font-medium transition-colors">
              Volver a la tienda
            </Link>
          </p>
        </div>        {/* Pie de página */}
        <div className="mt-10 pt-4 border-t border-white/20 text-center">
          <p className="text-xs text-blue-100/70">
            © {new Date().getFullYear()} ECommerce Cel. Todos los derechos reservados.
          </p>
        </div>
      </div>      
      {/* Modal de inicio de sesión exitoso */}
      {showSuccessModal && (
        <div className="login-success-modal">
          <div className="login-success-modal-backdrop"></div>
          <div className="login-success-modal-content">
            <div className="text-center">
              <div className="login-success-modal-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Inicio de sesión exitoso!</h3>
              <p className="text-blue-100 mb-6">
                Bienvenido/a de nuevo, <span className="font-semibold">{successUser}</span>
              </p>
              <p className="text-blue-100 text-sm mb-4">
                Serás redirigido al panel de administración en unos segundos...
              </p>
              <div className="flex justify-center">
                <div className="login-success-modal-loader">
                  <div className="login-success-modal-loader-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}