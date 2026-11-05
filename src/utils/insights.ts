/**
 * Simple text insights for the Dashboard.
 * Interview tip: income − spend = leftover (saved this month).
 */
import type { Budget, Transaction } from '../types'
import { formatINR, todayISO, totals } from './format'
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

/** Days still left in the month, counting today. "2026-11" + "2026-11-05" → 26 in a 30-day month. */
export function daysLeftInMonth(month: string, today: string) {
  const [year, mon] = month.split('-').map(Number)
  const daysInMonth = new Date(year, mon, 0).getDate()
  const day = today.startsWith(month) ? Number(today.slice(8, 10)) : 1
  return Math.max(1, daysInMonth - day + 1)
}

/**
 * What you can still spend today without eating the budgets.
 * Salary − budget limits, split across the days left, minus what you already spent today.
 * No budgets yet → leftover (salary − spent) split across the days left.
 */
export function safeToSpend(
  items: Transaction[],
  budgets: Budget[],
  month: string,
  today = todayISO(),
) {
  const cash = monthCashflow(items, month)
  const planned = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const daysLeft = daysLeftInMonth(month, today)
  const spentToday = items.reduce((sum, tx) => {
    if (tx.type !== 'expense' || tx.date !== today) return sum
    return sum + tx.amount
  }, 0)

  const hasBudgets = planned > 0
  const pool = hasBudgets ? cash.income - planned : cash.income - cash.spent
  const perDay = pool / daysLeft
  const todaySafe = hasBudgets ? perDay - spentToday : perDay

  return {
    income: cash.income,
    planned,
    spent: cash.spent,
    daysLeft,
    perDay,
    spentToday,
    todaySafe,
    hasBudgets,
  }
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

function prettyDay(iso: string) {
  const [, month, day] = iso.split('-')
  return `${Number(day)} ${SHORT_MONTHS[Number(month) - 1]}`
}

function spentInMonth(items: Transaction[], month: string, category: string) {
  let total = 0
  for (const tx of items) {
    if (tx.type !== 'expense') continue
    if (tx.category !== category) continue
    if (!tx.date.startsWith(month)) continue
    total += tx.amount
  }
  return total
}

export type SpendPreview = {
  tone: 'ok' | 'warn'
  lines: string[]
}

/**
 * What changes if this draft is saved.
 * Editing replaces the old row so the same expense is not counted twice.
 */
export function previewSpend(
  items: Transaction[],
  budgets: Budget[],
  draft: { id?: string; type: 'income' | 'expense'; amount: number; category: string; date: string },
  today = todayISO(),
): SpendPreview | null {
  if (!draft.amount || draft.amount < 1 || !draft.date) return null

  const next = items.filter((tx) => tx.id !== draft.id)
  next.push({
    id: draft.id ?? 'draft',
    title: '',
    type: draft.type,
    amount: draft.amount,
    category: draft.category,
    date: draft.date,
  })

  const lines: string[] = []
  let warn = false
  const month = draft.date.slice(0, 7)

  if (draft.type === 'expense') {
    const limit = budgets.find((b) => b.category === draft.category)?.limit ?? 0
    const before = spentInMonth(items, month, draft.category)
    const after = spentInMonth(next, month, draft.category)
    if (limit > 0) {
      const over = after - limit
      lines.push(
        over > 0
          ? `${draft.category} goes from ${formatINR(before)} / ${formatINR(limit)} to ${formatINR(after)} — ${formatINR(over)} over.`
          : `${draft.category} goes from ${formatINR(before)} / ${formatINR(limit)} to ${formatINR(after)}.`,
      )
      if (over > 0) warn = true
    } else {
      lines.push(`No budget set for ${draft.category}.`)
    }
  }

  const beforeSafe = safeToSpend(items, budgets, today.slice(0, 7), today).todaySafe
  const afterSafe = safeToSpend(next, budgets, today.slice(0, 7), today).todaySafe
  if (Math.round(beforeSafe) !== Math.round(afterSafe)) {
    lines.push(
      `Today’s safe limit goes from ${formatINR(beforeSafe)} to ${formatINR(afterSafe)}.`,
    )
    if (afterSafe < 0) warn = true
  }

  if (lines.length === 0) return null
  return { tone: warn ? 'warn' : 'ok', lines }
}

export type PaceWarning = {
  category: string
  text: string
  detail: string
  date: string
  dateLabel: string
}

/** Categories that are already over, or will run out before the month ends. */
export function paceWarnings(
  items: Transaction[],
  budgets: Budget[],
  month: string,
  today = todayISO(),
): PaceWarning[] {
  if (!today.startsWith(month)) return []
  const day = Number(today.slice(8, 10))
  if (!day) return []

  const warnings: PaceWarning[] = []
  for (const budget of budgets) {
    const spent = spentInMonth(items, month, budget.category)
    if (spent <= 0 || budget.limit <= 0) continue

    if (spent > budget.limit) {
      warnings.push({
        category: budget.category,
        text: `${budget.category} is ${formatINR(spent - budget.limit)} over its monthly budget.`,
        detail: `${formatINR(spent - budget.limit)} over the budget`,
        date: today,
        dateLabel: prettyDay(today),
      })
      continue
    }

    if (spent === budget.limit) {
      warnings.push({
        category: budget.category,
        text: `${budget.category} budget is already used up.`,
        detail: 'Budget is used up',
        date: today,
        dateLabel: prettyDay(today),
      })
      continue
    }

    const daily = spent / day
    const runOut = addDays(today, Math.ceil((budget.limit - spent) / daily))
    if (!runOut.startsWith(month)) continue
    warnings.push({
      category: budget.category,
      text: `${budget.category} runs out on ${prettyDay(runOut)} at this pace.`,
      detail: 'Runs out at this pace',
      date: runOut,
      dateLabel: prettyDay(runOut),
    })
  }
  return warnings
}
