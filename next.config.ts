import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Le lint n'est pas bloquant pour le build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
