"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/global/api/endpoints/authApi";
import { errorMessage } from "@/global/api/baseApi";
import { useAuthStore } from "@/global/stores/authStore";
import { Alert } from "@/global/components/ui";
import { cn } from "@/global/lib/cn";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  phone: z.union([z.literal(""), z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number")]),
  country: z.string().trim().max(60),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "At least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export default function ProfilePage() {
  const customer = useAuthStore((s) => s.customer)!;
  const [updateProfile, profileState] = useUpdateProfileMutation();
  const [changePassword, pwState] = useChangePasswordMutation();

  const pf = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone ?? "", country: customer.country ?? "" },
  });
  const pw = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = pf.handleSubmit(async (v) => {
    await updateProfile({ firstName: v.firstName, lastName: v.lastName, phone: v.phone || null, country: v.country || null }).unwrap().catch(() => undefined);
  });
  const savePassword = pw.handleSubmit(async (v) => {
    try {
      await changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }).unwrap();
      pw.reset({ currentPassword: "", newPassword: "", confirm: "" });
    } catch {
      /* shown below */
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} noValidate className="card space-y-4 p-6">
        <h2 className="text-lg font-medium">Personal details</h2>
        {profileState.isSuccess && <Alert tone="success">Profile saved.</Alert>}
        {profileState.error && <Alert tone="error">{errorMessage(profileState.error)}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" error={pf.formState.errors.firstName?.message} {...pf.register("firstName")} autoComplete="given-name" />
          <Input label="Last name" error={pf.formState.errors.lastName?.message} {...pf.register("lastName")} autoComplete="family-name" />
        </div>
        <label className="block">
          <span className="label">Email</span>
          <input className="input" value={customer.email} disabled readOnly />
        </label>
        <Input label="Mobile number" error={pf.formState.errors.phone?.message} {...pf.register("phone")} type="tel" autoComplete="tel" />
        <Input label="Country of residence" error={pf.formState.errors.country?.message} {...pf.register("country")} autoComplete="country-name" />
        <button className="btn-primary" disabled={profileState.isLoading}>{profileState.isLoading ? "Saving…" : "Save details"}</button>
      </form>

      <form onSubmit={savePassword} noValidate className="card space-y-4 p-6">
        <h2 className="text-lg font-medium">Change password</h2>
        <p className="text-sm text-zinc-500">Changing your password signs you out on every other device.</p>
        {pwState.isSuccess && <Alert tone="success">Password changed.</Alert>}
        {pwState.error && <Alert tone="error">{errorMessage(pwState.error)}</Alert>}
        <Input label="Current password" type="password" autoComplete="current-password" error={pw.formState.errors.currentPassword?.message} {...pw.register("currentPassword")} />
        <Input label="New password" type="password" autoComplete="new-password" error={pw.formState.errors.newPassword?.message} {...pw.register("newPassword")} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" error={pw.formState.errors.confirm?.message} {...pw.register("confirm")} />
        <button className="btn-primary" disabled={pwState.isLoading}>{pwState.isLoading ? "Updating…" : "Update password"}</button>
      </form>
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };
const Input = ({ label, error, ref, ...rest }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => (
  <label className="block">
    <span className="label">{label}</span>
    <input ref={ref} className={cn("input", error && "input-error")} {...rest} />
    {error && <span className="field-error block">{error}</span>}
  </label>
);
