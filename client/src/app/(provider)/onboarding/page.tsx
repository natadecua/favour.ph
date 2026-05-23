'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { CreateProviderInput, Role, ServiceCategory } from '@favour/shared'
import { StepConfirm } from './StepConfirm'
import { StepProfile } from './StepProfile'
import { StepServices } from './StepServices'
import { StepType } from './StepType'
import type { ServiceEntry } from './StepServices'

interface OnboardingState {
  type: 'BUSINESS' | 'FREELANCER' | null
  displayName: string
  bio: string
  city: string
  photoPath: string | null
  services: ServiceEntry[]
}

const STEP_LABELS = ['TYPE', 'PROFILE', 'SERVICES', 'CONFIRM'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { accessToken, setSession } = useAuthStore()
  const [step, setStep] = useState(0)
  const [state, setState] = useState<OnboardingState>({
    type: null,
    displayName: '',
    bio: '',
    city: '',
    photoPath: null,
    services: [{ name: '', category: '', priceMin: '', priceMax: '', duration: '' }],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(partial: Partial<OnboardingState>) {
    setState((current) => ({ ...current, ...partial }))
  }

  function buildPayload(): CreateProviderInput | null {
    if (!state.type) return null

    const services = state.services.map((service) => ({
      name: service.name.trim(),
      category: service.category as ServiceCategory,
      priceMin: Number.parseInt(service.priceMin, 10),
      priceMax: Number.parseInt(service.priceMax, 10),
      ...(service.duration.trim() ? { duration: service.duration.trim() } : {}),
    }))

    return {
      type: state.type,
      displayName: state.displayName.trim(),
      city: state.city.trim(),
      services,
      ...(state.bio.trim() ? { bio: state.bio.trim() } : {}),
      ...(state.photoPath ? { photoPath: state.photoPath } : {}),
    }
  }

  async function handleSubmit() {
    if (!accessToken) {
      setError('Sign in again before creating your profile.')
      return
    }

    const payload = buildPayload()
    if (!payload) {
      setError('Choose a provider type before continuing.')
      setStep(0)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await api.providers.create(payload, accessToken)
      const me = await api.auth.me(accessToken)
      setSession({
        userId: me.userId,
        role: me.role as Role,
        providerId: me.providerId,
        accessToken,
      })
      router.replace('/dashboard')
    } catch (err: any) {
      if (err?.status === 409) {
        const me = await api.auth.me(accessToken)
        setSession({ userId: me.userId, role: me.role as Role, providerId: me.providerId, accessToken })
        router.replace('/dashboard')
        return
      }
      setError(err?.message ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="bg-favour-dark px-4 pb-5 pt-12">
        <div className="mx-auto w-full max-w-[640px]">
          <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-white/55">
            {step + 1} OF {STEP_LABELS.length} - {STEP_LABELS[step]}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-1" aria-hidden="true">
            {STEP_LABELS.map((label, index) => (
              <div
                key={label}
                className={`h-[3px] rounded-full ${
                  index <= step ? 'bg-white' : 'bg-white/20'
                } motion-safe:transition-colors`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {step === 0 && (
          <StepType
            value={state.type}
            onSelect={(type) => {
              patch({ type })
              setStep(1)
            }}
          />
        )}
        {step === 1 && (
          <StepProfile
            values={{
              displayName: state.displayName,
              bio: state.bio,
              city: state.city,
              photoPath: state.photoPath,
            }}
            token={accessToken}
            onChange={patch}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepServices
            services={state.services}
            onChange={(services) => patch({ services })}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepConfirm
            state={state}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </main>
  )
}
