import fp from 'fastify-plugin'
import Redis from 'ioredis'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export const redisPlugin = fp(async (fastify) => {
  const redis = new Redis(process.env['REDIS_URL']!, { lazyConnect: true })
  try {
    await redis.connect()
  } catch {
    fastify.log.warn('Redis unavailable — session caching disabled')
  }
  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => { await redis.quit().catch(() => {}) })
})
