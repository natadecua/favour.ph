# Stabilized Internal MVP Design

**Date:** May 25, 2026
**Branch:** `feature/spec-amendments`
**Scope:** Fastest structurally sound path to a working internal MVP on the existing stack

---

## Goal

Ship a working internal MVP using the stack already present in the repository:

- `client`: Next.js 14 web app for customer and provider flows
- `server`: Fastify API with Prisma data access
- `packages/shared`: shared domain types, constants, and Zod schemas

The MVP definition for this phase is:

1. Customer can sign in in development without OTP friction.
2. Customer can browse real providers from the API.
3. Customer can create a booking.
4. Provider can view, confirm, decline, and complete bookings.
5. Customer can view booking status and submit a review after completion.
6. Both apps run locally against real seeded data.
7. The workspace baseline is stable enough to build on safely.

This phase does **not** require all v0.2 features to be complete before the MVP is considered working.

---

## Non-Goals

The following are explicitly deferred until the internal MVP is stable:

- Full quote flow
- Full reschedule flow
- Saved providers
- Anti-leakage scanner
- Urgent booking routing and notifications
- Production-grade SMS/email notification delivery
- Admin panel
- Availability calendar
- Favour Points redemption or ledger

These remain valid follow-on features, but they are not allowed to block the first usable MVP.

---

## Existing Stack Decision

The implementation will stay on the existing stack instead of pivoting again:

- **Frontend:** Next.js 14, React Query, Zustand, Tailwind CSS
- **Auth:** Supabase Auth for real sessions, with a local development shortcut
- **Backend:** Fastify
- **ORM / DB access:** Prisma
- **Database:** PostgreSQL via the existing Prisma schema and environment
- **Shared contract layer:** `@favour/shared`

This is the most time-efficient and structurally correct approach because the repository already contains real customer, provider, booking, review, upload, and auth flows on this stack.

---

## Product Slice Definition

The internal MVP centers on one complete happy path:

1. Customer authenticates in development.
2. Customer lands on the feed and sees real seeded providers.
3. Customer opens a provider profile and submits a booking.
4. Provider signs in, opens the dashboard, and confirms the booking.
5. Provider later marks the booking completed.
6. Customer opens booking detail and submits a review.
7. The review updates persisted data and provider score data remains queryable.

This slice is the gating scenario for the phase. Any feature work that does not help this path is secondary.

---

## Architecture Rules

### 1. Keep boundaries intact

- `client` never contains business rules that belong in `server`.
- `server` routes remain thin and call services.
- Prisma queries stay in repositories or tightly scoped service code that matches existing patterns.
- `@favour/shared` remains the source of truth for cross-app schema and type contracts.

### 2. Stabilize before extending

No new feature module should be added until:

- server typechecking is repaired or consciously narrowed
- Prisma client generation is working
- the local API boots
- the client runs against the real API for the happy path

### 3. Preserve backward compatibility where needed

v0.2 spec amendments may exist in shared types before the database and services catch up. During the stabilization phase:

- older persisted shapes may continue to omit some v0.2 fields
- client mocks and response consumers may be backfilled or made compatible
- database schema changes only land when the corresponding server behavior is ready

### 4. Optimize for development speed without corrupting production architecture

Development-only auth shortcuts are acceptable if they are:

- explicitly gated to non-production environments
- isolated from production auth behavior
- removable without touching product flows

---

## Workstreams

### Workstream 1: Server Baseline Repair

Purpose: make the backend trustworthy enough to build on.

Expected outcomes:

- `server` type errors caused by config drift are fixed
- Prisma client imports and generation work locally
- Fastify auth typing is correct
- route signatures compile cleanly
- the app boots without relying on broken compile assumptions

Likely areas:

- `server/tsconfig.json`
- `server/src/plugins/auth.ts`
- `server/src/plugins/prisma.ts`
- `server/src/routes/*.ts`
- `server/src/controllers/*.ts`
- `server/src/services/*.ts`

### Workstream 2: Dev Auth Fast Path

Purpose: remove OTP friction while preserving the actual stack.

Expected outcomes:

- development mode supports easy sign-in for seeded users
- client session hydration still uses the existing auth store
- server accepts the resulting authenticated session cleanly

Possible implementation shape:

- a dev-only login path or seeded bearer token path
- documented seeded identities for customer and provider

### Workstream 3: Prisma Schema and Seed Stabilization

Purpose: make local data predictable and useful.

Expected outcomes:

- database schema matches the internal MVP happy path
- Prisma migrations can be applied locally
- seeded customer, provider, services, and bookings exist
- local setup produces non-empty screens

The schema target for this phase is the minimal set needed for:

- users
- providers
- services
- bookings
- messages
- reviews
- favour score

v0.2 tables and columns can follow after this path works, unless a specific field is required for the happy path.

### Workstream 4: Happy-Path Completion

Purpose: make the product actually usable.

Expected outcomes:

- feed reads seeded providers from the API
- provider detail works with real services
- booking creation persists and returns usable data
- provider dashboard actions persist status transitions
- booking detail reflects the latest persisted state
- review submission works on completed bookings

### Workstream 5: MVP Hardening

Purpose: reduce demo risk and future rework.

Expected outcomes:

- basic setup docs match reality
- obvious dead routes or duplicate route shims are cleaned up
- critical tests cover the booking happy path
- manual verification steps are documented

---

## Deferred v0.2 Strategy

The v0.2 spec amendments remain important, but they will be implemented in this order after the internal MVP is stable:

1. Quote flow
2. Reschedule flow
3. Anti-leakage scanner
4. Saved providers
5. Urgent booking behavior

Reasoning:

- Quote and reschedule directly affect the booking lifecycle and deserve real schema + service work.
- Anti-leakage is important, but not required to validate the initial booking loop internally.
- Saved providers and urgent routing are useful but not foundational blockers for the first working MVP.

---

## Risks and Constraints

### Existing technical debt

The current repository already has server baseline issues unrelated to the spec-amendments branch:

- TypeScript config problems around shared imports
- Fastify auth request typing issues
- Prisma client typing/generation issues
- route typing mismatches

These must be treated as baseline debt, not blamed on v0.2.

### Auth complexity

Real OTP is too slow for internal iteration. If dev auth is not simplified early, product progress will be bottlenecked by environment friction instead of code.

### Spec pressure

Trying to finish all v0.2 features before a stable booking loop will delay MVP validation and increase rewrite risk.

---

## Verification Gates

The internal MVP is considered complete only when all of the following are true:

1. `pnpm --filter client typecheck` passes.
2. `pnpm --filter @favour/shared typecheck` passes.
3. `pnpm typecheck` either passes fully or fails only on an explicitly tracked deferred list that is smaller than the current baseline.
4. Server boots locally.
5. Client boots locally.
6. Seed data populates the feed and dashboard.
7. One manual end-to-end run succeeds:
   - customer sign-in
   - browse provider
   - create booking
   - provider confirms
   - provider completes
   - customer reviews

---

## Immediate Next Step

The next implementation plan should target **Server Baseline Repair + Dev Auth Fast Path + Happy-Path Completion** as one coordinated MVP effort on the existing stack.
