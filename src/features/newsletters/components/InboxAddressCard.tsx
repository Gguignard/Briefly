'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  inboxAddress: string
}

export function InboxAddressCard({ inboxAddress }: Props) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('newsletters.inbox')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inboxAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available (e.g. non-HTTPS context)
    }
  }

  return (
    <section className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-medium">{t('title')}</h2>
      <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
        <code className="flex-1 text-sm font-mono truncate">{inboxAddress}</code>
        <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={t('copy')}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('description')}
      </p>
    </section>
  )
}
