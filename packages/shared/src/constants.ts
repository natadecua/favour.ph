import type { ServiceCategory, BookingStatus, ProviderType, QuoteStatus } from './types'

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'aircon',
  'plumbing',
  'electrical',
  'cleaning',
  'carpentry',
  'painting',
  'appliance_repair',
  'pest_control',
  'cctv',
  'carwash',
  'laundry',
]

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  aircon: 'Aircon',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  carpentry: 'Carpentry',
  painting: 'Painting',
  appliance_repair: 'Appliance Repair',
  pest_control: 'Pest Control',
  cctv: 'CCTV',
  carwash: 'Carwash',
  laundry: 'Laundry',
}

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'DECLINED',
  'RESCHEDULE_REQUESTED',
  'COMPLETED',
  'CANCELLED',
]

export const QUOTE_STATUSES: QuoteStatus[] = ['PROPOSED', 'ACCEPTED', 'REJECTED', 'EXPIRED']

export const PROVIDER_TYPES: ProviderType[] = ['BUSINESS', 'FREELANCER']

export const FAVOUR_SCORE_WEIGHTS = {
  responseRate: 0.25,
  completionRate: 0.35,
  reviewAverage: 0.30,
  recency: 0.10,
} as const

export const REFERENCE_CODE_PREFIX = 'FVR'

export const MAX_PHOTOS_PER_PROVIDER = 10
export const UPLOAD_MAX_SIZE_BYTES = 5_242_880 // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const REDIS_SESSION_PREFIX = 'session:'
export const REDIS_BANNED_PREFIX = 'banned:'

// Statuses where chat is unlocked between customer and provider.
// RESCHEDULE_REQUESTED is included so the two parties can negotiate a new time.
export const CHAT_UNLOCK_STATUSES: BookingStatus[] = [
  'CONFIRMED',
  'RESCHEDULE_REQUESTED',
  'COMPLETED',
]

// Quote default expiry: 24 hours from proposal.
export const QUOTE_EXPIRY_HOURS = 24

// Booking is treated as "urgent" if requested datetime is within this many hours.
export const URGENT_BOOKING_THRESHOLD_HOURS = 6
