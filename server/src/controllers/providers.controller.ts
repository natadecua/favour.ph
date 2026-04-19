import type { FastifyRequest, FastifyReply } from 'fastify'
import { ProviderFeedQuerySchema } from '@favour/shared'
import { ProvidersService } from '../services/providers.service.js'
import { createProvidersRepo } from '../repositories/providers.repo.js'

export const ProvidersController = {
  async getFeed(req: FastifyRequest, reply: FastifyReply) {
    const query = ProviderFeedQuerySchema.parse(req.query)
    const repo = createProvidersRepo(req.server.prisma)
    const providers = await ProvidersService.getFeed(query, repo)
    return reply.send(providers)
  },

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const repo = createProvidersRepo(req.server.prisma)
    const provider = await ProvidersService.getById(req.params.id, repo)
    return reply.send(provider)
  },
}
