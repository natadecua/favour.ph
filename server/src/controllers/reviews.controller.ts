import type { FastifyRequest, FastifyReply } from 'fastify'
import { CreateReviewSchema } from '@favour/shared'
import { ReviewsService } from '../services/reviews.service.js'
import { createReviewsRepo } from '../repositories/reviews.repo.js'

export const ReviewsController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = CreateReviewSchema.parse(req.body)
    const repo = createReviewsRepo(req.server.prisma)
    const review = await ReviewsService.create(req.user.id, body, repo, req.server.prisma)
    return reply.code(201).send(review)
  },
}
