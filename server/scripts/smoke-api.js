// End-to-end API smoke test against a running local server. Creates and then cancels test bookings.
//   node scripts/smoke-api.js --yes          (API at http://localhost:4000)
// Refuses to run against anything but localhost.
//
// Covers: search/availability/pricing, booking + double-booking race, guest lookup, data scope
// (nobody can see or cancel someone else's booking), reviews rules, profile updates, and session rules
// (single session per platform, refresh rotation, logout, password change revoking sessions).
const assert = require("assert/strict");

const API = process.env.API_URL || "http://localhost:4000";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(API)) {
  console.error(`Refusing to run against ${API}: localhost only.`);
  process.exit(1);
}
if (!process.argv.includes("--yes")) {
  console.log("Dry run. This creates and cancels test bookings on the local API. Re-run with --yes.");
  process.exit(0);
}

/** A tiny HTTP client with its own cookie jar (one per simulated browser). */
function client() {
  let cookie = "";
  const call = async (method, path, body, token) => {
    const res = await fetch(`${API}/api/v1${path}`, {
      method,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return { status: res.status, body: await res.json() };
  };
  return { call, setCookie: (c) => (cookie = c), getCookie: () => cookie };
}

const anon = client();
const call = anon.call;

const stamp = Date.now().toString(36);
// ~300 days out: beyond the demo-bookings window (db:demo defaults to 120 days), so every apartment is free.
const isoIn = (days) => new Date(Date.now() + days * 86400_000).toISOString().slice(0, 10);
const stay = { checkIn: isoIn(300), checkOut: isoIn(302), adults: 2, children: 0, rooms: 1 };
const guest = { firstName: "Smoke", lastName: "Test", email: `smoke+${stamp}@example.test`, phone: "+92 300 0000000" };
const qs = (o) => new URLSearchParams(o).toString();
const book = (extra, token, c = anon) =>
  c.call("POST", "/bookings", { ...stay, roomTypeSlug: "classic-one-bedroom", ratePlanCode: "FLEX", guest, paymentMethod: "PAY_AT_PROPERTY", acceptTerms: true, ...extra }, token);
const made = [];

(async () => {
  let n = 0;
  const step = async (name, fn) => {
    await fn();
    n++;
    console.log(`  ok  ${name}`);
  };

  // ── Search, pricing, booking ───────────────────────────────────────────
  await step("health", async () => assert.equal((await call("GET", "/health")).status, 200));

  await step("room types list (5 types, 130 apartments)", async () => {
    const r = await call("GET", "/rooms");
    assert.equal(r.body.data.length, 5);
    assert.equal(r.body.data.reduce((s, t) => s + t.totalApartments, 0), 130);
  });

  await step("availability rejects past dates", async () => {
    const r = await call("GET", `/rooms/availability?${qs({ ...stay, checkIn: "2020-01-01", checkOut: "2020-01-02" })}`);
    assert.equal(r.status, 400);
  });

  let before;
  await step("availability for a stay", async () => {
    const r = await call("GET", `/rooms/availability?${qs(stay)}`);
    assert.equal(r.status, 200);
    before = Object.fromEntries(r.body.data.results.map((x) => [x.roomType.slug, x.available]));
    assert.ok(r.body.data.results.every((x) => x.lowestQuote.grandTotal > 0));
  });

  await step("rates for a type (3 plans, saver is cheapest)", async () => {
    const r = await call("GET", `/rooms/classic-one-bedroom/rates?${qs(stay)}`);
    const totals = Object.fromEntries(r.body.data.rates.map((x) => [x.ratePlan.code, x.quote.grandTotal]));
    assert.ok(totals.SAVER < totals.FLEX && totals.FLEX < totals.FLEX_BB);
  });

  await step("over-capacity booking is rejected", async () => {
    assert.equal((await book({ adults: 6 })).status, 400);
  });

  await step("card payment is refused while payments are disabled", async () => {
    const r = await book({ paymentMethod: "CARD" });
    assert.equal(r.status, 400);
    assert.equal(r.body.code, "PAYMENTS_DISABLED");
  });

  let guestRef;
  await step("guest booking is created and lowers availability", async () => {
    const r = await book();
    assert.equal(r.status, 201, JSON.stringify(r.body));
    guestRef = r.body.data.reference;
    made.push(guestRef);
    assert.match(guestRef, /^SH-[A-Z0-9]{6}$/);
    const a = await call("GET", `/rooms/availability?${qs(stay)}`);
    assert.equal(a.body.data.results.find((x) => x.roomType.slug === "classic-one-bedroom").available, before["classic-one-bedroom"] - 1);
  });

  await step("lookup needs the right email (email match is case-insensitive)", async () => {
    assert.equal((await call("POST", "/bookings/lookup", { reference: guestRef, email: "someone@else.test" })).status, 404);
    const ok = await call("POST", "/bookings/lookup", { reference: guestRef, email: guest.email.toUpperCase() });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.canCancel, true);
  });

  await step("6 parallel bookings for 4 corner suites: exactly 4 succeed", async () => {
    const results = await Promise.all(Array.from({ length: 6 }, (_, i) => book({ roomTypeSlug: "signature-corner-suite", ratePlanCode: "SAVER", guest: { ...guest, firstName: `Race${i}` } })));
    const ok = results.filter((r) => r.status === 201);
    const sold = results.filter((r) => r.status === 409 && r.body.code === "SOLD_OUT");
    made.push(...ok.map((r) => r.body.data.reference));
    assert.equal(ok.length, 4, results.map((r) => r.status).join(","));
    assert.equal(sold.length, 2);
  });

  // ── Accounts & profile ─────────────────────────────────────────────────
  const A = client();
  const B = client();
  const emailA = `acct-a+${stamp}@example.test`;
  const passA = "smoke-test-1";
  let tokenA, tokenB, refA;

  await step("register, me, and my bookings", async () => {
    const reg = await A.call("POST", "/auth/register", { firstName: "Smoke", lastName: "Alpha", email: emailA, password: passA });
    assert.equal(reg.status, 201);
    tokenA = reg.body.data.accessToken;
    assert.equal((await A.call("GET", "/auth/me", null, tokenA)).status, 200);
    const b = await book({ roomTypeSlug: "terrace-apartment", ratePlanCode: "FLEX_BB" }, tokenA, A);
    assert.equal(b.status, 201);
    refA = b.body.data.reference;
    made.push(refA);
    const mine = await A.call("GET", "/bookings/mine?status=upcoming", null, tokenA);
    assert.equal(mine.body.data.total, 1);
    assert.equal((await A.call("GET", `/bookings/mine/${refA}`, null, tokenA)).status, 200);
  });

  await step("profile update saves valid fields and rejects bad input", async () => {
    const ok = await A.call("PATCH", "/auth/me", { phone: "+92 311 1234567", country: "Pakistan" }, tokenA);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.phone, "+92 311 1234567");
    assert.equal(ok.body.data.email, emailA); // email can't be changed here
    assert.equal((await A.call("PATCH", "/auth/me", { phone: "call me" }, tokenA)).status, 400);
    assert.equal((await anon.call("PATCH", "/auth/me", { country: "X" })).status, 401);
  });

  // ── Data scope: nobody sees or changes someone else's booking ─────────
  await step("data scope: another customer can't see or cancel the booking", async () => {
    const reg = await B.call("POST", "/auth/register", { firstName: "Smoke", lastName: "Bravo", email: `acct-b+${stamp}@example.test`, password: "smoke-test-2" });
    tokenB = reg.body.data.accessToken;
    assert.equal((await B.call("GET", `/bookings/mine/${refA}`, null, tokenB)).status, 404);
    assert.equal((await B.call("POST", `/bookings/${refA}/cancel`, {}, tokenB)).status, 404);
    assert.equal((await B.call("POST", `/bookings/${guestRef}/cancel`, {}, tokenB)).status, 404);
    assert.equal((await B.call("GET", "/bookings/mine?status=upcoming", null, tokenB)).body.data.total, 0);
  });

  await step("data scope: guests need the booking email to cancel", async () => {
    assert.equal((await call("POST", `/bookings/${guestRef}/cancel`, {})).status, 404);
    assert.equal((await call("POST", `/bookings/${guestRef}/cancel`, { email: "wrong@example.test" })).status, 404);
  });

  // ── Reviews ────────────────────────────────────────────────────────────
  await step("reviews: listing works; upcoming or someone else's stays can't be reviewed", async () => {
    const list = await call("GET", "/reviews?page=1&pageSize=3");
    assert.equal(list.status, 200);
    assert.ok("average" in list.body.data.summary);
    const review = { bookingReference: refA, rating: 5, title: "Lovely stay", body: "A very relaxing stay with beautiful views of the pines." };
    const early = await A.call("POST", "/reviews", review, tokenA);
    assert.equal(early.status, 400);
    assert.equal(early.body.code, "NOT_REVIEWABLE");
    assert.equal((await B.call("POST", "/reviews", review, tokenB)).status, 404);
    assert.equal((await anon.call("POST", "/reviews", review)).status, 401);
  });

  // ── Sessions ───────────────────────────────────────────────────────────
  await step("sessions: signing in elsewhere signs out the old session", async () => {
    const A2 = client();
    const login = await A2.call("POST", "/auth/login", { email: emailA, password: passA });
    assert.equal(login.status, 200);
    assert.equal((await A.call("GET", "/auth/me", null, tokenA)).status, 401); // old access token revoked
    assert.equal((await A.call("POST", "/auth/refresh")).status, 401); // old refresh cookie revoked
    A.setCookie(A2.getCookie());
    tokenA = login.body.data.accessToken;
  });

  await step("sessions: refresh rotates the token; the previous refresh token stops working", async () => {
    const oldCookie = A.getCookie();
    const r = await A.call("POST", "/auth/refresh");
    assert.equal(r.status, 200);
    tokenA = r.body.data.accessToken;
    const stale = client();
    stale.setCookie(oldCookie);
    assert.equal((await stale.call("POST", "/auth/refresh")).status, 401);
  });

  await step("sessions: password change revokes old tokens and the old password", async () => {
    const newPass = "smoke-test-9";
    assert.equal((await A.call("POST", "/auth/change-password", { currentPassword: "wrong-pass-1", newPassword: newPass }, tokenA)).status, 400);
    const ch = await A.call("POST", "/auth/change-password", { currentPassword: passA, newPassword: newPass }, tokenA);
    assert.equal(ch.status, 200);
    assert.equal((await A.call("GET", "/auth/me", null, tokenA)).status, 401); // pre-change token revoked
    const fresh = ch.body.data.accessToken;
    assert.equal((await A.call("GET", "/auth/me", null, fresh)).status, 200);
    assert.equal((await client().call("POST", "/auth/login", { email: emailA, password: passA })).status, 401);
    tokenA = fresh;
  });

  await step("sessions: logout revokes the access token and the refresh cookie", async () => {
    const cookieBefore = A.getCookie();
    assert.equal((await A.call("POST", "/auth/logout", null, tokenA)).status, 200);
    assert.equal((await A.call("GET", "/auth/me", null, tokenA)).status, 401);
    const replay = client();
    replay.setCookie(cookieBefore);
    assert.equal((await replay.call("POST", "/auth/refresh")).status, 401);
  });

  // ── Cleanup ────────────────────────────────────────────────────────────
  await step("cancel releases apartments", async () => {
    for (const r of made) {
      const c = await call("POST", `/bookings/${r}/cancel`, { email: guest.email, reason: "smoke test" });
      assert.equal(c.status, 200, `${r}: ${JSON.stringify(c.body)}`);
    }
    const a = await call("GET", `/rooms/availability?${qs(stay)}`);
    const now = Object.fromEntries(a.body.data.results.map((x) => [x.roomType.slug, x.available]));
    assert.deepEqual(now, before);
  });

  console.log(`\n${n} API checks passed`);
})().catch(async (err) => {
  console.error("\nFAILED:", err.message);
  // Never leave test bookings holding apartments: cancel whatever this run created.
  for (const r of made) {
    await call("POST", `/bookings/${r}/cancel`, { email: guest.email, reason: "smoke test cleanup" }).catch(() => undefined);
  }
  if (made.length) console.error(`Cleaned up ${made.length} test booking(s).`);
  process.exit(1);
});
