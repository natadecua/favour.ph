import type { Booking, ProviderSummary } from '@favour/shared'

export const LOGIN_ROUTE = '/login'
export const VERIFY_ROUTE = '/verify'
export const FEED_ROUTE = '/feed'
export const BOOKINGS_ROUTE = '/bookings'
export const PROVIDER_DASHBOARD_ROUTE = '/dashboard'
export const PROVIDER_ONBOARDING_ROUTE = '/onboarding'

export const mockProviders: ProviderSummary[] = [
  {
    id: 'mock-provider-plumbing',
    displayName: 'Kuya Mateo Plumbing',
    type: 'FREELANCER',
    city: 'Batangas City',
    isVerified: true,
    category: 'plumbing',
    baseRate: 700,
    avatarUrl: null,
    favourScore: 0.94,
  },
  {
    id: 'mock-provider-electrical',
    displayName: 'Ate Sarah Electrical Services',
    type: 'BUSINESS',
    city: 'Batangas City',
    isVerified: true,
    category: 'electrical',
    baseRate: 850,
    avatarUrl: null,
    favourScore: 0.97,
  },
  {
    id: 'mock-provider-cleaning',
    displayName: 'Luz Home Cleaning Crew',
    type: 'BUSINESS',
    city: 'Batangas City',
    isVerified: true,
    category: 'cleaning',
    baseRate: 600,
    avatarUrl: null,
    favourScore: 0.91,
  },
]

export const mockCustomerBookings: Booking[] = [
  {
    id: 'mock-booking-1',
    referenceCode: 'FVR-MOCK-101',
    customerId: 'mock-customer',
    providerId: 'mock-provider-plumbing',
    serviceId: 'mock-service-plumbing',
    status: 'PENDING',
    datetime: '2026-05-28T09:00:00.000Z',
    address: 'P. Burgos Street, Batangas City',
    notes: 'Sample booking while live appointments are still empty.',
    isUrgent: false,
    proposedDatetime: null,
    proposedDatetimeBy: null,
    acceptedQuoteId: null,
    createdAt: '2026-05-23T00:00:00.000Z',
    service: {
      id: 'mock-service-plumbing',
      name: 'Leak Inspection',
      category: 'plumbing',
      priceMin: 700,
      priceMax: 1200,
    },
    provider: {
      id: 'mock-provider-plumbing',
      displayName: 'Kuya Mateo Plumbing',
    },
  },
  {
    id: 'mock-booking-2',
    referenceCode: 'FVR-MOCK-202',
    customerId: 'mock-customer',
    providerId: 'mock-provider-cleaning',
    serviceId: 'mock-service-cleaning',
    status: 'CONFIRMED',
    datetime: '2026-05-30T05:30:00.000Z',
    address: 'Alangilan, Batangas City',
    notes: null,
    isUrgent: false,
    proposedDatetime: null,
    proposedDatetimeBy: null,
    acceptedQuoteId: null,
    createdAt: '2026-05-23T00:00:00.000Z',
    service: {
      id: 'mock-service-cleaning',
      name: 'General Home Cleaning',
      category: 'cleaning',
      priceMin: 600,
      priceMax: 1400,
    },
    provider: {
      id: 'mock-provider-cleaning',
      displayName: 'Luz Home Cleaning Crew',
    },
  },
]

export function getFeedProviders(providers: ProviderSummary[]): ProviderSummary[] {
  return providers.length > 0 ? providers : mockProviders
}

export function getCustomerBookings(bookings: Booking[]): Booking[] {
  return bookings.length > 0 ? bookings : mockCustomerBookings
}
