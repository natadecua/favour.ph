'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FEED_ROUTE, PROVIDER_DASHBOARD_ROUTE, PROVIDER_ONBOARDING_ROUTE } from '@/lib/app-state'
import { useAuthStore } from '@/stores/auth'

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { role, providerId, hasHydrated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!hasHydrated) {
      return
    }
    if (role !== null && role !== 'PROVIDER') {
      router.replace(FEED_ROUTE)
      return
    }
    if (role === 'PROVIDER' && providerId === null && pathname !== PROVIDER_ONBOARDING_ROUTE) {
      router.replace(PROVIDER_ONBOARDING_ROUTE)
      return
    }
    if (role === 'PROVIDER' && providerId !== null && pathname === PROVIDER_ONBOARDING_ROUTE) {
      router.replace(PROVIDER_DASHBOARD_ROUTE)
    }
  }, [hasHydrated, role, providerId, pathname, router])

  if (!hasHydrated || role !== 'PROVIDER') {
    return null
  }

  return <>{children}</>
}
