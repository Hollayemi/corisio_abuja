// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Optional: restrict to your cloud only
        pathname: "/dfhfymr0q/**",
      },
    ],
  },
};

export default nextConfig;