'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'

interface BookPageProps {
  params: { providerId: string }
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  const [scheduledAt, setScheduledAt] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!scheduledAt || !address.trim()) {
      setError('Please fill in the date/time and address.')
      return
    }

    setLoading(true)
    try {
      const booking = await api.bookings.create(
        { providerId: params.providerId, scheduledAt, address: address.trim(), notes: notes.trim() || undefined },
        accessToken ?? ''
      )
      router.push(`/feed/bookings/${booking.id}`)
    } catch {
      setError('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <h1 className="font-display font-extrabold text-[24px] text-white leading-snug">
          Request Booking
        </h1>
        <p className="font-sans text-[14px] text-white/70 mt-1">
          Fill in the details for your service request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-6 flex flex-col gap-5" noValidate>
        {error && (
          <div
            role="alert"
            className="bg-danger/10 border border-danger/30 rounded-card p-4"
          >
            <p className="font-sans text-[14px] font-semibold text-danger">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="scheduledAt">DATE &amp; TIME</FieldLabel>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="address">SERVICE ADDRESS</FieldLabel>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={3}
            placeholder="Enter your full address in Batangas City"
            className="w-full border border-ui rounded-input bg-white px-4 py-3 font-sans text-[15px] text-favour-dark placeholder:text-ink-400 focus:outline-none focus:border-favour-blue focus:ring-2 focus:ring-favour-blue/20 motion-safe:transition-colors duration-150 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="notes">ADDITIONAL NOTES <span className="font-sans text-[11px] font-normal text-ink-400 normal-case">(optional)</span></FieldLabel>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Describe the issue or any special instructions"
            className="w-full border border-ui rounded-input bg-white px-4 py-3 font-sans text-[15px] text-favour-dark placeholder:text-ink-400 focus:outline-none focus:border-favour-blue focus:ring-2 focus:ring-favour-blue/20 motion-safe:transition-colors duration-150 resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full mt-2"
        >
          {loading ? 'Booking…' : 'Confirm Booking'}
        </Button>
      </form>
    </main>
  )
}
