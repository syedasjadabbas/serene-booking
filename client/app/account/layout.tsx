"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/global/stores/authStore";
import { PageLoader } from "@/global/components/ui";
import { cn } from "@/global/lib/cn";

// Auth guard for the account area. This only hides UI; the API enforces access on every request.
export default function AccountLayout({ children }: { children: ReactNode }) {
  const { status, customer } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "guest") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status !== "authenticated" || !customer) return <PageLoader />;

  const tabs = [
    { href: "/account", label: "My bookings" },
    { href: "/account/profile", label: "Profile & security" },
  ];

  return (
    <div className="bg-zinc-50/60">
      <div className="container-page py-8">
        <h1 className="text-3xl font-medium">Hello, {customer.firstName}</h1>
        <nav className="mt-5 flex gap-1 border-b border-zinc-200" aria-label="Account">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn("-mb-px border-b-2 px-4 py-2.5 text-sm font-medium", pathname === t.href ? "border-brand-600 text-brand-700" : "border-transparent text-zinc-500 hover:text-zinc-800")}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
