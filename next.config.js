import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Definir URL base padrão para uso durante o build
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://casestreaks.vercel.app"

// Melhorar o polyfill para URL quando não estiver disponível
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      if (!url) throw new TypeError("Invalid URL");
      
      this.href = url;
      this.origin = '';
      this.protocol = 'https:';
      this.username = '';
      this.password = '';
      this.host = '';
      this.hostname = '';
      this.port = '';
      this.pathname = '/';
      this.search = '';
      this.hash = '';
      
      // Método toString para compatibilidade
      this.toString = function() {
        return this.href;
      };
    }
    
    // Método estático para criar objetos de URL 
    static createObjectURL() {
      return '';
    }
    
    // Método estático para revogar objetos de URL
    static revokeObjectURL() {
      return;
    }
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,
  // Adicionar variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://casestreaks.vercel.app",
  },
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
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  // Desativar a pré-renderização para certas páginas
  excludeDefaultMomentLocales: true,
  // Desativar geração estática para a página not-found
  unstable_excludePages: ['/_not-found'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "child_process": false,
      "fs": false,
      "net": false,
      "tls": false,
      // Adicionar fallback para URL diretamente sem require.resolve
      "url": false,
    }
    
    return config
  },
  async rewrites() {
    return [
      {
        source: "/healthcheck",
        destination: "/api/healthcheck",
      },
      // Remover o rewrite para _not-found para evitar problemas
      {
        source: "/_error",
        destination: "/dashboard",
      },
      {
        source: "/404",
        destination: "/dashboard",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/api/healthcheck",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ]
  },
}

export default nextConfig
