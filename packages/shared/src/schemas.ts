import { z } from 'zod'
import { SERVICE_CATEGORIES } from './constants'
import type { ServiceCategory } from './types'

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  datetime: z.string().datetime().refine(
    d => new Date(d) > new Date(),
    'Booking must be in the future'
  ),
  address: z.string().min(10, 'Address too short').max(200),
  notes: z.string().max(500).optional(),
  isUrgent: z.boolean().optional().default(false),
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
  q: z.string().trim().max(100).optional(),
  // When true, return only providers available now (online + no conflicting booking today).
  urgent: z.coerce.boolean().optional(),
})

// ── Quote (provider proposes price → customer accepts/rejects) ─────────────

export const CreateQuoteSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().int().positive('Amount must be greater than zero').max(1_000_000),
  notes: z.string().trim().max(500).optional(),
})

export const RespondToQuoteSchema = z.object({
  quoteId: z.string().uuid(),
  action: z.enum(['accept', 'reject']),
  message: z.string().trim().max(300).optional(),
})

// ── Reschedule (either party proposes a new datetime) ──────────────────────

export const RequestRescheduleSchema = z.object({
  proposedDatetime: z
    .string()
    .datetime()
    .refine(d => new Date(d) > new Date(), 'Proposed time must be in the future'),
  reason: z.string().trim().max(300).optional(),
})

export const RespondToRescheduleSchema = z.object({
  action: z.enum(['accept', 'reject']),
  message: z.string().trim().max(300).optional(),
})

// ── Saved providers (customer favourites) ──────────────────────────────────

export const SaveProviderSchema = z.object({
  providerId: z.string().uuid(),
})

// ── Anti-leakage chat scan ─────────────────────────────────────────────────

export const ScanMessageSchema = z.object({
  body: z.string().min(1).max(1000),
})

export const CreateProviderSchema = z.object({
  type: z.enum(['BUSINESS', 'FREELANCER']),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(80, 'Display name must be 80 characters or less'),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or less').optional(),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be 100 characters or less'),
  photoPath: z.string().max(500).optional(),
  services: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(2, 'Service name must be at least 2 characters')
          .max(80, 'Service name must be 80 characters or less'),
        category: z.enum(SERVICE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]),
        priceMin: z.number().int().positive().max(100_000),
        priceMax: z.number().int().positive().max(100_000),
        duration: z.string().trim().max(30).optional(),
      })
    )
    .min(1, 'Add at least one service')
    .max(10)
    .refine(
      (services) => services.every((service) => service.priceMax >= service.priceMin),
      'priceMax must be >= priceMin for all services'
    ),
})

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type RespondToBookingInput = z.infer<typeof RespondToBookingSchema>
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
export type CreateChatMessageInput = z.infer<typeof CreateChatMessageSchema>
export type ProviderFeedQuery = z.infer<typeof ProviderFeedQuerySchema>
export type CreateProviderInput = z.infer<typeof CreateProviderSchema>
export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>
export type RespondToQuoteInput = z.infer<typeof RespondToQuoteSchema>
export type RequestRescheduleInput = z.infer<typeof RequestRescheduleSchema>
export type RespondToRescheduleInput = z.infer<typeof RespondToRescheduleSchema>
export type SaveProviderInput = z.infer<typeof SaveProviderSchema>
export type ScanMessageInput = z.infer<typeof ScanMessageSchema>
