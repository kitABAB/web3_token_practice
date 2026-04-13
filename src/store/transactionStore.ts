import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TransactionType = 'claim' | 'send_token' | 'send_eth'
export type TransactionStatus = 'pending' | 'success' | 'failed'

export interface Transaction {
  id: string
  type: TransactionType
  hash: string
  from: string
  to?: string
  amount: string
  tokenSymbol?: string
  timestamp: number
  status: TransactionStatus
  chainId: number
}

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, 'id'>) => string
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  getTransactionsByAddress: (address: string) => Transaction[]
  clearHistory: () => void
}

const MAX_TRANSACTIONS = 10

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) => {
        const id = `${tx.hash}-${Date.now()}`
        const newTx: Transaction = { ...tx, id }

        set((state) => {
          const updatedTransactions = [newTx, ...state.transactions]
          // Keep only the latest MAX_TRANSACTIONS per address
          const addressTxs = updatedTransactions.filter(
            (t) => t.from.toLowerCase() === tx.from.toLowerCase()
          )
          const otherTxs = updatedTransactions.filter(
            (t) => t.from.toLowerCase() !== tx.from.toLowerCase()
          )

          const limitedAddressTxs = addressTxs.slice(0, MAX_TRANSACTIONS)

          return {
            transactions: [...limitedAddressTxs, ...otherTxs].sort(
              (a, b) => b.timestamp - a.timestamp
            ),
          }
        })

        return id
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        }))
      },

      getTransactionsByAddress: (address) => {
        return get()
          .transactions.filter(
            (tx) => tx.from.toLowerCase() === address.toLowerCase()
          )
          .slice(0, MAX_TRANSACTIONS)
      },

      clearHistory: () => {
        set({ transactions: [] })
      },
    }),
    {
      name: 'faucet-transactions',
    }
  )
)
