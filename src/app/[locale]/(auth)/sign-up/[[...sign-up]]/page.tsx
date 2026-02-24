import { SignUp } from '@clerk/nextjs'
import { getTranslations } from 'next-intl/server'

interface SignUpPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {t('securityMessage')}
      </p>
      <SignUp
        routing="path"
        path={`/${locale}/sign-up`}
        signInUrl={`/${locale}/sign-in`}
        forceRedirectUrl={`/${locale}/summaries`}
      />
    </div>
  )
}
