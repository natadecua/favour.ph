import Link from 'next/link'
import type { BookingStatus } from '@favour/shared'
import { CheckCircle, MessageCircle } from 'lucide-react'

interface BookingConfirmedProps {
  referenceCode: string
  providerName: string
  scheduledAt: string
  status: BookingStatus
}

function formatScheduledAt(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  })
}

export function BookingConfirmed({
  referenceCode,
  providerName,
  scheduledAt,
  status,
}: BookingConfirmedProps) {
  const isConfirmed = status === 'CONFIRMED'

  return (
    <div className="flex flex-col gap-4">
      {/* Success header */}
      <div className="bg-verify-green rounded-card p-5 flex items-start gap-3">
        <CheckCircle
          size={28}
          className="text-white shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-display font-extrabold text-[20px] text-white leading-snug">
            {status === 'COMPLETED' ? 'Booking Completed' : 'Booking Confirmed'}
          </h2>
          <p className="font-sans text-[14px] text-white/80 mt-0.5">
            Your booking with {providerName} is confirmed.
          </p>
        </div>
      </div>

      {/* Reference code */}
      <div className="bg-white border border-ui rounded-card p-4">
        <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
          BOOKING REFERENCE
        </p>
        <p className="font-mono text-[24px] font-extrabold text-favour-dark tracking-tight">
          {referenceCode}
        </p>
      </div>

      {/* Scheduled date/time */}
      <div className="bg-white border border-ui rounded-card p-4">
        <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
          SCHEDULED FOR
        </p>
        <p className="font-sans text-[15px] font-semibold text-favour-dark">
          {formatScheduledAt(scheduledAt)}
        </p>
      </div>

      {/* Chat unlock banner — only when CONFIRMED */}
      {isConfirmed && (
        <div
          className="bg-favour-blue/10 border border-ui rounded-card p-4 flex items-center gap-3"
          role="status"
          aria-live="polite"
        >
          <MessageCircle
            size={22}
            className="text-favour-blue shrink-0"
            aria-hidden="true"
          />
          <p className="font-sans text-[14px] font-semibold text-favour-blue">
            Chat with {providerName} is now unlocked
          </p>
        </div>
      )}

      {/* Action links */}
      <div className="flex flex-col gap-3 pt-1">
        <Link
          href="/feed/bookings"
          className="flex items-center justify-center h-btn rounded-btn bg-favour-blue text-white font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
        >
          View My Bookings
        </Link>
        <Link
          href="/feed"
          className="flex items-center justify-center h-btn rounded-btn border border-ui text-favour-blue font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
        >
          Book Another Service
        </Link>
      </div>
    </div>
  )
}
