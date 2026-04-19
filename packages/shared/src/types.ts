// ── Enums ──────────────────────────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
export type ProviderType = 'BUSINESS' | 'FREELANCER'
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED'

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
  createdAt: string
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
  photo: string | null
  favourScore: number | null
  topService: Pick<Service, 'name' | 'category' | 'priceMin' | 'priceMax'> | null
}

export type ServiceCategory =
  | 'aircon'
  | 'plumbing'
  | 'electrical'
  | 'cleaning'
  | 'carpentry'
  | 'painting'
  | 'appliance_repair'
