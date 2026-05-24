# Stabilized Internal MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the existing Next.js + Fastify + Prisma stack so a customer and provider can complete one full booking lifecycle locally using real seeded data.

**Architecture:** Keep the current monorepo and repair the backend baseline before extending features. Use `@favour/shared` as the contract layer, keep the client and server on the current stack, and add only the smallest development-only auth shortcut needed to make local iteration fast.

**Tech Stack:** Next.js 14, React Query, Zustand, Fastify, Prisma, PostgreSQL, Supabase Auth, Vitest, TypeScript

---

## File Structure

**Primary files to modify**

- `server/tsconfig.json`
  Fix compiler configuration so shared workspace imports compile cleanly.
- `server/src/plugins/auth.ts`
  Repair Fastify auth typing and add the dev auth entry point in a production-safe way.
- `server/src/plugins/prisma.ts`
  Ensure Prisma client typing and lifecycle work correctly with generated client output.
- `server/src/app.ts`
  Keep route/plugin registration aligned with the repaired types and any dev-only auth support.
- `server/src/controllers/auth.controller.ts`
  Return the authenticated user shape cleanly from repaired request typing.
- `server/src/controllers/bookings.controller.ts`
  Align booking create/list behavior with repaired auth typing and request schemas.
- `server/src/services/bookings.service.ts`
  Fix input typing drift and keep booking creation compatible with current MVP schema.
- `server/src/repositories/bookings.repo.ts`
  Accept the actual booking create payload used by the server happy path.
- `server/prisma/schema.prisma`
  Keep the schema aligned to the internal MVP happy path and ready for seeding.
- `server/package.json`
  Add seed/dev helper scripts if needed.
- `server/src/tests/auth.test.ts`
  Extend auth coverage for the repaired request typing and dev auth path.
- `server/src/tests/bookings.test.ts`
  Add coverage for current booking transitions and create payload handling.
- `client/src/app/(auth)/login/page.tsx`
  Support the development-friendly sign-in path without disturbing production auth UX.
- `client/src/app/(auth)/verify/page.tsx`
  Preserve real OTP flow while letting development bypass friction when explicitly enabled.
- `client/src/stores/auth.ts`
  Keep session persistence compatible with the development auth path.
- `README.md`
  Update setup instructions to match the actual stack and local MVP workflow.

**Likely files to create**

- `server/prisma/seed.ts`
  Seed demo customer/provider users, provider services, and at least one booking lifecycle sample.
- `server/src/routes/dev.ts`
  Optional isolated dev-only route for issuing a session or token for seeded users.
- `server/src/tests/dev-auth.test.ts`
  Cover the development auth flow if a dedicated route is added.

---

### Task 1: Repair Server TypeScript Baseline

**Files:**
- Modify: `server/tsconfig.json`
- Modify: `server/src/plugins/auth.ts`
- Modify: `server/src/plugins/prisma.ts`
- Modify: `server/src/controllers/auth.controller.ts`
- Test: `server/src/tests/auth.test.ts`

- [ ] **Step 1: Write the failing verification command**

Run:

```bash
pnpm --filter server typecheck
```

Expected: FAIL with the current shared import, Fastify request typing, and Prisma client errors.

- [ ] **Step 2: Update server TypeScript config for workspace imports**

Target shape:

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "..",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "paths": {
      "@favour/shared": ["../packages/shared/src/index.ts"]
    }
  },
  "include": ["src", "../packages/shared/src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Repair Fastify auth typing**

Target code shape in `server/src/plugins/auth.ts`:

```ts
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
      exp: number
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    authUser: SessionPayload
  }
}
```

Use `req.authUser` instead of re-declaring `req.user`, which conflicts with Fastify JWT’s request typing.

- [ ] **Step 4: Update auth controller and server consumers to use the repaired auth property**

Target code shape:

```ts
const { id, role, providerId } = req.authUser
return reply.send({ userId: id, role, providerId })
```

Apply the same property rename in booking/review/upload/provider controllers that currently read `req.user`.

- [ ] **Step 5: Verify the auth test still fails for the right reasons, then pass**

Run:

```bash
pnpm --filter server test -- --runInBand auth
```

Expected before code adjustments: FAIL or compile error tied to the auth typing mismatch.
Expected after adjustments: PASS.

- [ ] **Step 6: Re-run server typecheck**

Run:

```bash
pnpm --filter server typecheck
```

Expected: fewer errors, with shared import and Fastify auth declaration issues resolved.

---

### Task 2: Repair Booking Path Compile Errors

**Files:**
- Modify: `server/src/controllers/bookings.controller.ts`
- Modify: `server/src/services/bookings.service.ts`
- Modify: `server/src/repositories/bookings.repo.ts`
- Test: `server/src/tests/bookings.test.ts`

- [ ] **Step 1: Add a failing booking create compatibility test**

Add a test case that captures the current exact-optional input problem:

```ts
it('creates a booking when notes are omitted', async () => {
  const repo = {
    create: vi.fn().mockResolvedValue({ id: 'booking-1', status: 'PENDING' }),
  }

  await BookingsService.create(
    'customer-1',
    {
      providerId: 'provider-1',
      serviceId: 'service-1',
      datetime: '2026-05-26T10:00:00.000Z',
      address: 'Batangas City, Philippines',
      isUrgent: false,
    },
    repo as any
  )

  expect(repo.create).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the targeted test**

Run:

```bash
pnpm --filter server test -- --runInBand bookings
```

Expected: FAIL or compile-time mismatch around `notes` / `isUrgent`.

- [ ] **Step 3: Widen the current booking service input to the real shared schema**

Target code shape:

```ts
data: {
  providerId: string
  serviceId: string
  datetime: string
  address: string
  isUrgent?: boolean
  notes?: string
}
```

When calling the repo, only include `notes` if it exists:

```ts
return repo.create({
  referenceCode: BookingsService.generateReferenceCode(),
  customerId,
  providerId: data.providerId,
  serviceId: data.serviceId,
  datetime: new Date(data.datetime),
  address: data.address,
  ...(data.notes ? { notes: data.notes } : {}),
})
```

- [ ] **Step 4: Keep the repo signature aligned with the current persisted schema**

Keep `isUrgent` out of the repo create payload until the database schema truly supports it.

- [ ] **Step 5: Re-run booking tests**

Run:

```bash
pnpm --filter server test -- --runInBand bookings
```

Expected: PASS.

- [ ] **Step 6: Re-run server typecheck**

Run:

```bash
pnpm --filter server typecheck
```

Expected: booking input mismatch errors removed.

---

### Task 3: Make Prisma and Local Data Reliable

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/prisma/seed.ts`
- Modify: `server/package.json`

- [ ] **Step 1: Inspect current schema against the internal MVP happy path**

Confirm the schema supports:
- customer user
- provider user
- provider profile
- services
- bookings
- messages
- reviews
- favour score

Run:

```bash
pnpm --filter server prisma:generate
```

Expected: PASS with a generated Prisma client.

- [ ] **Step 2: Add a seed script**

Create `server/prisma/seed.ts` that inserts:

```ts
const customerUser = { id: 'demo-customer', phone: '+639170000001', role: 'CUSTOMER' }
const providerUser = { id: 'demo-provider-user', phone: '+639170000002', role: 'PROVIDER' }
const provider = { id: 'demo-provider', userId: providerUser.id, type: 'FREELANCER', displayName: 'Demo Provider', city: 'Batangas City' }
```

Also seed:
- at least 2 services
- one pending booking
- one confirmed or completed booking
- one favour score row

- [ ] **Step 3: Add package script support**

Add or update `server/package.json` scripts:

```json
{
  "prisma:seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 4: Run the seed flow**

Run:

```bash
pnpm --filter server prisma:seed
```

Expected: PASS with deterministic demo data created or upserted.

---

### Task 4: Add a Development-Friendly Auth Path

**Files:**
- Modify: `server/src/plugins/auth.ts`
- Create or Modify: `server/src/routes/dev.ts`
- Modify: `server/src/app.ts`
- Modify: `client/src/app/(auth)/login/page.tsx`
- Modify: `client/src/app/(auth)/verify/page.tsx`
- Modify: `README.md`
- Test: `server/src/tests/dev-auth.test.ts`

- [ ] **Step 1: Write the failing dev-auth test**

If using a dev-only route, create a failing test like:

```ts
it('returns a token for a seeded development identity when NODE_ENV is not production', async () => {
  const app = buildApp()
  await app.ready()

  const res = await app.inject({
    method: 'POST',
    url: '/dev/login',
    payload: { userId: 'demo-customer' },
  })

  expect(res.statusCode).toBe(200)
})
```

- [ ] **Step 2: Run the dev-auth test**

Run:

```bash
pnpm --filter server test -- --runInBand dev-auth
```

Expected: FAIL because the route does not exist yet.

- [ ] **Step 3: Implement a dev-only login mechanism**

Recommended server shape:

```ts
if (process.env['NODE_ENV'] === 'production') {
  return reply.code(404).send({ error: 'Not found' })
}
```

Return a signed JWT for a known seeded user and a normalized auth payload.

- [ ] **Step 4: Hook the client login page into dev mode**

Recommended client behavior:
- when `NEXT_PUBLIC_DEV_AUTH=true`, show two quick actions:
  - `Continue as Demo Customer`
  - `Continue as Demo Provider`
- call the dev login endpoint
- store the returned access token with the existing auth store
- redirect to `/feed` or `/dashboard`

- [ ] **Step 5: Preserve the real OTP flow**

Only branch into the shortcut when the explicit dev flag is enabled. Keep Supabase OTP as the default production path.

- [ ] **Step 6: Re-run dev-auth tests and manual typecheck**

Run:

```bash
pnpm --filter server test -- --runInBand dev-auth auth
pnpm --filter client typecheck
```

Expected: PASS.

---

### Task 5: Verify the End-to-End Internal MVP Flow

**Files:**
- Modify: `README.md`
- Modify: any small client/server files needed to close the verified happy path

- [ ] **Step 1: Start the server**

Run:

```bash
pnpm --filter server dev
```

Expected: Fastify starts without crashing.

- [ ] **Step 2: Start the client**

Run:

```bash
pnpm --filter client dev
```

Expected: Next.js starts and loads the feed.

- [ ] **Step 3: Manually verify the happy path**

Verify:
- demo customer can sign in
- feed shows seeded providers
- provider detail shows services
- booking create succeeds
- demo provider sees the booking in dashboard
- provider confirms the booking
- provider completes the booking
- customer can load booking detail and submit a review

- [ ] **Step 4: Run the final verification commands**

Run:

```bash
pnpm --filter @favour/shared typecheck
pnpm --filter client typecheck
pnpm --filter server typecheck
pnpm --filter server test
pnpm typecheck
```

Expected:
- shared/client pass
- server passes or only fails on a consciously documented deferred set smaller than the current baseline

- [ ] **Step 5: Update README to match reality**

Document:
- actual stack
- actual local setup
- how to seed demo data
- how to use dev auth
- how to run the happy path locally
