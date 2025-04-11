/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // Desabilitar otimização e pré-renderização
  swcMinify: false,
  optimizeFonts: false,
  compress: false,

  // Configurações de imagem básicas
  images: {
    domains: ["media.beehiiv.com", "app.thenewscc.com.br"],
    unoptimized: true,
  },
  
  // Experimental para App Router
  experimental: {
    serverActions: true,
    // Recursos experimentais para contornar problemas de URL
    serverComponentsExternalPackages: ['url'],
    appDocumentPreloading: false,
    adjustFontFallbacks: false,
    optimizePackageImports: false,
    optimizeCss: false
  }
}

export default nextConfig
