// Runnable check for the pricing and inventory rules. No database needed.
//   npm run check
const assert = require("assert/strict");
const { quoteStay, isWeekendNight } = require("../lib/pricing");
const { nightsBetween, eachNight, isValidIsoDate } = require("../lib/dates");
const { apartments } = require("../prisma/inventory");

const config = { currency: "PKR", taxPercent: 16, weekendUpliftPercent: 10 };
const roomType = { id: "rt1", baseRate: 20000 };
const flex = { discountPercent: 0, breakfastIncluded: false, breakfastPerGuest: 0 };
const saver = { discountPercent: 10, breakfastIncluded: false, breakfastPerGuest: 0 };
const bb = { discountPercent: 0, breakfastIncluded: true, breakfastPerGuest: 1500 };

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};

// 2026-11-16 is a Monday
check("dates: nights and night list", () => {
  assert.equal(nightsBetween("2026-11-16", "2026-11-19"), 3);
  assert.deepEqual(eachNight("2026-11-16", "2026-11-18"), ["2026-11-16", "2026-11-17"]);
  assert.equal(isValidIsoDate("2026-02-30"), false);
});

check("weekend nights are Fri and Sat", () => {
  assert.equal(isWeekendNight("2026-11-20"), true); // Fri
  assert.equal(isWeekendNight("2026-11-21"), true); // Sat
  assert.equal(isWeekendNight("2026-11-22"), false); // Sun
});

check("weekday stay: base × nights + tax", () => {
  const q = quoteStay({ roomType, ratePlan: flex, checkIn: "2026-11-16", checkOut: "2026-11-18", rooms: 1, adults: 2, children: 0, config });
  assert.equal(q.roomSubtotal, 40000);
  assert.equal(q.taxTotal, 6400);
  assert.equal(q.grandTotal, 46400);
});

check("weekend uplift applies per night", () => {
  const q = quoteStay({ roomType, ratePlan: flex, checkIn: "2026-11-20", checkOut: "2026-11-22", rooms: 1, adults: 2, children: 0, config });
  assert.equal(q.roomSubtotal, 44000);
});

check("saver discount and multiple rooms", () => {
  const q = quoteStay({ roomType, ratePlan: saver, checkIn: "2026-11-16", checkOut: "2026-11-17", rooms: 2, adults: 2, children: 0, config });
  assert.equal(q.roomSubtotal, 40000);
  assert.equal(q.discountTotal, 4000);
  assert.equal(q.grandTotal, Math.round(36000 * 1.16));
});

check("breakfast per guest per night", () => {
  const q = quoteStay({ roomType, ratePlan: bb, checkIn: "2026-11-16", checkOut: "2026-11-18", rooms: 1, adults: 2, children: 1, config });
  assert.equal(q.breakfastTotal, 1500 * 3 * 2);
});

check("seasonal multiplier takes the highest matching season", () => {
  const seasonalRates = [
    { roomTypeId: null, startDate: "2026-11-16", endDate: "2026-11-16", multiplierPct: 120 },
    { roomTypeId: "other", startDate: "2026-11-16", endDate: "2026-11-16", multiplierPct: 200 },
  ];
  const q = quoteStay({ roomType, ratePlan: flex, checkIn: "2026-11-16", checkOut: "2026-11-17", rooms: 1, adults: 1, children: 0, seasonalRates, config });
  assert.equal(q.roomSubtotal, 24000);
});

check("inventory: 130 unique apartments, every one typed", () => {
  assert.equal(apartments.length, 130);
  assert.equal(new Set(apartments.map((a) => a.number)).size, 130);
  assert.ok(apartments.every((a) => a.roomTypeSlug));
  assert.equal(apartments.filter((a) => a.roomTypeSlug === "terrace-apartment").length, 20);
});

console.log(`\n${passed} checks passed`);
