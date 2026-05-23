import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Run after Next.js filesystem routes — serves existing static HTML
      // at their original URLs without touching Next.js app routes
      afterFiles: [
        { source: '/', destination: '/app-shell.html' },
        { source: '/demo', destination: '/demo.html' },
        { source: '/blog', destination: '/blog.html' },
        { source: '/blog/fight-camp-planning', destination: '/blog/fight-camp-planning.html' },
        { source: '/blog/morning-brief-method', destination: '/blog/morning-brief-method.html' },
        { source: '/blog/overtraining-signs', destination: '/blog/overtraining-signs.html' },
        { source: '/blog/weight-cut-guide', destination: '/blog/weight-cut-guide.html' },
      ],
    }
  },
}

export default nextConfig
