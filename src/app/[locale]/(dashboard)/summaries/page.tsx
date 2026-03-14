import { getTranslations } from 'next-intl/server'
import { SummariesFeed } from '@/features/summaries/components/SummariesFeed'

export default async function SummariesPage() {
  const t = await getTranslations('summaries')

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <SummariesFeed />
    </div>
  )
}
