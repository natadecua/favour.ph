import type { ProviderFeedQuery } from '@favour/shared'
import type { ProvidersRepoInterface } from '../repositories/providers.repo.js'

export const ProvidersService = {
  async getFeed(query: ProviderFeedQuery, repo: ProvidersRepoInterface) {
    return repo.findMany(query)
  },

  async getById(id: string, repo: ProvidersRepoInterface) {
    const provider = await repo.findById(id)
    if (!provider) {
      const err = new Error('Provider not found') as any
      err.statusCode = 404
      throw err
    }
    return provider
  },
}
