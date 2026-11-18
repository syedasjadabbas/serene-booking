"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/global/api/endpoints/authApi";
import { errorMessage } from "@/global/api/baseApi";
import { useAuthStore } from "@/global/stores/authStore";
import { Alert } from "@/global/components/ui";
import { cn } from "@/global/lib/cn";
import RollText from "@/global/components/RollText";

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
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <form onSubmit={saveProfile} noValidate className="space-y-6 border border-ink/15 bg-white p-6 sm:p-10">
        <div>
          <p className="caps flex items-center gap-4 text-ink">
            Profile
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h2 className="mt-4 text-[1.9rem] leading-[1.08] sm:text-4xl">Personal details</h2>
        </div>
        {profileState.isSuccess && <Alert tone="success">Profile saved.</Alert>}
        {profileState.error && <Alert tone="error">{errorMessage(profileState.error)}</Alert>}
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="First name" error={pf.formState.errors.firstName?.message} {...pf.register("firstName")} autoComplete="given-name" />
          <Input label="Last name" error={pf.formState.errors.lastName?.message} {...pf.register("lastName")} autoComplete="family-name" />
        </div>
        <label className="block">
          <span className="caps mb-2.5 block text-ink/70">Email</span>
          <input className="input rounded-none border-ink/15 py-3 text-ink/60" value={customer.email} disabled readOnly />
        </label>
        <Input label="Mobile number" error={pf.formState.errors.phone?.message} {...pf.register("phone")} type="tel" autoComplete="tel" />
        <Input label="Country of residence" error={pf.formState.errors.country?.message} {...pf.register("country")} autoComplete="country-name" />
        <button className="btn-primary roll-host w-full sm:w-auto" disabled={profileState.isLoading}><RollText>{profileState.isLoading ? "Saving…" : "Save details"}</RollText></button>
      </form>

      <form onSubmit={savePassword} noValidate className="space-y-6 border border-ink/15 bg-white p-6 sm:p-10">
        <div>
          <p className="caps flex items-center gap-4 text-ink">
            Security
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h2 className="mt-4 text-[1.9rem] leading-[1.08] sm:text-4xl">Change password</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">Changing your password signs you out on every other device.</p>
        </div>
        {pwState.isSuccess && <Alert tone="success">Password changed.</Alert>}
        {pwState.error && <Alert tone="error">{errorMessage(pwState.error)}</Alert>}
        <Input label="Current password" type="password" autoComplete="current-password" error={pw.formState.errors.currentPassword?.message} {...pw.register("currentPassword")} />
        <Input label="New password" type="password" autoComplete="new-password" error={pw.formState.errors.newPassword?.message} {...pw.register("newPassword")} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" error={pw.formState.errors.confirm?.message} {...pw.register("confirm")} />
        <button className="btn-primary roll-host w-full sm:w-auto" disabled={pwState.isLoading}><RollText>{pwState.isLoading ? "Updating…" : "Update password"}</RollText></button>
      </form>
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };
const Input = ({ label, error, ref, ...rest }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => (
  <label className="block">
    <span className="caps mb-2.5 block text-ink/70">{label}</span>
    <input ref={ref} className={cn("input rounded-none py-3", error && "input-error")} {...rest} />
    {error && <span className="field-error block">{error}</span>}
  </label>
);
