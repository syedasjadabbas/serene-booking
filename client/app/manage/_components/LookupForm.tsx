"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLookupBookingMutation } from "@/global/api/endpoints/bookingsApi";
import { errorMessage } from "@/global/api/baseApi";
import { useBookingStore } from "@/global/stores/bookingStore";
import { Alert } from "@/global/components/ui";
import { cn } from "@/global/lib/cn";

const schema = z.object({
  reference: z.string().trim().toUpperCase().regex(/^SH-[A-Z0-9]{6}$/, "Your reference looks like SH-XXXXXX"),
  email: z.string().trim().toLowerCase().email("Enter the email used to book"),
});
type Values = z.infer<typeof schema>;

export default function LookupForm({ defaultReference = "" }: { defaultReference?: string }) {
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
    <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
      {error && <Alert tone="error">{errorMessage(error)}</Alert>}
      <label className="block">
        <span className="label">Booking reference</span>
        <input className={cn("input uppercase", formState.errors.reference && "input-error")} placeholder="SH-XXXXXX" {...register("reference")} />
        {formState.errors.reference && <span className="field-error block">{formState.errors.reference.message}</span>}
      </label>
      <label className="block">
        <span className="label">Email address</span>
        <input type="email" autoComplete="email" className={cn("input", formState.errors.email && "input-error")} {...register("email")} />
        {formState.errors.email && <span className="field-error block">{formState.errors.email.message}</span>}
      </label>
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? "Finding your booking…" : "Find booking"}
      </button>
    </form>
  );
}
