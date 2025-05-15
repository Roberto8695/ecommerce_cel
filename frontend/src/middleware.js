import { NextResponse } from 'next/server'
 
// Rutas que debemos proteger
const protectedRoutes = ['/dashboard', '/dashboard/productos', '/dashboard/categorias', '/dashboard/clientes', '/dashboard/ventas', '/dashboard/reportes', '/dashboard/configuracion']
 
// Rutas públicas que no necesitan autenticación
const publicRoutes = ['/', '/login']

export function middleware(request) {
  const currentPath = request.nextUrl.pathname

  // Verificar si hay un token de autenticación en las cookies/localStorage
  const isAuthenticated = request.cookies.get('token') || request.headers.get('Authorization')?.startsWith('Bearer ')
  
  // Si es una ruta protegida y no hay autenticación, redirigir al login
  if (
    protectedRoutes.some(route => currentPath.startsWith(route)) && 
    !isAuthenticated
  ) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', currentPath)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado e intenta acceder al login, redirigir al dashboard
  if (currentPath === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Si no es ninguna de las condiciones anteriores, continuamos
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincide con todas estas rutas:
     * - /dashboard
     * - /dashboard/productos
     * - /dashboard/categorias
     * - /dashboard/clientes
     * - /dashboard/ventas
     * - /dashboard/reportes
     * - /dashboard/configuracion
     * - /login
     */
    '/dashboard/:path*',
    '/login'
  ],
}
