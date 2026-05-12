'use client'

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'
import type { ServiceEntry } from './StepServices'

interface OnboardingState {
  type: 'BUSINESS' | 'FREELANCER' | null
  displayName: string
  bio: string
  city: string
  photoPath: string | null
  services: ServiceEntry[]
}

interface StepConfirmProps {
  state: OnboardingState
  submitting: boolean
  error: string | null
  onSubmit: () => void
  onBack: () => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-ink-400">{label}</p>
      <p className="break-words font-body text-[14px] leading-relaxed text-favour-dark">{value}</p>
    </div>
  )
}

export function StepConfirm({ state, submitting, error, onSubmit, onBack }: StepConfirmProps) {
  return (
    <section className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-[25px] font-extrabold leading-tight text-favour-dark">
          Review and confirm
        </h1>
        <p className="max-w-[46ch] font-body text-[14px] leading-relaxed text-ink-700">
          Check the details before your profile goes live.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-card border border-danger bg-danger/10 p-4">
          <p className="font-body text-[14px] font-semibold text-danger">{error}</p>
        </div>
      )}

      <div className="rounded-card border border-border-ui bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-verify-green" aria-hidden="true" />
          <p className="font-sans text-[15px] font-extrabold text-favour-dark">Profile</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="TYPE" value={state.type === 'BUSINESS' ? 'Business' : 'Freelancer'} />
          <Row label="NAME" value={state.displayName} />
          <Row label="CITY" value={state.city} />
          <Row label="PHOTO" value={state.photoPath ? 'Uploaded' : 'Not added'} />
          {state.bio.trim() && (
            <div className="sm:col-span-2">
              <Row label="ABOUT" value={state.bio} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-card border border-border-ui bg-white p-4">
        <p className="mb-1 font-sans text-[15px] font-extrabold text-favour-dark">Services</p>
        <div className="divide-y divide-border-ui">
          {state.services.map((service, index) => {
            const min = Number.parseInt(service.priceMin, 10).toLocaleString()
            const max = Number.parseInt(service.priceMax, 10).toLocaleString()
            const category = service.category ? SERVICE_CATEGORY_LABELS[service.category] : ''
            return (
              <div key={`${service.name}-${index}`} className="grid gap-1 py-4 first:pt-3 last:pb-0">
                <p className="font-body text-[14px] font-semibold text-favour-dark">
                  {service.name}
                </p>
                <p className="font-mono text-[12px] leading-relaxed text-ink-700">
                  {category} | PHP {min} - {max}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Profile'}
        </Button>
      </div>
    </section>
  )
}
