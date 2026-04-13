'use client'

import { useState } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { Check, Copy, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTokenBalance } from '@/hooks/useTokenBalance'

export function WalletInfo() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [copied, setCopied] = useState(false)

  const { data: ethBalance } = useBalance({
    address,
  })

  const { formattedBalance, symbol, isLoading: tokenLoading } = useTokenBalance()

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getNetworkName = () => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
      case 11155111:
        return 'Sepolia Testnet'
      default:
        return 'Unknown Network'
    }
  }

  const getNetworkBadgeVariant = () => {
    switch (chainId) {
      case 1:
        return 'default'
      case 11155111:
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            钱包信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            请先连接钱包
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            钱包信息
          </div>
          <Badge variant={getNetworkBadgeVariant()}>{getNetworkName()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">钱包地址</span>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-lg truncate">
              {address}
            </code>
            <Button variant="outline" size="sm" onClick={copyAddress}>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">ETH 余额</span>
            <p className="text-xl font-semibold">
              {ethBalance
                ? `${(Number(ethBalance.value) / 10 ** ethBalance.decimals).toFixed(4)} ETH`
                : '加载中...'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">{symbol} 余额</span>
            <p className="text-xl font-semibold">
              {tokenLoading
                ? '加载中...'
                : `${parseFloat(formattedBalance).toFixed(2)} ${symbol}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
