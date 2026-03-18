'use client'

import { useState } from 'react'
import { Plus, Lock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CategoryRow } from './CategoryRow'
import { AddCategoryForm } from './AddCategoryForm'

export const FREE_CATEGORY_LIMIT = 3

interface Category {
  id: string
  name: string
  color: string
  newsletters: { count: number }[]
}

interface Props {
  initialCategories: Category[]
  userTier: 'free' | 'paid'
}

export function CategoriesList({ initialCategories, userTier }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const t = useTranslations('categoriesPage')
  const locale = useLocale()

  const atLimit = userTier === 'free' && categories.length >= FREE_CATEGORY_LIMIT
  const canAdd = !atLimit

  const handleAdd = (cat: Category) => {
    setCategories(prev => [...prev, cat])
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const handleUpdate = (id: string, data: Partial<Category>) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...data } : c)),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {userTier === 'free'
            ? t('countWithLimit', { count: categories.length })
            : t('count', { count: categories.length })}
        </p>
        <Button size="sm" disabled={!canAdd} onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('add')}
        </Button>
      </div>

      {atLimit && (
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {t('upgradeBanner')}{' '}
            <Link href={`/${locale}/billing`} className="font-medium underline">
              {t('upgradeLink')}
            </Link>{' '}
            {t('unlimitedCategories')}
          </AlertDescription>
        </Alert>
      )}

      {showForm && (
        <AddCategoryForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <div className="space-y-2">
        {categories.map(cat => (
          <CategoryRow
            key={cat.id}
            category={cat}
            newsletterCount={cat.newsletters?.[0]?.count ?? 0}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {categories.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">
          {t('empty')}
        </p>
      )}
    </div>
  )
}
