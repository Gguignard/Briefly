import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Resend
const mockSend = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))


function createRequest(body: unknown, ip = '127.0.0.1') {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

const validBody = {
  name: 'Jean Dupont',
  email: 'jean@example.com',
  subject: 'Question sur Briefly',
  message: 'Bonjour, je voudrais en savoir plus sur votre service.',
}

describe('POST /api/contact', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({ id: 'msg_123' })

    // Reset rate limiter between tests by re-importing the module
    vi.resetModules()
  })

  async function getRoute() {
    const mod = await import('../route')
    return mod.POST
  }

  it('envoie un email avec des données valides', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toEqual({ sent: true })
    expect(mockSend).toHaveBeenCalledWith({
      from: 'Briefly Contact <noreply@briefly.app>',
      to: 'support@briefly.app',
      replyTo: 'jean@example.com',
      subject: '[Support] Question sur Briefly',
      text: 'De: Jean Dupont (jean@example.com)\n\nBonjour, je voudrais en savoir plus sur votre service.',
    })
  })

  it('retourne 400 si le nom est vide', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({ ...validBody, name: '' }))

    expect(res.status).toBe(400)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('retourne 400 si email invalide', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({ ...validBody, email: 'not-an-email' }))

    expect(res.status).toBe(400)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('retourne 400 si message trop court (< 10 chars)', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({ ...validBody, message: 'Court' }))

    expect(res.status).toBe(400)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('retourne 400 si sujet manquant', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({ ...validBody, subject: '' }))

    expect(res.status).toBe(400)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('retourne 400 si JSON invalide', async () => {
    const POST = await getRoute()
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.1',
      },
      body: 'not json{',
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('retourne 429 après 3 messages valides depuis la même IP', async () => {
    const POST = await getRoute()
    const ip = '192.168.1.100'

    await POST(createRequest(validBody, ip))
    await POST(createRequest(validBody, ip))
    await POST(createRequest(validBody, ip))
    const res = await POST(createRequest(validBody, ip))

    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error.code).toBe('RATE_LIMIT')
  })

  it('ne compte pas les requêtes invalides dans le rate limit', async () => {
    const POST = await getRoute()
    const ip = '192.168.1.200'

    // 3 invalid requests should NOT count
    await POST(createRequest({ ...validBody, name: '' }, ip))
    await POST(createRequest({ ...validBody, name: '' }, ip))
    await POST(createRequest({ ...validBody, name: '' }, ip))

    // Valid request should still succeed
    const res = await POST(createRequest(validBody, ip))
    expect(res.status).toBe(200)
  })

  it('parse le premier IP de la chaîne x-forwarded-for', async () => {
    const POST = await getRoute()
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '1.2.3.4, 10.0.0.1, 172.16.0.1',
      },
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('autorise les requêtes depuis des IPs différentes', async () => {
    const POST = await getRoute()

    const res1 = await POST(createRequest(validBody, '10.0.0.1'))
    const res2 = await POST(createRequest(validBody, '10.0.0.2'))

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
  })

  it('retourne 500 si Resend échoue', async () => {
    mockSend.mockRejectedValueOnce(new Error('Resend API error'))
    const POST = await getRoute()
    const res = await POST(createRequest(validBody, '10.0.0.50'))

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })

  it('valide la longueur max du nom (100 chars)', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({
      ...validBody,
      name: 'a'.repeat(101),
    }, '10.0.0.60'))

    expect(res.status).toBe(400)
  })

  it('valide la longueur max du sujet (200 chars)', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({
      ...validBody,
      subject: 'a'.repeat(201),
    }, '10.0.0.70'))

    expect(res.status).toBe(400)
  })

  it('valide la longueur max du message (2000 chars)', async () => {
    const POST = await getRoute()
    const res = await POST(createRequest({
      ...validBody,
      message: 'a'.repeat(2001),
    }, '10.0.0.80'))

    expect(res.status).toBe(400)
  })
})
