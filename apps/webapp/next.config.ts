import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable bundle analyzer in development
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tiptap/react', 
      '@tiptap/starter-kit',
      'date-fns',
      '@radix-ui/react-accordion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-visually-hidden'
    ],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
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
