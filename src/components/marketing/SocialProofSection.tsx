import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default async function SocialProofSection() {
  const t = await getTranslations('marketing.social_proof')

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">{t('title')}</h2>

          {/* User count */}
          <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
            <Users className="w-5 h-5" aria-hidden="true" />
            <span>{t('user_count', { count: 1000 })}</span>
          </div>

          {/* Testimonial */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <blockquote className="space-y-4">
                <p className="text-lg italic text-muted-foreground">
                  &ldquo;{t('testimonial.quote')}&rdquo;
                </p>
                <footer className="text-sm">
                  <cite className="not-italic font-medium text-foreground">
                    {t('testimonial.author')}
                  </cite>
                  <span className="text-muted-foreground"> — {t('testimonial.role')}</span>
                </footer>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
