import { AlertCircle, CheckCircle2, Info, Loader2, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/global/lib/cn";
import type { BookingStatus } from "@/global/api/types";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-brand-600", className)} aria-label="Loading" />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <Spinner /> {label}
      </div>
    </div>
  );
}

export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "error" | "success" | "warning"; title?: string; children?: ReactNode; className?: string }) {
  const styles = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];
  const Icon = tone === "error" || tone === "warning" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-4 text-sm", styles, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-4 w-4", i <= Math.round(rating) ? "fill-gold text-gold" : "text-zinc-300")} />
      ))}
    </span>
  );
}

export function StatusPill({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, [string, string]> = {
    CONFIRMED: ["Confirmed", "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"],
    COMPLETED: ["Completed", "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200"],
    CANCELLED: ["Cancelled", "bg-red-50 text-red-700 ring-1 ring-red-200"],
    NO_SHOW: ["No-show", "bg-amber-50 text-amber-700 ring-1 ring-amber-200"],
  };
  const [label, cls] = map[status];
  return <span className={cn("pill", cls)}>{label}</span>;
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {children && <div className="mt-1 max-w-md text-sm text-zinc-500">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
