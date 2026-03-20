import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const { userId } = await auth()
  const locale = await getLocale()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-6xl font-bold text-muted-foreground/30">404</p>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground max-w-sm">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex gap-3">
        {userId && (
          <Button asChild>
            <Link href={`/${locale}/summaries`}>Mes résumés</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href={`/${locale}`}>Accueil</Link>
        </Button>
      </div>
    </div>
  )
}
