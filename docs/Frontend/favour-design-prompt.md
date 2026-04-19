# Favour.ph — AI Design Generation Prompt
## For use with Google Stitch, v0.dev, Locofy, or Vercel AI

---

## MASTER SYSTEM PROMPT
*Paste this first before any screen-specific prompt*

```
Design a mobile app called Favour.ph — a home services booking marketplace in the Philippines.

DESIGN PHILOSOPHY:
Flat, mature, utility-grade. No gradients, no drop shadows, no blur effects, no rounded blobs, no decorative illustrations. Every element is structural and purposeful. Think field operations software meets modern Filipino fintech — confident, trustworthy, anti-generic.

BRAND IDENTITY:
- App name: Favour.ph (stylised as FAVOUR.PH in display contexts)
- Tagline: "Book trusted home pros near you"
- Market: Philippines, Batangas City launch
- Cultural layer: Providers are referred to as "Kuya" (male) and "Ate" (female), reflecting Filipino respect culture. Copy is warm but not cutesy.

COLOR SYSTEM (use exactly):
- Primary Blue: #0047CC — CTAs, selected states, active indicators, links
- Blue Light: #EEF3FF — Blue tinted backgrounds, info banners
- Blue Mid: #D0DEFF — Blue borders and outlines
- Near Black: #111827 — Primary text, headers, dark surfaces
- Ink 700: #4B5563 — Secondary text, labels
- Ink 400: #9CA3AF — Tertiary text, placeholders, muted elements
- Surface: #F3F4F6 — Page backgrounds, input fills
- Border: #E5E7EB — All card and element borders
- White: #FFFFFF — Card backgrounds, content surfaces
- Verify Green: #007A33 — Verified badge, success states, completion indicators
- Green Light: #ECFDF0 — Green tinted backgrounds
- Danger Red: #D92121 — Errors, warnings, cancellations
- Amber: #B36B00 — Warning states, pending indicators

TYPOGRAPHY (import from Google Fonts):
- Display/Headings: Manrope, weight 800. Use for all screen titles, provider names, large numbers, CTAs.
- Body/Prose: Figtree, weight 400–600. Use for descriptions, review text, body copy.
- Data/Mono: JetBrains Mono, weight 700–800. Use for: prices (PHP 1,450.00), booking reference codes (FVR-992-AX8), distances (0.8 KM), scores (4.97), timestamps (10:45 AM), status labels (PENDING), all uppercase field labels.

SPACING SYSTEM:
- Base unit: 4px
- Standard card padding: 16px
- Screen horizontal padding: 20px
- Gap between cards: 8–12px
- Section gap: 16–20px

BORDER RULES:
- All borders: 1.5px solid
- Default border color: #E5E7EB
- Active/selected border: #0047CC
- Danger border: #D92121
- Border radius — cards: 12px, inputs: 8px, buttons: 10px, pills/tags: 6px, avatars: 10–12px, small chips: 4–5px

COMPONENT SPECIFICATIONS:

Primary Button:
- Height: 52px, width: 100%, border-radius: 10px
- Background: #0047CC, text: white, font: Manrope 800, size: 17px
- No shadow. Active state: scale(0.98).

Secondary Button:
- Height: 48px, border: 1.5px solid #E5E7EB, background: white
- Text: #111827, font: Manrope 700

Cards:
- Background: white, border: 1.5px solid #E5E7EB, border-radius: 12px
- Active/selected variant: border-color #0047CC, background #EEF3FF
- Left accent line on selected: 4px wide, color #0047CC, flush to left edge

Status Pills:
- Height: 26px, padding: 0 10px, border-radius: 6px, border: 1.5px solid
- Font: JetBrains Mono 700, size: 11px, UPPERCASE, letter-spacing: 0.04em
- Include a 6px colored dot before the label
- Variants: Blue (info), Green (verified/success), Amber (pending/warning), Red (danger), Dark (neutral)

Field Labels:
- Font: JetBrains Mono 800, size: 11px, color: #9CA3AF
- ALL UPPERCASE, letter-spacing: 0.08em
- Position: above the input or section

Inputs:
- Height: 48px, border: 1.5px solid #9CA3AF, border-radius: 8px
- Focused border: #0047CC
- Font: Figtree 600, size: 17px, color: #111827
- Phone prefix box: separate left-attached box, background #F3F4F6, font: JetBrains Mono 800

Avatar/Profile Photos:
- Shape: rounded rectangle (border-radius: 10–12px), never circular
- Border: 1.5px solid #E5E7EB
- Fallback: initials in JetBrains Mono 800, white on #111827 background

Verified Badge:
- Small green shield icon (ShieldCheck) with a green background dot overlay on avatar bottom-right
- Full pill variant: background #ECFDF0, border #A7F3C0, text #007A33, label: "✓ FAVOUR VERIFIED"

Favour Score Display:
- Large number in JetBrains Mono 800, size: 32–36px, color: white
- Displayed on a #111827 dark banner
- Star row beneath the number (5 stars, filled white)
- Right side: "FAVOUR SCORE" label in Manrope 700 size 13px, muted text beneath with job count

Stat Boxes:
- White background, 1.5px border #E5E7EB, border-radius: 10px
- Value: JetBrains Mono 800, size: 20px (accent-colored)
- Label: Manrope 700, size: 11px, color #4B5563, UPPERCASE
- Sub-label: Figtree 500, size: 10px, color #9CA3AF

Star Rating (interactive):
- Stars: 38px each, gap: 10px
- Empty: outline only, stroke #E5E7EB
- Filled: solid fill #111827
- Hover/selected state: scale(1.1) transform

PHONE FRAME:
- Width: 375px, height: 812px
- Frame: border 12px solid #111827, border-radius: 48px
- Status bar: 44px height, shows "10:45 AM" (Manrope 700, 12px) and LTE + battery
- Home indicator: 120px × 4px bar, #111827, centered at bottom

ICON LIBRARY: Use Lucide icons throughout. Stroke-width: 1.5–2. Size: 16–20px in most contexts.

DO NOT USE:
- Gradients of any kind
- Box shadows or drop shadows
- Blur effects
- Rounded circle avatars
- Purple, pink, or teal in any primary context
- Inter, Roboto, or Arial fonts
- Generic "app" layouts with bottom tab bars featuring Home/Search/Profile icons
- Emojis in UI elements
```

---

## SCREEN 1 — Authentication / OTP Entry

```
Screen: Auth / OTP Entry for Favour.ph

Layout: Full white screen, single column, vertically centered content with generous padding (24px horizontal).

TOP SECTION:
- Favour logo block: 48×48px black square (#111827) with rounded corners (8px), containing a white Wrench icon (Lucide), centered.
- Below logo: App name in Manrope 800, 36px, tracking-tighter. "FAVOUR" in #111827, ".PH" in #0047CC. Line-height: 1.
- Tagline below: "Magandang araw! Your home's best friend is just a tap away." in Figtree, 17px, #4B5563. Two lines, relaxed line-height.
- Spacing between logo and heading: 24px. Heading to tagline: 12px. Tagline to form: 40px.

FORM SECTION:
- Field label: "MOBILE NUMBER" — JetBrains Mono 800, 11px, #9CA3AF, uppercase, letter-spacing 0.08em.
- Input: Two-part field. Left box (prefix): "+63" in JetBrains Mono 800, #111827, 48px tall, background #F3F4F6, border-right none, border 1.5px #9CA3AF, left border-radius 6px. Right box (number input): placeholder "917 000 0000", 48px tall, border 1.5px #9CA3AF, right border-radius 6px, Figtree 600 17px.
- Spacing below input: 24px.
- Primary button: "Send Secure Code" — 52px tall, full width, #0047CC background, white Manrope 800 17px text, border-radius 10px.

BOTTOM TRUST SECTION:
- Horizontal dashed divider: 1.5px dashed #E5E7EB, margin 32px top.
- Trust card: background #F9FAFB, border 1.5px solid #E5E7EB, border-radius 8px, padding 16px.
  - Inside: row with ShieldCheck icon (18px, #007A33, flex-shrink 0) and text "Every Kuya and Ate on our platform undergoes strict NBI clearance and skills verification. You're in safe hands." in Figtree 500, 14px, #4B5563, line-height 1.6.
```

---

## SCREEN 2 — Home / Discovery Feed

```
Screen: Home feed for Favour.ph — discovery of providers near the customer.

STICKY DARK HEADER (background #111827):
- Top row: Left side shows location selector — MapPin icon (14px, #9CA3AF) + "Batangas City" in Manrope 700 15px white, underlined with dashed 1.5px #4B5563 border-bottom + ChevronDown icon (14px, #9CA3AF). Right side: Bell icon (24px, white) with a 10px #0047CC notification dot (border 2px #111827).
- Heading below: "What needs fixing today, boss?" — Manrope 800, 22px, white, tracking-tight.
- Search bar: 52px height, white background, full width, border-radius 6px. Search icon (20px, #4B5563) inset left. Placeholder "e.g. Leaking sink, Aircon cleaning..." in Figtree 600, 16px.
- Padding: 20px sides, 20px top, 24px bottom.

CATEGORY GRID (white background, below header, border-bottom 1.5px #E5E7EB):
- 4 equal columns. Each cell: centered icon box (48×48px, border-radius 8px, background #F3F4F6, border 1.5px #E5E7EB) with Lucide icon + label below in Manrope 700 13px #111827.
- Categories: Aircon (Fan icon), Plumbing (Wrench icon), Electrical (Zap icon), Cleaning (Sparkles icon).
- Dividers: 1.5px #E5E7EB vertical between columns. No border on outer edges.
- Cell padding: 20px top/bottom.

PROVIDER LIST SECTION (background #F3F4F6, padding 20px sides):
- Section header row: "Pros Near You" in Manrope 800, 16px, #111827. Right side: List/Map toggle — two buttons in a shared container with 1.5px border #111827, border-radius 6px, overflow hidden. Active button: background #111827, text white. Inactive: text #4B5563. Font: JetBrains Mono 700, 12px, uppercase, letter-spacing tight.

PROVIDER CARDS (vertical list, gap 10px):
Each card: white background, 1.5px #E5E7EB border, border-radius 12px, padding 16px, flex row, gap 16px.
- Left: Avatar — 48×48px, border-radius 8px, border 1.5px #9CA3AF, grayscale placeholder image.
- Right content column (flex 1):
  - Top row: Provider name in Manrope 800 16px #111827 (left). Distance chip (right): JetBrains Mono 700, 12px, #0047CC, background #EEF3FF, border 1.5px #0047CC, padding 2px 6px, border-radius 4px.
  - Trade below name: Figtree 700, 13px, #4B5563.
  - Rating row: Star icon (14px, filled #111827) + score in JetBrains Mono 700 13px + "(jobs count)" in Figtree 12px #4B5563.

Sample providers:
- "Kuya Mateo D." · Plumber · 4.98 · 1,204 jobs · 0.8 KM
- "Ate Sarah L." · Cleaning · 5.00 · 842 jobs · 1.2 KM
- "Kuya Ben R." · Electrician · 4.91 · 317 jobs · 2.1 KM
```

---

## SCREEN 3 — Provider Profile (Freelancer)

```
Screen: Freelancer provider profile for "Kuya Mateo D." — full scrollable detail page with sticky book button.

STICKY TOP NAV (white, border-bottom 1.5px #E5E7EB):
- Left: Back button — 36×36px, border 1.5px #E5E7EB, border-radius 8px, ArrowLeft icon 18px #111827.
- Center: "PRO PROFILE" — JetBrains Mono 700, 13px, #4B5563.
- Right: Two icon buttons (Share2, Bookmark) — same 36×36px spec as back button.

HERO SECTION (white background, padding 24px top 20px sides 20px bottom, border-bottom 1.5px #E5E7EB):

Provider identity row (flex, gap 16px, align start):
- Avatar: 72×72px rectangle, border-radius 12px, border 1.5px #E5E7EB, grayscale photo. Overlaid at bottom-right: 22×22px green (#007A33) rounded badge with ShieldCheck icon (12px, white), border 2px white.
- Name + meta (flex 1):
  - Name: "Kuya Mateo D." — Manrope 800, 20px, #111827, tracking-tight.
  - Pill row below: "✓ FAVOUR VERIFIED" pill (green: background #ECFDF0, border #A7F3C0, text #007A33) + "FREELANCER" pill (dark: background #F3F4F6, border #E5E7EB, text #4B5563). Both: JetBrains Mono 700, 11px, height 26px, padding 0 10px, border-radius 6px.
  - Location row: MapPin icon (13px, #9CA3AF) + "Batangas City, Lipa City" in Figtree 500, 13px, #4B5563.

Favour Score banner (margin-top 20px):
- Background #111827, border-radius 10px, padding 14px 16px, flex row, gap 14px.
- Left block: Score "4.97" in JetBrains Mono 800, 32px, white, line-height 1. Stars row below: 5× Star icon 12px, filled white, gap 3px.
- Vertical divider: 1px × 44px, #374151.
- Right content: "FAVOUR SCORE" in Manrope 700, 13px, #9CA3AF. Below: "Based on 1,204 completed jobs" in Figtree, 12px, #6B7280.
- Far right: Award icon, 28px, #0047CC, stroke-width 1.5.

Stat boxes row (margin-top 12px, flex, gap 8px):
Three equal StatBox components:
1. Value "< 2h" (blue #0047CC) · Label "RESPONSE" · Sub "avg. time"
2. Value "98%" (green #007A33) · Label "COMPLETION" · Sub "last 90 days"
3. Value "67%" (dark) · Label "REPEAT" · Sub "clients"

Response signal (margin 12px 16px 0):
- Background #EEF3FF, border 1.5px #D0DEFF, border-radius 10px, padding 10px 14px.
- Clock icon (16px, #0047CC) + text "Usually responds to requests within 2 hours" — Figtree 600, 13px, #0047CC. "2 hours" bolded.

ABOUT SECTION (white, padding 18px 20px, top + bottom 1.5px #E5E7EB borders, margin 12px 0):
- Label: "ABOUT" — JetBrains Mono 800, 11px, #9CA3AF, uppercase.
- Body: "Licensed aircon technician with 8 years of experience. Specializing in split-type cleaning, repair, and installation. TESDA NC II certified. I treat every home like my own." — Figtree 400, 14px, #4B5563, line-height 1.65.
- Tags row (margin-top 12px, flex wrap, gap 6px): "TESDA NC II" · "NBI Cleared" · "8 Yrs. Exp." — JetBrains Mono 700, 11px, #4B5563, background #F3F4F6, border 1.5px #E5E7EB, padding 3px 8px, border-radius 5px.

SELECT A SERVICE SECTION (white, padding 18px 20px, borders top + bottom):
- Section label: "SELECT A SERVICE" — JetBrains Mono 800, 11px, #9CA3AF.
- Service rows (flex column, gap 8px). Each row: flex, gap 12px, padding 14px 16px, border 1.5px, border-radius 10px.
  - Left: icon box 40×40px, border-radius 8px.
  - Middle: name (Manrope 700, 15px, #111827) + price (JetBrains Mono 700, 12px, muted).
  - Right (selected only): 22px filled blue circle with white Check icon.
  - Selected state: border #0047CC, background #EEF3FF, icon box background #0047CC (white icon inside), price text #0047CC.
  - Unselected state: border #E5E7EB, background white, icon box background #F3F4F6.

  Services:
  1. Fan icon · "Aircon Cleaning" · PHP 700 base (default selected)
  2. Zap icon · "Aircon Repair" · PHP 950 base
  3. Wrench icon · "Plumbing Work" · PHP 500 base

PAST WORK SECTION (white, padding 18px 20px):
- Header row: "PAST WORK" label left + "See all →" right (Manrope 700, 12px, #0047CC).
- 3-column photo grid, gap 6px, 1:1 aspect ratio. Each cell: border-radius 8px, border 1.5px #E5E7EB, background #F3F4F6 placeholder with centered muted icon.

REVIEWS SECTION (white, padding 18px 20px, border top + bottom):
- Header: "REVIEWS" label left + "142 total →" right.
- Two ReviewCard components (gap 10px between them).
  ReviewCard: white, border 1.5px #E5E7EB, border-radius 10px, padding 14px 16px.
  - Header: 36×36px avatar (border-radius 8px, #111827 background, white Manrope initials) + name (Manrope 700, 14px) + star row + date (JetBrains Mono 700, 10px, #9CA3AF).
  - Text: Figtree 400, 13px, #4B5563, line-height 1.55.
  
  Review 1: "MR" · Maria R. · 5 stars · "2 days ago" · "Super bait at mabilis! Fixed my aircon in less than an hour. Babalik ako ulit. Highly recommended!"
  Review 2: "JD" · Jose D. · 5 stars · "1 week ago" · "Very professional at neat. Explained everything before starting. Fair price, great results."

STICKY BOOK BUTTON (position sticky bottom, white background, border-top 1.5px #E5E7EB, padding 14px 20px):
- Button: "Book Kuya Mateo" + ChevronRight icon (18px, strokeWidth 2.5) — full primary button spec.
```

---

## SCREEN 4 — Booking Request Form

```
Screen: Booking request form for Favour.ph. Clean, minimal, functional. Two-column service selector at top, fields below, CTA at bottom.

TOP (white, padding 24px 20px):
- Back arrow (top-left, 36×36px icon button).
- Heading: "Book a service" — Manrope 800, 28px, #111827, tracking-tight.
- Subheading: "Select exactly what you need fixing." — Figtree 400, 15px, #4B5563.
- Divider: 1.5px #E5E7EB, margin 16px 0.

SERVICE SELECTOR (2-column grid, gap 10px, padding 0 20px):
Each tile: white background, border 1.5px #E5E7EB, border-radius 12px, padding 18px 14px.
- Icon box: 48×48px, border-radius 8px, background #F3F4F6, border 1.5px #E5E7EB, Lucide icon 22px.
- Service name: Manrope 800, 17px, #111827, margin-top 12px.
- Price: "PHP 700 base" — JetBrains Mono 700, 12px, #9CA3AF.

Selected tile variant: border 1.5px #0047CC, background #EEF3FF. Icon box: background #0047CC, icon white. Price text: #0047CC.

Services shown (first selected by default):
- Aircon · Fan icon · PHP 700 base (SELECTED)
- Plumbing · Wrench icon · PHP 500 base

FORM FIELDS (padding 20px, flex column, gap 16px):
Each field follows the Input component spec with uppercase JetBrains Mono label above.

1. Label "SERVICE ADDRESS" — Input with placeholder "e.g. 10 Rizal Ave, Batangas City", default value "142 Amorsolo St, Legazpi Village"
2. Label "REQUESTED TIME" — Input with value "Today, 14:00", calendar icon inside right side of input (16px, #9CA3AF).
3. Label "NOTES TO PROVIDER (OPTIONAL)" — Textarea, min-height 80px, same border style as inputs, placeholder "e.g. Please bring cleaning kit, gate code is 1234".

STICKY BOTTOM (border-top 1.5px #E5E7EB, background white, padding 14px 20px):
- Button: "Find a Worker" — full primary button spec, 52px.
```

---

## SCREEN 5 — Booking Confirmed

```
Screen: Booking confirmed state for Favour.ph — shown immediately after provider accepts a request.

DARK HEADER (background #111827, padding 28px 20px 24px, text-align center):
- Icon: 56×56px rounded square (border-radius 14px, background #007A33), centered. CheckCircle2 icon (28px, white, strokeWidth 2) inside.
- Heading: "Booking Confirmed!" — Manrope 800, 22px, white, tracking-tight, margin-top 14px.
- Subtext: "Kuya Mateo accepted your request." — Figtree 400, 14px, #9CA3AF.
- Reference badge (margin-top 14px, inline-flex, centered): background #1F2937, border 1.5px #374151, border-radius 8px, padding 8px 14px. "REF" label in JetBrains Mono 700, 12px, #9CA3AF + "FVR-992-AX8" in JetBrains Mono 800, 14px, white. Gap between them: 6px.

CONTENT (white background, padding 20px):

Provider mini-card (flex row, gap 14px, align center, padding 14px 16px, border 1.5px #E5E7EB, border-radius 12px, background #F3F4F6, margin-bottom 16px):
- Avatar: 48×48px, border-radius 10px, border 1.5px #E5E7EB, grayscale image.
- Name: Manrope 800, 15px, #111827. Star + score row below: Star icon (12px, filled #111827) + "4.97" JetBrains Mono 700 12px + "· 1,204 jobs" Figtree 12px #9CA3AF.
- Right: 38×38px icon button (Phone icon, 16px), border 1.5px #E5E7EB, border-radius 8px, background white.

Booking details card (border 1.5px #E5E7EB, border-radius 12px, overflow hidden, margin-bottom 16px):
- Header row: background #F3F4F6, padding 12px 16px, border-bottom 1.5px #E5E7EB. Label "BOOKING DETAILS" — JetBrains Mono 800, 11px, #9CA3AF.
- Three detail rows (each: flex, align center, gap 12px, padding 13px 16px, border-bottom 1.5px #E5E7EB, background white):
  - Icon box: 32×32px, border-radius 7px, background #F3F4F6, border 1.5px #E5E7EB, 15px Lucide icon (#4B5563).
  - Label: JetBrains Mono 700, 10px, #9CA3AF, uppercase. Value below: Figtree 600, 14px, #111827.
  
  Row 1: Fan icon · "SERVICE" · "Aircon Cleaning"
  Row 2: Calendar icon · "DATE & TIME" · "Today, 2:00 PM"
  Row 3: MapPin icon · "ADDRESS" · "142 Amorsolo St, Batangas City"
  
- Price row (padding 13px 16px, background white): Label "BASE PRICE" (mono, muted). Value "PHP 700.00" — JetBrains Mono 800, 16px, #0047CC + " starting rate" in #9CA3AF, 12px.

Chat unlock notice (padding 14px 16px, background #EEF3FF, border 1.5px dashed #0047CC, border-radius 10px, flex row, gap 12px, align start, margin-bottom 16px):
- MessageSquare icon (18px, #0047CC, flex-shrink 0, margin-top 2px).
- Title: "Chat is now unlocked" — Manrope 700, 14px, #0047CC. Body below: "Coordinate with Kuya Mateo directly in-app. Contact details are now visible." — Figtree 400, 13px, #0047CC, opacity 0.85, line-height 1.5.

Action buttons (flex column, gap 10px):
1. "Open Chat with Kuya Mateo" — Primary button, MessageSquare icon left (18px).
2. "View Full Booking" — Secondary button.
```

---

## SCREEN 6 — Leave a Review

```
Screen: Post-service review screen for Favour.ph. Double-blind, two-way review flow.

STICKY NAV (white, border-bottom 1.5px #E5E7EB, padding 16px 20px, flex row, gap 12px, align center):
- Back button: 36×36px, border 1.5px #E5E7EB, border-radius 8px, ArrowLeft icon 18px.
- Label: "LEAVE A REVIEW" — JetBrains Mono 700, 13px, #4B5563.

CONTENT (padding 24px 20px, flex column):

Provider mini-card (flex row, gap 12px, align center, margin-bottom 28px):
- Avatar: 52×52px, border-radius 12px, border 1.5px #E5E7EB, grayscale image.
- Name: Manrope 800, 16px, #111827. Below: "Aircon Cleaning · Today, 2:00 PM" — Figtree 400, 13px, #4B5563. Below that: "✓ COMPLETED" pill in green.

Star rating block (text-align center, margin-bottom 28px):
- Heading: "How was your experience?" — Manrope 800, 17px, #111827.
- Subtext: "Your honest feedback helps the whole community." — Figtree 400, 14px, #4B5563. Margin-bottom 20px.
- 5 star buttons in a row (flex, justify center, gap 10px):
  - Each: 38px Star icon, Lucide.
  - Empty state: stroke only, color #E5E7EB.
  - Filled/selected state: fill #111827, stroke #111827.
  - Hover state: scale(1.1).
- Rating label below stars (appears after selection): JetBrains Mono 700, 13px, #4B5563. Values: 1="Poor" 2="Fair" 3="Good" 4="Great" 5="Outstanding!"

Written review field:
- Label: "YOUR REVIEW" — JetBrains Mono 800, 11px, #9CA3AF, uppercase, letter-spacing 0.08em.
- Textarea: min-height 120px, padding 14px, border 1.5px #E5E7EB, border-radius 10px, Figtree 500 14px, line-height 1.6. Placeholder: "What did you like? Was everything done right? Be honest — your review helps future customers make better decisions."

Double-blind notice (padding 12px 14px, background #EEF3FF, border 1.5px #D0DEFF, border-radius 10px, flex row, gap 10px, align start, margin-top 16px):
- Lock icon (15px, #0047CC, flex-shrink 0, margin-top 1px).
- Text: "Double-blind review. Your review stays private until Kuya Mateo submits his — or after 7 days. This keeps both reviews honest." — Figtree 400, 12px, #0047CC, line-height 1.5. "Double-blind review." bolded.

STICKY BOTTOM (border-top 1.5px #E5E7EB, background white, padding 14px 20px):
- Default (no stars selected): Button disabled state — background #E5E7EB, text #9CA3AF, cursor not-allowed.
- Active (stars selected): Full primary button — "Submit Review" + Send icon (18px) left.
```

---

## SCREEN 7 — Job Tracker / Live Status

```
Screen: Real-time service tracker for Favour.ph — shown after provider is dispatched.

HEADER (white, padding 20px, border-bottom 1.5px #E5E7EB):
- Title row: "Service Tracker" — Manrope 800, 24px, #111827. Right side: "FVR-992-AX8" — JetBrains Mono 700, 13px, background #F3F4F6, border 1.5px #E5E7EB, border-radius 4px, padding 4px 8px.
- Provider card below (margin-top 20px): background #111827, border-radius 12px, padding 16px, flex row, gap 16px, align center.
  - Avatar: 48×48px, border-radius 8px, border 1.5px #374151, grayscale image.
  - Name: "Kuya Mateo" — Manrope 800, 17px, white. Trade below: "PLUMBING PRO" — JetBrains Mono 700, 12px, #9CA3AF.
  - Right: 40×40px icon button — border 1.5px #4B5563, border-radius 8px, Phone icon 16px white.

TIMELINE (padding 20px, flex-1):
Section label: "LIVE STATUS" — JetBrains Mono 800, 11px, #4B5563, uppercase, letter-spacing 0.08em. Margin-bottom 24px.

Timeline layout: position relative, left padding 88px.
Vertical connector line: absolute, left: 103px (from outer left), top: 8px, bottom: 24px, width 2px, background #E5E7EB.

4 timeline steps (margin-bottom 32px, last: no margin):

Each step:
- Timestamp (absolute, left 0, width 72px, text-right): JetBrains Mono 700, 13px.
  - Done: #111827. Active: #0047CC. Pending: #9CA3AF.
- Node indicator (absolute, left: -20px, top: 2px, width 12px, height 12px, border-radius full, border 2px):
  - Done: border #111827, solid inner dot 6px #111827.
  - Active: border #0047CC, pulsing inner dot 6px #0047CC (animate-pulse).
  - Pending: border #E5E7EB, empty.
- Content block (padding-top 0):
  - Title: Manrope 800, 16px. Done/Pending: #111827. Active: #0047CC.
  - Description: Figtree 400, 14px, #4B5563, line-height 1.6.
  - Pending steps: opacity 0.4.
  - Active step only: extra card below content — background #EEF3FF, border 1.5px dashed #0047CC, border-radius 8px, padding 12px, margin-top 12px. Inside flex row: Navigation icon (16px, #0047CC) + "HE'S ON HIS WAY" label (Manrope 800, 13px, #0047CC, uppercase) + "14 MINS" (JetBrains Mono 800, 14px, #0047CC) right-aligned.

Steps:
1. Time: "10:00 AM" · Status: done · Title: "We've got your request" · Desc: "Finding the best pro for you."
2. Time: "10:15 AM" · Status: active · Title: "Kuya Mateo is on his way" · Desc: "He's packing his gear and heading over." · Show ETA card.
3. Time: "--:-- --" · Status: pending · Title: "Pro is at your door" · Desc: "Ready to get to work."
4. Time: "--:-- --" · Status: pending · Title: "Job well done" · Desc: "Sign off and settle payment."
```

---

## COMPONENT QUICK REFERENCE
*For regenerating individual components in isolation*

```
FAVOUR SCORE BANNER:
Dark card (#111827), padding 14px 16px, border-radius 10px. Left: large score number (JetBrains Mono 800, 32px, white) above 5 small filled white stars. Vertical divider. Right: "FAVOUR SCORE" Manrope 700 13px #9CA3AF + job count Figtree 12px #6B7280. Far right: Award icon 28px #0047CC.

VERIFIED BADGE (pill):
Background #ECFDF0, border 1.5px #A7F3C0, text #007A33. JetBrains Mono 700, 11px, height 26px. Content: "✓ FAVOUR VERIFIED"

STAT BOX TRIO:
Three equal-width white boxes (border 1.5px #E5E7EB, border-radius 10px, padding 12px 10px, text-center, flex row gap 8px). Each: value in JetBrains Mono 800 20px (accent color) + label in Manrope 700 11px uppercase + sub in Figtree 500 10px.

BOOKING REFERENCE CHIP:
Background: dark surface (#1F2937 on dark bg, #F3F4F6 on light bg). Border 1.5px. Padding 8px 14px, border-radius 8px. "REF" label in JetBrains Mono 700 11px muted + code in JetBrains Mono 800 14px primary. Gap 6px.

SERVICE ROW (selected):
Flex row, gap 12px, padding 14px 16px, border 1.5px #0047CC, border-radius 10px, background #EEF3FF. Icon box 40×40px #0047CC (white icon). Name Manrope 700 15px. Price JetBrains Mono 700 12px #0047CC. Check circle right: 22px filled #0047CC with white Check icon.

CHAT UNLOCK NOTICE:
Background #EEF3FF, border 1.5px dashed #0047CC, border-radius 10px, padding 14px 16px. MessageSquare icon 18px #0047CC + title "Chat is now unlocked" Manrope 700 14px #0047CC + body Figtree 400 13px #0047CC.

DOUBLE-BLIND NOTICE:
Background #EEF3FF, border 1.5px #D0DEFF, border-radius 10px, padding 12px 14px. Lock icon 15px #0047CC + text Figtree 400 12px #0047CC. "Double-blind review." bolded at start.

TIMELINE NODE (active):
12px circle, border 2px #0047CC, white fill, inner 6px dot #0047CC with CSS animation: pulse (opacity 0.6 to 1, 1s infinite).

REVIEW CARD:
White, border 1.5px #E5E7EB, border-radius 10px, padding 14px 16px. Avatar row: 36×36px dark square (initials JetBrains Mono 800 12px white) + name Manrope 700 14px + star row + date JetBrains Mono 700 10px #9CA3AF. Review body: Figtree 400 13px #4B5563, line-height 1.55.
```

---

## USAGE NOTES

- **For Google Stitch:** Use the Master System Prompt first, then paste each Screen prompt separately and ask Stitch to generate that screen. Reference previous screens when needed.
- **For v0.dev:** Paste the Master System Prompt + one Screen prompt together. v0 handles React so you can ask it to "make this interactive."
- **For Locofy / Figma AI:** Use the Component Quick Reference to generate individual components, then assemble screens manually.
- **Colors:** Copy the hex values exactly. Do not let the AI tool substitute or "improve" colors.
- **Fonts:** Specify "import from Google Fonts" in your prompt. If the tool doesn't support it, Manrope → any 800-weight geometric sans. JetBrains Mono → any monospaced font.
- **Cultural copy:** Always include "Kuya" and "Ate" prefixes on provider names. Use Filipino phrases ("Salamat", "Magandang araw") only on celebration/success states.
