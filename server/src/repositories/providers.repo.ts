import type { PrismaClient } from '@prisma/client'
import type { ProviderFeedQuery } from '@favour/shared'

export interface ProvidersRepoInterface {
  findMany(query: ProviderFeedQuery): Promise<any[]>
  findById(id: string): Promise<any | null>
}

export function createProvidersRepo(prisma: PrismaClient): ProvidersRepoInterface {
  return {
    async findMany(query) {
      return prisma.provider.findMany({
        where: {
          ...(query.category ? { services: { some: { category: query.category } } } : {}),
          ...(query.type !== 'all' ? { type: query.type.toUpperCase() as any } : {}),
        },
        include: { services: true, favourScore: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      })
    },
    async findById(id) {
      return prisma.provider.findUnique({
        where: { id },
        include: { services: true, favourScore: true, reviewsReceived: true },
      })
    },
  }
}
