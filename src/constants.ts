/** App-wide constants — change once, use everywhere. */

export const CATEGORIES = ['Food', 'Rent', 'Salary', 'Travel', 'Shopping'] as const

/** Expense categories that can have a monthly budget (not Salary). */
export const BUDGET_CATEGORIES = ['Food', 'Rent', 'Travel', 'Shopping'] as const

export const ANALYTICS_RANGES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
] as const
