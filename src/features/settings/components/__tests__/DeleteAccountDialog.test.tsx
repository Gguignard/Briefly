import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { DeleteAccountDialog } from '../DeleteAccountDialog'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock @clerk/nextjs
const mockSignOut = vi.fn()
vi.mock('@clerk/nextjs', () => ({
  useClerk: () => ({ signOut: mockSignOut }),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => (key: string) => key,
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders the trigger button', () => {
    render(<DeleteAccountDialog />)
    expect(screen.getByText('button')).toBeInTheDocument()
  })

  it('opens the dialog when trigger is clicked', async () => {
    render(<DeleteAccountDialog />)

    fireEvent.click(screen.getByText('button'))

    await waitFor(() => {
      expect(screen.getByText('dialog_title')).toBeInTheDocument()
      expect(screen.getByText('confirm')).toBeInTheDocument()
      expect(screen.getByText('cancel')).toBeInTheDocument()
    })
  })

  it('calls DELETE /api/account/delete then signOut and router.push on success', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    mockSignOut.mockResolvedValue(undefined)

    render(<DeleteAccountDialog />)

    fireEvent.click(screen.getByText('button'))
    await waitFor(() => expect(screen.getByText('confirm')).toBeInTheDocument())

    fireEvent.click(screen.getByText('confirm'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/account/delete', { method: 'DELETE' })
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/fr?deleted=true')
    })
  })

  it('shows error and does NOT signOut when DELETE request returns non-ok', async () => {
    mockFetch.mockResolvedValue({ ok: false })

    render(<DeleteAccountDialog />)

    fireEvent.click(screen.getByText('button'))
    await waitFor(() => expect(screen.getByText('confirm')).toBeInTheDocument())

    fireEvent.click(screen.getByText('confirm'))

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument()
    })

    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows error when fetch throws (network error)', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    render(<DeleteAccountDialog />)

    fireEvent.click(screen.getByText('button'))
    await waitFor(() => expect(screen.getByText('confirm')).toBeInTheDocument())

    fireEvent.click(screen.getByText('confirm'))

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument()
    })

    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not call signOut or router.push before fetch resolves', async () => {
    let resolveFetch!: (value: unknown) => void
    mockFetch.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve }))
    mockSignOut.mockResolvedValue(undefined)

    render(<DeleteAccountDialog />)

    fireEvent.click(screen.getByText('button'))
    await waitFor(() => expect(screen.getByText('confirm')).toBeInTheDocument())

    fireEvent.click(screen.getByText('confirm'))

    // Immediately after click — fetch not yet resolved
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()

    // Resolve fetch and verify side effects happen afterward
    resolveFetch({ ok: true })
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled())
    expect(mockPush).toHaveBeenCalledWith('/fr?deleted=true')
  })
})
