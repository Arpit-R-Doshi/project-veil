"use client";

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy, sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

// 1. Configure the Blockchain Networks (We use Polygon Amoy Testnet & Sepolia)
const config = getDefaultConfig({
  appName: 'Project Veil',
  projectId: 'demo_hackathon_id', // This is just a placeholder ID
  chains: [polygonAmoy, sepolia],
  ssr: true, // Required for Next.js App Router
});

// 2. Set up the data fetcher
const queryClient = new QueryClient();

// 3. The Provider Component
export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} coolMode>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}