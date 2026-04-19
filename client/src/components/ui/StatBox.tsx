import { cn } from '@/lib/cn'

export function StatBox({
  label,
  value,
  sub,
  accentClass,
}: {
  label: string
  value: string | number
  sub?: string
  accentClass?: string
}) {
  return (
    <div className="flex-1 bg-white border border-ui rounded-[10px] p-3 text-center">
      <div className={cn('font-mono text-[20px] font-extrabold tracking-tight', accentClass ?? 'text-favour-dark')}>
        {value}
      </div>
      <div className="font-sans text-[11px] font-bold text-ink-700 mt-0.5">
        {label}
      </div>
      {sub && (
        <div className="font-body text-[10px] text-ink-400 mt-px">{sub}</div>
      )}
    </div>
  )
}
