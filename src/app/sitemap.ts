import { MetadataRoute } from 'next'

const LOCALES = ['fr', 'en'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://briefly.app'
  // Note: /legal/privacy and /legal/terms removed until pages are implemented
  const staticPages = ['', '/pricing']

  return staticPages.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency:
        (page === '' ? 'weekly' : 'monthly') as
          | 'always'
          | 'hourly'
          | 'daily'
          | 'weekly'
          | 'monthly'
          | 'yearly'
          | 'never',
      priority: page === '' ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${page}`])
        ),
      },
    }))
  )
}
