import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => {
    const translations: Record<string, string> = {
      title: 'Queue Monitoring',
      description: 'Bull Board dashboard for monitoring BullMQ jobs.',
      openExternal: 'Open in new tab',
      notConfigured: 'Bull Board is not configured. Set BULL_BOARD_URL in your environment variables.',
    }
    return translations[key] ?? key
  }),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ExternalLink: () => <span data-testid="external-link-icon" />,
}))

describe('AdminQueuesPage', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    cleanup()
    process.env = originalEnv
  })

  it('shows not configured message when BULL_BOARD_URL is not set', async () => {
    delete process.env.BULL_BOARD_URL

    const { default: AdminQueuesPage } = await import('../page')
    const result = await AdminQueuesPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Queue Monitoring')).toBeInTheDocument()
    expect(
      screen.getByText('Bull Board is not configured. Set BULL_BOARD_URL in your environment variables.')
    ).toBeInTheDocument()
    expect(screen.queryByTitle('Bull Board')).not.toBeInTheDocument()
  })

  it('renders iframe when BULL_BOARD_URL is set', async () => {
    process.env.BULL_BOARD_URL = 'http://localhost:3001/queues'

    const { default: AdminQueuesPage } = await import('../page')
    const result = await AdminQueuesPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Queue Monitoring')).toBeInTheDocument()
    const iframe = screen.getByTitle('Bull Board')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', 'http://localhost:3001/queues')
  })

  it('appends token to iframe URL but not to external link', async () => {
    process.env.BULL_BOARD_URL = 'http://localhost:3001/queues'
    process.env.BULL_BOARD_TOKEN = 'my-secret'

    const { default: AdminQueuesPage } = await import('../page')
    const result = await AdminQueuesPage()
    render(result as React.ReactElement)

    const iframe = screen.getByTitle('Bull Board')
    expect(iframe).toHaveAttribute('src', 'http://localhost:3001/queues?token=my-secret')

    // External link should NOT contain the token
    const link = screen.getByText('Open in new tab')
    expect(link).toHaveAttribute('href', 'http://localhost:3001/queues')
  })

  it('renders external link to Bull Board', async () => {
    process.env.BULL_BOARD_URL = 'http://localhost:3001/queues'

    const { default: AdminQueuesPage } = await import('../page')
    const result = await AdminQueuesPage()
    render(result as React.ReactElement)

    const link = screen.getByText('Open in new tab')
    expect(link).toHaveAttribute('href', 'http://localhost:3001/queues')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows not configured message when BULL_BOARD_URL is invalid', async () => {
    process.env.BULL_BOARD_URL = 'not-a-valid-url'

    const { default: AdminQueuesPage } = await import('../page')
    const result = await AdminQueuesPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Queue Monitoring')).toBeInTheDocument()
    expect(
      screen.getByText('Bull Board is not configured. Set BULL_BOARD_URL in your environment variables.')
    ).toBeInTheDocument()
    expect(screen.queryByTitle('Bull Board')).not.toBeInTheDocument()
  })

  it('renders description text', async () => {
    process.env.BULL_BOARD_URL = 'http://localhost:3001/queues'

    const { default: AdminQueuesPage } = await import('../page')
    const result = await AdminQueuesPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Bull Board dashboard for monitoring BullMQ jobs.')).toBeInTheDocument()
  })
})
