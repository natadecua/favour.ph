import { cn } from '@/lib/cn'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'

export function ServiceRow({
  icon: Icon,
  name,
  price,
  selected,
  onSelect,
}: {
  icon: LucideIcon
  name: string
  price: string
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-[14px] touch-target',
        'border border-ui rounded-[10px] text-left',
        'motion-safe:transition-colors duration-150',
        selected
          ? 'border-favour-blue bg-favour-blue-light'
          : 'border-border-ui bg-white'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-input shrink-0 flex items-center justify-center',
          'border border-ui',
          selected ? 'bg-favour-blue border-favour-blue' : 'bg-surface border-border-ui'
        )}
        aria-hidden="true"
      >
        <Icon size={18} className={selected ? 'text-white' : 'text-ink-700'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-sans text-[15px] font-semibold text-favour-dark">{name}</div>
        <div className="font-mono text-[12px] font-bold text-ink-700 mt-0.5">{price}</div>
      </div>
      {selected && <CheckCircle2 size={20} className="text-favour-blue shrink-0" />}
    </button>
  )
}
