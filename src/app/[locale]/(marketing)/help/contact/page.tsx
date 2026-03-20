'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const t = useTranslations('marketing.contact')
  const { user } = useUser()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.primaryEmailAddress?.emailAddress ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSent(true)
      } else {
        try {
          const json = await res.json()
          const code = json.error?.code
          if (code === 'RATE_LIMIT') {
            setError(t('error_rate_limit'))
          } else {
            setError(t('error_generic'))
          }
        } catch {
          setError(t('error_generic'))
        }
      }
    } catch {
      setError(t('error_generic'))
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
        <h1 className="text-xl font-semibold">{t('success_title')}</h1>
        <p className="text-muted-foreground">{t('success_message')}</p>
      </div>
    )
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16 space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register('name')} placeholder={t('placeholder_name')} />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{t('error_name')}</p>
          )}
        </div>
        <div>
          <Input {...register('email')} type="email" placeholder={t('placeholder_email')} />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{t('error_email')}</p>
          )}
        </div>
        <div>
          <Input {...register('subject')} placeholder={t('placeholder_subject')} />
          {errors.subject && (
            <p className="text-sm text-destructive mt-1">{t('error_subject')}</p>
          )}
        </div>
        <div>
          <Textarea {...register('message')} placeholder={t('placeholder_message')} rows={5} />
          {errors.message && (
            <p className="text-sm text-destructive mt-1">{t('error_message')}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </main>
  )
}
