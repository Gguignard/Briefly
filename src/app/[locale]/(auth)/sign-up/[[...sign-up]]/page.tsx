import { SignUp } from '@clerk/nextjs'
import { clerkAppearance } from '@/features/auth/clerk-appearance'

interface SignUpPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-secondary to-muted px-4">
      <SignUp
        routing="path"
        path={`/${locale}/sign-up`}
        signInUrl={`/${locale}/sign-in`}
        forceRedirectUrl={`/${locale}/settings`}
        appearance={clerkAppearance}
      />
    </div>
  )
}
