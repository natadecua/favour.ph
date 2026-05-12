'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { role, providerId } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (role !== null && role !== 'PROVIDER') {
      router.replace('/feed')
      return
    }
    if (role === 'PROVIDER' && providerId === null && pathname !== '/onboarding') {
      router.replace('/onboarding')
      return
    }
    if (role === 'PROVIDER' && providerId !== null && pathname === '/onboarding') {
      router.replace('/dashboard')
    }
  }, [role, providerId, pathname, router])

  if (role !== 'PROVIDER') {
    return null
  }

  return <>{children}</>
}
