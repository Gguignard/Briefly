import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'marketing.footer' })

  return (
    <footer className="border-t py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>{t('copyright')}</p>
        <nav className="flex gap-6">
          <Link href={`/${locale}/legal/privacy`}>{t('privacy')}</Link>
          <Link href={`/${locale}/legal/terms`}>{t('terms')}</Link>
          <a href="mailto:hello@briefly.app">{t('contact')}</a>
        </nav>
      </div>
    </footer>
  )
}
