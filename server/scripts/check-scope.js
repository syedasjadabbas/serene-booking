// Runnable check for the data-scope rule (lib/scope.js): who may see/change which bookings.
//   npm run check   (runs with the pricing checks; no database needed)
const assert = require("assert/strict");
const { bookingScope, scoped, actorFrom, NOTHING } = require("../lib/scope");

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};

check("customer sees only their own bookings", () => {
  assert.deepEqual(bookingScope({ customerId: "c1" }), { customerId: "c1" });
});

check("guest proves ownership by email (normalised)", () => {
  assert.deepEqual(bookingScope({ guestEmail: "  Guest@Example.TEST " }), { guestEmail: "guest@example.test" });
});

check("either proof is enough when both are given", () => {
  assert.deepEqual(bookingScope({ customerId: "c1", guestEmail: "a@b.test" }), { OR: [{ customerId: "c1" }, { guestEmail: "a@b.test" }] });
});

check("no identity matches nothing (never 'all bookings')", () => {
  assert.deepEqual(bookingScope({}), NOTHING);
  assert.deepEqual(bookingScope(undefined), NOTHING);
  assert.deepEqual(bookingScope({ customerId: "", guestEmail: "" }), NOTHING);
  assert.deepEqual(actorFrom(null, undefined), { customerId: undefined, guestEmail: undefined });
  assert.deepEqual(bookingScope(actorFrom(null, undefined)), NOTHING);
});

check("scope is ANDed with other filters, so its OR can't widen a query", () => {
  const where = scoped({ customerId: "c1", guestEmail: "a@b.test" }, { reference: "SH-ABC123" });
  assert.deepEqual(where, { AND: [{ OR: [{ customerId: "c1" }, { guestEmail: "a@b.test" }] }, { reference: "SH-ABC123" }] });
});

check("a tab filter with its own OR stays separate from the scope", () => {
  const where = scoped({ customerId: "c1" }, { OR: [{ status: "COMPLETED" }, { status: "CONFIRMED" }] });
  assert.equal(where.AND.length, 2);
  assert.deepEqual(where.AND[0], { customerId: "c1" });
});

console.log(`\n${passed} scope checks passed`);
