import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UploadsService } from '../services/uploads.service.js'

const SignUploadBody = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
})

export const UploadsController = {
  async sign(req: FastifyRequest, reply: FastifyReply) {
    const body = SignUploadBody.parse(req.body)
    const result = await UploadsService.signUploadUrl({ ...body, userId: req.user.id })
    return reply.send(result)
  },
}
