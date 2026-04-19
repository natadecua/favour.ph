import type { FastifyRequest, FastifyReply } from 'fastify'

export const AuthController = {
  async getMe(req: FastifyRequest, reply: FastifyReply) {
    const { id, role, providerId } = req.user
    return reply.send({ userId: id, role, providerId })
  },
}
