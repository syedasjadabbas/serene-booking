"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "@/global/api/endpoints/authApi";
import { errorMessage } from "@/global/api/baseApi";
import { useAuthStore } from "@/global/stores/authStore";
import { Alert } from "@/global/components/ui";
import { safeNext } from "@/global/lib/safeNext";
import { cn } from "@/global/lib/cn";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { status, signedOutReason } = useAuthStore();
  const [login, { isLoading, error }] = useLoginMutation();
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await login(v).unwrap();
    } catch {
      /* shown below */
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {signedOutReason && !error && <Alert tone="warning">{signedOutReason}</Alert>}
      {error && <Alert tone="error">{errorMessage(error)}</Alert>}
      <label className="block">
        <span className="label">Email</span>
        <input type="email" autoComplete="email" className={cn("input", formState.errors.email && "input-error")} {...register("email")} />
        {formState.errors.email && <span className="field-error block">{formState.errors.email.message}</span>}
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input type="password" autoComplete="current-password" className={cn("input", formState.errors.password && "input-error")} {...register("password")} />
        {formState.errors.password && <span className="field-error block">{formState.errors.password.message}</span>}
      </label>
      <button type="submit" className="btn-primary w-full py-3" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        New to Serene Heights? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-brand-700 underline">Create an account</Link>
      </p>
      <p className="text-center text-sm text-zinc-500">
        Booked as a guest? <Link href="/manage" className="font-medium text-brand-700 underline">Find your booking</Link>
      </p>
    </form>
  );
}
