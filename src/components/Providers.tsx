"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { PostHogProvider } from "./PostHogProvider";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3-config';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <Suspense fallback={null}>
            <PostHogProvider>{children}</PostHogProvider>
          </Suspense>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
