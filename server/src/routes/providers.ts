import type { FastifyInstance } from 'fastify'
import { ProvidersController } from '../controllers/providers.controller.js'

export async function providerRoutes(fastify: FastifyInstance) {
  fastify.get('/', ProvidersController.getFeed)
  fastify.get('/:id', ProvidersController.getById)
}
