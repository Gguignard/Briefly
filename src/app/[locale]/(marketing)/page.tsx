import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import HeroSection from '@/components/marketing/HeroSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import SocialProofSection from '@/components/marketing/SocialProofSection'
import CtaSection from '@/components/marketing/CtaSection'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.meta' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://briefly.app'

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/`,
      languages: {
        fr: `${baseUrl}/fr/`,
        en: `${baseUrl}/en/`,
        'x-default': `${baseUrl}/fr/`,
      },
    },
    openGraph: {
      title: t('og_title'),
      description: t('og_description'),
      url: `${baseUrl}/${locale}/`,
      siteName: 'Briefly',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t('og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og_title'),
      description: t('og_description'),
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <HeroSection locale={locale} />
      <FeaturesSection />
      <SocialProofSection />
      <CtaSection locale={locale} />
    </>
  )
}
