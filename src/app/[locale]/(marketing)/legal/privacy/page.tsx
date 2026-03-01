import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.legal.privacy' })

  return {
    title: t('meta_title'),
    robots: { index: false, follow: false },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'marketing.legal.privacy' })

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-card rounded-xl p-8 shadow-sm prose prose-violet max-w-none">
      <h1>{t('title')}</h1>
      <p className="text-muted-foreground text-sm">{t('last_updated')}</p>

      <h2>{t('data_collected_title')}</h2>
      <p>{t('data_collected_intro')}</p>
      <p>
        <strong>{t('data_collected_email_note')}</strong> {t('data_collected_email_method')}
      </p>

      <h2>{t('data_usage_title')}</h2>
      <ul>
        <li>{t('data_usage_summaries')}</li>
        <li>{t('data_usage_billing')}</li>
        <li>{t('data_usage_improvement')}</li>
      </ul>

      <h2>{t('retention_title')}</h2>
      <ul>
        <li>{t('retention_summaries')}</li>
        <li>{t('retention_account')}</li>
        <li>{t('retention_logs')}</li>
      </ul>

      <h2>{t('gdpr_title')}</h2>
      <p>
        {t('gdpr_intro')}{' '}
        <a href="mailto:privacy@briefly.app">privacy@briefly.app</a>.
      </p>
      <p>{t('gdpr_delete')}</p>

      <h2>{t('processors_title')}</h2>
      <ul>
        <li><strong>Clerk</strong> — {t('processor_clerk').replace('Clerk — ', '')}</li>
        <li><strong>Supabase</strong> — {t('processor_supabase').replace('Supabase — ', '')}</li>
        <li><strong>Stripe</strong> — {t('processor_stripe').replace('Stripe — ', '')}</li>
        <li><strong>Cloudflare</strong> — {t('processor_cloudflare').replace('Cloudflare — ', '')}</li>
        <li><strong>OpenAI / Anthropic</strong> — {t('processor_ai').replace('OpenAI / Anthropic — ', '')}</li>
        <li><strong>Sentry</strong> — {t('processor_sentry').replace('Sentry — ', '')}</li>
      </ul>

      <h2>{t('contact_title')}</h2>
      <p>
        {t('contact_intro')}{' '}
        <a href="mailto:privacy@briefly.app">privacy@briefly.app</a>
      </p>
      </div>
    </main>
  )
}
