import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.help' })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://briefly.app'

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/help`,
      languages: {
        fr: `${baseUrl}/fr/help`,
        en: `${baseUrl}/en/help`,
        'x-default': `${baseUrl}/fr/help`,
      },
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      url: `${baseUrl}/${locale}/help`,
      siteName: 'Briefly',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
  }
}

type FaqItem = {
  id: string
  questionKey: string
  answerKey: string
}

type FaqSection = {
  titleKey: string
  items: FaqItem[]
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    titleKey: 'section_how_it_works',
    items: [
      { id: 'how-it-works', questionKey: 'faq_how_it_works_q', answerKey: 'faq_how_it_works_a' },
      { id: 'free-limit', questionKey: 'faq_free_limit_q', answerKey: 'faq_free_limit_a' },
    ],
  },
  {
    titleKey: 'section_email_issues',
    items: [
      { id: 'no-summaries', questionKey: 'faq_no_summaries_q', answerKey: 'faq_no_summaries_a' },
    ],
  },
  {
    titleKey: 'section_billing',
    items: [
      { id: 'cancel', questionKey: 'faq_cancel_q', answerKey: 'faq_cancel_a' },
    ],
  },
  {
    titleKey: 'section_gdpr',
    items: [
      { id: 'personal-email', questionKey: 'faq_personal_email_q', answerKey: 'faq_personal_email_a' },
      { id: 'delete-account', questionKey: 'faq_delete_account_q', answerKey: 'faq_delete_account_a' },
    ],
  },
]

export default async function HelpPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('marketing.help')

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="space-y-2 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <h2 className="text-xl font-semibold mb-4">{t(section.titleKey)}</h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      {t(item.questionKey)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t(item.answerKey)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 mt-12 text-center space-y-2">
          <p className="text-muted-foreground">{t('contact_prompt')}</p>
          <Link
            href={`/${locale}/help/contact`}
            className="text-primary hover:underline font-medium"
          >
            {t('contact_link')}
          </Link>
        </div>
      </div>
    </section>
  )
}
