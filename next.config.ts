import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/demo', destination: '/', permanent: true },
      { source: '/landing', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return {
      afterFiles: [
        { source: '/app', destination: '/app-shell.html' },
        { source: '/blog', destination: '/blog.html' },
        { source: '/blog/morning-brief-method', destination: '/blog/morning-brief-method.html' },
        { source: '/blog/fight-camp-planning', destination: '/blog/fight-camp-planning.html' },
        { source: '/blog/weight-cut-guide', destination: '/blog/weight-cut-guide.html' },
        { source: '/blog/overtraining-signs', destination: '/blog/overtraining-signs.html' },
        { source: '/blog/peak-week-protocol', destination: '/blog/peak-week-protocol.html' },
        { source: '/blog/data-driven-coaching', destination: '/blog/data-driven-coaching.html' },
        { source: '/blog/hrv-readiness', destination: '/blog/hrv-readiness.html' },
        { source: '/blog/best-apps-for-boxing-coaches', destination: '/blog/best-apps-for-boxing-coaches.html' },
        { source: '/blog/what-is-a-fighter-readiness-score', destination: '/blog/what-is-a-fighter-readiness-score.html' },
        { source: '/blog/spreadsheet-vs-app-fight-camp', destination: '/blog/spreadsheet-vs-app-fight-camp.html' },
      ],
    };
  },
};

export default nextConfig;
