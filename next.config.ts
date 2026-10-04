import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/studio", destination: "/image", permanent: false },
      { source: "/effects", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
