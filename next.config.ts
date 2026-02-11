import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all external images for mock data simplicity
      },
    ],
  },
};

export default nextConfig;
