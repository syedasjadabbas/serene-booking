"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import Logo from "./Logo";
import { useAuthStore } from "@/global/stores/authStore";
import { useLogoutMutation } from "@/global/api/endpoints/authApi";
import { cn } from "@/global/lib/cn";

const NAV = [
  { href: "/rooms", label: "Apartments" },
  { href: "/amenities", label: "Amenities" },
  { href: "/floor-plans", label: "Floor plans" },
  { href: "/contact", label: "Location & contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                pathname.startsWith(n.href) && "text-brand-700"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/manage" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 sm:block">
            Find booking
          </Link>
          <AccountMenu />
          <button className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-zinc-200 bg-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {[...NAV, { href: "/manage", label: "Find a booking" }].map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-2 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function AccountMenu() {
  const { status, customer } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [logout] = useLogoutMutation();
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (status === "unknown") return <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-100" aria-hidden />;
  if (status !== "authenticated" || !customer) {
    return (
      <Link href="/login" className="btn-primary px-4 py-2">
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn-secondary px-3 py-2" aria-expanded={open} aria-haspopup="menu">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {customer.firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{customer.firstName}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-pop">
          <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50">
            <CalendarCheck className="h-4 w-4 text-zinc-500" /> My bookings
          </Link>
          <Link role="menuitem" href="/account/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50">
            <User className="h-4 w-4 text-zinc-500" /> Profile & security
          </Link>
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout().unwrap().catch(() => undefined);
              router.push("/");
            }}
            className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
