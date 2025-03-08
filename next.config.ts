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
