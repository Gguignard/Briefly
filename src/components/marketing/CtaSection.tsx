import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CtaSection({ locale }: { locale: string }) {
  const t = await getTranslations('marketing.cta')

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">{t('title')}</h2>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href={`/${locale}/sign-up`}>{t('button')}</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{t('no_credit_card')}</p>
        </div>
      </div>
    </section>
  )
}
