import { defineRouting } from 'next-intl/routing'

export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr' satisfies Locale,
  localePrefix: 'always',
})
