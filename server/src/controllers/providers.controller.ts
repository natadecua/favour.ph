import type { FastifyRequest, FastifyReply } from 'fastify'
import { CreateProviderSchema, ProviderFeedQuerySchema, REDIS_SESSION_PREFIX } from '@favour/shared'
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

  async create(req: FastifyRequest, reply: FastifyReply) {
    const user = req.authUser

    if (user.role !== 'PROVIDER') {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    if (user.providerId !== null) {
      return reply.code(409).send({ error: 'Provider profile already exists' })
    }

    const body = CreateProviderSchema.parse(req.body)
    const provider = await ProvidersService.create(user.id, body, req.server.prisma)
    await req.server.redis.del(`${REDIS_SESSION_PREFIX}${user.id}`).catch(() => {})
    return reply.code(201).send(provider)
  },
}
