/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // Especificar as extensões de página explicitamente
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Desabilitar a pré-renderização de páginas que começam com underscore
  unstable_excludeDefaultMomentLocales: true,
  disableStaticImages: true,
  
  // Pular completamente a pré-renderização estática de rotas especiais
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
  
  // Configuração para excluir páginas específicas da pré-renderização
  exportPathMap: async function (defaultPathMap) {
    // Remover explicitamente a página _not-found do mapa de exportação
    delete defaultPathMap['/_not-found'];
    return defaultPathMap;
  },
}

export default nextConfig
