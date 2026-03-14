import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMarkAsRead } from '../useMarkAsRead'

// Mock TanStack Query
const mockSetQueriesData = vi.fn()
const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueriesData: mockSetQueriesData,
    invalidateQueries: mockInvalidateQueries,
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useMarkAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ ok: true })
  })

  it('calls PATCH /api/summaries/:id/read', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/summaries/sum-1/read', {
      method: 'PATCH',
    })
  })

  it('performs optimistic update on summaries cache', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
    })

    expect(mockSetQueriesData).toHaveBeenCalledWith(
      { queryKey: ['summaries'] },
      expect.any(Function)
    )

    // Verify the updater function transforms data correctly
    const updater = mockSetQueriesData.mock.calls[0][1]
    const oldData = {
      data: {
        summaries: [
          { id: 'sum-1', read_at: null },
          { id: 'sum-2', read_at: null },
        ],
        unreadCount: 2,
      },
    }

    const newData = updater(oldData)
    expect(newData.data.summaries[0].read_at).not.toBeNull()
    expect(newData.data.summaries[1].read_at).toBeNull()
    expect(newData.data.unreadCount).toBe(1)
  })

  it('does not decrement unreadCount below 0', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
    })

    const updater = mockSetQueriesData.mock.calls[0][1]
    const oldData = {
      data: {
        summaries: [{ id: 'sum-1', read_at: null }],
        unreadCount: 0,
      },
    }

    const newData = updater(oldData)
    expect(newData.data.unreadCount).toBe(0)
  })

  it('preserves existing read_at if already set', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
    })

    const updater = mockSetQueriesData.mock.calls[0][1]
    const existingDate = '2026-01-01T00:00:00Z'
    const oldData = {
      data: {
        summaries: [{ id: 'sum-1', read_at: existingDate }],
        unreadCount: 0,
      },
    }

    const newData = updater(oldData)
    expect(newData.data.summaries[0].read_at).toBe(existingDate)
  })

  it('returns old data unchanged when structure is unexpected', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
    })

    const updater = mockSetQueriesData.mock.calls[0][1]
    const weirdData = { something: 'else' }
    expect(updater(weirdData)).toBe(weirdData)
  })

  it('only calls markAsRead once (idempotent guard)', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
      await result.current.markAsRead()
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('does not decrement unreadCount when summary is already read', async () => {
    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
    })

    const updater = mockSetQueriesData.mock.calls[0][1]
    const oldData = {
      data: {
        summaries: [{ id: 'sum-1', read_at: '2026-01-01T00:00:00Z' }],
        unreadCount: 3,
      },
    }

    const newData = updater(oldData)
    expect(newData.data.unreadCount).toBe(3)
  })

  it('invalidates queries on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['summaries'],
    })
  })

  it('invalidates queries on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useMarkAsRead('sum-1'))

    await act(async () => {
      await result.current.markAsRead()
      // Allow the catch to execute
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['summaries'],
    })
  })
})
