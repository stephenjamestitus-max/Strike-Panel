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
      ],
    }
  },
}

export default nextConfig
