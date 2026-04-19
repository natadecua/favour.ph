import { cn } from '@/lib/cn'

export function FieldLabel({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] block mb-1.5',
        className
      )}
    >
      {children}
    </label>
  )
}
