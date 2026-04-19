export function ProviderCardSkeleton() {
  return (
    <div
      className="flex gap-4 bg-white border border-ui rounded-card p-4 animate-pulse"
      aria-hidden="true"
    >
      {/* Avatar skeleton */}
      <div className="shrink-0 w-[64px] h-[64px] rounded-[10px] bg-surface" />

      {/* Body skeleton */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Name + pill row */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-[18px] w-[140px] rounded bg-surface" />
          <div className="h-[26px] w-[76px] rounded-pill bg-surface" />
        </div>

        {/* Category + city */}
        <div className="h-[13px] w-[110px] rounded bg-surface" />

        {/* Score + rate row */}
        <div className="flex gap-4 mt-1">
          <div className="h-[15px] w-[72px] rounded bg-surface" />
          <div className="h-[15px] w-[88px] rounded bg-surface" />
        </div>
      </div>
    </div>
  )
}
