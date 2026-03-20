import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import ContactPage from '../page'

// Mock next-intl
const translations: Record<string, string> = {
  title: 'Contactez-nous',
  placeholder_name: 'Votre nom',
  placeholder_email: 'Votre email',
  placeholder_subject: 'Sujet',
  placeholder_message: 'Votre message (min. 10 caractères)',
  submit: 'Envoyer le message',
  submitting: 'Envoi...',
  success_title: 'Message envoyé !',
  success_message: 'Nous vous répondrons sous 48h.',
  error_name: 'Le nom est requis',
  error_email: 'Email invalide',
  error_subject: 'Le sujet est requis',
  error_message: 'Le message doit faire au moins 10 caractères',
  error_rate_limit: 'Trop de messages envoyés.',
  error_generic: 'Une erreur est survenue.',
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => translations[key] ?? key,
}))

// Mock Clerk useUser
const mockUseUser = vi.fn()
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  CheckCircle2: (props: Record<string, unknown>) => <svg data-testid="check-icon" {...props} />,
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.mockReturnValue({ user: null })
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { sent: true }, error: null }),
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('affiche le formulaire avec tous les champs', () => {
    render(<ContactPage />)
    expect(screen.getByText('Contactez-nous')).toBeDefined()
    expect(screen.getByPlaceholderText('Votre nom')).toBeDefined()
    expect(screen.getByPlaceholderText('Votre email')).toBeDefined()
    expect(screen.getByPlaceholderText('Sujet')).toBeDefined()
    expect(screen.getByPlaceholderText('Votre message (min. 10 caractères)')).toBeDefined()
    expect(screen.getByText('Envoyer le message')).toBeDefined()
  })

  it('pré-remplit l\'email si l\'utilisateur est connecté (AC6)', () => {
    mockUseUser.mockReturnValue({
      user: {
        primaryEmailAddress: { emailAddress: 'greg@example.com' },
      },
    })
    render(<ContactPage />)
    const emailInput = screen.getByPlaceholderText('Votre email') as HTMLInputElement
    expect(emailInput.value).toBe('greg@example.com')
  })

  it('laisse l\'email vide si l\'utilisateur n\'est pas connecté', () => {
    mockUseUser.mockReturnValue({ user: null })
    render(<ContactPage />)
    const emailInput = screen.getByPlaceholderText('Votre email') as HTMLInputElement
    expect(emailInput.value).toBe('')
  })

  it('soumet le formulaire et affiche la confirmation (AC4)', async () => {
    render(<ContactPage />)

    fireEvent.input(screen.getByPlaceholderText('Votre nom'), { target: { value: 'Jean' } })
    fireEvent.input(screen.getByPlaceholderText('Votre email'), { target: { value: 'jean@test.com' } })
    fireEvent.input(screen.getByPlaceholderText('Sujet'), { target: { value: 'Question' } })
    fireEvent.input(screen.getByPlaceholderText('Votre message (min. 10 caractères)'), {
      target: { value: 'Bonjour, ceci est un message de test.' },
    })

    fireEvent.click(screen.getByText('Envoyer le message'))

    await waitFor(() => {
      expect(screen.getByText('Message envoyé !')).toBeDefined()
      expect(screen.getByText('Nous vous répondrons sous 48h.')).toBeDefined()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jean',
        email: 'jean@test.com',
        subject: 'Question',
        message: 'Bonjour, ceci est un message de test.',
      }),
    })
  })

  it('affiche une erreur rate limit traduite', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        data: null,
        error: { code: 'RATE_LIMIT', message: 'Too many messages sent.' },
      }),
    })

    render(<ContactPage />)

    fireEvent.input(screen.getByPlaceholderText('Votre nom'), { target: { value: 'Jean' } })
    fireEvent.input(screen.getByPlaceholderText('Votre email'), { target: { value: 'jean@test.com' } })
    fireEvent.input(screen.getByPlaceholderText('Sujet'), { target: { value: 'Question' } })
    fireEvent.input(screen.getByPlaceholderText('Votre message (min. 10 caractères)'), {
      target: { value: 'Bonjour, ceci est un message de test.' },
    })

    fireEvent.click(screen.getByText('Envoyer le message'))

    await waitFor(() => {
      expect(screen.getByText('Trop de messages envoyés.')).toBeDefined()
    })
  })

  it('affiche une erreur générique si la réponse n\'est pas du JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => { throw new Error('not json') },
    })

    render(<ContactPage />)

    fireEvent.input(screen.getByPlaceholderText('Votre nom'), { target: { value: 'Jean' } })
    fireEvent.input(screen.getByPlaceholderText('Votre email'), { target: { value: 'jean@test.com' } })
    fireEvent.input(screen.getByPlaceholderText('Sujet'), { target: { value: 'Question' } })
    fireEvent.input(screen.getByPlaceholderText('Votre message (min. 10 caractères)'), {
      target: { value: 'Bonjour, ceci est un message de test.' },
    })

    fireEvent.click(screen.getByText('Envoyer le message'))

    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue.')).toBeDefined()
    })
  })

  it('affiche le bouton submit désactivé pendant la soumission', async () => {
    // Make fetch hang to observe submitting state
    let resolvePromise!: (value: unknown) => void
    mockFetch.mockReturnValueOnce(new Promise((resolve) => { resolvePromise = resolve }))

    render(<ContactPage />)

    fireEvent.input(screen.getByPlaceholderText('Votre nom'), { target: { value: 'Jean' } })
    fireEvent.input(screen.getByPlaceholderText('Votre email'), { target: { value: 'jean@test.com' } })
    fireEvent.input(screen.getByPlaceholderText('Sujet'), { target: { value: 'Question' } })
    fireEvent.input(screen.getByPlaceholderText('Votre message (min. 10 caractères)'), {
      target: { value: 'Bonjour, ceci est un message de test.' },
    })

    fireEvent.click(screen.getByText('Envoyer le message'))

    await waitFor(() => {
      const button = screen.getByText('Envoi...') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })

    // Resolve to clean up
    resolvePromise({ ok: true, json: () => Promise.resolve({ data: { sent: true }, error: null }) })
  })
})
