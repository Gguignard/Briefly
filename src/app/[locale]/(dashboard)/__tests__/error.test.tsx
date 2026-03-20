import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DashboardError from '../error'

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

const mockCaptureException = vi.fn()
vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}))

const mockUseLocale = vi.fn()
vi.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
}))

describe('DashboardError (500)', () => {
  afterEach(() => {
    cleanup()
    mockCaptureException.mockClear()
  })

  beforeEach(() => {
    mockUseLocale.mockReturnValue('fr')
  })

  const baseError = new Error('Test error') as Error & { digest?: string }
  const mockReset = vi.fn()

  it('should render 500 code', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    expect(screen.getByText('500')).toBeDefined()
  })

  it('should render error heading', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    expect(screen.getByText('Une erreur est survenue')).toBeDefined()
  })

  it('should render descriptive message', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    expect(screen.getByText("Quelque chose s'est mal passé. Notre équipe a été notifiée.")).toBeDefined()
  })

  it('should render "Recharger" button that calls reset', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    const reloadButton = screen.getByText('Recharger')
    fireEvent.click(reloadButton)
    expect(mockReset).toHaveBeenCalledOnce()
  })

  it('should render "Retour aux résumés" button', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    expect(screen.getByText('Retour aux résumés')).toBeDefined()
  })

  it('should call Sentry.captureException on mount', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    expect(mockCaptureException).toHaveBeenCalledWith(baseError)
  })

  it('should display error digest when present', () => {
    const errorWithDigest = Object.assign(new Error('Test'), { digest: 'abc123' })
    render(<DashboardError error={errorWithDigest} reset={mockReset} />)
    expect(screen.getByText('Référence : abc123')).toBeDefined()
  })

  it('should not display digest when absent', () => {
    render(<DashboardError error={baseError} reset={mockReset} />)
    expect(screen.queryByText(/Référence/)).toBeNull()
  })

  it('should use locale from useLocale for navigation', () => {
    mockUseLocale.mockReturnValue('en')
    const assignMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    render(<DashboardError error={baseError} reset={mockReset} />)
    const retourButton = screen.getByText('Retour aux résumés')
    fireEvent.click(retourButton)
    expect(window.location.href).toBe('/en/summaries')
  })
})
