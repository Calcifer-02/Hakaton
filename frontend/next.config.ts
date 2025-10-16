import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  basePath: '/Hakaton',
  assetPrefix: '/Hakaton',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
