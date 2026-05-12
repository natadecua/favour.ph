'use client'

import { BriefcaseBusiness, Check, UserRound } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StepTypeProps {
  value: 'BUSINESS' | 'FREELANCER' | null
  onSelect: (type: 'BUSINESS' | 'FREELANCER') => void
}

const options = [
  {
    value: 'FREELANCER',
    title: 'Freelancer',
    body: 'I offer services myself and manage my own schedule.',
    Icon: UserRound,
  },
  {
    value: 'BUSINESS',
    title: 'Business',
    body: 'I represent a shop, crew, or service company.',
    Icon: BriefcaseBusiness,
  },
] as const

export function StepType({ value, onSelect }: StepTypeProps) {
  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] font-bold tracking-[0.08em] text-ink-400">
          PROVIDER SETUP
        </p>
        <h1 className="font-sans text-[25px] font-extrabold leading-tight text-favour-dark">
          What kind of provider are you?
        </h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(({ value: optionValue, title, body, Icon }) => {
          const selected = value === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onSelect(optionValue)}
              className={cn(
                'min-h-[156px] rounded-card border bg-white p-4 text-left',
                'motion-safe:transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue',
                selected ? 'border-favour-blue bg-favour-blue-light' : 'border-border-ui'
              )}
              aria-pressed={selected}
            >
              <span className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[10px] border',
                    selected
                      ? 'border-favour-blue bg-white text-favour-blue'
                      : 'border-border-ui bg-surface text-ink-700'
                  )}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </span>
                {selected && (
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-favour-blue text-white"
                    aria-hidden="true"
                  >
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="mt-5 block font-sans text-[18px] font-extrabold text-favour-dark">
                {title}
              </span>
              <span className="mt-1.5 block font-body text-[14px] leading-relaxed text-ink-700">
                {body}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
