'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BOOKINGS_ROUTE, FEED_ROUTE, getCustomerBookings } from '@/lib/app-state'
import { useAuthStore } from '@/stores/auth'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'
import type { Booking } from '@favour/shared'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  })
}

function BookingCard({ booking, disabled = false }: { booking: Booking; disabled?: boolean }) {
  const className =
    'block rounded-card border border-ui bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2'

  const content = (
    <>
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="font-mono text-[18px] font-extrabold leading-none text-favour-dark">
          {booking.referenceCode}
        </p>
        <BookingStatusBadge status={booking.status} />
      </div>
      {booking.service && (
        <p className="mt-1 font-sans text-[14px] font-semibold text-favour-dark">
          {booking.service.name}
        </p>
      )}
      {booking.provider && (
        <p className="mt-0.5 font-sans text-[13px] text-ink-700">
          {booking.provider.displayName}
        </p>
      )}
      <p className="mt-2 font-mono text-[12px] tracking-[0.02em] text-ink-400">
        {formatDate(booking.datetime)}
      </p>
      {disabled && (
        <p className="mt-3 font-mono text-[11px] font-bold tracking-[0.08em] text-favour-blue">
          PREVIEW ONLY
        </p>
      )}
    </>
  )

  if (disabled) {
    return <article className={className}>{content}</article>
  }

  return (
    <Link
      href={`${BOOKINGS_ROUTE}/${booking.id}`}
      className={`${className} motion-safe:transition-shadow hover:shadow-md`}
    >
      {content}
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card border border-ui bg-white p-4" aria-hidden="true">
      <div className="mb-3 flex justify-between">
        <div className="h-5 w-36 rounded bg-surface" />
        <div className="h-5 w-20 rounded-full bg-surface" />
      </div>
      <div className="mb-2 h-4 w-48 rounded bg-surface" />
      <div className="h-3 w-32 rounded bg-surface" />
    </div>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const { accessToken, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (hasHydrated && accessToken === null) {
      router.replace('/login')
    }
  }, [accessToken, hasHydrated, router])

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'customer'],
    queryFn: () => api.bookings.list(accessToken ?? ''),
    enabled: !!accessToken,
  })

  const displayBookings = getCustomerBookings(bookings ?? [])
  const isShowingMockBookings =
    hasHydrated && !!accessToken && !isLoading && (!bookings || bookings.length === 0)

  return (
    <main className="min-h-screen bg-surface pb-24">
      <div className="bg-favour-dark px-4 pb-5 pt-12">
        <Link
          href={FEED_ROUTE}
          className="font-mono text-[11px] font-bold tracking-[0.08em] text-white/60 motion-safe:transition-colors duration-150 hover:text-white/90"
        >
          Back to feed
        </Link>
        <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight text-white">
          My Bookings
        </h1>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {isLoading || !hasHydrated || !accessToken ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {isShowingMockBookings && (
              <div className="rounded-card border border-dashed border-favour-blue/30 bg-white px-4 py-3">
                <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-favour-blue">
                  SAMPLE BOOKINGS
                </p>
                <p className="mt-1 font-sans text-[13px] leading-relaxed text-ink-700">
                  Live bookings are empty right now, so these preview cards are shown to keep the page from feeling blank.
                </p>
              </div>
            )}
            {displayBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                disabled={booking.id.startsWith('mock-booking-')}
              />
            ))}
          </>
        )}
      </div>
    </main>
  )
}
