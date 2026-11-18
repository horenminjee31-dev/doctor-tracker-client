"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const DEMO = { email: "admin@doctortracker.dev", password: "Admin@12345" };

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextErrors: typeof fieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <BrandLockup />
      </div>

      <div className="mb-8">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-100">
          <ShieldCheck className="size-3.5" />
          Secure admin access
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to manage doctors, patients, and practice performance.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="relative">
          <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
            <Mail className="pointer-events-none absolute left-3.5 top-[38px] size-4 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@clinic.com"
              className={cn(
                "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                fieldErrors.email && "border-rose-300"
              )}
            />
          </Field>
        </div>

        <Field label="Password" htmlFor="password" error={fieldErrors.password}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={cn(
                "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                fieldErrors.password && "border-rose-300"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? "Signing in…" : "Sign in to console"}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Sparkles className="size-3.5 text-brand-600" />
              Demo credentials
            </p>
            <p className="mt-2 font-mono text-xs text-slate-600">{DEMO.email}</p>
            <p className="font-mono text-xs text-slate-600">{DEMO.password}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO.email);
              setPassword(DEMO.password);
              setFieldErrors({});
            }}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            Autofill
          </button>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <TrendingUp className="size-3.5" />
        Session protected with an httpOnly, signed JWT cookie
      </p>
    </div>
  );
}
