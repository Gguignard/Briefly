import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock BullMQ queues
vi.mock('@/lib/queue/email.queue', () => ({
  emailQueue: { name: 'email.process' },
}))
vi.mock('@/lib/queue/summary.queue', () => ({
  summaryQueue: { name: 'summary.generate' },
}))
vi.mock('@/lib/queue/cleanup.queue', () => ({
  cleanupQueue: { name: 'cleanup' },
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}))

// Track createBullBoard calls
const mockCreateBullBoard = vi.fn()
vi.mock('@bull-board/api', () => ({
  createBullBoard: (...args: unknown[]) => {
    mockCreateBullBoard(...args)
  },
}))

const bullMQAdapterInstances: { queue: unknown }[] = []
vi.mock('@bull-board/api/bullMQAdapter', () => ({
  BullMQAdapter: class MockBullMQAdapter {
    queue: unknown
    constructor(queue: unknown) {
      this.queue = queue
      bullMQAdapterInstances.push(this)
    }
  },
}))

const mockGetRouter = vi.fn().mockReturnValue(
  (_req: unknown, res: { status: (s: number) => { json: (d: unknown) => void } }) => {
    res.status(200).json({ ok: true })
  }
)
const mockSetBasePath = vi.fn()

vi.mock('@bull-board/express', () => ({
  ExpressAdapter: class MockExpressAdapter {
    setBasePath = mockSetBasePath
    getRouter = mockGetRouter
  },
}))

// Mock express to capture middleware
const mockUse = vi.fn()
const mockListen = vi.fn()
vi.mock('express', () => {
  const expressFactory = () => ({
    use: mockUse,
    listen: mockListen,
  })
  expressFactory.default = expressFactory
  return { default: expressFactory }
})

describe('bull-board', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    bullMQAdapterInstances.length = 0
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('creates Bull Board with all 3 queues', async () => {
    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    expect(bullMQAdapterInstances).toHaveLength(3)
    expect(bullMQAdapterInstances[0].queue).toEqual({ name: 'email.process' })
    expect(bullMQAdapterInstances[1].queue).toEqual({ name: 'summary.generate' })
    expect(bullMQAdapterInstances[2].queue).toEqual({ name: 'cleanup' })

    expect(mockCreateBullBoard).toHaveBeenCalledTimes(1)
    expect(mockCreateBullBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        queues: expect.arrayContaining([expect.anything(), expect.anything(), expect.anything()]),
      })
    )
  })

  it('sets base path to /queues', async () => {
    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    expect(mockSetBasePath).toHaveBeenCalledWith('/queues')
  })

  it('registers auth middleware and router on /queues path', async () => {
    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    // Express app.use should be called twice: auth middleware and router
    expect(mockUse).toHaveBeenCalledTimes(2)
    expect(mockUse.mock.calls[0][0]).toBe('/queues')
    expect(mockUse.mock.calls[1][0]).toBe('/queues')
  })

  it('auth middleware rejects wrong token when BULL_BOARD_TOKEN is set', async () => {
    process.env.BULL_BOARD_TOKEN = 'secret-token'

    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    // Extract auth middleware function
    const authMiddleware = mockUse.mock.calls[0][1] as (
      req: { query: Record<string, string>; headers: Record<string, string> },
      res: { status: (s: number) => { json: (d: unknown) => void } },
      next: () => void
    ) => void

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    const mockNext = vi.fn()

    authMiddleware({ query: { token: 'wrong' }, headers: {} }, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('auth middleware allows correct token via query param', async () => {
    process.env.BULL_BOARD_TOKEN = 'secret-token'

    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    const authMiddleware = mockUse.mock.calls[0][1] as (
      req: { query: Record<string, string>; headers: Record<string, string> },
      res: unknown,
      next: () => void
    ) => void

    const mockNext = vi.fn()
    authMiddleware({ query: { token: 'secret-token' }, headers: {} }, {}, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('auth middleware allows correct token via header', async () => {
    process.env.BULL_BOARD_TOKEN = 'secret-token'

    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    const authMiddleware = mockUse.mock.calls[0][1] as (
      req: { query: Record<string, string>; headers: Record<string, string> },
      res: unknown,
      next: () => void
    ) => void

    const mockNext = vi.fn()
    authMiddleware(
      { query: {}, headers: { 'x-bull-board-token': 'secret-token' } },
      {},
      mockNext
    )

    expect(mockNext).toHaveBeenCalled()
  })

  it('auth middleware allows all requests when no token configured', async () => {
    delete process.env.BULL_BOARD_TOKEN

    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    const authMiddleware = mockUse.mock.calls[0][1] as (
      req: { query: Record<string, string>; headers: Record<string, string> },
      res: unknown,
      next: () => void
    ) => void

    const mockNext = vi.fn()
    authMiddleware({ query: {}, headers: {} }, {}, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('startBullBoard listens on configured port', async () => {
    process.env.BULL_BOARD_PORT = '4000'

    const { startBullBoard } = await import('../bull-board')
    startBullBoard()

    expect(mockListen).toHaveBeenCalledWith(4000, expect.any(Function))
  })

  it('startBullBoard defaults to port 3001', async () => {
    delete process.env.BULL_BOARD_PORT

    const { startBullBoard } = await import('../bull-board')
    startBullBoard()

    expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function))
  })

  it('stopBullBoard closes the server handle', async () => {
    const mockClose = vi.fn((cb: () => void) => cb())
    mockListen.mockReturnValue({ close: mockClose })

    const { startBullBoard, stopBullBoard } = await import('../bull-board')
    startBullBoard()
    await stopBullBoard()

    expect(mockClose).toHaveBeenCalled()
  })

  it('stopBullBoard resolves immediately when no server started', async () => {
    const { stopBullBoard } = await import('../bull-board')
    await expect(stopBullBoard()).resolves.toBeUndefined()
  })

  it('auth middleware reads BULL_BOARD_TOKEN per-request for rotation support', async () => {
    process.env.BULL_BOARD_TOKEN = 'initial-token'

    const { createBullBoardServer } = await import('../bull-board')
    createBullBoardServer()

    const authMiddleware = mockUse.mock.calls[0][1] as (
      req: { query: Record<string, string>; headers: Record<string, string> },
      res: { status: (s: number) => { json: (d: unknown) => void } },
      next: () => void
    ) => void

    const mockNext = vi.fn()

    // Rotate token at runtime
    process.env.BULL_BOARD_TOKEN = 'rotated-token'

    // Old token should be rejected
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    authMiddleware({ query: { token: 'initial-token' }, headers: {} }, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockNext).not.toHaveBeenCalled()

    // New token should work
    const mockNext2 = vi.fn()
    authMiddleware({ query: { token: 'rotated-token' }, headers: {} }, {}, mockNext2)
    expect(mockNext2).toHaveBeenCalled()
  })
})
