import Link from "next/link";
import { cn } from "@/global/lib/cn";

/**
 * Round call-to-action: a hairline circle with two arcs that slowly orbit it, and small expanded capitals
 * in the middle ("View available apartments").
 */
export default function CircleLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group relative grid h-40 w-40 shrink-0 place-items-center rounded-full text-center sm:h-44 sm:w-44", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
        <g className="spin-slow" style={{ transformOrigin: "50px 50px" }}>
          <path d="M50 2 A48 48 0 0 1 84 16" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <path d="M50 98 A48 48 0 0 1 16 84" fill="none" stroke="currentColor" strokeWidth="0.9" />
        </g>
      </svg>
      <span className="caps relative max-w-[7.5rem] leading-snug transition duration-500 group-hover:scale-105">{children}</span>
      <span className="absolute inset-3 scale-75 rounded-full bg-current opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-[0.06]" aria-hidden />
    </Link>
  );
}
