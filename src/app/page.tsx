'use client'

import { Droplets } from 'lucide-react'
import { WalletInfo } from '@/components/WalletInfo'
import { FaucetClaim } from '@/components/FaucetClaim'
import { SendTransaction } from '@/components/SendTransaction'
import { TransactionHistory } from '@/components/TransactionHistory'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">KUN Faucet</h1>
              <p className="text-xs text-muted-foreground">KUN Token 水龙头</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <w3m-network-button />
            <w3m-button />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <WalletInfo />

          <div className="grid md:grid-cols-2 gap-6">
            <FaucetClaim />
            <SendTransaction />
          </div>

          <TransactionHistory />
        </div>
      </main>

      <footer className="border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ERC20 Faucet DApp - 基于 Next.js + wagmi + Reown AppKit 构建</p>
        </div>
      </footer>
    </div>
  )
}
