import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { routing, locales, type Locale } from '@/i18n/routing'
import { ClerkProvider } from '@clerk/nextjs'
import { frFR, enUS } from '@clerk/localizations'
import '../globals.css'

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://briefly.app'

  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        fr: `${baseUrl}/fr`,
        en: `${baseUrl}/en`,
        'x-default': `${baseUrl}/fr`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Briefly',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  // Clerk localization based on current locale
  const clerkLocalization = locale === 'fr' ? frFR : enUS

  // Check if Clerk is configured (allows static build of public pages without Clerk keys)
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {hasClerkKey ? (
          <ClerkProvider localization={clerkLocalization}>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ClerkProvider>
        ) : (
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        )}
      </body>
    </html>
  )
}
