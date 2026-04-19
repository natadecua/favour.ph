import { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@favour/shared'

interface FeedPageProps {
  searchParams: { category?: string }
}

async function ProviderList({ category }: { category?: string }) {
  const params: Record<string, string> = {}
  if (category) params.category = category

  const providers = await api.providers.feed(params)

  if (providers.length === 0) {
    const categoryLabel = category
      ? (SERVICE_CATEGORY_LABELS[category as keyof typeof SERVICE_CATEGORY_LABELS] ?? category)
      : null

    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <div className="w-[64px] h-[64px] rounded-[10px] bg-surface flex items-center justify-center mb-4">
          <span className="font-mono text-[28px]" aria-hidden="true">
            🔍
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[20px] text-favour-dark mb-2">
          No providers found
        </h2>
        <p className="font-sans text-[14px] text-ink-700 max-w-[320px] leading-relaxed">
          {categoryLabel
            ? `No ${categoryLabel} providers in Batangas City yet. We're onboarding more — check back soon or try another category.`
            : "No providers in Batangas City yet. We're onboarding more — check back soon."}
        </p>
        {category && (
          <Link
            href="/feed"
            className="mt-6 font-display font-extrabold text-[15px] text-favour-blue touch-target flex items-center justify-center"
          >
            Browse all categories
          </Link>
        )}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3" role="list">
      {providers.map((provider) => (
        <li key={provider.id}>
          <ProviderCard provider={provider} />
        </li>
      ))}
    </ul>
  )
}

function ProviderListSkeleton() {
  return (
    <ul className="flex flex-col gap-3" role="list" aria-label="Loading providers">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i}>
          <ProviderCardSkeleton />
        </li>
      ))}
    </ul>
  )
}

export default function FeedPage({ searchParams }: FeedPageProps) {
  const activeCategory = searchParams.category ?? null

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <h1 className="font-display font-extrabold text-[26px] text-white leading-tight">
          Find a Provider
        </h1>
        <p className="font-sans text-[14px] text-white/70 mt-1">
          Verified home service providers in Batangas City
        </p>
      </div>

      {/* Category filter nav */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-ui"
        role="navigation"
        aria-label="Filter by category"
      >
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* All option */}
          <Link
            href="/feed"
            className={cn(
              'shrink-0 inline-flex items-center h-[36px] px-4 rounded-pill border border-ui',
              'font-mono text-[12px] font-bold tracking-[0.04em] touch-target',
              'motion-safe:transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue',
              activeCategory === null
                ? 'bg-favour-blue text-white border-favour-blue'
                : 'bg-white text-ink-700 hover:border-favour-blue hover:text-favour-blue'
            )}
            aria-current={activeCategory === null ? 'page' : undefined}
          >
            ALL
          </Link>

          {SERVICE_CATEGORIES.map((cat) => {
            const label = SERVICE_CATEGORY_LABELS[cat]
            const isActive = activeCategory === cat
            return (
              <Link
                key={cat}
                href={`/feed?category=${cat}`}
                className={cn(
                  'shrink-0 inline-flex items-center h-[36px] px-4 rounded-pill border border-ui',
                  'font-mono text-[12px] font-bold tracking-[0.04em] touch-target',
                  'motion-safe:transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue',
                  isActive
                    ? 'bg-favour-blue text-white border-favour-blue'
                    : 'bg-white text-ink-700 hover:border-favour-blue hover:text-favour-blue'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {label.toUpperCase()}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Provider list */}
      <div className="px-4 pt-4">
        <Suspense fallback={<ProviderListSkeleton />}>
          <ProviderList category={activeCategory ?? undefined} />
        </Suspense>
      </div>
    </main>
  )
}
