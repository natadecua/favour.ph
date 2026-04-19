import Link from 'next/link'
import type { ProviderSummary } from '@favour/shared'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'
import { cn } from '@/lib/cn'
import { Pill } from '@/components/ui/Pill'

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

interface ProviderCardProps {
  provider: ProviderSummary
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const { id, displayName, type, category, favourScore, baseRate, city, avatarUrl } = provider

  const categoryLabel =
    SERVICE_CATEGORY_LABELS[category as keyof typeof SERVICE_CATEGORY_LABELS] ?? category

  return (
    <Link
      href={`/feed/providers/${id}`}
      className={cn(
        'group flex gap-4 bg-white border border-ui rounded-card p-4',
        'motion-safe:transition-shadow duration-150 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2'
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-[64px] h-[64px] rounded-[10px] object-cover bg-surface"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-[64px] h-[64px] rounded-[10px] bg-surface flex items-center justify-center"
          >
            <span className="font-mono text-[18px] font-bold text-ink-400 select-none">
              {getInitials(displayName)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Name + type pill */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-extrabold text-[16px] text-favour-dark leading-snug truncate">
            {displayName}
          </h3>
          <Pill color={type === 'BUSINESS' ? 'blue' : 'green'} className="shrink-0">
            {type === 'BUSINESS' ? 'BUSINESS' : 'FREELANCER'}
          </Pill>
        </div>

        {/* Category + city */}
        <p className="font-sans text-[13px] text-ink-700 mt-0.5 truncate">
          {categoryLabel} · {city}
        </p>

        {/* Score + rate row */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">
              SCORE
            </span>
            <span className="font-mono text-[15px] font-extrabold text-favour-dark">
              {favourScore.toFixed(2)}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">
              FROM
            </span>
            <span className="font-mono text-[15px] font-extrabold text-favour-dark">
              PHP {baseRate.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
