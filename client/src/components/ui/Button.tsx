import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
}

export function Button({ children, variant = 'primary', fullWidth, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'h-btn rounded-btn font-sans text-[17px] font-extrabold cursor-pointer',
        'touch-target motion-safe:transition-opacity duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-favour-blue text-white border-0',
        variant === 'ghost' && 'bg-transparent text-favour-blue border border-ui border-favour-blue',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
