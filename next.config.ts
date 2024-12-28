import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ap.rdcpix.com',  // This is RealtyAPI's image CDN domain
      },
    ],
  },
};

export default nextConfig;
