import { describe, it, expect, vi } from 'vitest'

process.env['SUPABASE_JWT_SECRET'] = 'test-secret-for-vitest-at-least-32-chars!!'
process.env['NODE_ENV'] = 'development'
process.env['SUPABASE_URL'] = 'https://example.supabase.co'
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key'

import { buildApp } from '../app.js'

const customerUser = {
  id: 'demo-customer-id',
  phone: '+639171999999',
  role: 'CUSTOMER' as const,
  provider: null,
}

const providerUser = {
  id: 'demo-provider-user-id',
  phone: '+639171000001',
  role: 'PROVIDER' as const,
  provider: { id: 'demo-provider-id' },
}

vi.mock('../plugins/prisma.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    prismaPlugin: fp(async (app: any) => {
      app.decorate('prisma', {
        user: {
          findUnique: vi.fn().mockImplementation(({ where }: any) => {
            if (where.phone === customerUser.phone) return Promise.resolve(customerUser)
            if (where.phone === providerUser.phone) return Promise.resolve(providerUser)
            return Promise.resolve(null)
          }),
          upsert: vi.fn(),
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
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1),
        quit: vi.fn().mockResolvedValue(undefined),
      })
    }),
  }
})

describe('POST /auth/dev-login', () => {
  it('returns a token and customer session for the demo customer identity', async () => {
    const app = buildApp()
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/auth/dev-login',
      payload: { identity: 'customer' },
    })

    await app.close()
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toMatchObject({
      userId: customerUser.id,
      role: 'CUSTOMER',
      providerId: null,
    })
  })

  it('returns a token and provider session for the demo provider identity', async () => {
    const app = buildApp()
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/auth/dev-login',
      payload: { identity: 'provider' },
    })

    await app.close()
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toMatchObject({
      userId: providerUser.id,
      role: 'PROVIDER',
      providerId: 'demo-provider-id',
    })
  })
})
