'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Droplets, Loader2, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useClaimCooldown } from '@/hooks/useClaimCooldown'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useTransactionStore } from '@/store/transactionStore'
import { TransactionDialog } from './TransactionDialog'
import { getContractConfig, CONTRACT_ADDRESSES, TOKEN_INFO, CLAIM_COOLDOWN } from '@/config/contracts'

export function FaucetClaim() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { canClaim, remainingTime, formattedTime, refetch: refetchCooldown } = useClaimCooldown()
  const { refetch: refetchBalance, symbol } = useTokenBalance()
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransaction = useTransactionStore((state) => state.updateTransaction)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [txId, setTxId] = useState<string>('')

  const { address: contractAddress, abi: faucetTokenAbi } = getContractConfig(chainId, 'faucet')

  const { writeContract, isPending: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  })

  const hasHandledConfirmation = useRef(false)

  useEffect(() => {
    if (isConfirmed && txId && !hasHandledConfirmation.current) {
      hasHandledConfirmation.current = true
      updateTransaction(txId, { status: 'success' })
      refetchBalance()
      refetchCooldown()
      setDialogOpen(true)
    }
  }, [isConfirmed, txId, updateTransaction, refetchBalance, refetchCooldown])

  const handleClaim = async () => {
    if (!address || !canClaim) return

    hasHandledConfirmation.current = false

    try {
      writeContract(
        {
          address: contractAddress,
          abi: faucetTokenAbi,
          functionName: 'requestTokens',
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash)

            const id = addTransaction({
              type: 'claim',
              hash,
              from: address,
              amount: TOKEN_INFO.claimAmount,
              tokenSymbol: symbol,
              timestamp: Date.now(),
              status: 'pending',
              chainId,
            })
            setTxId(id)
          },
          onError: (error) => {
            console.error('Claim failed:', error)
          },
        }
      )
    } catch (error) {
      console.error('Claim error:', error)
    }
  }

  const progressValue = ((CLAIM_COOLDOWN - remainingTime) / CLAIM_COOLDOWN) * 100

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            领取 Token
          </CardTitle>
          <CardDescription>
            每 5 分钟可以领取 {TOKEN_INFO.claimAmount} {TOKEN_INFO.symbol}
          </CardDescription>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            领取 Token
          </CardTitle>
          <CardDescription>
            每 5 分钟可以领取 {TOKEN_INFO.claimAmount} {TOKEN_INFO.symbol}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canClaim && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  冷却时间
                </span>
                <span className="font-mono font-semibold">{formattedTime}</span>
              </div>
              <Progress value={progressValue} />
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleClaim}
            disabled={!canClaim || isWritePending || isConfirming}
          >
            {isWritePending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isWritePending ? '确认交易...' : '等待确认...'}
              </>
            ) : canClaim ? (
              <>
                <Droplets className="w-4 h-4 mr-2" />
                领取 {TOKEN_INFO.claimAmount} {TOKEN_INFO.symbol}
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                冷却中...
              </>
            )}
          </Button>

          {chainId === 1 && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
              注意：当前连接的是主网，水龙头功能仅在 Sepolia 测试网可用
            </p>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="领取成功"
        description={`${address?.slice(0, 6)}...${address?.slice(-4)} 成功领取了 ${TOKEN_INFO.claimAmount} ${symbol}`}
        hash={txHash}
        chainId={chainId}
        details={{
          address,
          amount: TOKEN_INFO.claimAmount,
          tokenSymbol: symbol,
        }}
      />
    </>
  )
}
