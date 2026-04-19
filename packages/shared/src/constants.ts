import type { ServiceCategory, BookingStatus, ProviderType } from './types'

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'aircon',
  'plumbing',
  'electrical',
  'cleaning',
  'carpentry',
  'painting',
  'appliance_repair',
]

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  aircon: 'Aircon',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  carpentry: 'Carpentry',
  painting: 'Painting',
  appliance_repair: 'Appliance Repair',
}

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED',
]

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
export const CHAT_UNLOCK_STATUSES: BookingStatus[] = ['CONFIRMED', 'COMPLETED']
