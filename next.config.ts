import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Allow development through the local WSL network adapter.
  allowedDevOrigins: ["172.21.224.1"],
};

export default nextConfig;
