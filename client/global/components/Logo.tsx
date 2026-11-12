import Image from "next/image";
import Link from "next/link";
import { cn } from "@/global/lib/cn";

// Mark from the official Serene Heights logo, with the wordmark set in Jost to stay legible at header size.
export default function Logo({ tone = "green", className }: { tone?: "green" | "cream"; className?: string }) {
  const cream = tone === "cream";
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Serene Heights Nathia Gali, home">
      <Image src={cream ? "/brand/mark-cream.png" : "/brand/mark-green.png"} alt="" width={30} height={40} priority className="h-9 w-auto shrink-0 sm:h-10" />
      <span className="whitespace-nowrap leading-none">
        <span className={cn("block font-logo text-[15px] font-normal tracking-[0.14em] sm:text-lg sm:tracking-[0.18em]", cream ? "text-cream" : "text-brand-600")}>SERENE HEIGHTS</span>
        <span className={cn("mt-1 block text-[9px] font-medium tracking-[0.3em] sm:text-[10px] sm:tracking-[0.32em]", cream ? "text-cream/80" : "text-brand-500")}>NATHIA GALI</span>
      </span>
    </Link>
  );
}
