import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 🔥 REQUIRED for postgres.js + Turbopack
    serverComponentsExternalPackages: ['postgres'],
  },
};

export default nextConfig;
