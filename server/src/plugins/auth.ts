import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { REDIS_SESSION_PREFIX, REDIS_BANNED_PREFIX } from '@favour/shared'

interface SessionPayload {
  id: string
  role: string
  providerId: string | null
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user: SessionPayload
  }
}

export const authPlugin = fp(async (fastify) => {
  fastify.register(jwt, { secret: process.env['SUPABASE_JWT_SECRET']! })

  fastify.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await req.jwtVerify<{ sub: string; exp: number }>()
      const userId = decoded.sub

      const banned = await fastify.redis.get(`${REDIS_BANNED_PREFIX}${userId}`)
      if (banned) {
        return reply.code(403).send({ error: 'Account suspended' })
      }

      const cached = await fastify.redis.get(`${REDIS_SESSION_PREFIX}${userId}`)
      if (cached) {
        req.user = JSON.parse(cached) as SessionPayload
        return
      }

      const user = await fastify.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          phone: `supabase_${userId}`,
          role: 'CUSTOMER',
          updatedAt: new Date(),
        },
        update: {},
        include: { provider: { select: { id: true } } },
      })

      const session: SessionPayload = {
        id: user.id,
        role: user.role,
        providerId: user.provider?.id ?? null,
      }

      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await fastify.redis.setex(
          `${REDIS_SESSION_PREFIX}${userId}`,
          ttl,
          JSON.stringify(session)
        )
      }

      req.user = session
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })
})
