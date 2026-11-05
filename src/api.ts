/**
 * Tiny API helper — all backend calls go through here.
 *
 * Tokens:
 *   access  → short JWT in Authorization header
 *   refresh → longer key; used once when access expires (401)
 */

import type { Budget, Transaction, User } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002'

const ACCESS_KEY = 'fintrack-token'
const REFRESH_KEY = 'fintrack-refresh'
const USER_KEY = 'fintrack-auth'

// ---------- session in localStorage ----------

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string | null, refresh: string | null) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  else localStorage.removeItem(ACCESS_KEY)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  else localStorage.removeItem(REFRESH_KEY)
}

/** @deprecated use setTokens — kept name used in older calls */
export function setToken(token: string | null) {
  if (token) localStorage.setItem(ACCESS_KEY, token)
  else localStorage.removeItem(ACCESS_KEY)
}

export function loadSavedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function saveUserLocal(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function clearSession() {
  setTokens(null, null)
  saveUserLocal(null)
}

// ---------- one fetch wrapper (+ one refresh retry on 401) ----------

type ApiErrorBody = { detail?: string | { msg: string }[] }

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { access_token: string; refresh_token: string }
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
  didRetry = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (withAuth) {
    const token = getToken()
    if (!token) {
      throw new Error('Session expired. Please sign in again.')
    }
    headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error(`Backend not reachable at ${API_URL}. Is uvicorn running?`)
  }

  // Access died → refresh once, then retry the same call
  if (res.status === 401 && withAuth && !didRetry) {
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null
      })
    }
    const ok = await refreshPromise
    if (ok) return request<T>(path, options, withAuth, true)
    clearSession()
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as ApiErrorBody
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail) && body.detail[0]?.msg) message = body.detail[0].msg
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  return (await res.json()) as T
}

// ---------- Auth ----------

export type AuthResponse = {
  access_token: string
  refresh_token: string
  user: User
}

export function apiSignup(body: { name: string; email: string; password: string }) {
  return request<{ message: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }, false)
}

export function apiLogin(body: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false)
}

export function apiLogout() {
  const refresh = getRefreshToken()
  if (!refresh) return Promise.resolve({ message: 'Logged out' })
  return request<{ message: string }>(
    '/auth/logout',
    { method: 'POST', body: JSON.stringify({ refresh_token: refresh }) },
    false,
  )
}

export function apiVerifyEmail(token: string) {
  return request<{ message: string }>(
    '/auth/verify-email',
    { method: 'POST', body: JSON.stringify({ token }) },
    false,
  )
}

export function apiResendVerification(email: string) {
  return request<{ message: string }>(
    '/auth/resend-verification',
    { method: 'POST', body: JSON.stringify({ email }) },
    false,
  )
}

export function apiForgotPassword(body: { email: string }) {
  return request<{ message: string }>(
    '/auth/forgot-password',
    { method: 'POST', body: JSON.stringify(body) },
    false,
  )
}

export function apiResetPassword(body: { token: string; new_password: string }) {
  return request<{ message: string }>(
    '/auth/reset-password',
    { method: 'POST', body: JSON.stringify(body) },
    false,
  )
}

export function apiUpdateProfile(body: Partial<User>) {
  return request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) })
}

export function apiChangePassword(body: { current_password: string; new_password: string }) {
  return request<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ---------- Transactions ----------

export function apiListTransactions() {
  return request<Transaction[]>('/transactions')
}

export function apiCreateTransaction(body: Omit<Transaction, 'id'>) {
  return request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(body) })
}

export function apiUpdateTransaction(id: string, body: Omit<Transaction, 'id'>) {
  return request<Transaction>(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function apiDeleteTransaction(id: string) {
  return request<{ ok: boolean }>(`/transactions/${id}`, { method: 'DELETE' })
}

export function apiImportStatement(rows: Omit<Transaction, 'id' | 'source'>[]) {
  return request<Transaction[]>('/transactions/import', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  })
}

// ---------- Budgets ----------

export function apiListCategories() {
  return request<{ name: string }[]>('/categories')
}

export function apiAddCategory(name: string) {
  return request<{ name: string }>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function apiListBudgets() {
  return request<Budget[]>('/budgets')
}

export function apiUpsertBudget(body: Budget) {
  return request<Budget>('/budgets', { method: 'PUT', body: JSON.stringify(body) })
}

export function apiDeleteBudget(category: string) {
  return request<{ ok: boolean }>(`/budgets/${encodeURIComponent(category)}`, {
    method: 'DELETE',
  })
}
