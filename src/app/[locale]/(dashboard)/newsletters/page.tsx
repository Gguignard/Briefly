import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InboxAddressCard } from '@/features/newsletters/components/InboxAddressCard'
import { NewsletterList } from '@/features/newsletters/components/NewsletterList'
import { OnboardingWrapper } from '@/features/onboarding/components/OnboardingWrapper'

export default async function NewslettersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('newsletters')

  const supabase = createAdminClient()

  const [{ data: newsletters }, { data: user }, { data: settings }] = await Promise.all([
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
    supabase
      .from('user_settings')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single(),
  ])

  const tier = (user?.tier as 'free' | 'paid') ?? 'free'
  const showOnboarding = (newsletters ?? []).length === 0 && !settings?.onboarding_completed

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
      </div>

      {showOnboarding && user?.inbox_address && (
        <OnboardingWrapper inboxAddress={user.inbox_address} />
      )}

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
