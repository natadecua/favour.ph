import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'

export default function FeedLoading() {
  return (
    <main className="min-h-screen bg-surface pb-24" aria-busy="true" aria-label="Loading providers">
      {/* Header skeleton */}
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-[28px] w-[180px] rounded bg-white/20" />
          <div className="h-[16px] w-[260px] rounded bg-white/10" />
        </div>
      </div>

      {/* Category nav skeleton */}
      <div className="bg-white border-b border-ui">
        <div className="flex gap-2 px-4 py-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse shrink-0 h-[36px] rounded-pill bg-surface"
              style={{ width: i === 0 ? 52 : 72 + (i % 3) * 16 }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Provider card skeletons */}
      <div className="px-4 pt-4">
        <ul className="flex flex-col gap-3" role="list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <ProviderCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
