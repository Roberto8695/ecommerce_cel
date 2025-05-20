/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    domains: ['localhost'],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/ventas/:path*',
        destination: 'http://localhost:5000/api/ventas/:path*',
      },
      {
        source: '/api/pedidos/:path*',
        destination: 'http://localhost:5000/api/pedidos/:path*',
      },
      {
        source: '/api/simple/:path*',
        destination: 'http://localhost:5000/api/simple/:path*',
      },
      {
        source: '/api/productos/:path*',
        destination: 'http://localhost:5000/api/productos/:path*',
      },
      {
        source: '/api/marcas/:path*',
        destination: 'http://localhost:5000/api/marcas/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      }
    ];
  },
};

export default nextConfig;
