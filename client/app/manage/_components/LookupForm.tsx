"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLookupBookingMutation } from "@/global/api/endpoints/bookingsApi";
import { errorMessage } from "@/global/api/baseApi";
import { useBookingStore } from "@/global/stores/bookingStore";
import { Alert } from "@/global/components/ui";
import RollText from "@/global/components/RollText";
import { cn } from "@/global/lib/cn";

const schema = z.object({
  reference: z.string().trim().toUpperCase().regex(/^SH-[A-Z0-9]{6}$/, "Your reference looks like SH-XXXXXX"),
  email: z.string().trim().toLowerCase().email("Enter the email used to book"),
});
type Values = z.infer<typeof schema>;

/** `bare` drops the form's own framed panel, for use inside a section that already provides one. */
export default function LookupForm({ defaultReference = "", bare = false }: { defaultReference?: string; bare?: boolean }) {
  const router = useRouter();
  const remember = useBookingStore((s) => s.remember);
  const [lookup, { isLoading, error }] = useLookupBookingMutation();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { reference: defaultReference, email: "" } });

  const onSubmit = handleSubmit(async (v) => {
    try {
      const booking = await lookup(v).unwrap();
      remember(booking);
      router.push(`/booking/${booking.reference}`);
    } catch {
      /* shown below */
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-6", !bare && "border border-ink/15 bg-white p-6 sm:p-8")}>
      {error && <Alert tone="error">{errorMessage(error)}</Alert>}
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Booking reference</span>
        <input className={cn("input rounded-none py-3 uppercase tracking-[0.12em]", formState.errors.reference && "input-error")} placeholder="SH-XXXXXX" {...register("reference")} />
        {formState.errors.reference && <span className="field-error block">{formState.errors.reference.message}</span>}
      </label>
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Email address</span>
        <input type="email" autoComplete="email" className={cn("input rounded-none py-3", formState.errors.email && "input-error")} {...register("email")} />
        {formState.errors.email && <span className="field-error block">{formState.errors.email.message}</span>}
      </label>
      <button type="submit" className="roll-host btn-primary w-full" disabled={isLoading} aria-busy={isLoading}>
        <RollText>{isLoading ? "Finding your booking…" : "Find booking"}</RollText>
      </button>
    </form>
  );
}
