import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 text-white shadow-md shadow-brand-900/20",
        className
      )}
      aria-hidden="true"
    >
      <HeartPulse className="size-5" strokeWidth={2.2} />
    </span>
  );
}

export function BrandLockup({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark />
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight text-slate-900">
          Doctor Tracker
        </span>
        {subtitle ? (
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Admin console
          </span>
        ) : null}
      </span>
    </span>
  );
}
