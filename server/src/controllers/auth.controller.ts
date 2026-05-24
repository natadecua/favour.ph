import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const DevLoginSchema = z.object({
  identity: z.enum(['customer', 'provider']),
})

const DEV_IDENTITY_PHONES = {
  customer: '+639171999999',
  provider: '+639171000001',
} as const

export const AuthController = {
  async getMe(req: FastifyRequest, reply: FastifyReply) {
    const { id, role, providerId } = req.authUser
    return reply.send({ userId: id, role, providerId })
  },

  async devLogin(req: FastifyRequest, reply: FastifyReply) {
    if (process.env['NODE_ENV'] === 'production') {
      return reply.code(404).send({ error: 'Not found' })
    }

    const body = DevLoginSchema.parse(req.body)
    const user = await req.server.prisma.user.findUnique({
      where: { phone: DEV_IDENTITY_PHONES[body.identity] },
      include: { provider: { select: { id: true } } },
    })

    if (!user) {
      return reply.code(404).send({ error: 'Demo user not found. Run the seed script first.' })
    }

    const accessToken = req.server.jwt.sign({
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    })

    return reply.send({
      accessToken,
      userId: user.id,
      role: user.role,
      providerId: user.provider?.id ?? null,
    })
  },
}
