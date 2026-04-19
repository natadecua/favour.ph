'use client'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowser()

  async function handleSend() {
    setLoading(true)
    setError(null)
    const formatted = phone.startsWith('+63') ? phone : `+63${phone.replace(/^0/, '')}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)
    if (error) { setError(error.message); return }
    sessionStorage.setItem('favour_phone', formatted)
    window.location.href = '/verify'
  }

  return (
    <main className="min-h-dvh bg-favour-dark flex flex-col items-center justify-center px-6 py-10">
      <div className="font-mono text-[28px] font-extrabold text-white tracking-[0.08em] mb-10" aria-label="Favour.ph">
        FAVOUR<span className="text-favour-blue">.PH</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-[16px] p-7">
        <h1 className="font-sans text-[22px] font-extrabold text-favour-dark mb-1.5">Sign in</h1>
        <p className="font-body text-[14px] text-ink-700 mb-6">
          Enter your mobile number to receive a one-time code.
        </p>

        <div className="mb-4">
          <FieldLabel htmlFor="phone">MOBILE NUMBER</FieldLabel>
          <div className="flex border border-ui border-border-ui rounded-input overflow-hidden focus-within:border-favour-blue focus-within:ring-1 focus-within:ring-favour-blue-mid motion-safe:transition-colors duration-150">
            <span className="font-mono px-3.5 bg-surface flex items-center text-[14px] font-bold text-ink-700 border-r border-border-ui shrink-0" aria-hidden="true">
              +63
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9XX XXX XXXX"
              className="flex-1 px-4 py-[14px] font-body text-[15px] text-favour-dark bg-white outline-none placeholder:text-ink-400"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="font-body text-[13px] text-danger mb-3">{error}</p>
        )}

        <Button fullWidth disabled={phone.length < 9 || loading} onClick={handleSend}>
          {loading ? 'Sending…' : 'Send Secure Code'}
        </Button>

        <div className="flex items-center justify-center gap-2 mt-5">
          <ShieldCheck size={14} className="text-ink-400 shrink-0" aria-hidden="true" />
          <span className="font-body text-[12px] text-ink-400">We never share your number</span>
        </div>
      </div>
    </main>
  )
}
