"use client";

import { Building2, CreditCard, Landmark } from "lucide-react";
import type { PaymentMethod } from "@/global/api/types";
import { money } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";

// Payment UI. No gateway is connected yet (PAYMENTS_ENABLED=false on the server), so online
// options are shown but disabled, and card fields are never part of the form or sent anywhere.
export default function PaymentSection({
  paymentsEnabled,
  value,
  onChange,
  total,
  currency,
}: {
  paymentsEnabled: boolean;
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  total: number;
  currency: string;
}) {
  const options: { id: PaymentMethod; title: string; text: string; Icon: typeof CreditCard; enabled: boolean }[] = [
    { id: "PAY_AT_PROPERTY", title: "Pay at the property", text: "Pay by cash or card when you arrive. Nothing is charged now.", Icon: Building2, enabled: true },
    { id: "CARD", title: "Debit / credit card", text: "Visa, Mastercard and UnionPay.", Icon: CreditCard, enabled: paymentsEnabled },
    { id: "BANK_TRANSFER", title: "Bank transfer / wallet", text: "Bank transfer, JazzCash or Easypaisa.", Icon: Landmark, enabled: paymentsEnabled },
  ];

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-medium">Payment</h2>
      <p className="mt-1 text-sm text-zinc-500">Total {money(total, currency)}</p>
      <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment method">
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
              value === o.id ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600" : "border-zinc-200 hover:border-zinc-300",
              !o.enabled && "cursor-not-allowed opacity-60"
            )}
          >
            <input type="radio" name="paymentMethod" className="mt-1 accent-brand-600" checked={value === o.id} disabled={!o.enabled} onChange={() => onChange(o.id)} />
            <o.Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-900">
                {o.title}
                {!o.enabled && <span className="pill bg-zinc-100 text-zinc-600">Coming soon</span>}
              </span>
              <span className="block text-sm text-zinc-500">{o.text}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Preview of the card form for when a gateway is connected. Uncontrolled and disabled: values never leave the browser. */}
      <fieldset disabled className="mt-4 rounded-xl border border-dashed border-zinc-300 p-4 opacity-70" aria-label="Card details (not yet available)">
        <legend className="px-1 text-xs font-medium text-zinc-500">Card details · available when online payment launches</legend>
        <div className="grid gap-3 sm:grid-cols-4">
          <input className="input sm:col-span-4" placeholder="Card number" autoComplete="off" />
          <input className="input sm:col-span-2" placeholder="Name on card" autoComplete="off" />
          <input className="input" placeholder="MM / YY" autoComplete="off" />
          <input className="input" placeholder="CVC" autoComplete="off" />
        </div>
      </fieldset>
    </section>
  );
}
