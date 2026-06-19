/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://mangapro-backend:5000/api/:path*',
      },
    ]
  },
  images: {
    domains: ['localhost', 'backend', 'mangapro-backend'],
  },
}

module.exports = nextConfig
