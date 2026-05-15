import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hbsunejenfjgiwfokena.supabase.co',
      },
    ],
  },
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      // WSL에서 Windows 파일시스템(/mnt/d/) 변경 감지를 위해 폴링 사용
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**'],
      }
    }
    return config
  },
};

export default nextConfig;
