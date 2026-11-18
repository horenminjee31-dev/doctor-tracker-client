"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: Tone;
};

type ToastItem = ToastInput & { id: number };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<Tone, { icon: ReactNode; ring: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle2 className="size-5" />,
    ring: "ring-emerald-200",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: <XCircle className="size-5" />,
    ring: "ring-rose-200",
    iconColor: "text-rose-600",
  },
  info: {
    icon: <Info className="size-5" />,
    ring: "ring-slate-200",
    iconColor: "text-slate-500",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current.slice(-3), { tone: "info", ...input, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 4200)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((item) => {
          const tone = toneStyles[item.tone ?? "info"];
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex w-full items-start gap-3 rounded-2xl bg-white p-4 shadow-float ring-1 animate-rise sm:w-80",
                tone.ring
              )}
              role="status"
            >
              <span className={cn("mt-0.5 shrink-0", tone.iconColor)}>{tone.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
