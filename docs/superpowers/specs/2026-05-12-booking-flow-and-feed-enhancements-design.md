# Booking Flow Fix + Feed Enhancements Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the broken customer booking path end-to-end, add a customer bookings list, and enhance the provider feed with keyword search, verified badges, and service duration.

**Architecture:** Minimal-touch changes — fix bugs in existing files, add two new client pages (bookings list, rework booking form), one Prisma migration covering both new fields, and server-side filtering for search. No new routes; no structural changes.

**Tech Stack:** Next.js 14 App Router (Server + Client Components), Fastify + Prisma, Zod schemas in `@favour/shared`, Zustand auth store, TanStack Query for mutations.

---

## Scope

### Part A — Booking Flow Fixes (6 bugs)

1. **Wrong URL in `ProviderCard`** — links to `/feed/providers/${id}`, route is `/providers/${id}` (404 in production).
2. **Wrong URL on provider profile "Book Now"** — links to `/feed/book/${provider.id}`, route is `/book/${provider.id}`.
3. **Schema mismatch on booking form** — client sends `scheduledAt`, schema requires `datetime`. Client sends no `serviceId`. Client sends no `providerType` (which is also removable — it's unused server-side and derivable from the DB).
4. **No service picker** — the form has no way to select which service to book. `serviceId` is required by the schema and the DB.
5. **Wrong redirect after booking** — redirects to `/feed/bookings/${booking.id}`, route is `/bookings/${booking.id}`.
6. **Booking detail auth** — `bookings/[id]/page.tsx` is a Server Component calling the API with an empty `""` token; the endpoint requires auth. Fix: convert to a Client Component reading the token from Zustand.

### Part B — Customer Bookings List (new page)

A new `/bookings` page listing the authenticated customer's bookings. Entry point: a "MY BOOKINGS" link in the feed header (top-right of the dark header bar, in JetBrains Mono per design system). Shows booking reference code, service name, provider name, scheduled datetime, and status badge. Tapping a card links to `/bookings/[id]`.

### Part C — Feed Enhancements (3 additions from CEO POC)

**Verified badge:** Add `verified Boolean @default(false)` to `Provider`. Show a `ShieldCheck` badge on `ProviderCard` and the provider profile header. No verification flow in MVP — admins flip manually in Prisma Studio.

**Keyword search:** Add a `q` query param to `GET /providers`. Prisma `OR` filter: `displayName contains q` OR `services.some({ name contains q })`. Client: a `SearchInput` client component above the category chips on the feed page (URL-based, not state-based — preserves SSR). Composable with `category` filter.

**Service duration:** Add `duration String?` to `Service` (e.g. `"60 min"`, `"2–3 hrs"`). Add optional `duration` (max 30 chars) to the service object in `CreateProviderSchema`. Add a duration input to `StepServices` in the onboarding wizard. Display it in the provider profile service list and in the booking form service selector.

---

## Data Model Changes

### `Provider` (add field)
```prisma
verified Boolean @default(false)
```
No new migration needed for existing records — default handles it.

### `Service` (add field)
```prisma
duration String?
```
Optional — existing services without duration display nothing, no breakage.

Both go in one migration: `add_verified_to_provider_add_duration_to_service`.

---

## Schema Changes (`packages/shared/src/schemas.ts`)

### `CreateBookingSchema` — remove `providerType`, rename no fields
```typescript
export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  // providerType removed — unused server-side, derivable from DB
  datetime: z.string().datetime().refine(
    d => new Date(d) > new Date(),
    'Booking must be in the future'
  ),
  address: z.string().min(10, 'Address too short').max(200),
  notes: z.string().max(500).optional(),
})
```

### Service object inside `CreateProviderSchema` — add duration
```typescript
z.object({
  name: z.string().trim().min(2).max(80),
  category: z.enum(SERVICE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]),
  priceMin: z.number().int().positive().max(100_000),
  priceMax: z.number().int().positive().max(100_000),
  duration: z.string().trim().max(30).optional(),  // NEW
})
```

### `ProviderFeedQuerySchema` — add `q`
```typescript
export const ProviderFeedQuerySchema = z.object({
  category: z.enum(SERVICE_CATEGORIES as [ServiceCategory, ...ServiceCategory[]]).optional(),
  q: z.string().trim().max(100).optional(),  // NEW
})
```

### `ProviderSummary` type — add `verified`
```typescript
// In types.ts or schemas.ts
verified: boolean
```

---

## Server Changes

### `server/src/repositories/providers.repo.ts` — add `q` filtering + `verified` in select
```typescript
// In findMany, add to where clause:
...(query.q ? {
  OR: [
    { displayName: { contains: query.q, mode: 'insensitive' } },
    { services: { some: { name: { contains: query.q, mode: 'insensitive' } } } },
  ]
} : {}),
```
Include `verified` in all `select`/`include` blocks that power the summary.

### `server/src/services/providers.service.ts` — include `verified` in `toSummary`
```typescript
function toSummary(p: any) {
  return {
    ...existing fields...,
    verified: p.verified,  // NEW
  }
}
```

### `server/src/services/providers.service.ts` — include `duration` in `create`
Pass `duration: service.duration ?? null` when creating services in the transaction.

---

## Client Changes

### `client/src/components/providers/ProviderCard.tsx`
- Fix URL: `/feed/providers/${id}` → `/providers/${id}`
- Add verified badge: if `provider.verified`, render `<ShieldCheck size={14} className="text-verify-green" />` next to the category/city line with `"VERIFIED"` label in `font-mono text-[11px]`.

### `client/src/app/(customer)/providers/[id]/page.tsx`
- Fix "Book Now" URL: `/feed/book/${provider.id}` → `/book/${provider.id}`
- Add verified shield badge in the header next to the type `Pill`.
- Show service `duration` on each service row if present.

### `client/src/app/(customer)/feed/page.tsx`
- Add `q?: string` to `FeedPageProps.searchParams`.
- Pass `q` to `ProviderList`, then to `api.providers.feed({ category, q })`.
- Add a `SearchInput` client component (new file: `client/src/components/feed/SearchInput.tsx`) between the header and the category chips. It reads `q` from `useSearchParams()` and uses `useRouter()` to push `?q=...&category=...` on change (debounced 300ms). Preserves the active category when searching.
- Show a "X results for 'query'" count line above the provider list when `q` is set.

### `client/src/app/(customer)/book/[providerId]/page.tsx` — full rewrite
Convert to a proper booking form:
- On mount, fetch `api.providers.getById(providerId)` to get the provider's services list (no auth required for this endpoint).
- Render a service selector: tappable cards showing service name, duration (if set), and `PHP priceMin – priceMax`. Selected service is highlighted.
- Rename `scheduledAt` state to `datetime`.
- Send correct payload: `{ serviceId, providerId, datetime, address, notes }` — no `providerType`.
- Fix redirect: `/feed/bookings/${booking.id}` → `/bookings/${booking.id}`.
- Show the provider name and selected service price in a summary above the submit button.

### `client/src/app/(customer)/bookings/[id]/page.tsx` — convert to Client Component
- Add `'use client'` directive.
- Read `accessToken` from `useAuthStore()`.
- Use TanStack Query `useQuery` to fetch `api.bookings.getById(params.id, accessToken ?? '')`.
- Show loading skeleton while fetching.
- The rest of the UI stays the same.

### `client/src/app/(customer)/bookings/page.tsx` — new file
Customer bookings list. Client Component.
- `useQuery` to fetch `api.bookings.list(accessToken ?? '')` (no scope param = customer scope).
- Header: dark bar, "MY BOOKINGS" title.
- List of booking cards: reference code (JetBrains Mono, large), service name + provider name, scheduled datetime formatted to `en-PH`, `BookingStatusBadge`.
- Each card links to `/bookings/${booking.id}`.
- Empty state: "No bookings yet — find a provider to get started." with a link to `/feed`.
- Redirect unauthenticated users to `/auth/login`.

### `client/src/app/(customer)/feed/page.tsx` header — add "MY BOOKINGS" link
Top-right of the dark header bar:
```tsx
<div className="flex items-center justify-between">
  <div>  {/* existing h1 + p */}  </div>
  <Link href="/bookings" className="font-mono text-[11px] font-bold text-white/70 hover:text-white tracking-[0.08em]">
    MY BOOKINGS
  </Link>
</div>
```

### `client/src/app/(provider)/onboarding/StepServices.tsx` — add duration input
Add an optional `duration` text input per service row:
```tsx
<Input
  value={service.duration ?? ''}
  onChange={(e) => update(index, { duration: e.target.value })}
  placeholder="e.g. 60 min"
  maxLength={30}
/>
```
Update `ServiceEntry` interface to include `duration?: string`.

### `client/src/lib/api.ts`
- Update `api.providers.feed()` to accept `q?: string` in params.
- Update `api.bookings.create()` to type the body as `CreateBookingInput` from `@favour/shared`.

---

## Error Handling

- **Booking form: no service selected** — inline error "Please select a service before continuing."
- **Booking form: provider fetch failure** — show error card "Could not load provider details. Please go back and try again."
- **Booking detail: unauthenticated** — redirect to `/auth/login` if no token.
- **Customer bookings list: unauthenticated** — redirect to `/auth/login` if no token.
- **Search: empty results with query** — extend existing empty state to say "No providers matching '{q}' in Batangas City."

---

## What We Are Not Changing

- Payment/escrow — not in MVP.
- Business verification flow — not in MVP (only the badge display).
- Geolocation — Batangas City is the unit; no GPS radius.
- Dark mode.
- Provider profile editing post-onboarding (separate future feature).
- Service image uploads (separate future feature).

---

## Testing

### Server (Vitest)
- `providers.test.ts`: add test for `GET /providers?q=plumber` returns filtered results; `GET /providers?q=` returns all.
- `bookings.test.ts`: confirm `POST /bookings` without `providerType` still passes validation; confirm it rejects missing `serviceId`.

### Manual smoke test path
1. Log in → land on feed.
2. Search "plumb" → see filtered results.
3. Tap a provider → see provider profile with verified badge (if set) + service durations.
4. Tap "Book Now" → booking form loads with service picker.
5. Select a service → fill datetime + address → submit.
6. Land on booking detail page (no 401).
7. Tap "MY BOOKINGS" in feed header → see bookings list → tap a booking → booking detail.
