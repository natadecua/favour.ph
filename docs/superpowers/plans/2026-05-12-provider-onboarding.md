# Provider Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4-step onboarding wizard for PROVIDER-role users to create their Provider profile and initial services, backed by a secure `POST /providers` endpoint.

**Architecture:** Wizard state lives in a single Client Component at `/(provider)/onboarding/page.tsx`. On final confirm, one `POST /providers` call creates the provider + services atomically in a Prisma transaction. After success, `/auth/me` is re-called to hydrate `providerId` into Zustand, then the user is redirected to `/dashboard`. The provider layout guard intercepts providers with `providerId === null` and sends them to onboarding.

**Tech Stack:** Fastify v4, Prisma 5, Zod, `sanitize-html`, Next.js 14 App Router, Zustand, `@favour/shared`, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `packages/shared/src/schemas.ts` | Modify | Add `CreateProviderSchema` + `CreateProviderInput` |
| `server/src/app.ts` | Modify | Add global ZodError handler returning 400 |
| `server/src/routes/providers.ts` | Modify | Add `POST /` with authenticate preHandler |
| `server/src/controllers/providers.controller.ts` | Modify | Add `create` handler with role + idempotency checks |
| `server/src/services/providers.service.ts` | Modify | Add `create` method — sanitize + Prisma transaction |
| `server/src/tests/providers.test.ts` | Create | Vitest tests for `POST /providers` |
| `client/src/app/(provider)/layout.tsx` | Modify | Add onboarding redirect guard |
| `client/src/lib/api.ts` | Modify | Add `api.providers.create` |
| `client/src/app/(provider)/onboarding/page.tsx` | Create | Wizard shell — holds all state, renders active step |
| `client/src/app/(provider)/onboarding/StepType.tsx` | Create | Step 1 — BUSINESS or FREELANCER tap cards |
| `client/src/app/(provider)/onboarding/StepProfile.tsx` | Create | Step 2 — displayName, bio, city, optional photo |
| `client/src/app/(provider)/onboarding/StepServices.tsx` | Create | Step 3 — 1–10 services with add/remove |
| `client/src/app/(provider)/onboarding/StepConfirm.tsx` | Create | Step 4 — read-only summary + submit |

---

## Task 1: Add `CreateProviderSchema` to shared package

**Files:**
- Modify: `packages/shared/src/schemas.ts`

- [ ] **Step 1: Add schema to `packages/shared/src/schemas.ts`**

Append after the existing exports:

```typescript
import { SERVICE_CATEGORIES } from './constants'
import type { ServiceCategory } from './types'

export const CreateProviderSchema = z.object({
  type: z.enum(['BUSINESS', 'FREELANCER']),
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(80, 'Display name must be 80 characters or less'),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or less').optional(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100, 'City must be 100 characters or less'),
  photoPath: z.string().max(500).optional(),
  services: z
    .array(
      z.object({
        name: z.string().trim().min(2, 'Service name must be at least 2 characters').max(80, 'Service name must be 80 characters or less'),
        category: z.enum(SERVICE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]),
        priceMin: z.number().int().positive().max(100_000),
        priceMax: z.number().int().positive().max(100_000),
      })
    )
    .min(1, 'Add at least one service')
    .max(10)
    .refine(
      (arr) => arr.every((s) => s.priceMax >= s.priceMin),
      'priceMax must be ≥ priceMin for all services'
    ),
})

export type CreateProviderInput = z.infer<typeof CreateProviderSchema>
```

- [ ] **Step 2: Build the shared package**

```bash
cd packages/shared && pnpm build
```

Expected: no TypeScript errors, `dist/` updated.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas.ts
git commit -m "feat: add CreateProviderSchema to shared package"
```

---

## Task 2: Install `sanitize-html` in server

**Files:**
- Modify: `server/package.json` (via pnpm)

- [ ] **Step 1: Install the package**

```bash
cd server && pnpm add sanitize-html && pnpm add -D @types/sanitize-html
```

Expected: both packages appear in `server/package.json`.

- [ ] **Step 2: Commit**

```bash
git add server/package.json server/pnpm-lock.yaml ../../pnpm-lock.yaml
git commit -m "chore: add sanitize-html to server"
```

---

## Task 3: Add global Zod error handler to app

**Files:**
- Modify: `server/src/app.ts`

- [ ] **Step 1: Add `setErrorHandler` to `buildApp()`**

Open `server/src/app.ts`. After the line `app.register(authPlugin)` and before the route registrations, add:

```typescript
import { ZodError } from 'zod'
```

At the top of the file, add the ZodError import. Then inside `buildApp()`, before the route registrations, add:

```typescript
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: err.errors[0]?.message ?? 'Validation error' })
    }
    app.log.error(err)
    return reply.code(err.statusCode ?? 500).send({ error: err.message ?? 'Internal server error' })
  })
```

The full updated `buildApp()` function should look like:

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'
import { ZodError } from 'zod'
import { prismaPlugin } from './plugins/prisma.js'
import { redisPlugin } from './plugins/redis.js'
import { authPlugin } from './plugins/auth.js'
import { authRoutes } from './routes/auth.js'
import { providerRoutes } from './routes/providers.js'
import { bookingRoutes } from './routes/bookings.js'
import { reviewRoutes } from './routes/reviews.js'
import { chatRoutes } from './routes/chat.js'
import { uploadRoutes } from './routes/uploads.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, {
    origin: process.env['NODE_ENV'] === 'production'
      ? ['https://favour.ph', 'https://www.favour.ph']
      : true,
  })

  app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  app.register(websocket)
  app.register(prismaPlugin)
  app.register(redisPlugin)
  app.register(authPlugin)

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: err.errors[0]?.message ?? 'Validation error' })
    }
    app.log.error(err)
    return reply.code((err as any).statusCode ?? 500).send({ error: err.message ?? 'Internal server error' })
  })

  app.register(authRoutes, { prefix: '/auth' })
  app.register(providerRoutes, { prefix: '/providers' })
  app.register(bookingRoutes, { prefix: '/bookings' })
  app.register(reviewRoutes, { prefix: '/reviews' })
  app.register(chatRoutes, { prefix: '/chat' })
  app.register(uploadRoutes, { prefix: '/uploads' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/app.ts
git commit -m "feat: add global Zod error handler returning 400"
```

---

## Task 4: Write failing Vitest tests for `POST /providers`

**Files:**
- Create: `server/src/tests/providers.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env['SUPABASE_JWT_SECRET'] = 'test-secret-for-vitest-at-least-32-chars!!'

import { buildApp } from '../app.js'

const mockCreatedProvider = {
  id: 'provider-1',
  userId: 'user-provider',
  type: 'FREELANCER',
  displayName: 'Kuya Jose',
  bio: null,
  city: 'Batangas City',
  isVerified: false,
  photos: [],
  services: [
    {
      id: 'svc-1',
      name: 'Aircon Cleaning',
      category: 'aircon',
      priceMin: 500,
      priceMax: 1500,
      providerId: 'provider-1',
      createdAt: new Date(),
    },
  ],
  favourScore: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

let upsertResult: any = {
  id: 'user-provider',
  phone: '+639171234567',
  role: 'PROVIDER' as const,
  provider: null,
  updatedAt: new Date(),
}

const mockTx = {
  provider: { create: vi.fn().mockResolvedValue(mockCreatedProvider) },
}

vi.mock('../plugins/prisma.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    prismaPlugin: fp(async (app: any) => {
      app.decorate('prisma', {
        user: {
          upsert: vi.fn().mockImplementation(() => Promise.resolve(upsertResult)),
        },
        $transaction: vi.fn().mockImplementation(async (fn: any) => fn(mockTx)),
      })
    }),
  }
})

vi.mock('../plugins/redis.js', async () => {
  const fp = (await import('fastify-plugin')).default
  return {
    redisPlugin: fp(async (app: any) => {
      app.decorate('redis', {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue('OK'),
        quit: vi.fn().mockResolvedValue(undefined),
      })
    }),
  }
})

const validBody = {
  type: 'FREELANCER',
  displayName: 'Kuya Jose',
  city: 'Batangas City',
  services: [{ name: 'Aircon Cleaning', category: 'aircon', priceMin: 500, priceMax: 1500 }],
}

describe('POST /providers', () => {
  beforeEach(() => {
    upsertResult = {
      id: 'user-provider',
      phone: '+639171234567',
      role: 'PROVIDER' as const,
      provider: null,
      updatedAt: new Date(),
    }
    mockTx.provider.create.mockResolvedValue(mockCreatedProvider)
  })

  it('returns 401 without a token', async () => {
    const app = buildApp()
    await app.ready()
    const res = await app.inject({ method: 'POST', url: '/providers', payload: validBody })
    expect(res.statusCode).toBe(401)
  })

  it('returns 403 when user role is CUSTOMER', async () => {
    upsertResult = { ...upsertResult, role: 'CUSTOMER', provider: null }
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: validBody,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(403)
  })

  it('returns 409 when provider already exists', async () => {
    upsertResult = { ...upsertResult, role: 'PROVIDER', provider: { id: 'existing-id' } }
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: validBody,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(409)
  })

  it('returns 400 when services array is empty', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: { ...validBody, services: [] },
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when priceMax < priceMin', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: {
        ...validBody,
        services: [{ name: 'Aircon Cleaning', category: 'aircon', priceMin: 1500, priceMax: 500 }],
      },
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when displayName is 1 character', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: { ...validBody, displayName: 'A' },
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 201 with provider and services for valid payload', async () => {
    const app = buildApp()
    await app.ready()
    const token = app.jwt.sign({ sub: 'user-provider', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: validBody,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('services')
    expect(Array.isArray(body.services)).toBe(true)
    expect(body.services).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd server && pnpm vitest run src/tests/providers.test.ts
```

Expected: most tests fail because `ProvidersController.create` does not exist yet. The 401 test may pass since auth already rejects unauthenticated requests.

---

## Task 5: Implement `ProvidersService.create`

**Files:**
- Modify: `server/src/services/providers.service.ts`

- [ ] **Step 1: Add the create method**

Open `server/src/services/providers.service.ts`. Add the import at the top:

```typescript
import sanitizeHtml from 'sanitize-html'
import type { PrismaClient } from '@prisma/client'
import type { CreateProviderInput } from '@favour/shared'
```

Add a sanitize helper after the imports:

```typescript
function sanitize(str: string): string {
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} })
}
```

Add the `create` method to `ProvidersService`:

```typescript
  async create(userId: string, body: CreateProviderInput, prisma: PrismaClient) {
    return prisma.$transaction(async (tx) => {
      return tx.provider.create({
        data: {
          userId,
          type: body.type,
          displayName: sanitize(body.displayName),
          bio: body.bio ? sanitize(body.bio) : null,
          city: sanitize(body.city),
          photos: body.photoPath ? [body.photoPath] : [],
          services: {
            create: body.services.map((s) => ({
              name: sanitize(s.name),
              category: s.category,
              priceMin: s.priceMin,
              priceMax: s.priceMax,
            })),
          },
        },
        include: { services: true },
      })
    })
  },
```

---

## Task 6: Implement `ProvidersController.create` and register route

**Files:**
- Modify: `server/src/controllers/providers.controller.ts`
- Modify: `server/src/routes/providers.ts`

- [ ] **Step 1: Add `create` to `ProvidersController`**

Open `server/src/controllers/providers.controller.ts`. Add to the imports:

```typescript
import { ProviderFeedQuerySchema, CreateProviderSchema } from '@favour/shared'
```

Add the `create` method to `ProvidersController`:

```typescript
  async create(req: FastifyRequest, reply: FastifyReply) {
    if (req.user.role !== 'PROVIDER') {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    if (req.user.providerId !== null) {
      return reply.code(409).send({ error: 'Provider profile already exists' })
    }
    const body = CreateProviderSchema.parse(req.body)
    const provider = await ProvidersService.create(req.user.id, body, req.server.prisma)
    return reply.code(201).send(provider)
  },
```

- [ ] **Step 2: Register the route**

Open `server/src/routes/providers.ts`. Add the POST route:

```typescript
import type { FastifyInstance } from 'fastify'
import { ProvidersController } from '../controllers/providers.controller.js'

export async function providerRoutes(fastify: FastifyInstance) {
  fastify.get('/', ProvidersController.getFeed)
  fastify.get('/:id', ProvidersController.getById)
  fastify.post('/', { preHandler: [fastify.authenticate] }, ProvidersController.create)
}
```

- [ ] **Step 3: Run tests — verify they pass**

```bash
cd server && pnpm vitest run src/tests/providers.test.ts
```

Expected: all 7 tests pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/services/providers.service.ts server/src/controllers/providers.controller.ts server/src/routes/providers.ts server/src/tests/providers.test.ts
git commit -m "feat: add POST /providers endpoint with auth, validation, and sanitization"
```

---

## Task 7: Add `api.providers.create` to client API wrapper

**Files:**
- Modify: `client/src/lib/api.ts`

- [ ] **Step 1: Add the method**

Open `client/src/lib/api.ts`. Update the existing import at the top of the file:

```typescript
import type { Booking, Provider, Review, CreateProviderInput } from '@favour/shared'
```

In the `providers` namespace, add `create`:

```typescript
  providers: {
    feed: (params?: Record<string, string>) =>
      request<Provider[]>(`/providers?${new URLSearchParams(params)}`),
    getById: (id: string) => request<Provider>(`/providers/${id}`),
    create: (body: CreateProviderInput, token: string) =>
      request<Provider>('/providers', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/api.ts
git commit -m "feat: add api.providers.create client method"
```

---

## Task 8: Update provider layout guard

**Files:**
- Modify: `client/src/app/(provider)/layout.tsx`

- [ ] **Step 1: Replace the layout with onboarding guard**

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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

  if (role !== 'PROVIDER') return null

  return <>{children}</>
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/\(provider\)/layout.tsx
git commit -m "feat: add onboarding redirect guard to provider layout"
```

---

## Task 9: Create `StepType` component

**Files:**
- Create: `client/src/app/(provider)/onboarding/StepType.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { cn } from '@/lib/cn'

interface StepTypeProps {
  value: 'BUSINESS' | 'FREELANCER' | null
  onSelect: (type: 'BUSINESS' | 'FREELANCER') => void
}

export function StepType({ value, onSelect }: StepTypeProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display font-extrabold text-[24px] text-favour-dark leading-snug">
        What kind of provider are you?
      </h1>
      <p className="font-sans text-[15px] text-ink-700 leading-relaxed">
        This helps customers understand who they're booking with.
      </p>
      <div className="flex flex-col gap-3 mt-2">
        {(['BUSINESS', 'FREELANCER'] as const).map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              'w-full text-left border rounded-card p-5 flex flex-col gap-1',
              'min-h-[44px] motion-safe:transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue',
              value === type
                ? 'bg-favour-blue/5 border-favour-blue'
                : 'bg-white border-ui hover:border-favour-blue/50'
            )}
          >
            <span className="font-mono text-[13px] font-bold tracking-[0.06em] text-favour-dark">
              {type}
            </span>
            <span className="font-sans text-[13px] text-ink-700">
              {type === 'BUSINESS'
                ? 'A registered company or shop offering home services.'
                : 'An independent individual offering services on their own.'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/\(provider\)/onboarding/StepType.tsx
git commit -m "feat: add onboarding StepType component"
```

---

## Task 10: Create `StepProfile` component

**Files:**
- Create: `client/src/app/(provider)/onboarding/StepProfile.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { api } from '@/lib/api'
import { ALLOWED_IMAGE_TYPES, UPLOAD_MAX_SIZE_BYTES } from '@favour/shared'

interface ProfileValues {
  displayName: string
  bio: string
  city: string
  photoPath: string | null
}

interface StepProfileProps {
  values: ProfileValues
  token: string
  onChange: (partial: Partial<ProfileValues>) => void
  onNext: () => void
  onBack: () => void
}

export function StepProfile({ values, token, onChange, onNext, onBack }: StepProfileProps) {
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  function validate(): string | null {
    if (values.displayName.trim().length < 2) return 'Display name must be at least 2 characters.'
    if (values.displayName.trim().length > 80) return 'Display name must be 80 characters or less.'
    if (values.city.trim().length < 2) return 'City must be at least 2 characters.'
    if (values.city.trim().length > 100) return 'City must be 100 characters or less.'
    if (values.bio.trim().length > 500) return 'Bio must be 500 characters or less.'
    return null
  }

  function handleNext() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    onNext()
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      setPhotoError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > UPLOAD_MAX_SIZE_BYTES) {
      setPhotoError('Image must be 5 MB or less.')
      return
    }
    setPhotoError(null)
    setUploading(true)
    try {
      const { signedUrl, path } = await api.uploads.sign(
        { filename: file.name, contentType: file.type },
        token
      )
      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      onChange({ photoPath: path })
    } catch {
      setPhotoError('Upload failed. Please try again or skip.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display font-extrabold text-[24px] text-favour-dark leading-snug">
        Your profile
      </h1>

      {error && (
        <div role="alert" className="bg-danger/10 border border-danger/30 rounded-card p-4">
          <p className="font-sans text-[14px] font-semibold text-danger">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="displayName">DISPLAY NAME</FieldLabel>
        <Input
          id="displayName"
          value={values.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="e.g. Kuya Jose Repairs"
          maxLength={80}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="city">CITY</FieldLabel>
        <Input
          id="city"
          value={values.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="e.g. Batangas City"
          maxLength={100}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="bio">
          ABOUT YOU{' '}
          <span className="font-sans text-[11px] font-normal text-ink-400 normal-case">
            (optional)
          </span>
        </FieldLabel>
        <textarea
          id="bio"
          value={values.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          maxLength={500}
          rows={3}
          placeholder="Briefly describe your experience and specialties"
          className="w-full border border-ui rounded-input bg-white px-4 py-3 font-sans text-[15px] text-favour-dark placeholder:text-ink-400 focus:outline-none focus:border-favour-blue focus:ring-2 focus:ring-favour-blue/20 motion-safe:transition-colors duration-150 resize-none"
        />
        <p className="font-mono text-[11px] text-ink-400 text-right">{values.bio.length}/500</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="photo">
          PROFILE PHOTO{' '}
          <span className="font-sans text-[11px] font-normal text-ink-400 normal-case">
            (optional)
          </span>
        </FieldLabel>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          disabled={uploading}
          className="w-full font-sans text-[14px] text-favour-dark file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border file:border-ui file:font-mono file:font-bold file:text-[12px] file:text-favour-blue file:bg-white hover:file:bg-surface cursor-pointer disabled:opacity-50"
        />
        {uploading && (
          <p className="font-sans text-[13px] text-ink-700">Uploading…</p>
        )}
        {values.photoPath && !uploading && (
          <p className="font-sans text-[13px] text-verify-green font-semibold">Photo uploaded.</p>
        )}
        {photoError && (
          <p role="alert" className="font-sans text-[13px] text-danger font-semibold">
            {photoError}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button variant="primary" onClick={handleNext} disabled={uploading} className="flex-1">
          Next
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/\(provider\)/onboarding/StepProfile.tsx
git commit -m "feat: add onboarding StepProfile component"
```

---

## Task 11: Create `StepServices` component

**Files:**
- Create: `client/src/app/(provider)/onboarding/StepServices.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@favour/shared'

export interface ServiceEntry {
  name: string
  category: string
  priceMin: string
  priceMax: string
}

interface StepServicesProps {
  services: ServiceEntry[]
  onChange: (services: ServiceEntry[]) => void
  onNext: () => void
  onBack: () => void
}

export function StepServices({ services, onChange, onNext, onBack }: StepServicesProps) {
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (services.length === 0) return 'Add at least one service.'
    for (let i = 0; i < services.length; i++) {
      const s = services[i]
      if (s.name.trim().length < 2) return `Service ${i + 1}: name must be at least 2 characters.`
      if (s.name.trim().length > 80) return `Service ${i + 1}: name must be 80 characters or less.`
      if (!s.category) return `Service ${i + 1}: select a category.`
      const min = parseInt(s.priceMin, 10)
      const max = parseInt(s.priceMax, 10)
      if (isNaN(min) || min <= 0) return `Service ${i + 1}: minimum price must be a positive number.`
      if (isNaN(max) || max <= 0) return `Service ${i + 1}: maximum price must be a positive number.`
      if (max < min) return `Service ${i + 1}: maximum price must be ≥ minimum price.`
      if (max > 100_000) return `Service ${i + 1}: maximum price must be ≤ PHP 100,000.`
    }
    return null
  }

  function handleNext() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    onNext()
  }

  function updateService(index: number, partial: Partial<ServiceEntry>) {
    onChange(services.map((s, i) => (i === index ? { ...s, ...partial } : s)))
  }

  function addService() {
    if (services.length >= 10) return
    onChange([...services, { name: '', category: '', priceMin: '', priceMax: '' }])
  }

  function removeService(index: number) {
    onChange(services.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display font-extrabold text-[24px] text-favour-dark leading-snug">
        Your services
      </h1>
      <p className="font-sans text-[15px] text-ink-700">
        Add the services you offer. You must add at least one.
      </p>

      {error && (
        <div role="alert" className="bg-danger/10 border border-danger/30 rounded-card p-4">
          <p className="font-sans text-[14px] font-semibold text-danger">{error}</p>
        </div>
      )}

      {services.map((service, index) => (
        <div key={index} className="bg-white border border-ui rounded-card p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[12px] font-bold text-ink-400 tracking-[0.06em]">
              SERVICE {index + 1}
            </p>
            {services.length > 1 && (
              <button
                onClick={() => removeService(index)}
                className="font-mono text-[12px] font-bold text-danger min-h-[44px] min-w-[44px] flex items-center justify-end"
              >
                REMOVE
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor={`svc-name-${index}`}>NAME</FieldLabel>
            <Input
              id={`svc-name-${index}`}
              value={service.name}
              onChange={(e) => updateService(index, { name: e.target.value })}
              placeholder="e.g. Aircon Cleaning & Regas"
              maxLength={80}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor={`svc-cat-${index}`}>CATEGORY</FieldLabel>
            <select
              id={`svc-cat-${index}`}
              value={service.category}
              onChange={(e) => updateService(index, { category: e.target.value })}
              className="w-full border border-ui rounded-input bg-white px-4 py-3 font-sans text-[15px] text-favour-dark focus:outline-none focus:border-favour-blue focus:ring-2 focus:ring-favour-blue/20 motion-safe:transition-colors duration-150"
            >
              <option value="">Select a category…</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {SERVICE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={`svc-min-${index}`}>MIN PRICE (PHP)</FieldLabel>
              <Input
                id={`svc-min-${index}`}
                type="number"
                inputMode="numeric"
                value={service.priceMin}
                onChange={(e) => updateService(index, { priceMin: e.target.value })}
                placeholder="500"
                min={1}
                max={100000}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={`svc-max-${index}`}>MAX PRICE (PHP)</FieldLabel>
              <Input
                id={`svc-max-${index}`}
                type="number"
                inputMode="numeric"
                value={service.priceMax}
                onChange={(e) => updateService(index, { priceMax: e.target.value })}
                placeholder="1500"
                min={1}
                max={100000}
              />
            </div>
          </div>
        </div>
      ))}

      {services.length < 10 && (
        <button
          onClick={addService}
          className="w-full min-h-[52px] border border-dashed border-ui rounded-card font-mono text-[12px] font-bold text-favour-blue tracking-[0.04em] hover:border-favour-blue/50 motion-safe:transition-colors"
        >
          + ADD ANOTHER SERVICE
        </button>
      )}

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button variant="primary" onClick={handleNext} className="flex-1">
          Next
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/\(provider\)/onboarding/StepServices.tsx
git commit -m "feat: add onboarding StepServices component"
```

---

## Task 12: Create `StepConfirm` component

**Files:**
- Create: `client/src/app/(provider)/onboarding/StepConfirm.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { Button } from '@/components/ui/Button'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'
import type { ServiceEntry } from './StepServices'

interface OnboardingState {
  type: 'BUSINESS' | 'FREELANCER' | null
  displayName: string
  bio: string
  city: string
  photoPath: string | null
  services: ServiceEntry[]
}

interface StepConfirmProps {
  state: OnboardingState
  submitting: boolean
  error: string | null
  onSubmit: () => void
  onBack: () => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-0.5">
        {label}
      </p>
      <p className="font-sans text-[14px] text-favour-dark">{value}</p>
    </div>
  )
}

export function StepConfirm({ state, submitting, error, onSubmit, onBack }: StepConfirmProps) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display font-extrabold text-[24px] text-favour-dark leading-snug">
        Review & confirm
      </h1>

      {error && (
        <div role="alert" className="bg-danger/10 border border-danger/30 rounded-card p-4">
          <p className="font-sans text-[14px] font-semibold text-danger">{error}</p>
        </div>
      )}

      <div className="bg-white border border-ui rounded-card p-4 flex flex-col gap-4">
        <Row label="TYPE" value={state.type ?? ''} />
        <Row label="NAME" value={state.displayName} />
        <Row label="CITY" value={state.city} />
        {state.bio.trim() && <Row label="ABOUT" value={state.bio} />}
        {state.photoPath && <Row label="PHOTO" value="Uploaded" />}
      </div>

      <div className="bg-white border border-ui rounded-card p-4 flex flex-col gap-4">
        <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">SERVICES</p>
        {state.services.map((s, i) => (
          <div key={i} className="border-t border-ui pt-4 first:border-t-0 first:pt-0">
            <p className="font-sans text-[14px] font-semibold text-favour-dark">{s.name}</p>
            <p className="font-mono text-[12px] text-ink-700 mt-0.5">
              {SERVICE_CATEGORY_LABELS[s.category as keyof typeof SERVICE_CATEGORY_LABELS] ?? s.category}
              {' · '}PHP {parseInt(s.priceMin, 10).toLocaleString()} –{' '}
              {parseInt(s.priceMax, 10).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onBack} disabled={submitting} className="flex-1">
          Back
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={submitting} className="flex-1">
          {submitting ? 'Creating profile…' : 'Create Profile'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/\(provider\)/onboarding/StepConfirm.tsx
git commit -m "feat: add onboarding StepConfirm component"
```

---

## Task 13: Create wizard shell and smoke test

**Files:**
- Create: `client/src/app/(provider)/onboarding/page.tsx`

- [ ] **Step 1: Create the wizard shell**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import type { Role } from '@favour/shared'
import { StepType } from './StepType'
import { StepProfile } from './StepProfile'
import { StepServices } from './StepServices'
import { StepConfirm } from './StepConfirm'
import type { ServiceEntry } from './StepServices'

interface OnboardingState {
  type: 'BUSINESS' | 'FREELANCER' | null
  displayName: string
  bio: string
  city: string
  photoPath: string | null
  services: ServiceEntry[]
}

const STEP_LABELS = ['PROVIDER TYPE', 'PROFILE', 'SERVICES', 'CONFIRM'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { accessToken, userId, role, setSession } = useAuthStore()

  const [step, setStep] = useState(0)
  const [state, setState] = useState<OnboardingState>({
    type: null,
    displayName: '',
    bio: '',
    city: '',
    photoPath: null,
    services: [{ name: '', category: '', priceMin: '', priceMax: '' }],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(partial: Partial<OnboardingState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await api.providers.create(
        {
          type: state.type!,
          displayName: state.displayName.trim(),
          bio: state.bio.trim() || undefined,
          city: state.city.trim(),
          photoPath: state.photoPath ?? undefined,
          services: state.services.map((s) => ({
            name: s.name.trim(),
            category: s.category,
            priceMin: parseInt(s.priceMin, 10),
            priceMax: parseInt(s.priceMax, 10),
          })),
        },
        accessToken!
      )
      const me = await api.auth.me(accessToken!)
      setSession({
        userId: userId!,
        role: role as Role,
        providerId: me.providerId,
        accessToken: accessToken!,
      })
      router.replace('/dashboard')
    } catch (err: any) {
      if (err?.status === 409) {
        router.replace('/dashboard')
        return
      }
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <p className="font-mono text-[11px] font-bold text-white/50 tracking-[0.08em] mb-1">
          {step + 1} OF {STEP_LABELS.length} — {STEP_LABELS[step]}
        </p>
        <div className="flex gap-1 mt-3">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-6 pb-24">
        {step === 0 && (
          <StepType
            value={state.type}
            onSelect={(type) => {
              patch({ type })
              setStep(1)
            }}
          />
        )}
        {step === 1 && (
          <StepProfile
            values={{
              displayName: state.displayName,
              bio: state.bio,
              city: state.city,
              photoPath: state.photoPath,
            }}
            token={accessToken!}
            onChange={patch}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepServices
            services={state.services}
            onChange={(services) => patch({ services })}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepConfirm
            state={state}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Start client and server dev servers**

```bash
# Terminal 1
cd server && pnpm dev
# Expected: Server listening at http://0.0.0.0:4000

# Terminal 2
cd client && pnpm dev
# Expected: Next.js ready at http://localhost:3000 (or 3002)
```

- [ ] **Step 3: Smoke test the full onboarding flow**

1. Log in as a PROVIDER-role user (phone OTP)
2. Confirm redirect to `/onboarding`
3. Step 1: select FREELANCER — confirm auto-advances to Step 2
4. Step 2: fill display name, city; optionally add bio/photo — tap Next
5. Step 3: fill service name, select category, add min/max price — tap Next. Tap "Add another service" — confirm a second card appears. Remove it. Tap Next.
6. Step 4: confirm all details shown correctly — tap "Create Profile"
7. Confirm redirect to `/dashboard`
8. Confirm navigating back to `/onboarding` redirects to `/dashboard` (layout guard)

- [ ] **Step 4: Commit**

```bash
git add client/src/app/\(provider\)/onboarding/page.tsx
git commit -m "feat: add provider onboarding wizard"
```
