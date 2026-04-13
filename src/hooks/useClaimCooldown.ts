'use client'

import { useState, useEffect, useCallback } from 'react'
import { useReadContract, useAccount, useChainId } from 'wagmi'
import { getContractConfig, CONTRACT_ADDRESSES, CLAIM_COOLDOWN } from '@/config/contracts'

export function useClaimCooldown() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [canClaim, setCanClaim] = useState<boolean>(false)

  const { address: contractAddress, abi: faucetTokenAbi } = getContractConfig(chainId, 'faucet')

  const { data: lastClaimTime, refetch: refetchLastClaimTime } = useReadContract({
    address: contractAddress,
    abi: faucetTokenAbi,
    functionName: 'lastClaimTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: cooldownFromContract } = useReadContract({
    address: contractAddress,
    abi: faucetTokenAbi,
    functionName: 'claimCooldown',
    query: {
      enabled: !!address,
    },
  })

  const cooldown = cooldownFromContract
    ? Number(cooldownFromContract)
    : CLAIM_COOLDOWN

  const calculateRemainingTime = useCallback(() => {
    if (!lastClaimTime) {
      setRemainingTime(0)
      setCanClaim(true)
      return
    }

    const lastClaim = Number(lastClaimTime)
    const now = Math.floor(Date.now() / 1000)
    const nextClaimTime = lastClaim + cooldown
    const remaining = nextClaimTime - now

    if (remaining <= 0) {
      setRemainingTime(0)
      setCanClaim(true)
    } else {
      setRemainingTime(remaining)
      setCanClaim(false)
    }
  }, [lastClaimTime, cooldown])

  useEffect(() => {
    calculateRemainingTime()

    const interval = setInterval(() => {
      calculateRemainingTime()
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateRemainingTime])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    remainingTime,
    canClaim,
    formattedTime: formatTime(remainingTime),
    refetch: refetchLastClaimTime,
  }
}
