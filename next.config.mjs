/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configuração de timeout
  staticPageGenerationTimeout: 180,
  
  // Desabilitar a geração estática para páginas problemáticas
  excludeDefaultMomentLocales: true,
  
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
  
  // Configurações experimentais
  experimental: {
    // Desabilitar a pré-renderização de páginas especiais
    disableOptimizedLoading: true,
    serverActions: {
      enabled: true,
    },
  },
  
  // Configuração do webpack
  webpack: (config) => {
    // Remover polyfills desnecessários
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "child_process": false,
      "fs": false,
      "net": false,
      "tls": false,
    }
    return config
  },
  
  // Redirecionamentos para tratamento de erros e 404
  async rewrites() {
    return [
      {
        source: '/healthcheck',
        destination: '/api/healthcheck',
      },
    ]
  },
  
  // Redirecionamentos simplificados
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/error',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
