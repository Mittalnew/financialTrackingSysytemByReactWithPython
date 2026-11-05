import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiDeleteBudget, apiListBudgets, apiUpsertBudget } from '../api'
import type { Budget } from '../types'

/**
 * Budgets also come from the API now.
 */

type BudgetsState = {
  items: Budget[]
  status: 'idle' | 'loading' | 'failed'
  ready: boolean
  error: string | null
}

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await apiListBudgets()
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Load failed')
    }
  },
)

export const setBudget = createAsyncThunk(
  'budgets/set',
  async (body: Budget, { rejectWithValue }) => {
    try {
      return await apiUpsertBudget(body)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Save failed')
    }
  },
)

export const removeBudget = createAsyncThunk(
  'budgets/remove',
  async (category: string, { rejectWithValue }) => {
    try {
      await apiDeleteBudget(category)
      return category
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Remove failed')
    }
  },
)

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState: {
    items: [],
    status: 'idle',
    ready: false,
    error: null,
  } as BudgetsState,
  reducers: {
    clearBudgets(state) {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = 'idle'
        state.ready = true
        state.items = action.payload
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = 'failed'
        state.ready = true
        state.error = (action.payload as string) || 'Load failed'
      })
      .addCase(setBudget.fulfilled, (state, action) => {
        const next = action.payload
        const i = state.items.findIndex((b) => b.category === next.category)
        if (i >= 0) state.items[i] = next
        else state.items.push(next)
      })
      .addCase(removeBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.category !== action.payload)
      })
  },
})

export const { clearBudgets } = budgetsSlice.actions
export default budgetsSlice.reducer
