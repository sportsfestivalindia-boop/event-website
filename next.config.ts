import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets phones on the same Wi-Fi load dev assets (review on a real device)
  allowedDevOrigins: ["192.168.0.64"],
};

export default nextConfig;
