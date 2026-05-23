'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
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

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block bg-white border border-ui rounded-card p-4 motion-safe:transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-mono text-[18px] font-extrabold text-favour-dark leading-none">
          {booking.referenceCode}
        </p>
        <BookingStatusBadge status={booking.status} />
      </div>
      {booking.service && (
        <p className="font-sans text-[14px] font-semibold text-favour-dark mt-1">
          {booking.service.name}
        </p>
      )}
      {booking.provider && (
        <p className="font-sans text-[13px] text-ink-700 mt-0.5">
          {booking.provider.displayName}
        </p>
      )}
      <p className="font-mono text-[12px] text-ink-400 mt-2 tracking-[0.02em]">
        {formatDate(booking.datetime)}
      </p>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-ui rounded-card p-4 animate-pulse" aria-hidden="true">
      <div className="flex justify-between mb-3">
        <div className="h-5 w-36 bg-surface rounded" />
        <div className="h-5 w-20 bg-surface rounded-full" />
      </div>
      <div className="h-4 w-48 bg-surface rounded mb-2" />
      <div className="h-3 w-32 bg-surface rounded" />
    </div>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (accessToken === null) {
      router.replace('/auth/login')
    }
  }, [accessToken, router])

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'customer'],
    queryFn: () => api.bookings.list(accessToken ?? ''),
    enabled: !!accessToken,
  })

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <Link
          href="/feed"
          className="font-mono text-[11px] font-bold text-white/60 tracking-[0.08em] hover:text-white/90 motion-safe:transition-colors duration-150"
        >
          ← BACK TO FEED
        </Link>
        <h1 className="font-display font-extrabold text-[26px] text-white leading-tight mt-3">
          My Bookings
        </h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {isLoading || !accessToken ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !bookings || bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-[64px] h-[64px] rounded-[10px] bg-white border border-ui flex items-center justify-center mb-4">
              <span className="font-mono text-[28px]" aria-hidden="true">📋</span>
            </div>
            <h2 className="font-display font-extrabold text-[20px] text-favour-dark mb-2">
              No bookings yet
            </h2>
            <p className="font-sans text-[14px] text-ink-700 max-w-[300px] leading-relaxed">
              Find a provider and request a service to get started.
            </p>
            <Link
              href="/feed"
              className="mt-6 flex items-center justify-center h-btn rounded-btn bg-favour-blue text-white font-display font-extrabold text-[17px] touch-target px-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
            >
              Find a Provider
            </Link>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </main>
  )
}
