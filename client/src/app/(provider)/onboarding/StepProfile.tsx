'use client'

import { useState } from 'react'
import { Camera, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { ALLOWED_IMAGE_TYPES, UPLOAD_MAX_SIZE_BYTES } from '@favour/shared'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Input } from '@/components/ui/Input'

interface ProfileValues {
  displayName: string
  bio: string
  city: string
  photoPath: string | null
}

interface StepProfileProps {
  values: ProfileValues
  token: string | null
  onChange: (values: Partial<ProfileValues>) => void
  onNext: () => void
  onBack: () => void
}

export function StepProfile({ values, token, onChange, onNext, onBack }: StepProfileProps) {
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  function handleNext() {
    if (values.displayName.trim().length < 2) {
      setError('Use a display name with at least 2 characters.')
      return
    }
    if (values.city.trim().length < 2) {
      setError('Enter the city where customers can book you.')
      return
    }
    setError(null)
    onNext()
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!token) {
      setPhotoError('Sign in again before uploading a photo.')
      return
    }

    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setPhotoError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > UPLOAD_MAX_SIZE_BYTES) {
      setPhotoError('Image must be 5 MB or less.')
      return
    }

    setUploading(true)
    setPhotoError(null)
    try {
      const { signedUrl, path } = await api.uploads.sign(
        { fileName: file.name, fileType: file.type, fileSize: file.size },
        token
      )
      const res = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!res.ok) throw new Error('Upload failed')
      onChange({ photoPath: path })
    } catch {
      setPhotoError('Upload failed. You can retry or continue without a photo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-[25px] font-extrabold leading-tight text-favour-dark">
          Your public profile
        </h1>
        <p className="max-w-[44ch] font-body text-[14px] leading-relaxed text-ink-700">
          This is what homeowners see before they choose to book.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-card border border-danger bg-danger/10 p-4">
          <p className="font-body text-[14px] font-semibold text-danger">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <FieldLabel htmlFor="displayName">DISPLAY NAME</FieldLabel>
          <Input
            id="displayName"
            value={values.displayName}
            onChange={(event) => onChange({ displayName: event.target.value })}
            placeholder="e.g. Kuya Jose Repairs"
            maxLength={80}
          />
        </div>

        <div>
          <FieldLabel htmlFor="city">CITY</FieldLabel>
          <Input
            id="city"
            value={values.city}
            onChange={(event) => onChange({ city: event.target.value })}
            placeholder="e.g. Batangas City"
            maxLength={100}
          />
        </div>

        <div>
          <FieldLabel htmlFor="bio">
            ABOUT YOU <span className="font-body font-normal normal-case">(optional)</span>
          </FieldLabel>
          <textarea
            id="bio"
            value={values.bio}
            onChange={(event) => onChange({ bio: event.target.value })}
            maxLength={500}
            rows={4}
            placeholder="Experience, specialties, or service area"
            className="w-full resize-none rounded-input border border-border-ui bg-white px-4 py-3 font-body text-[15px] leading-relaxed text-favour-dark outline-none placeholder:text-ink-400 focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid"
          />
          <p className="mt-1 text-right font-mono text-[11px] text-ink-400">
            {values.bio.length}/500
          </p>
        </div>

        <div className="rounded-card border border-border-ui bg-white p-4">
          <FieldLabel htmlFor="photo">
            PROFILE PHOTO <span className="font-body font-normal normal-case">(optional)</span>
          </FieldLabel>
          <label
            htmlFor="photo"
            className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-input border border-dashed border-border-ui bg-surface px-4 motion-safe:transition-colors hover:border-favour-blue"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-white text-favour-blue">
              {values.photoPath ? <CheckCircle2 size={22} /> : <Camera size={22} />}
            </span>
            <span className="min-w-0">
              <span className="block font-body text-[14px] font-semibold text-favour-dark">
                {values.photoPath ? 'Photo uploaded' : 'Upload a JPG, PNG, or WEBP'}
              </span>
              <span className="block font-body text-[12px] text-ink-700">
                {uploading ? 'Uploading...' : 'Maximum file size is 5 MB'}
              </span>
            </span>
          </label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={uploading}
            className="sr-only"
          />
          {photoError && (
            <p role="alert" className="mt-3 font-body text-[13px] font-semibold text-danger">
              {photoError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={uploading}>
          Next
        </Button>
      </div>
    </section>
  )
}
