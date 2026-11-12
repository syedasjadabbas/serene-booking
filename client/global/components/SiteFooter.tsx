"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Youtube } from "lucide-react";
import Logo from "./Logo";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";

export default function SiteFooter() {
  const { data: p } = usePropertyQuery();
  return (
    <footer className="mt-20 bg-brand-800 text-cream/90">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo tone="cream" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70">
            {p?.description ?? "Fully furnished hotel apartments at 7,906 ft in Nathia Gali."}
          </p>
          {p && (
            <div className="mt-5 flex gap-2">
              {[
                { href: p.contact.social.instagram, Icon: Instagram, label: "Instagram" },
                { href: p.contact.social.facebook, Icon: Facebook, label: "Facebook" },
                { href: p.contact.social.youtube, Icon: Youtube, label: "YouTube" },
                { href: p.contact.social.linkedin, Icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-lg border border-cream/20 p-2 hover:bg-white/10">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display text-sm font-medium uppercase tracking-widest text-cream">Stay</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/rooms">Apartments & rates</Link></li>
            <li><Link className="hover:text-white" href="/amenities">Amenities</Link></li>
            <li><Link className="hover:text-white" href="/floor-plans">Floor plans</Link></li>
            <li><Link className="hover:text-white" href="/manage">Manage a booking</Link></li>
            <li><Link className="hover:text-white" href="/account">My account</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-medium uppercase tracking-widest text-cream">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{p?.address ?? "Kala Bagh Air Base Road, Nathia Gali"}</li>
            {p && (
              <>
                <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /><a href={`tel:${p.contact.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white">{p.contact.phone}</a></li>
                <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" />WhatsApp {p.contact.whatsapp}</li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-cream/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Serene Heights Nathia Gali · Developed by {p?.developer ?? "DM Consortium"}</p>
          <p>Prices in Pakistani rupees, including taxes where shown.</p>
        </div>
      </div>
    </footer>
  );
}
