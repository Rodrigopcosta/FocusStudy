/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Mantido conforme seu código original
    ignoreBuildErrors: true,
  },
  
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    unoptimized: true,
  },

  // Ativa a compressão Gzip/Brotli para performance
  compress: true,

  async headers() {
    return [
      {
        // Aplica estas regras a todas as rotas do site
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://focus-study.online",
          },
          {
            // Impede que seu site seja colocado em iframes (Proteção contra Clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Impede o navegador de tentar adivinhar o tipo de conteúdo (Proteção contra Sniffing)
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Força o uso de HTTPS por 1 ano
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            // Política de Segurança de Conteúdo (Sua versão atualizada e funcional)
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
          },
          {
            // NOVO: Controla quais informações de origem são enviadas em links (Resolve erro no Security Headers)
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // NOVO: Bloqueia acesso à câmera, microfone e geolocalização por padrão
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
}

export default nextConfig