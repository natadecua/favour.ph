import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { REDIS_SESSION_PREFIX, REDIS_BANNED_PREFIX } from '@favour/shared'

interface SessionPayload {
  id: string
  role: string
  providerId: string | null
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
      exp: number
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    authUser: SessionPayload
  }
}

export const authPlugin = fp(async (fastify) => {
  fastify.register(jwt, { secret: process.env['SUPABASE_JWT_SECRET']! })

  fastify.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await req.jwtVerify<{ sub: string; exp: number }>()
      const userId = decoded.sub
      const redisReady = fastify.redis.status === 'ready'

      if (redisReady) {
        const banned = await fastify.redis
          .get(`${REDIS_BANNED_PREFIX}${userId}`)
          .catch(() => null)
        if (banned) {
          return reply.code(403).send({ error: 'Account suspended' })
        }
      }

      if (redisReady) {
        const cached = await fastify.redis
          .get(`${REDIS_SESSION_PREFIX}${userId}`)
          .catch(() => null)
        if (cached) {
          req.authUser = JSON.parse(cached) as SessionPayload
          return
        }
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
      if (redisReady && ttl > 0) {
        await fastify.redis
          .setex(`${REDIS_SESSION_PREFIX}${userId}`, ttl, JSON.stringify(session))
          .catch(() => {})
      }

      req.authUser = session
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })
})
