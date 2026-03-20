'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  inboxAddress: string
  onDismiss: () => void
}

const STEP_KEYS = ['copy_address', 'subscribe', 'wait_summary'] as const

export function OnboardingBanner({ inboxAddress, onDismiss }: Props) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('onboarding')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inboxAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="border border-primary/20 rounded-xl bg-primary/5 p-6 space-y-4 relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label={t('close')}
      >
        <X className="h-4 w-4" />
      </button>

      <div>
        <h2 className="font-semibold text-base">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <ol className="space-y-3">
        {STEP_KEYS.map((key, index) => (
          <li key={key} className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-semibold">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium">{t(`steps.${key}.title`)}</p>
              <p className="text-xs text-muted-foreground">{t(`steps.${key}.description`)}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleCopy}>
          {copied ? t('copied') : t('copy_button')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          {t('dismiss')}
        </Button>
      </div>
    </div>
  )
}
