/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto le dice a Next.js que ignore los errores de linting durante el build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;