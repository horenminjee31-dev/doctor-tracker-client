import type { Metadata } from "next";
import { Suspense } from "react";
import { Activity, BarChart3, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/brand";

export const metadata: Metadata = {
  title: "Sign in",
};

const highlights = [
  {
    icon: ShieldCheck,
    title: "Protected by design",
    copy: "Every route and API call requires an authenticated session.",
  },
  {
    icon: Activity,
    title: "Fast by default",
    copy: "Indexed queries keep search, filters, and pagination instant.",
  },
  {
    icon: BarChart3,
    title: "Insights that matter",
    copy: "Track patient volume, conditions, and doctor load at a glance.",
  },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(31,163,140,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(79,70,229,0.28), transparent 50%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <BrandMark className="bg-none bg-white/10 shadow-none ring-1 ring-white/15" />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">Doctor Tracker</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
              Admin console
            </p>
          </div>
        </div>

        <div className="relative mt-auto max-w-lg">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">
            <span className="size-1.5 rounded-full bg-brand-300" />
            Built for busy clinics
          </p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Every doctor.
            <br />
            Every patient.
            <br />
            <span className="text-brand-300">One clear view.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            A focused operations dashboard for care teams — crisp records, fast lookups,
            and analytics that surface what needs attention.
          </p>

          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-white/10">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{title}</span>
                  <span className="block text-sm text-white/50">{copy}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 text-xs text-white/35">
          © {new Date().getFullYear()} Doctor Tracker. Internal tooling — authorised staff only.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white/60" />}>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
