'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { Newsletter } from '@/types/newsletter'
import type { Category } from '@/types/category'
import { NewsletterCard } from './NewsletterCard'
import { AddNewsletterModal } from './AddNewsletterModal'
import { NewsletterLimitBanner, FREE_NEWSLETTER_LIMIT } from './NewsletterLimitBanner'
import { Button } from '@/components/ui/button'
import { Plus, MailOpen } from 'lucide-react'

interface Props {
  initialNewsletters: Newsletter[]
  userTier: 'free' | 'paid'
}

export function NewsletterList({ initialNewsletters, userTier }: Props) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)
  const [categories, setCategories] = useState<Category[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const t = useTranslations('newsletters')

  const activeCount = newsletters.filter((n) => n.active).length
  const canAdd = userTier === 'paid' || activeCount < FREE_NEWSLETTER_LIMIT

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((r) => setCategories(r.data ?? []))
      .catch(() => {})
  }, [])

  const handleToggle = async (id: string, active: boolean) => {
    const res = await fetch(`/api/newsletters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    if (!res.ok) return
    setNewsletters((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active } : n)),
    )
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/newsletters/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setNewsletters((prev) => prev.filter((n) => n.id !== id))
  }

  const handleCategoryChange = async (id: string, categoryId: string | null) => {
    const res = await fetch(`/api/newsletters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId }),
    })
    if (!res.ok) return
    setNewsletters((prev) =>
      prev.map((n) => (n.id === id ? { ...n, category_id: categoryId } : n)),
    )
  }

  const handleAdd = (newsletter: Newsletter) => {
    setNewsletters((prev) => [newsletter, ...prev])
    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NewsletterLimitBanner count={activeCount} tier={userTier} />
        <Button
          size="sm"
          disabled={!canAdd}
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addButton')}
        </Button>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <MailOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {newsletters.map((n) => (
            <NewsletterCard
              key={n.id}
              newsletter={n}
              categories={categories}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onCategoryChange={handleCategoryChange}
            />
          ))}
        </div>
      )}

      <AddNewsletterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}
