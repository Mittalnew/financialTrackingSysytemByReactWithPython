/** Shared types used across pages, store, and utils. */

export type Transaction = {
  id: string
  date: string
  title: string
  category: string
  type: 'income' | 'expense'
  amount: number
  notes?: string
}

export type Filters = {
  search: string
  month: string
  category: string
  type: 'all' | 'income' | 'expense'
}

export type User = {
  id: string
  name: string
  email: string
  currency: string
}

/** Monthly spend limit for one expense category. */
export type Budget = {
  category: string
  limit: number
}
