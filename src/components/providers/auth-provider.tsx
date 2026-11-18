"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetch, fetcher } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, mutate } = useSWR<{ user: User }>("/auth/me", fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiFetch<{ user: User }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await mutate(response, { revalidate: false });
    },
    [mutate]
  );

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    await mutate(undefined, { revalidate: false });
    router.replace("/login");
  }, [mutate, router]);

  useEffect(() => {
    const onExpired = () => {
      void mutate(undefined, { revalidate: false });
      if (!pathname.startsWith("/login")) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [mutate, pathname, router]);

  return (
    <AuthContext.Provider
      value={{ user: data?.user ?? null, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
