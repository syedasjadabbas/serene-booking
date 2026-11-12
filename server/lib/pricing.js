const env = require("../config/env");
const { eachNight, toDbDate } = require("./dates");

// Pure price calculation. No I/O so it can be checked in isolation (scripts/check-pricing.js).
//
// per night, per room:  baseRate × seasonal multiplier × weekend uplift (Fri & Sat nights)
// roomSubtotal = Σ nights × rooms
// discount     = roomSubtotal × ratePlan.discountPercent
// breakfast    = breakfastPerGuest × guests × nights   (only for breakfast plans)
// tax          = (roomSubtotal − discount + breakfast) × TAX_PERCENT
// grandTotal   = roomSubtotal − discount + breakfast + tax

const isWeekendNight = (iso) => {
  const day = toDbDate(iso).getUTCDay(); // 5 = Fri, 6 = Sat
  return day === 5 || day === 6;
};

function seasonalMultiplierFor(iso, roomTypeId, seasonalRates) {
  let pct = 100;
  for (const s of seasonalRates) {
    if (s.roomTypeId && s.roomTypeId !== roomTypeId) continue;
    if (iso >= s.startDate && iso <= s.endDate) pct = Math.max(pct, s.multiplierPct);
  }
  return pct;
}

function quoteStay({ roomType, ratePlan, checkIn, checkOut, rooms, adults, children, seasonalRates = [], config = env }) {
  const nights = eachNight(checkIn, checkOut);
  const nightly = nights.map((date) => {
    const seasonal = seasonalMultiplierFor(date, roomType.id, seasonalRates);
    const weekend = isWeekendNight(date) ? 100 + config.weekendUpliftPercent : 100;
    const rate = Math.round((roomType.baseRate * seasonal * weekend) / 10_000);
    return { date, rate };
  });

  const perRoomTotal = nightly.reduce((sum, n) => sum + n.rate, 0);
  const roomSubtotal = perRoomTotal * rooms;
  const discountTotal = Math.round((roomSubtotal * (ratePlan.discountPercent || 0)) / 100);
  const breakfastTotal = ratePlan.breakfastIncluded ? ratePlan.breakfastPerGuest * (adults + children) * nights.length : 0;
  const taxable = roomSubtotal - discountTotal + breakfastTotal;
  const taxTotal = Math.round((taxable * config.taxPercent) / 100);

  return {
    currency: config.currency,
    nights: nights.length,
    rooms,
    nightly,
    roomSubtotal,
    discountTotal,
    breakfastTotal,
    taxPercent: config.taxPercent,
    taxTotal,
    grandTotal: taxable + taxTotal,
    avgNightlyPerRoom: nights.length ? Math.round((roomSubtotal - discountTotal) / nights.length / rooms) : 0,
  };
}

module.exports = { quoteStay, isWeekendNight, seasonalMultiplierFor };
