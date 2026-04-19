'use client'
import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { api } from '@/lib/api'
import type { Role } from '@favour/shared'

export default function VerifyPage() {
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSession = useAuthStore(s => s.setSession)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const stored = sessionStorage.getItem('favour_phone')
    if (!stored) window.location.href = '/login'
    else setPhone(stored)
  }, [])

  async function handleVerify() {
    setLoading(true)
    setError(null)

    const { data, error: otpError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    if (otpError || !data.session) {
      setLoading(false)
      setError(otpError?.message ?? 'Verification failed')
      return
    }

    try {
      const me = await api.auth.me(data.session.access_token)
      setSession({
        userId: me.userId,
        role: me.role as Role,
        providerId: me.providerId,
        accessToken: data.session.access_token,
      })
      sessionStorage.removeItem('favour_phone')
      window.location.href = me.role === 'PROVIDER' ? '/dashboard' : '/feed'
    } catch {
      setError('Failed to load your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white rounded-[16px] p-7">
        <h1 className="font-sans text-[22px] font-extrabold text-favour-dark mb-1.5">Enter your code</h1>
        <p className="font-body text-[14px] text-ink-700 mb-6">
          Sent to <strong className="font-semibold text-favour-dark">{phone}</strong>
        </p>

        <div className="mb-4">
          <FieldLabel htmlFor="otp">6-DIGIT CODE</FieldLabel>
          <input
            id="otp"
            type="text"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-[14px] font-mono text-[24px] font-bold text-favour-dark tracking-[0.3em] text-center bg-white border border-ui border-border-ui rounded-input outline-none focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid motion-safe:transition-colors duration-150"
          />
        </div>

        {error && (
          <p role="alert" className="font-body text-[13px] text-danger mb-3">{error}</p>
        )}

        <Button fullWidth disabled={otp.length < 6 || loading} onClick={handleVerify}>
          {loading ? 'Verifying…' : 'Confirm Code'}
        </Button>
      </div>
    </main>
  )
}
