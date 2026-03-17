'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/category'

export function CategoryFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategoryId = searchParams.get('categoryId')
  const t = useTranslations('summaries')

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((r) => r.data),
  })

  const handleFilter = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('categoryId', categoryId)
    } else {
      params.delete('categoryId')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  if (categories.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => handleFilter(null)}
        className={cn(
          'px-3 py-1 rounded-full text-sm border transition-colors',
          !activeCategoryId
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background hover:bg-muted border-input',
        )}
      >
        {t('allCategories')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleFilter(cat.id)}
          className={cn(
            'px-3 py-1 rounded-full text-sm border transition-colors flex items-center gap-1.5',
            activeCategoryId === cat.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-input',
          )}
        >
          <span
            data-testid="category-color"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          {cat.name}
        </button>
      ))}
    </div>
  )
}
