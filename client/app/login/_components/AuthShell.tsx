import Image from "next/image";
import type { ReactNode } from "react";

import { asset } from "@/global/lib/asset";
const PERKS = ["See every booking in one place", "Book faster with saved details", "Review your stay after check-out"];

// Editorial split screen for sign-in and registration: a full-height interior photo with the property line in
// Roman capitals and the perks as a ruled list, and the form on bone paper under a small-caps label and rule.
// On phones the photo becomes a short band above the form.
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100svh-84px)] lg:grid-cols-2">
      <div data-theme="dark" className="relative isolate h-56 overflow-hidden text-bone sm:h-72 lg:h-auto">
        <div className="ken-burns absolute inset-0 -z-10">
          <Image
            src={asset("/images/interiors/bedroom-arch-window.jpg")}
            alt="Apartment bedroom with an arched window over the mountains"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />

        <div className="flex h-full flex-col justify-end px-5 pb-6 sm:px-8 sm:pb-8 lg:px-14 lg:pb-14">
          <p className="caps fade-up flex items-center gap-4 text-bone/85">
            Serene Heights Nathia Gali
            <span className="block h-px w-14 bg-bone/40" aria-hidden />
          </p>
          <p className="fade-up mt-4 max-w-lg font-display text-[1.9rem] uppercase leading-[1.04] text-bone sm:text-5xl lg:text-[3.6rem]" style={{ animationDelay: "120ms" }}>
            Your mountain home at 7,906 ft
          </p>
          <ul className="mt-10 hidden max-w-lg divide-y divide-bone/20 border-y border-bone/20 lg:block">
            {PERKS.map((p, i) => (
              <li key={p} className="caps fade-up flex items-center gap-3 py-3.5 text-bone/85" style={{ animationDelay: `${260 + i * 100}ms` }}>
                <span className="h-1 w-1 shrink-0 rounded-full bg-bone" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-bone px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
        <div className="fade-up w-full max-w-md">
          <p className="caps flex items-center gap-4 text-ink">
            My account
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h1 className="mt-5 text-[2.3rem] leading-[1.04] sm:text-5xl">{title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/65">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
