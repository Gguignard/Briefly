import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function MarketingFooter({ locale }: { locale: string }) {
  const t = await getTranslations('marketing.footer')

  return (
    <footer className="w-full border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href={`/${locale}/`} className="flex items-center space-x-2">
              <span className="text-xl font-bold">Briefly</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t('tagline')}</p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('product')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/#features`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/legal/privacy`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('support')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hello@briefly.app"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
