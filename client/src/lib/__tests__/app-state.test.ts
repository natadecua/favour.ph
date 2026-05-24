import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BOOKINGS_ROUTE,
  FEED_ROUTE,
  LOGIN_ROUTE,
  getCustomerBookings,
  getFeedProviders,
} from '../app-state'

test('uses the real login route instead of the missing auth/login path', () => {
  assert.equal(LOGIN_ROUTE, '/login')
})

test('keeps bookings and feed routes on their live public paths', () => {
  assert.equal(BOOKINGS_ROUTE, '/bookings')
  assert.equal(FEED_ROUTE, '/feed')
})

test('falls back to mock providers when the live feed is empty', () => {
  const providers = getFeedProviders([])

  assert.ok(providers.length > 0)
  assert.equal(providers[0]?.id, 'mock-provider-plumbing')
})

test('returns live providers when the API has data', () => {
  const liveProvider = {
    id: 'live-provider-1',
    displayName: 'Live Provider',
    type: 'FREELANCER' as const,
    city: 'Batangas City',
    isVerified: true,
    category: 'plumbing',
    baseRate: 700,
    avatarUrl: null,
    favourScore: 0.92,
  }

  assert.deepEqual(getFeedProviders([liveProvider]), [liveProvider])
})

test('falls back to mock bookings when the live bookings list is empty', () => {
  const bookings = getCustomerBookings([])

  assert.ok(bookings.length > 0)
  assert.equal(bookings[0]?.referenceCode, 'FVR-MOCK-101')
})
