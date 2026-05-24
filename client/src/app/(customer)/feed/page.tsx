import { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { BOOKINGS_ROUTE, FEED_ROUTE, getFeedProviders } from '@/lib/app-state'
import { cn } from '@/lib/cn'
import { SearchInput } from '@/components/feed/SearchInput'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@favour/shared'

interface FeedPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function toUrlSearchParams(searchParams: FeedPageProps['searchParams']) {
  const params = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
      return
    }

    if (value !== undefined) {
      params.set(key, value)
    }
  })

  return params
}

function feedHref(searchParams: FeedPageProps['searchParams'], category?: string) {
  const params = toUrlSearchParams(searchParams)

  if (category) {
    params.set('category', category)
  } else {
    params.delete('category')
  }

  params.delete('page')

  const queryString = params.toString()
  return queryString ? `${FEED_ROUTE}?${queryString}` : FEED_ROUTE
}

function clearSearchHref(searchParams: FeedPageProps['searchParams']) {
  const params = toUrlSearchParams(searchParams)
  params.delete('q')
  params.delete('page')

  const queryString = params.toString()
  return queryString ? `${FEED_ROUTE}?${queryString}` : FEED_ROUTE
}

async function ProviderList({
  params,
  category,
  browseAllHref,
  clearSearchHref,
}: {
  params: Record<string, string>
  category?: string
  browseAllHref: string
  clearSearchHref: string
}) {
  const feedParams = { ...params }
  if (!feedParams.q?.trim()) delete feedParams.q
  const query = feedParams.q?.trim()

  const liveProviders = await api.providers.feed(feedParams).catch(() => [])
  const providers = getFeedProviders(liveProviders)
  const isShowingMockProviders = liveProviders.length === 0

  if (providers.length === 0) {
    const categoryLabel = category
      ? (SERVICE_CATEGORY_LABELS[category as keyof typeof SERVICE_CATEGORY_LABELS] ?? category)
      : null

    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <h2 className="font-display font-extrabold text-[20px] text-favour-dark mb-2">
          {query ? 'No providers match your search' : 'No providers found'}
        </h2>
        <p className="font-sans text-[14px] text-ink-700 max-w-[320px] leading-relaxed">
          {query
            ? 'Try a different keyword or clear your search to see more providers.'
            : categoryLabel
              ? `No ${categoryLabel} providers in Batangas City yet. We're onboarding more - check back soon or try another category.`
              : "No providers in Batangas City yet. We're onboarding more - check back soon."}
        </p>
        {query && (
          <Link
            href={clearSearchHref}
            className="mt-6 font-display font-extrabold text-[15px] text-favour-blue touch-target flex items-center justify-center"
          >
            Clear search
          </Link>
        )}
        {category && (
          <Link
            href={browseAllHref}
            className="mt-4 font-display font-extrabold text-[15px] text-favour-blue touch-target flex items-center justify-center"
          >
            Browse all categories
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {isShowingMockProviders && (
        <div className="rounded-card border border-dashed border-favour-blue/30 bg-white px-4 py-3">
          <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-favour-blue">
            SAMPLE PROVIDERS
          </p>
          <p className="mt-1 font-sans text-[13px] leading-relaxed text-ink-700">
            Live providers are still empty, so these preview cards are shown for now.
          </p>
        </div>
      )}
      <ul className="flex flex-col gap-3" role="list">
        {providers.map((provider) => (
          <li key={provider.id}>
            <ProviderCard provider={provider} disabled={provider.id.startsWith('mock-provider-')} />
          </li>
        ))}
      </ul>
    </div>
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
  const activeCategory = firstParam(searchParams.category) ?? null
  const apiParams = Object.fromEntries(toUrlSearchParams(searchParams))
  const browseAllHref = feedHref(searchParams)
  const clearSearchLink = clearSearchHref(searchParams)

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-[26px] text-white leading-tight">
              Find a Provider
            </h1>
            <p className="font-sans text-[14px] text-white/70 mt-1">
              Verified home service providers in Batangas City
            </p>
          </div>
          <Link
            href={BOOKINGS_ROUTE}
            className="shrink-0 font-mono text-[11px] font-bold text-white/70 tracking-[0.08em] hover:text-white motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            MY BOOKINGS
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white px-4 py-3 border-b border-ui">
        <SearchInput />
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
            href={browseAllHref}
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
                href={feedHref(searchParams, cat)}
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
          <ProviderList
            params={apiParams}
            category={activeCategory ?? undefined}
            browseAllHref={browseAllHref}
            clearSearchHref={clearSearchLink}
          />
        </Suspense>
      </div>
    </main>
  )
}
