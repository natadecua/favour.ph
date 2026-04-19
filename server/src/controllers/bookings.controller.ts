import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  CreateBookingSchema,
  RespondToBookingSchema,
  CancelBookingSchema,
} from '@favour/shared'
import { BookingsService } from '../services/bookings.service.js'
import { createBookingsRepo } from '../repositories/bookings.repo.js'

export const BookingsController = {
  async list(req: FastifyRequest<{ Querystring: { scope?: string } }>, reply: FastifyReply) {
    const repo = createBookingsRepo(req.server.prisma)
    if (req.query.scope === 'provider' && req.user.providerId) {
      const bookings = await repo.findByProvider(req.user.providerId)
      return reply.send(bookings)
    }
    const bookings = await repo.findByCustomer(req.user.id)
    return reply.send(bookings)
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = CreateBookingSchema.parse(req.body)
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.create(req.user.id, body, repo)
    return reply.code(201).send(booking)
  },

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await repo.findById(req.params.id)
    if (!booking) return reply.code(404).send({ error: 'Not found' })
    return reply.send(booking)
  },

  async respond(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const body = RespondToBookingSchema.parse(req.body)
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.respond(req.params.id, body.action, repo)
    return reply.send(booking)
  },

  async cancel(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    CancelBookingSchema.parse(req.body)
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.cancel(req.params.id, repo)
    return reply.send(booking)
  },

  async complete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.complete(req.params.id, repo)
    return reply.send(booking)
  },
}
