'use client'

import { useState } from 'react'
import { useAccount, useChainId, useWriteContract, useSendTransaction, useBalance } from 'wagmi'
import { parseEther, parseUnits, isAddress } from 'viem'
import { Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useTransactionStore } from '@/store/transactionStore'
import { TransactionDialog } from './TransactionDialog'
import { getContractConfig, CONTRACT_ADDRESSES, TOKEN_INFO } from '@/config/contracts'

type SendType = 'token' | 'eth'

export function SendTransaction() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { refetch: refetchBalance, symbol, formattedBalance } = useTokenBalance()
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({ address })
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransaction = useTransactionStore((state) => state.updateTransaction)

  const [sendType, setSendType] = useState<SendType>('token')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [txDetails, setTxDetails] = useState<{
    address: string
    amount: string
    tokenSymbol: string
  } | null>(null)

  const { address: tokenAddress, abi: tokenAbi } = getContractConfig(chainId, 'token')

  const { writeContract, isPending: isTokenPending } = useWriteContract()
  const { sendTransaction, isPending: isEthPending } = useSendTransaction()

  const isPending = isTokenPending || isEthPending

  const isValidInput = () => {
    if (!recipient || !amount) return false
    if (!isAddress(recipient)) return false
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return false
    return true
  }

  const handleSend = async () => {
    if (!address || !isValidInput()) return

    const amountNum = parseFloat(amount)

    if (sendType === 'token') {
      const parsedAmount = parseUnits(amount, TOKEN_INFO.decimals)

      writeContract(
        {
          address: tokenAddress,
          abi: tokenAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, parsedAmount],
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash)
            setTxDetails({
              address: recipient,
              amount: amount,
              tokenSymbol: symbol,
            })

            const id = addTransaction({
              type: 'send_token',
              hash,
              from: address,
              to: recipient,
              amount: amount,
              tokenSymbol: symbol,
              timestamp: Date.now(),
              status: 'pending',
              chainId,
            })

            setTimeout(() => {
              updateTransaction(id, { status: 'success' })
              refetchBalance()
              setDialogOpen(true)
            }, 5000)

            setRecipient('')
            setAmount('')
          },
          onError: (error) => {
            console.error('Token transfer failed:', error)
          },
        }
      )
    } else {
      const parsedAmount = parseEther(amount)

      sendTransaction(
        {
          to: recipient as `0x${string}`,
          value: parsedAmount,
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash)
            setTxDetails({
              address: recipient,
              amount: amount,
              tokenSymbol: 'ETH',
            })

            const id = addTransaction({
              type: 'send_eth',
              hash,
              from: address,
              to: recipient,
              amount: amount,
              tokenSymbol: 'ETH',
              timestamp: Date.now(),
              status: 'pending',
              chainId,
            })

            setTimeout(() => {
              updateTransaction(id, { status: 'success' })
              refetchEthBalance()
              setDialogOpen(true)
            }, 5000)

            setRecipient('')
            setAmount('')
          },
          onError: (error) => {
            console.error('ETH transfer failed:', error)
          },
        }
      )
    }
  }

  const getMaxAmount = () => {
    if (sendType === 'token') {
      return formattedBalance
    }
    if (ethBalance) {
      const { value, decimals } = ethBalance
      return (Number(value) / 10 ** decimals).toString()
    }
    return '0'
  }

  const handleMaxClick = () => {
    setAmount(getMaxAmount())
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            发送
          </CardTitle>
          <CardDescription>发送 Token 或 ETH 到其他地址</CardDescription>
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
            <Send className="w-5 h-5" />
            发送
          </CardTitle>
          <CardDescription>发送 Token 或 ETH 到其他地址</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">发送类型</label>
            <Select
              value={sendType}
              onValueChange={(value) => value && setSendType(value as SendType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择发送类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="token">{symbol} Token</SelectItem>
                <SelectItem value="eth">
                  {chainId === 11155111 ? 'Sepolia ' : ''}ETH
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">接收地址</label>
            <Input
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={
                recipient && !isAddress(recipient)
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : ''
              }
            />
            {recipient && !isAddress(recipient) && (
              <p className="text-sm text-red-500">请输入有效的以太坊地址</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">数量</label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs text-primary hover:underline"
              >
                最大: {parseFloat(getMaxAmount()).toFixed(4)}{' '}
                {sendType === 'token' ? symbol : 'ETH'}
              </button>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={!isValidInput() || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                发送中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                发送 {sendType === 'token' ? symbol : 'ETH'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="发送成功"
        description={`成功发送 ${txDetails?.amount} ${txDetails?.tokenSymbol} 到 ${txDetails?.address?.slice(0, 6)}...${txDetails?.address?.slice(-4)}`}
        hash={txHash}
        chainId={chainId}
        details={txDetails || undefined}
      />
    </>
  )
}
