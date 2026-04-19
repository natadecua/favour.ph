import type { BookingStatus } from '@favour/shared'
import { REFERENCE_CODE_PREFIX } from '@favour/shared'
import type { createBookingsRepo } from '../repositories/bookings.repo.js'

type BookingsRepo = ReturnType<typeof createBookingsRepo>

const VALID_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ['CONFIRMED', 'DECLINED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
}

export const BookingsService = {
  generateReferenceCode(): string {
    const rand = () => Math.random().toString(36).slice(2, 5).toUpperCase()
    return `${REFERENCE_CODE_PREFIX}-${rand()}-${rand()}`
  },

  assertValidTransition(current: BookingStatus, next: BookingStatus): void {
    const allowed = VALID_TRANSITIONS[current] ?? []
    if (!allowed.includes(next)) {
      throw Object.assign(
        new Error(`Invalid booking transition: ${current} → ${next}`),
        { statusCode: 400 }
      )
    }
  },

  async create(
    customerId: string,
    data: { providerId: string; serviceId: string; datetime: string; address: string; notes?: string },
    repo: BookingsRepo
  ) {
    return repo.create({
      referenceCode: BookingsService.generateReferenceCode(),
      customerId,
      providerId: data.providerId,
      serviceId: data.serviceId,
      datetime: new Date(data.datetime),
      address: data.address,
      notes: data.notes,
    })
  },

  async respond(
    bookingId: string,
    action: 'confirm' | 'decline',
    repo: BookingsRepo
  ) {
    const booking = await repo.findById(bookingId)
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })
    const next: BookingStatus = action === 'confirm' ? 'CONFIRMED' : 'DECLINED'
    BookingsService.assertValidTransition(booking.status as BookingStatus, next)
    return repo.updateStatus(bookingId, next)
  },

  async cancel(bookingId: string, repo: BookingsRepo) {
    const booking = await repo.findById(bookingId)
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })
    BookingsService.assertValidTransition(booking.status as BookingStatus, 'CANCELLED')
    return repo.updateStatus(bookingId, 'CANCELLED')
  },

  async complete(bookingId: string, repo: BookingsRepo) {
    const booking = await repo.findById(bookingId)
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })
    BookingsService.assertValidTransition(booking.status as BookingStatus, 'COMPLETED')
    return repo.updateStatus(bookingId, 'COMPLETED')
  },
}
