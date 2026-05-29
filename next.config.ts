import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        { source: '/app', destination: '/app-shell.html' },
        { source: '/demo', destination: '/demo.html' },
        { source: '/blog', destination: '/blog.html' },
        { source: '/blog/morning-brief-method', destination: '/blog/morning-brief-method.html' },
        { source: '/blog/fight-camp-planning', destination: '/blog/fight-camp-planning.html' },
        { source: '/blog/weight-cut-guide', destination: '/blog/weight-cut-guide.html' },
        { source: '/blog/overtraining-signs', destination: '/blog/overtraining-signs.html' },
        { source: '/blog/peak-week-protocol', destination: '/blog/peak-week-protocol.html' },
        { source: '/blog/data-driven-coaching', destination: '/blog/data-driven-coaching.html' },
        { source: '/blog/hrv-readiness', destination: '/blog/hrv-readiness.html' },
      ],
    };
  },
};

export default nextConfig;
