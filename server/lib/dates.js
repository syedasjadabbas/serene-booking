const env = require("../config/env");

// Stay dates are calendar dates (YYYY-MM-DD) in the hotel's time zone, stored as Postgres DATE.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const todayInHotelTz = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: env.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const toDbDate = (iso) => new Date(`${iso}T00:00:00.000Z`);
const fromDbDate = (d) => d.toISOString().slice(0, 10);

const addDays = (iso, n) => {
  const d = toDbDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fromDbDate(d);
};

const nightsBetween = (checkIn, checkOut) => Math.round((toDbDate(checkOut) - toDbDate(checkIn)) / 86400_000);

// Every night of the stay, as the date the night starts on.
const eachNight = (checkIn, checkOut) => {
  const out = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) out.push(d);
  return out;
};

const isValidIsoDate = (s) => ISO_DATE.test(s) && fromDbDate(toDbDate(s)) === s;

module.exports = { todayInHotelTz, toDbDate, fromDbDate, addDays, nightsBetween, eachNight, isValidIsoDate };
