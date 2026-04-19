# Monorepo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the complete Favour.ph monorepo (shared package, Fastify server, Next.js client) from root config to stubbed routes and base UI components.

**Architecture:** pnpm workspaces with three packages (`packages/shared`, `server/`, `client/`) built bottom-up. Shared types anchor both sides; server uses Fastify + Prisma + Redis auth sessions; client uses Next.js 14 App Router with design tokens from the existing mock.

**Tech Stack:** pnpm 10, TypeScript 5, Zod, Fastify v4, Prisma 5, ioredis, Next.js 14, Tailwind CSS 3, TanStack Query v5, Zustand, Supabase SSR, Vitest, Node 20 Alpine (Docker)

---

## Phase 1 — Monorepo Root

### Task 1: Root workspace config

**Files:**
- Create: `pnpm-workspace.yaml`
- Modify: `package.json`
- Create: `tsconfig.base.json`
- Modify: `.env.example`

- [ ] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'client'
  - 'server'
```

- [ ] **Step 2: Update root package.json**

```json
{
  "name": "favour.ph",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter client dev\" \"pnpm --filter server dev\"",
    "build": "pnpm --filter @favour/shared build && pnpm --filter client build && pnpm --filter server build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.4.5"
  },
  "packageManager": "pnpm@10.32.1"
}
```

- [ ] **Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Write .env.example**

```bash
# ── Database ──────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# ── Supabase ──────────────────────────────────────────────
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_JWT_SECRET="your-jwt-secret"

# ── Redis (Upstash) ───────────────────────────────────────
REDIS_URL="rediss://default:[PASSWORD]@[HOST].upstash.io:6379"

# ── Notifications ─────────────────────────────────────────
SEMAPHORE_API_KEY=""
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS=""

# ── Server ────────────────────────────────────────────────
PORT="3001"
NODE_ENV="development"

# ── Client (prefix NEXT_PUBLIC_) ──────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

- [ ] **Step 5: Install root deps**

```bash
pnpm install
```

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml package.json tsconfig.base.json .env.example
git commit -m "chore: monorepo root — pnpm workspaces, tsconfig base, env example"
```

---

## Phase 2 — packages/shared

### Task 2: Shared types and constants

**Files:**
- Modify: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/constants.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Update packages/shared/package.json**

```json
{
  "name": "@favour/shared",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  },
  "dependencies": {
    "zod": "^3.23.4"
  }
}
```

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write packages/shared/src/types.ts**

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
  isVerified: boolean
  photo: string | null
  favourScore: number | null
  topService: Pick<Service, 'name' | 'category' | 'priceMin' | 'priceMax'> | null
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

- [ ] **Step 4: Write packages/shared/src/constants.ts**

```typescript
import type { ServiceCategory, BookingStatus, ProviderType } from './types'

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'aircon',
  'plumbing',
  'electrical',
  'cleaning',
  'carpentry',
  'painting',
  'appliance_repair',
]

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  aircon: 'Aircon',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  carpentry: 'Carpentry',
  painting: 'Painting',
  appliance_repair: 'Appliance Repair',
}

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED',
]

export const PROVIDER_TYPES: ProviderType[] = ['BUSINESS', 'FREELANCER']

export const FAVOUR_SCORE_WEIGHTS = {
  responseRate: 0.25,
  completionRate: 0.35,
  reviewAverage: 0.30,
  recency: 0.10,
} as const

export const REFERENCE_CODE_PREFIX = 'FVR'

export const MAX_PHOTOS_PER_PROVIDER = 10
export const UPLOAD_MAX_SIZE_BYTES = 5_242_880 // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const REDIS_SESSION_PREFIX = 'session:'
export const REDIS_BANNED_PREFIX = 'banned:'
export const CHAT_UNLOCK_STATUSES: BookingStatus[] = ['CONFIRMED', 'COMPLETED']
```

- [ ] **Step 5: Write packages/shared/src/index.ts**

```typescript
export * from './types'
export * from './constants'
export * from './schemas'
```

- [ ] **Step 6: Verify types compile**

```bash
cd packages/shared && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): types, constants, and Zod schemas"
```

---

## Phase 3 — Server Foundation

### Task 3: Server package scaffold

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/server.ts`
- Create: `server/src/app.ts`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "server",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@favour/shared": "workspace:*",
    "@fastify/cors": "^9.0.1",
    "@fastify/jwt": "^8.0.1",
    "@fastify/rate-limit": "^9.1.0",
    "@fastify/websocket": "^10.0.1",
    "@prisma/client": "^5.13.0",
    "@supabase/supabase-js": "^2.43.1",
    "fastify": "^4.27.0",
    "ioredis": "^5.3.2",
    "nodemailer": "^6.9.13",
    "zod": "^3.23.4"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "@types/nodemailer": "^6.4.15",
    "prisma": "^5.13.0",
    "tsx": "^4.9.3",
    "typescript": "^5.4.5",
    "vitest": "^1.5.2"
  }
}
```

- [ ] **Step 2: Create server/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "paths": {
      "@favour/shared": ["../packages/shared/src/index.ts"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create server/src/app.ts**

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'
import { prismaPlugin } from './plugins/prisma.js'
import { redisPlugin } from './plugins/redis.js'
import { authPlugin } from './plugins/auth.js'
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

  app.register(providerRoutes, { prefix: '/providers' })
  app.register(bookingRoutes, { prefix: '/bookings' })
  app.register(reviewRoutes, { prefix: '/reviews' })
  app.register(chatRoutes, { prefix: '/chat' })
  app.register(uploadRoutes, { prefix: '/uploads' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
```

- [ ] **Step 4: Create server/src/server.ts**

```typescript
import { buildApp } from './app.js'

const app = buildApp()

app.listen(
  { port: Number(process.env['PORT'] ?? 3001), host: '0.0.0.0' },
  (err) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
  }
)
```

- [ ] **Step 5: Install server deps**

```bash
cd server && pnpm install
```

---

### Task 4: Prisma schema

**Files:**
- Create: `server/prisma/schema.prisma`

- [ ] **Step 1: Create server/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ── Enums ──────────────────────────────────────────────────────────────────

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}

enum ProviderType {
  BUSINESS
  FREELANCER
}

enum BookingStatus {
  PENDING
  CONFIRMED
  DECLINED
  COMPLETED
  CANCELLED
}

// ── Models ─────────────────────────────────────────────────────────────────

model User {
  id        String    @id @default(uuid())
  phone     String    @unique
  email     String?   @unique
  role      Role      @default(CUSTOMER)
  provider  Provider?
  bookingsAsCustomer Booking[] @relation("CustomerBookings")
  reviewsWritten     Review[]  @relation("ReviewAuthor")
  messagesSent       Message[] @relation("MessageSender")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Provider {
  id          String       @id @default(uuid())
  userId      String       @unique
  user        User         @relation(fields: [userId], references: [id])
  type        ProviderType
  displayName String
  bio         String?
  city        String
  isVerified  Boolean      @default(false)
  photos      String[]
  services    Service[]
  bookings    Booking[]    @relation("ProviderBookings")
  reviewsReceived Review[] @relation("ReviewTarget")
  favourScore FavourScore?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

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
  updatedAt     DateTime      @updatedAt
}

model Review {
  id        String   @id @default(uuid())
  bookingId String   @unique
  booking   Booking  @relation(fields: [bookingId], references: [id])
  authorId  String
  author    User     @relation("ReviewAuthor", fields: [authorId], references: [id])
  targetId  String
  target    Provider @relation("ReviewTarget", fields: [targetId], references: [id])
  rating    Int
  body      String
  createdAt DateTime @default(now())
}

model Message {
  id        String   @id @default(uuid())
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id])
  senderId  String
  sender    User     @relation("MessageSender", fields: [senderId], references: [id])
  body      String
  createdAt DateTime @default(now())
}

model FavourScore {
  id             String   @id @default(uuid())
  providerId     String   @unique
  provider       Provider @relation(fields: [providerId], references: [id])
  overall        Float    @default(0)
  responseRate   Float    @default(0)
  completionRate Float    @default(0)
  reviewAverage  Float    @default(0)
  recency        Float    @default(0)
  updatedAt      DateTime @updatedAt
}
```

- [ ] **Step 2: Generate Prisma client**

```bash
cd server && pnpm prisma:generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 3: Commit**

```bash
git add server/prisma/schema.prisma server/package.json server/tsconfig.json server/src/
git commit -m "feat(server): Fastify app scaffold and Prisma schema"
```

---

### Task 5: Fastify plugins (Prisma, Redis, Auth)

**Files:**
- Create: `server/src/plugins/prisma.ts`
- Create: `server/src/plugins/redis.ts`
- Create: `server/src/plugins/auth.ts`

- [ ] **Step 1: Create server/src/plugins/prisma.ts**

```typescript
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export const prismaPlugin = fp(async (fastify) => {
  const prisma = new PrismaClient()
  await prisma.$connect()
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async () => { await prisma.$disconnect() })
})
```

- [ ] **Step 2: Add fastify-plugin to server dependencies**

```bash
cd server && pnpm add fastify-plugin
```

- [ ] **Step 3: Create server/src/plugins/redis.ts**

```typescript
import fp from 'fastify-plugin'
import Redis from 'ioredis'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export const redisPlugin = fp(async (fastify) => {
  const redis = new Redis(process.env['REDIS_URL']!, { lazyConnect: true })
  await redis.connect()
  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => { await redis.quit() })
})
```

- [ ] **Step 4: Create server/src/plugins/auth.ts**

```typescript
import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { REDIS_SESSION_PREFIX, REDIS_BANNED_PREFIX } from '@favour/shared'

interface SessionPayload {
  id: string
  role: string
  providerId: string | null
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user: SessionPayload
  }
}

export const authPlugin = fp(async (fastify) => {
  fastify.register(jwt, { secret: process.env['SUPABASE_JWT_SECRET']! })

  fastify.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await req.jwtVerify<{ sub: string; exp: number }>()
      const userId = decoded.sub

      const banned = await fastify.redis.get(`${REDIS_BANNED_PREFIX}${userId}`)
      if (banned) {
        return reply.code(403).send({ error: 'Account suspended' })
      }

      const cached = await fastify.redis.get(`${REDIS_SESSION_PREFIX}${userId}`)
      if (cached) {
        req.user = JSON.parse(cached) as SessionPayload
        return
      }

      const user = await fastify.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { provider: { select: { id: true } } },
      })

      const session: SessionPayload = {
        id: user.id,
        role: user.role,
        providerId: user.provider?.id ?? null,
      }

      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await fastify.redis.setex(
          `${REDIS_SESSION_PREFIX}${userId}`,
          ttl,
          JSON.stringify(session)
        )
      }

      req.user = session
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })
})
```

- [ ] **Step 5: Commit**

```bash
git add server/src/plugins/
git commit -m "feat(server): Prisma, Redis, and auth plugins"
```

---

## Phase 4 — Server Repositories, Services, Controllers, Routes

### Task 6: Provider layer

**Files:**
- Create: `server/src/repositories/providers.repo.ts`
- Create: `server/src/services/providers.service.ts`
- Create: `server/src/controllers/providers.controller.ts`
- Create: `server/src/routes/providers.ts`
- Create: `server/src/tests/providers.test.ts`

- [ ] **Step 1: Write failing test**

Create `server/src/tests/providers.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProvidersService } from '../services/providers.service.js'
import type { ProviderFeedQuery } from '@favour/shared'

const mockRepo = {
  findMany: vi.fn(),
  findById: vi.fn(),
}

describe('ProvidersService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns providers filtered by category', async () => {
    mockRepo.findMany.mockResolvedValue([])
    const query: ProviderFeedQuery = { category: 'aircon', type: 'all', page: 1, limit: 10 }
    const result = await ProvidersService.getFeed(query, mockRepo as any)
    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'aircon' })
    )
    expect(result).toEqual([])
  })

  it('returns a single provider by id', async () => {
    const fake = { id: 'p1', displayName: 'Kuya Marco' }
    mockRepo.findById.mockResolvedValue(fake)
    const result = await ProvidersService.getById('p1', mockRepo as any)
    expect(result).toEqual(fake)
  })

  it('throws 404 when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(ProvidersService.getById('missing', mockRepo as any))
      .rejects.toMatchObject({ statusCode: 404 })
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd server && pnpm test providers
```

Expected: FAIL — `ProvidersService` not found.

- [ ] **Step 3: Create server/src/repositories/providers.repo.ts**

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

- [ ] **Step 4: Create server/src/services/providers.service.ts**

```typescript
import type { ProviderFeedQuery } from '@favour/shared'
import type { ProvidersRepoInterface } from '../repositories/providers.repo.js'

export const ProvidersService = {
  async getFeed(query: ProviderFeedQuery, repo: ProvidersRepoInterface) {
    return repo.findMany(query)
  },

  async getById(id: string, repo: ProvidersRepoInterface) {
    const provider = await repo.findById(id)
    if (!provider) {
      const err = new Error('Provider not found') as any
      err.statusCode = 404
      throw err
    }
    return provider
  },
}
```

- [ ] **Step 5: Create server/src/controllers/providers.controller.ts**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { ProviderFeedQuerySchema } from '@favour/shared'
import { ProvidersService } from '../services/providers.service.js'
import { createProvidersRepo } from '../repositories/providers.repo.js'

export const ProvidersController = {
  async getFeed(req: FastifyRequest, reply: FastifyReply) {
    const query = ProviderFeedQuerySchema.parse(req.query)
    const repo = createProvidersRepo(req.server.prisma)
    const providers = await ProvidersService.getFeed(query, repo)
    return reply.send(providers)
  },

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const repo = createProvidersRepo(req.server.prisma)
    const provider = await ProvidersService.getById(req.params.id, repo)
    return reply.send(provider)
  },
}
```

- [ ] **Step 6: Create server/src/routes/providers.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { ProvidersController } from '../controllers/providers.controller.js'

export async function providerRoutes(fastify: FastifyInstance) {
  fastify.get('/', ProvidersController.getFeed)
  fastify.get('/:id', ProvidersController.getById)
}
```

- [ ] **Step 7: Run test — expect PASS**

```bash
cd server && pnpm test providers
```

Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add server/src/repositories/providers.repo.ts server/src/services/providers.service.ts server/src/controllers/providers.controller.ts server/src/routes/providers.ts server/src/tests/providers.test.ts
git commit -m "feat(server): provider feed and profile routes"
```

---

### Task 7: Booking layer

**Files:**
- Create: `server/src/repositories/bookings.repo.ts`
- Create: `server/src/services/bookings.service.ts`
- Create: `server/src/controllers/bookings.controller.ts`
- Create: `server/src/routes/bookings.ts`
- Create: `server/src/tests/bookings.test.ts`

- [ ] **Step 1: Write failing tests**

Create `server/src/tests/bookings.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { BookingsService } from '../services/bookings.service.js'

describe('BookingsService.generateReferenceCode', () => {
  it('generates code with FVR prefix', () => {
    const code = BookingsService.generateReferenceCode()
    expect(code).toMatch(/^FVR-[A-Z0-9]{3}-[A-Z0-9]{3}$/)
  })
})

describe('BookingsService.assertValidTransition', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(() => BookingsService.assertValidTransition('PENDING', 'CONFIRMED')).not.toThrow()
  })
  it('allows PENDING → DECLINED', () => {
    expect(() => BookingsService.assertValidTransition('PENDING', 'DECLINED')).not.toThrow()
  })
  it('allows CONFIRMED → COMPLETED', () => {
    expect(() => BookingsService.assertValidTransition('CONFIRMED', 'COMPLETED')).not.toThrow()
  })
  it('rejects DECLINED → CONFIRMED', () => {
    expect(() => BookingsService.assertValidTransition('DECLINED', 'CONFIRMED'))
      .toThrow('Invalid booking transition')
  })
  it('rejects COMPLETED → CANCELLED', () => {
    expect(() => BookingsService.assertValidTransition('COMPLETED', 'CANCELLED'))
      .toThrow('Invalid booking transition')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd server && pnpm test bookings
```

Expected: FAIL — `BookingsService` not found.

- [ ] **Step 3: Create server/src/repositories/bookings.repo.ts**

```typescript
import type { PrismaClient } from '@prisma/client'
import type { BookingStatus } from '@favour/shared'

export function createBookingsRepo(prisma: PrismaClient) {
  return {
    async create(data: {
      referenceCode: string
      customerId: string
      providerId: string
      serviceId: string
      datetime: Date
      address: string
      notes?: string
    }) {
      return prisma.booking.create({ data })
    },

    async findById(id: string) {
      return prisma.booking.findUnique({
        where: { id },
        include: { service: true, provider: true, customer: true },
      })
    },

    async updateStatus(id: string, status: BookingStatus, data?: { notes?: string }) {
      return prisma.booking.update({ where: { id }, data: { status, ...data } })
    },

    async findByCustomer(customerId: string) {
      return prisma.booking.findMany({
        where: { customerId },
        include: { service: true, provider: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findByProvider(providerId: string) {
      return prisma.booking.findMany({
        where: { providerId },
        include: { service: true, customer: true },
        orderBy: { createdAt: 'desc' },
      })
    },
  }
}
```

- [ ] **Step 4: Create server/src/services/bookings.service.ts**

```typescript
import type { BookingStatus } from '@favour/shared'
import { REFERENCE_CODE_PREFIX } from '@favour/shared'
import type { createBookingsRepo } from '../repositories/bookings.repo.js'

type BookingsRepo = ReturnType<typeof createBookingsRepo>

const VALID_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ['CONFIRMED', 'DECLINED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
}

export const BookingsService = {
  generateReferenceCode(): string {
    const rand = () => Math.random().toString(36).slice(2, 5).toUpperCase()
    return `${REFERENCE_CODE_PREFIX}-${rand()}-${rand()}`
  },

  assertValidTransition(current: BookingStatus, next: BookingStatus): void {
    const allowed = VALID_TRANSITIONS[current] ?? []
    if (!allowed.includes(next)) {
      throw Object.assign(
        new Error(`Invalid booking transition: ${current} → ${next}`),
        { statusCode: 400 }
      )
    }
  },

  async create(
    customerId: string,
    data: { providerId: string; serviceId: string; datetime: string; address: string; notes?: string },
    repo: BookingsRepo
  ) {
    return repo.create({
      referenceCode: BookingsService.generateReferenceCode(),
      customerId,
      providerId: data.providerId,
      serviceId: data.serviceId,
      datetime: new Date(data.datetime),
      address: data.address,
      notes: data.notes,
    })
  },

  async respond(
    bookingId: string,
    action: 'confirm' | 'decline',
    repo: BookingsRepo
  ) {
    const booking = await repo.findById(bookingId)
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })
    const next: BookingStatus = action === 'confirm' ? 'CONFIRMED' : 'DECLINED'
    BookingsService.assertValidTransition(booking.status as BookingStatus, next)
    return repo.updateStatus(bookingId, next)
  },

  async cancel(bookingId: string, repo: BookingsRepo) {
    const booking = await repo.findById(bookingId)
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })
    BookingsService.assertValidTransition(booking.status as BookingStatus, 'CANCELLED')
    return repo.updateStatus(bookingId, 'CANCELLED')
  },

  async complete(bookingId: string, repo: BookingsRepo) {
    const booking = await repo.findById(bookingId)
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })
    BookingsService.assertValidTransition(booking.status as BookingStatus, 'COMPLETED')
    return repo.updateStatus(bookingId, 'COMPLETED')
  },
}
```

- [ ] **Step 5: Create server/src/controllers/bookings.controller.ts**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  CreateBookingSchema,
  RespondToBookingSchema,
  CancelBookingSchema,
} from '@favour/shared'
import { BookingsService } from '../services/bookings.service.js'
import { createBookingsRepo } from '../repositories/bookings.repo.js'

export const BookingsController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = CreateBookingSchema.parse(req.body)
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.create(req.user.id, body, repo)
    return reply.code(201).send(booking)
  },

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await repo.findById(req.params.id)
    if (!booking) return reply.code(404).send({ error: 'Not found' })
    return reply.send(booking)
  },

  async respond(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const body = RespondToBookingSchema.parse(req.body)
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.respond(req.params.id, body.action, repo)
    return reply.send(booking)
  },

  async cancel(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    CancelBookingSchema.parse(req.body)
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.cancel(req.params.id, repo)
    return reply.send(booking)
  },

  async complete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const repo = createBookingsRepo(req.server.prisma)
    const booking = await BookingsService.complete(req.params.id, repo)
    return reply.send(booking)
  },
}
```

- [ ] **Step 6: Create server/src/routes/bookings.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { BookingsController } from '../controllers/bookings.controller.js'

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [fastify.authenticate] }, BookingsController.create)
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, BookingsController.getById)
  fastify.patch('/:id/respond', { preHandler: [fastify.authenticate] }, BookingsController.respond)
  fastify.patch('/:id/cancel', { preHandler: [fastify.authenticate] }, BookingsController.cancel)
  fastify.patch('/:id/complete', { preHandler: [fastify.authenticate] }, BookingsController.complete)
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
cd server && pnpm test bookings
```

Expected: PASS (7 tests).

- [ ] **Step 8: Commit**

```bash
git add server/src/repositories/bookings.repo.ts server/src/services/bookings.service.ts server/src/controllers/bookings.controller.ts server/src/routes/bookings.ts server/src/tests/bookings.test.ts
git commit -m "feat(server): booking routes with state machine"
```

---

### Task 8: Review layer + FavourScore service

**Files:**
- Create: `server/src/repositories/reviews.repo.ts`
- Create: `server/src/services/favourScore.service.ts`
- Create: `server/src/services/reviews.service.ts`
- Create: `server/src/controllers/reviews.controller.ts`
- Create: `server/src/routes/reviews.ts`
- Create: `server/src/tests/favourScore.test.ts`

- [ ] **Step 1: Write failing test**

Create `server/src/tests/favourScore.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { FavourScoreService } from '../services/favourScore.service.js'

describe('FavourScoreService.calculate', () => {
  it('calculates weighted score correctly', () => {
    const score = FavourScoreService.calculate({
      responseRate: 1.0,
      completionRate: 1.0,
      reviewAverage: 1.0,
      recency: 1.0,
    })
    expect(score).toBeCloseTo(1.0)
  })

  it('weights completionRate most heavily', () => {
    const highCompletion = FavourScoreService.calculate({
      responseRate: 0,
      completionRate: 1.0,
      reviewAverage: 0,
      recency: 0,
    })
    const highResponse = FavourScoreService.calculate({
      responseRate: 1.0,
      completionRate: 0,
      reviewAverage: 0,
      recency: 0,
    })
    expect(highCompletion).toBeGreaterThan(highResponse)
  })

  it('normalises review average from 1-5 to 0-1', () => {
    const score = FavourScoreService.calculate({
      responseRate: 0,
      completionRate: 0,
      reviewAverage: 5,
      recency: 0,
    })
    expect(score).toBeCloseTo(0.30)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd server && pnpm test favourScore
```

- [ ] **Step 3: Create server/src/services/favourScore.service.ts**

```typescript
import { FAVOUR_SCORE_WEIGHTS } from '@favour/shared'
import type { PrismaClient } from '@prisma/client'

interface ScoreInputs {
  responseRate: number     // 0–1
  completionRate: number   // 0–1
  reviewAverage: number    // 0–5 (normalised internally)
  recency: number          // 0–1
}

export const FavourScoreService = {
  calculate(inputs: ScoreInputs): number {
    const normalisedReview = inputs.reviewAverage / 5
    return (
      inputs.responseRate * FAVOUR_SCORE_WEIGHTS.responseRate +
      inputs.completionRate * FAVOUR_SCORE_WEIGHTS.completionRate +
      normalisedReview * FAVOUR_SCORE_WEIGHTS.reviewAverage +
      inputs.recency * FAVOUR_SCORE_WEIGHTS.recency
    )
  },

  async recalculate(providerId: string, prisma: PrismaClient): Promise<void> {
    const bookings = await prisma.booking.findMany({ where: { providerId } })
    const responded = bookings.filter(b => b.status !== 'PENDING').length
    const completed = bookings.filter(b => b.status === 'COMPLETED').length
    const responseRate = bookings.length > 0 ? responded / bookings.length : 0
    const completionRate = responded > 0 ? completed / responded : 0

    const reviews = await prisma.review.findMany({ where: { targetId: providerId } })
    const reviewAverage = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    const latestBooking = bookings
      .filter(b => b.status === 'COMPLETED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
    const daysSince = latestBooking
      ? (Date.now() - latestBooking.createdAt.getTime()) / 86_400_000
      : 365
    const recency = Math.max(0, 1 - daysSince / 365)

    const overall = FavourScoreService.calculate({ responseRate, completionRate, reviewAverage, recency })

    await prisma.favourScore.upsert({
      where: { providerId },
      update: { overall, responseRate, completionRate, reviewAverage, recency },
      create: { providerId, overall, responseRate, completionRate, reviewAverage, recency },
    })
  },
}
```

- [ ] **Step 4: Create server/src/repositories/reviews.repo.ts**

```typescript
import type { PrismaClient } from '@prisma/client'

export function createReviewsRepo(prisma: PrismaClient) {
  return {
    async create(data: {
      bookingId: string
      authorId: string
      targetId: string
      rating: number
      body: string
    }) {
      return prisma.review.create({ data })
    },

    async findByBooking(bookingId: string) {
      return prisma.review.findUnique({ where: { bookingId } })
    },

    async bookingIsCompleted(bookingId: string) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
      return booking?.status === 'COMPLETED'
    },
  }
}
```

- [ ] **Step 5: Create server/src/services/reviews.service.ts**

```typescript
import type { PrismaClient } from '@prisma/client'
import type { createReviewsRepo } from '../repositories/reviews.repo.js'
import { FavourScoreService } from './favourScore.service.js'

type ReviewsRepo = ReturnType<typeof createReviewsRepo>

export const ReviewsService = {
  async create(
    authorId: string,
    data: { bookingId: string; rating: number; body: string },
    repo: ReviewsRepo,
    prisma: PrismaClient
  ) {
    const isCompleted = await repo.bookingIsCompleted(data.bookingId)
    if (!isCompleted) {
      throw Object.assign(
        new Error('Reviews can only be submitted for completed bookings'),
        { statusCode: 400 }
      )
    }

    const existing = await repo.findByBooking(data.bookingId)
    if (existing) {
      throw Object.assign(new Error('Review already submitted'), { statusCode: 409 })
    }

    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: data.bookingId },
    })

    const review = await repo.create({
      bookingId: data.bookingId,
      authorId,
      targetId: booking.providerId,
      rating: data.rating,
      body: data.body,
    })

    await FavourScoreService.recalculate(booking.providerId, prisma)

    return review
  },
}
```

- [ ] **Step 6: Create server/src/controllers/reviews.controller.ts**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { CreateReviewSchema } from '@favour/shared'
import { ReviewsService } from '../services/reviews.service.js'
import { createReviewsRepo } from '../repositories/reviews.repo.js'

export const ReviewsController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = CreateReviewSchema.parse(req.body)
    const repo = createReviewsRepo(req.server.prisma)
    const review = await ReviewsService.create(req.user.id, body, repo, req.server.prisma)
    return reply.code(201).send(review)
  },
}
```

- [ ] **Step 7: Create server/src/routes/reviews.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { ReviewsController } from '../controllers/reviews.controller.js'

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [fastify.authenticate] }, ReviewsController.create)
}
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
cd server && pnpm test favourScore
```

Expected: PASS (3 tests).

- [ ] **Step 9: Commit**

```bash
git add server/src/repositories/reviews.repo.ts server/src/services/ server/src/controllers/reviews.controller.ts server/src/routes/reviews.ts server/src/tests/favourScore.test.ts
git commit -m "feat(server): review routes and FavourScore calculation"
```

---

### Task 9: Chat (WebSocket) + Upload routes

**Files:**
- Create: `server/src/routes/chat.ts`
- Create: `server/src/services/uploads.service.ts`
- Create: `server/src/controllers/uploads.controller.ts`
- Create: `server/src/routes/uploads.ts`

- [ ] **Step 1: Create server/src/routes/chat.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { CreateChatMessageSchema, CHAT_UNLOCK_STATUSES } from '@favour/shared'

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.get('/:bookingId', { websocket: true }, async (socket, req: any) => {
    const { bookingId } = req.params as { bookingId: string }

    const booking = await fastify.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || !CHAT_UNLOCK_STATUSES.includes(booking.status as any)) {
      socket.close(4003, 'Chat not available for this booking')
      return
    }

    const history = await fastify.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })
    socket.send(JSON.stringify({ type: 'history', messages: history }))

    socket.on('message', async (raw: Buffer) => {
      try {
        const parsed = CreateChatMessageSchema.parse(JSON.parse(raw.toString()))
        const message = await fastify.prisma.message.create({
          data: { bookingId, senderId: req.user?.id ?? 'unknown', body: parsed.body },
        })
        socket.send(JSON.stringify({ type: 'message', message }))
      } catch {
        socket.send(JSON.stringify({ type: 'error', error: 'Invalid message' }))
      }
    })
  })
}
```

- [ ] **Step 2: Create server/src/services/uploads.service.ts**

```typescript
import { createClient } from '@supabase/supabase-js'
import {
  UPLOAD_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from '@favour/shared'

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

export const UploadsService = {
  async signUploadUrl(params: {
    fileName: string
    fileType: string
    fileSize: number
    userId: string
  }): Promise<{ signedUrl: string; path: string }> {
    if (!ALLOWED_IMAGE_TYPES.includes(params.fileType as any)) {
      throw Object.assign(new Error('Invalid file type'), { statusCode: 400 })
    }
    if (params.fileSize > UPLOAD_MAX_SIZE_BYTES) {
      throw Object.assign(new Error('File too large (max 5MB)'), { statusCode: 400 })
    }

    const ext = params.fileName.split('.').pop() ?? 'jpg'
    const path = `providers/${params.userId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('provider-photos')
      .createSignedUploadUrl(path)

    if (error || !data) {
      throw Object.assign(new Error('Could not generate upload URL'), { statusCode: 500 })
    }

    return { signedUrl: data.signedUrl, path }
  },
}
```

- [ ] **Step 3: Create server/src/controllers/uploads.controller.ts**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UploadsService } from '../services/uploads.service.js'

const SignUploadBody = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
})

export const UploadsController = {
  async sign(req: FastifyRequest, reply: FastifyReply) {
    const body = SignUploadBody.parse(req.body)
    const result = await UploadsService.signUploadUrl({ ...body, userId: req.user.id })
    return reply.send(result)
  },
}
```

- [ ] **Step 4: Create server/src/routes/uploads.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { UploadsController } from '../controllers/uploads.controller.js'

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/sign', { preHandler: [fastify.authenticate] }, UploadsController.sign)
}
```

- [ ] **Step 5: Typecheck server**

```bash
cd server && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/chat.ts server/src/services/uploads.service.ts server/src/controllers/uploads.controller.ts server/src/routes/uploads.ts
git commit -m "feat(server): WebSocket chat and signed upload URL route"
```

---

## Phase 5 — Deployment Files

### Task 10: Dockerfile and fly.toml

**Files:**
- Create: `server/Dockerfile`
- Create: `fly.toml`

- [ ] **Step 1: Create server/Dockerfile**

```dockerfile
# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/
COPY tsconfig.base.json ./

# Install all deps (needed for prisma generate in build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ ./packages/shared/
COPY server/ ./server/

# Generate Prisma client and build
RUN cd server && pnpm prisma:generate && pnpm build

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
RUN addgroup -S favour && adduser -S favour -G favour

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=builder /app/packages/shared/src ./packages/shared/src

USER favour
ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/dist/server.js"]
```

- [ ] **Step 2: Create fly.toml (at repo root)**

```toml
app = "favour-server"
primary_region = "sin"

[build]
  dockerfile = "server/Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3001"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  [[http_service.checks]]
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/health"

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

- [ ] **Step 3: Commit**

```bash
git add server/Dockerfile fly.toml
git commit -m "chore(server): Dockerfile (Node 20 Alpine) and fly.toml (sin region)"
```

---

## Phase 6 — Client

> **Design system rules (from `.impeccable.md`):**
> - Fonts via `next/font/google` — never `@import` in CSS
> - All tokens in `tailwind.config.ts` — never inline `style={}` hex values in components
> - OKLCH for new palette additions; existing hex tokens are locked from the spec
> - Touch targets ≥ 44×44px; WCAG 2.1 AA contrast throughout
> - `prefers-reduced-motion` guard on all transitions
> - No inline `style={}` in components — Tailwind classes only, with `cn()` helper for conditionals
> - Integration tests: each page/route gets a Playwright or Fastify inject test, not unit tests

### Task 11: Next.js scaffold with Tailwind design tokens

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/next.config.ts`
- Create: `client/tailwind.config.ts`
- Create: `client/postcss.config.js`
- Create: `client/src/styles/globals.css`
- Create: `client/src/lib/cn.ts`
- Create: `client/src/app/layout.tsx`

- [ ] **Step 1: Initialise Next.js app**

```bash
cd client && pnpm create next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
```

When prompted to use the existing directory, confirm yes.

- [ ] **Step 2: Update client/package.json dependencies**

Add to `dependencies` in `client/package.json`:
```json
{
  "@favour/shared": "workspace:*",
  "@supabase/ssr": "^0.3.0",
  "@supabase/supabase-js": "^2.43.1",
  "@tanstack/react-query": "^5.35.1",
  "zustand": "^4.5.2",
  "browser-image-compression": "^2.0.2",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.3.0",
  "lucide-react": "^0.378.0"
}
```

Then: `cd client && pnpm install`

- [ ] **Step 3: Update client/tsconfig.json paths**

Add `@favour/shared` path alias inside `compilerOptions.paths`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@favour/shared": ["../packages/shared/src/index.ts"]
    }
  }
}
```

- [ ] **Step 4: Create client/src/lib/cn.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Update client/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'favour-blue':       '#0047CC',
        'favour-blue-light': '#EEF3FF',
        'favour-blue-mid':   '#D0DEFF',
        'favour-dark':       '#111827',
        'ink-700':           '#4B5563',
        'ink-400':           '#9CA3AF',
        'surface':           '#F3F4F6',
        'border-ui':         '#E5E7EB',
        'verify-green':      '#007A33',
        'green-light':       '#ECFDF0',
        'danger':            '#D92121',
        'amber':             '#B36B00',
        'amber-light':       '#FFF8E7',
      },
      fontFamily: {
        sans:  ['var(--font-manrope)', 'sans-serif'],
        body:  ['var(--font-figtree)', 'sans-serif'],
        mono:  ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        card:   '12px',
        input:  '8px',
        btn:    '10px',
        pill:   '6px',
      },
      borderWidth: {
        DEFAULT: '1.5px',
        ui:      '1.5px',
      },
      height: {
        btn: '52px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 6: Update client/src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fonts injected via next/font — no @import needed here */

@layer base {
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { display: none; }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer utilities {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}
```

- [ ] **Step 7: Create client/src/app/layout.tsx**

Use `next/font/google` — never `@import` in CSS. This avoids render-blocking font requests.

```tsx
import type { Metadata } from 'next'
import { Manrope, Figtree } from 'next/font/google'
import localFont from 'next/font/local'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-figtree',
  display: 'swap',
})

// JetBrains Mono not on next/font — use Google Fonts variable
// Use next/font/google when available, fallback to CSS variable
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Favour.ph — Book trusted home pros near you',
  description: 'Find verified home service providers in Batangas City. Aircon, plumbing, electrical, cleaning and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${figtree.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add client/
git commit -m "feat(client): Next.js 14 scaffold with Favour design tokens and next/font"
```

---

### Task 12: Supabase client, API wrapper, TanStack Query, Zustand

**Files:**
- Create: `client/src/lib/supabase.ts`
- Create: `client/src/lib/api.ts`
- Create: `client/src/lib/query-client.ts`
- Create: `client/src/stores/auth.ts`
- Create: `client/src/components/Providers.tsx`

- [ ] **Step 1: Create client/src/lib/supabase.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create client/src/lib/api.ts**

```typescript
import type { Booking, Provider, Review } from '@favour/shared'

const BASE = process.env.NEXT_PUBLIC_API_URL!

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
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
      request<Provider[]>(`/providers?${new URLSearchParams(params)}`),
    getById: (id: string) => request<Provider>(`/providers/${id}`),
  },
  bookings: {
    create: (body: unknown, token: string) =>
      request<Booking>('/bookings', {
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    getById: (id: string, token: string) =>
      request<Booking>(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    respond: (id: string, body: unknown, token: string) =>
      request<Booking>(`/bookings/${id}/respond`, {
        method: 'PATCH', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    cancel: (id: string, body: unknown, token: string) =>
      request<Booking>(`/bookings/${id}/cancel`, {
        method: 'PATCH', body: JSON.stringify(body),
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
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  uploads: {
    sign: (body: unknown, token: string) =>
      request<{ signedUrl: string; path: string }>('/uploads/sign', {
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
}
```

- [ ] **Step 3: Create client/src/lib/query-client.ts**

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})
```

- [ ] **Step 4: Create client/src/stores/auth.ts**

```typescript
import { create } from 'zustand'
import type { Role } from '@favour/shared'

interface AuthState {
  userId: string | null
  role: Role | null
  providerId: string | null
  accessToken: string | null
  setSession: (params: { userId: string; role: Role; providerId: string | null; accessToken: string }) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  providerId: null,
  accessToken: null,
  setSession: (params) => set(params),
  clear: () => set({ userId: null, role: null, providerId: null, accessToken: null }),
}))
```

- [ ] **Step 5: Create client/src/components/Providers.tsx**

```tsx
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

- [ ] **Step 6: Typecheck client**

```bash
cd client && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/lib/ client/src/stores/ client/src/components/Providers.tsx
git commit -m "feat(client): Supabase client, API wrapper, TanStack Query, Zustand auth store"
```

---

### Task 13: Base UI components — Tailwind-first, no inline style hex values

**Design rules enforced here:**
- All colours via Tailwind tokens (`bg-favour-blue`, `text-ink-700`), not inline hex
- `cn()` helper for conditional class merging
- All interactive elements have `min-h-touch min-w-touch` (44px WCAG touch targets)
- `aria-label` on icon-only buttons
- Transitions guarded by `motion-safe:` Tailwind variant

**Files:**
- Create: `client/src/components/ui/Pill.tsx`
- Create: `client/src/components/ui/StatBox.tsx`
- Create: `client/src/components/ui/ServiceRow.tsx`
- Create: `client/src/components/ui/FavourScoreBanner.tsx`
- Create: `client/src/components/ui/Button.tsx`
- Create: `client/src/components/ui/BookingStatusBadge.tsx`
- Create: `client/src/components/ui/FieldLabel.tsx`
- Create: `client/src/components/ui/Input.tsx`

- [ ] **Step 1: Create client/src/components/ui/Pill.tsx**

```tsx
import { cn } from '@/lib/cn'

type PillColor = 'blue' | 'green' | 'amber' | 'dark'

const colorClasses: Record<PillColor, string> = {
  blue:  'bg-favour-blue-light text-favour-blue border-favour-blue-mid',
  green: 'bg-green-light text-verify-green border-[#A7F3C0]',
  amber: 'bg-amber-light text-amber border-[#FCD34D]',
  dark:  'bg-surface text-favour-dark border-border-ui',
}

export function Pill({
  children,
  color = 'blue',
  className,
}: {
  children: React.ReactNode
  color?: PillColor
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-mono inline-flex items-center h-[26px] px-[10px]',
        'rounded-pill text-[11px] font-bold tracking-[0.04em]',
        'border border-ui',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Create client/src/components/ui/StatBox.tsx**

```tsx
import { cn } from '@/lib/cn'

export function StatBox({
  label,
  value,
  sub,
  accentClass,
}: {
  label: string
  value: string | number
  sub?: string
  accentClass?: string
}) {
  return (
    <div className="flex-1 bg-white border border-ui rounded-[10px] p-3 text-center">
      <div className={cn('font-mono text-[20px] font-extrabold tracking-tight', accentClass ?? 'text-favour-dark')}>
        {value}
      </div>
      <div className="font-sans text-[11px] font-bold text-ink-700 mt-0.5">
        {label}
      </div>
      {sub && (
        <div className="font-body text-[10px] text-ink-400 mt-px">{sub}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create client/src/components/ui/Button.tsx**

```tsx
import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'h-btn rounded-btn font-sans text-[17px] font-extrabold cursor-pointer',
        'touch-target motion-safe:transition-opacity duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-favour-blue text-white border-0',
        variant === 'ghost' && 'bg-transparent text-favour-blue border border-ui border-favour-blue',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Create client/src/components/ui/FavourScoreBanner.tsx**

```tsx
import { Award, Star } from 'lucide-react'

export function FavourScoreBanner({ score }: { score: number }) {
  return (
    <div
      className="bg-favour-dark rounded-card p-4 flex items-center justify-between"
      role="region"
      aria-label={`Favour Score: ${score.toFixed(2)}`}
    >
      <div>
        <div className="font-mono text-[42px] font-extrabold text-white leading-none">
          {score.toFixed(2)}
        </div>
        <div className="flex gap-0.5 mt-1.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className="text-white fill-white" />
          ))}
        </div>
      </div>
      <div className="text-right">
        <Award size={28} className="text-favour-blue ml-auto" aria-hidden="true" />
        <div className="font-mono text-[10px] font-bold text-ink-400 mt-1 tracking-[0.08em]">
          FAVOUR SCORE
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create client/src/components/ui/ServiceRow.tsx**

```tsx
import { cn } from '@/lib/cn'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'

export function ServiceRow({
  icon: Icon,
  name,
  price,
  selected,
  onSelect,
}: {
  icon: LucideIcon
  name: string
  price: string
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-[14px] touch-target',
        'border border-ui rounded-[10px] text-left',
        'motion-safe:transition-colors duration-150',
        selected
          ? 'border-favour-blue bg-favour-blue-light'
          : 'border-border-ui bg-white'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-input shrink-0 flex items-center justify-center',
          'border border-ui',
          selected ? 'bg-favour-blue border-favour-blue' : 'bg-surface border-border-ui'
        )}
        aria-hidden="true"
      >
        <Icon size={18} className={selected ? 'text-white' : 'text-ink-700'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-sans text-[15px] font-semibold text-favour-dark">{name}</div>
        <div className="font-mono text-[12px] font-bold text-ink-700 mt-0.5">{price}</div>
      </div>
      {selected && <CheckCircle2 size={20} className="text-favour-blue shrink-0" />}
    </button>
  )
}
```

- [ ] **Step 6: Create client/src/components/ui/BookingStatusBadge.tsx**

```tsx
import type { BookingStatus } from '@favour/shared'
import { Pill } from './Pill'

const statusConfig: Record<BookingStatus, { label: string; color: 'blue' | 'green' | 'amber' | 'dark' }> = {
  PENDING:   { label: 'PENDING',   color: 'amber' },
  CONFIRMED: { label: 'CONFIRMED', color: 'blue'  },
  DECLINED:  { label: 'DECLINED',  color: 'dark'  },
  COMPLETED: { label: 'COMPLETED', color: 'green' },
  CANCELLED: { label: 'CANCELLED', color: 'dark'  },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, color } = statusConfig[status]
  return <Pill color={color}>{label}</Pill>
}
```

- [ ] **Step 7: Create client/src/components/ui/FieldLabel.tsx**

```tsx
import { cn } from '@/lib/cn'

export function FieldLabel({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] block mb-1.5', className)}
    >
      {children}
    </label>
  )
}
```

- [ ] **Step 8: Create client/src/components/ui/Input.tsx**

```tsx
import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-[14px] font-body text-[15px] text-favour-dark',
        'bg-white border border-ui border-border-ui rounded-input',
        'placeholder:text-ink-400 outline-none touch-target',
        'focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid',
        'motion-safe:transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 9: Typecheck**

```bash
cd client && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add client/src/components/ui/ client/src/lib/cn.ts
git commit -m "feat(client): Tailwind-first UI components with WCAG AA touch targets"
```

---

### Task 14: Auth pages

**Design rules enforced here:**
- Dark full-screen background on login (intentional, not default)
- Font loaded via CSS variable from `next/font` — no inline `fontFamily`
- All inputs use `<Input>` and `<FieldLabel>` components
- Error messages use `role="alert"` for screen readers
- No inline `style={}` except where Tailwind cannot express the value

**Files:**
- Create: `client/src/app/(auth)/login/page.tsx`
- Create: `client/src/app/(auth)/verify/page.tsx`

- [ ] **Step 1: Create client/src/app/(auth)/login/page.tsx**

```tsx
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
            <span
              className="font-mono px-3.5 bg-surface flex items-center text-[14px] font-bold text-ink-700 border-r border-border-ui shrink-0"
              aria-hidden="true"
            >
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
          <p role="alert" className="font-body text-[13px] text-danger mb-3">
            {error}
          </p>
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
```

- [ ] **Step 2: Create client/src/app/(auth)/verify/page.tsx**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
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
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    setLoading(false)
    if (error || !data.session) { setError(error?.message ?? 'Verification failed'); return }

    const { data: { user } } = await supabase.auth.getUser()
    setSession({
      userId: user!.id,
      role: (user!.user_metadata?.['role'] as Role) ?? 'CUSTOMER',
      providerId: user!.user_metadata?.['providerId'] ?? null,
      accessToken: data.session.access_token,
    })
    sessionStorage.removeItem('favour_phone')
    window.location.href = '/feed'
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
          <p role="alert" className="font-body text-[13px] text-danger mb-3">
            {error}
          </p>
        )}

        <Button fullWidth disabled={otp.length < 6 || loading} onClick={handleVerify}>
          {loading ? 'Verifying…' : 'Confirm Code'}
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/app/\(auth\)/
git commit -m "feat(client): login and OTP verify pages — Tailwind-first, WCAG AA"
```

---

### Task 15: Customer pages — feed, provider profile, booking

**Design rules enforced here:**
- No inline hex `style={}` — Tailwind only
- Empty state on feed teaches the interface ("No providers found for this category yet. Try All.")
- Loading skeleton on feed (Suspense boundary) instead of blank flash
- Provider profile sticky CTA is in a `<footer>` for semantics
- All `<Link>` wrappers have accessible text

**Files:**
- Create: `client/src/app/(customer)/feed/page.tsx`
- Create: `client/src/app/(customer)/feed/loading.tsx`
- Create: `client/src/app/(customer)/providers/[id]/page.tsx`
- Create: `client/src/app/(customer)/book/[providerId]/page.tsx`
- Create: `client/src/app/(customer)/bookings/[id]/page.tsx`
- Create: `client/src/components/providers/ProviderCard.tsx`
- Create: `client/src/components/providers/ProviderCardSkeleton.tsx`
- Create: `client/src/components/bookings/BookingConfirmed.tsx`

- [ ] **Step 1: Create client/src/components/providers/ProviderCard.tsx**

```tsx
import Link from 'next/link'
import type { ProviderSummary } from '@favour/shared'
import { Pill } from '@/components/ui/Pill'
import { Star, MapPin } from 'lucide-react'

export function ProviderCard({ provider }: { provider: ProviderSummary }) {
  return (
    <Link
      href={`/providers/${provider.id}`}
      className="block bg-white border border-ui border-border-ui rounded-card p-4 flex gap-3.5 no-underline motion-safe:transition-colors duration-150 hover:border-favour-blue-mid active:bg-surface"
      aria-label={`View ${provider.displayName}'s profile`}
    >
      <div
        className="w-14 h-14 rounded-[10px] bg-surface shrink-0 bg-cover bg-center"
        style={provider.photo ? { backgroundImage: `url(${provider.photo})` } : undefined}
        role="img"
        aria-label={provider.photo ? `${provider.displayName} photo` : 'No photo'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[16px] font-extrabold text-favour-dark truncate">
            {provider.displayName}
          </span>
          {provider.isVerified && (
            <Pill color="green" className="shrink-0">✓ VERIFIED</Pill>
          )}
        </div>
        <div className="font-body text-[13px] text-ink-700 mb-2 truncate">
          {provider.topService?.name ?? 'General services'}
        </div>
        <div className="flex items-center gap-2.5">
          {provider.favourScore !== null && (
            <div className="flex items-center gap-1" aria-label={`Favour Score ${provider.favourScore.toFixed(2)}`}>
              <Star size={13} className="text-favour-blue fill-favour-blue" aria-hidden="true" />
              <span className="font-mono text-[12px] font-bold text-favour-blue">
                {provider.favourScore.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-ink-400" aria-hidden="true" />
            <span className="font-mono text-[11px] text-ink-400">{provider.city}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create client/src/components/providers/ProviderCardSkeleton.tsx**

```tsx
export function ProviderCardSkeleton() {
  return (
    <div className="bg-white border border-ui border-border-ui rounded-card p-4 flex gap-3.5 animate-pulse" aria-hidden="true">
      <div className="w-14 h-14 rounded-[10px] bg-surface shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface rounded w-2/3" />
        <div className="h-3 bg-surface rounded w-1/2" />
        <div className="h-3 bg-surface rounded w-1/3" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create client/src/app/(customer)/feed/loading.tsx**

```tsx
import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'

export default function FeedLoading() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="bg-favour-dark px-5 py-5 space-y-3.5">
        <div className="h-3 bg-[#1F2937] rounded w-32 animate-pulse" />
        <div className="h-10 bg-[#1F2937] rounded-input animate-pulse" />
      </div>
      <div className="px-4 pt-4 space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProviderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create client/src/app/(customer)/feed/page.tsx**

```tsx
import { api } from '@/lib/api'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORIES } from '@favour/shared'
import { MapPin, Search } from 'lucide-react'
import Link from 'next/link'

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { category?: string; type?: string }
}) {
  const providers = await api.providers.feed({
    ...(searchParams.category ? { category: searchParams.category } : {}),
    ...(searchParams.type ? { type: searchParams.type } : {}),
  })

  return (
    <main className="min-h-dvh bg-surface">
      {/* Dark header */}
      <header className="bg-favour-dark px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3.5">
          <MapPin size={14} className="text-ink-400" aria-hidden="true" />
          <span className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.06em]">
            BATANGAS CITY
          </span>
        </div>
        <div
          className="flex items-center gap-2.5 bg-[#1F2937] border border-[#374151] rounded-input px-3.5 py-2.5"
          role="search"
        >
          <Search size={16} className="text-ink-400" aria-hidden="true" />
          <span className="font-body text-[14px] text-ink-400">Search services…</span>
        </div>
      </header>

      {/* Category filter row */}
      <nav className="flex gap-2 px-4 py-3 overflow-x-auto" aria-label="Service categories">
        <Link
          href="/feed"
          className={`font-mono text-[11px] font-bold px-3 py-1.5 rounded-pill border border-ui whitespace-nowrap touch-target flex items-center ${!searchParams.category ? 'bg-favour-blue text-white border-favour-blue' : 'bg-white text-ink-700 border-border-ui'}`}
        >
          ALL
        </Link>
        {SERVICE_CATEGORIES.map(cat => (
          <Link
            key={cat}
            href={`/feed?category=${cat}`}
            className={`font-mono text-[11px] font-bold px-3 py-1.5 rounded-pill border border-ui whitespace-nowrap touch-target flex items-center ${searchParams.category === cat ? 'bg-favour-blue text-white border-favour-blue' : 'bg-white text-ink-700 border-border-ui'}`}
          >
            {SERVICE_CATEGORY_LABELS[cat].toUpperCase()}
          </Link>
        ))}
      </nav>

      {/* Provider list */}
      <div className="px-4 pb-8">
        <p className="font-sans text-[13px] font-bold text-ink-700 mb-3">
          {providers.length} {providers.length === 1 ? 'provider' : 'providers'} available
        </p>

        {providers.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-sans text-[16px] font-bold text-favour-dark mb-2">No providers found</p>
            <p className="font-body text-[14px] text-ink-700 mb-4">
              {searchParams.category
                ? `No ${SERVICE_CATEGORY_LABELS[searchParams.category as keyof typeof SERVICE_CATEGORY_LABELS] ?? searchParams.category} providers yet.`
                : 'Check back soon — we're onboarding providers now.'}
            </p>
            {searchParams.category && (
              <Link href="/feed" className="font-body text-[14px] text-favour-blue font-semibold">
                View all providers →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {providers.map((p: any) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Create client/src/app/(customer)/providers/[id]/page.tsx**

```tsx
import { api } from '@/lib/api'
import { notFound } from 'next/navigation'
import { FavourScoreBanner } from '@/components/ui/FavourScoreBanner'
import { StatBox } from '@/components/ui/StatBox'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProviderProfilePage({ params }: { params: { id: string } }) {
  let provider: any
  try {
    provider = await api.providers.getById(params.id)
  } catch {
    notFound()
  }

  const score = provider.favourScore?.overall ?? 0

  return (
    <main className="min-h-dvh bg-surface pb-24">
      {/* Back nav */}
      <nav className="px-5 pt-5 pb-3">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-ink-700 touch-target"
          aria-label="Back to feed"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </Link>
      </nav>

      <div className="px-5">
        {/* Hero */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-[72px] h-[72px] rounded-[12px] bg-surface shrink-0 bg-cover bg-center"
            style={provider.photos?.[0] ? { backgroundImage: `url(${provider.photos[0]})` } : undefined}
            role="img"
            aria-label={provider.photos?.[0] ? `${provider.displayName} photo` : 'No photo'}
          />
          <div className="min-w-0">
            <h1 className="font-sans text-[20px] font-extrabold text-favour-dark truncate">
              {provider.displayName}
            </h1>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <Pill color="dark">{provider.type}</Pill>
              {provider.isVerified && <Pill color="green">✓ FAVOUR VERIFIED</Pill>}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <FavourScoreBanner score={score} />
        </div>

        <div className="flex gap-2 mb-5">
          <StatBox label="BOOKINGS" value={provider._count?.bookings ?? 0} />
          <StatBox label="REVIEWS" value={provider.reviewsReceived?.length ?? 0} />
          <StatBox label="CITY" value={provider.city} />
        </div>

        {provider.bio && (
          <p className="font-body text-[14px] text-ink-700 leading-relaxed mb-5 max-w-prose">
            {provider.bio}
          </p>
        )}
      </div>

      {/* Sticky CTA */}
      <footer className="fixed bottom-0 inset-x-0 px-5 py-4 bg-white border-t border-ui border-border-ui">
        <Link href={`/book/${provider.id}`} aria-label={`Book ${provider.displayName}`}>
          <Button fullWidth>Book Now</Button>
        </Link>
      </footer>
    </main>
  )
}
```

- [ ] **Step 6: Create client/src/components/bookings/BookingConfirmed.tsx**

```tsx
import type { Booking } from '@favour/shared'
import { CheckCircle2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function BookingConfirmed({ booking }: { booking: Booking }) {
  return (
    <main className="min-h-dvh bg-surface">
      {/* Success header */}
      <header className="bg-verify-green px-5 py-10 text-center">
        <CheckCircle2 size={48} className="text-white mx-auto mb-3" aria-hidden="true" />
        <h1 className="font-sans text-[24px] font-extrabold text-white mb-1.5">
          Booking Confirmed!
        </h1>
        <p
          className="font-mono text-[16px] font-bold text-[#A7F3C0] tracking-[0.08em]"
          aria-label={`Reference code ${booking.referenceCode}`}
        >
          {booking.referenceCode}
        </p>
      </header>

      <div className="px-5 py-5 space-y-4">
        {/* Details card */}
        <section className="bg-white border border-ui border-border-ui rounded-card p-4" aria-label="Booking details">
          <p className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-3">BOOKING DETAILS</p>
          <dl className="space-y-1.5">
            <div className="flex gap-2">
              <dt className="font-body text-[14px] font-semibold text-favour-dark shrink-0">Date &amp; Time</dt>
              <dd className="font-body text-[14px] text-ink-700">{new Date(booking.datetime).toLocaleString('en-PH')}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-body text-[14px] font-semibold text-favour-dark shrink-0">Address</dt>
              <dd className="font-body text-[14px] text-ink-700">{booking.address}</dd>
            </div>
          </dl>
        </section>

        {/* Chat unlock banner — dashed border is intentional per design spec */}
        <div
          className="flex items-center gap-3 px-4 py-4 bg-favour-blue-light rounded-card"
          style={{ border: '1.5px dashed #0047CC' }}
          role="status"
        >
          <MessageSquare size={20} className="text-favour-blue shrink-0" aria-hidden="true" />
          <p className="font-body text-[13px] font-semibold text-favour-blue">
            Chat is now unlocked — message your provider directly.
          </p>
        </div>

        <Link href={`/chat/${booking.id}`} aria-label="Open chat with provider">
          <Button fullWidth>Open Chat</Button>
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 7: Create client/src/app/(customer)/bookings/[id]/page.tsx**

```tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'
import { BookingConfirmed } from '@/components/bookings/BookingConfirmed'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'
import type { BookingStatus } from '@favour/shared'

async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const token = await getAccessToken()
  if (!token) redirect('/login')

  const booking = await api.bookings.getById(params.id, token)

  if (booking.status === 'CONFIRMED') {
    return <BookingConfirmed booking={booking} />
  }

  return (
    <main className="min-h-dvh bg-surface px-5 py-6">
      <h1 className="font-sans text-[20px] font-extrabold text-favour-dark mb-4">
        Booking{' '}
        <span className="font-mono text-[16px]">{booking.referenceCode}</span>
      </h1>
      <BookingStatusBadge status={booking.status as BookingStatus} />
    </main>
  )
}
```

- [ ] **Step 8: Create client/src/app/(customer)/book/[providerId]/page.tsx**

```tsx
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Input } from '@/components/ui/Input'

export default function BookingFormPage() {
  const { providerId } = useParams<{ providerId: string }>()
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const [datetime, setDatetime] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!accessToken) { router.push('/login'); return }
    setLoading(true)
    setError(null)
    try {
      const booking = await api.bookings.create(
        { providerId, datetime: new Date(datetime).toISOString(), address, notes: notes || undefined },
        accessToken
      )
      router.push(`/bookings/${(booking as any).id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-surface px-5 py-6">
      <h1 className="font-sans text-[22px] font-extrabold text-favour-dark mb-6">Book a service</h1>

      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="datetime">PREFERRED DATE &amp; TIME</FieldLabel>
          <Input
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="address">SERVICE ADDRESS</FieldLabel>
          <Input
            id="address"
            type="text"
            placeholder="Street, Barangay, Batangas City"
            value={address}
            onChange={e => setAddress(e.target.value)}
            autoComplete="street-address"
          />
        </div>

        <div>
          <FieldLabel htmlFor="notes">NOTES (OPTIONAL)</FieldLabel>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe the issue or any special instructions…"
            rows={4}
            className="w-full px-4 py-[14px] font-body text-[15px] text-favour-dark bg-white border border-ui border-border-ui rounded-input placeholder:text-ink-400 outline-none focus:border-favour-blue focus:ring-1 focus:ring-favour-blue-mid motion-safe:transition-colors duration-150 resize-none"
          />
        </div>

        {error && (
          <p role="alert" className="font-body text-[13px] text-danger">{error}</p>
        )}

        <Button
          fullWidth
          disabled={!datetime || !address || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Submitting…' : 'Request Booking'}
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 9: Typecheck**

```bash
cd client && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add client/src/app/\(customer\)/ client/src/components/providers/ client/src/components/bookings/
git commit -m "feat(client): customer pages — Tailwind-first, empty states, loading skeletons, WCAG AA"
```

---

### Task 16: Provider dashboard

**Design rules enforced here:**
- Empty state teaches the interface — gives the provider an actionable next step
- Booking cards use semantic `<article>` elements
- No hardcoded empty array — adds a `GET /bookings?role=provider` note so James knows the route is needed

**Files:**
- Create: `client/src/app/(provider)/dashboard/page.tsx`

- [ ] **Step 1: Create client/src/app/(provider)/dashboard/page.tsx**

```tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { BookingStatusBadge } from '@/components/ui/BookingStatusBadge'
import type { BookingStatus } from '@favour/shared'

async function getProviderBookings(token: string): Promise<any[]> {
  // Requires server route: GET /bookings?scope=provider
  // Provider identity resolved from JWT on the server side
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings?scope=provider`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export default async function ProviderDashboard() {
  const token = await getAccessToken()
  if (!token) redirect('/login')

  const bookings = await getProviderBookings(token)
  const pending = bookings.filter((b: any) => b.status === 'PENDING')
  const active  = bookings.filter((b: any) => b.status === 'CONFIRMED')
  const past    = bookings.filter((b: any) => ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(b.status))

  return (
    <main className="min-h-dvh bg-surface px-5 py-6">
      <h1 className="font-sans text-[22px] font-extrabold text-favour-dark mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-sans text-[16px] font-bold text-favour-dark mb-2">No bookings yet</p>
          <p className="font-body text-[14px] text-ink-700 max-w-xs mx-auto">
            Share your profile link with customers to start receiving booking requests.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section aria-label="Pending requests">
              <h2 className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-3">
                PENDING — {pending.length}
              </h2>
              <div className="space-y-2.5">
                {pending.map((b: any) => <BookingCard key={b.id} booking={b} />)}
              </div>
            </section>
          )}

          {active.length > 0 && (
            <section aria-label="Confirmed bookings">
              <h2 className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-3">
                CONFIRMED — {active.length}
              </h2>
              <div className="space-y-2.5">
                {active.map((b: any) => <BookingCard key={b.id} booking={b} />)}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section aria-label="Past bookings">
              <h2 className="font-mono text-[11px] font-bold text-ink-400 tracking-[0.08em] mb-3">
                PAST — {past.length}
              </h2>
              <div className="space-y-2.5">
                {past.map((b: any) => <BookingCard key={b.id} booking={b} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}

function BookingCard({ booking }: { booking: any }) {
  return (
    <article className="bg-white border border-ui border-border-ui rounded-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[13px] font-bold text-favour-dark">
          {booking.referenceCode}
        </span>
        <BookingStatusBadge status={booking.status as BookingStatus} />
      </div>
      <p className="font-body text-[13px] text-ink-700">
        {new Date(booking.datetime).toLocaleString('en-PH')}
      </p>
      <p className="font-body text-[13px] text-ink-400 mt-0.5 truncate">
        {booking.address}
      </p>
    </article>
  )
}
```

- [ ] **Step 2: Add `scope=provider` query to server bookings route**

In `server/src/controllers/bookings.controller.ts`, add a `list` handler:

```typescript
async list(req: FastifyRequest<{ Querystring: { scope?: string } }>, reply: FastifyReply) {
  const repo = createBookingsRepo(req.server.prisma)
  if (req.query.scope === 'provider' && req.user.providerId) {
    const bookings = await repo.findByProvider(req.user.providerId)
    return reply.send(bookings)
  }
  const bookings = await repo.findByCustomer(req.user.id)
  return reply.send(bookings)
},
```

In `server/src/routes/bookings.ts`, add:

```typescript
fastify.get('/', { preHandler: [fastify.authenticate] }, BookingsController.list)
```

- [ ] **Step 3: Final full typecheck across all packages**

```bash
pnpm -r typecheck
```

Expected: no errors across shared, server, client.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/\(provider\)/ server/src/controllers/bookings.controller.ts server/src/routes/bookings.ts
git commit -m "feat(client): provider dashboard — grouped by status, meaningful empty state"
```

---

## Self-Review

**Spec coverage:**
- ✅ pnpm workspaces root with concurrently dev script
- ✅ packages/shared — types, constants, schemas, barrel export
- ✅ Prisma schema — all 6 models with correct relations
- ✅ Fastify plugins — Prisma singleton, Redis (Upstash), JWT auth with Redis session cache
- ✅ Booking state machine with invalid transition enforcement
- ✅ FavourScore weighted calculation + recalculation after review/completion
- ✅ Provider feed + profile routes
- ✅ Chat WebSocket gated by booking status
- ✅ Signed upload URL (server-side validation, Supabase Storage)
- ✅ Dockerfile (Node 20 Alpine, multi-stage, non-root user)
- ✅ fly.toml (Singapore region, health check, 512MB machine)
- ✅ Next.js 14 App Router with Tailwind design tokens
- ✅ Supabase browser client + server client helper
- ✅ TanStack Query client, Zustand auth store
- ✅ UI components translated from mock (Pill, StatBox, Button, FavourScoreBanner, ServiceRow, BookingStatusBadge)
- ✅ Auth pages (phone OTP login, verify)
- ✅ Customer pages (feed, provider profile, booking form, booking confirmed/detail)
- ✅ Provider dashboard
- ✅ Tests for providers service, bookings state machine, FavourScore calculation

**MVP boundaries confirmed not implemented:** payments, self-serve provider registration, admin UI, geo queries, job queue.
