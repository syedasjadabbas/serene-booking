<div align="center">

<img src="client/public/brand/logo-green-tight.png" alt="Serene Heights Hotels & Resorts" width="150" />

# Serene Bookings

**Direct booking platform for Serene Heights, Nathia Gali**: Pakistan's first winter resort at 7,906 ft.

Search live availability, compare apartment types and rates, book in minutes and manage the stay online.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)

</div>

<br />

<img src="client/public/images/resort/hero-tower-mist.jpg" alt="Serene Heights tower rising above the pines and mist" width="100%" />

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Deploy to Vercel](#deploy-to-vercel)
- [Serving inside the Serene Heights Group site](#serving-inside-the-serene-heights-group-site-booking)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Engineering notes](#engineering-notes)
- [Quality checks](#quality-checks)
- [Content & placeholders](#content--placeholders)
- [Roadmap](#roadmap)

---

## Overview

Serene Bookings is the **guest-facing website** for Serene Heights Hotels & Resorts, Nathia Gali. It brings Booking.com / Hilton-style booking to a single property:

- **130 one-bedroom hotel apartments**, transcribed from the official floor plans and grouped into **5 bookable apartment types**
- **Live availability and pricing** with seasonal and weekend rates and three rate plans
- **Book without an account** (or with one), pay at the property, and cancel online on flexible rates

Administration (rates, inventory, booking operations) lives in **Serene Management**, a separate CRM. This repository is the **user panel** and follows the same conventions as that CRM, so the two can share data. Every booking change is written to an `Outbox` table for Serene Management to pick up.

---

## Features

### For guests

| | |
| --- | --- |
| 🔎 **Search & availability** | Date range picker that shows the nightly price on each day and blocks sold-out nights; guests and apartments selector; live availability per apartment type. |
| 🧭 **Results** | Filter sidebar with live counts (free cancellation, breakfast, budget, balcony/terrace, size, sleeps) and sort chips. The meal and cancellation filters change the price shown. Urgency badges use real data only ("Only 2 left", "73% booked", "N booked in 24 h"). |
| 🏔️ **Apartment pages** | Photo grid with a full-screen lightbox, sticky section navigation, a rates table with "I'll reserve" on each row, facilities, every apartment of the type with its floor and area, floor plans, house rules, map and reviews. |
| 🧾 **Checkout** | Progress steps, guest details, arrival time, special requests, a price breakdown (nightly, discount, breakfast, tax) and the payment UI. |
| ✅ **Manage booking** | Confirmation page with print, free-cancellation deadline and online cancellation. Guests find bookings by reference + email; customers see upcoming, past and cancelled stays. |
| 👤 **Accounts** | Register, sign in, profile, change password (signs out other devices), and reviews after a completed stay. |
| 🗺️ **Content pages** | Amenities (bento grid, grouped facilities, gallery), interactive floor plans, and location & contact (journey timeline, map, FAQ). |

### Experience

- **Design:** inset rounded hero panels, pill-shaped controls, Plus Jakarta Sans, a forest-green and lime palette taken from the Serene Heights brand.
- **Cinematic hero:** the home page opens on the resort's 3D flythrough, played by scrolling. The hero insets into a framed card, then five chapters scrub past (arrival, rooftop, winter, play, stay) with captions and a booking shortcut. The frames are WebP stills drawn on a canvas with crossfades, loaded after the page in coarse-to-fine order. Phones get a lighter portrait set, data-saver gets every 4th frame, and reduced motion gets a still.
- **Motion:** scroll reveals, staggered grids, 3D pointer-tilt cards, parallax and slow-zoom imagery, count-up stats, page transitions. All hand-built (no animation library) and all switched off for users who prefer reduced motion.
- **Responsive:** checked at 320 px, 375 px and desktop widths, with no horizontal overflow.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| **Web** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3 |
| **State & data** | Redux Toolkit **RTK Query** (server data), Zustand (auth & session state), React Hook Form + Zod |
| **UI** | lucide-react icons, react-day-picker, date-fns, `next/image` (AVIF/WebP) |
| **API** | Node.js 20+, Express 4, Zod validation, Helmet, CORS, express-rate-limit, Pino logging |
| **Database** | PostgreSQL with Prisma 6 (migrations + seed) |
| **Auth** | JWT access tokens + rotating, hashed refresh tokens in an httpOnly cookie |
| **Cache** | In-memory stale-while-revalidate cache (Redis optional via `REDIS_URL`) |

---

## Architecture

```
 Browser ──► Next.js (client/, :3000)
               │  /api/v1/*  ── rewrite (same-origin, cookie-friendly)
               ▼
            Express API (server/, :4000)
               route → auth → rate limit → zod validation → controller → service → Prisma
               ▼
            PostgreSQL  ── Booking / BookingRoom (exclusion constraint) / Outbox / AuditLog
                              │
                              └─► Outbox ► Serene Management (admin CRM, separate project)
```

- **Thin controllers, logic in services.** Every route validates its input with Zod, and errors are thrown as `AppError` and handled by one global handler.
- **Responses** always use the envelope `{ success, message, data }`.
- **The client never calls `fetch` in components.** One RTK Query `baseApi` handles a single in-flight refresh on 401, a retry on 429/503, and unwrapping the envelope. Endpoints are injected per feature.
- **URL is the source of truth for search state** (`checkIn`, `checkOut`, `adults`, `children`, `rooms`, plus filters), so searches are shareable, refresh-safe and work with the back button.

---

## Getting started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL 14+** (tested on 18)
- Redis is **optional**

### 1. Clone & install

```bash
git clone https://github.com/syedasjadabbas/serene-booking.git
cd serene-booking
cd server && npm install && cd ../client && npm install && cd ..
```

### 2. Configure the API

```bash
cp server/.env.example server/.env
```

Set `DATABASE_URL` (your Postgres credentials) and a long random `JWT_ACCESS_SECRET` in `server/.env`. See [Configuration](#configuration).

### 3. Create the database, migrate and seed

```bash
cd server
npm run db:setup     # creates serene_booking if needed, applies migrations, seeds inventory
```

The seed loads 5 apartment types, 130 apartments, 3 rate plans and 2 seasons. It is idempotent, so you can re-run it safely.

Optional: fill the calendar with realistic demo occupancy (around 3,400 stays, removable with `--clear`):

```bash
npm run db:demo -- --apply
```

Demo guests use the `@demo.serenebookings.test` email domain and fake `+92 000` phone numbers.

### 4. Run

```bash
# terminal 1 — API on http://localhost:4000/api/v1
cd server && npm run dev

# terminal 2 — web on http://localhost:3000
cd client && npm run dev
```

> **Windows note:** if the project path contains `&` (e.g. `WEBS & APPS`), npm's `.bin` shims break. All npm scripts therefore call `node ./node_modules/...` directly; keep that pattern when adding scripts.

---

## Deploy to Vercel

Two Vercel projects from this one repository, plus a managed Postgres database:

| Vercel project | Root directory | Framework preset | Serves |
| --- | --- | --- | --- |
| `serene-booking-api` | `server` | Other | Express API as a serverless function (`server/api/index.js`, `server/vercel.json`) |
| `serene-booking-web` | `client` | Next.js | The website; it proxies `/api/v1/*` to the API, so cookies stay first-party |
| Postgres | — | — | [Neon](https://neon.tech), available in the Vercel Marketplace (free tier available) |

> Put Neon and both Vercel projects in the **same region** (e.g. Singapore `sin1` / AWS ap-southeast-1, or Frankfurt `fra1` / eu-central-1). Set it in Vercel under **Project → Settings → Functions → Region**.

### 1. Create the database (Neon)

Create a Neon project and copy **two** connection strings:

- **Pooled** (the host contains `-pooler`): used by the API on Vercel. Append `&pgbouncer=true&connection_limit=1`.
- **Direct** (no `-pooler`): used only from your machine for migrations.

### 2. Migrate and seed from your machine (direct URL)

```bash
cd server
# PowerShell:  $env:DATABASE_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"
# bash:        export DATABASE_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"
npm run db:migrate            # creates tables + the no-double-booking constraint
npm run db:seed               # dry run: shows what will be created
npm run db:seed -- --apply    # 5 apartment types, 130 apartments, rate plans, seasons
```

Do **not** add demo bookings to the live database. `db:demo` refuses non-local databases anyway.

### 3. Generate two secrets

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run it twice: once for `JWT_ACCESS_SECRET` and once for `PROXY_SECRET`.

### 4. API project (`server`)

Vercel → **Add New → Project** → import the repo → **Root Directory: `server`**, Framework: **Other**. Add these environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** URL `…?sslmode=require&pgbouncer=true&connection_limit=1` |
| `JWT_ACCESS_SECRET` | secret #1 |
| `PROXY_SECRET` | secret #2 (must match the website) |
| `CLIENT_ORIGIN` | the website URL (fill in after step 5, then redeploy) |
| *(optional)* `TAX_PERCENT`, `WEEKEND_UPLIFT_PERCENT`, `PAYMENTS_ENABLED`… | see [Configuration](#configuration) |

Deploy, then open `https://<api-project>.vercel.app/api/v1/health`. It should return `{"success":true,...}`.

### 5. Website project (`client`)

Vercel → **Add New → Project** → same repo → **Root Directory: `client`**, Framework: **Next.js**. Add these environment variables:

| Variable | Value |
| --- | --- |
| `API_URL` | `https://<api-project>.vercel.app` (**required**: the build fails without it) |
| `PROXY_SECRET` | secret #2 (same as the API) |
| `SITE_URL` | `https://<web-project>.vercel.app` or your custom domain |

Deploy, then set the API's `CLIENT_ORIGIN` to this URL and **redeploy the API**.

### 6. Go-live checklist

- [ ] Search, book, find booking and cancel work on the live URL
- [ ] Real nightly rates, policies and WhatsApp number confirmed (see [placeholders](#content--placeholders))
- [ ] Custom domain added to the website project, then `SITE_URL` and `CLIENT_ORIGIN` updated to it
- [ ] `PAYMENTS_ENABLED` stays `false` until a gateway is integrated

**Serverless notes:** each API function instance keeps its own in-memory cache, which is fine at hotel scale. Add `REDIS_URL` if you later need a shared cache. Rate limits are per instance and keyed on the real visitor IP via `PROXY_SECRET`.

---

## Serving inside the Serene Heights Group site (`/booking`)

The website is built with `basePath: "/booking"` so it can live at **sereneheightsgroup.com/booking** while
staying its own repo and Vercel project (Next.js Multi-Zones). The group site rewrites `/booking` and
`/booking/:path*` to this deployment (`BOOKING_ORIGIN` in the group site's Vercel settings).

| What | Under `/booking` |
|---|---|
| Pages and links | `next/link`, the router and `_next` assets get the prefix automatically |
| Images, icons | go through `asset()` in `client/global/lib/asset.ts` (Next does not prefix string `src`) |
| API | the browser calls `/booking/api/v1/…`; `next.config.mjs` rewrites it to `API_URL` |
| Refresh cookie | set on `/booking/api/v1/auth` (`AUTH_COOKIE_PATH`) so the browser sends it back |
| This app's own domain | `/` redirects to `/booking` |

`npm run check` (server) includes `check-base-path.js`, which fails if the website base path and the cookie
path ever disagree. To run the site at its root again, set `NEXT_PUBLIC_BASE_PATH=` (empty) on the website
and `AUTH_COOKIE_PATH=/api/v1/auth` on the API.

**Deploy order:** API → website (both as below) → group site with `BOOKING_ORIGIN` set to the website's URL.
On the API, add the group domain to `CLIENT_ORIGIN` (comma-separated) and keep `AUTH_COOKIE_PATH` at its default.

## Configuration

`server/.env` (copy from `server/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | none | Postgres connection string. Add `&connection_limit=N` to size the pool. |
| `PORT` | `4000` | API port |
| `JWT_ACCESS_SECRET` | none | **Required in production.** Signs access tokens. |
| `ACCESS_TOKEN_TTL` | `15m` | Access-token lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh-session lifetime |
| `SINGLE_SESSION_PER_PLATFORM` | `true` | One active session per customer per platform |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin(s), comma-separated |
| `REDIS_URL` | *(empty)* | Optional shared cache; in-memory if empty |
| `CURRENCY` | `PKR` | Display/booking currency |
| `TAX_PERCENT` | `16` | Tax applied to stays |
| `WEEKEND_UPLIFT_PERCENT` | `10` | Friday & Saturday night uplift |
| `MAX_STAY_NIGHTS` | `30` | Longest online stay |
| `MAX_ROOMS_PER_BOOKING` | `5` | Apartments per booking |
| `PAYMENTS_ENABLED` | `false` | Enables online payment methods (gateway not yet connected) |
| `REVIEWS_ENABLED` | `true` | Allows reviews after completed stays |
| `PROXY_SECRET` | *(empty)* | Shared with the website so the API trusts the forwarded visitor IP (rate limits, audit). **Required on Vercel.** |
| `RATE_LIMIT_LOCAL` | `false` | Dev only: when `false`, requests from this machine skip rate limits (so tests can be repeated). Production always rate-limits. |

`client/.env.local` (optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_URL` | `http://localhost:4000` | Where Next.js proxies `/api/v1/*`. **Required on Vercel** (the build fails without it). |
| `SITE_URL` | Vercel production domain, else `http://localhost:3000` | Public URL for share previews and canonical links |
| `PROXY_SECRET` | *(empty)* | Same value as the API's `PROXY_SECRET` |

---

## Scripts

**server/**

| Command | What it does |
| --- | --- |
| `npm run dev` | API with file watching (source folders only) |
| `npm start` | API in production mode |
| `npm run db:setup` | Apply migrations + seed (writes) |
| `npm run db:migrate` | Apply migrations only (`prisma migrate deploy`) |
| `npm run db:seed` | **Dry run:** shows what the seed would create or update. Add `-- --apply` to write (one transaction, idempotent). Production also needs `--yes`. |
| `npm run db:demo -- --apply` | Add **demo bookings** across the 130 floor-plan apartments (past 45 + next 120 days, busier at weekends and in peak seasons) so availability and occupancy look live. Dry run without flags; `--replace` regenerates; **`--clear` removes them all, so run it before going live.** Local databases only. |
| `npm run check` | Pricing, inventory and data-scope checks (no database needed) |
| `npm run smoke -- --yes` | End-to-end API test against a **local** server: booking flow and race, guest lookup, data scope, reviews, profile and session rules. It creates and then cancels test bookings, and refuses any non-localhost URL. |

**client/**

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server on :3000 |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `scripts/make-cinematic-frames.ps1 -In <video> -Out public/images/cinematic` | Rebuild the hero film frames from the 3D animation (needs ffmpeg). Chapter times are at the top of the script. If you change the frame counts, update `CHAPTERS` in `app/_components/CinematicFilm.tsx`. |

---

## Project structure

```
serene-booking/
├── client/                         # Next.js user panel
│   ├── app/
│   │   ├── page.tsx                # Home
│   │   ├── template.tsx            # Page transitions
│   │   ├── rooms/                  # Search results  ·  rooms/[slug] apartment page
│   │   ├── book/                   # Checkout
│   │   ├── booking/[reference]/    # Confirmation & manage
│   │   ├── manage/ account/ login/ register/
│   │   └── amenities/ floor-plans/ contact/
│   ├── global/
│   │   ├── api/                    # baseApi, endpoints/<feature>Api.ts, types
│   │   ├── components/             # SearchBar, PriceCalendar, PageHero, Lightbox, motion …
│   │   ├── lib/  stores/  constants/
│   └── public/
│       ├── brand/                  # Official logo & mark
│       └── images/                 # resort/ dining/ activities/ floor-plans/
│
└── server/                         # Express API
    ├── app.js  server.js
    ├── config/                     # env, prisma client
    ├── lib/                        # pricing, scope, dates, cache, sessions, jwt, audit, validate …
    ├── middlewares/                # auth, rate limits, error handler
    ├── modules/<feature>/          # routes · validators · controller · service
    │   └── auth · property · rooms · bookings · reviews
    ├── prisma/                     # schema, migrations, inventory.js, seed.js
    └── scripts/                    # check-pricing.js, smoke-api.js
```

---

## API reference

Base URL: `/api/v1`. All responses use the envelope `{ success, message, data }`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/property` | none | Property content, amenities, floors, gallery, stats |
| `GET` | `/property/config` | none | Public config (currency, tax, limits, feature flags) |
| `GET` | `/rooms` | none | Apartment types with inventory stats |
| `GET` | `/rooms/availability` | none | Availability + every rate plan's price for a stay |
| `GET` | `/rooms/calendar` | none | Nightly lowest price & availability for a date window |
| `GET` | `/rooms/:slug` | none | Apartment type detail, apartments, floors, rate plans |
| `GET` | `/rooms/:slug/rates` | none | Live quotes per rate plan for a stay |
| `POST` | `/bookings` | Optional | Create a booking (guest or signed in) |
| `POST` | `/bookings/lookup` | none | Find a booking by reference + email |
| `POST` | `/bookings/:reference/cancel` | Owner or email | Cancel a booking |
| `GET` | `/bookings/mine` | Required | Customer's bookings (`upcoming` / `past` / `cancelled`) |
| `GET` | `/bookings/mine/:reference` | Required | One of the customer's bookings |
| `GET` | `/reviews` | none | Published reviews + score summary |
| `POST` | `/reviews` | Required | Review a completed stay |
| `POST` | `/auth/register` · `/auth/login` | none | Create account / sign in (sets refresh cookie) |
| `POST` | `/auth/refresh` · `/auth/logout` | Cookie | Rotate session / sign out |
| `GET` `PATCH` | `/auth/me` | Required | Profile |
| `POST` | `/auth/change-password` | Required | Change password (revokes other sessions) |

Stay parameters: `checkIn`, `checkOut` (`YYYY-MM-DD`, hotel time zone), `adults`, `children`, `rooms`.

---

## Data model

| Model | Purpose |
| --- | --- |
| `RoomType` | Bookable apartment type (name, occupancy, base rate, features, images) |
| `Room` | A physical apartment (number, floor, area, outdoor space) |
| `RatePlan` | Flexible, Flexible with breakfast, Non-refundable saver |
| `SeasonalRate` | Date-range price multipliers (all types or one type) |
| `Booking` | Stay, guest, totals, nightly breakdown, payment & status |
| `BookingRoom` | Apartment held by a booking for its dates |
| `Customer` · `Session` | Accounts and hashed, rotating refresh sessions |
| `Review` | One per completed stay |
| `AuditLog` · `Outbox` | Security audit trail · events for Serene Management |

---

## Engineering notes

- **No double bookings, even under races.** Free apartments are locked with `FOR UPDATE SKIP LOCKED`, and a Postgres **exclusion constraint** on `BookingRoom` (`daterange` overlap, active rows only) makes overlapping holds impossible at the database level. The smoke test fires 6 parallel bookings at the 4 corner suites; exactly 4 succeed.
- **One data-scope rule** (`server/lib/scope.js`): every query that reads or changes a booking or review merges `bookingScope(actor)` into its `where`. A customer sees only their own bookings; a guest proves ownership with the booking email; anything else matches nothing. Out-of-scope bookings return 404, so references can't be probed.
- **Pricing is a pure function** (`server/lib/pricing.js`): base rate × seasonal multiplier × weekend uplift per night, then rate-plan discount, breakfast per guest per night, and tax.
- **Availability is aggregated in SQL** (grouped counts, `generate_series` for the calendar). Rows are never loaded into JS to be counted.
- **Caching:** stale-while-revalidate with single-flight for reads such as room types, rate plans, the calendar and property content. Every query parameter is part of the cache key.
- **Security:**
  - Rate limits on auth, booking and lookup.
  - Booking lookup is a `POST`, so emails never appear in URLs.
  - Guest bookings are not auto-linked to new accounts, because emails are unverified.
  - Open-redirect-safe `next` parameters.
  - Card fields in the payment preview are disabled and never submitted.
- **Accessibility:**
  - Semantic landmarks, labelled controls and visible focus rings.
  - Keyboard-operable popovers, dialogs and lightbox.
  - `prefers-reduced-motion` respected throughout.

---

## Quality checks

```bash
cd server && npm run check            # 8 pricing & inventory + 6 data-scope checks
cd server && npm run smoke -- --yes   # 20 end-to-end API checks (local server must be running)
cd client && npm run typecheck        # TypeScript
```

---

## Content & placeholders

- **Content sources:**
  - Property content comes from the official site, [sereneheightsnathiagali.com](https://www.sereneheightsnathiagali.com/nathiagali).
  - Imagery comes from the official Serene Heights 3D renders and animation frames.
  - Apartments and areas are transcribed from the published floor plans (`server/prisma/inventory.js`).

The following are **sensible defaults awaiting confirmation** from Serene Heights management:

- Nightly base rates per apartment type, breakfast price, saver discount, seasons, tax and weekend uplift
- Occupancy limits and the sofa bed in the sitting room
- Check-in / check-out times and the child, pet, smoking and ID policies (`server/modules/property/property.data.js`)
- The current WhatsApp number (the official site shows two different numbers)
- Areas for the 5th-floor apartments (501–504), which are not printed on the plans
- **Apartment interior renders.** None are published yet; add them first in each type's `images` in `server/prisma/seed.js`.

---

## Roadmap

- [ ] Connect to **Serene Management** (worker that processes the `Outbox`)
- [ ] Confirmation & reminder **emails / WhatsApp**
- [ ] **Forgot password** and email verification
- [ ] **Payment gateway** (cards, JazzCash, Easypaisa)
- [ ] Change dates on an existing booking
- [ ] Promo codes, Urdu localisation
- [ ] Production deployment (hosting, domain, HTTPS)

---

<div align="center">

**Serene Bookings** · Serene Heights Hotels & Resorts, Nathia Gali

© Serene Heights Nathia Gali. All rights reserved.

</div>
