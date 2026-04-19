export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  CUSTOMER: 'customer',
  BUSINESS: 'business',
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
} as const

export const SERVICE_CATEGORIES = {
  CLEANING: 'cleaning',
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  REPAIR: 'repair',
  AIRCON: 'aircon',
  OTHER: 'other',
} as const

export const PROVIDER_TYPES = {
  BUSINESS: 'business',
  FREELANCER: 'freelancer',
} as const

export const FAVOUR_SCORE = {
  MIN_REVIEWS_FOR_DISPLAY: 3,
  RESPONSE_WINDOW_HOURS: 4,
  LATE_CANCEL_HOURS: 24,
  REVIEW_WINDOW_DAYS: 7,
  WEIGHTS: {
    avgRating: 0.5,
    responseRate: 0.2,
    completionRate: 0.2,
    cancellationPenalty: 0.1,
  },
} as const