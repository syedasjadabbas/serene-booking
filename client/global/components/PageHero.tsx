import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Parallax, SplitLines } from "./motion";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";

type Crumb = { href?: string; label: string };

// Inner-page opening in the home page's editorial language: a full-bleed photo that drifts on scroll, a
// small-caps breadcrumb, the title in large Roman capitals rising line by line at the bottom left, and the
// subtitle set beside it on wide screens above a hairline with the property name.
export default function PageHero({
  image,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  crumbs = [],
  size = "md",
  children,
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  /** Use "\n" to break the title into lines that animate in one after another. */
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  size?: "sm" | "md";
  children?: ReactNode;
}) {
  return (
    <section data-theme="dark" className="relative isolate overflow-hidden text-bone">
      <Parallax speed={-0.1} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <div className="ken-burns relative h-full w-full">
          <Image src={asset(image)} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/30" />

      <div className={cn("container-page flex flex-col justify-end", size === "sm" ? "min-h-[440px] pb-10 pt-24 sm:min-h-[520px]" : "min-h-[540px] pb-12 pt-28 sm:min-h-[640px]")}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="caps fade-up mb-8 flex flex-wrap items-center gap-2 text-bone/70">
            <Link href="/" className="hover:text-bone">Home</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-2">
                <span aria-hidden className="text-bone/40">/</span>
                {c.href ? <Link href={c.href} className="hover:text-bone">{c.label}</Link> : <span className="text-bone">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {eyebrow && (
              <p className="caps fade-up flex items-center gap-4 text-bone/85" style={{ animationDelay: "100ms" }}>
                {eyebrow}
                <span className="block h-px w-14 bg-bone/40" aria-hidden />
              </p>
            )}
            <h1 className="mt-5 text-[2.5rem] leading-[1.02] text-bone sm:text-6xl lg:text-[5.2rem]">
              <SplitLines lines={title.split("\n")} baseDelay={150} />
            </h1>
          </div>
          {(subtitle || children) && (
            <div className="lg:col-span-4 lg:pb-2">
              {subtitle && (
                <p className="fade-up max-w-md text-[15px] leading-relaxed text-bone/85" style={{ animationDelay: "450ms" }}>
                  {subtitle}
                </p>
              )}
              {children && <div className="fade-up mt-6" style={{ animationDelay: "600ms" }}>{children}</div>}
            </div>
          )}
        </div>

        <div className="caps fade-up mt-10 flex items-center justify-between gap-4 border-t border-bone/20 pt-5 text-bone/60" style={{ animationDelay: "700ms" }}>
          <span>Serene Heights</span>
          <span>Nathia Gali · 7,906 ft</span>
        </div>
      </div>
    </section>
  );
}
