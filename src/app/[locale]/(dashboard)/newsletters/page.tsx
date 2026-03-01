import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InboxAddressCard } from '@/features/newsletters/components/InboxAddressCard'

export default async function NewslettersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('newsletters')

  const supabase = createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('inbox_address')
    .eq('clerk_id', userId)
    .single()

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">{t('empty')}</h1>
      {user?.inbox_address && (
        <InboxAddressCard inboxAddress={user.inbox_address} />
      )}
    </div>
  )
}
