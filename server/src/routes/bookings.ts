import type { FastifyInstance } from 'fastify'
import { BookingsController } from '../controllers/bookings.controller.js'

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.route<{ Querystring: { scope?: string } }>({
    method: 'GET',
    url: '/',
    preHandler: fastify.authenticate,
    handler: BookingsController.list,
  })

  fastify.post('/', { preHandler: fastify.authenticate }, BookingsController.create)

  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/:id',
    preHandler: fastify.authenticate,
    handler: BookingsController.getById,
  })

  fastify.route<{ Params: { id: string } }>({
    method: 'PATCH',
    url: '/:id/respond',
    preHandler: fastify.authenticate,
    handler: BookingsController.respond,
  })

  fastify.route<{ Params: { id: string } }>({
    method: 'PATCH',
    url: '/:id/cancel',
    preHandler: fastify.authenticate,
    handler: BookingsController.cancel,
  })

  fastify.route<{ Params: { id: string } }>({
    method: 'PATCH',
    url: '/:id/complete',
    preHandler: fastify.authenticate,
    handler: BookingsController.complete,
  })
}
