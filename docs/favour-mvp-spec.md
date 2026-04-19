# Favour — MVP Product Specification
**Version:** 0.1 (Draft for team review)
**Stage:** Pre-development
**Launch geography:** Batangas City, Philippines
**Platform:** Web-first (mobile-responsive)
**Prepared by:** Nathan, James, Milo

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Users](#2-users)
3. [Core Features](#3-core-features)
4. [Trust System](#4-trust-system)
5. [User Journeys](#5-user-journeys)
6. [Admin Panel](#6-admin-panel)
7. [Data Model](#7-data-model)
8. [Screen List](#8-screen-list)
9. [Notifications](#9-notifications)
10. [Tech Stack](#10-tech-stack)
11. [Out of Scope](#11-out-of-scope)

---

## 1. Platform Overview

### What is Favour?

Favour is a trusted home services marketplace connecting customers in the Philippines with verified businesses and independent freelance servicemen. The platform's core value is accountability — every booking has a trail, every provider has a public reputation score, and going off-platform means losing both.

### The Problem

Finding reliable home service providers in the Philippines currently means searching Facebook groups, asking friends, or calling random numbers — with zero accountability once contact is made. There is no platform that verifies providers, tracks booking history, and creates mutual accountability between the customer and the serviceman.

### The Solution

Favour is the accountability layer on top of discovery. It is not just about finding a provider — it is about what happens after you find them. The in-app booking trail, two-way reviews, Favour Score, and chat system make the platform significantly safer and more reliable than going direct. Providers are incentivised to stay on-platform because their reputation and business tools exist only within Favour.

### MVP Goals

- Validate demand from customers in Batangas City
- Onboard 15–25 verified providers (businesses and freelancers)
- Achieve the first 50 confirmed and completed bookings
- Prove the trust mechanics work before adding payments

### MVP Constraints

- No in-app payments (bookings only)
- No self-serve business registration (manual team onboarding)
- No native mobile app (web-first, mobile-responsive)
- No admin UI for the first week — team manages via direct DB access, graduating to the admin panel as soon as it is ready

---

## 2. Users

### 2.1 Customer

Anyone in Batangas City looking to book a home service.

**What they can do:**
- Browse and search the listings feed
- Filter by provider type (Business / Freelancer) and service category
- View provider profiles with Favour Score, reviews, and work photos
- Submit booking requests with preferred date, time, address, and notes
- Track booking status (Pending → Confirmed / Declined → Completed / Cancelled)
- Chat with a confirmed provider in-app (unlocks after confirmation only)
- Review a provider after a booking is marked completed
- Earn Favour Points for every completed booking

**What they cannot do in MVP:**
- Pay in-app
- See a provider's contact info before booking is confirmed
- Access chat before their booking is confirmed

---

### 2.2 Business

A registered home services company (cleaning, repair, electrical, plumbing, etc.) with a fixed location, onboarded manually by the Favour team.

**Profile fields:**
- Company name
- Logo
- Short company description
- Fixed address (city/area level, not exact street until booking confirmed)
- Services offered with price ranges
- Photos of past work
- Business permit verification status (drives Verified badge)
- Favour Score and component breakdown

**Dashboard capabilities:**
- View and manage incoming booking requests
- Accept or Decline with an optional message
- View confirmed bookings list
- Mark bookings as Completed
- Block off unavailable dates in availability calendar
- View client history and notes
- View own Favour Score breakdown
- View Favour Points balance

---

### 2.3 Freelancer

An independent serviceman (electrician, plumber, handyman, cleaner, etc.) operating solo, onboarded manually by the Favour team.

**Profile fields:**
- Full name
- Headshot photo
- Trade or skill category (e.g., "Electrician", "Plumber")
- Personal bio
- Service area (e.g., "Batangas City, Lipa City")
- Services offered with price ranges
- Photos of past work
- Government ID verification status (drives Verified badge)
- TESDA or other certifications
- Favour Score and component breakdown

**How Freelancer differs from Business in the product:**
- Profile layout is person-first, not company-first
- Shows service area instead of a fixed address
- Onboarding requires personal ID and skill proof instead of a business permit
- Feed card shows a "Freelancer" badge
- Booking form asks for the customer's address (since the freelancer travels to them)

**Dashboard capabilities:** Same as Business.

---

### 2.4 Admin (Favour Team)

The internal team — Nathan, James, Milo — managing the platform. Admin users have elevated access to manage providers, users, bookings, and platform health.

Described in full in [Section 6: Admin Panel](#6-admin-panel).

---

## 3. Core Features

### Feature 1 — Unified Listings Feed

A single scrollable feed of all providers — businesses and freelancers — ranked by Favour Score by default. Customers can filter and search without leaving the feed.

**Components:**
- Provider listing card showing: name, type badge (Business / Freelancer), category, Favour Score, Verified badge (if earned), starting price range, and one thumbnail photo
- Filter bar: All / Business / Freelancer
- Category filter: Cleaning / Electrical / Plumbing / Repair / Other
- Search bar: name or keyword
- Default sort: Favour Score (descending)

---

### Feature 2 — Provider Profile Pages

Two distinct profile layouts. Business profiles are company-first. Freelancer profiles are person-first. Both display all the information a customer needs to make a decision.

**Shared elements:**
- Favour Score (visible and prominent)
- Verified badge (if earned)
- Services list with price ranges
- Photos of past work (gallery)
- Availability indicator ("Available" / "Check availability")
- Response time: "Responds within X hours"
- Public reviews (published after double-blind window)
- Book button

**Business-specific:**
- Company name, logo, description
- Fixed address area (e.g., "Batangas City")

**Freelancer-specific:**
- Full name, headshot, bio
- Trade and service area
- Certifications listed

---

### Feature 3 — Booking Request Flow

Customer submits a booking request from a provider's profile page.

**Form fields:**
- Service selector (from provider's listed services)
- Preferred date (blocked unavailable dates greyed out)
- Preferred time
- Customer address (required for freelancer bookings; pre-populated for business bookings)
- Notes to provider (optional)
- Confirmation summary before submitting

After submission: booking status set to **Pending**, customer and provider both notified.

---

### Feature 4 — Booking Management Dashboard (Provider)

Provider-side view of all bookings organised by status.

**Status tabs:** Pending / Confirmed / Completed / Declined / Cancelled

**Pending requests show:**
- Customer name and their customer review average (so providers can make informed decisions)
- Service requested
- Preferred date and time
- Notes
- Accept and Decline buttons (with optional message on decline)

**Confirmed bookings show:**
- All booking details
- Customer contact info (revealed only after confirmation)
- Mark as Completed button
- Cancel booking option
- Open chat button

**Provider response timer:** Providers are expected to respond within 4 hours. Response rate is tracked and feeds directly into the Favour Score.

---

### Feature 5 — Booking Status Tracking (Customer)

Customer-side view of all their bookings with status history.

**My Bookings list:** All bookings with status pill (Pending / Confirmed / Declined / Completed / Cancelled)

**Booking detail screen (Confirmed):**
- Provider contact info (revealed only after confirmation)
- Booking details summary
- Open chat button
- Cancel booking option
- 24-hour reminder notification trigger

**Booking detail screen (Completed):**
- Write a review prompt
- Favour Points earned display

---

### Feature 6 — In-App Chat

Chat is scoped strictly to confirmed bookings. This is the platform's primary structural anti-leakage mechanic — coordination stays in-app because there is no way to exchange contact information before confirmation, and no free-form messaging outside of a booking context.

**Rules:**
- Chat only unlocks when booking status is Confirmed
- One chat thread per booking
- Both parties can see the full thread
- Simple text only in MVP (no file uploads, no voice notes)

---

### Feature 7 — Provider Availability Calendar

Providers mark dates they are unavailable. Customers see blocked dates greyed out in the date picker when submitting a booking request.

**Rules:**
- Providers can block full days only in MVP (no time-slot blocking yet)
- Blocked dates do not auto-reject bookings — they serve as a visual signal to customers
- Providers can unblock dates at any time

---

### Feature 8 — Reviews and Ratings

Double-blind, two-way reviews triggered after a booking is marked Completed.

**Rules:**
- Both customer and provider receive a review prompt after completion
- 7-day window to submit a review
- Neither party sees the other's review until both have submitted, or until 7 days have passed (whichever comes first)
- Review contains: star rating (1–5) and written review (minimum 20 characters)
- Published reviews are visible on the reviewee's profile
- Reviews feed directly into the Favour Score

**Why double-blind:** Prevents one party from adjusting their review based on what the other wrote. Encourages honest, uninfluenced feedback on both sides.

**Why two-way:** Customers who no-show, are rude, or cause problems accumulate negative reviews from providers. Future providers can see a customer's review average before deciding to accept their booking request. This creates mutual accountability.

---

### Feature 9 — Favour Score

A visible composite score displayed on every provider's listing card and profile. The primary sorting mechanism for the feed.

**Score components:**

| Component | Weight | Description |
|---|---|---|
| Average review rating | 50% | Weighted average of all customer star ratings |
| Response rate | 20% | % of requests responded to within 4 hours |
| Completion rate | 20% | % of confirmed bookings marked Completed |
| Cancellation record | 10% | Late cancellations reduce the score |

**Score display:** Numerical (e.g., 4.7) with a visual indicator. Broken down on the provider's own dashboard so they understand how to improve it.

**Feed ranking:** Higher Favour Score = higher placement in the default feed. This is the incentive for providers to respond quickly, complete jobs, and earn good reviews.

---

### Feature 10 — Favour Verified Badge

A visible badge on the provider's listing card and profile awarded after the Favour team manually reviews submitted documents. The equivalent of Airbnb's Superhost badge — the primary trust signal for customers who are browsing unfamiliar providers.

**Business requirements for Verified badge:**
- Business permit (valid)
- Government-issued owner ID
- Active contact number verified
- At least 1 service listed with a real price
- At least 1 photo of past work

**Freelancer requirements for Verified badge:**
- Government-issued ID
- Selfie verification
- At least 1 credential or certification (TESDA, trade certificate, or similar)
- At least 1 photo of past work or portfolio

**Badge behaviour:**
- Appears on listing card and profile header
- Verified providers rank higher in the feed (as a tiebreaker when Favour Score is equal)
- Revocable if a provider violates ToS

---

### Feature 11 — Cancellation Flow

Both parties can cancel a booking with structured rules.

**Rules:**
- Either party (customer or provider) can cancel any time before the booking date
- Cancellation requires a reason to be entered
- If cancelled more than 24 hours before the booking: clean cancellation, no score impact
- If cancelled within 24 hours of the booking: flagged as Late Cancellation, recorded against the cancelling party's Favour Score
- Both parties notified via all three channels (email, SMS, in-app) when a cancellation occurs

**Why 24 hours:** Protects both sides. Providers who cancel last-minute leave customers stranded. Customers who cancel last-minute waste the provider's reserved time slot. The 24-hour rule applies equally to both parties.

---

### Feature 12 — Notifications

Three-channel notification system.

| Trigger | Who gets notified | Channels |
|---|---|---|
| New booking request | Provider | Email, SMS, In-app |
| Booking confirmed | Customer | Email, SMS, In-app |
| Booking declined | Customer | Email, SMS, In-app |
| New chat message | Other party | In-app, Email (digest) |
| 24hr booking reminder | Both | Email, SMS, In-app |
| Booking cancelled | Both | Email, SMS, In-app |
| Booking completed | Customer (review prompt) | Email, In-app |
| Review window open | Both | Email, In-app |
| Review published | Both | In-app |

**SMS provider:** Semaphore PH

---

### Feature 13 — Favour Points (Foundation)

Every completed booking earns Favour Points for both the customer and the provider. Points are tracked and visible in the user's profile. Not yet redeemable in MVP — but the data, habit, and loyalty foundation is built from day one.

**Earning:**
- Customer: +10 points per completed booking
- Provider: +5 points per completed booking (additional incentive to stay on-platform)

**Display:** Points balance visible on profile. History viewable (booking by booking).

**Redemption:** Post-MVP. Planned uses: fee discounts, featured feed placement, priority support.

---

## 4. Trust System

### The Philosophy

Favour's competitive moat is not discovery — it is accountability. Facebook groups and OLX also offer discovery. What they do not offer is what happens after you find someone. Every mechanism below is designed to make Favour the safest way to transact, and to make going off-platform feel like a genuine loss.

---

### 4.1 Anti-Leakage Mechanics

Platform leakage (customers and providers transacting off-app after meeting on Favour) is the single biggest threat to the business model. The following mechanics address it structurally — not through enforcement alone, but by making staying on-platform more valuable than leaving.

**Structural mechanics (built into the product):**

1. **Contact info hidden pre-confirmation.** Phone numbers and addresses are only revealed after a booking is confirmed. Customers cannot contact a provider directly before going through the platform booking flow.

2. **Chat locked to confirmed bookings.** No booking confirmation means no chat access. This eliminates the "find them on Favour, talk to them on Messenger" pattern.

3. **Provider dashboard as a business tool.** Booking history, client notes, earnings log, and Favour Score only exist inside Favour. A provider who takes a customer off-platform is giving up their business management system.

4. **Favour Score is non-transferable.** A provider's Score and review history cannot be moved to another platform. Their reputation is a Favour-exclusive asset. Taking a customer off-platform puts future earnings at risk.

5. **Favour Points are platform-only.** Points earned are only redeemable on Favour. Off-platform transactions earn nothing.

**Policy mechanics (enforced through ToS):**

6. **ToS with account consequences.** Off-platform solicitation is a ToS violation. Reported violations result in score penalties, account warnings, or suspension. This is communicated clearly during provider onboarding.

7. **Customer reviews of providers depend on booking completion.** Only customers with a completed booking can leave a review. Providers who take customers off-platform lose the review — their most valuable marketing tool.

---

### 4.2 The Favour Score in Detail

| Component | Weight | How it is measured |
|---|---|---|
| Average review rating | 50% | Rolling weighted average of all star ratings received from customers |
| Response rate | 20% | Percentage of booking requests responded to within 4 hours over last 90 days |
| Completion rate | 20% | Percentage of confirmed bookings successfully marked as Completed |
| Cancellation record | 10% | Number of late cancellations in last 90 days, weighted negatively |

Score is recomputed after every relevant event (new review, new response, cancellation). Displayed as a number out of 5.0 on the listing card and profile.

---

### 4.3 Double-Blind Two-Way Reviews

Inspired by Airbnb's review system which achieves 70–75% review participation (vs. 10–15% for traditional hotel surveys).

- **Double-blind:** Neither party sees the other's review until both have submitted or 7 days have passed. Prevents retaliation and encourages honest feedback.
- **Two-way:** Customers build a reputation too. A customer with a history of no-shows, rude behaviour, or late cancellations accumulates negative provider reviews — making future providers less likely to accept their requests.
- **Only verified bookings trigger reviews:** A customer can only review a provider if they have a completed booking together. This prevents fake reviews.

---

## 5. User Journeys

### 5.1 Customer Journey

```
Sign up / Log in
  ↓
Browse listings feed (sorted by Favour Score by default)
  ↓
Filter by: All / Business / Freelancer · Category
  or use Search bar
  ↓
View provider profile
  (Favour Score, Verified badge, services, photos, reviews, availability)
  ↓
Tap "Book" → Fill booking request form
  (Service, date/time, address, notes)
  ↓
Booking submitted → Status: Pending
  Customer notified via email, SMS, in-app
  ↓
Provider confirms or declines
  Customer notified on all channels
  ↓
If DECLINED → Can rebook with another provider
  ↓
If CONFIRMED →
  Contact info revealed
  Chat unlocked
  24hr reminder sent before booking date
  ↓
Service takes place
  ↓
Provider marks booking as Completed
  ↓
Customer receives review prompt (7-day double-blind window)
  ↓
Review submitted → Favour Points added to customer account
  ↓
Review published when both submit or after 7 days
```

---

### 5.2 Provider Journey (Business and Freelancer)

```
Onboarded by Favour team
  (Documents collected, profile created, Verified badge reviewed)
  ↓
Log in to Provider Dashboard
  (Overview: Favour Score, active bookings, Favour Points, pending requests)
  ↓
Set availability calendar
  (Block off unavailable dates)
  ↓
New booking request arrives
  Provider notified via email, SMS, in-app
  ↓
View request detail
  (Customer name, customer review average, service, date/time, notes)
  ↓
Accept (with optional message) or Decline
  Must respond within 4 hours (response rate tracked)
  ↓
If DECLINED → Customer notified, no further action
  ↓
If CONFIRMED →
  Customer contact info visible
  Chat unlocked for coordination
  ↓
Service takes place
  ↓
Provider marks booking as Completed
  ↓
Provider receives review prompt for customer (7-day double-blind window)
  Favour Points added to provider account
  ↓
Review published when both submit or after 7 days
```

---

### 5.3 Cancellation Sub-Journey

```
Either party initiates cancellation from booking detail screen
  ↓
Must enter a cancellation reason
  ↓
System checks timing:
  > 24 hours before booking → Clean cancellation, no score impact
  ≤ 24 hours before booking → Flagged as Late Cancellation, score penalty applied
  ↓
Both parties notified via email, SMS, in-app
  Reason shown in notification
  ↓
Booking status set to Cancelled
  Late Cancellation note recorded on cancelling party's Favour Score
```

---

## 6. Admin Panel

### 6.1 Purpose

The Admin Panel is the internal tool used by the Favour team (Nathan, James, Milo) to manage the platform. It covers provider onboarding, user management, booking oversight, content moderation, platform metrics, and manual communications.

The admin panel is not customer-facing and is access-controlled to team members only.

---

### 6.2 Admin Features

#### A. Provider Onboarding Queue

The primary workflow for the Favour team to review and approve new providers.

**Screens:**
- List of pending provider applications with submission date
- Application detail view:
  - Submitted documents (ID, permit, certifications, photos)
  - Profile information as entered
  - Action buttons: Approve (triggers Verified badge), Request more info, Reject (with reason)
- History of approved and rejected applications with notes

**Workflow:**
1. Team recruits provider offline
2. Provider submits documents via a simple intake form (not a full self-service flow)
3. Application appears in the onboarding queue
4. Team reviews documents and approves or rejects
5. On approval: Verified badge applied, provider account activated, welcome notification sent

---

#### B. User Management

Full visibility into all users on the platform.

**Customer list view:** Name, email, phone, registration date, booking count, Favour Points, account status

**Provider list view:** Name/company, type (Business/Freelancer), Verified status, Favour Score, total bookings, account status

**Actions per user:**
- View full profile and booking history
- Suspend account (temporary, with reason)
- Ban account (permanent, with reason)
- Issue warning (logged in user record, visible to team)
- Reset password (for support cases)
- Manually award or deduct Favour Points
- View and respond to reported issues linked to this user

---

#### C. Booking Oversight

Full visibility into all bookings for dispute handling and platform health monitoring.

**Booking list view:** Booking ID, customer, provider, service, date, status, created date

**Filters:** By status, by date range, by provider, by customer

**Booking detail view (admin):**
- All booking fields
- Chat thread (read-only for admin)
- Cancellation history if applicable
- Dispute flag (if raised by either party)
- Admin notes field (internal only)
- Actions: Mark as disputed, override status, add admin note

---

#### D. Review Moderation

Manage the integrity of the review system.

**Review queue:** All reviews awaiting publication (within 7-day double-blind window)

**Reported reviews:** Reviews flagged by users as inappropriate, fake, or retaliatory

**Actions per review:**
- View full review content and associated booking
- Approve publication (default — no action needed unless flagged)
- Remove review (with reason logged internally)
- Warn reviewer
- Mark as investigated (clears from queue without action)

**Policy:** Reviews can only be removed if they violate platform policy (abusive language, unrelated content, or verifiably fake). Negative honest reviews are never removed.

---

#### E. Platform Metrics Dashboard

A simple overview of platform health. Not a full analytics dashboard — just the key numbers the team needs to assess whether the MVP is working.

**Metrics displayed:**

| Metric | Description |
|---|---|
| Total registered users | Broken down by Customer / Business / Freelancer |
| Total providers | Verified vs. pending |
| Total bookings | By status (Pending / Confirmed / Completed / Cancelled / Declined) |
| Booking completion rate | Completed ÷ Total confirmed |
| Average Favour Score | Across all providers |
| New signups this week | Customers and providers |
| New bookings this week | Trend line |
| Average response time | Across all providers |
| Late cancellation rate | % of bookings with a late cancellation |
| Review submission rate | % of completed bookings with at least one review |

---

#### F. Manual Notification Sender

Allows the team to send announcements to specific users or user groups.

**Target options:**
- All customers
- All providers (Business + Freelancer)
- All businesses only
- All freelancers only
- Single user (by email or name)

**Channels:** In-app notification only in MVP (email blast is post-MVP)

**Use cases:** Onboarding announcements, feature updates, policy changes, reminders to complete profiles

---

#### G. ToS Violation Log

A record of reported and actioned ToS violations.

**Fields per entry:** Reporter, reported user, violation type (off-platform solicitation, abusive behaviour, fake review, other), evidence/notes, status (open, actioned, dismissed), action taken, date

**Actions:** Issue warning, apply score penalty, suspend account, ban account

---

### 6.3 Admin Access Levels

| Role | Access |
|---|---|
| Super Admin | Full access to all panels including account actions and data |
| Team Member | Can view metrics, manage bookings, moderate reviews. Cannot ban accounts or delete data. |

In MVP: all team members are Super Admin. Role separation is post-MVP.

---

## 7. Data Model

### User

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | string | Full name |
| email | string | Unique, used for auth |
| phone | string | For SMS notifications |
| role | enum | customer \| business \| freelancer \| admin |
| favour_points | integer | Accumulated balance |
| account_status | enum | active \| suspended \| banned |
| created_at | timestamp | |

---

### BusinessProfile

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | FK → User | |
| company_name | string | |
| logo_url | string | |
| description | text | |
| address | string | Area-level, not exact street |
| permit_verified | boolean | Drives Verified badge |
| favour_score | decimal | Computed composite score |
| response_rate | decimal | % responded within 4hrs |
| avg_response_hours | decimal | Displayed on profile |
| completion_rate | decimal | |
| late_cancel_count | integer | Last 90 days |
| is_active | boolean | |

---

### FreelancerProfile

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | FK → User | |
| full_name | string | |
| photo_url | string | Headshot |
| bio | text | |
| trade | string | e.g., "Electrician" |
| service_area | string[] | e.g., ["Batangas City", "Lipa"] |
| id_verified | boolean | Drives Verified badge |
| certifications | string[] | TESDA, trade certs |
| favour_score | decimal | Same formula as Business |
| response_rate | decimal | |
| avg_response_hours | decimal | |
| completion_rate | decimal | |
| late_cancel_count | integer | |
| is_active | boolean | |

---

### Service

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| provider_id | FK | Points to Business or Freelancer |
| provider_type | enum | business \| freelancer |
| name | string | e.g., "Deep clean", "Electrical repair" |
| description | text | |
| price_min | decimal | Starting price |
| price_max | decimal | Upper price range |
| category | enum | Cleaning \| Electrical \| Plumbing \| Repair \| Other |
| is_active | boolean | |

---

### Booking

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| customer_id | FK → User | |
| provider_id | FK | Business or Freelancer profile |
| provider_type | enum | business \| freelancer |
| service_id | FK → Service | |
| preferred_datetime | timestamp | Customer's requested slot |
| customer_address | string | Required for freelancer bookings |
| notes | text | Customer's notes to provider |
| status | enum | pending \| confirmed \| declined \| completed \| cancelled |
| cancellation_reason | text | Nullable |
| is_late_cancel | boolean | True if cancelled within 24hr window |
| cancelled_by | enum | customer \| provider \| null |
| decline_message | text | Nullable, provider's message on decline |
| created_at | timestamp | |
| confirmed_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| cancelled_at | timestamp | Nullable |
| is_disputed | boolean | Flagged by admin |
| admin_notes | text | Internal team notes |

---

### Review

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| booking_id | FK → Booking | |
| reviewer_id | FK → User | |
| reviewee_id | FK → User | |
| reviewer_role | enum | customer \| provider |
| rating | integer | 1–5 stars |
| body | text | Minimum 20 characters |
| is_published | boolean | False until both submitted or 7 days passed |
| is_flagged | boolean | Flagged for admin review |
| is_removed | boolean | Removed by admin |
| removal_reason | text | Internal admin note |
| submitted_at | timestamp | |
| published_at | timestamp | Nullable |

---

### ChatMessage

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| booking_id | FK → Booking | Chat is scoped to a booking |
| sender_id | FK → User | |
| body | text | |
| sent_at | timestamp | |
| is_read | boolean | |

---

### AvailabilityBlock

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| provider_id | FK | |
| provider_type | enum | business \| freelancer |
| blocked_date | date | Full day blocked |
| note | string | Optional internal note (e.g., "Holiday") |

---

### Notification

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| user_id | FK → User | Recipient |
| type | enum | booking_request \| confirmed \| declined \| message \| reminder \| cancelled \| review_prompt \| review_published \| admin_announcement |
| title | string | |
| body | text | |
| is_read | boolean | |
| related_booking_id | FK → Booking | Nullable |
| created_at | timestamp | |

---

### TosViolation

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| reporter_id | FK → User | |
| reported_user_id | FK → User | |
| violation_type | enum | off_platform \| abuse \| fake_review \| other |
| evidence | text | Reporter's description |
| status | enum | open \| actioned \| dismissed |
| action_taken | text | Admin's internal record |
| actioned_by | FK → User (admin) | |
| created_at | timestamp | |
| resolved_at | timestamp | Nullable |

---

## 8. Screen List

### Customer Screens

| Screen | Priority |
|---|---|
| Sign up | Core |
| Log in | Core |
| Listings feed | Core |
| Search results | Core |
| Business profile | Core |
| Freelancer profile | Core |
| Booking request form | Core |
| Booking submitted confirmation | Core |
| My bookings (status list) | Core |
| Booking detail (pending) | Core |
| Booking detail (confirmed — with chat + contact) | Core |
| Booking detail (completed — with review prompt) | Core |
| Write a review | Core |
| In-app chat thread | Core |
| My profile | Account |
| Favour Points balance and history | Account |
| Notification settings | Account |
| Notifications inbox | Account |

---

### Provider Screens (Business and Freelancer)

| Screen | Priority |
|---|---|
| Log in | Core |
| Dashboard overview | Core |
| Incoming requests list | Core |
| Request detail (accept / decline) | Core |
| Confirmed bookings list | Core |
| Booking detail (mark complete / cancel) | Core |
| In-app chat thread | Core |
| Availability calendar | Core |
| Write a review (for customer) | Core |
| My profile (view) | Account |
| Edit profile / services | Account |
| Favour Score breakdown | Account |
| Favour Points balance and history | Account |
| Booking history (earnings log) | Account |
| Notification settings | Account |

---

### Admin Screens

| Screen | Priority |
|---|---|
| Admin log in (separate auth) | Core |
| Platform metrics dashboard | Core |
| Provider onboarding queue | Core |
| Application detail (review + approve / reject) | Core |
| User list (customers) | Core |
| User list (providers) | Core |
| User detail + history + actions | Core |
| Booking list (all, filterable) | Core |
| Booking detail (admin view + notes) | Core |
| Review moderation queue | Core |
| Reported reviews list | Core |
| Review detail (remove / approve) | Core |
| ToS violation log | Core |
| Violation detail + action | Core |
| Manual notification sender | Core |

---

## 9. Notifications

### Channels

- **Email:** All transactional notifications
- **SMS:** Booking requests, confirmations, cancellations, 24hr reminders (via Semaphore PH)
- **In-app:** All events including chat messages and review prompts

### Notification Triggers

| Trigger | Recipient | Email | SMS | In-app |
|---|---|---|---|---|
| New booking request | Provider | ✓ | ✓ | ✓ |
| Booking confirmed | Customer | ✓ | ✓ | ✓ |
| Booking declined | Customer | ✓ | ✓ | ✓ |
| New chat message | Other party | ✓ (digest) | — | ✓ |
| 24hr booking reminder | Both | ✓ | ✓ | ✓ |
| Booking cancelled | Both | ✓ | ✓ | ✓ |
| Late cancellation flag | Cancelling party | ✓ | — | ✓ |
| Booking completed | Customer | ✓ | — | ✓ |
| Review prompt (7-day window opens) | Both | ✓ | — | ✓ |
| Review published | Both | — | — | ✓ |
| Admin announcement | Target group | — | — | ✓ |

---

## 10. Tech Stack

### 10.1 Language

**TypeScript — everywhere, no exceptions.**
One language across the entire codebase. Nathan's frontend and James's backend share types, schemas, and validation logic through a shared package. When James changes the booking schema, Nathan's editor immediately flags where the frontend needs to update. No miscommunication, no runtime surprises.

---

### 10.2 Stack Summary

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS | SSR, SEO, App Router, Nathan's existing stack |
| Language | TypeScript (universal) | Type safety across the entire monorepo |
| Mobile (Phase 2) | React Native + Expo | Shares all TypeScript types, hooks, and API logic with web |
| Backend | Fastify + Node.js | 2–3x faster than Express, schema-first, TypeScript native |
| ORM | Prisma | Type-safe queries, auto-generated TS types from schema |
| Database | PostgreSQL via Supabase | PostGIS for geo, RLS for security, Realtime for chat |
| Auth | Supabase Auth | Phone OTP via Semaphore PH, JWT, refresh token rotation |
| Async Jobs | BullMQ + Redis | Notification queue, retries, scheduled reminders |
| Cache | Redis | Feed ranking cache, rate limit state |
| SMS | Semaphore PH | PH-local, BSP-compliant, cheapest local rates |
| Email | Resend + React Email | Modern SendGrid alternative, React-based templates |
| Payments (Phase 2) | PayMongo | GCash, Maya, cards, BSP-regulated |
| Error tracking | Sentry | Stack traces, user context, automatic capture |
| Logging | Axiom | Structured JSON logs, free tier covers MVP |
| Uptime | Better Uptime | API health checks, Google Chat alerts on downtime |
| Frontend deploy | Vercel | Native Next.js, preview deployments per PR |
| Backend deploy | Railway | Auto-deploys from GitHub, hosts API + Redis |
| Data deploy | Supabase | Managed PostgreSQL, Storage, Auth, Realtime |
| Monorepo | pnpm workspaces | Shared package for types, schemas, constants |

---

### 10.3 Monorepo Structure

```
favour-app/
├── packages/
│   └── shared/              # Shared across client and server
│       ├── schemas/         # Zod validation schemas
│       ├── types/           # TypeScript interfaces
│       └── constants/       # BOOKING_STATUS, CATEGORIES, etc.
├── client/                  # Nathan — imports from @favour/shared
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/
│       │   ├── ui/          # Primitives — Button, Card, Input, Badge
│       │   ├── features/    # BookingCard, ProviderProfile, ReviewForm
│       │   └── layouts/     # Shell, AuthLayout, DashboardLayout
│       ├── lib/
│       │   ├── api/         # TanStack Query hooks — useBookings, useProvider
│       │   ├── supabase/    # Supabase client + typed DB helpers
│       │   └── validations/ # Re-exports from @favour/shared
│       ├── stores/          # Zustand — auth session, UI state
│       └── hooks/           # useDebounce, useGeolocation, useRealtime
├── server/                  # James — imports from @favour/shared
│   └── src/
│       ├── routes/          # Fastify route declarations only
│       ├── controllers/     # Parse input, call service, return response
│       ├── services/        # All business logic lives here
│       ├── repositories/    # All database queries via Prisma
│       ├── workers/         # BullMQ job processors
│       ├── plugins/         # Fastify plugins — auth, cors, rate-limit
│       └── lib/             # Supabase client, mailer, SMS sender
├── docs/                    # PRDs, meeting notes, ADRs
├── .github/                 # PR templates, issue templates, workflows
└── package.json             # pnpm workspaces config
```

---

### 10.4 Backend Architecture — Layered, Not Flat

Business logic is never in route handlers. Every request passes through distinct layers.

```
Request
  → Route (Fastify — declares endpoint, attaches middleware)
  → Middleware (authenticate, validateSchema, rateLimit)
  → Controller (parses input, calls service, returns response)
  → Service (owns all business rules)
  → Repository (all DB queries via Prisma)
  → Database (PostgreSQL + RLS)
```

This means the database layer can be swapped without touching service logic. The service layer can be tested without a running HTTP server. The controller stays thin — it never contains conditionals.

**Example — booking creation:**
```typescript
// Route: declares endpoint only
fastify.post('/bookings', {
  preHandler: [authenticate, validateBody(CreateBookingSchema)]
}, BookingController.create)

// Controller: thin — parse, call, return
class BookingController {
  static async create(req, reply) {
    const result = await BookingService.createBooking(req.user.id, req.body)
    reply.code(201).send(result)
  }
}

// Service: owns all business rules
class BookingService {
  static async createBooking(customerId, dto) {
    await this.validateProviderAvailability(dto.providerId, dto.datetime)
    await this.checkForConflictingBookings(dto.providerId, dto.datetime)
    const booking = await BookingRepository.create({ customerId, ...dto })
    await NotificationQueue.add('booking.created', { bookingId: booking.id })
    await FavourScoreService.recordResponseWindow(dto.providerId)
    return booking
  }
}

// Repository: only Prisma queries, no logic
class BookingRepository {
  static async create(data) {
    return prisma.booking.create({ data })
  }
}
```

---

### 10.5 Favour Score Engine

The score is a weighted composite recalculated after every relevant event. It is not a simple average — it uses a Bayesian adjustment to prevent new providers with one 5-star review from outranking established providers with hundreds.

**Score weights:**

| Component | Weight | Source |
|---|---|---|
| Average review rating | 50% | Weighted avg of all customer star ratings |
| Response rate | 20% | % of requests responded to within 4 hours, last 90 days |
| Completion rate | 20% | % of confirmed bookings marked Completed, last 90 days |
| Cancellation penalty | 10% | Late cancellations, max 30% total penalty |

**Bayesian adjustment (prevents new provider inflation):**
```
bayesian_score = (reviews / (reviews + m)) × raw_avg
               + (m / (reviews + m)) × global_avg

where m = 10 (minimum review threshold)
```

**Triggers that fire a recalculation:**
- `review.submitted`
- `booking.responded` (by provider)
- `booking.completed`
- `booking.cancelled_late`

---

### 10.6 Feed Ranking Algorithm

The listings feed is not a simple `ORDER BY favour_score DESC`. Proximity, verification, and recency all factor in alongside score.

```sql
SELECT
  p.*,
  (
    -- Bayesian score (50%)
    (reviews / (reviews + 10.0)) * avg_rating
    + (10.0 / (reviews + 10.0)) * :global_avg
  ) * 0.5

  -- Response rate (20%)
  + (response_rate * 0.2)

  -- Completion rate (20%)
  + (completion_rate * 0.2)

  -- Verified badge bonus (10%)
  + (is_verified::int * 0.1)

  -- Proximity boost (slight — quality always wins)
  + (1.0 - LEAST(ST_Distance(location,
      ST_MakePoint(:lng, :lat)) / 10000.0, 1.0)) * 0.05

  AS feed_rank

FROM providers
WHERE ST_DWithin(
  location,
  ST_MakePoint(:lng, :lat),
  :radius_meters          -- default 10,000m (10km)
)
ORDER BY feed_rank DESC
```

PostGIS handles the geo filtering (`ST_DWithin`) and distance calculation (`ST_Distance`). The proximity factor is deliberately small — a 5-star provider 8km away will always outrank a 3-star provider 1km away.

---

### 10.7 Async Job Queue — BullMQ + Redis

Notifications, score recalculations, and analytics are never processed synchronously inside a route handler. They are dispatched to a job queue and processed by workers. This means booking confirmation is instant — the SMS and email follow asynchronously with automatic retry on failure.

```
Booking confirmed (API responds in ~80ms)
  │
  ▼
Event dispatched to BullMQ queue
  │
  ├──► NotificationWorker
  │       ├── sendSMS()              ← Semaphore PH (3 retries, exp. backoff)
  │       ├── sendEmail()            ← Resend
  │       └── createInAppNotif()    ← Supabase insert
  │
  ├──► FavourScoreWorker
  │       └── FavourScoreService.recompute(providerId)
  │
  └──► AnalyticsWorker
          └── recordEvent('booking.confirmed', metadata)
```

**Why this matters:** If Semaphore PH goes down at 2am, the SMS job stays in the queue with exponential backoff (retry at 1min, 5min, 30min). When Semaphore recovers, queued jobs drain automatically. Without a queue, a failed SMS causes the entire booking endpoint to error.

---

### 10.8 Security Architecture

**Rate limiting per route (not global):**

| Route | Limit | Window |
|---|---|---|
| `POST /auth/request-otp` | 3 requests | 1 minute |
| `POST /bookings` | 20 requests | 1 minute |
| `GET /providers` | 60 requests | 1 minute |
| `POST /reviews` | 5 requests | 1 hour |
| `POST /reports` | 3 requests | 1 hour |

**Row Level Security on Supabase — database-level access control:**

Even if the API has a bug that exposes the wrong query, the database itself rejects it. This is a second security layer independent of application code.

```sql
-- Customers can only read their own bookings
CREATE POLICY "customers_own_bookings" ON bookings
  FOR SELECT USING (auth.uid() = customer_id);

-- Providers can only read bookings assigned to them
CREATE POLICY "providers_own_bookings" ON bookings
  FOR SELECT USING (auth.uid() = provider_user_id);

-- Chat is only readable by the two booking participants
CREATE POLICY "chat_participants_only" ON chat_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM bookings WHERE id = booking_id
      UNION
      SELECT provider_user_id FROM bookings WHERE id = booking_id
    )
  );

-- Reviews are only writable by verified booking participants
CREATE POLICY "verified_booking_reviews" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id
      AND status = 'completed'
      AND (customer_id = auth.uid() OR provider_user_id = auth.uid())
    )
  );
```

**Shared Zod schemas — validated on both ends:**

```typescript
// packages/shared/schemas/booking.ts
export const CreateBookingSchema = z.object({
  serviceId:   z.string().uuid(),
  providerId:  z.string().uuid(),
  datetime:    z.string().datetime().refine(
    d => new Date(d) > new Date(),
    'Booking must be in the future'
  ),
  address:     z.string().min(10).max(200),
  notes:       z.string().max(500).optional(),
})

// Used on the client — form validation before submit
// Used on the server — request body validation before handler runs
// One schema. One source of truth.
```

---

### 10.9 Real-Time Chat

Chat uses Supabase Realtime in MVP — no separate WebSocket server required. When a `ChatMessage` row is inserted, Supabase pushes it to all subscribed clients via PostgreSQL's change data capture.

```typescript
// Client subscribes to the booking's chat channel
const channel = supabase
  .channel(`chat:${bookingId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `booking_id=eq.${bookingId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

**Upgrade path:** If chat needs read receipts, typing indicators, or message threading — migrate to Socket.io on Railway. The migration is contained to the chat module only. Nothing else in the stack changes.

---

### 10.10 Observability

| Tool | Purpose | When it matters |
|---|---|---|
| Sentry | Error capture — stack traces, user context, affected endpoints | A booking SMS fails silently at 11pm. Sentry catches it, shows you the user, payload, and exact line. You fix it in the morning instead of finding out from an angry provider on Facebook. |
| Axiom | Structured JSON logs from Railway | Full request/response logs, query performance, job queue drain rates |
| Better Uptime | API health checks, Google Chat alerts | Pings `/health` every 60 seconds. If the API goes down, Google Chat gets a message before any user does. |
| Bull Board | Visual queue monitor | Shows pending, active, completed, and failed jobs. Failed job inspection with full payload visible. |
| Supabase Dashboard | Query performance, slow query log, DB size | Identifies N+1 query problems before they become latency issues |

---

### 10.11 Mobile Port Strategy (Phase 2)

Because the frontend is React/TypeScript, the mobile app shares everything except UI components.

**What gets reused from web:**
- All TypeScript types and interfaces (`@favour/shared`)
- All Zod validation schemas
- All TanStack Query API hooks (`useBookings`, `useProvider`, `useReviews`)
- All Zustand store logic (auth, session)
- All business logic utilities (date formatting, score calculation)
- Supabase Realtime subscription logic

**What gets rewritten for native:**
- UI components (React Native equivalents of web components)
- Navigation (React Navigation instead of Next.js router)
- Platform-specific features (push notifications via Expo, camera access for ID upload)

The result: mobile is roughly 30% of the total web build effort, not a separate project from scratch.

---

### 10.12 Team Ownership

| Area | Nathan | James | Milo |
|---|---|---|---|
| Next.js pages and routing | ✓ | | |
| Component library (ui/, features/) | ✓ | | |
| TanStack Query hooks | ✓ | | |
| Zustand stores | ✓ | | |
| React Hook Form + Zod (client) | ✓ | | |
| React Native (Phase 2) | ✓ | | |
| Fastify routes and plugins | | ✓ | |
| Controller / Service / Repository layers | | ✓ | |
| Prisma schema and migrations | | ✓ | |
| Supabase Auth integration | | ✓ | |
| BullMQ workers | | ✓ | |
| Semaphore PH + Resend integrations | | ✓ | |
| PostGIS geo queries | | ✓ | |
| Row Level Security policies | | ✓ | |
| Sentry + Axiom setup | | ✓ | |
| GitHub Projects board and sprints | | | ✓ |
| Issue creation and user stories | | | ✓ |
| Shared Zod schemas (`@favour/shared`) | ✓ | ✓ | |
| API contract definition | ✓ | ✓ | ✓ |
| PayMongo integration research (Phase 2) | | | ✓ |
| End-to-end testing flows | | | ✓ |

---

## 11. Out of Scope

The following features are explicitly excluded from MVP. They are planned for post-launch phases.

| Feature | Phase |
|---|---|
| In-app payments | Phase 2 |
| Favour Points redemption | Phase 2 |
| Business self-serve registration | Phase 2 |
| Native mobile app (iOS / Android) | Phase 2 |
| Admin email blast tool | Phase 2 |
| Price filter on listings feed | Phase 2 |
| Map view / location-based browse | Phase 2 |
| AI assistant / chatbot | Phase 3 |
| Business analytics dashboard | Phase 3 |
| Promotions, deals, and vouchers | Phase 3 |
| Loyalty tier system (Silver, Gold, Platinum) | Phase 3 |
| Provider-to-provider referral network | Phase 3 |
| Admin role separation (Super Admin vs. Team Member) | Phase 2 |
| Chat file/photo uploads | Phase 2 |
| Time-slot (not just full-day) availability blocking | Phase 2 |

---

*This document is a working draft. Review with James (backend) and Milo (PM) before development begins. Flag gaps, conflicts, or changes as comments before locking scope.*
