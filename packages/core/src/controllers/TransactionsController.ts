import type { Transaction } from '@web3modal/common'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'
import { EventsController } from './EventsController.js'
import { SnackController } from './SnackController.js'
import type { CoinbaseTransaction } from '../utils/TypeUtil.js'
import { CoinbaseApiController } from './CoinbaseApiController.js'

// -- Types --------------------------------------------- //
export type GroupedTransaction =
  | {
      type: 'zerion'
      value: Transaction
    }
  | {
      type: 'coinbase'
      value: CoinbaseTransaction
    }

type TransactionByYearMap = Record<number, GroupedTransaction[]>

export interface TransactionsControllerState {
  transactions: Transaction[]
  coinbaseTransactions: CoinbaseTransaction[]
  transactionsByYear: TransactionByYearMap
  loading: boolean
  empty: boolean
  next: string | undefined
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  coinbaseTransactions: [],
  transactionsByYear: {},
  loading: false,
  empty: false,
  next: undefined
})

// -- Controller ---------------------------------------- //
export const TransactionsController = {
  state,

  subscribe(callback: (newState: TransactionsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  async fetchTransactions(accountAddress?: string) {
    const { projectId } = OptionsController.state

    if (!projectId || !accountAddress) {
      throw new Error("Transactions can't be fetched without a projectId and an accountAddress")
    }

    state.loading = true

    try {
      const response = await BlockchainApiController.fetchTransactions({
        account: accountAddress,
        projectId,
        cursor: state.next
      })

      const coinbaseResponse = await CoinbaseApiController.fetchTransactions({
        accountAddress,
        pageKey: '',
        pageSize: 25
      })

      const nonSpamTransactions = this.filterSpamTransactions(response.data)
      const filteredTransactions = [...state.transactions, ...nonSpamTransactions]

      state.loading = false
      state.transactions = filteredTransactions
      state.transactionsByYear = this.groupTransactionsByYear(
        state.transactionsByYear,
        nonSpamTransactions
      )
      state.transactionsByYear = this.groupCoinbaseTransactionsByYear(
        state.transactionsByYear,
        coinbaseResponse.transactions
      )
      state.empty = filteredTransactions.length === 0
      state.next = response.next ? response.next : undefined
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'ERROR_FETCH_TRANSACTIONS',
        properties: {
          address: accountAddress,
          projectId,
          cursor: state.next
        }
      })
      SnackController.showError('Failed to fetch transactions')
      state.loading = false
      state.empty = true
    }
  },

  groupTransactionsByYear(
    transactionsMap: TransactionByYearMap = {},
    transactions: Transaction[] = []
  ) {
    const grouped: TransactionByYearMap = transactionsMap

    transactions.forEach(transaction => {
      const year = new Date(transaction.metadata.minedAt).getFullYear()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year]?.push({
        type: 'zerion',
        value: transaction
      })
    })

    return grouped
  },

  groupCoinbaseTransactionsByYear(
    transactionsMap: TransactionByYearMap = {},
    transactions: CoinbaseTransaction[] = []
  ) {
    const grouped: TransactionByYearMap = transactionsMap

    transactions.forEach(transaction => {
      const year = new Date(transaction.created_at).getFullYear()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year]?.push({
        type: 'coinbase',
        value: transaction
      })
    })

    return grouped
  },

  filterSpamTransactions(transactions: Transaction[]) {
    return transactions.filter(transaction => {
      const isAllSpam = transaction.transfers.every(
        transfer => transfer.nft_info?.flags.is_spam === true
      )

      return !isAllSpam
    })
  },

  resetTransactions() {
    state.transactions = []
    state.transactionsByYear = {}
    state.loading = false
    state.empty = false
    state.next = undefined
  }
}
