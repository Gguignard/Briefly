import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import GlobalError from '../global-error'

const mockCaptureException = vi.fn()
vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}))

describe('GlobalError', () => {
  afterEach(() => {
    cleanup()
    mockCaptureException.mockClear()
  })

  const baseError = new Error('Critical error')
  const mockReset = vi.fn()

  it('should render critical error heading', () => {
    render(<GlobalError error={baseError} reset={mockReset} />)
    expect(screen.getByText('Une erreur critique est survenue')).toBeDefined()
  })

  it('should render notification message', () => {
    render(<GlobalError error={baseError} reset={mockReset} />)
    expect(screen.getByText('Notre équipe a été notifiée.')).toBeDefined()
  })

  it('should render "Recharger" button that calls reset', () => {
    render(<GlobalError error={baseError} reset={mockReset} />)
    const reloadButton = screen.getByText('Recharger')
    fireEvent.click(reloadButton)
    expect(mockReset).toHaveBeenCalledOnce()
  })

  it('should call Sentry.captureException on mount', () => {
    render(<GlobalError error={baseError} reset={mockReset} />)
    expect(mockCaptureException).toHaveBeenCalledWith(baseError)
  })

  // Note: lang attribute on <html> and <meta viewport> in <head> cannot be tested
  // in jsdom — it strips these elements when rendered inside a container div.
  // Verify manually or via e2e tests.
})
