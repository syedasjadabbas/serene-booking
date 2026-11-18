"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "@/global/stores/authStore";
import { useLogoutMutation } from "@/global/api/endpoints/authApi";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { asset } from "@/global/lib/asset";
import { cn } from "@/global/lib/cn";
import RollText from "./RollText";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Apartments" },
  { href: "/amenities", label: "Amenities" },
  { href: "/floor-plans", label: "Floor plans" },
  { href: "/contact", label: "Location & contact" },
  { href: "/manage", label: "Find a booking" },
];

/**
 * Editorial site chrome, fixed over every page:
 *  - top left: a round badge (the Serene Heights mark ringed by text) that turns as you scroll;
 *  - top right: "Select an apartment" plus small-caps links and the menu button;
 *  - bottom left: a hairline scroll gauge with a 0–100 counter;
 *  - a full-screen menu.
 * The chrome switches between light and dark ink depending on the section underneath: sections mark
 * themselves with data-theme="dark" (photos, dark panels); anything else counts as light.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // Lock page scroll under the menu; Escape closes it.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // One rAF-throttled scroll handler drives the badge rotation, the gauge and the light/dark tone.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (barRef.current) barRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
      if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
      if (badgeRef.current && !still) badgeRef.current.style.transform = `rotate(${(window.scrollY * 0.08).toFixed(1)}deg)`;
      // Home: sample just below the top edge, in the middle (clear of the chrome itself). Inner pages
      // have a bone bar behind the chrome, so they stay light.
      if (home) {
        const under = document.elementFromPoint(window.innerWidth / 2, 6);
        const tone = under?.closest<HTMLElement>("[data-theme]")?.dataset.theme === "dark" ? "dark" : "light";
        if (root.dataset.tone !== tone) root.dataset.tone = tone;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    // Pages render their content after this effect on navigation; re-check once it has settled.
    const t = window.setTimeout(update, 250);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, home]);

  return (
    <>
      <div ref={rootRef} data-tone={home ? "dark" : "light"} className="chrome pointer-events-none fixed inset-0 z-40">
        {/* Inner pages: a slim bone bar behind the chrome, so content and sticky bars pass under it cleanly */}
        {!home && <div className="absolute inset-x-0 top-0 h-[84px] border-b border-ink/10 bg-bone/95 backdrop-blur-sm" aria-hidden />}

        {/* Badge */}
        <Link
          href="/"
          aria-label="Serene Heights Nathia Gali, home"
          className={cn(
            "pointer-events-auto absolute left-4 grid place-items-center sm:left-7",
            home ? "chrome-badge top-4 h-[76px] w-[76px] sm:top-7 sm:h-[92px] sm:w-[92px]" : "top-[10px] h-16 w-16"
          )}
        >
          <svg ref={badgeRef} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full will-change-transform" aria-hidden>
            <defs>
              <path id="badge-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            {/* textLength fits the words exactly once around the ring (circumference 2π·38 ≈ 238.8). */}
            <text className="fill-current" style={{ fontSize: "7.6px", fontWeight: 700, letterSpacing: "0.05em" }}>
              <textPath href="#badge-ring" textLength="236" lengthAdjust="spacing">SERENE HEIGHTS · NATHIA GALI ·</textPath>
            </text>
          </svg>
          <span
            aria-hidden
            className={cn("block bg-current", home ? "h-8 w-6 sm:h-9 sm:w-7" : "h-7 w-5")}
            style={{ maskImage: `url(${asset("/brand/mark-cream.png")})`, WebkitMaskImage: `url(${asset("/brand/mark-cream.png")})`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" } as CSSProperties}
          />
        </Link>

        {/* Top right */}
        <nav
          aria-label="Main"
          className={cn(
            "pointer-events-auto absolute right-4 flex text-right sm:right-7",
            home ? "chrome-fade top-5 flex-col items-end gap-3 sm:top-8 sm:gap-7" : "top-0 h-[84px] items-center gap-8"
          )}
        >
          <Link href="/rooms" className={cn("link-serif hidden sm:block", home ? "text-[1.35rem] !leading-[1.35]" : "text-lg")}>
            Select
            {home ? <br /> : " "}
            an apartment
          </Link>
          <div className={cn("flex items-center gap-4", home && "sm:flex-col sm:items-end sm:gap-[11px] sm:[&_.caps]:leading-none sm:[&_.caps]:tracking-[0.24em]", !home && "sm:gap-6")}>
            <Link href="/rooms" className="roll-host caps sm:hidden"><RollText>Book</RollText></Link>
            <Link href="/manage" className="roll-host caps hidden sm:block"><RollText>Find a booking</RollText></Link>
            <AccountLink />
            <button type="button" onClick={() => setOpen(true)} className="roll-host caps flex items-center gap-2" aria-expanded={open} aria-controls="site-menu">
              <RollText>Menu</RollText>
              <span className="flex flex-col gap-[3px]" aria-hidden>
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            </button>
          </div>
        </nav>

        {/* Scroll gauge */}
        {/* Scroll gauge: the 0–100 counter, "Scroll" set vertically, and a line that fills as you go and ends in an arrow */}
        <div className={cn("absolute bottom-6 left-[34px] hidden flex-col items-center gap-4 sm:left-[52px] sm:flex", home && "chrome-fade")} aria-hidden>
          <span ref={countRef} className="caps w-8 text-center tabular-nums">00</span>
          <span className="caps [writing-mode:vertical-rl] rotate-180 tracking-[0.18em]">Scroll</span>
          <span className="relative flex flex-col items-center">
            <span className="relative block h-16 w-px overflow-hidden">
              <span className="absolute inset-0 bg-current opacity-30" />
              <span ref={barRef} className="absolute inset-0 origin-top scale-y-0 bg-current" />
            </span>
            <svg viewBox="0 0 10 6" className="-mt-px h-1.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M1 0.5 L5 5 L9 0.5" />
            </svg>
          </span>
        </div>
      </div>

      {!home && <div className="h-[84px]" aria-hidden />}

      {open && <MenuOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

function AccountLink() {
  const { status, customer } = useAuthStore();
  if (status === "authenticated" && customer) {
    return (
      <Link href="/account" className="roll-host caps hidden sm:block">
        <RollText>{`${customer.firstName}'s stays`}</RollText>
      </Link>
    );
  }
  return (
    <Link href="/login" className="roll-host caps hidden sm:block">
      <RollText>Sign in</RollText>
    </Link>
  );
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const { status, customer } = useAuthStore();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const { data: p } = usePropertyQuery();
  const phone = p?.contact.phone ?? "042-111-111-744";
  const signedIn = status === "authenticated" && !!customer;

  return (
    <div id="site-menu" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Menu" className="menu-in fixed inset-0 z-50 overflow-y-auto bg-pine text-bone">
      <div className="container-page flex min-h-full flex-col py-8">
        <div className="flex items-start justify-between">
          <p className="font-display text-4xl italic text-sky sm:text-5xl">Nathia Gali</p>
          <button type="button" onClick={onClose} className="caps flex items-center gap-2 hover:opacity-60" autoFocus>
            Close <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Site" className="mt-10 flex-1">
          <ul className="space-y-1">
            {NAV.map((n, i) => (
              <li key={n.href} className="menu-item" style={{ "--i": i } as CSSProperties}>
                <Link href={n.href} onClick={onClose} className="group flex items-baseline gap-5 py-1">
                  <span className="caps w-6 text-sky/70">0{i + 1}</span>
                  <span className="font-display text-[2.1rem] font-medium uppercase leading-none transition group-hover:translate-x-2 group-hover:text-sky sm:text-6xl">{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 grid gap-8 border-t border-bone/15 pt-8 sm:grid-cols-3">
          <div>
            <p className="caps text-sky">Reservations</p>
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="mt-2 block font-display text-3xl">{phone}</a>
          </div>
          <div>
            <p className="caps text-sky">Your account</p>
            {signedIn ? (
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <Link href="/account" onClick={onClose} className="underline-offset-4 hover:underline">My bookings</Link>
                <Link href="/account/profile" onClick={onClose} className="underline-offset-4 hover:underline">Profile</Link>
                <button
                  type="button"
                  onClick={async () => {
                    onClose();
                    await logout().unwrap().catch(() => undefined);
                    router.push("/");
                  }}
                  className="underline-offset-4 hover:underline"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-5 text-sm">
                <Link href="/login" onClick={onClose} className="underline-offset-4 hover:underline">Sign in</Link>
                <Link href="/register" onClick={onClose} className="underline-offset-4 hover:underline">Create account</Link>
              </div>
            )}
          </div>
          <div className="sm:text-right">
            <Link href="/rooms" onClick={onClose} className="btn-outline-light">Check availability</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
