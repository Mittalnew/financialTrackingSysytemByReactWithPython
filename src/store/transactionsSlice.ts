import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  apiCreateTransaction,
  apiDeleteTransaction,
  apiListTransactions,
  apiUpdateTransaction,
} from '../api'
import type { Filters, Transaction } from '../types'
import { currentMonth } from '../utils/format'

/**
 * Transactions live on the backend now (not localStorage).
 * Pages still read `items` from Redux — same as before.
 */

type TxState = {
  items: Transaction[]
  filters: Filters
  status: 'idle' | 'loading' | 'failed'
  ready: boolean
  error: string | null
}

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await apiListTransactions()
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Load failed')
    }
  },
)

export const addTransaction = createAsyncThunk(
  'transactions/add',
  async (body: Omit<Transaction, 'id'>, { rejectWithValue }) => {
    try {
      return await apiCreateTransaction(body)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Add failed')
    }
  },
)

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async (body: Transaction, { rejectWithValue }) => {
    try {
      const { id, ...rest } = body
      return await apiUpdateTransaction(id, rest)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Update failed')
    }
  },
)

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiDeleteTransaction(id)
      return id
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Delete failed')
    }
  },
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    filters: {
      search: '',
      month: currentMonth(),
      category: 'all',
      type: 'all' as Filters['type'],
    },
    status: 'idle',
    ready: false,
    error: null,
  } as TxState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearTransactions(state) {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'idle'
        state.ready = true
        state.items = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.ready = true
        state.error = (action.payload as string) || 'Load failed'
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const i = state.items.findIndex((tx) => tx.id === action.payload.id)
        if (i >= 0) state.items[i] = action.payload
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((tx) => tx.id !== action.payload)
      })
  },
})

export const { setFilters, clearTransactions } = transactionsSlice.actions
export default transactionsSlice.reducer
