import { FAVOUR_SCORE_WEIGHTS } from '@favour/shared'
import type { PrismaClient } from '@prisma/client'

interface ScoreInputs {
  responseRate: number     // 0–1
  completionRate: number   // 0–1
  reviewAverage: number    // 0–5 (normalised internally)
  recency: number          // 0–1
}

export const FavourScoreService = {
  calculate(inputs: ScoreInputs): number {
    const normalisedReview = inputs.reviewAverage / 5
    return (
      inputs.responseRate * FAVOUR_SCORE_WEIGHTS.responseRate +
      inputs.completionRate * FAVOUR_SCORE_WEIGHTS.completionRate +
      normalisedReview * FAVOUR_SCORE_WEIGHTS.reviewAverage +
      inputs.recency * FAVOUR_SCORE_WEIGHTS.recency
    )
  },

  async recalculate(providerId: string, prisma: PrismaClient): Promise<void> {
    const bookings = await prisma.booking.findMany({ where: { providerId } })
    const responded = bookings.filter(b => b.status !== 'PENDING').length
    const completed = bookings.filter(b => b.status === 'COMPLETED').length
    const responseRate = bookings.length > 0 ? responded / bookings.length : 0
    const completionRate = responded > 0 ? completed / responded : 0

    const reviews = await prisma.review.findMany({ where: { targetId: providerId } })
    const reviewAverage = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    const latestBooking = bookings
      .filter(b => b.status === 'COMPLETED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
    const daysSince = latestBooking
      ? (Date.now() - latestBooking.createdAt.getTime()) / 86_400_000
      : 365
    const recency = Math.max(0, 1 - daysSince / 365)

    const overall = FavourScoreService.calculate({ responseRate, completionRate, reviewAverage, recency })

    await prisma.favourScore.upsert({
      where: { providerId },
      update: { overall, responseRate, completionRate, reviewAverage, recency },
      create: { providerId, overall, responseRate, completionRate, reviewAverage, recency },
    })
  },
}
