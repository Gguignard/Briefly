import { SignIn } from '@clerk/nextjs'

interface SignInPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        routing="path"
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        forceRedirectUrl={`/${locale}/summaries`}
      />
    </div>
  )
}
