import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
      domains: ["images.unsplash.com", "aj-empire-bucket.s3.us-east-1.amazonaws.com"],
      formats: ["image/avif", "image/webp"]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
