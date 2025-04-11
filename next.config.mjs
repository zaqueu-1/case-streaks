/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo standalone (caso use Vercel Serverless Functions)
  output: "standalone",

  // trailingSlash, se você realmente precisa desse comportamento
  trailingSlash: true,

  // Mover para fora de "experimental"
  outputFileTracingExcludes: [
    "**/_not-found/**",
  ],

  // Configurações de imagem (se forem necessárias mesmo)
  images: {
    domains: ["media.beehiiv.com", "app.thenewscc.com.br"],
  },
};

export default nextConfig;
