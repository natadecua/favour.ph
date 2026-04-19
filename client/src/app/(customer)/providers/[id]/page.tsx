import { notFound } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { FavourScoreBanner } from '@/components/ui/FavourScoreBanner'
import { StatBox } from '@/components/ui/StatBox'
import { Pill } from '@/components/ui/Pill'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'

interface ProviderPageProps {
  params: { id: string }
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const provider = await api.providers.getById(params.id).catch(() => null)

  if (!provider) notFound()

  const categoryLabel =
    SERVICE_CATEGORY_LABELS[provider.category as keyof typeof SERVICE_CATEGORY_LABELS] ??
    provider.category

  return (
    <main className="min-h-screen bg-surface pb-28">
      {/* Dark header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <div className="flex items-start gap-4">
          {provider.avatarUrl ? (
            <img
              src={provider.avatarUrl}
              alt={provider.displayName}
              className="w-[72px] h-[72px] rounded-[12px] object-cover bg-surface shrink-0"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-[12px] bg-favour-blue/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[22px] font-bold text-white select-none" aria-hidden="true">
                {provider.displayName.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-extrabold text-[22px] text-white leading-snug">
              {provider.displayName}
            </h1>
            <p className="font-sans text-[14px] text-white/70 mt-0.5">
              {categoryLabel} · {provider.city}
            </p>
            <div className="flex gap-2 mt-2">
              <Pill color={provider.type === 'BUSINESS' ? 'blue' : 'green'}>
                {provider.type === 'BUSINESS' ? 'BUSINESS' : 'FREELANCER'}
              </Pill>
            </div>
          </div>
        </div>
      </div>

      {/* FavourScore banner */}
      <FavourScoreBanner score={provider.favourScore} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4">
        <StatBox value={String(provider.completedBookings)} label="Completed" />
        <StatBox value={`${provider.responseRate}%`} label="Response" accentClass="text-verify-green" />
        <StatBox value={String(provider.reviewCount)} label="Reviews" />
      </div>

      {/* Base rate */}
      <div className="mx-4 mt-3 bg-white border border-ui rounded-card p-4">
        <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
          STARTING FROM
        </p>
        <p className="font-mono text-[28px] font-extrabold text-favour-dark">
          PHP {provider.baseRate.toFixed(2)}
        </p>
      </div>

      {/* Bio */}
      {provider.bio && (
        <div className="mx-4 mt-3 bg-white border border-ui rounded-card p-4">
          <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-2">
            ABOUT
          </p>
          <p className="font-sans text-[15px] text-favour-dark leading-relaxed max-w-[65ch]">
            {provider.bio}
          </p>
        </div>
      )}

      {/* Years experience */}
      {provider.yearsExperience != null && (
        <div className="mx-4 mt-3">
          <p className="font-sans text-[14px] text-ink-700">
            <span className="font-mono font-bold text-favour-dark">{provider.yearsExperience}</span>{' '}
            years of experience
          </p>
        </div>
      )}

      {/* Sticky Book Now CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-ui px-4 py-4 z-20">
        <Link
          href={`/feed/book/${provider.id}`}
          className="flex items-center justify-center h-btn rounded-btn bg-favour-blue text-white font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
        >
          Book Now
        </Link>
      </div>
    </main>
  )
}
