import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiAddCategory, apiListCategories } from '../api'

type CategoriesState = {
  items: string[]
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const rows = await apiListCategories()
      return rows.map((row) => row.name)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Load failed')
    }
  },
)

export const addCategory = createAsyncThunk(
  'categories/add',
  async (name: string, { rejectWithValue }) => {
    try {
      const row = await apiAddCategory(name)
      return row.name
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Could not add category')
    }
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [] } as CategoriesState,
  reducers: {
    clearCategories(state) {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        const name = action.payload
        const exists = state.items.some((item) => item.toLowerCase() === name.toLowerCase())
        if (!exists) state.items.push(name)
      })
  },
})

export const { clearCategories } = categoriesSlice.actions
export default categoriesSlice.reducer
