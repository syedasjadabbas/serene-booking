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
import RollText from "@/global/components/RollText";

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
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {signedOutReason && !error && <Alert tone="warning">{signedOutReason}</Alert>}
      {error && <Alert tone="error">{errorMessage(error)}</Alert>}
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Email</span>
        <input type="email" autoComplete="email" className={cn("input rounded-none py-3", formState.errors.email && "input-error")} {...register("email")} />
        {formState.errors.email && <span className="field-error block">{formState.errors.email.message}</span>}
      </label>
      <label className="block">
        <span className="caps mb-2.5 block text-ink/70">Password</span>
        <input type="password" autoComplete="current-password" className={cn("input rounded-none py-3", formState.errors.password && "input-error")} {...register("password")} />
        {formState.errors.password && <span className="field-error block">{formState.errors.password.message}</span>}
      </label>
      <button type="submit" className="btn-primary roll-host w-full py-4" disabled={isLoading}>
        <RollText>{isLoading ? "Signing in…" : "Sign in"}</RollText>
      </button>
      <div className="divide-y divide-ink/15 border-y border-ink/15 text-sm text-ink/65">
        <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4">
          New to Serene Heights?
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="caps tap text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink">Create an account</Link>
        </p>
        <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4">
          Booked as a guest?
          <Link href="/manage" className="caps tap text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink">Find your booking</Link>
        </p>
      </div>
    </form>
  );
}
