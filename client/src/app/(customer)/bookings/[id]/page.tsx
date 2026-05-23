'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BookingConfirmed } from '@/components/bookings/BookingConfirmed'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'
import { useAuthStore } from '@/stores/auth'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  })
}

function BookingDetailSkeleton() {
  return (
    <main className="min-h-screen bg-surface pb-12">
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <div className="h-3 w-28 rounded bg-white/20" />
        <div className="mt-3 h-7 w-48 rounded bg-white/20" />
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4" aria-hidden="true">
        <div className="h-24 rounded-card border border-ui bg-white animate-pulse" />
        <div className="h-20 rounded-card border border-ui bg-white animate-pulse" />
        <div className="h-24 rounded-card border border-ui bg-white animate-pulse" />
      </div>
    </main>
  )
}

function BookingDetailError() {
  return (
    <main className="min-h-screen bg-surface pb-12">
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <Link
          href="/bookings"
          className="font-mono text-[12px] font-bold text-white/60 tracking-[0.08em] hover:text-white/90 motion-safe:transition-colors duration-150"
        >
          &larr; MY BOOKINGS
        </Link>
        <h1 className="font-display font-extrabold text-[24px] text-white leading-snug mt-3">
          Booking Details
        </h1>
      </div>

      <div className="px-4 pt-4">
        <div role="alert" className="bg-white border border-ui rounded-card p-4">
          <p className="font-sans text-[15px] font-semibold text-favour-dark">
            Booking not found or you do not have access to it.
          </p>
          <p className="font-sans text-[14px] text-ink-700 leading-relaxed mt-2">
            Check your bookings list for the latest requests and confirmed appointments.
          </p>
        </div>

        <Link
          href="/bookings"
          className="mt-4 flex items-center justify-center h-btn rounded-btn border border-ui text-favour-blue font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
        >
          My Bookings
        </Link>
      </div>
    </main>
  )
}

export default function BookingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const bookingId = params.id

  useEffect(() => {
    if (!accessToken) {
      router.replace('/auth/login')
    }
  }, [accessToken, router])

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => api.bookings.getById(bookingId, accessToken ?? ''),
    enabled: !!accessToken,
    retry: false,
  })

  if (!accessToken || isLoading) {
    return <BookingDetailSkeleton />
  }

  if (isError || !booking) {
    return <BookingDetailError />
  }

  const showConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'

  return (
    <main className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <Link
          href="/bookings"
          className="font-mono text-[12px] font-bold text-white/60 tracking-[0.08em] hover:text-white/90 motion-safe:transition-colors duration-150"
        >
          &larr; MY BOOKINGS
        </Link>
        <h1 className="font-display font-extrabold text-[24px] text-white leading-snug mt-3">
          Booking Details
        </h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {showConfirmed && (
          <BookingConfirmed
            referenceCode={booking.referenceCode}
            providerName="Your Provider"
            scheduledAt={booking.datetime}
            status={booking.status}
          />
        )}

        {!showConfirmed && (
          <>
            {/* Status + reference */}
            <div className="bg-white border border-ui rounded-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">
                  STATUS
                </p>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div>
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
                  REFERENCE
                </p>
                <p className="font-mono text-[20px] font-extrabold text-favour-dark">
                  {booking.referenceCode}
                </p>
              </div>
            </div>

            {/* Scheduled */}
            <div className="bg-white border border-ui rounded-card p-4">
              <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
                SCHEDULED FOR
              </p>
              <p className="font-sans text-[15px] font-semibold text-favour-dark">
                {formatDate(booking.datetime)}
              </p>
            </div>

            {/* Address */}
            <div className="bg-white border border-ui rounded-card p-4">
              <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
                ADDRESS
              </p>
              <p className="font-sans text-[15px] text-favour-dark leading-relaxed">
                {booking.address}
              </p>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="bg-white border border-ui rounded-card p-4">
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
                  NOTES
                </p>
                <p className="font-sans text-[15px] text-favour-dark leading-relaxed">
                  {booking.notes}
                </p>
              </div>
            )}
          </>
        )}

        <Link
          href="/bookings"
          className="flex items-center justify-center h-btn rounded-btn border border-ui text-favour-blue font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2 mt-2"
        >
          My Bookings
        </Link>
      </div>
    </main>
  )
}
