import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProvidersService } from '../services/providers.service.js'
import type { ProviderFeedQuery } from '@favour/shared'

const mockRepo = {
  findMany: vi.fn(),
  findById: vi.fn(),
}

describe('ProvidersService', () => {
  beforeEach(() => vi.clearAllMocks())

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
    expect(result).toEqual(fake)
  })

  it('throws 404 when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(ProvidersService.getById('missing', mockRepo as any))
      .rejects.toMatchObject({ statusCode: 404 })
  })
})
