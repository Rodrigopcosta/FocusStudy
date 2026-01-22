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
}

export default nextConfig