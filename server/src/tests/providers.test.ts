import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { ProvidersService } from '../services/providers.service.js'
import type { ProviderFeedQuery } from '@favour/shared'
import type { buildApp as buildAppType } from '../app.js'

process.env['SUPABASE_JWT_SECRET'] = 'test-secret-for-vitest-at-least-32-chars!!'
process.env['SUPABASE_URL'] = 'https://example.supabase.co'
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key'

const mockRepo = {
  findMany: vi.fn(),
  findById: vi.fn(),
}

const mockCreatedProvider = {
  id: 'provider-1',
  userId: 'user-provider',
  type: 'FREELANCER',
  displayName: 'Kuya Jose',
  bio: null,
  city: 'Batangas City',
  isVerified: false,
  photos: [],
  services: [
    {
      id: 'svc-1',
      name: 'Aircon Cleaning',
      category: 'aircon',
      priceMin: 500,
      priceMax: 1500,
      providerId: 'provider-1',
      createdAt: new Date(),
    },
  ],
  favourScore: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

let upsertResult: any = {
  id: 'user-provider',
  phone: '+639171234567',
  role: 'PROVIDER' as const,
  provider: null,
  updatedAt: new Date(),
}

const mockTx = {
  provider: { create: vi.fn().mockResolvedValue(mockCreatedProvider) },
}

vi.mock('../plugins/prisma.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    prismaPlugin: fp(async (app: any) => {
      app.decorate('prisma', {
        user: {
          upsert: vi.fn().mockImplementation(() => Promise.resolve(upsertResult)),
        },
        $transaction: vi.fn().mockImplementation(async (fn: any) => fn(mockTx)),
      })
    }),
  }
})

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

const validBody = {
  type: 'FREELANCER',
  displayName: 'Kuya Jose',
  city: 'Batangas City',
  services: [{ name: 'Aircon Cleaning', category: 'aircon', priceMin: 500, priceMax: 1500 }],
}

let buildApp: typeof buildAppType

beforeAll(async () => {
  buildApp = (await import('../app.js')).buildApp
})

describe('ProvidersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns providers filtered by category', async () => {
    mockRepo.findMany.mockResolvedValue([])
    const query: ProviderFeedQuery = { category: 'aircon', type: 'all', page: 1, limit: 10 }
    const result = await ProvidersService.getFeed(query, mockRepo as any)
    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'aircon' })
    )
    expect(result).toEqual([])
  })

  it('returns a single provider by id', async () => {
    const fake = { id: 'p1', displayName: 'Kuya Marco' }
    mockRepo.findById.mockResolvedValue(fake)
    const result = await ProvidersService.getById('p1', mockRepo as any)
    expect(result).toEqual(expect.objectContaining(fake))
  })

  it('maps provider detail services with providerId, duration, and verified status', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'provider-1',
      displayName: 'Kuya Jose',
      type: 'FREELANCER',
      city: 'Batangas City',
      isVerified: true,
      photos: [],
      services: [
        {
          id: 'svc-1',
          providerId: 'provider-1',
          name: 'Aircon Cleaning',
          category: 'aircon',
          priceMin: 500,
          priceMax: 1500,
          duration: '60 min',
        },
      ],
      favourScore: { overall: 4.8, responseRate: 0.91 },
      reviewsReceived: [{}],
    })

    const result = await ProvidersService.getById('provider-1', mockRepo as any)

    expect(result).toEqual(
      expect.objectContaining({
        isVerified: true,
        services: [
          {
            id: 'svc-1',
            providerId: 'provider-1',
            name: 'Aircon Cleaning',
            category: 'aircon',
            priceMin: 500,
            priceMax: 1500,
            duration: '60 min',
          },
        ],
      })
    )
  })

  it('throws 404 when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(ProvidersService.getById('missing', mockRepo as any))
      .rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('POST /providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    upsertResult = {
      id: 'user-provider',
      phone: '+639171234567',
      role: 'PROVIDER' as const,
      provider: null,
      updatedAt: new Date(),
    }
    mockTx.provider.create.mockResolvedValue(mockCreatedProvider)
  })

  it('returns 401 without a token', async () => {
    const app = buildApp()
    await app.ready()
    const res = await app.inject({ method: 'POST', url: '/providers', payload: validBody })
    await app.close()
    expect(res.statusCode).toBe(401)
  })

  it('returns 403 when user role is CUSTOMER', async () => {
    upsertResult = { ...upsertResult, role: 'CUSTOMER', provider: null }
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: validBody,
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()
    expect(res.statusCode).toBe(403)
  })

  it('returns 409 when provider already exists', async () => {
    upsertResult = { ...upsertResult, role: 'PROVIDER', provider: { id: 'existing-id' } }
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: validBody,
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()
    expect(res.statusCode).toBe(409)
  })

  it('returns 400 when services array is empty', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: { ...validBody, services: [] },
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when priceMax is less than priceMin', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: {
        ...validBody,
        services: [{ name: 'Aircon Cleaning', category: 'aircon', priceMin: 1500, priceMax: 500 }],
      },
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when displayName is one character', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: { ...validBody, displayName: 'A' },
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()
    expect(res.statusCode).toBe(400)
  })

  it('returns 201 with provider and services for valid payload', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: validBody,
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()
    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('services')
    expect(Array.isArray(body.services)).toBe(true)
    expect(body.services).toHaveLength(1)
  })

  it('stores null when service duration sanitizes to empty text', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: {
        ...validBody,
        services: [
          {
            name: 'Aircon Cleaning',
            category: 'aircon',
            priceMin: 500,
            priceMax: 1500,
            duration: '<b></b>',
          },
        ],
      },
      headers: { authorization: `Bearer ${token}` },
    })
    await app.close()

    expect(res.statusCode).toBe(201)
    expect(mockTx.provider.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          services: {
            create: [
              expect.objectContaining({
                duration: null,
              }),
            ],
          },
        }),
      })
    )
  })
})
