// End-to-end API smoke test against a running local server. Creates and then cancels test bookings.
//   node scripts/smoke-api.js --yes          (API at http://localhost:4000)
// Refuses to run against anything but localhost.
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

let cookie = "";
async function call(method, path, body, token) {
  const res = await fetch(`${API}/api/v1${path}`, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return { status: res.status, body: await res.json() };
}

const stamp = Date.now().toString(36);
const stay = { checkIn: "2027-03-10", checkOut: "2027-03-12", adults: 2, children: 0, rooms: 1 };
const guest = { firstName: "Smoke", lastName: "Test", email: `smoke+${stamp}@example.test`, phone: "+92 300 0000000" };
const qs = (o) => new URLSearchParams(o).toString();
const made = [];

(async () => {
  let n = 0;
  const step = async (name, fn) => {
    await fn();
    n++;
    console.log(`  ok  ${name}`);
  };

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
    const r = await call("POST", "/bookings", { ...stay, adults: 6, roomTypeSlug: "classic-one-bedroom", ratePlanCode: "FLEX", guest, paymentMethod: "PAY_AT_PROPERTY", acceptTerms: true });
    assert.equal(r.status, 400);
  });

  await step("card payment is refused while payments are disabled", async () => {
    const r = await call("POST", "/bookings", { ...stay, roomTypeSlug: "classic-one-bedroom", ratePlanCode: "FLEX", guest, paymentMethod: "CARD", acceptTerms: true });
    assert.equal(r.status, 400);
    assert.equal(r.body.code, "PAYMENTS_DISABLED");
  });

  let ref;
  await step("guest booking is created and lowers availability", async () => {
    const r = await call("POST", "/bookings", { ...stay, roomTypeSlug: "classic-one-bedroom", ratePlanCode: "FLEX", guest, paymentMethod: "PAY_AT_PROPERTY", acceptTerms: true });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    ref = r.body.data.reference;
    made.push(ref);
    assert.match(ref, /^SH-[A-Z0-9]{6}$/);
    const a = await call("GET", `/rooms/availability?${qs(stay)}`);
    assert.equal(a.body.data.results.find((x) => x.roomType.slug === "classic-one-bedroom").available, before["classic-one-bedroom"] - 1);
  });

  await step("lookup needs the right email", async () => {
    assert.equal((await call("POST", "/bookings/lookup", { reference: ref, email: "someone@else.test" })).status, 404);
    const ok = await call("POST", "/bookings/lookup", { reference: ref, email: guest.email });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.canCancel, true);
  });

  await step("6 parallel bookings for 4 corner suites: exactly 4 succeed", async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, i) =>
        call("POST", "/bookings", { ...stay, roomTypeSlug: "signature-corner-suite", ratePlanCode: "SAVER", guest: { ...guest, firstName: `Race${i}` }, paymentMethod: "PAY_AT_PROPERTY", acceptTerms: true })
      )
    );
    const ok = results.filter((r) => r.status === 201);
    const sold = results.filter((r) => r.status === 409 && r.body.code === "SOLD_OUT");
    made.push(...ok.map((r) => r.body.data.reference));
    assert.equal(ok.length, 4, results.map((r) => r.status).join(","));
    assert.equal(sold.length, 2);
  });

  await step("register, me, and my bookings", async () => {
    const reg = await call("POST", "/auth/register", { firstName: "Smoke", lastName: "Account", email: `acct+${stamp}@example.test`, password: "smoke-test-1" });
    assert.equal(reg.status, 201);
    const token = reg.body.data.accessToken;
    assert.equal((await call("GET", "/auth/me", null, token)).status, 200);
    const b = await call("POST", "/bookings", { ...stay, roomTypeSlug: "terrace-apartment", ratePlanCode: "FLEX_BB", guest, paymentMethod: "PAY_AT_PROPERTY", acceptTerms: true }, token);
    assert.equal(b.status, 201);
    made.push(b.body.data.reference);
    const mine = await call("GET", "/bookings/mine?status=upcoming", null, token);
    assert.equal(mine.body.data.total, 1);
    const refreshed = await call("POST", "/auth/refresh");
    assert.equal(refreshed.status, 200);
    assert.equal((await call("POST", "/auth/logout", null, refreshed.body.data.accessToken)).status, 200);
    assert.equal((await call("GET", "/auth/me", null, refreshed.body.data.accessToken)).status, 401);
  });

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
