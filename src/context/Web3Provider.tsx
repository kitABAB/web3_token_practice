'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, sepolia } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { wagmiAdapter, projectId } from '@/config/wagmi'

const queryClient = new QueryClient()

if (!projectId) {
  console.warn('Project ID is not defined')
}

const metadata = {
  name: 'ERC20 Faucet',
  description: 'A simple ERC20 token faucet DApp',
  url: 'https://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, mainnet],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: false,
  },
})

export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
