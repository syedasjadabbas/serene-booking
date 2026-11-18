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
    <section className="border border-ink/10 bg-white p-5 sm:p-8">
      <p className="caps text-ink/50">02</p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-2xl leading-tight sm:text-3xl">Payment</h2>
        <p className="text-sm text-ink/60">
          Total <span className="font-display text-xl text-ink">{money(total, currency)}</span>
        </p>
      </div>
      <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10" role="radiogroup" aria-label="Payment method">
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "relative flex cursor-pointer items-start gap-4 px-1 py-5 transition sm:px-4",
              value === o.id ? "bg-sky-light/60" : "hover:bg-bone",
              !o.enabled && "cursor-not-allowed opacity-55 hover:bg-transparent"
            )}
          >
            {value === o.id && <span className="absolute inset-y-0 left-0 w-0.5 bg-ink" aria-hidden />}
            <input type="radio" name="paymentMethod" className="mt-1.5 accent-ink" checked={value === o.id} disabled={!o.enabled} onChange={() => onChange(o.id)} />
            <o.Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink/60" strokeWidth={1.5} />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-lg leading-tight text-ink">
                {o.title}
                {!o.enabled && <span className="caps border border-ink/20 px-2 py-0.5 font-sans text-[10px] text-ink/60">Coming soon</span>}
              </span>
              <span className="mt-1 block text-sm text-ink/60">{o.text}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Preview of the card form for when a gateway is connected. Uncontrolled and disabled: values never leave the browser. */}
      <fieldset disabled className="mt-6 border border-dashed border-ink/25 p-4 opacity-70 sm:p-5 [&_.input]:rounded-none" aria-label="Card details (not yet available)">
        <legend className="caps px-2 text-[10px] text-ink/55">Card details · available when online payment launches</legend>
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
