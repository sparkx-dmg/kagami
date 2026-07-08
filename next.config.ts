import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow optimized Next.js Image from MangaDex CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        pathname: '/covers/**',
      },
    ],
    // Serve WebP where supported — smaller file size = faster load
    formats: ['image/webp', 'image/avif'],
  },
  // Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
