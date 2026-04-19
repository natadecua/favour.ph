import type { FastifyInstance } from 'fastify'
import { UploadsController } from '../controllers/uploads.controller.js'

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/sign', { preHandler: [fastify.authenticate] }, UploadsController.sign)
}
