'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onAdd: (category: { id: string; name: string; color: string; newsletters: { count: number }[] }) => void
  onCancel: () => void
}

export function AddCategoryForm({ onAdd, onCancel }: Props) {
  const t = useTranslations('categoriesPage')
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      })

      if (!res.ok) throw new Error('Failed to create category')

      const { data } = await res.json()
      onAdd({ ...data, newsletters: [{ count: 0 }] })
    } catch {
      toast.error(t('addError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-lg border p-3">
      <input
        data-testid="color-input"
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded border-0 p-0"
        aria-label={t('colorLabel')}
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('namePlaceholder')}
        maxLength={50}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={!name.trim() || loading} aria-label={t('save')}>
        {t('save')}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel} aria-label={t('cancel')}>
        {t('cancel')}
      </Button>
    </form>
  )
}
