import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

export default async function HeroSection({ locale }: { locale: string }) {
  const t = await getTranslations('marketing.hero')

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6">
            <Badge variant="secondary" className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {t('headline')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              {t('subheadline')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link href={`/${locale}/sign-up`}>
                  {t('cta_primary')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href={`/${locale}/pricing`}>
                  {t('cta_secondary')}
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('no_credit_card')}
            </p>
          </div>
          {/* Illustration */}
          <div className="relative">
            <Image
              src="/images/dashboard-preview.png"
              alt={t('image_alt')}
              width={600}
              height={400}
              priority
              className="rounded-xl shadow-2xl border border-border"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
