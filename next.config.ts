import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Your S3 bucket (locked to products folder only)
      {
        protocol: "https",
        hostname: "aj-empire-bucket.s3.us-east-1.amazonaws.com",
        pathname: "/**", // adjust if needed
      },

      // Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },

      // Pexels
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },

      // Pinterest CDN
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
    ],

    formats: ["image/avif", "image/webp"],

    // Optional: limit device sizes to avoid generating huge images
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ⚠ REMOVE THIS in production unless absolutely necessary
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;