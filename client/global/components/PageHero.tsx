import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Parallax, SplitLines } from "./motion";
import { cn } from "@/global/lib/cn";

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
    <section className="panel relative isolate mt-3 sm:mt-6 lg:mt-8">
      <Parallax speed={-0.1} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <div className="ken-burns relative h-full w-full">
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-ink/85 via-ink/45 to-ink/10" />
      <div className={cn("container-page flex flex-col justify-end text-white", size === "sm" ? "min-h-[300px] py-10" : "min-h-[440px] py-12 sm:min-h-[480px]")}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="fade-up mb-5 inline-flex w-fit flex-wrap items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white/85 ring-1 ring-white/20 backdrop-blur">
            <Link href="/" className="hover:text-lime">Home</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {c.href ? <Link href={c.href} className="hover:text-lime">{c.label}</Link> : <span className="text-white">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="fade-up text-xs font-semibold uppercase tracking-[0.25em] text-lime" style={{ animationDelay: "100ms" }}>{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-[1.08] text-white sm:text-6xl">
          <SplitLines lines={title.split("\n")} baseDelay={150} />
        </h1>
        {subtitle && <p className="fade-up mt-4 max-w-xl text-sm text-white/80 sm:text-base" style={{ animationDelay: "450ms" }}>{subtitle}</p>}
        {children && <div className="fade-up mt-8" style={{ animationDelay: "600ms" }}>{children}</div>}
      </div>
    </section>
  );
}
