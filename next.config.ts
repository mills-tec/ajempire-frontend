import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com", "aj-empire-bucket.s3.us-east-1.amazonaws.com", "images.pexels.com", "i.pinimg.com"],
    formats: ["image/avif", "image/webp"]
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
