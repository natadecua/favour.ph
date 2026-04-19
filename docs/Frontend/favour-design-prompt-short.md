# Favour.ph — Short Design Prompt

## One-liner
Mobile home services booking app for the Philippines. Flat, mature, utility-grade. No gradients, no shadows, no blur.

---

## Colors
- Primary: #0047CC (blue)
- Dark: #111827 (near-black)
- Text muted: #4B5563
- Border: #E5E7EB
- Background: #F3F4F6
- White: #FFFFFF
- Green (verified): #007A33
- Blue tint (banners): #EEF3FF

---

## Fonts
- **Manrope 800** — headings, names, buttons, large numbers
- **Figtree 400–600** — body text, descriptions
- **JetBrains Mono 700** — prices, codes, distances, ALL CAPS labels

---

## Rules
- All borders: 1.5px solid
- Cards: white, 1.5px #E5E7EB border, 12px radius
- Buttons: 52px tall, 10px radius, Manrope 800 17px
- Field labels: JetBrains Mono, 11px, ALL CAPS, #9CA3AF
- Avatars: rounded rectangle (never circular), 10–12px radius
- Prices always in JetBrains Mono: "PHP 700.00"
- Provider names always prefixed: "Kuya Mateo" or "Ate Sarah"

---

## Key Components

**Favour Score banner** — dark (#111827) card, big white mono number (4.97), 5 white stars below it, "FAVOUR SCORE" label right side, Award icon in blue.

**Verified badge** — green pill: "✓ FAVOUR VERIFIED", background #ECFDF0, border #A7F3C0, text #007A33.

**Selected service card** — blue border (#0047CC), blue tint background (#EEF3FF), icon box filled blue with white icon, blue checkmark circle on right.

**CTA button** — full width, #0047CC, white Manrope 800 text, 52px, 10px radius.

---

## Screens to Generate

### Auth
Dark logo box + "FAVOUR.PH" (blue .PH) + phone input with +63 prefix + "Send Secure Code" blue button + small trust note with shield icon at bottom.

### Home Feed
Dark header (#111827) with location + search bar. White 4-icon category row (Aircon, Plumbing, Electrical, Cleaning). Provider cards below: avatar + name + trade + star rating + distance chip in blue.

### Provider Profile
Back nav → hero (avatar with green verified dot + name + pills + Favour Score dark banner + 3 stat boxes) → bio section → service selector rows → photo grid → reviews → sticky blue Book button.

### Booking Form
"Book a service" heading → 2-col service tile grid (one selected in blue) → address input → time input → "Find a Worker" blue CTA.

### Booking Confirmed
Dark green header with checkmark + "Booking Confirmed!" + reference code (FVR-992-AX8) → provider mini card → booking details card → dashed blue "Chat is now unlocked" banner → "Open Chat" button.

### Leave a Review
Provider mini card → large 5-star selector (filled black when selected) → text area → dashed blue lock notice ("double-blind review") → "Submit Review" CTA (disabled until stars selected).

---

## Vibe Reference
Think: Grab meets a Philippine hardware store. Confident, no-nonsense, warm Filipino copy. Clean like Linear, structured like a field ops tool.
