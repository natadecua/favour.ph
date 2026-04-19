import { BOOKING_STATUS, USER_ROLES, SERVICE_CATEGORIES, PROVIDER_TYPES } from './constants'

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES]
export type ProviderType = typeof PROVIDER_TYPES[keyof typeof PROVIDER_TYPES]

export interface User {
  id: string
  name: string
  email: string | null
  phone: string
  role: UserRole
  favourPoints: number
  createdAt: string
}

export interface Provider {
  id: string
  userId: string
  type: ProviderType
  displayName: string
  photoUrl: string | null
  description: string
  favourScore: number | null
  responseRate: number
  avgResponseHours: number
  completionRate: number
  isVerified: boolean
  isActive: boolean
  latitude: number | null
  longitude: number | null
  services: Service[]
}

export interface Service {
  id: string
  providerId: string
  providerType: ProviderType
  name: string
  description: string | null
  priceMin: number
  priceMax: number
  category: ServiceCategory
}

export interface Booking {
  id: string
  customerId: string
  providerId: string
  providerType: ProviderType
  serviceId: string
  preferredDatetime: string
  customerAddress: string
  notes: string | null
  status: BookingStatus
  cancellationReason: string | null
  isLateCancel: boolean
  cancelledBy: 'customer' | 'provider' | null
  createdAt: string
  confirmedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  revieweeId: string
  reviewerRole: 'customer' | 'provider'
  rating: number
  body: string
  isPublished: boolean
  submittedAt: string
  publishedAt: string | null
}

export interface ChatMessage {
  id: string
  bookingId: string
  senderId: string
  body: string
  sentAt: string
  isRead: boolean
}

// API response wrappers
export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    message: string
    code: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    total: number
    hasMore: boolean
  }
}