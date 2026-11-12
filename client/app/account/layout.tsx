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
    <div>
      {/* Account banner: dark panel with greeting and pill tabs */}
      <section className="panel relative isolate mt-2.5 bg-ink sm:mt-4 lg:mt-6">
        <svg aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.15]" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0 150 C 200 60, 360 190, 560 110 S 760 40, 800 70" fill="none" stroke="#a9c7b8" strokeWidth="1" />
          <path d="M0 180 C 180 130, 400 200, 620 150 S 780 110, 800 130" fill="none" stroke="#a9c7b8" strokeWidth="1" />
        </svg>
        <div className="container-page flex flex-wrap items-end justify-between gap-6 py-10">
          <div className="flex items-center gap-4">
            <span className="fade-up grid h-14 w-14 place-items-center rounded-2xl bg-lime text-xl font-extrabold text-ink">{customer.firstName.charAt(0).toUpperCase()}</span>
            <div>
              <p className="fade-up text-xs font-semibold uppercase tracking-widest text-lime" style={{ animationDelay: "80ms" }}>My account</p>
              <h1 className="fade-up text-3xl font-bold text-white sm:text-4xl" style={{ animationDelay: "160ms" }}>Hello, {customer.firstName}</h1>
            </div>
          </div>
          <nav className="fade-up flex gap-1 rounded-full bg-white/10 p-1" aria-label="Account" style={{ animationDelay: "240ms" }}>
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", pathname === t.href ? "bg-white text-ink" : "text-white/80 hover:text-white")}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
