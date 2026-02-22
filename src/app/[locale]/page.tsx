import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function Home() {
  const t = await getTranslations('home')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Briefly</h1>
      <p className="text-muted-foreground">{t('tagline')}</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('componentsTitle')}</CardTitle>
            <CardDescription>{t('componentsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('stackTitle')}</CardTitle>
            <CardDescription>{t('stackDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Next.js 16</Badge>
            <Badge variant="secondary">React 19</Badge>
            <Badge variant="outline">Tailwind v4</Badge>
            <Badge variant="secondary">TypeScript</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
