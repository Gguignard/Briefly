import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Lock } from 'lucide-react'
import Link from 'next/link'

export type PricingFeature = {
  label: string
  included: boolean
  locked?: boolean
}

type PricingCardProps = {
  tierName: string
  price: string
  features: PricingFeature[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
  popularLabel?: string
}

export function PricingCard({
  tierName,
  price,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  popularLabel,
}: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col ${
        highlighted
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-border'
      }`}
    >
      {popularLabel && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1"
          aria-label={`${tierName} - ${popularLabel}`}
        >
          {popularLabel}
        </Badge>
      )}
      <CardHeader className="text-center pb-2">
        <Badge variant={highlighted ? 'default' : 'secondary'} className="w-fit mx-auto mb-3">
          {tierName}
        </Badge>
        <CardTitle className="text-3xl font-bold">{price}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="border-t border-border mb-4" />
        <ul className="space-y-3 mb-6 flex-1" role="list">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check
                  className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              ) : (
                <Lock
                  className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  feature.included ? 'text-foreground' : 'text-muted-foreground'
                }
              >
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          variant={highlighted ? 'default' : 'outline'}
          size="lg"
          className="w-full"
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
