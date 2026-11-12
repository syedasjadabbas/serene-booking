// Demo bookings for the 130 floor-plan apartments, so availability, the price calendar and
// occupancy badges look like a live hotel. All demo data is clearly marked and removable.
//
//   npm run db:demo                       dry run: prints what would be created
//   npm run db:demo -- --apply            insert demo bookings
//   npm run db:demo -- --replace          remove existing demo bookings, then insert fresh ones
//   npm run db:demo -- --clear            remove all demo bookings (do this before going live)
//
// Options: --past=45 --future=120 (days around today)  --seed=2026 (repeatable output)
// Safety: refuses production and non-local databases unless --allow-remote is passed.
//
// Demo bookings are identified by the guest email domain DEMO_DOMAIN. They never touch real bookings
// and never overlap them (and the database exclusion constraint would reject any overlap anyway).

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { quoteStay } = require("../lib/pricing");
const { addDays, todayInHotelTz, toDbDate, fromDbDate, nightsBetween } = require("../lib/dates");

const DEMO_DOMAIN = "demo.serenebookings.test";
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};

const PAST_DAYS = opt("past", 45);
const FUTURE_DAYS = opt("future", 120);
const SEED = opt("seed", 2026);
const APPLY = flag("apply") || flag("replace");
const CLEAR = flag("clear") || flag("replace");

// ── Safety ──────────────────────────────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL || "";
const isLocalDb = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(dbUrl);
if (process.env.NODE_ENV === "production" || (!isLocalDb && !flag("allow-remote"))) {
  console.error("Refusing to run: demo bookings are for local/dev databases only (pass --allow-remote to override for a staging DB).");
  process.exit(1);
}

// ── Deterministic randomness ────────────────────────────────────────────────
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
  return pairs[pairs.length - 1][0];
};
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

const FIRST = ["Ahmed", "Ali", "Hamza", "Usman", "Bilal", "Hassan", "Omar", "Zain", "Faisal", "Imran", "Saad", "Danish", "Ayesha", "Fatima", "Zainab", "Maryam", "Hira", "Sana", "Amna", "Mahnoor", "Iqra", "Sara", "Noor", "Areeba"];
const LAST = ["Khan", "Malik", "Qureshi", "Sheikh", "Butt", "Chaudhry", "Raza", "Abbasi", "Siddiqui", "Hussain", "Javed", "Mirza", "Shah", "Awan", "Rana", "Akhtar"];
const REQUESTS = [null, null, null, null, "High floor if possible", "Late arrival", "Extra blanket", "Celebrating an anniversary", "Quiet apartment please"];
const ARRIVALS = [null, "2:00 – 3:00 PM", "3:00 – 4:00 PM", "4:00 – 5:00 PM", "6:00 – 8:00 PM", "8:00 – 10:00 PM"];
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const prisma = new PrismaClient();

async function clearDemo() {
  const { count } = await prisma.booking.deleteMany({ where: { guestEmail: { endsWith: `@${DEMO_DOMAIN}` } } }); // BookingRoom rows cascade
  console.log(`Removed ${count} demo bookings.`);
}

async function main() {
  if (CLEAR) await clearDemo();
  if (flag("clear") && !flag("replace")) return;

  const today = todayInHotelTz();
  const from = addDays(today, -PAST_DAYS);
  const to = addDays(today, FUTURE_DAYS);
  const now = Date.now();

  const [rooms, types, plans, seasons, held, existingRefs] = await Promise.all([
    prisma.room.findMany({ where: { isActive: true }, select: { id: true, number: true, roomTypeId: true }, orderBy: [{ floor: "asc" }, { number: "asc" }] }),
    prisma.roomType.findMany({ select: { id: true, name: true, baseRate: true, maxAdults: true, maxChildren: true, maxOccupancy: true } }),
    prisma.ratePlan.findMany({ where: { isActive: true }, select: { id: true, code: true, discountPercent: true, breakfastIncluded: true, breakfastPerGuest: true } }),
    prisma.seasonalRate.findMany({ select: { roomTypeId: true, startDate: true, endDate: true, multiplierPct: true } }),
    // Real (and any remaining) holds in the window, so demo stays never overlap them.
    prisma.bookingRoom.findMany({
      where: { active: true, checkIn: { lt: toDbDate(to) }, checkOut: { gt: toDbDate(from) } },
      select: { roomId: true, checkIn: true, checkOut: true },
    }),
    prisma.booking.findMany({ select: { reference: true } }),
  ]);
  if (!rooms.length || !plans.length) throw new Error("No inventory found. Run `npm run db:setup` first.");

  const typeById = new Map(types.map((t) => [t.id, t]));
  const planByCode = new Map(plans.map((p) => [p.code, p]));
  const seasonal = seasons.map((s) => ({ ...s, startDate: fromDbDate(s.startDate), endDate: fromDbDate(s.endDate) }));
  const inSeason = (d) => seasonal.some((s) => d >= s.startDate && d <= s.endDate);
  const isWeekend = (d) => [5, 6].includes(toDbDate(d).getUTCDay());

  const heldByRoom = new Map();
  for (const h of held) {
    if (!heldByRoom.has(h.roomId)) heldByRoom.set(h.roomId, []);
    heldByRoom.get(h.roomId).push([fromDbDate(h.checkIn), fromDbDate(h.checkOut)]);
  }
  const overlapsHeld = (roomId, ci, co) => (heldByRoom.get(roomId) || []).some(([a, b]) => ci < b && co > a);

  const refs = new Set(existingRefs.map((r) => r.reference));
  const newRef = () => {
    let r;
    do r = "SH-" + Array.from(crypto.randomBytes(6), (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
    while (refs.has(r));
    refs.add(r);
    return r;
  };

  const bookings = [];
  const bookingRooms = [];
  let guestNo = 0;

  for (const room of rooms) {
    const type = typeById.get(room.roomTypeId);
    let d = from;
    while (d < to) {
      // Chance that a stay starts tonight: busier at weekends and in peak seasons.
      const p = inSeason(d) ? 0.42 : isWeekend(d) ? 0.34 : 0.17;
      if (rand() >= p) {
        d = addDays(d, 1);
        continue;
      }
      const nights = weighted([[1, 22], [2, 34], [3, 22], [4, 11], [5, 6], [7, 5]]);
      const checkIn = d;
      const checkOut = addDays(d, nights);
      if (checkOut > to || overlapsHeld(room.id, checkIn, checkOut)) {
        d = addDays(d, 1);
        continue;
      }

      const past = checkOut <= today;
      const status = past
        ? weighted([["COMPLETED", 86], ["CANCELLED", 10], ["NO_SHOW", 4]])
        : weighted([["CONFIRMED", 92], ["CANCELLED", 8]]);
      const plan = planByCode.get(weighted([["FLEX", 50], ["FLEX_BB", 30], ["SAVER", 20]])) ?? plans[0];
      const adults = Math.min(type.maxAdults, weighted([[1, 15], [2, 70], [3, 15]]));
      const children = Math.min(type.maxChildren, Math.max(0, type.maxOccupancy - adults), weighted([[0, 60], [1, 25], [2, 15]]));
      const quote = quoteStay({ roomType: type, ratePlan: plan, seasonalRates: seasonal, checkIn, checkOut, rooms: 1, adults, children });

      // Booked 1–40 days ahead, but never within the last 3 days (keeps "booked in last 24h" honest).
      const leadDays = int(1, 40);
      const createdMs = Math.min(toDbDate(checkIn).getTime() - leadDays * 86400_000, now - int(3, 12) * 86400_000 - int(0, 86_399) * 1000);
      const createdAt = new Date(createdMs);

      const first = pick(FIRST);
      const last = pick(LAST);
      guestNo += 1;
      const id = crypto.randomUUID();
      const cancelled = status === "CANCELLED";

      bookings.push({
        id,
        reference: newRef(),
        customerId: null,
        roomTypeId: type.id,
        ratePlanId: plan.id,
        checkIn: toDbDate(checkIn),
        checkOut: toDbDate(checkOut),
        nights: nightsBetween(checkIn, checkOut),
        roomsCount: 1,
        adults,
        children,
        status,
        guestFirstName: first,
        guestLastName: last,
        guestEmail: `${first}.${last}.${guestNo}@${DEMO_DOMAIN}`.toLowerCase(),
        guestPhone: `+92 000 ${String(guestNo).padStart(7, "0")}`, // clearly fake number range
        guestCountry: "Pakistan",
        arrivalTime: pick(ARRIVALS),
        specialRequests: pick(REQUESTS),
        currency: quote.currency,
        roomSubtotal: quote.roomSubtotal,
        discountTotal: quote.discountTotal,
        breakfastTotal: quote.breakfastTotal,
        taxTotal: quote.taxTotal,
        grandTotal: quote.grandTotal,
        nightlyBreakdown: quote.nightly,
        paymentMethod: "PAY_AT_PROPERTY",
        paymentStatus: status === "COMPLETED" ? "PAID" : "UNPAID",
        cancelledAt: cancelled ? new Date(Math.min(createdMs + int(1, 10) * 86400_000, now - 86400_000)) : null,
        cancelReason: cancelled ? pick(["Change of plans", "Travel dates changed", "Weather", null]) : null,
        createdAt,
        updatedAt: createdAt,
      });
      bookingRooms.push({
        id: crypto.randomUUID(),
        bookingId: id,
        roomId: room.id,
        checkIn: toDbDate(checkIn),
        checkOut: toDbDate(checkOut),
        active: !cancelled, // cancelled stays release the apartment
      });

      // Next stay can start on checkout day (back-to-back) or after a gap.
      d = addDays(checkOut, weighted([[0, 45], [1, 25], [2, 15], [3, 15]]));
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const byStatus = bookings.reduce((m, b) => ((m[b.status] = (m[b.status] || 0) + 1), m), {});
  const occ = (startOffset, days) => {
    let taken = 0;
    for (let i = 0; i < days; i++) {
      const night = addDays(today, startOffset + i);
      taken += bookingRooms.filter((br) => br.active && fromDbDate(br.checkIn) <= night && fromDbDate(br.checkOut) > night).length;
    }
    return Math.round((taken / (rooms.length * days)) * 100);
  };
  console.log(`Demo window ${from} → ${to} (seed ${SEED}) across ${rooms.length} apartments`);
  console.log(`  bookings: ${bookings.length}  ${JSON.stringify(byStatus)}`);
  console.log(`  demo occupancy  next 7 nights: ${occ(0, 7)}%   next 30 nights: ${occ(0, 30)}%   last 30 nights: ${occ(-30, 30)}%`);

  if (!APPLY) {
    console.log("\nDry run: nothing written. Re-run with --apply (or --replace) to insert.");
    return;
  }

  const CHUNK = 500;
  await prisma.$transaction(
    async (tx) => {
      for (let i = 0; i < bookings.length; i += CHUNK) await tx.booking.createMany({ data: bookings.slice(i, i + CHUNK) });
      for (let i = 0; i < bookingRooms.length; i += CHUNK) await tx.bookingRoom.createMany({ data: bookingRooms.slice(i, i + CHUNK) });
    },
    { timeout: 120_000 }
  );
  console.log(`\nInserted ${bookings.length} demo bookings. Remove them any time with: npm run db:demo -- --clear`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
