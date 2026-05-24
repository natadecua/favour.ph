import type { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/dev-login', {
    handler: AuthController.devLogin,
  })

  app.get('/me', {
    preHandler: app.authenticate,
    handler: AuthController.getMe,
  })
}
