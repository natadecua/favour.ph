# Booking Flow Fix + Feed Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix six broken booking-path bugs, add a customer bookings list, and add keyword search + verified badges + service duration to the provider feed.

**Architecture:** Minimal-touch changes to existing files. One Prisma migration (Service.duration). Shared package types fixed to match actual API response shapes. No new server routes. Two new client pages (bookings list, no changes to routing structure). SearchInput is a client component imported into the Server Component feed page.

**Tech Stack:** Next.js 14 App Router, Fastify + Prisma + PostgreSQL, Zod schemas in `@favour/shared`, Zustand auth store, TanStack Query, Vitest.

---

## File Map

**Modify:**
- `packages/shared/src/types.ts` — fix ProviderSummary fields, add Service.duration, keep isVerified
- `packages/shared/src/schemas.ts` — remove providerType from CreateBookingSchema, add q to ProviderFeedQuerySchema, add duration to CreateProviderSchema service object
- `server/prisma/schema.prisma` — add `duration String?` to Service model
- `server/src/repositories/providers.repo.ts` — add q text filter to findMany
- `server/src/services/providers.service.ts` — add isVerified to toSummary, services array to toDetail, duration to create
- `server/src/tests/providers.test.ts` — add keyword search integration test
- `client/src/lib/api.ts` — fix return types, add q param
- `client/src/components/providers/ProviderCard.tsx` — fix URL, add verified badge
- `client/src/app/(customer)/providers/[id]/page.tsx` — fix Book Now URL, add badge, show service duration
- `client/src/app/(customer)/feed/page.tsx` — add q searchParam, MY BOOKINGS link, SearchInput
- `client/src/app/(customer)/book/[providerId]/page.tsx` — full rewrite: service picker, fix field names, fix redirect
- `client/src/app/(customer)/bookings/[id]/page.tsx` — convert to Client Component with auth
- `client/src/app/(provider)/onboarding/StepServices.tsx` — add duration input
- `client/src/app/(provider)/onboarding/page.tsx` — add duration to OnboardingState and buildPayload

**Create:**
- `client/src/components/feed/SearchInput.tsx` — debounced search input, URL-based
- `client/src/app/(customer)/bookings/page.tsx` — customer bookings list page

---

## Task 1: Fix shared types and schemas

**Files:**
- Modify: `packages/shared/src/types.ts`
- Modify: `packages/shared/src/schemas.ts`

- [ ] **Step 1: Open `packages/shared/src/types.ts` and replace the file**

The current `ProviderSummary` type has wrong field names (`photo` instead of `avatarUrl`, `topService` instead of `category`/`baseRate`) that don't match what the server actually sends. Fix them now and add `isVerified`. Also add `duration?: string` to `Service`.

```typescript
// ── Enums ──────────────────────────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
export type ProviderType = 'BUSINESS' | 'FREELANCER'
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED'

// ── Core entities ──────────────────────────────────────────────────────────

export interface User {
  id: string
  phone: string
  email: string | null
  role: Role
  createdAt: string
}

export interface Provider {
  id: string
  userId: string
  type: ProviderType
  displayName: string
  bio: string | null
  city: string
  isVerified: boolean
  photos: string[]
  favourScore: FavourScore | null
  services: Service[]
}

export interface Service {
  id: string
  providerId: string
  name: string
  category: ServiceCategory
  priceMin: number
  priceMax: number
  duration: string | null  // NEW — e.g. "60 min", null if not set
}

export interface Booking {
  id: string
  referenceCode: string
  customerId: string
  providerId: string
  serviceId: string
  status: BookingStatus
  datetime: string
  address: string
  notes: string | null
  createdAt: string
  service?: { name: string; category: string; priceMin: number; priceMax: number }
  provider?: { displayName: string }
}

export interface Review {
  id: string
  bookingId: string
  authorId: string
  targetId: string
  rating: number
  body: string
  createdAt: string
}

export interface Message {
  id: string
  bookingId: string
  senderId: string
  body: string
  createdAt: string
}

export interface FavourScore {
  providerId: string
  overall: number
  responseRate: number
  completionRate: number
  reviewAverage: number
  recency: number
  updatedAt: string
}

// ── API response shapes ────────────────────────────────────────────────────

export interface ProviderSummary {
  id: string
  displayName: string
  type: ProviderType
  city: string
  isVerified: boolean      // shown as shield badge on cards
  category: string         // first service category (or '')
  baseRate: number         // first service priceMin (or 0)
  avatarUrl: string | null // first photo path
  favourScore: number      // overall score (0 if no score yet)
}

export interface ProviderDetail extends ProviderSummary {
  bio: string | null
  yearsExperience: number | null
  completedBookings: number
  responseRate: number
  reviewCount: number
  services: Service[]
}

export type ServiceCategory =
  | 'aircon'
  | 'plumbing'
  | 'electrical'
  | 'cleaning'
  | 'carpentry'
  | 'painting'
  | 'appliance_repair'
```

- [ ] **Step 2: Open `packages/shared/src/schemas.ts` and make three changes**

Change 1 — remove `providerType` from `CreateBookingSchema` (unused server-side):
```typescript
export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  datetime: z.string().datetime().refine(
    d => new Date(d) > new Date(),
    'Booking must be in the future'
  ),
  address: z.string().min(10, 'Address too short').max(200),
  notes: z.string().max(500).optional(),
})
```

Change 2 — add `q` to `ProviderFeedQuerySchema`:
```typescript
export const ProviderFeedQuerySchema = z.object({
  category: z.string().optional(),
  type: z.enum(['business', 'freelancer', 'all']).optional().default('all'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().max(20).optional().default(10),
  q: z.string().trim().max(100).optional(),  // NEW — keyword search
})
```

Change 3 — add `duration` to the service object inside `CreateProviderSchema`:
```typescript
services: z
  .array(
    z.object({
      name: z
        .string()
        .trim()
        .min(2, 'Service name must be at least 2 characters')
        .max(80, 'Service name must be 80 characters or less'),
      category: z.enum(SERVICE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]),
      priceMin: z.number().int().positive().max(100_000),
      priceMax: z.number().int().positive().max(100_000),
      duration: z.string().trim().max(30).optional(),  // NEW — e.g. "60 min"
    })
  )
  .min(1, 'Add at least one service')
  .max(10)
  .refine(
    (services) => services.every((service) => service.priceMax >= service.priceMin),
    'priceMax must be >= priceMin for all services'
  ),
```

Also add the exported type at the bottom:
```typescript
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type RespondToBookingInput = z.infer<typeof RespondToBookingSchema>
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
export type CreateChatMessageInput = z.infer<typeof CreateChatMessageSchema>
export type ProviderFeedQuery = z.infer<typeof ProviderFeedQuerySchema>
export type CreateProviderInput = z.infer<typeof CreateProviderSchema>
```
(No new exports needed — `CreateBookingInput` already exists and will auto-update via `z.infer`.)

- [ ] **Step 3: Rebuild shared and verify no TypeScript errors**

```bash
cd packages/shared && pnpm build
```

Expected: builds successfully with no errors.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add packages/shared/src/types.ts packages/shared/src/schemas.ts
git commit -m "feat(shared): fix ProviderSummary type, add Service.duration, add q to feed query, remove providerType from booking schema"
```

---

## Task 2: Add duration to Service in Prisma + migrate

**Files:**
- Modify: `server/prisma/schema.prisma` (line 65–75)

- [ ] **Step 1: Add `duration` field to the Service model**

Open `server/prisma/schema.prisma`. The Service model currently looks like:
```prisma
model Service {
  id         String          @id @default(uuid())
  providerId String
  provider   Provider        @relation(fields: [providerId], references: [id])
  name       String
  category   String
  priceMin   Int
  priceMax   Int
  bookings   Booking[]
  createdAt  DateTime        @default(now())
}
```

Change it to:
```prisma
model Service {
  id         String    @id @default(uuid())
  providerId String
  provider   Provider  @relation(fields: [providerId], references: [id])
  name       String
  category   String
  priceMin   Int
  priceMax   Int
  duration   String?
  bookings   Booking[]
  createdAt  DateTime  @default(now())
}
```

- [ ] **Step 2: Run the migration**

```bash
cd server && pnpm prisma migrate dev --name add_duration_to_service
```

Expected output:
```
Applying migration `20260512_add_duration_to_service`
The following migration(s) have been applied:
  migrations/
    └─ 20260512.../migration.sql
✔ Generated Prisma Client
```

- [ ] **Step 3: Verify Prisma client regenerated**

```bash
pnpm prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma server/prisma/migrations/
git commit -m "feat(db): add duration field to Service model"
```

---

## Task 3: Server — providers repository: add keyword search

**Files:**
- Modify: `server/src/repositories/providers.repo.ts`

- [ ] **Step 1: Replace `findMany` to support the `q` query param**

Open `server/src/repositories/providers.repo.ts`. Replace the entire file:

```typescript
import type { PrismaClient } from '@prisma/client'
import type { ProviderFeedQuery } from '@favour/shared'

export interface ProvidersRepoInterface {
  findMany(query: ProviderFeedQuery): Promise<any[]>
  findById(id: string): Promise<any | null>
}

export function createProvidersRepo(prisma: PrismaClient): ProvidersRepoInterface {
  return {
    async findMany(query) {
      return prisma.provider.findMany({
        where: {
          ...(query.category ? { services: { some: { category: query.category } } } : {}),
          ...(query.type !== 'all' ? { type: query.type.toUpperCase() as any } : {}),
          ...(query.q
            ? {
                OR: [
                  { displayName: { contains: query.q, mode: 'insensitive' } },
                  { services: { some: { name: { contains: query.q, mode: 'insensitive' } } } },
                ],
              }
            : {}),
        },
        include: { services: true, favourScore: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      })
    },
    async findById(id) {
      return prisma.provider.findUnique({
        where: { id },
        include: { services: true, favourScore: true, reviewsReceived: true },
      })
    },
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/repositories/providers.repo.ts
git commit -m "feat(server): add keyword search (q) filter to providers feed"
```

---

## Task 4: Server — providers service: isVerified, services in detail, duration in create

**Files:**
- Modify: `server/src/services/providers.service.ts`

- [ ] **Step 1: Update `toSummary`, `toDetail`, and `create` in providers service**

Open `server/src/services/providers.service.ts`. Replace the entire file:

```typescript
import sanitizeHtml from 'sanitize-html'
import type { CreateProviderInput, ProviderFeedQuery } from '@favour/shared'
import type { ProvidersRepoInterface } from '../repositories/providers.repo.js'

type ProviderPrisma = {
  $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>
}

function sanitize(str: string): string {
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} })
}

function toSummary(p: any) {
  return {
    id: p.id,
    displayName: p.displayName,
    type: p.type,
    category: p.services?.[0]?.category ?? '',
    favourScore: p.favourScore?.overall ?? 0,
    baseRate: p.services?.[0]?.priceMin ?? 0,
    city: p.city,
    avatarUrl: p.photos?.[0] ?? null,
    isVerified: p.isVerified ?? false,  // NEW
  }
}

function toDetail(p: any) {
  return {
    ...toSummary(p),
    bio: p.bio ?? null,
    yearsExperience: null,
    completedBookings: 0,
    responseRate: Math.round((p.favourScore?.responseRate ?? 0) * 100),
    reviewCount: p.reviewsReceived?.length ?? 0,
    services: (p.services ?? []).map((s: any) => ({  // NEW — needed for booking form service picker
      id: s.id,
      name: s.name,
      category: s.category,
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      duration: s.duration ?? null,
    })),
  }
}

export const ProvidersService = {
  async getFeed(query: ProviderFeedQuery, repo: ProvidersRepoInterface) {
    const providers = await repo.findMany(query)
    return providers.map(toSummary)
  },

  async getById(id: string, repo: ProvidersRepoInterface) {
    const provider = await repo.findById(id)
    if (!provider) {
      const err = new Error('Provider not found') as any
      err.statusCode = 404
      throw err
    }
    return toDetail(provider)
  },

  async create(userId: string, body: CreateProviderInput, prisma: ProviderPrisma) {
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
            create: body.services.map((service) => ({
              name: sanitize(service.name),
              category: service.category,
              priceMin: service.priceMin,
              priceMax: service.priceMax,
              duration: service.duration ? sanitize(service.duration) : null,  // NEW
            })),
          },
        },
        include: { services: true },
      })
    })
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/providers.service.ts
git commit -m "feat(server): add isVerified to provider feed, services to provider detail, duration to service create"
```

---

## Task 5: Server — add keyword search integration test + run all

**Files:**
- Modify: `server/src/tests/providers.test.ts`

- [ ] **Step 1: Add two tests at the end of the provider endpoint describe block**

Open `server/src/tests/providers.test.ts`. At the end of the `describe('GET /providers', ...)` block (or create one if the search tests need their own describe), add:

```typescript
describe('GET /providers?q=', () => {
  it('returns 200 with array when q matches nothing', async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/providers?q=zzznomatch',
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual([])
  })

  it('returns 200 with array for empty q', async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/providers?q=',
    })
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(JSON.parse(res.body))).toBe(true)
  })
})
```

Note: these tests hit the real Prisma mock, which returns whatever `findMany` returns in the test setup. The key is that the endpoint accepts `q` without erroring (status 200, array shape).

- [ ] **Step 2: Run all server tests**

```bash
cd server && pnpm test
```

Expected: all tests pass (was 21, now 23+).

- [ ] **Step 3: Commit**

```bash
git add server/src/tests/providers.test.ts
git commit -m "test(server): add keyword search endpoint tests"
```

---

## Task 6: Client — fix api.ts types and add q support

**Files:**
- Modify: `client/src/lib/api.ts`

- [ ] **Step 1: Replace `api.ts` with corrected types**

Open `client/src/lib/api.ts`. Replace the entire file:

```typescript
import type {
  Booking,
  CreateBookingInput,
  CreateProviderInput,
  ProviderDetail,
  ProviderSummary,
  Review,
} from '@favour/shared'

const BASE = process.env.NEXT_PUBLIC_API_URL!

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? 'Request failed'), { status: res.status })
  }
  return res.json() as Promise<T>
}

export const api = {
  providers: {
    feed: (params?: Record<string, string>) =>
      request<ProviderSummary[]>(`/providers?${new URLSearchParams(params)}`),
    getById: (id: string) => request<ProviderDetail>(`/providers/${id}`),
    create: (body: CreateProviderInput, token: string) =>
      request<ProviderDetail>('/providers', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  bookings: {
    create: (body: CreateBookingInput, token: string) =>
      request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    list: (token: string, scope?: 'provider' | 'customer') =>
      request<Booking[]>(`/bookings${scope ? `?scope=${scope}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getById: (id: string, token: string) =>
      request<Booking>(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    respond: (id: string, body: unknown, token: string) =>
      request<Booking>(`/bookings/${id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    cancel: (id: string, body: unknown, token: string) =>
      request<Booking>(`/bookings/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    complete: (id: string, token: string) =>
      request<Booking>(`/bookings/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  reviews: {
    create: (body: unknown, token: string) =>
      request<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  uploads: {
    sign: (body: unknown, token: string) =>
      request<{ signedUrl: string; path: string }>('/uploads/sign', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  auth: {
    me: (token: string) =>
      request<{ userId: string; role: string; providerId: string | null }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
}
```

Note: `ProviderDetail` is the new type added in Task 1 that extends `ProviderSummary` with `bio`, `services[]`, etc. It's what `getById` returns.

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/api.ts
git commit -m "fix(client): correct api.ts return types — ProviderSummary for feed, ProviderDetail for getById, typed booking create"
```

---

## Task 7: Client — fix ProviderCard: URL bug + verified badge

**Files:**
- Modify: `client/src/components/providers/ProviderCard.tsx`

- [ ] **Step 1: Replace ProviderCard with URL fix and verified badge**

Open `client/src/components/providers/ProviderCard.tsx`. Replace the entire file:

```tsx
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import type { ProviderSummary } from '@favour/shared'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'
import { cn } from '@/lib/cn'
import { Pill } from '@/components/ui/Pill'

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

interface ProviderCardProps {
  provider: ProviderSummary
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const { id, displayName, type, category, favourScore, baseRate, city, avatarUrl, isVerified } = provider

  const categoryLabel =
    SERVICE_CATEGORY_LABELS[category as keyof typeof SERVICE_CATEGORY_LABELS] ?? category

  return (
    <Link
      href={`/providers/${id}`}  // FIXED: was /feed/providers/${id}
      className={cn(
        'group flex gap-4 bg-white border border-ui rounded-card p-4',
        'motion-safe:transition-shadow duration-150 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2'
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-[64px] h-[64px] rounded-[10px] object-cover bg-surface"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-[64px] h-[64px] rounded-[10px] bg-surface flex items-center justify-center"
          >
            <span className="font-mono text-[18px] font-bold text-ink-400 select-none">
              {getInitials(displayName)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Name + type pill */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-extrabold text-[16px] text-favour-dark leading-snug truncate">
            {displayName}
          </h3>
          <Pill color={type === 'BUSINESS' ? 'blue' : 'green'} className="shrink-0">
            {type === 'BUSINESS' ? 'BUSINESS' : 'FREELANCER'}
          </Pill>
        </div>

        {/* Category + city + verified badge */}
        <div className="flex items-center gap-2 mt-0.5">
          <p className="font-sans text-[13px] text-ink-700 truncate">
            {categoryLabel} · {city}
          </p>
          {isVerified && (
            <span className="flex items-center gap-0.5 shrink-0" title="Verified provider">
              <ShieldCheck size={13} className="text-verify-green" aria-hidden="true" />
              <span className="font-mono text-[10px] font-bold text-verify-green tracking-[0.04em]">
                VERIFIED
              </span>
            </span>
          )}
        </div>

        {/* Score + rate row */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">
              SCORE
            </span>
            <span className="font-mono text-[15px] font-extrabold text-favour-dark">
              {favourScore.toFixed(2)}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">
              FROM
            </span>
            <span className="font-mono text-[15px] font-extrabold text-favour-dark">
              PHP {baseRate.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/providers/ProviderCard.tsx
git commit -m "fix(client): correct ProviderCard link URL, add isVerified shield badge"
```

---

## Task 8: Client — fix provider profile page

**Files:**
- Modify: `client/src/app/(customer)/providers/[id]/page.tsx`

- [ ] **Step 1: Replace the provider profile page**

Open `client/src/app/(customer)/providers/[id]/page.tsx`. Replace the entire file:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { FavourScoreBanner } from '@/components/ui/FavourScoreBanner'
import { StatBox } from '@/components/ui/StatBox'
import { Pill } from '@/components/ui/Pill'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'

interface ProviderPageProps {
  params: { id: string }
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const provider = await api.providers.getById(params.id).catch(() => null)

  if (!provider) notFound()

  const categoryLabel =
    SERVICE_CATEGORY_LABELS[provider.category as keyof typeof SERVICE_CATEGORY_LABELS] ??
    provider.category

  return (
    <main className="min-h-screen bg-surface pb-28">
      {/* Dark header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <div className="flex items-start gap-4">
          {provider.avatarUrl ? (
            <img
              src={provider.avatarUrl}
              alt={provider.displayName}
              className="w-[72px] h-[72px] rounded-[12px] object-cover bg-surface shrink-0"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-[12px] bg-favour-blue/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[22px] font-bold text-white select-none" aria-hidden="true">
                {provider.displayName.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-extrabold text-[22px] text-white leading-snug">
              {provider.displayName}
            </h1>
            <p className="font-sans text-[14px] text-white/70 mt-0.5">
              {categoryLabel} · {provider.city}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Pill color={provider.type === 'BUSINESS' ? 'blue' : 'green'}>
                {provider.type === 'BUSINESS' ? 'BUSINESS' : 'FREELANCER'}
              </Pill>
              {provider.isVerified && (
                <span className="flex items-center gap-1 bg-verify-green/20 px-2 py-0.5 rounded-pill">
                  <ShieldCheck size={12} className="text-verify-green" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-bold text-verify-green tracking-[0.04em]">VERIFIED</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FavourScore banner */}
      <FavourScoreBanner score={provider.favourScore} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4">
        <StatBox value={String(provider.completedBookings)} label="Completed" />
        <StatBox value={`${provider.responseRate}%`} label="Response" accentClass="text-verify-green" />
        <StatBox value={String(provider.reviewCount)} label="Reviews" />
      </div>

      {/* Base rate */}
      <div className="mx-4 mt-3 bg-white border border-ui rounded-card p-4">
        <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">
          STARTING FROM
        </p>
        <p className="font-mono text-[28px] font-extrabold text-favour-dark">
          PHP {provider.baseRate.toFixed(2)}
        </p>
      </div>

      {/* Bio */}
      {provider.bio && (
        <div className="mx-4 mt-3 bg-white border border-ui rounded-card p-4">
          <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-2">
            ABOUT
          </p>
          <p className="font-sans text-[15px] text-favour-dark leading-relaxed max-w-[65ch]">
            {provider.bio}
          </p>
        </div>
      )}

      {/* Services list */}
      {provider.services && provider.services.length > 0 && (
        <div className="mx-4 mt-3 bg-white border border-ui rounded-card p-4">
          <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-3">
            SERVICES
          </p>
          <div className="divide-y divide-ui">
            {provider.services.map((service) => (
              <div key={service.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-sans text-[14px] font-semibold text-favour-dark">{service.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[13px] font-bold text-favour-dark">
                    PHP {service.priceMin.toLocaleString()}
                    {service.priceMax !== service.priceMin && ` – ${service.priceMax.toLocaleString()}`}
                  </span>
                  {service.duration && (
                    <span className="font-mono text-[11px] text-ink-400 tracking-[0.04em]">
                      {service.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Book Now CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-ui px-4 py-4 z-20">
        <Link
          href={`/book/${provider.id}`}  // FIXED: was /feed/book/${provider.id}
          className="flex items-center justify-center h-btn rounded-btn bg-favour-blue text-white font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
        >
          Book Now
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "client/src/app/(customer)/providers/[id]/page.tsx"
git commit -m "fix(client): correct Book Now URL, add verified badge and services list to provider profile"
```

---

## Task 9: Client — SearchInput component + feed page updates

**Files:**
- Create: `client/src/components/feed/SearchInput.tsx`
- Modify: `client/src/app/(customer)/feed/page.tsx`

- [ ] **Step 1: Create `SearchInput.tsx`**

Create new file `client/src/components/feed/SearchInput.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchInput() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      // Reset to page 1 when searching
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative px-4 pt-3 pb-1">
      <Search
        size={16}
        className="absolute left-7 top-1/2 -translate-y-[2px] text-ink-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search providers or services…"
        aria-label="Search providers"
        className="w-full h-[44px] pl-9 pr-4 rounded-input border border-border-ui bg-white font-body text-[14px] text-favour-dark placeholder:text-ink-400 outline-none focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid"
      />
    </div>
  )
}
```

- [ ] **Step 2: Update feed page to add q support + MY BOOKINGS link + SearchInput**

Open `client/src/app/(customer)/feed/page.tsx`. Replace the entire file:

```tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'
import { SearchInput } from '@/components/feed/SearchInput'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@favour/shared'

interface FeedPageProps {
  searchParams: { category?: string; q?: string }
}

async function ProviderList({ category, q }: { category?: string; q?: string }) {
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (q) params.q = q

  const providers = await api.providers.feed(params).catch(() => [])

  if (providers.length === 0) {
    const categoryLabel = category
      ? (SERVICE_CATEGORY_LABELS[category as keyof typeof SERVICE_CATEGORY_LABELS] ?? category)
      : null

    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <div className="w-[64px] h-[64px] rounded-[10px] bg-surface flex items-center justify-center mb-4">
          <span className="font-mono text-[28px]" aria-hidden="true">🔍</span>
        </div>
        <h2 className="font-display font-extrabold text-[20px] text-favour-dark mb-2">
          No providers found
        </h2>
        <p className="font-sans text-[14px] text-ink-700 max-w-[320px] leading-relaxed">
          {q
            ? `No providers matching "${q}" in Batangas City. Try a different search.`
            : categoryLabel
            ? `No ${categoryLabel} providers in Batangas City yet. Check back soon or try another category.`
            : "No providers in Batangas City yet. We're onboarding more — check back soon."}
        </p>
        {(category || q) && (
          <Link
            href="/feed"
            className="mt-6 font-display font-extrabold text-[15px] text-favour-blue touch-target flex items-center justify-center"
          >
            Browse all providers
          </Link>
        )}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3" role="list">
      {providers.map((provider) => (
        <li key={provider.id}>
          <ProviderCard provider={provider} />
        </li>
      ))}
    </ul>
  )
}

function ProviderListSkeleton() {
  return (
    <ul className="flex flex-col gap-3" role="list" aria-label="Loading providers">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i}>
          <ProviderCardSkeleton />
        </li>
      ))}
    </ul>
  )
}

export default function FeedPage({ searchParams }: FeedPageProps) {
  const activeCategory = searchParams.category ?? null
  const activeQ = searchParams.q ?? null

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-display font-extrabold text-[26px] text-white leading-tight">
              Find a Provider
            </h1>
            <p className="font-sans text-[14px] text-white/70 mt-1">
              Verified home service providers in Batangas City
            </p>
          </div>
          <Link
            href="/bookings"
            className="font-mono text-[11px] font-bold text-white/70 hover:text-white tracking-[0.08em] mt-1 shrink-0 touch-target flex items-center"
          >
            MY BOOKINGS
          </Link>
        </div>
      </div>

      {/* Search input */}
      <div className="bg-white border-b border-ui">
        <Suspense fallback={null}>
          <SearchInput />
        </Suspense>

        {/* Category filter nav */}
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none"
          role="navigation"
          aria-label="Filter by category"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Link
            href={activeQ ? `/feed?q=${activeQ}` : '/feed'}
            className={cn(
              'shrink-0 inline-flex items-center h-[36px] px-4 rounded-pill border border-ui',
              'font-mono text-[12px] font-bold tracking-[0.04em] touch-target',
              'motion-safe:transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue',
              activeCategory === null
                ? 'bg-favour-blue text-white border-favour-blue'
                : 'bg-white text-ink-700 hover:border-favour-blue hover:text-favour-blue'
            )}
            aria-current={activeCategory === null ? 'page' : undefined}
          >
            ALL
          </Link>

          {SERVICE_CATEGORIES.map((cat) => {
            const label = SERVICE_CATEGORY_LABELS[cat]
            const isActive = activeCategory === cat
            const href = activeQ ? `/feed?category=${cat}&q=${activeQ}` : `/feed?category=${cat}`
            return (
              <Link
                key={cat}
                href={href}
                className={cn(
                  'shrink-0 inline-flex items-center h-[36px] px-4 rounded-pill border border-ui',
                  'font-mono text-[12px] font-bold tracking-[0.04em] touch-target',
                  'motion-safe:transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue',
                  isActive
                    ? 'bg-favour-blue text-white border-favour-blue'
                    : 'bg-white text-ink-700 hover:border-favour-blue hover:text-favour-blue'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {label.toUpperCase()}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Provider list */}
      <div className="px-4 pt-4">
        <Suspense fallback={<ProviderListSkeleton />}>
          <ProviderList category={activeCategory ?? undefined} q={activeQ ?? undefined} />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/feed/SearchInput.tsx "client/src/app/(customer)/feed/page.tsx"
git commit -m "feat(client): add keyword search + MY BOOKINGS link to feed"
```

---

## Task 10: Client — rewrite booking form

**Files:**
- Modify: `client/src/app/(customer)/book/[providerId]/page.tsx`

- [ ] **Step 1: Replace the booking form page entirely**

Open `client/src/app/(customer)/book/[providerId]/page.tsx`. Replace the entire file:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Input } from '@/components/ui/Input'
import { SERVICE_CATEGORY_LABELS } from '@favour/shared'
import type { ProviderDetail, Service } from '@favour/shared'

interface BookPageProps {
  params: { providerId: string }
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  const [provider, setProvider] = useState<ProviderDetail | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [datetime, setDatetime] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Minimum datetime: right now (browsers enforce min via the input)
  const minDatetime = new Date().toISOString().slice(0, 16)

  useEffect(() => {
    api.providers.getById(params.providerId)
      .then(setProvider)
      .catch(() => setLoadError(true))
  }, [params.providerId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedService) {
      setError('Please select a service before continuing.')
      return
    }
    if (!datetime) {
      setError('Please choose a date and time.')
      return
    }
    if (!address.trim()) {
      setError('Please enter your service address.')
      return
    }
    if (!accessToken) {
      setError('You must be signed in to book.')
      return
    }

    setLoading(true)
    try {
      const booking = await api.bookings.create(
        {
          serviceId: selectedService.id,
          providerId: params.providerId,
          datetime: new Date(datetime).toISOString(),  // convert datetime-local to ISO UTC
          address: address.trim(),
          notes: notes.trim() || undefined,
        },
        accessToken
      )
      router.push(`/bookings/${booking.id}`)  // FIXED: was /feed/bookings/
    } catch {
      setError('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-surface pb-12">
        <div className="bg-favour-dark px-4 pt-12 pb-6">
          <h1 className="font-display font-extrabold text-[24px] text-white">Request Booking</h1>
        </div>
        <div className="px-4 pt-6">
          <div role="alert" className="bg-danger/10 border border-danger/30 rounded-card p-4">
            <p className="font-sans text-[14px] font-semibold text-danger">
              Could not load provider details. Please go back and try again.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 font-mono text-[12px] font-bold text-favour-blue"
          >
            ← GO BACK
          </button>
        </div>
      </main>
    )
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-surface pb-12">
        <div className="bg-favour-dark px-4 pt-12 pb-6 animate-pulse">
          <div className="h-7 w-48 bg-white/20 rounded" />
        </div>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] bg-white rounded-card border border-ui animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <p className="font-mono text-[11px] font-bold text-white/55 tracking-[0.08em] mb-1">
          BOOKING REQUEST
        </p>
        <h1 className="font-display font-extrabold text-[24px] text-white leading-snug">
          {provider.displayName}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 flex flex-col gap-5" noValidate>
        {error && (
          <div role="alert" className="bg-danger/10 border border-danger/30 rounded-card p-4">
            <p className="font-sans text-[14px] font-semibold text-danger">{error}</p>
          </div>
        )}

        {/* Service picker */}
        <div>
          <FieldLabel>SELECT SERVICE</FieldLabel>
          <div className="flex flex-col gap-2 mt-1">
            {provider.services.map((service) => {
              const isSelected = selectedService?.id === service.id
              const categoryLabel =
                SERVICE_CATEGORY_LABELS[service.category as keyof typeof SERVICE_CATEGORY_LABELS] ??
                service.category
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-4 rounded-card border transition-colors ${
                    isSelected
                      ? 'border-favour-blue bg-favour-blue/5 ring-1 ring-favour-blue-mid'
                      : 'border-border-ui bg-white hover:border-favour-blue'
                  }`}
                  aria-pressed={isSelected}
                >
                  <p className="font-sans text-[14px] font-semibold text-favour-dark">
                    {service.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-[13px] font-bold text-favour-dark">
                      PHP {service.priceMin.toLocaleString()}
                      {service.priceMax !== service.priceMin &&
                        ` – ${service.priceMax.toLocaleString()}`}
                    </span>
                    {service.duration && (
                      <span className="font-mono text-[11px] text-ink-400 tracking-[0.04em]">
                        {service.duration}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-ink-400 tracking-[0.04em]">
                      {categoryLabel.toUpperCase()}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date & time */}
        <div>
          <FieldLabel htmlFor="datetime">DATE &amp; TIME</FieldLabel>
          <Input
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
            min={minDatetime}
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="address">SERVICE ADDRESS</FieldLabel>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={3}
            placeholder="Enter your full address in Batangas City"
            className="w-full border border-border-ui rounded-input bg-white px-4 py-3 font-body text-[15px] text-favour-dark placeholder:text-ink-400 outline-none focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid resize-none"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="notes">
            ADDITIONAL NOTES{' '}
            <span className="font-body text-[11px] font-normal text-ink-400 normal-case">(optional)</span>
          </FieldLabel>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Describe the issue or any special instructions"
            className="w-full border border-border-ui rounded-input bg-white px-4 py-3 font-body text-[15px] text-favour-dark placeholder:text-ink-400 outline-none focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid resize-none"
          />
        </div>

        {/* Summary + submit */}
        {selectedService && (
          <div className="rounded-card border border-border-ui bg-white p-4">
            <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-2">
              BOOKING SUMMARY
            </p>
            <p className="font-sans text-[14px] font-semibold text-favour-dark">
              {selectedService.name}
            </p>
            <p className="font-mono text-[15px] font-extrabold text-favour-dark mt-1">
              PHP {selectedService.priceMin.toLocaleString()}
              {selectedService.priceMax !== selectedService.priceMin &&
                ` – ${selectedService.priceMax.toLocaleString()}`}
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? 'Booking…' : 'Confirm Booking'}
        </Button>
      </form>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "client/src/app/(customer)/book/[providerId]/page.tsx"
git commit -m "feat(client): rewrite booking form — service picker, fix datetime field, fix post-booking redirect"
```

---

## Task 11: Client — convert booking detail to Client Component

**Files:**
- Modify: `client/src/app/(customer)/bookings/[id]/page.tsx`

- [ ] **Step 1: Replace booking detail page**

Open `client/src/app/(customer)/bookings/[id]/page.tsx`. Replace the entire file:

```tsx
'use client'

import { useParams, notFound, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { BookingConfirmed } from '@/components/bookings/BookingConfirmed'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  })
}

function SkeletonDetail() {
  return (
    <main className="min-h-screen bg-surface pb-12">
      <div className="bg-favour-dark px-4 pt-12 pb-6 animate-pulse">
        <div className="h-4 w-32 bg-white/20 rounded mb-3" />
        <div className="h-7 w-48 bg-white/20 rounded" />
      </div>
      <div className="px-4 pt-4 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white rounded-card border border-ui animate-pulse" />
        ))}
      </div>
    </main>
  )
}

export default function BookingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (accessToken === null) {
      router.replace('/auth/login')
    }
  }, [accessToken, router])

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', params.id],
    queryFn: () => api.bookings.getById(params.id, accessToken ?? ''),
    enabled: !!accessToken,
    retry: false,
  })

  if (isLoading || !accessToken) return <SkeletonDetail />

  if (isError || !booking) {
    return (
      <main className="min-h-screen bg-surface pb-12">
        <div className="bg-favour-dark px-4 pt-12 pb-6">
          <h1 className="font-display font-extrabold text-[24px] text-white">Booking Details</h1>
        </div>
        <div className="px-4 pt-4">
          <div role="alert" className="bg-danger/10 border border-danger/30 rounded-card p-4">
            <p className="font-sans text-[14px] font-semibold text-danger">
              Booking not found or you don't have access.
            </p>
          </div>
          <Link href="/bookings" className="mt-4 block font-mono text-[12px] font-bold text-favour-blue">
            ← MY BOOKINGS
          </Link>
        </div>
      </main>
    )
  }

  const showConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'

  return (
    <main className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-6">
        <Link
          href="/bookings"
          className="font-mono text-[12px] font-bold text-white/60 tracking-[0.08em] hover:text-white/90 motion-safe:transition-colors duration-150"
        >
          ← MY BOOKINGS
        </Link>
        <h1 className="font-display font-extrabold text-[24px] text-white leading-snug mt-3">
          Booking Details
        </h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {showConfirmed && (
          <BookingConfirmed
            referenceCode={booking.referenceCode}
            providerName={booking.provider?.displayName ?? 'Your Provider'}
            scheduledAt={booking.datetime}
            status={booking.status}
          />
        )}

        {!showConfirmed && (
          <>
            <div className="bg-white border border-ui rounded-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em]">STATUS</p>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div>
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">REFERENCE</p>
                <p className="font-mono text-[20px] font-extrabold text-favour-dark">{booking.referenceCode}</p>
              </div>
            </div>

            <div className="bg-white border border-ui rounded-card p-4">
              <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">SCHEDULED FOR</p>
              <p className="font-sans text-[15px] font-semibold text-favour-dark">{formatDate(booking.datetime)}</p>
            </div>

            <div className="bg-white border border-ui rounded-card p-4">
              <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">ADDRESS</p>
              <p className="font-sans text-[15px] text-favour-dark leading-relaxed">{booking.address}</p>
            </div>

            {booking.notes && (
              <div className="bg-white border border-ui rounded-card p-4">
                <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-1">NOTES</p>
                <p className="font-sans text-[15px] text-favour-dark leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </>
        )}

        <Link
          href="/bookings"
          className="flex items-center justify-center h-btn rounded-btn border border-ui text-favour-blue font-display font-extrabold text-[17px] touch-target w-full motion-safe:transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2 mt-2"
        >
          My Bookings
        </Link>
      </div>
    </main>
  )
}
```

Note: `useParams` requires Next.js 13.3+, which is satisfied by Next.js 14.

- [ ] **Step 2: Commit**

```bash
git add "client/src/app/(customer)/bookings/[id]/page.tsx"
git commit -m "fix(client): convert booking detail to Client Component — fixes empty auth token bug"
```

---

## Task 12: Client — create customer bookings list page

**Files:**
- Create: `client/src/app/(customer)/bookings/page.tsx`

- [ ] **Step 1: Create the bookings list page**

Create new file `client/src/app/(customer)/bookings/page.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'
import type { Booking } from '@favour/shared'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  })
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block bg-white border border-ui rounded-card p-4 motion-safe:transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-favour-blue focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-mono text-[18px] font-extrabold text-favour-dark leading-none">
          {booking.referenceCode}
        </p>
        <BookingStatusBadge status={booking.status} />
      </div>
      {booking.service && (
        <p className="font-sans text-[14px] font-semibold text-favour-dark mt-1">
          {booking.service.name}
        </p>
      )}
      {booking.provider && (
        <p className="font-sans text-[13px] text-ink-700 mt-0.5">{booking.provider.displayName}</p>
      )}
      <p className="font-mono text-[12px] text-ink-400 mt-2 tracking-[0.02em]">
        {formatDate(booking.datetime)}
      </p>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-ui rounded-card p-4 animate-pulse" aria-hidden="true">
      <div className="flex justify-between mb-3">
        <div className="h-5 w-36 bg-surface rounded" />
        <div className="h-5 w-20 bg-surface rounded-full" />
      </div>
      <div className="h-4 w-48 bg-surface rounded mb-2" />
      <div className="h-3 w-32 bg-surface rounded" />
    </div>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (accessToken === null) {
      router.replace('/auth/login')
    }
  }, [accessToken, router])

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'customer'],
    queryFn: () => api.bookings.list(accessToken ?? ''),
    enabled: !!accessToken,
  })

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-favour-dark px-4 pt-12 pb-5">
        <Link
          href="/feed"
          className="font-mono text-[11px] font-bold text-white/60 tracking-[0.08em] hover:text-white/90 motion-safe:transition-colors"
        >
          ← BACK TO FEED
        </Link>
        <h1 className="font-display font-extrabold text-[26px] text-white leading-tight mt-3">
          My Bookings
        </h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {isLoading || !accessToken ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !bookings || bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-[64px] h-[64px] rounded-[10px] bg-surface flex items-center justify-center mb-4">
              <span className="font-mono text-[28px]" aria-hidden="true">📋</span>
            </div>
            <h2 className="font-display font-extrabold text-[20px] text-favour-dark mb-2">
              No bookings yet
            </h2>
            <p className="font-sans text-[14px] text-ink-700 max-w-[300px] leading-relaxed">
              Find a provider and request a service to get started.
            </p>
            <Link
              href="/feed"
              className="mt-6 flex items-center justify-center h-btn rounded-btn bg-favour-blue text-white font-display font-extrabold text-[17px] touch-target px-8"
            >
              Find a Provider
            </Link>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "client/src/app/(customer)/bookings/page.tsx"
git commit -m "feat(client): add customer bookings list page at /bookings"
```

---

## Task 13: Client — add duration field to onboarding StepServices

**Files:**
- Modify: `client/src/app/(provider)/onboarding/StepServices.tsx`
- Modify: `client/src/app/(provider)/onboarding/page.tsx`

- [ ] **Step 1: Update `ServiceEntry` interface and add duration input in StepServices**

Open `client/src/app/(provider)/onboarding/StepServices.tsx`.

Change the `ServiceEntry` interface (line 11–16) to add `duration`:
```typescript
export interface ServiceEntry {
  name: string
  category: ServiceCategory | ''
  priceMin: string
  priceMax: string
  duration: string  // e.g. "60 min" — empty string means not set
}
```

Inside the service card grid (after the `grid grid-cols-2` price block), add a new duration field:
```tsx
<div>
  <FieldLabel htmlFor={`service-duration-${index}`}>
    DURATION <span className="font-body font-normal normal-case">(optional)</span>
  </FieldLabel>
  <Input
    id={`service-duration-${index}`}
    value={service.duration}
    onChange={(event) => updateService(index, { duration: event.target.value })}
    placeholder="e.g. 60 min, 2–3 hrs"
    maxLength={30}
  />
</div>
```

- [ ] **Step 2: Update `OnboardingState`, `addService`, and `buildPayload` in `page.tsx`**

Open `client/src/app/(provider)/onboarding/page.tsx`.

In the `OnboardingState` interface, the `services` field is `ServiceEntry[]` which already picks up the new `duration` field via the interface update. No change needed here.

In the initial state (line 35), update the default service entry to include `duration`:
```typescript
services: [{ name: '', category: '', priceMin: '', priceMax: '', duration: '' }],
```

In `addService` inside `StepServices.tsx` (the `addService` function), update the blank entry:
```typescript
function addService() {
  if (services.length >= 10) return
  onChange([...services, { name: '', category: '', priceMin: '', priceMax: '', duration: '' }])
}
```

In `buildPayload` in `page.tsx`, update the services map to include duration:
```typescript
const services = state.services.map((service) => ({
  name: service.name.trim(),
  category: service.category as ServiceCategory,
  priceMin: Number.parseInt(service.priceMin, 10),
  priceMax: Number.parseInt(service.priceMax, 10),
  ...(service.duration.trim() ? { duration: service.duration.trim() } : {}),
}))
```

- [ ] **Step 3: Run the server tests once more to confirm no regressions**

```bash
cd server && pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd ..
git add "client/src/app/(provider)/onboarding/StepServices.tsx" "client/src/app/(provider)/onboarding/page.tsx"
git commit -m "feat(client): add optional duration field to onboarding service step"
```

---

## Task 14: Final verification

- [ ] **Step 1: Build the shared package and check for TypeScript errors**

```bash
cd packages/shared && pnpm build
```

Expected: success, no errors.

- [ ] **Step 2: Check server TypeScript**

```bash
cd ../server && pnpm tsc --noEmit
```

Expected: no errors (or same pre-existing warnings as before — do not introduce new ones).

- [ ] **Step 3: Run all server tests**

```bash
pnpm test
```

Expected: all 23+ tests pass.

- [ ] **Step 4: Verify client builds without type errors**

```bash
cd ../client && pnpm tsc --noEmit
```

Expected: no new type errors introduced by this work.

- [ ] **Step 5: Manual smoke test checklist**

Start the server (`cd server && pnpm dev`) and client (`cd client && pnpm dev`) in separate terminals.

Walk through this path:
1. ✅ Open `/feed` — see "MY BOOKINGS" link top-right
2. ✅ Type in search box — URL updates to `?q=...`, list filters
3. ✅ Tap a category chip — filter applies, search preserved in URL
4. ✅ Tap a provider card — navigates to `/providers/[id]` (not 404)
5. ✅ Provider profile shows services list with duration (if set)
6. ✅ Tap "Book Now" — navigates to `/book/[id]` (not 404)
7. ✅ Booking form shows service picker
8. ✅ Select a service, fill datetime + address, submit
9. ✅ Lands on `/bookings/[id]` — shows booking detail (not 401)
10. ✅ Tap "MY BOOKINGS" → `/bookings` — shows booking cards

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass — booking flow + feed enhancements complete"
git push origin dev
```

---

## Self-Review

**Spec coverage check:**
- ✅ Bug 1 (ProviderCard URL) → Task 7
- ✅ Bug 2 (Book Now URL) → Task 8
- ✅ Bug 3 (schema field mismatch / providerType removal) → Task 1
- ✅ Bug 4 (no service picker) → Task 10
- ✅ Bug 5 (post-booking redirect) → Task 10
- ✅ Bug 6 (booking detail auth) → Task 11
- ✅ Customer bookings list → Task 12
- ✅ Verified badge → Tasks 4, 7, 8
- ✅ Keyword search → Tasks 1, 3, 9
- ✅ Service duration → Tasks 1, 2, 4, 8, 13
- ✅ MY BOOKINGS nav entry → Task 9
- ✅ Tests for keyword search → Task 5

**Type consistency check:**
- `ProviderSummary.isVerified` used in Task 7 ProviderCard ✅
- `ProviderDetail.services` used in Task 10 booking form ✅
- `Service.duration` added in Task 1, used in Tasks 8, 10, 13 ✅
- `CreateBookingInput` (without providerType) used in Task 10 ✅
- `api.bookings.list()` return type `Booking[]` used in Task 12 ✅
