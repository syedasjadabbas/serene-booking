import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Parallax, SplitLines } from "./motion";
import { cn } from "@/global/lib/cn";

import { asset } from "@/global/lib/asset";
type Crumb = { href?: string; label: string };

// Inner-page banner in the same language as the home hero: inset rounded panel, slow-zoom photo
// that drifts on scroll, breadcrumb pill, headline lines that rise in.
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
    <section data-theme="dark" className="relative isolate overflow-hidden">
      <Parallax speed={-0.1} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <div className="ken-burns relative h-full w-full">
          <Image src={asset(image)} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/25" />
      <div className={cn("container-page flex flex-col justify-end text-white", size === "sm" ? "min-h-[380px] py-12 sm:min-h-[440px]" : "min-h-[480px] py-14 sm:min-h-[580px]")}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="caps fade-up mb-6 inline-flex w-fit flex-wrap items-center gap-1.5 text-white/80">
            <Link href="/" className="hover:text-lime">Home</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {c.href ? <Link href={c.href} className="hover:text-lime">{c.label}</Link> : <span className="text-white">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="caps fade-up text-white/85" style={{ animationDelay: "100ms" }}>{eyebrow}</p>}
        <h1 className="mt-4 max-w-5xl text-[3.2rem] leading-[0.88] text-white sm:text-8xl lg:text-[8.5rem]">
          <SplitLines lines={title.split("\n")} baseDelay={150} />
        </h1>
        {subtitle && <p className="fade-up mt-6 max-w-xl text-[15px] text-white/85 sm:text-base" style={{ animationDelay: "450ms" }}>{subtitle}</p>}
        {children && <div className="fade-up mt-8" style={{ animationDelay: "600ms" }}>{children}</div>}
      </div>
    </section>
  );
}
