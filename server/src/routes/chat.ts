import type { FastifyInstance } from 'fastify'
import { CreateChatMessageSchema, CHAT_UNLOCK_STATUSES } from '@favour/shared'

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.get('/:bookingId', { websocket: true }, async (socket, req: any) => {
    const { bookingId } = req.params as { bookingId: string }

    const booking = await fastify.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || !CHAT_UNLOCK_STATUSES.includes(booking.status as any)) {
      socket.close(4003, 'Chat not available for this booking')
      return
    }

    const history = await fastify.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })
    socket.send(JSON.stringify({ type: 'history', messages: history }))

    socket.on('message', async (raw: Buffer) => {
      try {
        const parsed = CreateChatMessageSchema.parse(JSON.parse(raw.toString()))
        const message = await fastify.prisma.message.create({
          data: { bookingId, senderId: req.user?.id ?? 'unknown', body: parsed.body },
        })
        socket.send(JSON.stringify({ type: 'message', message }))
      } catch {
        socket.send(JSON.stringify({ type: 'error', error: 'Invalid message' }))
      }
    })
  })
}
