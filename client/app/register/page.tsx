import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoader } from "@/global/components/ui";
import AuthShell from "@/app/login/_components/AuthShell";
import RegisterForm from "./_components/RegisterForm";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Book faster and keep all your stays in one place.">
      <Suspense fallback={<PageLoader />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
