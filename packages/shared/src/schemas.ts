import { z } from 'zod'

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  providerType: z.enum(['business', 'freelancer']),
  datetime: z.string().datetime().refine(
    d => new Date(d) > new Date(),
    'Booking must be in the future'
  ),
  address: z.string().min(10, 'Address too short').max(200),
  notes: z.string().max(500).optional(),
})

export const RespondToBookingSchema = z.object({
  action: z.enum(['confirm', 'decline']),
  message: z.string().max(300).optional(),
})

export const CancelBookingSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason').max(300),
})

export const CreateReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(20, 'Review must be at least 20 characters').max(1000),
})

export const CreateChatMessageSchema = z.object({
  body: z.string().min(1).max(1000).trim(),
})

export const ProviderFeedQuerySchema = z.object({
  category: z.string().optional(),
  type: z.enum(['business', 'freelancer', 'all']).optional().default('all'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().max(20).optional().default(10),
})

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type RespondToBookingInput = z.infer<typeof RespondToBookingSchema>
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
export type CreateChatMessageInput = z.infer<typeof CreateChatMessageSchema>
export type ProviderFeedQuery = z.infer<typeof ProviderFeedQuerySchema>