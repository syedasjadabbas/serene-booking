"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/global/stores/authStore";
import { PageLoader } from "@/global/components/ui";
import { cn } from "@/global/lib/cn";
import RollText from "@/global/components/RollText";

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
    <div className="bg-bone">
      {/* Editorial account header: small-caps label and rule, the greeting in Roman capitals, caps tabs underlined when active */}
      <section className="container-page pt-12 sm:pt-20">
        <p className="caps fade-up flex items-center gap-4 text-ink">
          My account
          <span className="block h-px w-14 bg-ink/30" aria-hidden />
        </p>
        <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="fade-up break-words text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-[5.2rem]" style={{ animationDelay: "120ms" }}>
            Hello, {customer.firstName}
          </h1>
          <p className="caps fade-up text-ink/55 lg:pb-3" style={{ animationDelay: "200ms" }}>Serene Heights · Nathia Gali</p>
        </div>
        <nav className="fade-up mt-10 flex gap-8 overflow-x-auto border-b border-ink/15 sm:mt-14 sm:gap-10" aria-label="Account" style={{ animationDelay: "260ms" }}>
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={pathname === t.href ? "page" : undefined}
              className={cn(
                "caps roll-host -mb-px shrink-0 whitespace-nowrap border-b py-4 transition",
                pathname === t.href ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"
              )}
            >
              <RollText>{t.label}</RollText>
            </Link>
          ))}
        </nav>
      </section>
      <div className="container-page pb-24 pt-10 sm:pb-32 sm:pt-14">{children}</div>
    </div>
  );
}
