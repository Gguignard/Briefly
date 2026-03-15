import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UpgradeCard } from '@/features/billing/components/UpgradeCard'
import { SubscriptionCard } from '@/features/billing/components/SubscriptionCard'
import { CheckoutFeedback } from '@/features/billing/components/CheckoutFeedback'

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string; already_subscribed?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    const locale = await getLocale()
    redirect(`/${locale}/sign-in`)
  }

  const t = await getTranslations('billing')
  const params = await searchParams
  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, tier')
    .eq('clerk_id', clerkId)
    .single()

  let subscription = null
  if (user?.tier === 'paid') {
    const { data } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    subscription = data
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

      <CheckoutFeedback
        success={params.success === 'true'}
        canceled={params.canceled === 'true'}
        alreadySubscribed={params.already_subscribed === 'true'}
      />

      {user?.tier === 'paid' && subscription ? (
        <SubscriptionCard
          currentPeriodEnd={subscription.current_period_end}
        />
      ) : (
        <UpgradeCard />
      )}
    </div>
  )
}
