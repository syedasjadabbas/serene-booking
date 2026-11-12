"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, MapPin, MessageCircle, Youtube } from "lucide-react";
import Logo from "./Logo";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";

// Dark inset footer card with a large contact line (reference design).
export default function SiteFooter() {
  const { data: p } = usePropertyQuery();
  const phone = p?.contact.phone ?? "042-111-111-744";
  return (
    <footer className="panel relative mb-2.5 mt-16 bg-ink text-white/80 sm:mb-4 lg:mb-6">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 800 400" preserveAspectRatio="none">
        <path d="M0 260 C 220 140, 360 330, 560 210 S 760 90, 800 130" fill="none" stroke="#dcf26b" strokeWidth="1" />
        <path d="M0 340 C 160 280, 380 380, 600 300 S 780 250, 800 270" fill="none" stroke="#dcf26b" strokeWidth="1" />
      </svg>
      <div className="container-page relative py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr]">
          <nav aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Quick links</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-lime" href="/rooms">Apartments & rates</Link></li>
              <li><Link className="hover:text-lime" href="/amenities">Amenities</Link></li>
              <li><Link className="hover:text-lime" href="/floor-plans">Floor plans</Link></li>
              <li><Link className="hover:text-lime" href="/manage">Manage a booking</Link></li>
              <li><Link className="hover:text-lime" href="/account">My account</Link></li>
            </ul>
          </nav>
          <div className="flex flex-col items-start md:items-center md:text-center">
            <Logo tone="cream" />
            <p className="mt-4 max-w-xs text-sm text-white/60">Fully furnished hotel apartments at 7,906 ft. Developed by {p?.developer ?? "DM Consortium"}.</p>
          </div>
          <div className="md:justify-self-end">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Social</p>
            <ul className="mt-4 space-y-2 text-sm">
              {p &&
                [
                  { href: p.contact.social.instagram, Icon: Instagram, label: "Instagram" },
                  { href: p.contact.social.facebook, Icon: Facebook, label: "Facebook" },
                  { href: p.contact.social.youtube, Icon: Youtube, label: "YouTube" },
                  { href: p.contact.social.linkedin, Icon: Linkedin, label: "LinkedIn" },
                ].map(({ href, Icon, label }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-lime">
                      <Icon className="h-4 w-4" /> {label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Reservations</p>
          <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="mt-2 block text-4xl font-bold tracking-tight text-white hover:text-lime sm:text-6xl">
            {phone}
          </a>
          <div className="mt-6 flex flex-col gap-2 text-sm sm:flex-row sm:gap-8">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-lime" />{p?.address ?? "Kala Bagh Air Base Road, Nathia Gali"}</span>
            {p && <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-lime" />WhatsApp {p.contact.whatsapp}</span>}
          </div>
          <p className="mt-8 text-xs text-white/40">© {new Date().getFullYear()} Serene Heights Nathia Gali · Prices in Pakistani rupees.</p>
        </div>
      </div>
    </footer>
  );
}
