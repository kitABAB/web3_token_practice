'use client'

import { useReadContract, useAccount, useChainId } from 'wagmi'
import { formatUnits } from 'viem'
import { getContractConfig, CONTRACT_ADDRESSES, TOKEN_INFO } from '@/config/contracts'

export function useTokenBalance() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { address: contractAddress, abi: tokenAbi } = getContractConfig(chainId, 'token')


  const { data: balance, refetch, isLoading } = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const formattedBalance = balance
    ? formatUnits(balance as bigint, TOKEN_INFO.decimals)
    : '0'

  return {
    balance,
    formattedBalance,
    refetch,
    isLoading,
    symbol: TOKEN_INFO.symbol,
  }
}
