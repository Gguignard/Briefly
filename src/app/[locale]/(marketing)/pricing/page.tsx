import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { PricingCard, type PricingFeature } from '@/components/marketing/PricingCard'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.pricing' })

  // Use NEXT_PUBLIC_APP_URL from .env.example (Story 1.x baseline config)
  // Fallback ensures metadata generation works in all environments
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://briefly.app'

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/pricing`,
      languages: {
        fr: `${baseUrl}/fr/pricing`,
        en: `${baseUrl}/en/pricing`,
        'x-default': `${baseUrl}/fr/pricing`,
      },
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      url: `${baseUrl}/${locale}/pricing`,
      siteName: 'Briefly',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
  }
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('marketing.pricing')

  // Note: Price currencies (€ for FR, $ for EN) reflect target market preferences
  // Actual payment currency is configured in Stripe (Story 7.x)
  // This approach optimizes conversion by presenting familiar currencies to each audience
  const freeFeatures: PricingFeature[] = [
    { label: t('features.ai_summaries'), included: true },
    { label: t('features.five_newsletters'), included: true },
    { label: t('features.one_premium_day'), included: true },
    { label: t('features.unlimited_newsletters'), included: false, locked: true },
    { label: t('features.all_premium_llm'), included: false, locked: true },
    { label: t('features.custom_categories'), included: false, locked: true },
  ]

  const paidFeatures: PricingFeature[] = [
    { label: t('features.ai_summaries'), included: true },
    { label: t('features.unlimited_newsletters'), included: true },
    { label: t('features.all_premium_llm'), included: true },
    { label: t('features.unlimited_categories'), included: true },
    { label: t('features.priority_support'), included: true },
  ]

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            tierName={t('free_tier')}
            price={t('free_price')}
            features={freeFeatures}
            ctaLabel={t('cta_free')}
            ctaHref={`/${locale}/sign-up`}
          />
          <PricingCard
            tierName={t('paid_tier')}
            price={t('paid_price')}
            features={paidFeatures}
            ctaLabel={t('cta_paid')}
            ctaHref={`/${locale}/sign-up`}
            highlighted
            popularLabel={t('popular')}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-primary">{t('roi_note')}</p>
        </div>
      </div>
    </section>
  )
}
