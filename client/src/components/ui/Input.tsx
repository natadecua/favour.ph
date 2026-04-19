import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-[14px] font-body text-[15px] text-favour-dark',
        'bg-white border border-ui border-border-ui rounded-input',
        'placeholder:text-ink-400 outline-none touch-target',
        'focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid',
        'motion-safe:transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
}
