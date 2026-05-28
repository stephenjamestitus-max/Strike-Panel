import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        { source: '/app', destination: '/app-shell.html' },
        { source: '/demo', destination: '/demo.html' },
        { source: '/blog', destination: '/blog.html' },
      ],
    };
  },
};

export default nextConfig;
