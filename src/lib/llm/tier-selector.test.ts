import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLLMTierForUser } from './tier-selector'

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockGte = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function setupChain(result: { count: number | null; error?: null } | { count: null; error: { message: string } }) {
  mockFrom.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValueOnce({ eq: mockEq })
  mockEq.mockReturnValueOnce({ gte: mockGte })
  mockGte.mockResolvedValue(result)
}

describe('getLLMTierForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne premium pour les utilisateurs paid (sans requête DB)', async () => {
    const result = await getLLMTierForUser('user-1', 'paid')
    expect(result).toBe('premium')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('retourne premium pour un utilisateur free avec 0 résumé premium aujourd\'hui', async () => {
    setupChain({ count: 0, error: null })
    const result = await getLLMTierForUser('user-1', 'free')
    expect(result).toBe('premium')
  })

  it('retourne premium quand count est null (aucun résumé)', async () => {
    setupChain({ count: null, error: null })
    const result = await getLLMTierForUser('user-1', 'free')
    expect(result).toBe('premium')
  })

  it('retourne basic pour un utilisateur free avec 1+ résumé premium aujourd\'hui', async () => {
    setupChain({ count: 1, error: null })
    const result = await getLLMTierForUser('user-1', 'free')
    expect(result).toBe('basic')
  })

  it('retourne basic pour un utilisateur free avec plusieurs résumés premium', async () => {
    setupChain({ count: 5, error: null })
    const result = await getLLMTierForUser('user-1', 'free')
    expect(result).toBe('basic')
  })

  it('vérifie les arguments de la requête Supabase (table, userId, llm_tier, date UTC)', async () => {
    setupChain({ count: 0, error: null })
    await getLLMTierForUser('user-42', 'free')

    expect(mockFrom).toHaveBeenCalledWith('summaries')
    expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true })
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-42')
    expect(mockEq).toHaveBeenCalledWith('llm_tier', 'premium')

    // Vérifier que la date passée à gte est bien minuit UTC du jour
    const gteCall = mockGte.mock.calls[0]
    expect(gteCall[0]).toBe('generated_at')
    const dateArg = new Date(gteCall[1])
    expect(dateArg.getUTCHours()).toBe(0)
    expect(dateArg.getUTCMinutes()).toBe(0)
    expect(dateArg.getUTCSeconds()).toBe(0)
    expect(dateArg.getUTCMilliseconds()).toBe(0)
  })

  it('retourne basic (fail-closed) en cas d\'erreur Supabase', async () => {
    setupChain({ count: null, error: { message: 'connection refused' } })
    const result = await getLLMTierForUser('user-1', 'free')
    expect(result).toBe('basic')
  })
})
