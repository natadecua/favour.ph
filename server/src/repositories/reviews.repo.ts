import type { PrismaClient } from '@prisma/client'

export function createReviewsRepo(prisma: PrismaClient) {
  return {
    async create(data: {
      bookingId: string
      authorId: string
      targetId: string
      rating: number
      body: string
    }) {
      return prisma.review.create({ data })
    },

    async findByBooking(bookingId: string) {
      return prisma.review.findUnique({ where: { bookingId } })
    },

    async bookingIsCompleted(bookingId: string) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
      return booking?.status === 'COMPLETED'
    },
  }
}
