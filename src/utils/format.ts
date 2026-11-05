/** Money, dates, and small display helpers used across the app. */

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Short form for KPI cards, e.g. ₹12.5K or ₹1.2L */
export function formatCompactINR(amount: number) {
  if (amount >= 100000) {
    const lakhs = amount / 100000
    return `₹${lakhs.toFixed(1).replace(/\.0$/, '')}L`
  }
  if (amount >= 1000) {
    const thousands = amount / 1000
    return `₹${thousands.toFixed(1).replace(/\.0$/, '')}K`
  }
  return formatINR(amount)
}

/** Recharts tooltip helper — always gets a raw number. */
export function formatChartValue(value: unknown) {
  return formatINR(Number(value || 0))
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-09-11" → "11 Sep 2026". This is the spend date, which has no clock time. */
export function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split('-')
  const monthName = MONTHS[Number(month) - 1]
  if (!year || !monthName || !day) return iso
  return `${Number(day)} ${monthName} ${year}`
}

/** ISO timestamp → "11 Sep 2026, 11:04 pm IST". */
export function formatStamp(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  const monthName = MONTHS[Number(get('month')) - 1] ?? get('month')
  return `${Number(get('day'))} ${monthName} ${get('year')}, ${get('hour')}:${get('minute')} ${get('dayPeriod').toLowerCase()} IST`
}

/** "2026-10" → "October 2026" */
export function monthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

/** "2026-10" → "Oct" (for chart axis) */
export function shortMonth(yearMonth: string) {
  const monthNum = Number(yearMonth.split('-')[1])
  return new Date(2000, monthNum - 1, 1).toLocaleString('en', { month: 'short' })
}

/** Local "YYYY-MM-DD" — avoids UTC shift from toISOString(). */
export function todayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Today's month as "YYYY-MM" */
export function currentMonth() {
  return todayISO().slice(0, 7)
}

export function totals(list: { type: string; amount: number }[]) {
  let income = 0
  let expense = 0

  for (const item of list) {
    if (item.type === 'income') income += item.amount
    else expense += item.amount
  }

  return { income, expense, balance: income - expense }
}

/** "Ashman Kumar" → "AK" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}
