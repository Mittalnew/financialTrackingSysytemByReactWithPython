import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  apiLogin,
  apiSignup,
  apiUpdateProfile,
  clearSession,
  getToken,
  loadSavedUser,
  saveUserLocal,
  setToken,
} from '../api'
import type { User } from '../types'

/** User + token must both exist. Old demo login left user without JWT. */
function loadValidUser(): User | null {
  const user = loadSavedUser()
  const token = getToken()
  if (user && token) return user
  clearSession()
  return null
}

/**
 * Auth now talks to FastAPI.
 * Token + user stay in localStorage so refresh pe login na tootey.
 */

type AuthState = {
  user: User | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (body: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiLogin(body)
      setToken(data.token)
      saveUserLocal(data.user)
      return data.user
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed')
    }
  },
)

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (body: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiSignup(body)
      setToken(data.token)
      saveUserLocal(data.user)
      return data.user
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Signup failed')
    }
  },
)

export const saveProfile = createAsyncThunk(
  'auth/saveProfile',
  async (body: Partial<User>, { rejectWithValue }) => {
    try {
      const user = await apiUpdateProfile(body)
      saveUserLocal(user)
      return user
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Save failed')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadValidUser(),
    status: 'idle',
    error: null,
  } as AuthState,
  reducers: {
    logout(state) {
      state.user = null
      state.error = null
      clearSession()
    },
    clearAuthError(state) {
      state.error = null
    },
    /** Rare: manually set user (tests). Normal path = thunks. */
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
      saveUserLocal(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Login failed'
      })
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Signup failed'
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearAuthError, setUser } = authSlice.actions
export default authSlice.reducer
