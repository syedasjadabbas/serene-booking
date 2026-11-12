# Serene Booking

Guest-facing booking website for **Serene Heights Nathia Gali**: Booking.com / Hilton-style search, rates, checkout and "manage my booking", for a single property.
Admin (rates, inventory, booking operations) lives in **Serene Management**, a separate project. This repo is the user panel only.

It follows the same conventions as the Serene Management CRM: Express + Prisma + Postgres modules on the server, and Next.js App Router + RTK Query + Tailwind on the client.

## Run it locally

Prerequisites: Node 20+, PostgreSQL (Redis optional).

```bash
# 1. Database
#    In psql or pgAdmin:  CREATE DATABASE serene_booking;
#    Then put your Postgres password into server/.env -> DATABASE_URL

# 2. API (http://localhost:4000/api/v1)
cd server
npm install
npm run db:setup      # applies migrations + seeds 130 apartments, 5 apartment types, 3 rate plans
npm run check         # pricing + inventory checks (no DB needed)
npm run dev

# 3. Website (http://localhost:3000)
cd ../client
npm install
npm run dev
```

The folder path contains `&` (`WEBS & APPS`), which breaks npm's Windows `.bin` shims. Because of that, the npm scripts call `node ./node_modules/...` directly. Keep that pattern when adding scripts.

## What's in the user panel

| Page | Route |
| --- | --- |
| Home: hero search, highlights, apartment types, experiences, reviews, location | `/` |
| Search results with live availability, sort and filters (all in the URL) | `/rooms?checkIn&checkOut&adults&children&rooms` |
| Apartment type: gallery, facts, apartments on each floor, floor plans, house rules, live rates | `/rooms/[slug]` |
| Checkout: guest details, arrival time, requests, payment UI, price breakdown | `/book` |
| Confirmation / manage / cancel / print | `/booking/[reference]` |
| Find a booking as a guest (reference + email) | `/manage` |
| Sign in, register | `/login`, `/register` |
| My bookings (upcoming / past / cancelled), write a review | `/account` |
| Profile and password | `/account/profile` |
| Amenities, floor plans, location & contact | `/amenities`, `/floor-plans`, `/contact` |

## How the important parts work

- **Inventory:** 130 one-bedroom apartments transcribed from the official floor plans (`server/prisma/inventory.js`), grouped by size into 5 bookable types.
- **Availability:** computed in SQL per type (`rooms.service.js`). A booking locks free apartments with `FOR UPDATE SKIP LOCKED`, and a Postgres **exclusion constraint** (`booking_room_no_overlap`) makes double-booking an apartment impossible, even under races.
- **Pricing:** a pure function (`server/lib/pricing.js`): base rate × seasonal multiplier × weekend uplift, then rate-plan discount, breakfast and tax. It is checked by `npm run check`.
- **Auth:** a 15-minute JWT access token held in memory, and a rotating refresh token in an httpOnly cookie, stored hashed. Sessions are checked on every request and cached. One session per customer per platform (`SINGLE_SESSION_PER_PLATFORM`).
- **Guests can book without an account** and manage the booking with its reference + email. The lookup is a POST, so the email never appears in a URL.
- **Payments:** UI only. Card, bank and wallet options are visible but disabled until `PAYMENTS_ENABLED=true` and a gateway is connected. Card fields are never sent anywhere.
- **Serene Management hand-off:** every booking and cancellation writes an `Outbox` row (`booking.created`, `booking.cancelled`) for a future worker to sync. Security-relevant actions write `AuditLog` rows.

## Placeholders to confirm with management

These are **not published on the official site** and were filled with reasonable defaults:

- Nightly base rates per type (`server/prisma/seed.js`): Rs 18,000 / 22,000 / 26,000 / 34,000 / 30,000
- Breakfast price (Rs 1,500 per guest per night), saver discount (10%), free-cancel window (48 h)
- Seasons: snow season ×1.15, summer peak ×1.25; weekend uplift 10%; tax 16% (`server/.env`)
- Occupancy limits and the sofa bed in the sitting room
- Check-in 2:00 PM / check-out 12:00 PM, and the child, pet, smoking and ID policies (`server/modules/property/property.data.js`)
- WhatsApp number: the site shows +92 300 8497999, but its links point to +92 321 4979447
- **Photos:** the site has no apartment interior photos, so apartment types use the building renders and their floor plan. Add interior photos to `client/public/images` and to `images` in the seed.
- 5th-floor apartments (501–504) have no printed areas on the floor plan.

## Layout

```
server/  app.js · config/ · lib/ · middlewares/ · modules/{auth,property,rooms,bookings,reviews} · prisma/ · scripts/
client/  app/<route>/{page.tsx,_components,_lib} · global/{api,components,lib,stores,constants}
```
