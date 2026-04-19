# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Favour.ph — a home services booking marketplace for Batangas City, Philippines. Connects customers with verified home service providers (businesses and freelancers). MVP focuses on booking flow and trust mechanics; no in-app payments in MVP.

## Monorepo Structure

pnpm workspaces with three packages:
- `packages/shared` — Zod schemas, TypeScript types, shared constants (`@favour/shared`)
- `client/` — Next.js 14 App Router, Tailwind CSS, Supabase Auth, TanStack Query, Zustand
- `server/` — Fastify, Prisma ORM, Supabase (PostgreSQL)

## Commands

```bash
# Install all workspace dependencies
pnpm install

# Run client dev server
cd client && pnpm dev

# Run server dev
cd server && pnpm dev

# Run both concurrently (from root if configured)
pnpm dev

# Build shared package (required before building client/server)
cd packages/shared && pnpm build

# Prisma
cd server && pnpm prisma generate
cd server && pnpm prisma migrate dev --name <name>
cd server && pnpm prisma studio
```

## Architecture

### Server (`server/`)
Layered architecture: `routes → controllers → services → repositories`
- Routes register Fastify route handlers and validate with Zod (from `@favour/shared`)
- Controllers parse request, call service, return response
- Services contain business logic (e.g. Favour Score calculation, booking state machine)
- Repositories handle Prisma queries — no business logic here

### Client (`client/`)
Next.js 14 App Router. Key patterns:
- Server Components for data fetching where possible
- TanStack Query for client-side mutations and cache invalidation
- Zustand store for auth state (`useAuthStore`)
- Supabase client is initialized in `lib/supabase.ts`

### Shared (`packages/shared`)
Single source of truth for types and validation. Both client and server import from `@favour/shared`. Never duplicate type definitions.

## Domain Model (key entities)

- **User** — has role: `CUSTOMER | PROVIDER | ADMIN`
- **Provider** — either `BUSINESS` or `FREELANCER` type; has `favourScore`
- **Booking** — state machine: `PENDING → CONFIRMED | DECLINED → COMPLETED | CANCELLED`
- **Review** — two-way (customer reviews provider and vice versa), only after `COMPLETED`
- **Chat** — unlocks only after booking is `CONFIRMED`
- **FavourScore** — composite score: response rate, completion rate, review average, recency

## Branch Strategy

- `main` — production
- `dev` — integration branch; all PRs target `dev` first
- `feature/*` — individual feature work

## Commit Convention

```
feat: add provider profile page
fix: correct booking status update
chore: update dependencies
docs: update README
```

## Environment

Copy `.env.example` to `.env` and fill in Supabase credentials. The server uses `DATABASE_URL` (Supabase PostgreSQL connection string) and `SUPABASE_SERVICE_ROLE_KEY`. The client uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Notifications

- SMS via Semaphore PH (Philippines SMS gateway)
- Email via Nodemailer
- Triggered on: booking confirmed/declined, booking completed, new review

## Design Context

Full design context lives in `.impeccable.md`. Summary for quick reference:

**Users:** Stressed homeowners (urgent fix, trust-first) and planned browsers (comparing options) — equal split. Mobile-first, all ages, Philippines.

**Brand:** Accountable, confident, Filipino. Trust before delight. Warm copy, cold structure.

**Aesthetic:** Polished shell (Grab-tier navigation), dense core (field ops tool interior). Light mode with intentional dark surfaces (header bar, FavourScore banner).

**Typography:**
- `Manrope 800` — headings, provider names, buttons, large numbers
- `Figtree 400–600` — body text, descriptions
- `JetBrains Mono 700` — all data: prices (`PHP 700.00`), codes (`FVR-992-AX8`), distances, scores, ALL CAPS field labels

**Palette:** Primary `#0047CC`, dark `#111827`, verify green `#007A33`, danger `#D92121`, amber `#B36B00`, surface `#F3F4F6`, border `#E5E7EB`

**Rules:**
- All borders: 1.5px solid
- Cards: white, 1.5px `#E5E7EB`, 12px radius
- Buttons: 52px tall, 10px radius, Manrope 800 17px, full-width primary
- Avatars: rounded rectangle (never circular), 10–12px radius
- Provider names always prefixed: "Kuya Mateo" / "Ate Sarah"
- Prices always in JetBrains Mono: `PHP 700.00`
- Touch targets ≥ 44×44px (WCAG 2.1 AA)

**Banned patterns:** No gradient text, no border-left accent stripes, no glassmorphism, no gradient backgrounds.
