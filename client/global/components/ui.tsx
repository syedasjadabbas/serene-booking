import { AlertCircle, CheckCircle2, Info, Loader2, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/global/lib/cn";
import type { BookingStatus } from "@/global/api/types";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-ink/60", className)} aria-label="Loading" />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="caps flex items-center gap-3 text-ink/60">
        <Spinner /> {label}
      </div>
    </div>
  );
}

export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "error" | "success" | "warning"; title?: string; children?: ReactNode; className?: string }) {
  const styles = {
    info: "border-sky-dark/60 bg-sky-light/60 text-ink",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];
  const Icon = tone === "error" || tone === "warning" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 border-l-2 p-4 text-sm", styles, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold text-current">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-4 w-4", i <= Math.round(rating) ? "fill-ink text-ink" : "text-ink/20")} />
      ))}
    </span>
  );
}

export function StatusPill({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, [string, string]> = {
    CONFIRMED: ["Confirmed", "border-emerald-700/40 text-emerald-800"],
    COMPLETED: ["Completed", "border-ink/25 text-ink/70"],
    CANCELLED: ["Cancelled", "border-red-700/40 text-red-700"],
    NO_SHOW: ["No-show", "border-amber-700/40 text-amber-800"],
  };
  const [label, cls] = map[status];
  return <span className={cn("caps inline-flex items-center border px-2.5 py-1 text-[10px]", cls)}>{label}</span>;
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border border-ink/10 bg-white/60 px-6 py-16 text-center">
      {icon && <div className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-ink/15 text-ink">{icon}</div>}
      <h3 className="text-2xl uppercase">{title}</h3>
      {children && <div className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">{children}</div>}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
