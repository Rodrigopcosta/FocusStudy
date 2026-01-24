/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    unoptimized: true,
  },

  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // Resolve erro de CORS: Restringe o acesso ao seu domínio
            value: "https://focus-study.online",
          },
          {
            key: "X-Frame-Options",
            // Resolve erro de Clickjacking: Impede o site de ser emoldurado
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            // Resolve erro de MIME Sniffing: Força o tipo de conteúdo correto
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            // Força o uso de HTTPS (HSTS)
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            // Resolve erro de CSP: Define origens seguras para scripts e estilos
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
}

export default nextConfig