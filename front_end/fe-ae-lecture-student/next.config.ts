import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "vinuni.edu.vn",
      },
      {
        protocol: "https",
        hostname: "ebridgebucket.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
