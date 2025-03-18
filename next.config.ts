import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript:{
    ignoreBuildErrors:true
  },
  reactStrictMode: true,
  output:"export"
};

export default nextConfig;
