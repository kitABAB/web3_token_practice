'use client'

import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import {
  History,
  ExternalLink,
  Copy,
  Check,
  Droplets,
  Send,
  ArrowUpRight,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  useTransactionStore,
  type Transaction,
  type TransactionType,
} from '@/store/transactionStore'

const MAX_TRANSACTIONS = 10

export function TransactionHistory() {
  const { address, isConnected } = useAccount()
  const allTransactions = useTransactionStore((state) => state.transactions)
  const clearHistory = useTransactionStore((state) => state.clearHistory)
  
  const transactions = useMemo(() => {
    if (!address) return []
    return allTransactions
      .filter((tx) => tx.from.toLowerCase() === address.toLowerCase())
      .slice(0, MAX_TRANSACTIONS)
  }, [allTransactions, address])
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const copyToClipboard = async (hash: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const getExplorerUrl = (hash: string, chainId: number) => {
    if (chainId === 1) {
      return `https://etherscan.io/tx/${hash}`
    }
    return `https://sepolia.etherscan.io/tx/${hash}`
  }

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'claim':
        return <Droplets className="w-4 h-4" />
      case 'send_token':
        return <Send className="w-4 h-4" />
      case 'send_eth':
        return <ArrowUpRight className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'claim':
        return '领取'
      case 'send_token':
        return '发送 Token'
      case 'send_eth':
        return '发送 ETH'
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">待确认</Badge>
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600">成功</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600">失败</Badge>
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            交易记录
          </CardTitle>
          <CardDescription>最近 10 笔交易（存储在本地）</CardDescription>
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
            <History className="w-5 h-5" />
            交易记录
          </div>
          {transactions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          )}
        </CardTitle>
        <CardDescription>最近 10 笔交易（存储在本地）</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">暂无交易记录</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={tx.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTypeLabel(tx.type)}</span>
                        {getStatusBadge(tx.status)}
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">{tx.amount}</span>{' '}
                        <span className="text-muted-foreground">
                          {tx.tokenSymbol}
                        </span>
                      </p>
                      {tx.to && (
                        <p className="text-xs text-muted-foreground">
                          到: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTime(tx.timestamp)}</span>
                        <span>·</span>
                        <code className="font-mono">{truncateHash(tx.hash)}</code>
                        <button
                          onClick={() => copyToClipboard(tx.hash)}
                          className="hover:text-foreground"
                        >
                          {copiedHash === tx.hash ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={getExplorerUrl(tx.hash, tx.chainId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
