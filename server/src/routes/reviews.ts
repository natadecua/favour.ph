import type { FastifyInstance } from 'fastify'
import { ReviewsController } from '../controllers/reviews.controller.js'

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [fastify.authenticate] }, ReviewsController.create)
}
