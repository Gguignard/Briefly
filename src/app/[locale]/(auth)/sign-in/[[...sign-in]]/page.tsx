import { SignIn } from '@clerk/nextjs'
import { clerkAppearance } from '@/features/auth/clerk-appearance'

interface SignInPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-secondary to-muted px-4">
      <SignIn
        routing="path"
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        fallbackRedirectUrl={`/${locale}/settings`}
        appearance={clerkAppearance}
      />
    </div>
  )
}
