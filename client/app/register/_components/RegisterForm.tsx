"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterMutation } from "@/global/api/endpoints/authApi";
import { errorMessage } from "@/global/api/baseApi";
import { useAuthStore } from "@/global/stores/authStore";
import { Alert } from "@/global/components/ui";
import { safeNext } from "@/global/lib/safeNext";
import { cn } from "@/global/lib/cn";
import RollText from "@/global/components/RollText";

// Mirrors the server's registerSchema.
const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.union([z.literal(""), z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number")]),
  password: z.string().min(8, "At least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
});
type Values = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const status = useAuthStore((s) => s.status);
  const [registerAccount, { isLoading, error }] = useRegisterMutation();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { phone: "" } });
  const e = formState.errors;

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await registerAccount({ ...v, phone: v.phone || undefined }).unwrap();
    } catch {
      /* shown below */
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {error && <Alert tone="error">{errorMessage(error)}</Alert>}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="caps mb-2.5 block text-ink/70">First name</span>
          <input autoComplete="given-name" className={cn("input rounded-none py-3", e.firstName && "input-error")} {...register("firstName")} />
          {e.firstName && <span className="field-error block">{e.firstName.message}</span>}
        </label>
        <label className="block">
          <span className="caps mb-2.5 block text-ink/70">Last name</span>
          <input autoComplete="family-name" className={cn("input rounded-none py-3", e.lastName && "input-error")} {...register("lastName")} />
          {e.lastName && <span className="field-error block">{e.lastName.message}</span>}
        </label>
      </div>
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Email</span>
        <input type="email" autoComplete="email" className={cn("input rounded-none py-3", e.email && "input-error")} {...register("email")} />
        {e.email && <span className="field-error block">{e.email.message}</span>}
      </label>
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Mobile number (optional)</span>
        <input type="tel" autoComplete="tel" placeholder="+92 3xx xxxxxxx" className={cn("input rounded-none py-3", e.phone && "input-error")} {...register("phone")} />
        {e.phone && <span className="field-error block">{e.phone.message}</span>}
      </label>
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Password</span>
        <input type="password" autoComplete="new-password" className={cn("input rounded-none py-3", e.password && "input-error")} {...register("password")} />
        {e.password ? <span className="field-error block">{e.password.message}</span> : <span className="mt-1 block text-xs text-ink/55">At least 8 characters with a letter and a number.</span>}
      </label>
      <button type="submit" className="btn-primary roll-host w-full py-4" disabled={isLoading}>
        <RollText>{isLoading ? "Creating account…" : "Create account"}</RollText>
      </button>
      <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-y border-ink/15 py-4 text-sm text-ink/65">
        Already have an account?
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="caps tap text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink">Sign in</Link>
      </p>
    </form>
  );
}
