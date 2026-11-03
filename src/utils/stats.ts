/**
 * Number crunching for Dashboard + Analytics.
 * Pages call these helpers — they do not calculate totals themselves.
 */
import type { Transaction } from '../types'
import { shortMonth, totals } from './format'

/** Income + expense totals for each of the last N months that have data. */
export function monthlyTotals(items: Transaction[], count = 6) {
  const byKey: Record<string, { income: number; expense: number }> = {}

  for (const tx of items) {
    const key = tx.date.slice(0, 7) // "YYYY-MM"
    if (!byKey[key]) byKey[key] = { income: 0, expense: 0 }
    byKey[key][tx.type] += tx.amount
  }

  const months = Object.keys(byKey).sort().slice(-count)

  return months.map((key) => ({
    month: shortMonth(key),
    income: byKey[key].income,
    expense: byKey[key].expense,
  }))
}

/** Total expense amount grouped by category. */
export function expenseByCategory(items: Transaction[]) {
  const byName: Record<string, number> = {}

  for (const tx of items) {
    if (tx.type !== 'expense') continue
    byName[tx.category] = (byName[tx.category] || 0) + tx.amount
  }

  return Object.keys(byName).map((name) => ({
    name,
    value: byName[name],
  }))
}

/** Keep only transactions from the last N months (from today, local time). */
export function inLastMonths(items: Transaction[], months: number) {
  const start = new Date()
  start.setMonth(start.getMonth() - months)

  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')
  const cutoff = `${year}-${month}-${day}`

  return items.filter((tx) => tx.date >= cutoff)
}

/** Expense total per calendar day (full date, so months do not mix). */
export function spendByDay(items: Transaction[]) {
  const byDay: Record<string, number> = {}

  for (const tx of items) {
    if (tx.type !== 'expense') continue
    byDay[tx.date] = (byDay[tx.date] || 0) + tx.amount
  }

  return Object.keys(byDay)
    .sort()
    .map((day) => ({
      name: day.slice(8), // axis label: "04"
      amount: byDay[day],
    }))
}

/** Weekday name with the highest total expense. */
export function busiestWeekday(items: Transaction[]) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const sums = [0, 0, 0, 0, 0, 0, 0]

  for (const tx of items) {
    if (tx.type !== 'expense') continue
    const [year, month, day] = tx.date.split('-').map(Number)
    const dayIndex = new Date(year, month - 1, day).getDay()
    sums[dayIndex] += tx.amount
  }

  let bestIndex = 0
  for (let i = 1; i < sums.length; i++) {
    if (sums[i] > sums[bestIndex]) bestIndex = i
  }

  if (sums[bestIndex] === 0) return '—'
  return names[bestIndex]
}

/** One object with the numbers Dashboard / Analytics KPI cards need. */
export function summary(items: Transaction[]) {
  const { income, expense, balance } = totals(items)
  const categories = expenseByCategory(items).sort((a, b) => b.value - a.value)

  const uniqueDates = new Set(items.map((tx) => tx.date))
  const dayCount = uniqueDates.size || 1

  return {
    income,
    expense,
    balance,
    avgDailySpend: expense / dayCount,
    topCategory: categories[0]?.name ?? '—',
    busiestWeekday: busiestWeekday(items),
    savingsRate: income ? Math.round((balance / income) * 100) : 0,
  }
}
