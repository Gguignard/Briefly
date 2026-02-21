import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Briefly</h1>
      <p className="text-muted-foreground">Résumez vos newsletters avec l&apos;IA</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Composants shadcn/ui</CardTitle>
            <CardDescription>Button, Card et Badge fonctionnels</CardDescription>
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
            <CardTitle>Stack technique</CardTitle>
            <CardDescription>Story 1.1 — Fondations</CardDescription>
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
