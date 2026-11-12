// Data scope: the single place that decides which bookings an actor may see or change.
// Every booking/review query that reads or mutates someone's booking must merge this into its `where`.
//
// Actor shapes:
//   { customerId }               signed-in customer  → their own bookings
//   { guestEmail }               guest proving ownership with the email used to book
//   { customerId, guestEmail }   either proof is enough (e.g. cancelling while signed in, with the email too)
//   anything else                → matches nothing
//
// Guest bookings are never linked to accounts by email (emails are unverified), so a signed-in customer
// does NOT automatically see guest bookings made with the same email.

const NOTHING = { id: { in: [] } }; // a filter Prisma accepts that can never match

function bookingScope(actor = {}) {
  const ors = [];
  if (actor.customerId) ors.push({ customerId: actor.customerId });
  if (actor.guestEmail) ors.push({ guestEmail: String(actor.guestEmail).trim().toLowerCase() });
  if (!ors.length) return NOTHING;
  return ors.length === 1 ? ors[0] : { OR: ors };
}

/** Combine a scope with other conditions safely (AND keeps any OR inside the scope intact). */
const scoped = (actor, where = {}) => ({ AND: [bookingScope(actor), where] });

/** Build an actor from an optional auth context and an optional guest email. */
const actorFrom = (auth, guestEmail) => ({ customerId: auth?.customerId, guestEmail });

module.exports = { bookingScope, scoped, actorFrom, NOTHING };
