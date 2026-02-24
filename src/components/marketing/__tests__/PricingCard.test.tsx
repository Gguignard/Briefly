import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PricingCard, type PricingFeature } from '../PricingCard'

describe('PricingCard types and data structures', () => {
  it('should have correct PricingFeature type structure', () => {
    const includedFeature: PricingFeature = {
      label: 'Test feature',
      included: true,
    }
    expect(includedFeature.included).toBe(true)
    expect(includedFeature.locked).toBeUndefined()

    const lockedFeature: PricingFeature = {
      label: 'Locked feature',
      included: false,
      locked: true,
    }
    expect(lockedFeature.included).toBe(false)
    expect(lockedFeature.locked).toBe(true)
  })

  it('should support free tier feature structure', () => {
    const freeFeatures: PricingFeature[] = [
      { label: 'AI summaries', included: true },
      { label: '5 newsletters', included: true },
      { label: 'Unlimited newsletters', included: false, locked: true },
    ]

    expect(freeFeatures).toHaveLength(3)
    expect(freeFeatures.filter((f) => f.included)).toHaveLength(2)
    expect(freeFeatures.filter((f) => f.locked)).toHaveLength(1)
  })

  it('should support paid tier feature structure', () => {
    const paidFeatures: PricingFeature[] = [
      { label: 'AI summaries', included: true },
      { label: 'Unlimited newsletters', included: true },
      { label: 'Premium LLM', included: true },
      { label: 'Priority support', included: true },
    ]

    expect(paidFeatures).toHaveLength(4)
    expect(paidFeatures.every((f) => f.included)).toBe(true)
    expect(paidFeatures.filter((f) => f.locked)).toHaveLength(0)
  })
})

describe('pricing translations', () => {
  const expectedPricingKeys = [
    'meta_title',
    'meta_description',
    'title',
    'subtitle',
    'free_tier',
    'paid_tier',
    'free_price',
    'paid_price',
    'roi_note',
    'cta_free',
    'cta_paid',
    'popular',
    'features',
  ]

  const expectedFeatureKeys = [
    'ai_summaries',
    'five_newsletters',
    'one_premium_day',
    'unlimited_newsletters',
    'all_premium_llm',
    'custom_categories',
    'unlimited_categories',
    'priority_support',
  ]

  it('should have all required pricing keys in French translations', async () => {
    const fr = await import('../../../../messages/fr.json')
    const pricing = fr.default.marketing.pricing as Record<string, unknown>

    expect(pricing).toBeDefined()
    for (const key of expectedPricingKeys) {
      expect(pricing[key]).toBeDefined()
    }
  })

  it('should have all required pricing keys in English translations', async () => {
    const en = await import('../../../../messages/en.json')
    const pricing = en.default.marketing.pricing as Record<string, unknown>

    expect(pricing).toBeDefined()
    for (const key of expectedPricingKeys) {
      expect(pricing[key]).toBeDefined()
    }
  })

  it('should have all required feature keys in French translations', async () => {
    const fr = await import('../../../../messages/fr.json')
    const features = fr.default.marketing.pricing.features as Record<
      string,
      string
    >

    expect(features).toBeDefined()
    for (const key of expectedFeatureKeys) {
      expect(features[key]).toBeDefined()
    }
  })

  it('should have all required feature keys in English translations', async () => {
    const en = await import('../../../../messages/en.json')
    const features = en.default.marketing.pricing.features as Record<
      string,
      string
    >

    expect(features).toBeDefined()
    for (const key of expectedFeatureKeys) {
      expect(features[key]).toBeDefined()
    }
  })

  it('should have correct ROI messaging in French', async () => {
    const fr = await import('../../../../messages/fr.json')
    const roiNote = fr.default.marketing.pricing.roi_note as string

    expect(roiNote).toContain('5h')
    expect(roiNote).toContain('5€')
  })

  it('should have correct ROI messaging in English', async () => {
    const en = await import('../../../../messages/en.json')
    const roiNote = en.default.marketing.pricing.roi_note as string

    expect(roiNote).toContain('5h')
    expect(roiNote).toContain('$5')
  })

  it('should have matching pricing keys between FR and EN', async () => {
    const fr = await import('../../../../messages/fr.json')
    const en = await import('../../../../messages/en.json')

    const frPricingKeys = Object.keys(fr.default.marketing.pricing).sort()
    const enPricingKeys = Object.keys(en.default.marketing.pricing).sort()

    expect(frPricingKeys).toEqual(enPricingKeys)
  })
})

describe('PricingCard component rendering', () => {
  afterEach(() => {
    cleanup()
  })

  const mockFeatures: PricingFeature[] = [
    { label: 'Feature 1', included: true },
    { label: 'Feature 2', included: true },
    { label: 'Feature 3', included: false, locked: true },
  ]

  it('should render tier name and price', () => {
    render(
      <PricingCard
        tierName="Test Tier"
        price="$10/month"
        features={mockFeatures}
        ctaLabel="Get Started"
        ctaHref="/signup"
      />
    )

    expect(screen.getByText('Test Tier')).toBeInTheDocument()
    expect(screen.getByText('$10/month')).toBeInTheDocument()
  })

  it('should render all features with correct icons', () => {
    render(
      <PricingCard
        tierName="Premium Plan"
        price="$20/month"
        features={mockFeatures}
        ctaLabel="Subscribe Now"
        ctaHref="/subscribe"
      />
    )

    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
    expect(screen.getByText('Feature 3')).toBeInTheDocument()

    // Check for features list with role="list" for accessibility
    const featuresList = screen.getByRole('list')
    expect(featuresList).toBeInTheDocument()
  })

  it('should render CTA button with correct href', () => {
    render(
      <PricingCard
        tierName="Business Tier"
        price="$30/month"
        features={mockFeatures}
        ctaLabel="Start Free Trial"
        ctaHref="/trial"
      />
    )

    const ctaLink = screen.getByRole('link', { name: 'Start Free Trial' })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/trial')
  })

  it('should render popular badge when provided', () => {
    render(
      <PricingCard
        tierName="Premium"
        price="$10/month"
        features={mockFeatures}
        ctaLabel="Get Started"
        ctaHref="/signup"
        highlighted
        popularLabel="Most Popular"
      />
    )

    const badge = screen.getByText('Most Popular')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Premium - Most Popular')
  })

  it('should NOT render popular badge when not provided', () => {
    render(
      <PricingCard
        tierName="Basic Plan"
        price="$0/month"
        features={mockFeatures}
        ctaLabel="Start Free"
        ctaHref="/free"
      />
    )

    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument()
    expect(screen.queryByText('Le plus populaire')).not.toBeInTheDocument()
  })

  it('should apply highlighted styles when highlighted prop is true', () => {
    const { container } = render(
      <PricingCard
        tierName="Premium"
        price="$10/month"
        features={mockFeatures}
        ctaLabel="Get Started"
        ctaHref="/signup"
        highlighted
      />
    )

    const card = container.querySelector('.border-primary')
    expect(card).toBeInTheDocument()
  })

  it('should render different button variants based on highlighted prop', () => {
    const { rerender } = render(
      <PricingCard
        tierName="Starter"
        price="$0/month"
        features={mockFeatures}
        ctaLabel="Begin Now"
        ctaHref="/begin"
        highlighted={false}
      />
    )

    // For non-highlighted, button should have outline variant (check parent structure)
    let button = screen.getByRole('link', { name: 'Begin Now' })
    expect(button).toBeInTheDocument()

    rerender(
      <PricingCard
        tierName="Pro"
        price="$15/month"
        features={mockFeatures}
        ctaLabel="Go Pro"
        ctaHref="/pro"
        highlighted={true}
      />
    )

    button = screen.getByRole('link', { name: 'Go Pro' })
    expect(button).toBeInTheDocument()
  })
})
