'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Input } from '@/components/ui/Input'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@favour/shared'
import type { ServiceCategory } from '@favour/shared'

export interface ServiceEntry {
  name: string
  category: ServiceCategory | ''
  priceMin: string
  priceMax: string
  duration: string  // e.g. "60 min" — empty string means not set
}

interface StepServicesProps {
  services: ServiceEntry[]
  onChange: (services: ServiceEntry[]) => void
  onNext: () => void
  onBack: () => void
}

export function StepServices({ services, onChange, onNext, onBack }: StepServicesProps) {
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (services.length === 0) return 'Add at least one service.'

    for (let index = 0; index < services.length; index++) {
      const service = services[index]
      if (!service) return 'Check your service details.'
      const label = `Service ${index + 1}`
      const min = Number.parseInt(service.priceMin, 10)
      const max = Number.parseInt(service.priceMax, 10)

      if (service.name.trim().length < 2) return `${label}: add a service name.`
      if (!service.category) return `${label}: choose a category.`
      if (Number.isNaN(min) || min <= 0) return `${label}: enter a valid minimum price.`
      if (Number.isNaN(max) || max <= 0) return `${label}: enter a valid maximum price.`
      if (max < min) return `${label}: maximum price must be at least the minimum price.`
      if (max > 100_000) return `${label}: keep prices at PHP 100,000 or below.`
    }

    return null
  }

  function handleNext() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onNext()
  }

  function updateService(index: number, partial: Partial<ServiceEntry>) {
    onChange(services.map((service, i) => (i === index ? { ...service, ...partial } : service)))
  }

  function addService() {
    if (services.length >= 10) return
    onChange([...services, { name: '', category: '', priceMin: '', priceMax: '', duration: '' }])
  }

  function removeService(index: number) {
    onChange(services.filter((_, i) => i !== index))
  }

  return (
    <section className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-[25px] font-extrabold leading-tight text-favour-dark">
          Services and prices
        </h1>
        <p className="max-w-[46ch] font-body text-[14px] leading-relaxed text-ink-700">
          Add 1 to 10 services customers can book from your profile.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-card border border-danger bg-danger/10 p-4">
          <p className="font-body text-[14px] font-semibold text-danger">{error}</p>
        </div>
      )}

      <div className="grid gap-3">
        {services.map((service, index) => (
          <div key={index} className="rounded-card border border-border-ui bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-ink-400">
                SERVICE {index + 1}
              </p>
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="flex min-h-touch min-w-touch items-center justify-center rounded-input text-danger motion-safe:transition-colors hover:bg-danger/10"
                  aria-label={`Remove service ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <FieldLabel htmlFor={`service-name-${index}`}>NAME</FieldLabel>
                <Input
                  id={`service-name-${index}`}
                  value={service.name}
                  onChange={(event) => updateService(index, { name: event.target.value })}
                  placeholder="e.g. Aircon Cleaning"
                  maxLength={80}
                />
              </div>

              <div>
                <FieldLabel htmlFor={`service-category-${index}`}>CATEGORY</FieldLabel>
                <select
                  id={`service-category-${index}`}
                  value={service.category}
                  onChange={(event) =>
                    updateService(index, { category: event.target.value as ServiceEntry['category'] })
                  }
                  className="h-btn w-full rounded-input border border-border-ui bg-white px-4 font-body text-[15px] text-favour-dark outline-none focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid"
                >
                  <option value="">Select a category</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {SERVICE_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor={`service-min-${index}`}>MIN PHP</FieldLabel>
                  <Input
                    id={`service-min-${index}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100000}
                    value={service.priceMin}
                    onChange={(event) => updateService(index, { priceMin: event.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`service-max-${index}`}>MAX PHP</FieldLabel>
                  <Input
                    id={`service-max-${index}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100000}
                    value={service.priceMax}
                    onChange={(event) => updateService(index, { priceMax: event.target.value })}
                    placeholder="1500"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor={`service-duration-${index}`}>
                  DURATION <span className="font-body font-normal normal-case">(optional)</span>
                </FieldLabel>
                <Input
                  id={`service-duration-${index}`}
                  value={service.duration}
                  onChange={(event) => updateService(index, { duration: event.target.value })}
                  placeholder="e.g. 60 min, 2–3 hrs"
                  maxLength={30}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length < 10 && (
        <button
          type="button"
          onClick={addService}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-card border border-dashed border-border-ui bg-white font-mono text-[12px] font-bold tracking-[0.04em] text-favour-blue motion-safe:transition-colors hover:border-favour-blue"
        >
          <Plus size={17} aria-hidden="true" />
          ADD SERVICE
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </section>
  )
}
