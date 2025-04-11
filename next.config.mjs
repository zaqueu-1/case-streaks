/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Aumentar o timeout para a geração estática
  staticPageGenerationTimeout: 180,
  
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
  
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "child_process": false,
      "fs": false,
      "net": false,
      "tls": false,
    }
    return config
  },
  
  async rewrites() {
    return [
      {
        source: "/healthcheck",
        destination: "/api/healthcheck",
      },
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
}

export default nextConfig
