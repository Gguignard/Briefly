import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CategoriesList } from '@/features/categories/components/CategoriesList'

export default async function CategoriesPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    const locale = await getLocale()
    redirect(`/${locale}/sign-in`)
  }

  const t = await getTranslations('categoriesPage')
  const supabase = createAdminClient()

  const [{ data: user }, { data: categories }] = await Promise.all([
    supabase
      .from('users')
      .select('tier')
      .eq('clerk_id', clerkId)
      .single(),
    supabase
      .from('categories')
      .select('*, newsletters(count)')
      .eq('user_id', clerkId)
      .order('created_at'),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>
      <CategoriesList
        initialCategories={categories ?? []}
        userTier={(user?.tier as 'free' | 'paid') ?? 'free'}
      />
    </div>
  )
}
