import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
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
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: "/healthcheck",
        destination: "/api/healthcheck",
      },
      {
        source: "/_not-found",
        destination: "/dashboard",
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
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "child_process": false,
      "fs": false,
      "net": false,
      "tls": false,
      "url": false,
    }
    
    return config
  },
}

export default nextConfig
