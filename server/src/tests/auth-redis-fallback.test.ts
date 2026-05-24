import { describe, it, expect, vi } from 'vitest'

process.env['SUPABASE_JWT_SECRET'] = 'test-secret-for-vitest-at-least-32-chars!!'

import { buildApp } from '../app.js'

const mockUser = {
  id: 'user-redis-fallback',
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
    signUploadUrl: vi.fn(),
  },
}))

vi.mock('../plugins/redis.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    redisPlugin: fp(async (app: any) => {
      app.decorate('redis', {
        status: 'end',
        get: vi.fn().mockRejectedValue(new Error('redis offline')),
        setex: vi.fn().mockRejectedValue(new Error('redis offline')),
        quit: vi.fn().mockResolvedValue(undefined),
      })
    }),
  }
})

describe('GET /auth/me when redis is unavailable', () => {
  it('falls back to prisma-backed auth instead of returning 401', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({
      sub: 'user-redis-fallback',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toMatchObject({
      userId: 'user-redis-fallback',
      role: 'CUSTOMER',
      providerId: null,
    })
    await app.close()
  })
})
