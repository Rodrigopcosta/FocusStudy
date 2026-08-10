/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],

  images: {
    unoptimized: true,
  },

  compress: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://focus-study.online',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',

            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel-scripts.com https://sdk.mercadopago.com https://*.mlstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self' https://ubwiwcpyxxnwkmxwwzae.supabase.co wss://ubwiwcpyxxnwkmxwwzae.supabase.co https://api.mercadopago.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com; frame-src 'self' https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com; worker-src 'self' blob:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
