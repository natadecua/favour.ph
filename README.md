# Favour.ph

Home services booking marketplace for the Philippines.

## Team
| Role | Person | GitHub |
|---|---|---|
| Frontend | Nathan | @natadecua |
| Backend | James | @jamesejercito |
| PM / Full Stack | Milo | @[miloperezes] |

## Stack
- **Frontend:** Next.js 14, React Query, Zustand, Tailwind CSS
- **Backend:** Fastify + Prisma
- **Shared contract:** `packages/shared` for types, constants, and Zod schemas
- **Database:** PostgreSQL / Supabase
- **Auth:** Supabase Auth, plus a dev-only quick login path for local MVP work
- **Notifications:** Semaphore PH (SMS), Nodemailer (email)

## Local Setup

Install workspace dependencies from the repo root:

```bash
pnpm install
```

Make sure local ignored env files exist:

- `server/.env`
- `client/.env.local`

Generate Prisma client and seed demo data:

```bash
pnpm --filter server prisma:generate
pnpm --filter server prisma:seed
```

Run the API and client in separate terminals:

```bash
pnpm --filter server dev
pnpm --filter client dev
```

## Dev MVP Login

Enable `NEXT_PUBLIC_DEV_AUTH=true` for the client when you want one-click seeded logins in development.

Seeded identities:

- `Demo Customer`
- `Demo Provider`

The login screen shows `DEV QUICK LOGIN` when the flag is enabled.

## MVP Verification Flow

1. Open `/login`
2. Use `Demo Customer`
3. Browse the feed and create a booking
4. Open a second session and use `Demo Provider`
5. Confirm the booking from `/dashboard`
6. Mark it complete
7. Return to the customer session and submit a review

## Branch Strategy
- `main` - production
- `dev` - integration, all PRs go here first
- `feature/*` - individual work

## Commit Convention
- `feat: add provider profile page`
- `fix: correct booking status update`
- `chore: update dependencies`
- `docs: update README`
