"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUp } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { asset } from "@/global/lib/asset";

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

// Dark pine footer: the mark, the reservations number set huge in the display serif, then address,
// links and social in small expanded capitals.
export default function SiteFooter() {
  const { data: p } = usePropertyQuery();
  const phone = p?.contact.phone ?? "042-111-111-744";
  const socials = p
    ? [
        { href: p.contact.social.instagram, label: "Instagram" },
        { href: p.contact.social.facebook, label: "Facebook" },
        { href: p.contact.social.youtube, label: "YouTube" },
        { href: p.contact.social.linkedin, label: "LinkedIn" },
      ]
    : [];

  return (
    <footer data-theme="dark" className="relative bg-pine text-bone">
      <div className="container-page flex flex-col items-center pb-10 pt-24 text-center sm:pt-32">
        <span aria-hidden className="block h-12 w-9 bg-sky" style={markStyle} />
        <p className="caps mt-8 text-sky">Reservations</p>
        <a
          href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
          className="mt-4 block font-display text-[3.4rem] leading-none text-bone transition hover:text-sky sm:text-[7rem] lg:text-[10rem]"
        >
          {phone}
        </a>
        <p className="caps mt-8 max-w-sm leading-relaxed text-bone/80">{p?.address ?? "Kala Bagh Air Base Road, Nathia Gali"}</p>
        {p && <p className="caps mt-2 text-bone/60">WhatsApp {p.contact.whatsapp}</p>}

        <div className="mt-20 grid w-full gap-10 border-t border-bone/15 pt-10 text-left sm:grid-cols-3">
          <nav aria-label="Footer">
            <p className="caps text-sky">Stay</p>
            <ul className="mt-4 space-y-2 text-sm text-bone/80">
              <li><Link className="hover:text-bone" href="/rooms">Apartments & rates</Link></li>
              <li><Link className="hover:text-bone" href="/amenities">Amenities</Link></li>
              <li><Link className="hover:text-bone" href="/floor-plans">Floor plans</Link></li>
              <li><Link className="hover:text-bone" href="/manage">Manage a booking</Link></li>
              <li><Link className="hover:text-bone" href="/account">My account</Link></li>
              {/* Plain <a>: the group site sits outside this app's /booking base path. */}
              <li><a className="hover:text-bone" href={GROUP_URL}>Serene Heights Group ↗</a></li>
            </ul>
          </nav>
          <div>
            <p className="caps text-sky">Follow</p>
            <ul className="mt-4 space-y-2 text-sm text-bone/80">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-bone">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start justify-between gap-6 sm:items-end">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="caps flex items-center gap-2 hover:text-sky">
              To top <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs text-bone/50 sm:text-right">
              Developed by {p?.developer ?? "DM Consortium"}.
              <br />© {new Date().getFullYear()} Serene Heights Nathia Gali · Prices in Pakistani rupees.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
