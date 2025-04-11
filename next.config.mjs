/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // Pular completamente a pré-renderização estática
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Configurações de imagem necessárias
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.beehiiv.com",
      },
      {
        protocol: "https",
        hostname: "app.thenewscc.com.br",
      },
    ],
  },
  
  // Configurações experimentais para desabilitar otimizações problemáticas
  experimental: {
    disableOptimizedLoading: true,
    serverActions: {
      enabled: true,
    },
  },
}

export default nextConfig
