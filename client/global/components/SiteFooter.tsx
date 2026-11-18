"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { asset } from "@/global/lib/asset";
import RollText from "./RollText";

// The parent site. On the group domain "/" is the group home; override for other setups.
const GROUP_URL = process.env.NEXT_PUBLIC_GROUP_URL || "/";

const mark = asset("/brand/mark-cream.png");
const markStyle = {
  maskImage: `url(${mark})`,
  WebkitMaskImage: `url(${mark})`,
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
} as CSSProperties;

const EXPLORE = [
  { href: "/rooms", label: "Apartments & rates" },
  { href: "/amenities", label: "Amenities" },
  { href: "/floor-plans", label: "Floor plans" },
  { href: "/contact", label: "Location & contact" },
  { href: "/manage", label: "Manage a booking" },
  { href: "/account", label: "My account" },
];

const digits = (s: string) => s.replace(/[^0-9+]/g, "");

// Deep pine footer: an invitation to book, four calm columns (reservations, location, explore, follow), a large
// quiet wordmark across the base, and a slim bar with the legal line and "to top".
export default function SiteFooter() {
  const { data: p } = usePropertyQuery();
  const phone = p?.contact.phone ?? "042-111-111-744";
  const whatsapp = p?.contact.whatsapp;
  const socials = p
    ? [
        { href: p.contact.social.instagram, label: "Instagram" },
        { href: p.contact.social.facebook, label: "Facebook" },
        { href: p.contact.social.youtube, label: "YouTube" },
        { href: p.contact.social.linkedin, label: "LinkedIn" },
      ]
    : [];

  return (
    <footer data-theme="dark" className="relative overflow-hidden bg-pine text-bone">
      <div className="container-page pt-24 sm:pt-32">
        {/* Invitation */}
        <div className="grid gap-10 border-b border-bone/15 pb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span aria-hidden className="block h-11 w-8 bg-sky" style={markStyle} />
            <h2 className="mt-8 max-w-3xl text-[2.2rem] normal-case leading-[1.1] text-bone sm:text-5xl lg:text-[3.6rem]">
              Your mountain home is <span className="italic text-sky">waiting.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-bone/65">
              Book in minutes and pay at the property, or call us and we&apos;ll help you choose the right apartment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Link href="/rooms" className="btn-gold group gap-3">
              Check availability <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            {whatsapp && (
              <a href={`https://wa.me/${digits(whatsapp).replace("+", "")}`} target="_blank" rel="noreferrer" className="btn-outline-light">
                WhatsApp us
              </a>
            )}
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="caps text-sky">Reservations</p>
            <a href={`tel:${digits(phone)}`} className="mt-4 block font-display text-3xl leading-none transition hover:text-sky">
              {phone}
            </a>
            {whatsapp && <p className="mt-3 text-sm text-bone/65">WhatsApp {whatsapp}</p>}
            <p className="mt-1 text-sm text-bone/65">Front desk open 24/7</p>
          </div>
          <div>
            <p className="caps text-sky">The resort</p>
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-bone/80">{p?.address ?? "Kala Bagh Air Base Road, Nathia Gali"}</p>
            {p?.contact.headOffice && <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-bone/55">Head office: {p.contact.headOffice}</p>}
          </div>
          <nav aria-label="Footer">
            <p className="caps text-sky">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="roll-host text-sm text-bone/80 hover:text-bone">
                    <RollText>{l.label}</RollText>
                  </Link>
                </li>
              ))}
              {/* Plain <a>: the group site sits outside this app's /booking base path. */}
              <li>
                <a href={GROUP_URL} className="roll-host text-sm text-bone/80 hover:text-bone">
                  <RollText>Serene Heights Group ↗</RollText>
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <p className="caps text-sky">Follow</p>
            <ul className="mt-4 space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="roll-host text-sm text-bone/80 hover:text-bone">
                    <RollText>{s.label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Wordmark */}
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[10vw] font-medium uppercase leading-[0.85] tracking-[0.02em] text-bone/[0.07]">
        Serene Heights
      </p>

      {/* Legal bar */}
      <div className="container-page flex flex-col gap-4 border-t border-bone/15 py-6 text-xs text-bone/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Serene Heights Nathia Gali · Developed by {p?.developer ?? "DM Consortium"} · Prices in Pakistani rupees
        </p>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="roll-host caps flex items-center gap-2 text-bone/80 hover:text-bone">
          <RollText>Back to top</RollText> <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}
