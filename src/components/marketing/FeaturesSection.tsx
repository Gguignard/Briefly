import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Brain, FolderOpen } from 'lucide-react'

const FEATURES = [
  { key: 'dual_llm', icon: Brain },
  { key: 'auto_summary', icon: Zap },
  { key: 'categories', icon: FolderOpen },
] as const

export default async function FeaturesSection() {
  const t = await getTranslations('marketing.features')

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{t('title')}</h2>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ key, icon: Icon }) => (
            <Card key={key} className="border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">{t(`${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t(`${key}.description`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
