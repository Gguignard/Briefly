import { SignIn } from '@clerk/nextjs'
import { getTranslations } from 'next-intl/server'

interface SignInPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {t('securityMessage')}
      </p>
      <SignIn
        routing="path"
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        forceRedirectUrl={`/${locale}/summaries`}
      />
    </div>
  )
}
