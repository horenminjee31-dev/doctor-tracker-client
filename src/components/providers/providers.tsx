"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        keepPreviousData: true,
        dedupingInterval: 2000,
      }}
    >
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </SWRConfig>
  );
}
