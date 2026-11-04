import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  apiLogin,
  apiLogout,
  apiSignup,
  apiUpdateProfile,
  clearSession,
  getRefreshToken,
  getToken,
  loadSavedUser,
  saveUserLocal,
  setTokens,
} from '../api'
import type { User } from '../types'

/** Need user + access token. Refresh alone is not enough to show app. */
function loadValidUser(): User | null {
  const user = loadSavedUser()
  const token = getToken()
  if (user && token) return user
  clearSession()
  return null
}

type AuthState = {
  user: User | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
  /** After signup — show "check your email" instead of auto-login */
  signupMessage: string | null
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (body: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiLogin(body)
      setTokens(data.access_token, data.refresh_token)
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
      // No tokens — user must verify email first
      const data = await apiSignup(body)
      return data.message
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

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    if (getRefreshToken()) await apiLogout()
  } catch {
    // still clear local session
  }
  clearSession()
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadValidUser(),
    status: 'idle',
    error: null,
    signupMessage: null,
  } as AuthState,
  reducers: {
    logout(state) {
      state.user = null
      state.error = null
      state.signupMessage = null
      clearSession()
    },
    clearAuthError(state) {
      state.error = null
    },
    clearSignupMessage(state) {
      state.signupMessage = null
    },
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
        state.signupMessage = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.signupMessage = action.payload
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Signup failed'
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.error = null
        state.signupMessage = null
      })
  },
})

export const { logout, clearAuthError, clearSignupMessage, setUser } = authSlice.actions
export default authSlice.reducer
