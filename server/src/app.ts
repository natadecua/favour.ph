import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'
import { prismaPlugin } from './plugins/prisma.js'
import { redisPlugin } from './plugins/redis.js'
import { authPlugin } from './plugins/auth.js'
import { authRoutes } from './routes/auth.js'
import { providerRoutes } from './routes/providers.js'
import { bookingRoutes } from './routes/bookings.js'
import { reviewRoutes } from './routes/reviews.js'
import { chatRoutes } from './routes/chat.js'
import { uploadRoutes } from './routes/uploads.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, {
    origin: process.env['NODE_ENV'] === 'production'
      ? ['https://favour.ph', 'https://www.favour.ph']
      : true,
  })

  app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  app.register(websocket)
  app.register(prismaPlugin)
  app.register(redisPlugin)
  app.register(authPlugin)

  app.register(authRoutes, { prefix: '/auth' })
  app.register(providerRoutes, { prefix: '/providers' })
  app.register(bookingRoutes, { prefix: '/bookings' })
  app.register(reviewRoutes, { prefix: '/reviews' })
  app.register(chatRoutes, { prefix: '/chat' })
  app.register(uploadRoutes, { prefix: '/uploads' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
