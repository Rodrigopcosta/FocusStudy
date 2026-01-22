/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Otimiza o tree shaking para a biblioteca de ícones
  optimizePackageImports: ["lucide-react"],

  images: {
    unoptimized: true,
  },

  // Ativa compressão gzip/brotli para reduzir o tamanho dos arquivos transferidos
  compress: true,
}

export default nextConfig