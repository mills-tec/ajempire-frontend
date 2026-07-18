import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aj-empire.b-cdn.net",
        pathname: "/**",
      }
    ],

    formats: ["image/avif", "image/webp"],
    deviceSizes: [
      320,
      480,
      768,
      1024,
      1280,
      1536,
    ],

    imageSizes: [
      32,
      64,
      128,
      256,
      384,
    ],
  },


};

export default nextConfig;