import { notFound } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { BookingConfirmed } from '@/components/bookings/BookingConfirmed'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'

interface BookingPageProps {
  params: { id: string }
}

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

export default async function BookingPage({ params }: BookingPageProps) {
  const booking = await api.bookings.getById(params.id, '').catch(() => null)

  if (!booking) notFound()

  const showConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'

  return (
    <main className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <Link
          href="/feed"
          className="font-mono text-[12px] font-bold text-white/60 tracking-[0.08em] hover:text-white/90 motion-safe:transition-colors duration-150"
        >
          ← BACK TO FEED
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
            scheduledAt={booking.scheduledAt}
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
                {formatDate(booking.scheduledAt)}
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
          href="/feed"
          className="flex items-center justify-center h-btn rounded-btn border border-ui text-favour-blue font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2 mt-2"
        >
          Back to Feed
        </Link>
      </div>
    </main>
  )
}
