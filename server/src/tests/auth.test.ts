import { describe, it, expect, vi } from 'vitest'

process.env['SUPABASE_JWT_SECRET'] = 'test-secret-for-vitest-at-least-32-chars!!'

import { buildApp } from '../app.js'

const mockUser = {
  id: 'user-1',
  phone: '+639171234567',
  role: 'CUSTOMER' as const,
  provider: null,
  updatedAt: new Date(),
}

vi.mock('../plugins/prisma.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    prismaPlugin: fp(async (app: any) => {
      app.decorate('prisma', {
        user: {
          upsert: vi.fn().mockResolvedValue({ ...mockUser, provider: null }),
        },
      })
    }),
  }
})

vi.mock('../services/uploads.service.js', () => ({
  UploadsService: {
    uploadAvatar: vi.fn(),
  },
}))

vi.mock('../plugins/redis.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    redisPlugin: fp(async (app: any) => {
      app.decorate('redis', {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue('OK'),
        quit: vi.fn().mockResolvedValue(undefined),
      })
    }),
  }
})

describe('GET /auth/me', () => {
  it('returns 401 without a token', async () => {
    const app = buildApp()
    await app.ready()
    const res = await app.inject({ method: 'GET', url: '/auth/me' })
    expect(res.statusCode).toBe(401)
    await app.close()
  })

  it('returns userId, role, and providerId with a valid token', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body).toMatchObject({ userId: 'user-1', role: 'CUSTOMER', providerId: null })
    await app.close()
  })
})
