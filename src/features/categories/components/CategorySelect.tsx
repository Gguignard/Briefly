'use client'

import { useTranslations } from 'next-intl'
import type { Category } from '@/types/category'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  categories: Category[]
  currentCategoryId: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategorySelect({ categories, currentCategoryId, onSelect }: Props) {
  const t = useTranslations('newsletters.card')

  return (
    <Select
      value={currentCategoryId ?? 'none'}
      onValueChange={(v) => onSelect(v === 'none' ? null : v)}
    >
      <SelectTrigger className="w-36 h-7 text-xs">
        <SelectValue placeholder={t('categoryPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{t('noCategory')}</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
