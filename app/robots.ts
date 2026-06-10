import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/app'],
    },
    sitemap: 'https://strikepanel.uk/sitemap.xml',
    // llms.txt for AI crawlers
    // https://strikepanel.uk/llms.txt
  }
}
