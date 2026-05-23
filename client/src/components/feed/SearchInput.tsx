'use client'

import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'

const SEARCH_DEBOUNCE_MS = 300

export function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const currentQuery = searchParams.get('q') ?? ''
  const [value, setValue] = useState(currentQuery)

  useEffect(() => {
    setValue(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextQuery = value.trim()

      if (nextQuery === currentQuery) return

      const params = new URLSearchParams(searchParamsString)
      if (nextQuery) {
        params.set('q', nextQuery)
      } else {
        params.delete('q')
      }
      params.delete('page')

      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [currentQuery, pathname, router, searchParamsString, value])

  return (
    <div className="relative">
      <label htmlFor="provider-search" className="sr-only">
        Search providers
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        aria-hidden="true"
      />
      <Input
        id="provider-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search providers or services"
        className="pr-11 pl-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 hover:text-favour-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
