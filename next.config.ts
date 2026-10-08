import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets phones on the same Wi-Fi load dev assets (review on a real device)
  allowedDevOrigins: ["192.168.0.64"],
  // fonts + logo the ticket PNG reads from disk at runtime
  outputFileTracingIncludes: { "/ticket/**": ["./assets/**/*", "./public/img/mark.png"] },
  // one canonical address: www → sportsfestivalindia.com
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sportsfestivalindia.com" }],
        destination: "https://sportsfestivalindia.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
