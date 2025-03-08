import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
  // Enable React profiling in production build when NEXT_PUBLIC_ENABLE_PROFILER is true
  reactProductionProfiling: process.env.NEXT_PUBLIC_ENABLE_PROFILER === 'true',
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://decision-copilot.wellmaintained.org/:path*',
        permanent: true,
        has: [
          {
            type: 'host',
            value: '(?!decision-copilot\\.wellmaintained\\.org)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
