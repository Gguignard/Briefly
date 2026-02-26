'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useLocale, useTranslations } from 'next-intl'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const { signOut } = useClerk()
  const locale = useLocale()
  const t = useTranslations('nav')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await signOut({ redirectUrl: `/${locale}` })
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-muted-foreground hover:text-foreground"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {t('signOut')}
    </Button>
  )
}
