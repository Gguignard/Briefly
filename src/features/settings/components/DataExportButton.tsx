'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function DataExportButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('settings.account.gdpr')

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/account/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `briefly-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError(t('export_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={loading}
      >
        <Download className="h-4 w-4 mr-2" />
        {loading ? t('exporting') : t('export_button')}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
