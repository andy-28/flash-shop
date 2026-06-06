"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/admin/Toast";
import { PageTransition } from "@/components/shared/PageTransition";
import { TopLoadingBar } from "@/components/shared/TopLoadingBar";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TopLoadingBar />
        <PageTransition>{children}</PageTransition>
      </ToastProvider>
    </QueryClientProvider>
  );
}
