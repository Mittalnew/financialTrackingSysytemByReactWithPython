/**
 * Budget math — keep pages dumb.
 * spent vs limit for the selected month.
 */
import type { Budget, Transaction } from '../types'

/** How much was spent in one category this month. */
export function spentInCategory(items: Transaction[], month: string, category: string) {
  let total = 0
  for (const tx of items) {
    if (tx.type !== 'expense') continue
    if (tx.category !== category) continue
    if (!tx.date.startsWith(month)) continue
    total += tx.amount
  }
  return total
}

export type BudgetRow = Budget & {
  spent: number
  left: number
  percent: number
  over: boolean
}

/** Join each budget with this month’s spend. */
export function budgetProgress(
  budgets: Budget[],
  items: Transaction[],
  month: string,
): BudgetRow[] {
  return budgets.map((budget) => {
    const spent = spentInCategory(items, month, budget.category)
    const percent = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0
    return {
      ...budget,
      spent,
      left: budget.limit - spent,
      percent,
      over: spent > budget.limit,
    }
  })
}
