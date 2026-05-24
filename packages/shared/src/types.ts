// ── Enums ──────────────────────────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
export type ProviderType = 'BUSINESS' | 'FREELANCER'
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'RESCHEDULE_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'

export type QuoteStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export type RescheduleProposer = 'customer' | 'provider'

export type LeakageReasonType =
  | 'phone_number'
  | 'email'
  | 'external_platform'
  | 'payment_app'

// ── Core entities ──────────────────────────────────────────────────────────

export interface User {
  id: string
  phone: string
  email: string | null
  role: Role
  createdAt: string
}

export interface Provider {
  id: string
  userId: string
  type: ProviderType
  displayName: string
  bio: string | null
  city: string
  isVerified: boolean
  photos: string[]
  favourScore: FavourScore | null
  services: Service[]
}

export interface Service {
  id: string
  providerId: string
  name: string
  category: ServiceCategory
  priceMin: number
  priceMax: number
  duration: string | null
}

export interface Booking {
  id: string
  referenceCode: string
  customerId: string
  providerId: string
  serviceId: string
  status: BookingStatus
  datetime: string
  address: string
  notes: string | null
  // Optional until the database schema and older fixtures catch up with v0.2 fields.
  isUrgent?: boolean
  // Populated when status is RESCHEDULE_REQUESTED; cleared on accept/reject.
  proposedDatetime?: string | null
  proposedDatetimeBy?: RescheduleProposer | null
  // Set when a Quote is ACCEPTED. Lets the booking carry its agreed price without re-joining quotes.
  acceptedQuoteId?: string | null
  createdAt: string
  // Populated when fetching list/detail (Prisma include)
  service?: { id: string; name: string; category: string; priceMin: number; priceMax: number }
  provider?: { id: string; displayName: string }
}

export interface Quote {
  id: string
  bookingId: string
  // userId of the party proposing. Usually provider, but customer counter-quotes are allowed.
  proposedById: string
  amount: number
  notes: string | null
  status: QuoteStatus
  proposedAt: string
  respondedAt: string | null
  expiresAt: string | null
}

export interface SavedProvider {
  userId: string
  providerId: string
  savedAt: string
}

export interface AntiLeakageScanResult {
  flagged: boolean
  confidence: 'low' | 'medium' | 'high'
  reasons: Array<{
    type: LeakageReasonType
    match: string
    explanation: string
  }>
}

export interface Review {
  id: string
  bookingId: string
  authorId: string
  targetId: string
  rating: number
  body: string
  createdAt: string
}

export interface Message {
  id: string
  bookingId: string
  senderId: string
  body: string
  createdAt: string
}

export interface FavourScore {
  providerId: string
  overall: number
  responseRate: number
  completionRate: number
  reviewAverage: number
  recency: number
  updatedAt: string
}

// ── API response shapes ────────────────────────────────────────────────────

export interface ProviderSummary {
  id: string
  displayName: string
  type: ProviderType
  city: string
  isVerified: boolean
  category: string
  baseRate: number
  avatarUrl: string | null
  favourScore: number
}

export interface ProviderDetail extends ProviderSummary {
  bio: string | null
  yearsExperience: number | null
  completedBookings: number
  responseRate: number
  reviewCount: number
  services: Service[]
}

export type ServiceCategory =
  | 'aircon'
  | 'plumbing'
  | 'electrical'
  | 'cleaning'
  | 'carpentry'
  | 'painting'
  | 'appliance_repair'
  | 'pest_control'
  | 'cctv'
  | 'carwash'
  | 'laundry'
