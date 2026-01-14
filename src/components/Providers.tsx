"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { PostHogProvider } from "./PostHogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <PostHogProvider>{children}</PostHogProvider>
      </Suspense>
    </SessionProvider>
  );
}
