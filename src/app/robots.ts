import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://briefly.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/fr/', '/en/'],
        disallow: [
          '/summaries/',
          '/newsletters/',
          '/categories/',
          '/settings/',
          '/billing/',
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
