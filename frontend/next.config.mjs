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
};

export default nextConfig;
