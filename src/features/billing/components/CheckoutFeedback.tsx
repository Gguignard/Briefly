'use client'

import { useTranslations } from 'next-intl'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CheckoutFeedbackProps {
  success: boolean
  canceled: boolean
  alreadySubscribed: boolean
}

export function CheckoutFeedback({ success, canceled, alreadySubscribed }: CheckoutFeedbackProps) {
  const t = useTranslations('billing.checkout')

  if (!success && !canceled && !alreadySubscribed) return null

  return (
    <>
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">
            {t('success')}
          </AlertDescription>
        </Alert>
      )}
      {canceled && (
        <Alert>
          <AlertDescription className="text-muted-foreground">
            {t('canceled')}
          </AlertDescription>
        </Alert>
      )}
      {alreadySubscribed && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {t('alreadySubscribed')}
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
