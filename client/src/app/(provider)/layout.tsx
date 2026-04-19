'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (role !== null && role !== 'PROVIDER') {
      router.replace('/feed')
    }
  }, [role, router])

  if (role !== 'PROVIDER') {
    return null
  }

  return <>{children}</>
}
