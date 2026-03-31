import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // @ts-ignore - turbopack root might be needed for certain setups
    turbopack: {
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;
