import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.legal.terms' })

  return {
    title: t('meta_title'),
    robots: { index: false, follow: false },
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'marketing.legal.terms' })

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-card rounded-xl p-8 shadow-sm prose prose-violet max-w-none">
      <h1>{t('title')}</h1>
      <p className="text-muted-foreground text-sm">{t('last_updated')}</p>

      <h2>{t('purpose_title')}</h2>
      <p>{t('purpose_text')}</p>

      <h2>{t('account_title')}</h2>
      <p>{t('account_text')}</p>

      <h2>{t('tiers_title')}</h2>
      <ul>
        <li><strong>{t('tier_free').split(':')[0]}:</strong>{t('tier_free').split(':')[1]}</li>
        <li><strong>{t('tier_paid').split(':')[0]}:</strong>{t('tier_paid').split(':')[1]}</li>
      </ul>

      <h2>{t('acceptable_use_title')}</h2>
      <p>{t('acceptable_use_text')}</p>

      <h2>{t('termination_title')}</h2>
      <p>{t('termination_text')}</p>

      <h2>{t('liability_title')}</h2>
      <p>{t('liability_text')}</p>

      <h2>{t('contact_title')}</h2>
      <p>
        {t('contact_intro')}{' '}
        <a href="mailto:hello@briefly.app">hello@briefly.app</a>
      </p>
      </div>
    </main>
  )
}
