import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'aj-empire-bucket.s3.us-east-1.amazonaws.com',
        },
      ],
      formats: ["image/avif", "image/webp"]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
