import { cn } from '@/lib/cn'

type PillColor = 'blue' | 'green' | 'amber' | 'dark'

const colorClasses: Record<PillColor, string> = {
  blue:  'bg-favour-blue-light text-favour-blue border-favour-blue-mid',
  green: 'bg-green-light text-verify-green border-[#A7F3C0]',
  amber: 'bg-amber-light text-amber border-[#FCD34D]',
  dark:  'bg-surface text-favour-dark border-border-ui',
}

export function Pill({ children, color = 'blue', className }: { children: React.ReactNode; color?: PillColor; className?: string }) {
  return (
    <span className={cn('font-mono inline-flex items-center h-[26px] px-[10px] rounded-pill text-[11px] font-bold tracking-[0.04em] border border-ui', colorClasses[color], className)}>
      {children}
    </span>
  )
}
