/**
 * Simple text insights for the Dashboard.
 * Interview tip: income − spend = leftover (saved this month).
 */
import type { Transaction } from '../types'
import { formatINR, totals } from './format'
import { expenseByCategory } from './stats'

/** One month's salary / spend / leftover numbers. */
export function monthCashflow(items: Transaction[], month: string) {
  const list = items.filter((tx) => tx.date.startsWith(month))
  const { income, expense, balance } = totals(list)
  return {
    income,
    spent: expense,
    left: balance,
  }
}

/** "2026-11" → "2026-10" */
export function previousMonth(month: string) {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year, mon - 1, 1)
  date.setMonth(date.getMonth() - 1)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${m}`
}

/**
 * One short tip for the user.
 * Keep this dumb and readable — no AI, just if/else on numbers.
 */
export function monthTip(items: Transaction[], month: string) {
  const now = monthCashflow(items, month)
  const categories = expenseByCategory(
    items.filter((tx) => tx.date.startsWith(month)),
  ).sort((a, b) => b.value - a.value)

  if (now.income === 0 && now.spent === 0) {
    return 'Add this month’s salary and spends to see what you have left.'
  }

  if (now.income === 0) {
    return 'No income logged this month — add your salary to see leftover clearly.'
  }

  const prev = monthCashflow(items, previousMonth(month))
  if (prev.spent > 0) {
    const diff = now.spent - prev.spent
    if (diff > 0) {
      return `You spent ${formatINR(diff)} more than last month.`
    }
    if (diff < 0) {
      return `Nice — you spent ${formatINR(Math.abs(diff))} less than last month.`
    }
  }

  if (categories[0]) {
    return `Top spend is ${categories[0].name} (${formatINR(categories[0].value)}).`
  }

  if (now.left >= 0) {
    return `Leftover this month: ${formatINR(now.left)}.`
  }

  return `You’re over by ${formatINR(Math.abs(now.left))} this month.`
}
