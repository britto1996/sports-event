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
  async rewrites() {
    const target = (process.env.API_PROXY_TARGET || "http://localhost:8000").trim();
    return [
      {
        source: "/api/:path*",
        destination: `${target.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
