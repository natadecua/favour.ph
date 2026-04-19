# Favour.ph — Monorepo Scaffold Design

**Date:** 2026-04-13
**Scope:** MVP only
**Approach:** Layer-by-layer, bottom-up (shared → server → client)

---

## 1. Constraints & Decisions

| Concern | Decision |
|---|---|
| Payments | Out of scope for MVP |
| Provider registration | Manual team onboarding only — no provider signup flow |
| Admin UI | Prisma Studio / direct DB access for week 1 |
| Chat | WebSocket only, no history pagination, no read receipts, no media |
| FavourScore calculation | In-process after booking completion / review events |
| Notifications | Semaphore SMS + Nodemailer — stubbed, wired via env flag |
| Geo | Distance chip is display-only from provider city field, no geo queries |
| Scaling | Single Fly.io machine, no autoscaling |

---

## 2. Monorepo Root

**Package manager:** pnpm 10 workspaces

**Workspace members:**
- `packages/shared`
- `client`
- `server`

**Root files:**
- `pnpm-workspace.yaml` — workspace declaration
- `package.json` — root dev scripts (`dev`, `build`, `lint`)
- `tsconfig.base.json` — shared TypeScript config (strict mode, path aliases)
- `.env.example` — all environment variables documented
- `fly.toml` — Fly.io server deployment config (Node 20, Singapore region, single machine)

---

## 3. `packages/shared`

**Package name:** `@favour/shared`
**No build step** — imported as raw TypeScript via tsconfig path aliases in both client and server.

### `types.ts`
Core domain types inferred from Prisma schema:
- `User` — id, email, phone, role (`CUSTOMER | PROVIDER | ADMIN`), createdAt
- `Provider` — id, userId, type (`BUSINESS | FREELANCER`), displayName, bio, city, servicesOffered, favourScore, isVerified, photos
- `Service` — id, providerId, name, category, priceMin, priceMax
- `Booking` — id, customerId, providerId, serviceId, status (`PENDING | CONFIRMED | DECLINED | COMPLETED | CANCELLED`), datetime, address, notes, referenceCode
- `Review` — id, bookingId, authorId, targetId, rating (1–5), body, createdAt
- `Message` — id, bookingId, senderId, body, createdAt
- `FavourScore` — providerId, overall, responseRate, completionRate, reviewAverage, recency

### `constants.ts`
- `SERVICE_CATEGORIES` — `['aircon', 'plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'appliance_repair']`
- `BOOKING_STATUS` — enum values mirroring Prisma
- `PROVIDER_TYPE` — `'BUSINESS' | 'FREELANCER'`
- `FAVOUR_SCORE_WEIGHTS` — `{ responseRate: 0.25, completionRate: 0.35, reviewAverage: 0.30, recency: 0.10 }`
- `REFERENCE_CODE_PREFIX` — `'FVR'`
- `MAX_PHOTOS_PER_PROVIDER` — `10`
- `UPLOAD_MAX_SIZE_BYTES` — `5_242_880` (5MB)
- `ALLOWED_IMAGE_TYPES` — `['image/jpeg', 'image/png', 'image/webp']`

### `schemas.ts` (already written)
- `CreateBookingSchema`
- `RespondToBookingSchema`
- `CancelBookingSchema`
- `CreateReviewSchema`
- `CreateChatMessageSchema`
- `ProviderFeedQuerySchema`

### `index.ts`
Barrel export of all types, schemas, and constants.

---

## 4. Server (`server/`)

### Deployment
- **Runtime:** Node.js 20 Alpine (multi-stage Dockerfile)
- **Platform:** Fly.io, Singapore region (`sin` in fly.toml)
- **Process:** Single persistent process, 512MB RAM machine for MVP

### Directory Structure
```
server/
├── Dockerfile
├── prisma/
│   └── schema.prisma
├── src/
│   ├── server.ts              # entrypoint: listen on PORT
│   ├── app.ts                 # Fastify factory: registers plugins, routes
│   ├── plugins/
│   │   ├── auth.ts            # JWT verify + Redis session cache
│   │   ├── redis.ts           # Upstash Redis connection (ioredis)
│   │   └── prisma.ts          # Prisma client singleton decorated onto fastify
│   ├── routes/
│   │   ├── providers.ts       # GET /providers, GET /providers/:id
│   │   ├── bookings.ts        # POST /bookings, GET /bookings/:id, PATCH /bookings/:id/respond, PATCH /bookings/:id/cancel, PATCH /bookings/:id/complete
│   │   ├── reviews.ts         # POST /reviews
│   │   ├── chat.ts            # WS /chat/:bookingId
│   │   └── uploads.ts         # POST /uploads/sign
│   ├── controllers/           # thin layer: parse request → call service → return response
│   │   ├── providers.controller.ts
│   │   ├── bookings.controller.ts
│   │   ├── reviews.controller.ts
│   │   └── uploads.controller.ts
│   ├── services/              # business logic
│   │   ├── providers.service.ts     # feed query, profile assembly
│   │   ├── bookings.service.ts      # state machine, reference code generation
│   │   ├── reviews.service.ts       # post-review FavourScore trigger
│   │   ├── favourScore.service.ts   # score calculation from weights
│   │   ├── notifications.service.ts # Semaphore SMS + Nodemailer stubs
│   │   └── uploads.service.ts       # signed URL issuance via Supabase Storage SDK
│   └── repositories/          # Prisma queries only
│       ├── providers.repo.ts
│       ├── bookings.repo.ts
│       └── reviews.repo.ts
```

### Auth Flow
1. Client sends `Authorization: Bearer <supabase_jwt>`
2. `auth` plugin verifies signature with `SUPABASE_JWT_SECRET` (no DB hit)
3. Redis checked for `session:{userId}` — returns `{ role, providerId }` on hit
4. Cache miss: fetch from DB, cache with TTL = remaining JWT lifetime
5. Revocation: delete Redis key + set `banned:{userId}` flag
6. `request.user` decorated with `{ id, role, providerId }`

### Booking State Machine
```
PENDING → CONFIRMED (provider responds confirm)
PENDING → DECLINED  (provider responds decline)
CONFIRMED → COMPLETED (provider marks complete)
CONFIRMED → CANCELLED (either party cancels)
PENDING → CANCELLED (customer cancels before response)
```
Invalid transitions throw a `400` error in the service layer.

### FavourScore Calculation
Triggered after: booking marked COMPLETED, review submitted.
Formula: `(responseRate × 0.25) + (completionRate × 0.35) + (reviewAverage × 0.30) + (recency × 0.10)`
Runs synchronously in service layer for MVP (no job queue needed at this scale).

### File Upload Flow
1. Client compresses image client-side (`browser-image-compression`)
2. Client calls `POST /uploads/sign` with `{ fileName, fileType, fileSize }`
3. Server validates: authenticated, `fileType` in allowed list, `fileSize` ≤ 5MB, provider owns the resource
4. Server calls Supabase Storage SDK to generate a signed upload URL (60s expiry)
5. Client uploads directly to Supabase Storage using signed URL
6. Client calls provider update endpoint with the resulting public URL

### Database (Prisma Schema — key models)
```prisma
model User {
  id        String   @id @default(uuid())
  phone     String   @unique
  email     String?  @unique
  role      Role     @default(CUSTOMER)
  provider  Provider?
  bookingsAsCustomer Booking[] @relation("CustomerBookings")
  createdAt DateTime @default(now())
}

model Provider {
  id           String        @id @default(uuid())
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id])
  type         ProviderType
  displayName  String
  bio          String?
  city         String
  isVerified   Boolean       @default(false)
  photos       String[]
  services     Service[]
  bookings     Booking[]     @relation("ProviderBookings")
  favourScore  FavourScore?
}

model Booking {
  id            String        @id @default(uuid())
  referenceCode String        @unique
  customerId    String
  customer      User          @relation("CustomerBookings", fields: [customerId], references: [id])
  providerId    String
  provider      Provider      @relation("ProviderBookings", fields: [providerId], references: [id])
  serviceId     String
  service       Service       @relation(fields: [serviceId], references: [id])
  status        BookingStatus @default(PENDING)
  datetime      DateTime
  address       String
  notes         String?
  messages      Message[]
  review        Review?
  createdAt     DateTime      @default(now())
}
```

### Environment Variables (server)
```
DATABASE_URL          # Supabase pooler URL (port 6543, ?pgbouncer=true)
DIRECT_URL            # Supabase direct URL (port 5432, migrations only)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
REDIS_URL             # Upstash rediss:// connection string
SEMAPHORE_API_KEY
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
PORT                  # default 3001
NODE_ENV
```

---

## 5. Client (`client/`)

### Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS (design tokens from `docs/Frontend/favour-design-prompt-short.md`)
- Supabase Auth (`@supabase/ssr`)
- TanStack Query v5
- Zustand

### Directory Structure
```
client/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # phone + OTP via Supabase
│   │   │   └── verify/page.tsx
│   │   ├── (customer)/
│   │   │   ├── feed/page.tsx         # provider listing (Server Component)
│   │   │   ├── providers/[id]/page.tsx  # provider profile (Server Component)
│   │   │   ├── book/[providerId]/page.tsx  # booking form (Client Component)
│   │   │   ├── bookings/[id]/page.tsx   # booking status + confirmed view
│   │   │   └── chat/[bookingId]/page.tsx
│   │   ├── (provider)/
│   │   │   ├── dashboard/page.tsx    # incoming bookings
│   │   │   └── bookings/[id]/page.tsx
│   │   └── layout.tsx               # QueryClientProvider, auth guard
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Pill.tsx             # from favour-ui-mock.jsx
│   │   │   ├── StatBox.tsx
│   │   │   ├── ServiceRow.tsx
│   │   │   └── FavourScoreBanner.tsx
│   │   ├── providers/
│   │   │   ├── ProviderCard.tsx
│   │   │   └── ProviderProfile.tsx
│   │   ├── bookings/
│   │   │   ├── BookingForm.tsx
│   │   │   ├── BookingConfirmed.tsx
│   │   │   └── BookingStatusBadge.tsx
│   │   └── reviews/
│   │       ├── ReviewForm.tsx
│   │       └── StarSelector.tsx
│   ├── lib/
│   │   ├── supabase.ts              # createBrowserClient + createServerClient
│   │   ├── api.ts                   # typed fetch wrapper → Fastify server
│   │   └── query-client.ts          # TanStack Query config (staleTime, retry)
│   └── stores/
│       └── auth.ts                  # Zustand: { user, role, providerId, clear }
├── tailwind.config.ts               # design tokens as Tailwind theme extension
└── next.config.ts                   # NEXT_PUBLIC env vars, image domains
```

### Tailwind Design Tokens
```ts
colours: {
  'favour-blue':       '#0047CC',
  'favour-blue-light': '#EEF3FF',
  'favour-blue-mid':   '#D0DEFF',
  'favour-dark':       '#111827',
  'ink-700':           '#4B5563',
  'ink-400':           '#9CA3AF',
  'surface':           '#F3F4F6',
  'border':            '#E5E7EB',
  'verify-green':      '#007A33',
  'green-light':       '#ECFDF0',
  'danger':            '#D92121',
  'amber':             '#B36B00',
}
fontFamily: {
  sans:  ['Manrope', 'sans-serif'],
  body:  ['Figtree', 'sans-serif'],
  mono:  ['JetBrains Mono', 'monospace'],
}
```

### Environment Variables (client)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL              # Fastify server URL (Fly.io)
```

### Rendering Strategy
- **Server Components:** provider feed, provider profile, booking detail view (SEO + no loading flicker)
- **Client Components:** booking form, chat, review form, auth pages, provider dashboard

---

## 6. Deployment Files

### `fly.toml`
- App name: `favour-server`
- Region: `sin` (Singapore)
- Port: 3001 internal → 443 external
- Single machine: `shared-cpu-1x`, 512MB RAM
- Health check: `GET /health`

### `Dockerfile`
- Multi-stage: `builder` (installs deps, generates Prisma client, builds TS) → `runner` (Node 20 Alpine, production deps only)
- Non-root user for security
- `CMD ["node", "dist/server.js"]`

---

## 7. MVP Boundaries (out of scope)

- In-app payments
- Provider self-registration
- Admin UI
- Message history pagination / read receipts / media in chat
- Job queue / background workers
- Geo queries / map view
- Multi-region deployment
- Autoscaling
