import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="/images/hero/tower-view.png" alt="Serene Heights tower in the snow" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-cream">
          <p className="eyebrow text-gold-light">Serene Heights Nathia Gali</p>
          <p className="mt-2 font-display text-3xl font-light">Your mountain home at 7,906 ft</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-medium">{title}</h1>
          <p className="mt-2 text-zinc-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
