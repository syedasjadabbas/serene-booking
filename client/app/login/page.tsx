import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoader } from "@/global/components/ui";
import AuthShell from "./_components/AuthShell";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your stays at Serene Heights.">
      <Suspense fallback={<PageLoader />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
