# Provider Onboarding Design

**Date:** 2026-05-12  
**Status:** Approved  
**Scope:** Multi-step wizard for PROVIDER-role users to create their Provider profile and initial services before accessing the dashboard.

---

## Problem

After a provider logs in via OTP, they land at `/dashboard` with `providerId === null` — no Provider row exists in the DB yet. The feed is empty because no providers have profiles. The booking flow depends on providers having at least one service. This unblocks both.

---

## Approach

Option A: single-page wizard with local React state, single `POST /providers` submit. All wizard state lives in one `useState` object at the wizard shell level. On submit, one API call creates the provider + services atomically. After success, re-call `/auth/me` to hydrate `providerId` into Zustand, then redirect to `/dashboard`.

---

## Flow & Route Guard

**Layout guard** (`client/src/app/(provider)/layout.tsx`):
- `role !== 'PROVIDER'` → redirect `/feed`
- `role === 'PROVIDER'` && `providerId === null` → redirect `/onboarding`
- `role === 'PROVIDER'` && `providerId` set → allow through to `/dashboard`

**Wizard route:** `client/src/app/(provider)/onboarding/page.tsx`

Steps:
```
Step 1 — Type       BUSINESS or FREELANCER (two large tap-target cards)
Step 2 — Profile    displayName, bio (optional), city, photo (optional upload)
Step 3 — Services   add 1–10 services: name, category, priceMin, priceMax
Step 4 — Confirm    read-only summary, submit button
```

Progress indicator at top of each step: `1 OF 4 — PROVIDER TYPE`. Back button on steps 2–4.

Wizard state shape:
```ts
interface OnboardingState {
  type: 'BUSINESS' | 'FREELANCER' | null
  displayName: string
  bio: string
  city: string
  photoPath: string | null
  services: { name: string; category: string; priceMin: number; priceMax: number }[]
}
```

---

## Component Structure

```
/(provider)/onboarding/page.tsx        wizard shell — holds OnboardingState, renders active step
  StepType.tsx                         two full-width tap cards: Business / Freelancer
  StepProfile.tsx                      displayName, bio (w/ char counter), city, optional photo
  StepServices.tsx                     service list + "Add another service" button (max 10)
  StepConfirm.tsx                      read-only summary, Confirm & Submit button
```

All step components receive current values + `onChange` + `onNext` + `onBack` as props. No shared store — all state in the shell.

---

## Server-side

### New endpoint

`POST /providers`  
Auth: `preHandler: [authenticate]`  
Handler: `ProvidersController.create`

### Zod schema — `@favour/shared`

```ts
export const CreateProviderSchema = z.object({
  type: z.enum(['BUSINESS', 'FREELANCER']),
  displayName: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500).optional(),
  city: z.string().trim().min(2).max(100),
  photoPath: z.string().max(500).optional(),
  services: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(80),
        category: z.enum(SERVICE_CATEGORIES),
        priceMin: z.number().int().positive().max(100_000),
        priceMax: z.number().int().positive().max(100_000),
      })
    )
    .min(1)
    .max(10)
    .refine(
      (arr) => arr.every((s) => s.priceMax >= s.priceMin),
      'priceMax must be ≥ priceMin for all services'
    ),
})
export type CreateProviderInput = z.infer<typeof CreateProviderSchema>
```

### Controller security checks (in order)

1. `req.user.role !== 'PROVIDER'` → 403 Forbidden
2. `req.user.providerId !== null` → 409 Conflict (`{ error: 'Provider profile already exists' }`)
3. Parse + validate body with `CreateProviderSchema` → 400 on failure (Zod auto-throws)
4. Strip any HTML tags from `displayName`, `bio`, `city` using `sanitize-html` with `{ allowedTags: [], allowedAttributes: {} }` (strips all HTML) — install in `server/`

### Prisma transaction

```ts
const provider = await prisma.$transaction(async (tx) => {
  return tx.provider.create({
    data: {
      userId: req.user.id,
      type: body.type,
      displayName: sanitize(body.displayName),
      bio: body.bio ? sanitize(body.bio) : null,
      city: sanitize(body.city),
      photos: body.photoPath ? [body.photoPath] : [],
      services: { create: body.services },
    },
    include: { services: true },
  })
})
```

Returns `201` with the created provider shape.

### Route registration

Add to `providerRoutes` in `server/src/routes/providers.ts`:
```ts
fastify.post('/', { preHandler: [fastify.authenticate] }, ProvidersController.create)
```

---

## Client-side Validation

Each step validates before allowing "Next". Errors shown inline under the relevant field.

| Field | Rule |
|-------|------|
| `displayName` | Required, 2–80 chars |
| `city` | Required, 2–100 chars |
| `bio` | Optional, max 500 chars — character counter shown |
| `service.name` | Required, 2–80 chars |
| `service.category` | Required — dropdown from `SERVICE_CATEGORIES` |
| `service.priceMin` | Required, positive integer, ≤ 100,000 |
| `service.priceMax` | Required, ≥ priceMin, ≤ 100,000 |
| Services array | At least 1 required |

---

## Photo Upload (Step 2)

1. File picker restricted to `image/jpeg, image/png, image/webp`, max 5 MB — validated client-side before any network call
2. On file select: call `api.uploads.sign({ filename, contentType })` → get `{ signedUrl, path }`
3. PUT file directly to Supabase Storage via the signed URL
4. Store `path` in wizard state as `photoPath`
5. On upload failure: inline error, photo clears, user can retry or skip

No base64, no blob stored beyond the upload. The signed URL is used once and discarded.

---

## Error Handling

| Scenario | Client behaviour |
|----------|-----------------|
| 409 Provider already exists | "You already have a provider profile" message + redirect `/dashboard` |
| 401 No token | Layout guard redirects to `/login` before wizard loads |
| 403 Wrong role | Layout guard redirects to `/feed` before wizard loads |
| 400 Validation failure | Error banner on confirm step, specific message from API |
| Network error on submit | Error banner on confirm step, button re-enables |
| Invalid file type/size | Inline error on Step 2 before upload fires |
| Upload API failure | Inline error on Step 2, photo field resets |

---

## Tests (Vitest — server)

| Test | Expected |
|------|----------|
| Valid payload, provider role | 201, provider + services returned |
| Missing services array | 400 |
| `priceMax < priceMin` | 400 |
| Provider already exists | 409 |
| No auth token | 401 |
| CUSTOMER role token | 403 |
| `displayName` length 1 | 400 |

---

## File Map

| File | Action |
|------|--------|
| `packages/shared/src/schemas.ts` | Add `CreateProviderSchema`, `CreateProviderInput` |
| `server/src/routes/providers.ts` | Add `POST /` with authenticate preHandler |
| `server/src/controllers/providers.controller.ts` | Add `create` handler |
| `server/src/services/providers.service.ts` | Add `create` method with sanitization + transaction |
| `server/src/tests/providers.test.ts` | Vitest tests for POST /providers |
| `client/src/app/(provider)/layout.tsx` | Add onboarding redirect guard |
| `client/src/app/(provider)/onboarding/page.tsx` | Wizard shell |
| `client/src/app/(provider)/onboarding/StepType.tsx` | Step 1 component |
| `client/src/app/(provider)/onboarding/StepProfile.tsx` | Step 2 component |
| `client/src/app/(provider)/onboarding/StepServices.tsx` | Step 3 component |
| `client/src/app/(provider)/onboarding/StepConfirm.tsx` | Step 4 component |
| `client/src/lib/api.ts` | Add `api.providers.create(body: CreateProviderInput, token: string)` → `POST /providers` with Bearer token, returns `Provider` |
