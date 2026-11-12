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
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && <Alert tone="error">{errorMessage(error)}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">First name</span>
          <input autoComplete="given-name" className={cn("input", e.firstName && "input-error")} {...register("firstName")} />
          {e.firstName && <span className="field-error block">{e.firstName.message}</span>}
        </label>
        <label className="block">
          <span className="label">Last name</span>
          <input autoComplete="family-name" className={cn("input", e.lastName && "input-error")} {...register("lastName")} />
          {e.lastName && <span className="field-error block">{e.lastName.message}</span>}
        </label>
      </div>
      <label className="block">
        <span className="label">Email</span>
        <input type="email" autoComplete="email" className={cn("input", e.email && "input-error")} {...register("email")} />
        {e.email && <span className="field-error block">{e.email.message}</span>}
      </label>
      <label className="block">
        <span className="label">Mobile number (optional)</span>
        <input type="tel" autoComplete="tel" placeholder="+92 3xx xxxxxxx" className={cn("input", e.phone && "input-error")} {...register("phone")} />
        {e.phone && <span className="field-error block">{e.phone.message}</span>}
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input type="password" autoComplete="new-password" className={cn("input", e.password && "input-error")} {...register("password")} />
        {e.password ? <span className="field-error block">{e.password.message}</span> : <span className="mt-1 block text-xs text-zinc-500">At least 8 characters with a letter and a number.</span>}
      </label>
      <button type="submit" className="btn-primary w-full py-3" disabled={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-brand-700 underline">Sign in</Link>
      </p>
    </form>
  );
}
