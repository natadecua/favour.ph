'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { SERVICE_CATEGORY_LABELS, type Service } from '@favour/shared'
import { api } from '@/lib/api'
import { BOOKINGS_ROUTE, LOGIN_ROUTE } from '@/lib/app-state'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'

interface BookPageProps {
  params: { providerId: string }
}

function toDatetimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function datetimeLocalToIso(value: string) {
  return new Date(value).toISOString()
}

function formatPesoRange(service: Service) {
  const min = service.priceMin.toLocaleString('en-PH')
  const max = service.priceMax.toLocaleString('en-PH')

  return service.priceMin === service.priceMax ? `PHP ${min}` : `PHP ${min} - ${max}`
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [datetime, setDatetime] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    data: provider,
    isLoading: loadingProvider,
    isError: providerError,
  } = useQuery({
    queryKey: ['provider', params.providerId],
    queryFn: () => api.providers.getById(params.providerId),
    enabled: !!accessToken,
    retry: false,
  })

  const minDatetime = useMemo(() => {
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60_000)
    return toDatetimeLocalValue(fiveMinutesFromNow)
  }, [])

  const services = useMemo(() => provider?.services ?? [], [provider?.services])
  const providerName = provider?.displayName ?? 'Provider'
  const selectedService = services.find((service) => service.id === selectedServiceId)

  useEffect(() => {
    if (accessToken === null) {
      router.replace(LOGIN_ROUTE)
    }
  }, [accessToken, router])

  useEffect(() => {
    if (providerError) {
      setError('Unable to load this provider. Please go back and try again.')
    }
  }, [providerError])

  useEffect(() => {
    if (services.length === 0) {
      if (selectedServiceId) {
        setSelectedServiceId('')
      }
      return
    }

    if (services.some((service) => service.id === selectedServiceId)) return

    setSelectedServiceId(services[0].id)
  }, [selectedServiceId, services])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!accessToken) {
      router.replace(LOGIN_ROUTE)
      return
    }

    if (!selectedServiceId) {
      setError('Please choose a service.')
      return
    }

    if (!datetime) {
      setError('Please choose a date and time.')
      return
    }

    if (address.trim().length < 10) {
      setError('Please enter the full service address.')
      return
    }

    setSubmitting(true)
    try {
      const datetimeIso = datetimeLocalToIso(datetime)
      if (new Date(datetimeIso) <= new Date()) {
        setError('Please choose a future date and time.')
        return
      }

      const booking = await api.bookings.create(
        {
          serviceId: selectedServiceId,
          providerId: params.providerId,
          datetime: datetimeIso,
          address: address.trim(),
          notes: notes.trim() || undefined,
          isUrgent: false,
        },
        accessToken
      )

      router.push(`${BOOKINGS_ROUTE}/${booking.id}`)
    } catch (err) {
      setError(
        err instanceof RangeError
          ? 'Please choose a valid date and time.'
          : 'Failed to create booking. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface pb-12">
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <h1 className="font-display font-extrabold text-[24px] text-white leading-snug">
          Request Booking
        </h1>
        <p className="font-sans text-[14px] text-white/70 mt-1">
          Choose a service from {providerName} and tell us when to send help.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 pt-6 flex flex-col gap-5"
        aria-busy={loadingProvider || submitting}
        noValidate
      >
        {(loadingProvider || submitting) && (
          <p className="sr-only" role="status">
            {loadingProvider ? 'Loading provider services.' : 'Submitting booking.'}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="bg-danger/10 border border-danger/30 rounded-card p-4"
          >
            <p className="font-sans text-[14px] font-semibold text-danger">{error}</p>
          </div>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend
            id="service-picker-label"
            className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] block mb-1.5"
          >
            SERVICE
          </legend>
          {loadingProvider ? (
            <div
              className="flex flex-col gap-2"
              aria-busy="true"
              aria-labelledby="service-picker-label"
              role="status"
            >
              <span className="sr-only">Loading provider services.</span>
              <div className="h-[76px] rounded-card border border-ui bg-white animate-pulse" />
              <div className="h-[76px] rounded-card border border-ui bg-white animate-pulse" />
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-card border border-ui bg-white p-4">
              <p className="font-sans text-[14px] font-semibold text-favour-dark">
                This provider has no services available for booking yet.
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col gap-2"
              aria-labelledby="service-picker-label"
            >
              {services.map((service) => {
                const categoryLabel =
                  SERVICE_CATEGORY_LABELS[
                    service.category as keyof typeof SERVICE_CATEGORY_LABELS
                  ] ?? service.category
                const selected = selectedServiceId === service.id

                return (
                  <label
                    key={service.id}
                    className={[
                      'w-full rounded-card border bg-white p-4 text-left cursor-pointer',
                      'motion-safe:transition-colors duration-150',
                      'focus-within:outline-none focus-within:ring-2 focus-within:ring-favour-blue focus-within:ring-offset-2',
                      selected
                        ? 'border-favour-blue ring-1 ring-favour-blue-mid'
                        : 'border-ui hover:border-favour-blue/60',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      checked={selected}
                      onChange={() => setSelectedServiceId(service.id)}
                      required
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-sans text-[15px] font-semibold text-favour-dark leading-snug">
                          {service.name}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-sans text-[13px] text-ink-700">
                            {categoryLabel}
                          </span>
                          {service.duration && (
                            <span className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.04em]">
                              {service.duration}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-right font-mono text-[13px] font-extrabold text-favour-dark">
                        {formatPesoRange(service)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="datetime">DATE &amp; TIME</FieldLabel>
          <Input
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={(event) => setDatetime(event.target.value)}
            required
            min={minDatetime}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="address">SERVICE ADDRESS</FieldLabel>
          <textarea
            id="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            rows={3}
            placeholder="Enter your full address in Batangas City"
            className="w-full border border-ui rounded-input bg-white px-4 py-3 font-sans text-[15px] text-favour-dark placeholder:text-ink-400 focus:outline-none focus:border-favour-blue focus:ring-2 focus:ring-favour-blue/20 motion-safe:transition-colors duration-150 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="notes">
            ADDITIONAL NOTES{' '}
            <span className="font-sans text-[11px] font-normal text-ink-400 normal-case">
              (optional)
            </span>
          </FieldLabel>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Describe the issue or any special instructions"
            className="w-full border border-ui rounded-input bg-white px-4 py-3 font-sans text-[15px] text-favour-dark placeholder:text-ink-400 focus:outline-none focus:border-favour-blue focus:ring-2 focus:ring-favour-blue/20 motion-safe:transition-colors duration-150 resize-none"
          />
        </div>

        {selectedService && (
          <div className="rounded-card border border-ui bg-white p-4">
            <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-2">
              BOOKING SUMMARY
            </p>
            <p className="font-sans text-[14px] font-semibold text-favour-dark">
              {selectedService.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="font-mono text-[15px] font-extrabold text-favour-dark">
                {formatPesoRange(selectedService)}
              </p>
              {selectedService.duration && (
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.04em]">
                  {selectedService.duration}
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loadingProvider || submitting || services.length === 0}
          className="w-full mt-2"
        >
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </form>
    </main>
  )
}
