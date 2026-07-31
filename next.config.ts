import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 15 defaults the client Router Cache staleTime for dynamic routes to
  // 0s, forcing a full remount + refetch on every back/forward navigation.
  // Restoring a short reuse window makes back-nav feel instant app-wide.
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aj-empire.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
    ],

    formats: ["image/avif", "image/webp"],
    deviceSizes: [
      320,
      480,
      768,
      1024,
     
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