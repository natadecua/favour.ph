'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'
import type { Booking, BookingStatus } from '@favour/shared'

type TabFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED'

const TABS: { label: string; value: TabFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
]

const EMPTY_MESSAGES: Record<TabFilter, string> = {
  ALL: 'No bookings yet — share your profile link to start receiving requests.',
  PENDING: 'No pending bookings — when customers request your service, they\'ll appear here.',
  CONFIRMED: 'No confirmed bookings — confirm a pending request to see it here.',
  COMPLETED: 'No completed bookings — finish a confirmed job to see your history here.',
}

function SkeletonCard() {
  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-4 w-32 bg-[#F3F4F6] rounded" />
        <div className="h-6 w-20 bg-[#F3F4F6] rounded-full" />
      </div>
      <div className="h-3 w-48 bg-[#F3F4F6] rounded mb-2" />
      <div className="h-3 w-64 bg-[#F3F4F6] rounded mb-5" />
      <div className="flex gap-3">
        <div className="h-[52px] flex-1 bg-[#F3F4F6] rounded-[10px]" />
        <div className="h-[52px] flex-1 bg-[#F3F4F6] rounded-[10px]" />
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

interface BookingCardProps {
  booking: Booking
  onAction: () => void
  token: string
}

function BookingCard({ booking, onAction, token }: BookingCardProps) {
  const [busy, setBusy] = useState(false)

  async function handleRespond(action: 'confirm' | 'decline') {
    setBusy(true)
    try {
      await api.bookings.respond(booking.id, { action }, token)
      onAction()
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete() {
    setBusy(true)
    try {
      await api.bookings.complete(booking.id, token)
      onAction()
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="font-mono text-[13px] font-bold text-[#111827] tracking-wide uppercase"
          aria-label={`Reference code ${booking.referenceCode}`}
        >
          {booking.referenceCode}
        </span>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Details */}
      <dl className="flex flex-col gap-1">
        <div className="flex gap-2">
          <dt className="font-mono text-[11px] font-bold uppercase text-[#6B7280] min-w-[72px]">
            Scheduled
          </dt>
          <dd className="font-sans text-[13px] text-[#111827]">
            {formatDate(booking.scheduledAt)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-mono text-[11px] font-bold uppercase text-[#6B7280] min-w-[72px]">
            Address
          </dt>
          <dd className="font-sans text-[13px] text-[#111827] leading-snug">
            {booking.address}
          </dd>
        </div>
        {booking.notes && (
          <div className="flex gap-2">
            <dt className="font-mono text-[11px] font-bold uppercase text-[#6B7280] min-w-[72px]">
              Notes
            </dt>
            <dd className="font-sans text-[13px] text-[#6B7280] leading-snug">
              {booking.notes}
            </dd>
          </div>
        )}
      </dl>

      {/* Actions */}
      {booking.status === 'PENDING' && (
        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1 touch-target motion-safe:transition-opacity disabled:opacity-50"
            disabled={busy}
            onClick={() => handleRespond('confirm')}
          >
            {busy ? 'Confirming…' : 'Confirm'}
          </Button>
          <Button
            variant="ghost"
            className="flex-1 touch-target motion-safe:transition-opacity disabled:opacity-50"
            disabled={busy}
            onClick={() => handleRespond('decline')}
          >
            {busy ? 'Declining…' : 'Decline'}
          </Button>
        </div>
      )}

      {booking.status === 'CONFIRMED' && (
        <Button
          variant="primary"
          className="w-full touch-target motion-safe:transition-opacity disabled:opacity-50"
          disabled={busy}
          onClick={handleComplete}
        >
          {busy ? 'Marking complete…' : 'Mark Complete'}
        </Button>
      )}
    </article>
  )
}

export default function ProviderDashboardPage() {
  const { accessToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL')
  const queryClient = useQueryClient()

  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: () => api.bookings.list(accessToken!, 'provider'),
    enabled: !!accessToken,
  })

  function handleActionDone() {
    queryClient.invalidateQueries({ queryKey: ['provider-bookings'] })
  }

  const filtered: Booking[] = bookings
    ? activeTab === 'ALL'
      ? bookings
      : bookings.filter((b) => b.status === (activeTab as BookingStatus))
    : []

  return (
    <main className="min-h-screen bg-[#F3F4F6]">
      {/* Page header */}
      <header className="bg-[#111827] px-5 py-6">
        <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
          Bookings
        </h1>
        <p className="font-sans text-sm text-[#9CA3AF] mt-1">
          Manage your incoming and active service requests.
        </p>
      </header>

      <div className="px-5 pt-5 pb-10 max-w-2xl mx-auto flex flex-col gap-5">
        {/* Tab bar */}
        <nav
          role="tablist"
          aria-label="Filter bookings by status"
          className="flex gap-1 bg-white border border-[#E5E7EB] rounded-[12px] p-1"
        >
          {TABS.map(({ label, value }) => {
            const isActive = activeTab === value
            return (
              <button
                key={value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(value)}
                className={cn(
                  'flex-1 touch-target flex items-center justify-center rounded-[8px] font-display font-extrabold text-[13px] motion-safe:transition-colors',
                  isActive
                    ? 'bg-[#0047CC] text-white'
                    : 'text-[#6B7280] hover:text-[#111827]'
                )}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col gap-4" aria-label="Loading bookings" aria-busy="true">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            role="alert"
            className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 text-center flex flex-col gap-4"
          >
            <p className="font-sans text-[15px] text-[#D92121] font-semibold">
              Failed to load bookings.
            </p>
            <p className="font-sans text-sm text-[#6B7280]">
              Check your connection and try again.
            </p>
            <Button
              variant="ghost"
              className="mx-auto touch-target"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Booking list */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="flex flex-col gap-4" role="list" aria-label={`${activeTab.toLowerCase()} bookings`}>
            {filtered.map((booking) => (
              <div key={booking.id} role="listitem">
                <BookingCard
                  booking={booking}
                  token={accessToken!}
                  onAction={handleActionDone}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div
            className="bg-white border border-[#E5E7EB] rounded-[12px] p-8 text-center"
            aria-live="polite"
          >
            <p className="font-display font-extrabold text-[15px] text-[#111827] mb-2">
              {activeTab === 'ALL' ? 'No bookings yet' : `No ${activeTab.toLowerCase()} bookings`}
            </p>
            <p className="font-sans text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">
              {EMPTY_MESSAGES[activeTab]}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
