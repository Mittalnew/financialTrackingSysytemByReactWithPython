/**
 * Tiny API helper — all backend calls go through here.
 *
 * Flow: page/slice → api.get/post/... → FastAPI → JSON back
 */

import type { Budget, Transaction, User } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

const TOKEN_KEY = 'fintrack-token'
const USER_KEY = 'fintrack-auth'

// ---------- token + user in localStorage (only session stuff) ----------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
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
  setToken(null)
  saveUserLocal(null)
}

// ---------- one fetch wrapper ----------

type ApiErrorBody = { detail?: string | { msg: string }[] }

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (withAuth) {
    const token = getToken()
    // No token → FastAPI returns 403 "Not authenticated"
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

  // DELETE may return small JSON; still parse
  return (await res.json()) as T
}

// ---------- Auth ----------

export type AuthResponse = { token: string; user: User }

export function apiSignup(body: { name: string; email: string; password: string }) {
  return request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }, false)
}

export function apiLogin(body: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false)
}

export function apiUpdateProfile(body: Partial<User>) {
  return request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) })
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

// ---------- Budgets ----------

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
