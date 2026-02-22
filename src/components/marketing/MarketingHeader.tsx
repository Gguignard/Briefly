import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function MarketingHeader({ locale }: { locale: string }) {
  const t = await getTranslations('marketing.header')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/`} className="flex items-center space-x-2">
            <span className="text-xl font-bold">Briefly</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href={`/${locale}/pricing`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('pricing')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/sign-in`}>{t('signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/sign-up`}>{t('signUp')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
