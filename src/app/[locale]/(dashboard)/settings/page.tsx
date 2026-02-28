import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { AccountSection } from '@/features/settings/components/AccountSection'
import { NotificationSection } from '@/features/settings/components/NotificationSection'
import { BillingSection } from '@/features/settings/components/BillingSection'
import { DangerZoneSection } from '@/features/settings/components/DangerZoneSection'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('settings')

  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from('user_settings')
    .select('daily_summary_enabled')
    .eq('user_id', userId)
    .maybeSingle()

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <AccountSection />
      <NotificationSection initialEnabled={settings?.daily_summary_enabled ?? true} />
      <BillingSection />
      <DangerZoneSection />
    </div>
  )
}
