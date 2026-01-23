"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { PostHogProvider } from "./PostHogProvider";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/web3modal-config';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
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
