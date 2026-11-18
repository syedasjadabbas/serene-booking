"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="w-[min(34rem,calc(100vw-2rem))] rounded-none border border-ink/15 bg-bone p-0 text-ink shadow-pop backdrop:bg-ink/60"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-ink/15 pb-5">
          <h2 className="text-2xl leading-[1.1] sm:text-[1.75rem]">{title}</h2>
          <button onClick={onClose} className="-mr-1 grid h-9 w-9 shrink-0 place-items-center border border-ink/20 text-ink transition hover:border-ink hover:bg-ink hover:text-bone" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}
