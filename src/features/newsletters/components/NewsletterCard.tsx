'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Newsletter {
  id: string
  name: string
  email_address: string | null
  active: boolean
}

interface Props {
  newsletter: Newsletter
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export function NewsletterCard({ newsletter, onToggle, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const t = useTranslations('newsletters.card')

  return (
    <div className="flex items-center justify-between border rounded-lg px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium truncate">{newsletter.name}</p>
        {newsletter.email_address && (
          <p className="text-xs text-muted-foreground truncate">
            {newsletter.email_address}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={newsletter.active}
          onCheckedChange={(active) => onToggle(newsletter.id, active)}
        />
        {confirmDelete ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(newsletter.id)}
            >
              {t('confirm')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              {t('cancel')}
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
