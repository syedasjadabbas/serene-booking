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
  // On the home page the header floats inside the rounded hero card (reference design); elsewhere it's a sticky white bar.
  const overlay = pathname === "/" && !open;

  const header = (
    <header className={cn("z-40", overlay ? "hero-header pointer-events-auto sticky top-0" : "sticky top-0 border-b border-zinc-200/80 bg-white sm:bg-white/90 sm:backdrop-blur")}>
      <div className={cn("container-page flex h-16 items-center justify-between gap-4", overlay && "h-20")}>
        <Logo tone={overlay ? "cream" : "green"} />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                overlay ? "text-white/90 hover:bg-white/15 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-ink",
                !overlay && pathname.startsWith(n.href) && "bg-mist text-ink"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/manage" className={cn("hidden rounded-full px-3.5 py-2 text-sm font-medium sm:block", overlay ? "text-white/90 hover:bg-white/15" : "text-zinc-600 hover:bg-zinc-100")}>
            Find booking
          </Link>
          <AccountMenu />
          <button className={cn("rounded-full p-2.5 lg:hidden", overlay ? "text-white hover:bg-white/15" : "text-zinc-700 hover:bg-zinc-100")} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
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

  // Home: the header rides along with the pinned hero. Its track is exactly as tall as the hero's pin
  // section (--hero-pin-height, set by <ScrollInset>), so it stays on the hero while it shrinks and then
  // scrolls away with it.
  if (overlay) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40" style={{ height: "var(--hero-pin-height, auto)" }}>
        {header}
      </div>
    );
  }
  return header;
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

  if (status === "unknown") return <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100/60" aria-hidden />;
  if (status !== "authenticated" || !customer) {
    return (
      <Link href="/login" className="btn-primary px-4 py-2">
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn-secondary py-1.5 pl-1.5 pr-3" aria-expanded={open} aria-haspopup="menu">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-pine text-xs font-bold text-white">
          {customer.firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{customer.firstName}</span>
        <ChevronDown className="hidden h-4 w-4 min-[380px]:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-pop">
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
