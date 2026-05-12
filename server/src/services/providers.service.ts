import sanitizeHtml from 'sanitize-html'
import type { CreateProviderInput, ProviderFeedQuery } from '@favour/shared'
import type { ProvidersRepoInterface } from '../repositories/providers.repo.js'

type ProviderPrisma = {
  $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>
}

function sanitize(str: string): string {
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} })
}

function toSummary(p: any) {
  return {
    id: p.id,
    displayName: p.displayName,
    type: p.type,
    category: p.services?.[0]?.category ?? '',
    favourScore: p.favourScore?.overall ?? 0,
    baseRate: p.services?.[0]?.priceMin ?? 0,
    city: p.city,
    avatarUrl: p.photos?.[0] ?? null,
  }
}

function toDetail(p: any) {
  return {
    ...toSummary(p),
    bio: p.bio ?? null,
    yearsExperience: null,
    completedBookings: 0,
    responseRate: Math.round((p.favourScore?.responseRate ?? 0) * 100),
    reviewCount: p.reviewsReceived?.length ?? 0,
  }
}

export const ProvidersService = {
  async getFeed(query: ProviderFeedQuery, repo: ProvidersRepoInterface) {
    const providers = await repo.findMany(query)
    return providers.map(toSummary)
  },

  async getById(id: string, repo: ProvidersRepoInterface) {
    const provider = await repo.findById(id)
    if (!provider) {
      const err = new Error('Provider not found') as any
      err.statusCode = 404
      throw err
    }
    return toDetail(provider)
  },

  async create(userId: string, body: CreateProviderInput, prisma: ProviderPrisma) {
    return prisma.$transaction(async (tx) => {
      return tx.provider.create({
        data: {
          userId,
          type: body.type,
          displayName: sanitize(body.displayName),
          bio: body.bio ? sanitize(body.bio) : null,
          city: sanitize(body.city),
          photos: body.photoPath ? [body.photoPath] : [],
          services: {
            create: body.services.map((service) => ({
              name: sanitize(service.name),
              category: service.category,
              priceMin: service.priceMin,
              priceMax: service.priceMax,
            })),
          },
        },
        include: { services: true },
      })
    })
  },
}
