import { getTranslations } from 'next-intl/server'
import { ExternalLink } from 'lucide-react'

function getBullBoardUrl(): string | null {
  const base = process.env.BULL_BOARD_URL
  if (!base) return null
  const token = process.env.BULL_BOARD_TOKEN
  if (token) {
    const url = new URL(base)
    url.searchParams.set('token', token)
    return url.toString()
  }
  return base
}

export default async function AdminQueuesPage() {
  const t = await getTranslations('admin.queues')
  const bullBoardUrl = getBullBoardUrl()

  if (!bullBoardUrl) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('notConfigured')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <a
          href={bullBoardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {t('openExternal')}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <iframe
        src={bullBoardUrl}
        className="h-[calc(100vh-12rem)] w-full rounded-lg border"
        title="Bull Board"
      />
    </div>
  )
}
