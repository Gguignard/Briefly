'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Newsletter } from '@/types/newsletter'
import type { Category } from '@/types/category'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { CategorySelect } from '@/features/categories/components/CategorySelect'

interface Props {
  newsletter: Newsletter
  categories: Category[]
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onCategoryChange: (id: string, categoryId: string | null) => void
}

export function NewsletterCard({ newsletter, categories, onToggle, onDelete, onCategoryChange }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const t = useTranslations('newsletters.card')

  const category = categories.find((c) => c.id === newsletter.category_id)

  return (
    <div className="flex items-center justify-between border rounded-lg px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{newsletter.name}</p>
          {category && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: category.color + '20',
                color: category.color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          )}
        </div>
        {newsletter.email_address && (
          <p className="text-xs text-muted-foreground truncate">
            {newsletter.email_address}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <CategorySelect
          categories={categories}
          currentCategoryId={newsletter.category_id}
          onSelect={(categoryId) => onCategoryChange(newsletter.id, categoryId)}
        />
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
