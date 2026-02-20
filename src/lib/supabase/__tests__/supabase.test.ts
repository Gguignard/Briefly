import { describe, it, expect, beforeAll } from 'vitest'
import { createClient as createBrowserClient } from '../client'
import { createAdminClient } from '../admin'

// Set required env vars for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  process.env.SUPABASE_SERVICE_ROLE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
})

describe('Supabase Client (Browser)', () => {
  it('should create a browser client', () => {
    const client = createBrowserClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(client.from).toBeDefined()
  })

  it('should have correct configuration', () => {
    const client = createBrowserClient()
    // Verify the client is configured with the right URL
    expect(client.supabaseUrl).toBe('http://127.0.0.1:54321')
  })
})

describe('Supabase Admin Client', () => {
  it('should create an admin client', () => {
    const client = createAdminClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(client.from).toBeDefined()
  })

  it('should have correct configuration', () => {
    const client = createAdminClient()
    // Verify the client is configured with the right URL
    expect(client.supabaseUrl).toBe('http://127.0.0.1:54321')
  })

  it('should bypass RLS with service role key', () => {
    const client = createAdminClient()
    // The admin client should be using the service role key
    // which bypasses RLS
    expect(client).toBeDefined()
  })
})

describe('Supabase Database Connection', () => {
  it('should connect to users table', async () => {
    const client = createAdminClient()
    const { data, error } = await client.from('users').select('clerk_id, email, tier').limit(10)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })

  it('should have seeded data', async () => {
    const client = createAdminClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .in('clerk_id', ['user_test_001', 'user_test_002'])

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data?.length).toBe(2)

    const testUser = data?.find((u) => u.clerk_id === 'user_test_001')
    expect(testUser).toBeDefined()
    expect(testUser?.email).toBe('test@example.com')
    expect(testUser?.tier).toBe('free')

    const proUser = data?.find((u) => u.clerk_id === 'user_test_002')
    expect(proUser).toBeDefined()
    expect(proUser?.email).toBe('pro@example.com')
    expect(proUser?.tier).toBe('pro')
  })
})

describe('Supabase RLS (Row Level Security)', () => {
  it('should enforce RLS on users table', async () => {
    // Using anon client (not admin) without auth should return empty
    const client = createBrowserClient()
    const { data, error } = await client.from('users').select('*')

    // With RLS enabled and no authenticated user, should return empty array
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data?.length).toBe(0)
  })

  it('should allow admin client to bypass RLS', async () => {
    const client = createAdminClient()
    const { data, error } = await client.from('users').select('*')

    // Admin client should bypass RLS and see all users
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data!.length).toBeGreaterThan(0)
  })
})
