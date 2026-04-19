import type { FastifyInstance } from 'fastify'
import { BookingsController } from '../controllers/bookings.controller.js'

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [fastify.authenticate] }, BookingsController.list)
  fastify.post('/', { preHandler: [fastify.authenticate] }, BookingsController.create)
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, BookingsController.getById)
  fastify.patch('/:id/respond', { preHandler: [fastify.authenticate] }, BookingsController.respond)
  fastify.patch('/:id/cancel', { preHandler: [fastify.authenticate] }, BookingsController.cancel)
  fastify.patch('/:id/complete', { preHandler: [fastify.authenticate] }, BookingsController.complete)
}
