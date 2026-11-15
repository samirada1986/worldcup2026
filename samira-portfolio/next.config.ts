import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // The photographs are ~1100px wide: never generate (or ship) variants beyond what exists.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [96, 160, 240, 384],
  },
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
