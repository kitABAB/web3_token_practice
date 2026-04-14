'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  hash: string
  chainId: number
  details?: {
    address?: string
    amount?: string
    tokenSymbol?: string
  }
}

export function TransactionDialog({
  open,
  onOpenChange,
  title,
  description,
  hash,
  chainId,
  details,
}: TransactionDialogProps) {
  const [copied, setCopied] = useState(false)

  const getExplorerUrl = (hash: string) => {
    if (chainId === 1) {
      return `https://etherscan.io/tx/${hash}`
    }
    return `https://sepolia.etherscan.io/tx/${hash}`
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {details?.address && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">地址</span>
              <span className="font-mono">
                {details.address.slice(0, 6)}...{details.address.slice(-4)}
              </span>
            </div>
          )}

          {details?.amount && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">数量</span>
              <span className="font-semibold">
                {details.amount} {details.tokenSymbol}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">交易哈希</span>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono truncate">
                {truncateHash(hash)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(hash)}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <a
                href={getExplorerUrl(hash)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0")}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
