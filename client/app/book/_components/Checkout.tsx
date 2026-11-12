"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@reduxjs/toolkit/query";
import { ArrowLeft, Lock } from "lucide-react";
import { useRatesQuery } from "@/global/api/endpoints/roomsApi";
import { useCreateBookingMutation } from "@/global/api/endpoints/bookingsApi";
import { usePublicConfigQuery } from "@/global/api/endpoints/propertyApi";
import { errorMessage } from "@/global/api/baseApi";
import { useAuthStore } from "@/global/stores/authStore";
import { useBookingStore } from "@/global/stores/bookingStore";
import { Alert, PageLoader } from "@/global/components/ui";
import { parseStay, stayToQuery } from "@/global/lib/stay";
import { cn } from "@/global/lib/cn";
import { ARRIVAL_TIMES, checkoutSchema, type CheckoutValues } from "../_lib/schema";
import PriceSummary from "./PriceSummary";
import PaymentSection from "./PaymentSection";
import BookingSteps from "@/global/components/BookingSteps";

export default function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const paramsKey = params.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stay = useMemo(() => parseStay(params), [paramsKey]);
  const slug = params.get("room") ?? "";
  const rateCode = params.get("rate") ?? "";

  const { customer, status } = useAuthStore();
  const remember = useBookingStore((s) => s.remember);
  const { data: config } = usePublicConfigQuery();
  const { data: rates, error: ratesError, isLoading } = useRatesQuery(stay && slug ? { slug, ...stay } : skipToken);
  const [createBooking, { isLoading: submitting, error: submitError }] = useCreateBookingMutation();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", country: "Pakistan", arrivalTime: ARRIVAL_TIMES[0], specialRequests: "", paymentMethod: "PAY_AT_PROPERTY", acceptTerms: false },
  });
  const { register, handleSubmit, formState, reset, watch, setValue } = form;
  const errors = formState.errors;

  // Prefill from the signed-in customer once.
  useEffect(() => {
    if (customer && !formState.isDirty) {
      reset({ ...form.getValues(), firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone ?? "", country: customer.country ?? "Pakistan" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  if (!stay || !slug || !rateCode) {
    return (
      <div className="container-page py-16">
        <Alert tone="warning" title="Your booking details are incomplete">Start again by choosing dates and an apartment.</Alert>
        <Link href="/rooms" className="btn-primary mt-6">Find an apartment</Link>
      </div>
    );
  }
  if (isLoading) return <PageLoader label="Checking your apartment…" />;

  const selected = rates?.rates.find((r) => r.ratePlan.code === rateCode);
  const backHref = `/rooms/${slug}?${stayToQuery(stay)}`;

  if (ratesError || !rates || !selected) {
    return (
      <div className="container-page py-16">
        <Alert tone="error" title="This rate isn't available">{ratesError ? errorMessage(ratesError) : "Please choose another rate."}</Alert>
        <Link href={backHref} className="btn-secondary mt-6">Back to rates</Link>
      </div>
    );
  }

  const unavailable = rates.soldOut || !rates.fitsParty;

  const onSubmit = handleSubmit(async (v) => {
    try {
      const booking = await createBooking({
        ...stay,
        roomTypeSlug: slug,
        ratePlanCode: rateCode,
        guest: { firstName: v.firstName, lastName: v.lastName, email: v.email, phone: v.phone, country: v.country || undefined },
        arrivalTime: v.arrivalTime && v.arrivalTime !== ARRIVAL_TIMES[0] ? v.arrivalTime : undefined,
        specialRequests: v.specialRequests || undefined,
        paymentMethod: v.paymentMethod,
        acceptTerms: true,
      }).unwrap();
      remember(booking);
      router.push(`/booking/${booking.reference}?new=1`);
    } catch {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  return (
    <div className="bg-zinc-50/60">
      <div className="container-page py-8">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to rates
        </Link>
        <div className="mt-4 max-w-2xl">
          <BookingSteps current={2} />
        </div>
        <h1 className="mt-6 text-3xl">Complete your booking</h1>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {submitError && <Alert tone="error" title="We couldn't complete your booking">{errorMessage(submitError)}</Alert>}
            {unavailable && <Alert tone="warning" title="No longer available">This apartment just sold out for your dates. <Link href={`/rooms?${stayToQuery(stay)}`} className="underline">See other apartments</Link>.</Alert>}

            {status !== "authenticated" && (
              <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span>Sign in to book faster and see this booking in your account.</span>
                <Link href={`/login?next=${encodeURIComponent(`/book?${paramsKey}`)}`} className="btn-secondary py-2">Sign in</Link>
              </div>
            )}

            <section className="card p-5 sm:p-6">
              <h2 className="text-lg font-medium">Lead guest details</h2>
              <p className="mt-1 text-sm text-zinc-500">The name must match the CNIC or passport shown at check-in.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="First name" error={errors.firstName?.message}>
                  <input className={cn("input", errors.firstName && "input-error")} autoComplete="given-name" {...register("firstName")} />
                </Field>
                <Field label="Last name" error={errors.lastName?.message}>
                  <input className={cn("input", errors.lastName && "input-error")} autoComplete="family-name" {...register("lastName")} />
                </Field>
                <Field label="Email" hint="Your confirmation goes here" error={errors.email?.message}>
                  <input type="email" className={cn("input", errors.email && "input-error")} autoComplete="email" {...register("email")} />
                </Field>
                <Field label="Mobile number" hint="For WhatsApp updates from the front desk" error={errors.phone?.message}>
                  <input type="tel" className={cn("input", errors.phone && "input-error")} autoComplete="tel" placeholder="+92 3xx xxxxxxx" {...register("phone")} />
                </Field>
                <Field label="Country of residence" error={errors.country?.message}>
                  <input className="input" autoComplete="country-name" {...register("country")} />
                </Field>
                <Field label="Estimated arrival time">
                  <select className="input" {...register("arrivalTime")}>
                    {ARRIVAL_TIMES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Special requests (optional)" hint="Subject to availability, e.g. high floor, extra bedding, celebration" error={errors.specialRequests?.message}>
                  <textarea rows={3} className={cn("input", errors.specialRequests && "input-error")} {...register("specialRequests")} />
                </Field>
              </div>
            </section>

            <PaymentSection paymentsEnabled={config?.paymentsEnabled ?? false} value={watch("paymentMethod")} onChange={(m) => setValue("paymentMethod", m)} total={selected.quote.grandTotal} currency={selected.quote.currency} />

            <section className="card p-5 sm:p-6">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" {...register("acceptTerms")} />
                <span>
                  I agree to the booking conditions: {selected.ratePlan.refundable ? `free cancellation until ${selected.ratePlan.freeCancelHours} hours before check-in` : "this rate is non-refundable"}, and the house rules (check-in from 2:00 PM, check-out until 12:00 PM, valid ID required).
                </span>
              </label>
              {errors.acceptTerms && <p className="field-error ml-7">{errors.acceptTerms.message}</p>}
              <button type="submit" disabled={submitting || unavailable} className="btn-primary mt-5 w-full py-3.5 text-base">
                <Lock className="h-4 w-4" /> {submitting ? "Confirming…" : "Confirm booking"}
              </button>
              <p className="mt-2 text-center text-xs text-zinc-500">No payment is taken now. You&apos;ll pay at the property.</p>
            </section>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PriceSummary stay={stay} roomName={rates.roomType.name} ratePlan={selected.ratePlan} quote={selected.quote} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="field-error block">{error}</span> : hint ? <span className="mt-1 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
