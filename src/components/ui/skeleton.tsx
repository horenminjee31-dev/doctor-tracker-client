import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200/70", className)} style={style} />;
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 p-5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn("h-4 flex-1", columnIndex === 0 && "min-w-32")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full min-h-56 items-end gap-3 px-2 pb-6", className)} aria-hidden="true">
      {[45, 70, 55, 85, 60, 95].map((height, index) => (
        <Skeleton key={index} className="w-full rounded-t-lg" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}
