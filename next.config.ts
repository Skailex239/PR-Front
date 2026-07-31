import type { NextConfig } from "next";

/**
 * Deux cibles possibles :
 *  - build classique (Vercel, Node) : `npm run build`
 *  - export statique pour GitHub Pages : `GH_PAGES=true npm run build`
 *    → génère ./out, servi sous https://<pseudo>.github.io/PR-Front/
 */
const ghPages = process.env.GH_PAGES === "true";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: ghPages ? "/PR-Front" : "",
  },
  eslint: {
    // Le lint n'est pas bloquant pour le build.
    ignoreDuringBuilds: true,
  },
  ...(ghPages
    ? {
        output: "export",
        basePath: "/PR-Front",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
