import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InboxAddressCard } from '@/features/newsletters/components/InboxAddressCard'
import { NewsletterList } from '@/features/newsletters/components/NewsletterList'

export default async function NewslettersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('newsletters')

  const supabase = createAdminClient()

  const [{ data: newsletters }, { data: user }] = await Promise.all([
    supabase
      .from('newsletters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('users')
      .select('inbox_address, tier')
      .eq('clerk_id', userId)
      .single(),
  ])

  const tier = (user?.tier as 'free' | 'paid') ?? 'free'

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
      </div>

      {user?.inbox_address && (
        <InboxAddressCard inboxAddress={user.inbox_address} />
      )}

      <NewsletterList
        initialNewsletters={newsletters ?? []}
        userTier={tier}
      />
    </div>
  )
}
