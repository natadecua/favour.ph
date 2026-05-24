'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LOGIN_ROUTE } from '@/lib/app-state'

export default function LegacyAuthLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(LOGIN_ROUTE)
  }, [router])

  return null
}
