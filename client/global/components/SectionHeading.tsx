import type { ReactNode } from "react";
import { Reveal, RevealWords } from "./motion";
import { cn } from "@/global/lib/cn";

/**
 * Editorial section heading used across the inner pages: a small-caps label with a hairline rule, the title
 * in Roman capitals rising word by word, and an optional short paragraph and action on the side.
 */
export default function SectionHeading({
  label,
  title,
  children,
  action,
  align = "left",
  className,
}: {
  label?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const center = align === "center";
  return (
    <div className={cn("flex flex-col gap-6", !center && "lg:flex-row lg:items-end lg:justify-between", center && "items-center text-center", className)}>
      <div className={cn(center && "flex flex-col items-center")}>
        {label && (
          <Reveal className={cn("flex items-center gap-4", center && "justify-center")}>
            <span className="caps">{label}</span>
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </Reveal>
        )}
        <h2 className={cn("mt-5 max-w-3xl text-[2rem] leading-[1.08] sm:text-5xl", center && "mx-auto")}>
          <RevealWords text={title} />
        </h2>
        {children && (
          <Reveal delay={150}>
            <div className={cn("mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70", center && "mx-auto")}>{children}</div>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={200} className="shrink-0">{action}</Reveal>}
    </div>
  );
}
