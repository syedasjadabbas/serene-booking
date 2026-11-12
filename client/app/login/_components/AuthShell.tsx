import Image from "next/image";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

const PERKS = ["See every booking in one place", "Book faster with saved details", "Review your stay after check-out"];

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] gap-6 p-2.5 sm:p-4 lg:grid-cols-2 lg:p-6">
      <div className="relative hidden overflow-hidden rounded-[36px] lg:block">
        <div className="ken-burns absolute inset-0">
          <Image src="/images/resort/night-facade-portrait.jpg" alt="Serene Heights lit up on a snowy evening" fill sizes="50vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="fade-up text-xs font-semibold uppercase tracking-[0.25em] text-lime">Serene Heights Nathia Gali</p>
          <p className="fade-up mt-3 text-4xl font-bold leading-tight" style={{ animationDelay: "120ms" }}>Your mountain home at 7,906 ft</p>
          <ul className="mt-6 space-y-2">
            {PERKS.map((p, i) => (
              <li key={p} className="fade-up flex items-center gap-2 text-sm text-white/85" style={{ animationDelay: `${260 + i * 100}ms` }}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lime text-ink"><Check className="h-3 w-3" /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="fade-up w-full max-w-md">
          <h1 className="text-4xl">{title}</h1>
          <p className="mt-2 text-zinc-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
