'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface CategoryData {
  id: string
  name: string
  color: string
}

interface Props {
  category: CategoryData
  newsletterCount: number
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<CategoryData>) => void
}

export function CategoryRow({ category, newsletterCount, onDelete, onUpdate }: Props) {
  const t = useTranslations('categoriesPage')
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color)
  const [deleting, setDeleting] = useState(false)

  const handleRename = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === category.name) {
      setName(category.name)
      return
    }

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error('rename failed')
      onUpdate(category.id, { name: trimmed })
    } catch {
      setName(category.name)
      toast.error(t('renameError'))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setName(category.name)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const handleColorSave = async (newColor: string) => {
    if (newColor === category.color) return

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: newColor }),
      })
      if (!res.ok) throw new Error('color update failed')
      onUpdate(category.id, { color: newColor })
    } catch {
      setColor(category.color)
      toast.error(t('colorError'))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      onDelete(category.id)
    } catch {
      setDeleting(false)
      toast.error(t('deleteError'))
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <input
        data-testid="color-input"
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        onBlur={(e) => handleColorSave(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded border-0 p-0"
        aria-label={t('colorLabel')}
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleRename}
        onKeyDown={handleKeyDown}
        className="flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        maxLength={50}
        aria-label={t('categoryNameLabel')}
      />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {t('newsletterCount', { count: newsletterCount })}
      </span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={deleting}
            aria-label={t('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} aria-label={t('confirm')}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
