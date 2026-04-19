import type { PrismaClient } from '@prisma/client'
import type { createReviewsRepo } from '../repositories/reviews.repo.js'
import { FavourScoreService } from './favourScore.service.js'

type ReviewsRepo = ReturnType<typeof createReviewsRepo>

export const ReviewsService = {
  async create(
    authorId: string,
    data: { bookingId: string; rating: number; body: string },
    repo: ReviewsRepo,
    prisma: PrismaClient
  ) {
    const isCompleted = await repo.bookingIsCompleted(data.bookingId)
    if (!isCompleted) {
      throw Object.assign(
        new Error('Reviews can only be submitted for completed bookings'),
        { statusCode: 400 }
      )
    }

    const existing = await repo.findByBooking(data.bookingId)
    if (existing) {
      throw Object.assign(new Error('Review already submitted'), { statusCode: 409 })
    }

    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: data.bookingId },
    })

    const review = await repo.create({
      bookingId: data.bookingId,
      authorId,
      targetId: booking.providerId,
      rating: data.rating,
      body: data.body,
    })

    await FavourScoreService.recalculate(booking.providerId, prisma)

    return review
  },
}
