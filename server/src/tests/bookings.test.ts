import { describe, it, expect } from 'vitest'
import { BookingsService } from '../services/bookings.service.js'

describe('BookingsService.generateReferenceCode', () => {
  it('generates code with FVR prefix', () => {
    const code = BookingsService.generateReferenceCode()
    expect(code).toMatch(/^FVR-[A-Z0-9]{3}-[A-Z0-9]{3}$/)
  })
})

describe('BookingsService.assertValidTransition', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(() => BookingsService.assertValidTransition('PENDING', 'CONFIRMED')).not.toThrow()
  })
  it('allows PENDING → DECLINED', () => {
    expect(() => BookingsService.assertValidTransition('PENDING', 'DECLINED')).not.toThrow()
  })
  it('allows CONFIRMED → COMPLETED', () => {
    expect(() => BookingsService.assertValidTransition('CONFIRMED', 'COMPLETED')).not.toThrow()
  })
  it('rejects DECLINED → CONFIRMED', () => {
    expect(() => BookingsService.assertValidTransition('DECLINED', 'CONFIRMED'))
      .toThrow('Invalid booking transition')
  })
  it('rejects COMPLETED → CANCELLED', () => {
    expect(() => BookingsService.assertValidTransition('COMPLETED', 'CANCELLED'))
      .toThrow('Invalid booking transition')
  })
})
