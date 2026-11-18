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
import RollText from "@/global/components/RollText";

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
    <div className="min-h-screen bg-bone">
      <div className="container-page pb-24 pt-10 sm:pt-14">
        <Link href={backHref} className="tap caps inline-flex items-center gap-2 text-ink/60 transition hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to rates
        </Link>
        <div className="mt-8 max-w-2xl">
          <BookingSteps current={2} />
        </div>
        <div className="mt-12 border-b border-ink/15 pb-8">
          <p className="caps flex items-center gap-4 text-ink/60">
            Step 02 · Your details
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h1 className="fade-up mt-5 text-[2.3rem] leading-[1.02] sm:text-6xl">Complete your booking</h1>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] xl:gap-14">
          <form onSubmit={onSubmit} noValidate className="min-w-0 space-y-8">
            {submitError && <Alert tone="error" title="We couldn't complete your booking">{errorMessage(submitError)}</Alert>}
            {unavailable && <Alert tone="warning" title="No longer available">This apartment just sold out for your dates. <Link href={`/rooms?${stayToQuery(stay)}`} className="underline">See other apartments</Link>.</Alert>}

            {status !== "authenticated" && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-sky-light px-5 py-4 text-sm text-ink/80 sm:px-6">
                <span>Sign in to book faster and see this booking in your account.</span>
                <Link href={`/login?next=${encodeURIComponent(`/book?${paramsKey}`)}`} className="btn-secondary roll-host py-2.5"><RollText>Sign in</RollText></Link>
              </div>
            )}

            <section className="border border-ink/10 bg-white p-5 sm:p-8">
              <p className="caps text-ink/50">01</p>
              <h2 className="mt-2 text-2xl leading-tight sm:text-3xl">Lead guest details</h2>
              <p className="mt-2 text-sm text-ink/60">The name must match the CNIC or passport shown at check-in.</p>
              <div className="mt-7 grid gap-5 border-t border-ink/10 pt-7 sm:grid-cols-2">
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
              <div className="mt-5">
                <Field label="Special requests (optional)" hint="Subject to availability, e.g. high floor, extra bedding, celebration" error={errors.specialRequests?.message}>
                  <textarea rows={3} className={cn("input", errors.specialRequests && "input-error")} {...register("specialRequests")} />
                </Field>
              </div>
            </section>

            <PaymentSection paymentsEnabled={config?.paymentsEnabled ?? false} value={watch("paymentMethod")} onChange={(m) => setValue("paymentMethod", m)} total={selected.quote.grandTotal} currency={selected.quote.currency} />

            <section className="border border-ink/10 bg-white p-5 sm:p-8">
              <p className="caps text-ink/50">03</p>
              <h2 className="mt-2 text-2xl leading-tight sm:text-3xl">Confirm</h2>
              <label className="mt-6 flex items-start gap-3 border-t border-ink/10 pt-6 text-sm leading-relaxed text-ink/75">
                <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded-none accent-ink" {...register("acceptTerms")} />
                <span>
                  I agree to the booking conditions: {selected.ratePlan.refundable ? `free cancellation until ${selected.ratePlan.freeCancelHours} hours before check-in` : "this rate is non-refundable"}, and the house rules (check-in from 2:00 PM, check-out until 12:00 PM, valid ID required).
                </span>
              </label>
              {errors.acceptTerms && <p className="field-error ml-7">{errors.acceptTerms.message}</p>}
              <button type="submit" disabled={submitting || unavailable} className="btn-primary mt-6 w-full py-4">
                <Lock className="h-4 w-4" /> {submitting ? "Confirming…" : "Confirm booking"}
              </button>
              <p className="mt-3 text-center text-xs text-ink/50">No payment is taken now. You&apos;ll pay at the property.</p>
            </section>
          </form>

          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <PriceSummary stay={stay} roomName={rates.roomType.name} ratePlan={selected.ratePlan} quote={selected.quote} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 [&_.input]:rounded-none">
      <span className="caps mb-2 block text-ink/70">{label}</span>
      {children}
      {error ? <span className="field-error block">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}
